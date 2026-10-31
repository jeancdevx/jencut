import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import type { Job, Project } from '../src/contracts/index.ts'
import { clipsOf } from '../src/domain/index.ts'
import { createService } from '../src/service/index.ts'
import { hashFile, probe } from '../src/service/media.ts'

test('real import, editing, durable reopen, worker render, inspected output and failures', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'jencut-test-')),
    service = await createService(root, false)

  await service.app.listen({ host: '127.0.0.1', port: 0 })
  const addr = service.app.server.address()

  assert.ok(addr && typeof addr !== 'string')
  const base = `http://127.0.0.1:${addr.port}/api`,
    sessionId = 'integration-session'
  const request = async (url: string, body?: unknown) => {
    const res = await fetch(base + url, {
      headers: {
        'content-type': 'application/json',
        'x-jencut-client': 'jencut-local-v1'
      },
      ...(body === undefined
        ? {}
        : { method: 'POST', body: JSON.stringify(body) })
    })
    const data = await res.json()

    return { status: res.status, data }
  }

  let p: Project

  try {
    const created = await request('/projects', {
      name: 'Prueba H1',
      ratio: '16:9'
    })

    assert.equal(created.status, 200)
    p = created.data
    const empty = await request(`/projects/${p.id}/exports`, {
      expectedRevision: 0,
      resolution: 720,
      idempotencyKey: 'empty-test'
    })

    assert.equal(empty.data.code, 'EMPTY_PROJECT')
    const original = new URL(
        '../fixtures/smoke/clip-with-audio.mp4',
        import.meta.url
      ),
      before = await hashFile(original.pathname)

    async function upload(name: string) {
      const data = new FormData()

      data.append(
        'file',
        new Blob([
          await readFile(new URL(`../fixtures/smoke/${name}`, import.meta.url))
        ]),
        name
      )
      const res = await fetch(`${base}/projects/${p.id}/import`, {
        method: 'POST',
        headers: {
          'x-jencut-client': 'jencut-local-v1',
          'x-jencut-session': sessionId,
          'x-jencut-revision': String(p.revision)
        },
        body: data
      })

      return { status: res.status, data: await res.json() }
    }

    const corrupt = await upload('invalid-media.mp4')

    assert.equal(corrupt.status, 422)
    assert.equal(corrupt.data.code, 'INVALID_MEDIA')
    const imported = await upload('clip-with-audio.mp4')

    assert.equal(imported.status, 200, JSON.stringify(imported.data))
    p = imported.data.project
    assert.equal(imported.data.derivative.duration, 3)
    assert.ok(imported.data.derivative.thumbnail)
    assert.ok(imported.data.derivative.proxy)
    assert.ok(imported.data.derivative.waveform.length)
    const cmd = async (command: unknown) => {
      const r = await request(`/projects/${p.id}/commands`, {
        sessionId,
        expectedRevision: p.revision,
        command
      })

      if (r.status === 200) p = r.data

      return r
    }

    assert.equal(
      (
        await cmd({
          type: 'add',
          assetId: p.assets[0].id,
          trackId: p.tracks[0].id,
          startFrame: 0
        })
      ).status,
      200
    )
    assert.equal(clipsOf(p).length, 2)
    const preSplit = structuredClone(p),
      video = clipsOf(p).find(c => c.kind === 'video')!

    await cmd({ type: 'split', clipId: video.id, frame: 45 })
    assert.equal(clipsOf(p).length, 4)
    let r = await request(`/projects/${p.id}/undo`, {
      sessionId,
      expectedRevision: p.revision
    })

    p = r.data
    assert.deepEqual(p.tracks, preSplit.tracks)
    assert.deepEqual(p.linkGroups, preSplit.linkGroups)
    r = await request(`/projects/${p.id}/redo`, {
      sessionId,
      expectedRevision: p.revision
    })
    p = r.data
    assert.equal(clipsOf(p).length, 4)
    const first = clipsOf(p).find(
      c => c.kind === 'video' && c.startFrame === 0
    )!

    await cmd({ type: 'trim', clipId: first.id, inFrames: 6, outFrames: 45 })
    const beforeInvalid = JSON.stringify(p)

    r = await cmd({
      type: 'trim',
      clipId: first.id,
      inFrames: 0,
      outFrames: 999
    })
    assert.equal(r.status, 422)
    assert.equal(JSON.stringify(p), beforeInvalid)
    const conflict = await request(`/projects/${p.id}/commands`, {
      sessionId,
      expectedRevision: 0,
      command: { type: 'addTrack', kind: 'visual' }
    })

    assert.equal(conflict.status, 409)
    const second = await request(`/projects/${p.id}/lease`, {
      sessionId: 'other-session'
    })

    assert.equal(second.status, 423)
    const crossOrigin = await fetch(base + '/projects', {
      method: 'POST',
      headers: {
        origin: 'https://example.com',
        'content-type': 'application/json',
        'x-jencut-client': 'jencut-local-v1'
      },
      body: JSON.stringify({ name: 'bad' })
    })

    assert.equal(crossOrigin.status, 403)
    const body = {
      expectedRevision: p.revision,
      resolution: 720,
      idempotencyKey: `integration-${p.id}`,
      kind: 'export'
    }

    r = await request(`/projects/${p.id}/exports`, body)
    assert.equal(r.status, 200)
    const jobId = r.data.id

    assert.equal(
      (await request(`/projects/${p.id}/exports`, body)).data.id,
      jobId
    )
    const timeout = Date.now() + 90000
    let job: Job = r.data

    while (
      !['completed', 'failed'].includes(job.status) &&
      Date.now() < timeout
    ) {
      await new Promise(resolve => setTimeout(resolve, 200))
      job = (await request(`/jobs/${jobId}`)).data
    }

    assert.equal(job.status, 'completed', JSON.stringify(job))
    assert.equal(job.inspection?.frames, 90)
    assert.equal(job.inspection?.width, 1280)
    assert.equal(job.inspection?.height, 720)
    assert.equal(job.inspection?.sampleRate, 48000)
    const output = await probe(path.join(root, job.output!))

    assert.equal(output.streams.length, 2)
    assert.ok(Math.abs(Number(output.format.duration) - 3) < 0.06)
    assert.equal(await hashFile(original.pathname), before)
    assert.equal(
      await hashFile(path.join(root, p.assets[0].managedRelativePath)),
      before
    )

    await cmd({
      type: 'track',
      trackId: p.tracks[0].id,
      patch: { hidden: true }
    })
    await cmd({
      type: 'track',
      trackId: p.tracks[1].id,
      patch: { muted: true }
    })
    const hidden = await request(`/projects/${p.id}/exports`, {
      expectedRevision: p.revision,
      resolution: 720,
      idempotencyKey: `hidden-${p.id}`
    })
    let hiddenJob: Job = hidden.data
    const hiddenDeadline = Date.now() + 90000

    while (
      !['completed', 'failed'].includes(hiddenJob.status) &&
      Date.now() < hiddenDeadline
    ) {
      await new Promise(resolve => setTimeout(resolve, 200))
      hiddenJob = (await request(`/jobs/${hiddenJob.id}`)).data
    }

    assert.equal(hiddenJob.status, 'completed', JSON.stringify(hiddenJob))
    const hiddenOutput = path.join(root, hiddenJob.output!)
    const pixel = execFileSync('ffmpeg', [
      '-v',
      'error',
      '-i',
      hiddenOutput,
      '-vf',
      'scale=1:1,format=rgb24',
      '-frames:v',
      '1',
      '-f',
      'rawvideo',
      'pipe:1'
    ])

    assert.ok(
      [...pixel].every(value => value <= 3),
      'Hidden visual track must render black'
    )
    const samples = execFileSync('ffmpeg', [
      '-v',
      'error',
      '-i',
      hiddenOutput,
      '-vn',
      '-ac',
      '1',
      '-ar',
      '48000',
      '-f',
      's16le',
      'pipe:1'
    ])
    let maxSample = 0

    for (let i = 0; i < samples.length; i += 2)
      maxSample = Math.max(maxSample, Math.abs(samples.readInt16LE(i)))
    assert.ok(maxSample <= 1, 'Muted audio track must render silence')

    for (let i = 0; i < 2; i++) {
      r = await request(`/projects/${p.id}/undo`, {
        sessionId,
        expectedRevision: p.revision
      })
      assert.equal(r.status, 200)
      p = r.data
    }

    const cancelling = await request(`/projects/${p.id}/exports`, {
      expectedRevision: p.revision,
      resolution: 1080,
      idempotencyKey: `cancel-${p.id}`
    })
    const cancelled = await request(`/jobs/${cancelling.data.id}/cancel`, {})

    assert.equal(cancelled.data.status, 'cancelled')
    const unavailable = await fetch(`${base}/jobs/${cancelling.data.id}/output`)

    assert.equal(unavailable.status, 409)
    const persisted = (await request(`/projects/${p.id}`)).data

    assert.deepEqual(persisted, p)
    await writeFile(
      path.join(root, 'evidence.json'),
      JSON.stringify({
        projectId: p.id,
        revision: p.revision,
        job,
        originalHashBefore: before,
        originalHashAfter: await hashFile(original.pathname),
        failureCases: [
          'invalid-media',
          'invalid-trim',
          'revision-conflict',
          'second-session',
          'cross-origin',
          'empty-export'
        ]
      })
    )
    console.log(
      'H1 verified:',
      JSON.stringify({
        projectId: p.id,
        revision: p.revision,
        inspection: job.inspection,
        originalHash: before
      })
    )

    // More than 100 session commands, and undo all of them.
    for (let i = 0; i < 105; i++)
      assert.equal(
        (
          await cmd({
            type: 'track',
            trackId: p.tracks[0].id,
            patch: { hidden: i % 2 === 0 }
          })
        ).status,
        200
      )

    for (let i = 0; i < 105; i++) {
      r = await request(`/projects/${p.id}/undo`, {
        sessionId,
        expectedRevision: p.revision
      })
      assert.equal(r.status, 200)
      p = r.data
    }

    assert.equal(p.tracks[0].hidden, false)
    await service.app.close()
    const reopened = await createService(root, false)

    assert.deepEqual(await reopened.store.get(p.id), p)
    await reopened.app.close()
  } finally {
    if (service.app.server.listening) await service.app.close()
    await rm(root, { recursive: true, force: true })
  }
})

test('SP-03 corpus: silent H.264, 44.1 kHz mono, 48 kHz stereo and PNG import', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'jencut-corpus-')),
    service = await createService(root, false)

  await service.app.listen({ host: '127.0.0.1', port: 0 })
  const address = service.app.server.address()

  assert.ok(address && typeof address !== 'string')
  const base = `http://127.0.0.1:${address.port}/api`,
    sessionId = 'corpus-test-session'
  const post = async (url: string, body: unknown) => {
    const r = await fetch(base + url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-jencut-client': 'jencut-local-v1'
      },
      body: JSON.stringify(body)
    })
    const value = await r.json()

    assert.equal(r.status, 200, JSON.stringify(value))

    return value
  }

  let p = (await post('/projects', {
    name: 'Corpus M1',
    ratio: '16:9'
  })) as Project

  try {
    const names = [
      'clip-no-audio.mp4',
      'audio-44100-mono.wav',
      'music-48000.wav',
      'overlay-alpha.png'
    ]

    for (const name of names) {
      const data = new FormData()

      data.append(
        'file',
        new Blob([
          await readFile(new URL(`../fixtures/smoke/${name}`, import.meta.url))
        ]),
        name
      )
      const r = await fetch(`${base}/projects/${p.id}/import`, {
        method: 'POST',
        headers: {
          'x-jencut-client': 'jencut-local-v1',
          'x-jencut-session': sessionId,
          'x-jencut-revision': String(p.revision)
        },
        body: data
      })
      const result = await r.json()

      assert.equal(r.status, 200, JSON.stringify(result))
      p = result.project
    }

    assert.equal(
      p.assets[0].streams.some(s => s.type === 'audio'),
      false
    )
    assert.equal(p.assets[1].streams[0].sampleRate, 44100)
    assert.equal(p.assets[1].streams[0].channels, 1)
    assert.equal(p.assets[2].streams[0].sampleRate, 48000)
    assert.equal(p.assets[3].kind, 'image')

    for (const [assetIndex, trackIndex] of [
      [0, 0],
      [1, 1],
      [2, 2]
    ])
      p = await post(`/projects/${p.id}/commands`, {
        sessionId,
        expectedRevision: p.revision,
        command: {
          type: 'add',
          assetId: p.assets[assetIndex].id,
          trackId: p.tracks[trackIndex].id,
          startFrame: 0
        }
      })
    assert.equal(
      p.linkGroups.length,
      0,
      'Silent video must not create a fictitious audio link'
    )
    let job = (await post(`/projects/${p.id}/exports`, {
      expectedRevision: p.revision,
      resolution: 720,
      idempotencyKey: `corpus-${p.id}`
    })) as Job
    const deadline = Date.now() + 90000

    while (
      !['completed', 'failed'].includes(job.status) &&
      Date.now() < deadline
    ) {
      await new Promise(resolve => setTimeout(resolve, 200))
      job = await (await fetch(`${base}/jobs/${job.id}`)).json()
    }

    assert.equal(job.status, 'completed', JSON.stringify(job))
    assert.equal(job.inspection?.frames, 90)
    assert.equal(job.inspection?.sampleRate, 48000)
    const output = await probe(path.join(root, job.output!))

    assert.equal(
      output.streams.find(s => s.codec_type === 'audio')?.channels,
      2
    )
    console.log(
      'SP-03 verified:',
      JSON.stringify({
        inputs: names,
        inspection: job.inspection,
        png: 'import only; alpha composition parity pending H3'
      })
    )
  } finally {
    await service.app.close()
    await rm(root, { recursive: true, force: true })
  }
})
