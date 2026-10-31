import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import {
  mkdir,
  open,
  readFile,
  rename,
  stat,
  statfs,
  unlink
} from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'

import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import Fastify from 'fastify'

import type { Command, Derivative, Project } from '../contracts/index.ts'
import { JencutError } from '../contracts/index.ts'
import {
  appendAsset,
  applyCommand,
  createProject,
  duplicateProject
} from '../domain/index.ts'

import { Jobs } from './jobs.ts'
import { derivatives, inspectAsset, run, terminateChildren } from './media.ts'
import { Store } from './store.ts'

type Body = {
  name?: string
  ratio?: string
  expectedRevision: number
  sessionId: string
  command: Command
  resolution?: 720 | 1080
  idempotencyKey?: string
  kind?: 'preview' | 'export'
}

type Route = { Params: { id: string }; Body: Body }

export async function createService(root: string, logger = true) {
  const store = new Store(path.resolve(root))

  await store.init()
  const jobs = new Jobs(store)
  const app = Fastify({ logger, bodyLimit: 2 * 1024 * 1024 })
  const history = new Map<string, { undo: Project[]; redo: Project[] }>(),
    leases = new Map<string, { session: string; expires: number }>()

  await app.register(multipart, {
    limits: { fileSize: 512 * 1024 * 1024, files: 1, fields: 0 }
  })
  await app.register(staticFiles, { root: store.root, serve: false })
  app.addHook('onRequest', async (req, reply) => {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(req.hostname))
      return reply
        .code(403)
        .send({ code: 'HOST_DENIED', message: 'Host local no válido.' })
    const origin = req.headers.origin

    if (
      origin &&
      ![
        'http://127.0.0.1:4321',
        'http://localhost:4321',
        'http://127.0.0.1:4173',
        'http://localhost:4173'
      ].includes(origin)
    )
      return reply
        .code(403)
        .send({ code: 'ORIGIN_DENIED', message: 'Origen no autorizado.' })

    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      req.headers['x-jencut-client'] !== 'jencut-local-v1'
    )
      return reply.code(403).send({
        code: 'CLIENT_REQUIRED',
        message: 'Abre Jencut desde su interfaz local.'
      })
    reply
      .header('X-Content-Type-Options', 'nosniff')
      .header('Cache-Control', 'no-store')
  })
  app.setErrorHandler((error, req, reply) => {
    const e = error as Error & { statusCode?: number; code?: string }

    req.log.error(error)
    reply.code(e.statusCode ?? 500).send({
      code: e.code ?? 'INTERNAL_ERROR',
      message:
        e.statusCode && e.statusCode < 500
          ? e.message
          : 'No se pudo completar la operación. Consulta el diagnóstico y reintenta.',
      recoveryAction: 'Conserva el proyecto y vuelve a intentarlo.',
      requestId: req.id
    })
  })

  function lease(id: string, session: string) {
    if (
      typeof session !== 'string' ||
      session.length < 8 ||
      session.length > 160
    )
      throw new JencutError(
        'SESSION_REQUIRED',
        'La sesión de edición no es válida.',
        400
      )
    const prev = leases.get(id)

    if (prev && prev.expires > Date.now() && prev.session !== session)
      throw new JencutError(
        'READ_ONLY',
        'Otra pestaña está editando este proyecto. Esta sesión es de solo lectura.',
        423
      )
    leases.set(id, { session, expires: Date.now() + 30000 })
  }

  async function mutate(
    id: string,
    body: Body,
    fn: (p: Project) => Promise<Project> | Project,
    record = true
  ) {
    return store.serial(id, async () => {
      lease(id, body.sessionId)
      const current = await store.get(id)

      if (current.revision !== body.expectedRevision)
        throw new JencutError(
          'REVISION_CONFLICT',
          'Hay una revisión más reciente. Recarga el proyecto.',
          409
        )
      const next = await fn(structuredClone(current))
      const saved = await store.save(next, body.expectedRevision)

      if (record) {
        const h = history.get(id) ?? { undo: [], redo: [] }

        h.undo.push(current)
        h.undo = h.undo.slice(-150)
        h.redo = []
        history.set(id, h)
      }

      return saved
    })
  }

  app.get('/api/health', async () => ({
    status: 'ok',
    service: 'Jencut local',
    version: '0.1.0'
  }))
  app.get('/api/diagnostics', async () => {
    const [ffmpeg, ffprobe, disk] = await Promise.all([
      run('ffmpeg', ['-version']),
      run('ffprobe', ['-version']),
      statfs(store.root)
    ])

    return {
      node: process.version,
      platform: process.platform,
      ffmpeg: ffmpeg.split('\n')[0],
      ffprobe: ffprobe.split('\n')[0],
      workspace: store.root,
      freeBytes: disk.bavail * disk.bsize,
      codecs:
        'H.264/AAC: verificados al importar/exportar; HEVC/HDR: no certificados',
      browser: 'Pendiente de comprobar en el cliente'
    }
  })
  app.get('/api/projects', async () => store.list())
  app.post<{ Body: Body }>('/api/projects', async req =>
    store.create(createProject(req.body.name ?? '', req.body.ratio))
  )
  app.get<Route>('/api/projects/:id', async req => store.get(req.params.id))
  app.post<Route>('/api/projects/:id/lease', async req => {
    await store.get(req.params.id)
    lease(req.params.id, req.body.sessionId)

    return { editable: true }
  })
  app.post<Route>('/api/projects/:id/release', async req => {
    if (leases.get(req.params.id)?.session === req.body.sessionId)
      leases.delete(req.params.id)

    return { released: true }
  })
  app.post<Route>('/api/projects/:id/commands', async req => {
    validateCommand(req.body.command)

    return mutate(req.params.id, req.body, p =>
      applyCommand(p, req.body.command)
    )
  })

  for (const direction of ['undo', 'redo'] as const)
    app.post<Route>(`/api/projects/:id/${direction}`, async req =>
      store.serial(req.params.id, async () => {
        lease(req.params.id, req.body.sessionId)
        const current = await store.get(req.params.id),
          h = history.get(current.id),
          stack = h?.[direction]

        if (!stack?.length || !h)
          throw new JencutError(
            'HISTORY_EMPTY',
            'No hay más cambios en esta dirección.'
          )
        const target = structuredClone(stack[stack.length - 1])

        target.revision = current.revision
        const saved = await store.save(target, req.body.expectedRevision)

        h[direction === 'undo' ? 'redo' : 'undo'].push(current)
        stack.pop()

        return saved
      })
    )
  // History transitions keep revision separate from the document being restored.
  app.get<Route>('/api/projects/:id/history', async req => {
    const h = history.get(req.params.id)

    return { undo: h?.undo.length ?? 0, redo: h?.redo.length ?? 0 }
  })
  app.post<Route>('/api/projects/:id/import', async req =>
    store.serial(req.params.id, async () => {
      const session = String(req.headers['x-jencut-session'] ?? '')

      lease(req.params.id, session)
      const current = await store.get(req.params.id),
        expected = Number(req.headers['x-jencut-revision'])

      if (current.revision !== expected)
        throw new JencutError(
          'REVISION_CONFLICT',
          'Recarga el proyecto antes de importar.',
          409
        )

      if (current.assets.length >= 30)
        throw new JencutError(
          'ASSET_LIMIT',
          'M1 permite hasta 30 recursos por proyecto.'
        )
      const data = await req.file()

      if (!data)
        throw new JencutError('FILE_REQUIRED', 'Selecciona un archivo.')
      const ext = path.extname(data.filename).toLowerCase()

      if (
        ![
          '.mp4',
          '.mov',
          '.mkv',
          '.webm',
          '.wav',
          '.mp3',
          '.m4a',
          '.aac',
          '.ogg',
          '.png',
          '.jpg',
          '.jpeg'
        ].includes(ext)
      ) {
        data.file.resume()

        throw new JencutError(
          'UNSUPPORTED_FORMAT',
          'Este formato no está admitido en M1.'
        )
      }

      const id = randomUUID(),
        tmp = path.join(store.root, 'tmp', `${id}.upload`),
        relative = `originals/${id}${ext}`,
        original = path.join(store.root, relative)

      try {
        await pipeline(data.file, createWriteStream(tmp, { flags: 'wx' }))

        if (data.file.truncated)
          throw new JencutError(
            'FILE_LIMIT',
            'El archivo supera 512 MiB. Usa un fragmento más pequeño.'
          )
        const sizes = await Promise.all(
          current.assets.map(a =>
            stat(path.join(store.root, a.managedRelativePath)).then(s => s.size)
          )
        )

        if (
          sizes.reduce((a, b) => a + b, 0) + (await stat(tmp)).size >
          10 * 1024 ** 3
        )
          throw new JencutError(
            'PROJECT_LIMIT',
            'El proyecto supera 10 GiB de medios.'
          )
        const handle = await open(tmp, 'r+')

        try {
          await handle.sync()
        } finally {
          await handle.close()
        }

        const a = await inspectAsset(tmp, id, relative)

        await rename(tmp, original)

        if (process.platform !== 'win32') {
          const dir = await open(path.dirname(original), 'r')

          try {
            await dir.sync()
          } finally {
            await dir.close()
          }
        }

        const derivative = await derivatives(
          store.root,
          a,
          path.basename(data.filename)
        )
        const saved = await store.save(appendAsset(current, a), expected)
        const h = history.get(current.id) ?? { undo: [], redo: [] }

        h.undo.push(current)
        h.undo = h.undo.slice(-150)
        h.redo = []
        history.set(current.id, h)

        return { project: saved, asset: a, derivative }
      } catch (e) {
        await unlink(tmp).catch(() => {})
        await unlink(original).catch(() => {})

        for (const suffix of ['.json', '.jpg', '.mp4'])
          await unlink(path.join(store.root, 'cache', id + suffix)).catch(
            () => {}
          )

        throw e
      }
    })
  )
  app.get<Route>('/api/projects/:id/derivatives', async req => {
    const p = await store.get(req.params.id)
    const result: Record<string, Derivative> = {}

    for (const a of p.assets)
      try {
        result[a.id] = JSON.parse(
          await readFile(path.join(store.root, 'cache', `${a.id}.json`), 'utf8')
        )
      } catch {
        /* Missing derivative is reported as unavailable. */
      }

    return result
  })
  app.get<{ Params: { id: string; kind: string } }>(
    '/api/assets/:id/:kind',
    async (req, reply) => {
      const { id, kind } = req.params

      if (!/^[a-z0-9-]{36}$/.test(id) || !['thumbnail', 'proxy'].includes(kind))
        throw new JencutError('NOT_FOUND', 'Derivado no encontrado.', 404)
      const d = JSON.parse(
        await readFile(path.join(store.root, 'cache', `${id}.json`), 'utf8')
      ) as Derivative
      const file = kind === 'thumbnail' ? d.thumbnail : d.proxy

      if (!file)
        throw new JencutError(
          'NOT_READY',
          'El derivado no está disponible.',
          404
        )

      return reply.sendFile(file)
    }
  )
  app.post<Route>('/api/projects/:id/duplicate', async req => {
    const p = await store.get(req.params.id)

    return store.create(duplicateProject(p))
  })
  app.post<Route>('/api/projects/:id/trash', async req => {
    lease(req.params.id, req.body.sessionId)
    const s = store.summary(req.params.id)

    if (!s) throw new JencutError('NOT_FOUND', 'Proyecto no encontrado.', 404)
    s.trashedAt = new Date().toISOString()
    store.setSummary(s)

    return s
  })
  app.post<Route>('/api/projects/:id/restore', async req => {
    const s = store.summary(req.params.id)

    if (!s) throw new JencutError('NOT_FOUND', 'Proyecto no encontrado.', 404)
    s.trashedAt = null
    store.setSummary(s)

    return s
  })
  app.get<Route>('/api/projects/:id/preflight', async req =>
    jobs.preflight(await store.get(req.params.id))
  )
  app.post<Route>('/api/projects/:id/exports', async req => {
    const p = await store.get(req.params.id)

    if (p.revision !== req.body.expectedRevision)
      throw new JencutError(
        'REVISION_CONFLICT',
        'Espera al guardado antes de exportar.',
        409
      )
    const resolution = req.body.resolution ?? 720

    if (
      ![720, 1080].includes(resolution) ||
      !['preview', 'export'].includes(req.body.kind ?? 'export') ||
      typeof req.body.idempotencyKey !== 'string' ||
      req.body.idempotencyKey.length < 8 ||
      req.body.idempotencyKey.length > 200
    )
      throw new JencutError('INVALID_PRESET', 'Elige un preset válido.')

    return jobs.create(
      p,
      req.body.kind ?? 'export',
      resolution,
      req.body.idempotencyKey
    )
  })
  app.get('/api/jobs', async () => store.jobs())
  app.get<Route>('/api/jobs/:id', async req => store.job(req.params.id))
  app.post<Route>('/api/jobs/:id/cancel', async req =>
    jobs.cancel(req.params.id)
  )
  app.get<Route>('/api/jobs/:id/output', async (req, reply) => {
    const j = store.job(req.params.id)

    if (j.status !== 'completed' || !j.output)
      throw new JencutError(
        'NOT_READY',
        'El resultado todavía no está disponible.',
        409
      )

    if (req.query && Object.hasOwn(req.query as object, 'download'))
      reply.header(
        'Content-Disposition',
        `attachment; filename="jencut-${j.id.slice(0, 8)}.mp4"`
      )

    return reply.sendFile(j.output)
  })
  app.addHook('onClose', async () => {
    jobs.close()
    terminateChildren()
    store.db.close()
  })

  return { app, store, jobs }
}

function validateCommand(c: Command) {
  if (!c || typeof c !== 'object')
    throw new JencutError('INVALID_COMMAND', 'Comando no válido.', 400)
  const keys: Record<string, string[]> = {
    removeAsset: ['assetId'],
    add: ['assetId', 'trackId', 'startFrame'],
    split: ['clipId', 'frame'],
    trim: ['clipId', 'inFrames', 'outFrames'],
    move: ['clipId', 'trackId', 'startFrame'],
    duplicate: ['clipId', 'trackId', 'startFrame'],
    delete: ['clipId'],
    track: ['trackId', 'patch'],
    addTrack: ['kind']
  }

  if (!keys[c.type])
    throw new JencutError('INVALID_COMMAND', 'Comando desconocido.', 400)

  for (const key of keys[c.type])
    if (!Object.hasOwn(c, key))
      throw new JencutError('INVALID_COMMAND', `Falta ${key}.`, 400)

  if (c.type === 'track')
    for (const [key, value] of Object.entries(c.patch)) {
      if (
        !['locked', 'hidden', 'muted', 'name', 'order'].includes(key) ||
        (['locked', 'hidden', 'muted'].includes(key) &&
          typeof value !== 'boolean') ||
        (key === 'name' &&
          (typeof value !== 'string' || !value.trim() || value.length > 160)) ||
        (key === 'order' && (!Number.isSafeInteger(value) || Number(value) < 0))
      )
        throw new JencutError(
          'INVALID_COMMAND',
          'Ajuste de pista no válido.',
          400
        )
    }

  if (c.type === 'addTrack' && !['visual', 'audio'].includes(c.kind))
    throw new JencutError('INVALID_COMMAND', 'Tipo de pista no válido.', 400)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root =
    process.env.JENCUT_WORKSPACE ??
    fileURLToPath(new URL('../../.jencut/', import.meta.url))

  await mkdir(root, { recursive: true })
  const { app } = await createService(root)

  await app.listen({
    host: process.env.JENCUT_HOST ?? '127.0.0.1',
    port: Number(process.env.JENCUT_PORT ?? 4318)
  })

  for (const sig of ['SIGINT', 'SIGTERM'] as const)
    process.on(sig, () => {
      void app.close().then(() => process.exit(0))
    })
}
