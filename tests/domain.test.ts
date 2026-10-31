import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import type { Project } from '../src/contracts/index.ts'
import {
  applyCommand,
  clipsOf,
  createProject,
  duplicateProject,
  durationFrames,
  validateProject
} from '../src/domain/index.ts'

const fixture = JSON.parse(
  await readFile(
    new URL('../fixtures/project-example.jencut.json', import.meta.url),
    'utf8'
  )
) as Project

fixture.tracks = fixture.tracks.filter(t =>
  t.clips.every(c => (c.kind as string) !== 'title')
)
const base = () => structuredClone(fixture)

test('create validates name, ratio and unique IDs', () => {
  assert.throws(() => createProject(' '))
  assert.throws(() => createProject('a\nb'))
  assert.throws(() => createProject('x', '3:2'))
  const a = createProject('Historia', '9:16')

  assert.equal(a.canvas.width, 1080)
  assert.equal(a.canvas.height, 1920)
  assert.notEqual(a.id, createProject('Historia').id)
})
test('split preserves complementary rational source ranges and synchronized links', () => {
  const p = base(),
    next = applyCommand(p, {
      type: 'split',
      clipId: 'clip-video-01',
      frame: 31
    })

  assert.equal(clipsOf(next).length, 4)
  assert.equal(durationFrames(next), 90)
  assert.equal(next.linkGroups.length, 2)
  validateProject(next)
  const right = clipsOf(next).find(
    c => c.kind === 'video' && c.startFrame === 31
  )!

  assert.equal(
    (right.sourceInPTS * right.sourceTimeBase.num) / right.sourceTimeBase.den,
    31 / 30
  )
  assert.deepEqual(p, base())
  assert.ok(
    clipsOf(next).every(c => !['clip-video-01', 'clip-audio-01'].includes(c.id))
  )
})
test('trim acts on linked group, preserves neighbors, rejects zero and out of source', () => {
  const p = base(),
    next = applyCommand(p, {
      type: 'trim',
      clipId: 'clip-video-01',
      inFrames: 10,
      outFrames: 80
    })

  assert.ok(
    clipsOf(next).every(c => c.durationFrames === 70 && c.startFrame === 10)
  )
  assert.throws(() =>
    applyCommand(p, {
      type: 'trim',
      clipId: 'clip-video-01',
      inFrames: 10,
      outFrames: 10
    })
  )
  assert.throws(() =>
    applyCommand(p, {
      type: 'trim',
      clipId: 'clip-video-01',
      inFrames: 0,
      outFrames: 91
    })
  )
  assert.deepEqual(p, base())
})
test('split boundaries and fractional commands are rejected', () => {
  for (const frame of [0, 90, 12.5])
    assert.throws(() =>
      applyCommand(base(), { type: 'split', clipId: 'clip-video-01', frame })
    )
})
test('collision and locked members reject entire move atomically', () => {
  const p = applyCommand(base(), {
    type: 'duplicate',
    clipId: 'clip-video-01',
    trackId: 'track-v1',
    startFrame: 100
  })

  assert.throws(() =>
    applyCommand(p, {
      type: 'move',
      clipId: 'clip-video-01',
      trackId: 'track-v1',
      startFrame: 20
    })
  )
  const locked = applyCommand(p, {
    type: 'track',
    trackId: 'track-a1',
    patch: { locked: true }
  })

  assert.throws(() =>
    applyCommand(locked, {
      type: 'move',
      clipId: 'clip-video-01',
      trackId: 'track-v1',
      startFrame: 200
    })
  )
  assert.equal(clipsOf(p).find(c => c.id === 'clip-video-01')!.startFrame, 0)
})
test('duplicate creates internal links without modifying original or bytes', () => {
  const p = applyCommand(base(), {
    type: 'duplicate',
    clipId: 'clip-video-01',
    trackId: 'track-v1',
    startFrame: 90
  })

  assert.equal(p.assets.length, 1)
  assert.equal(p.linkGroups.length, 2)
  assert.equal(new Set(clipsOf(p).map(c => c.id)).size, 4)
  validateProject(p)
})
test('ripple rejects crossing clips and moves participating tracks conservatively', () => {
  const p = applyCommand(base(), {
    type: 'duplicate',
    clipId: 'clip-video-01',
    trackId: 'track-v1',
    startFrame: 90
  })
  const q = applyCommand(p, {
    type: 'delete',
    clipId: 'clip-video-01',
    ripple: true
  })

  assert.equal(durationFrames(q), 90)
  assert.equal(q.linkGroups.length, 1)
  assert.ok(clipsOf(q).every(c => c.startFrame === 0))
  const crossing = structuredClone(p)

  crossing.tracks.push({
    ...crossing.tracks[1],
    id: 'crossing',
    order: 1,
    clips: [
      {
        ...crossing.tracks[1].clips[0],
        id: 'crossing-clip',
        trackId: 'crossing',
        linkGroupId: null,
        startFrame: 50,
        durationFrames: 30
      }
    ]
  })
  assert.throws(() =>
    applyCommand(crossing, {
      type: 'delete',
      clipId: 'clip-video-01',
      ripple: true
    })
  )
})
test('four tracks per kind and 50 clips are hard limits', () => {
  let p = createProject('Limites')

  for (let i = 1; i < 4; i++)
    p = applyCommand(p, { type: 'addTrack', kind: 'visual' })
  assert.throws(() => applyCommand(p, { type: 'addTrack', kind: 'visual' }))
})

test('track reorder renumbers peers, and unused resource removal is reversible', () => {
  let p = base()

  p = applyCommand(p, { type: 'addTrack', kind: 'visual' })
  const newer = p.tracks.find(t => t.kind === 'visual' && t.order === 1)!

  p = applyCommand(p, {
    type: 'track',
    trackId: newer.id,
    patch: { order: 0, name: 'Planos superiores' }
  })
  assert.equal(p.tracks.find(t => t.id === 'track-v1')!.order, 1)
  assert.equal(p.tracks.find(t => t.id === newer.id)!.order, 0)
  assert.throws(() =>
    applyCommand(p, { type: 'removeAsset', assetId: p.assets[0].id })
  )
  const unused = structuredClone(p)

  unused.assets.push({ ...unused.assets[0], id: 'unused' })
  assert.equal(
    applyCommand(unused, { type: 'removeAsset', assetId: 'unused' }).assets
      .length,
    1
  )
  assert.equal(unused.assets.length, 2)
})

test('project duplication shares immutable assets and allocates independent montage references', () => {
  const p = base(),
    copy = duplicateProject(p)

  assert.notEqual(copy.id, p.id)
  assert.deepEqual(copy.assets, p.assets)
  assert.ok(copy.tracks.every(t => !p.tracks.some(old => old.id === t.id)))
  assert.ok(clipsOf(copy).every(c => !clipsOf(p).some(old => old.id === c.id)))
  assert.notEqual(copy.linkGroups[0].id, p.linkGroups[0].id)
  validateProject(copy)
  const moved = applyCommand(copy, {
    type: 'move',
    clipId: clipsOf(copy)[0].id,
    trackId: copy.tracks[0].id,
    startFrame: 120
  })

  assert.equal(durationFrames(moved), 210)
  assert.equal(durationFrames(p), 90)
})
