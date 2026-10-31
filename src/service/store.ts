import { randomUUID } from 'node:crypto'
import { mkdir, open, readFile, readdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

import { Ajv2020, type ValidateFunction } from 'ajv/dist/2020.js'

import type { Job, Project, ProjectSummary } from '../contracts/index.ts'
import { JencutError } from '../contracts/index.ts'
import { durationFrames, validateProject } from '../domain/index.ts'

export async function atomicJSON(file: string, data: unknown) {
  await mkdir(path.dirname(file), { recursive: true })
  const tmp = `${file}.${randomUUID()}.tmp`,
    handle = await open(tmp, 'wx')

  try {
    await handle.writeFile(JSON.stringify(data, null, 2))
    await handle.sync()
  } finally {
    await handle.close()
  }

  await rename(tmp, file)

  if (process.platform !== 'win32') {
    const dir = await open(path.dirname(file), 'r')

    try {
      await dir.sync()
    } finally {
      await dir.close()
    }
  }
}

export class Store {
  db!: DatabaseSync
  schema!: ValidateFunction
  locks = new Map<string, Promise<unknown>>()

  constructor(public root: string) {}

  async init() {
    for (const dir of [
      'projects',
      'originals',
      'cache',
      'renders',
      'jobs',
      'tmp'
    ])
      await mkdir(path.join(this.root, dir), { recursive: true })
    this.db = new DatabaseSync(path.join(this.root, 'index.sqlite'))
    this.db.exec(
      'PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, key TEXT UNIQUE NOT NULL, data TEXT NOT NULL);'
    )
    const schema = JSON.parse(
      await readFile(
        new URL('../../specification/project.schema.json', import.meta.url),
        'utf8'
      )
    )

    this.schema = new Ajv2020({ strict: false, allErrors: true }).compile(
      schema
    )

    for (const f of await readdir(path.join(this.root, 'projects'))) {
      if (!f.endsWith('.json')) continue

      try {
        const p = JSON.parse(
          await readFile(path.join(this.root, 'projects', f), 'utf8')
        ) as Project

        this.validate(p)
        const prev = this.summary(p.id)

        this.index(p, prev?.trashedAt ?? null)
      } catch (e) {
        console.error('Manifest requires recovery:', f, e)
      }
    }

    for (const row of this.db.prepare('SELECT data FROM jobs').all()) {
      const job = JSON.parse(row.data as string) as Job

      if (['pending', 'processing', 'verifying'].includes(job.status)) {
        job.status = 'failed'
        job.error =
          'El servicio se reinició durante el trabajo. Vuelve a exportar.'
        this.setJob(job)
      }
    }
  }

  validate(p: Project) {
    if (!this.schema(p))
      throw new JencutError(
        'INVALID_MANIFEST',
        'El manifiesto no cumple el esquema de proyecto.'
      )
    validateProject(p)
  }

  file(id: string) {
    if (!/^[a-zA-Z0-9-]{1,160}$/.test(id))
      throw new JencutError('INVALID_ID', 'Identificador no válido.', 400)

    return path.join(this.root, 'projects', `${id}.json`)
  }

  async get(id: string) {
    try {
      const p = JSON.parse(await readFile(this.file(id), 'utf8')) as Project

      this.validate(p)

      return p
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT')
        throw new JencutError('NOT_FOUND', 'Proyecto no encontrado.', 404)

      throw e
    }
  }

  summary(id: string): ProjectSummary | undefined {
    const row = this.db.prepare('SELECT data FROM projects WHERE id=?').get(id)

    return row ? JSON.parse(row.data as string) : undefined
  }

  index(p: Project, trashedAt: string | null = null) {
    const prev = this.summary(p.id)
    const summary: ProjectSummary = {
      id: p.id,
      name: p.name,
      revision: p.revision,
      durationFrames: durationFrames(p),
      width: p.canvas.width,
      height: p.canvas.height,
      updatedAt: new Date().toISOString(),
      trashedAt,
      thumbnail: p.assets.find(a => a.kind !== 'audio')
        ? `/api/assets/${p.assets.find(a => a.kind !== 'audio')!.id}/thumbnail`
        : prev?.thumbnail
    }

    this.db
      .prepare('INSERT OR REPLACE INTO projects VALUES (?,?)')
      .run(p.id, JSON.stringify(summary))
  }

  async create(p: Project) {
    this.validate(p)
    await atomicJSON(this.file(p.id), p)
    this.index(p)

    return p
  }

  async save(p: Project, expectedRevision: number) {
    const current = await this.get(p.id)

    if (current.revision !== expectedRevision)
      throw new JencutError(
        'REVISION_CONFLICT',
        'Hay una revisión más reciente. Recarga o duplica tu trabajo.',
        409
      )
    const next = { ...p, revision: current.revision + 1 }

    this.validate(next)
    await atomicJSON(this.file(p.id) + '.bak', current)
    await atomicJSON(this.file(p.id), next)
    this.index(next)

    return next
  }

  async serial<T>(id: string, operation: () => Promise<T>): Promise<T> {
    const prev = this.locks.get(id) ?? Promise.resolve()
    const next = prev.catch(() => {}).then(operation)

    this.locks.set(id, next)

    try {
      return await next
    } finally {
      if (this.locks.get(id) === next) this.locks.delete(id)
    }
  }

  list() {
    return this.db
      .prepare('SELECT data FROM projects')
      .all()
      .map(r => JSON.parse(r.data as string) as ProjectSummary)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  setSummary(p: ProjectSummary) {
    this.db
      .prepare('INSERT OR REPLACE INTO projects VALUES (?,?)')
      .run(p.id, JSON.stringify(p))
  }

  setJob(j: Job) {
    this.db
      .prepare('INSERT OR REPLACE INTO jobs VALUES (?,?,?)')
      .run(j.id, j.idempotencyKey, JSON.stringify(j))
  }

  job(id: string): Job {
    const r = this.db.prepare('SELECT data FROM jobs WHERE id=?').get(id)

    if (!r) throw new JencutError('NOT_FOUND', 'Trabajo no encontrado.', 404)

    return JSON.parse(r.data as string)
  }

  jobs() {
    return this.db
      .prepare('SELECT data FROM jobs')
      .all()
      .map(r => JSON.parse(r.data as string) as Job)
  }
}
