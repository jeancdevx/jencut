import { type ChildProcess, fork } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { access, statfs, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Job, Project } from '../contracts/index.ts'
import { JencutError } from '../contracts/index.ts'
import { durationFrames } from '../domain/index.ts'

import { Store, atomicJSON } from './store.ts'

export class Jobs {
  active?: { job: Job; worker: ChildProcess }
  queue: { job: Job; project: Project }[] = []

  constructor(public store: Store) {}

  async preflight(p: Project) {
    this.store.validate(p)

    if (!durationFrames(p))
      throw new JencutError(
        'EMPTY_PROJECT',
        'Añade al menos un clip antes de exportar.'
      )

    for (const a of p.assets)
      try {
        await access(path.join(this.store.root, a.managedRelativePath))
      } catch {
        throw new JencutError(
          'MISSING_MEDIA',
          'Un original no está disponible. Recupéralo antes de exportar.'
        )
      }

    const disk = await statfs(this.store.root),
      required =
        Math.ceil((durationFrames(p) / 30) * 2000000) + 32 * 1024 * 1024

    if (disk.bavail * disk.bsize < required)
      throw new JencutError(
        'DISK_SPACE',
        'No hay espacio suficiente para exportar. Libera espacio y reintenta.'
      )

    return {
      media: true,
      montage: true,
      disk: true,
      freeBytes: disk.bavail * disk.bsize,
      requiredBytes: required,
      durationFrames: durationFrames(p)
    }
  }

  async create(
    project: Project,
    kind: Job['kind'],
    resolution: 720 | 1080,
    key: string
  ) {
    const prev = this.store.jobs().find(j => j.idempotencyKey === key)

    if (prev) {
      if (
        prev.projectId !== project.id ||
        prev.revision !== project.revision ||
        prev.kind !== kind ||
        prev.settings.resolution !== resolution
      )
        throw new JencutError(
          'IDEMPOTENCY_CONFLICT',
          'Esta clave pertenece a otro render.',
          409
        )

      return prev
    }

    await this.preflight(project)
    const job: Job = {
      id: randomUUID(),
      projectId: project.id,
      revision: project.revision,
      kind,
      status: 'pending',
      progress: 0,
      settings: { resolution },
      idempotencyKey: key
    }

    await atomicJSON(path.join(this.store.root, 'jobs', `${job.id}.json`), {
      job,
      project
    })
    this.store.setJob(job)
    this.queue.push({ job, project })
    this.pump()

    return job
  }

  pump() {
    if (this.active || !this.queue.length) return
    const { job } = this.queue.shift()!

    job.status = 'processing'
    this.store.setJob(job)
    const worker = fork(
      fileURLToPath(new URL('./worker/render.ts', import.meta.url)),
      [this.store.root, path.join(this.store.root, 'jobs', `${job.id}.json`)],
      {
        execArgv: ['--import', 'tsx'],
        stdio: ['ignore', 'pipe', 'pipe', 'ipc']
      }
    )

    this.active = { job, worker }
    let stderr = ''

    worker.stderr?.on('data', b => {
      stderr = (stderr + b.toString()).slice(-4000)
    })
    worker.on('message', (m: unknown) => {
      const msg = m as {
        type: string
        progress?: number
        error?: string
        output?: string
        inspection?: Job['inspection']
      }

      if (job.status === 'cancelled') return

      if (msg.type === 'progress') job.progress = msg.progress!
      else if (['verifying', 'completed', 'failed'].includes(msg.type)) {
        job.status = msg.type as Job['status']

        if (msg.error) job.error = msg.error

        if (msg.output) job.output = msg.output

        if (msg.inspection) job.inspection = msg.inspection

        if (msg.type === 'completed') job.progress = 100
      }

      this.store.setJob(job)
    })
    worker.on('exit', () => {
      if (['processing', 'verifying'].includes(job.status)) {
        job.status = 'failed'
        job.error = `El worker se interrumpió. Reintenta la exportación. ${stderr.slice(-400)}`
        this.store.setJob(job)
      }

      this.active = undefined
      void unlink(
        path.join(this.store.root, 'renders', `${job.id}.partial.mp4`)
      ).catch(() => {})
      this.pump()
    })
  }

  cancel(id: string) {
    const job = this.store.job(id)

    if (['completed', 'failed', 'cancelled'].includes(job.status))
      throw new JencutError('ALREADY_TERMINAL', 'El trabajo ya terminó.', 409)
    job.status = 'cancelled'
    this.store.setJob(job)
    this.queue = this.queue.filter(q => q.job.id !== id)

    if (this.active?.job.id === id) {
      this.active.job.status = 'cancelled'
      this.active.worker.kill('SIGTERM')
    }

    return job
  }

  close() {
    this.queue = []
    this.active?.worker.kill('SIGTERM')
  }
}
