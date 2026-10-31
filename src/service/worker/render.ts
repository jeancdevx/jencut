import { readFile, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { Job, Project } from '../../contracts/index.ts'
import { durationFrames, validateProject } from '../../domain/index.ts'
import { hashFile, probe, run, terminateChildren } from '../media.ts'

process.on('SIGTERM', () => {
  terminateChildren()
  process.exit(143)
})
const [root, snapshot] = process.argv.slice(2)
const { job, project: p } = JSON.parse(await readFile(snapshot, 'utf8')) as {
  job: Job
  project: Project
}
const partial = path.join(root, 'renders', `${job.id}.partial.mp4`),
  output = path.join(root, 'renders', `${job.id}.mp4`)

try {
  validateProject(p)
  const frames = durationFrames(p),
    duration = frames / 30
  const resolution = job.settings.resolution,
    height =
      p.canvas.width >= p.canvas.height
        ? resolution
        : Math.round(((p.canvas.height / p.canvas.width) * resolution) / 2) * 2,
    width =
      p.canvas.width >= p.canvas.height
        ? Math.round(((p.canvas.width / p.canvas.height) * resolution) / 2) * 2
        : resolution
  const args = [
    '-v',
    'error',
    '-y',
    '-filter_complex_threads',
    '1',
    '-f',
    'lavfi',
    '-i',
    `color=c=black:s=${width}x${height}:r=30:d=${duration}`,
    '-f',
    'lavfi',
    '-i',
    `anullsrc=r=48000:cl=stereo:d=${duration}`
  ]
  const filters: string[] = []
  let input = 2,
    video = '0:v'
  const audio = ['1:a']

  for (const t of [...p.tracks].sort((a, b) => a.order - b.order)) {
    if ((t.kind === 'visual' && t.hidden) || (t.kind === 'audio' && t.muted))
      continue

    for (const c of t.clips) {
      if (c.kind === 'audio' && c.effects.muted) continue
      const a = p.assets.find(a => a.id === c.assetId)!,
        file = path.join(root, a.managedRelativePath)

      args.push(
        '-protocol_whitelist',
        'file,pipe',
        ...(c.kind === 'image' ? ['-loop', '1'] : []),
        '-i',
        file
      )
      const i = input++,
        source = (c.sourceInPTS * c.sourceTimeBase.num) / c.sourceTimeBase.den,
        len = c.durationFrames / 30

      if (c.kind === 'audio') {
        const label = `a${i}`

        filters.push(
          `[${i}:${c.streamIndex}]atrim=start=${source}:duration=${len},asetpts=PTS-STARTPTS,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume=${c.effects.gainDb ?? 0}dB,adelay=${c.startFrame * 1600}S:all=1[${label}]`
        )
        audio.push(label)
      } else {
        const label = `v${i}`,
          composed = `comp${i}`

        filters.push(
          `[${i}:${c.streamIndex}]trim=start=${source}:duration=${len},setpts=PTS-STARTPTS,fps=30,scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,setpts=PTS+${c.startFrame}/30/TB[${label}]`
        )
        filters.push(
          `[${video}][${label}]overlay=eof_action=pass:repeatlast=0:enable='gte(t,${c.startFrame / 30})*lt(t,${(c.startFrame + c.durationFrames) / 30})'[${composed}]`
        )
        video = composed
      }
    }
  }

  filters.push(
    `${audio.map(s => `[${s}]`).join('')}amix=inputs=${audio.length}:duration=first:normalize=0,alimiter=limit=0.95:level=false:latency=true[aout]`
  )
  args.push(
    '-filter_complex',
    filters.join(';'),
    '-map',
    video === '0:v' ? '0:v' : `[${video}]`,
    '-map',
    '[aout]',
    '-frames:v',
    String(frames),
    '-t',
    String(duration),
    '-c:v',
    'libx264',
    '-preset',
    job.kind === 'preview' ? 'ultrafast' : 'fast',
    '-crf',
    job.kind === 'preview' ? '26' : '20',
    '-pix_fmt',
    'yuv420p',
    '-r',
    '30',
    '-fps_mode',
    'cfr',
    '-color_primaries',
    'bt709',
    '-color_trc',
    'bt709',
    '-colorspace',
    'bt709',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-ar',
    '48000',
    '-ac',
    '2',
    '-threads',
    '2',
    '-movflags',
    '+faststart',
    '-progress',
    'pipe:1',
    partial
  )
  await writeFile(
    path.join(root, 'jobs', `${job.id}.ffmpeg.json`),
    JSON.stringify({ args, revision: p.revision, frames }, null, 2)
  )
  let progressBuffer = ''

  await run(
    'ffmpeg',
    args,
    chunk => {
      progressBuffer += chunk
      const lines = progressBuffer.split('\n')

      progressBuffer = lines.pop() ?? ''

      for (const line of lines) {
        const m = /^out_time_us=(\d+)/.exec(line)

        if (m)
          process.send?.({
            type: 'progress',
            progress: Math.min(99, (Number(m[1]) / 1000000 / duration) * 100)
          })
      }
    },
    600000
  )
  process.send?.({ type: 'verifying' })
  const inspection = await probe(partial),
    v = inspection.streams.find(s => s.codec_type === 'video')!,
    a = inspection.streams.find(s => s.codec_type === 'audio')!
  const actual = Number(inspection.format.duration),
    videoFrames = Number((v as unknown as { nb_frames: string }).nb_frames)

  if (
    !v ||
    !a ||
    v.codec_name !== 'h264' ||
    a.codec_name !== 'aac' ||
    v.width !== width ||
    v.height !== height ||
    v.avg_frame_rate !== '30/1' ||
    Number(a.sample_rate) !== 48000 ||
    videoFrames !== frames ||
    Math.abs(actual - duration) > 0.06
  )
    throw new Error('La inspección del resultado no coincide con el montaje.')

  for (const asset of p.assets)
    if (
      (await hashFile(path.join(root, asset.managedRelativePath))) !==
      asset.contentHash
    )
      throw new Error('El hash de un original cambió. No se publica la salida.')
  await rename(partial, output)
  process.send?.({
    type: 'completed',
    output: `renders/${job.id}.mp4`,
    inspection: {
      duration: actual,
      frames: videoFrames,
      width,
      height,
      video: v.codec_name,
      audio: a.codec_name,
      sampleRate: Number(a.sample_rate)
    }
  })
} catch (e) {
  await unlink(partial).catch(() => {})
  process.send?.({ type: 'failed', error: (e as Error).message })
  process.exitCode = 1
}
