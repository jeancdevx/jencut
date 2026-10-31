import type {
  Asset,
  Clip,
  Command,
  Project,
  Rational,
  Track
} from '../contracts/index.ts'
import { JencutError } from '../contracts/index.ts'

const id = () => crypto.randomUUID()
const fail = (code: string, message: string): never => {
  throw new JencutError(code, message)
}

const integer = (n: number) => Number.isSafeInteger(n)

export const clipsOf = (p: Project) => p.tracks.flatMap(t => t.clips)

export const durationFrames = (p: Project) =>
  Math.max(0, ...clipsOf(p).map(c => c.startFrame + c.durationFrames))

export const timecode = (f: number) =>
  [
    Math.floor(f / 108000),
    Math.floor(f / 1800) % 60,
    Math.floor(f / 30) % 60,
    f % 30
  ]
    .map(n => String(n).padStart(2, '0'))
    .join(':')

export function createProject(name: string, ratio = '16:9'): Project {
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    name.trim().length > 80 ||
    Array.from(name).some(
      char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127
    )
  )
    fail(
      'INVALID_NAME',
      'Escribe un nombre de 1 a 80 caracteres, sin caracteres de control.'
    )
  const dimensions: Record<string, [number, number]> = {
    '16:9': [1920, 1080],
    '9:16': [1080, 1920],
    '1:1': [1080, 1080]
  }
  const size =
    dimensions[ratio] ?? fail('INVALID_CANVAS', 'Elige 16:9, 9:16 o 1:1.')

  return {
    schemaVersion: 1,
    id: id(),
    name: name.trim(),
    revision: 0,
    fps: { num: 30, den: 1 },
    canvas: { width: size[0], height: size[1], colorSpace: 'rec709-sdr' },
    assets: [],
    tracks: [
      track('visual', 0, 'Video'),
      track('audio', 0, 'Audio original'),
      track('audio', 1, 'Música')
    ],
    linkGroups: []
  }
}

function track(kind: Track['kind'], order: number, name: string): Track {
  return {
    id: id(),
    kind,
    order,
    name,
    locked: false,
    hidden: false,
    muted: false,
    clips: []
  }
}

// Add project frames to a rational source timestamp without cumulative rounding.
function offsetSource(c: Clip, frames: number) {
  const n =
    c.sourceInPTS * c.sourceTimeBase.num * 30 + frames * c.sourceTimeBase.den
  const d = c.sourceTimeBase.den * 30
  let a = n,
    b = d

  while (b) {
    const r = a % b

    a = b
    b = r
  }

  const gcd = a || d

  c.sourceInPTS = n / gcd
  c.sourceTimeBase = { num: 1, den: d / gcd }
}

const seconds = (pts: number, tb: Rational) => (pts * tb.num) / tb.den

export function validateProject(p: Project): void {
  if (
    p.fps.num !== 30 ||
    p.fps.den !== 1 ||
    p.assets.length > 30 ||
    clipsOf(p).length > 50 ||
    durationFrames(p) > 18000
  )
    fail('LIMIT', 'El montaje supera los límites de M1.')
  const ids = new Set<string>()

  for (const item of [
    p,
    ...p.assets,
    ...p.tracks,
    ...clipsOf(p),
    ...p.linkGroups
  ]) {
    if (ids.has(item.id)) fail('DUPLICATE_ID', 'Hay identificadores repetidos.')
    ids.add(item.id)
  }

  for (const kind of ['visual', 'audio'])
    if (p.tracks.filter(t => t.kind === kind).length > 4)
      fail('TRACK_LIMIT', 'M1 permite hasta cuatro pistas de cada tipo.')

  for (const t of p.tracks) {
    const sorted = [...t.clips].sort((a, b) => a.startFrame - b.startFrame)

    for (let i = 0; i < sorted.length; i++) {
      const c = sorted[i]

      if (
        !integer(c.startFrame) ||
        c.startFrame < 0 ||
        !integer(c.durationFrames) ||
        c.durationFrames < 1 ||
        c.trackId !== t.id
      )
        fail(
          'INVALID_RANGE',
          'Posición y duración deben ser frames enteros positivos.'
        )

      if ((c.kind === 'audio') !== (t.kind === 'audio'))
        fail('TRACK_KIND', 'El clip necesita una pista compatible.')

      if (
        i &&
        sorted[i - 1].startFrame + sorted[i - 1].durationFrames > c.startFrame
      )
        fail(
          'COLLISION',
          'La posición se solapa con otro clip. Elige un espacio libre.'
        )
      const a = p.assets.find(a => a.id === c.assetId),
        s = a?.streams.find(s => s.index === c.streamIndex)

      if (!a || !s || (s.type === 'audio') !== (c.kind === 'audio'))
        fail(
          'MISSING_ASSET',
          'El clip referencia un recurso o stream no disponible.'
        )

      if (
        !integer(c.sourceInPTS) ||
        c.sourceInPTS < 0 ||
        !integer(c.sourceTimeBase.den) ||
        c.sourceTimeBase.den < 1 ||
        c.sourceTimeBase.num < 1
      )
        fail('SOURCE_RANGE', 'El rango de origen no es válido.')

      if (
        c.kind !== 'image' &&
        seconds(c.sourceInPTS, c.sourceTimeBase) + c.durationFrames / 30 >
          seconds(s!.durationPTS, s!.timeBase) + 0.000001
      )
        fail('SOURCE_RANGE', 'El recorte excede la duración del original.')

      if (
        (c.effects.fadeInFrames ?? 0) + (c.effects.fadeOutFrames ?? 0) >
        c.durationFrames
      )
        fail('FADE_RANGE', 'Los fundidos exceden el clip.')

      if (
        c.linkGroupId &&
        !p.linkGroups.some(
          g => g.id === c.linkGroupId && g.memberClipIds.includes(c.id)
        )
      )
        fail('INVALID_LINK', 'El vínculo del clip no existe.')
    }
  }

  for (const g of p.linkGroups) {
    const members = g.memberClipIds.map(cid =>
      clipsOf(p).find(c => c.id === cid)
    )

    if (members.length !== 2 || members.some(c => !c || c.linkGroupId !== g.id))
      fail('INVALID_LINK', 'El vínculo debe contener video y audio existentes.')
    const [a, b] = members as Clip[]

    if (
      a.kind === b.kind ||
      a.assetId !== b.assetId ||
      a.startFrame !== b.startFrame ||
      a.durationFrames !== b.durationFrames ||
      Math.abs(
        seconds(a.sourceInPTS, a.sourceTimeBase) -
          seconds(b.sourceInPTS, b.sourceTimeBase)
      ) > 0.000001
    )
      fail(
        'LINK_SYNC',
        'El video y su audio vinculado deben permanecer sincronizados.'
      )
  }
}

function group(p: Project, cid: string) {
  const c =
    clipsOf(p).find(c => c.id === cid) ??
    fail('NOT_FOUND', 'Selecciona un clip existente.')
  const members = c.linkGroupId
    ? clipsOf(p).filter(x => x.linkGroupId === c.linkGroupId)
    : [c]

  for (const m of members)
    if (p.tracks.find(t => t.id === m.trackId)?.locked)
      fail(
        'LOCKED',
        'Una pista del grupo está bloqueada. Desbloquéala antes de editar.'
      )

  return members
}

export function applyCommand(project: Project, cmd: Command): Project {
  const p = structuredClone(project)

  if (cmd.type === 'removeAsset') {
    if (clipsOf(p).some(c => c.assetId === cmd.assetId))
      fail(
        'ASSET_IN_USE',
        'Este recurso se usa en la secuencia. Elimina primero sus clips.'
      )
    p.assets = p.assets.filter(a => a.id !== cmd.assetId)
  } else if (cmd.type === 'addTrack') {
    const same = p.tracks.filter(t => t.kind === cmd.kind)

    p.tracks.push(
      track(
        cmd.kind,
        same.length,
        `${cmd.kind === 'audio' ? 'Audio' : 'Video'} ${same.length + 1}`
      )
    )
  } else if (cmd.type === 'track') {
    const t =
      p.tracks.find(t => t.id === cmd.trackId) ??
      fail('NOT_FOUND', 'Pista no encontrada.')

    if (cmd.patch.order !== undefined) {
      const tracks = p.tracks
        .filter(other => other.kind === t.kind && other.id !== t.id)
        .sort((a, b) => a.order - b.order)

      if (cmd.patch.order >= tracks.length + 1)
        fail('TRACK_ORDER', 'La posición de pista no existe.')
      tracks.splice(cmd.patch.order, 0, t)
      tracks.forEach((item, index) => {
        item.order = index
      })
    }

    Object.assign(t, cmd.patch)
  } else if (cmd.type === 'add') {
    const a =
      p.assets.find(a => a.id === cmd.assetId) ??
      fail('NOT_FOUND', 'Recurso no encontrado.')
    const t =
      p.tracks.find(t => t.id === cmd.trackId) ??
      fail('NOT_FOUND', 'Pista no encontrada.')

    if (t.locked) fail('LOCKED', 'La pista está bloqueada.')
    const stream =
      a.streams.find(s => (t.kind === 'audio') === (s.type === 'audio')) ??
      fail('TRACK_KIND', 'El recurso necesita una pista compatible.')
    const linkedAudio =
      t.kind === 'visual' && a.kind === 'video'
        ? a.streams.find(s => s.type === 'audio')
        : undefined
    let len =
      a.kind === 'image'
        ? 90
        : Math.floor(
            seconds(stream.durationPTS, stream.timeBase) * 30 + 0.000001
          )

    if (linkedAudio)
      len = Math.min(
        len,
        Math.floor(
          seconds(linkedAudio.durationPTS, linkedAudio.timeBase) * 30 + 0.000001
        )
      )
    const linkId = linkedAudio ? id() : null
    const clip: Clip = {
      id: id(),
      kind:
        t.kind === 'audio' ? 'audio' : a.kind === 'image' ? 'image' : 'video',
      trackId: t.id,
      startFrame: cmd.startFrame,
      durationFrames: len,
      assetId: a.id,
      streamIndex: stream.index,
      sourceInPTS: 0,
      sourceTimeBase: stream.timeBase,
      linkGroupId: linkId,
      effects: {}
    }

    t.clips.push(clip)

    if (linkedAudio) {
      const at =
        p.tracks.find(
          t =>
            t.kind === 'audio' &&
            !t.locked &&
            !t.clips.some(
              c =>
                c.startFrame < cmd.startFrame + len &&
                c.startFrame + c.durationFrames > cmd.startFrame
            )
        ) ?? fail('COLLISION', 'No hay pista libre para el audio vinculado.')
      const ac: Clip = {
        ...structuredClone(clip),
        id: id(),
        kind: 'audio',
        trackId: at.id,
        streamIndex: linkedAudio.index,
        sourceTimeBase: linkedAudio.timeBase
      }

      at.clips.push(ac)
      p.linkGroups.push({ id: linkId!, memberClipIds: [clip.id, ac.id] })
    }
  } else {
    const members = group(p, cmd.clipId),
      primary = members.find(c => c.id === cmd.clipId)!

    if (cmd.type === 'split') {
      const delta = cmd.frame - primary.startFrame

      if (!integer(delta) || delta <= 0 || delta >= primary.durationFrames)
        fail('SPLIT_BOUNDARY', 'Divide en un frame interior del clip.')
      const leftGroup = members.length > 1 ? id() : null,
        rightGroup = members.length > 1 ? id() : null
      const left: string[] = [],
        right: string[] = []

      for (const c of members) {
        const t = p.tracks.find(t => t.id === c.trackId)!,
          l = structuredClone(c),
          r = structuredClone(c)

        l.id = id()
        l.durationFrames = delta
        l.linkGroupId = leftGroup
        r.id = id()
        r.startFrame += delta
        r.durationFrames -= delta
        r.linkGroupId = rightGroup
        offsetSource(r, delta)
        t.clips = t.clips.filter(x => x.id !== c.id).concat(l, r)
        left.push(l.id)
        right.push(r.id)
      }

      p.linkGroups = p.linkGroups.filter(g => g.id !== primary.linkGroupId)

      if (leftGroup && rightGroup)
        p.linkGroups.push(
          { id: leftGroup, memberClipIds: left },
          { id: rightGroup, memberClipIds: right }
        )
    } else if (cmd.type === 'trim') {
      if (
        !integer(cmd.inFrames) ||
        !integer(cmd.outFrames) ||
        cmd.inFrames < 0 ||
        cmd.outFrames > primary.durationFrames ||
        cmd.outFrames <= cmd.inFrames
      )
        fail(
          'INVALID_RANGE',
          'IN y OUT deben conservar al menos un frame dentro del clip.'
        )

      for (const c of members) {
        offsetSource(c, cmd.inFrames)
        c.startFrame += cmd.inFrames
        c.durationFrames = cmd.outFrames - cmd.inFrames
      }
    } else if (cmd.type === 'move' || cmd.type === 'duplicate') {
      const delta = cmd.startFrame - primary.startFrame
      const target =
        p.tracks.find(t => t.id === cmd.trackId) ??
        fail('NOT_FOUND', 'Pista no encontrada.')

      if (target.locked) fail('LOCKED', 'La pista destino está bloqueada.')
      const linkId =
        cmd.type === 'duplicate' && members.length > 1
          ? id()
          : primary.linkGroupId
      const newIds: string[] = []

      for (const c of members) {
        const from = p.tracks.find(t => t.id === c.trackId)!,
          dest = c.id === primary.id ? target : from
        const copy = structuredClone(c)

        copy.startFrame += delta
        copy.trackId = dest.id

        if (cmd.type === 'duplicate') {
          copy.id = id()
          copy.linkGroupId = linkId
          newIds.push(copy.id)
        } else from.clips = from.clips.filter(x => x.id !== c.id)
        dest.clips.push(copy)
      }

      if (cmd.type === 'duplicate' && linkId)
        p.linkGroups.push({ id: linkId, memberClipIds: newIds })
    } else if (cmd.type === 'delete') {
      const end = primary.startFrame + primary.durationFrames

      if (cmd.ripple) {
        for (const t of p.tracks) {
          if (t.locked && t.clips.some(c => c.startFrame >= primary.startFrame))
            fail('LOCKED', 'El cierre afectaría una pista bloqueada.')

          if (
            t.clips.some(
              c =>
                !members.includes(c) &&
                c.startFrame < end &&
                c.startFrame + c.durationFrames > primary.startFrame
            )
          )
            fail(
              'RIPPLE_CROSSING',
              'Un clip cruza el intervalo. Elimina dejando hueco.'
            )
        }
      }

      for (const t of p.tracks) {
        t.clips = t.clips.filter(c => !members.includes(c))

        if (cmd.ripple)
          for (const c of t.clips)
            if (c.startFrame >= end) c.startFrame -= primary.durationFrames
      }

      p.linkGroups = p.linkGroups.filter(g => g.id !== primary.linkGroupId)
    }
  }

  validateProject(p)

  return p
}

export function appendAsset(p: Project, a: Asset): Project {
  const next = structuredClone(p)

  next.assets.push(a)
  validateProject(next)

  return next
}

export function duplicateProject(project: Project): Project {
  const p = structuredClone(project),
    ids = new Map<string, string>()

  for (const item of [p, ...p.tracks, ...clipsOf(p), ...p.linkGroups])
    ids.set(item.id, id())
  p.id = ids.get(p.id)!
  p.name = `${p.name.slice(0, 72)} · copia`
  p.revision = 0

  for (const t of p.tracks) {
    t.id = ids.get(t.id)!

    for (const c of t.clips) {
      c.id = ids.get(c.id)!
      c.trackId = t.id

      if (c.linkGroupId) c.linkGroupId = ids.get(c.linkGroupId)!
    }
  }

  for (const g of p.linkGroups) {
    g.id = ids.get(g.id)!
    g.memberClipIds = g.memberClipIds.map(member => ids.get(member)!)
  }

  validateProject(p)

  return p
}
