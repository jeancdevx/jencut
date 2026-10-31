export type Rational = { num: number; den: number }

export type Stream = {
  index: number
  type: 'video' | 'audio' | 'image'
  codec: string
  timeBase: Rational
  durationPTS: number
  width?: number
  height?: number
  sampleRate?: number
  channels?: number
}

export type Asset = {
  id: string
  kind: 'video' | 'audio' | 'image'
  contentHash: string
  managedRelativePath: string
  streams: Stream[]
  rotationDegrees?: number
  colorSpace?: string
}

export type Clip = {
  id: string
  kind: 'video' | 'audio' | 'image'
  trackId: string
  startFrame: number
  durationFrames: number
  assetId: string
  streamIndex: number
  sourceInPTS: number
  sourceTimeBase: Rational
  linkGroupId: string | null
  effects: {
    gainDb?: number
    muted?: boolean
    fadeInFrames?: number
    fadeOutFrames?: number
  }
}

export type Track = {
  id: string
  kind: 'visual' | 'audio'
  order: number
  name: string
  locked: boolean
  hidden: boolean
  muted: boolean
  clips: Clip[]
}

export type Project = {
  schemaVersion: 1
  id: string
  name: string
  revision: number
  fps: { num: 30; den: 1 }
  canvas: { width: number; height: number; colorSpace: 'rec709-sdr' }
  assets: Asset[]
  tracks: Track[]
  linkGroups: { id: string; memberClipIds: string[] }[]
}

export type Command =
  | { type: 'removeAsset'; assetId: string }
  | { type: 'add'; assetId: string; trackId: string; startFrame: number }
  | { type: 'split'; clipId: string; frame: number }
  | { type: 'trim'; clipId: string; inFrames: number; outFrames: number }
  | {
      type: 'move' | 'duplicate'
      clipId: string
      trackId: string
      startFrame: number
    }
  | { type: 'delete'; clipId: string; ripple?: boolean }
  | {
      type: 'track'
      trackId: string
      patch: Partial<
        Pick<Track, 'locked' | 'hidden' | 'muted' | 'name' | 'order'>
      >
    }
  | { type: 'addTrack'; kind: Track['kind'] }

export type Derivative = {
  name: string
  duration: number
  proxy?: string
  thumbnail?: string
  waveform?: number[]
  format: string
  variableFrameRate: boolean
}

export type Job = {
  id: string
  projectId: string
  revision: number
  kind: 'preview' | 'export'
  status:
    | 'pending'
    | 'processing'
    | 'verifying'
    | 'completed'
    | 'failed'
    | 'cancelled'
  progress: number
  error?: string
  output?: string
  inspection?: {
    duration: number
    frames: number
    width: number
    height: number
    video: string
    audio: string
    sampleRate: number
  }
  settings: { resolution: 720 | 1080 }
  idempotencyKey: string
}

export type ProjectSummary = {
  id: string
  name: string
  revision: number
  durationFrames: number
  width: number
  height: number
  updatedAt: string
  thumbnail?: string
  trashedAt: string | null
}

export class JencutError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 422
  ) {
    super(message)
  }
}
