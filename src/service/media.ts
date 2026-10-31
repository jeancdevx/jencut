import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { Asset, Derivative, Stream } from '../contracts/index.ts'
import { JencutError } from '../contracts/index.ts'

export type Probe = {
  streams: {
    index: number
    codec_type: string
    codec_name: string
    time_base: string
    duration_ts?: number
    duration?: string
    width?: number
    height?: number
    sample_rate?: string
    channels?: number
    color_transfer?: string
    r_frame_rate?: string
    avg_frame_rate?: string
    side_data_list?: { rotation?: number }[]
  }[]
  format: { duration?: string; format_name: string }
}

const children = new Set<ReturnType<typeof spawn>>()

export function terminateChildren() {
  for (const c of children) c.kill('SIGKILL')
}

export async function run(
  bin: string,
  args: string[],
  onProgress?: (text: string) => void,
  timeout = 180000
) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(bin, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    })
    let stdout = '',
      stderr = ''

    children.add(child)
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new Error(`${bin}: tiempo de procesamiento agotado`))
    }, timeout)

    child.stdout.on('data', b => {
      const s = b.toString()

      stdout = (stdout + s).slice(-2000000)
      onProgress?.(s)
    })
    child.stderr.on('data', b => {
      stderr = (stderr + b.toString()).slice(-8000)
    })
    child.on('error', e => {
      clearTimeout(timer)
      reject(e)
    })
    child.on('close', code => {
      clearTimeout(timer)
      children.delete(child)

      if (code === 0) resolve(stdout)
      else reject(new Error(`${bin} (${code}): ${stderr}`))
    })
  })
}

export const probe = async (file: string): Promise<Probe> =>
  JSON.parse(
    await run(
      'ffprobe',
      [
        '-v',
        'error',
        '-protocol_whitelist',
        'file,pipe',
        '-show_streams',
        '-show_format',
        '-of',
        'json',
        file
      ],
      undefined,
      30000
    )
  )

export async function hashFile(file: string) {
  const hash = createHash('sha256')

  for await (const chunk of createReadStream(file)) hash.update(chunk)

  return hash.digest('hex')
}

export async function inspectAsset(
  file: string,
  id: string,
  relative: string
): Promise<Asset> {
  let p: Probe

  try {
    p = await probe(file)
  } catch {
    throw new JencutError(
      'INVALID_MEDIA',
      'No se puede leer el medio. Elige un MP4, MOV, WebM, WAV, MP3 o imagen válido.'
    )
  }

  if (
    p.streams.some(
      s =>
        s.codec_name === 'hevc' ||
        ['smpte2084', 'arib-std-b67'].includes(s.color_transfer ?? '')
    )
  )
    throw new JencutError(
      'UNSUPPORTED_HDR',
      'HEVC y HDR aún no están certificados. Convierte a H.264 SDR.'
    )
  const image = /\.(png|jpe?g)$/i.test(relative),
    kind = image
      ? 'image'
      : p.streams.some(s => s.codec_type === 'video')
        ? 'video'
        : 'audio'
  const streams: Stream[] = p.streams
    .filter(s => ['video', 'audio'].includes(s.codec_type))
    .map(s => {
      const [num, den] = s.time_base.split('/').map(Number)

      return {
        index: s.index,
        type: image ? 'image' : (s.codec_type as 'video' | 'audio'),
        codec: s.codec_name,
        timeBase: { num, den },
        durationPTS:
          s.duration_ts ??
          Math.max(
            1,
            Math.floor(
              (Number(s.duration ?? p.format.duration ?? '0') * den) / num
            )
          ),
        ...(s.width ? { width: s.width, height: s.height } : {}),
        ...(s.sample_rate
          ? { sampleRate: Number(s.sample_rate), channels: s.channels }
          : {})
      }
    })

  if (
    !streams.length ||
    (!image &&
      streams.some(
        s => !Number.isSafeInteger(s.durationPTS) || s.durationPTS < 1
      ))
  )
    throw new JencutError(
      'INVALID_MEDIA',
      'El medio no contiene streams con duración válida.'
    )

  return {
    id,
    kind,
    contentHash: await hashFile(file),
    managedRelativePath: relative,
    streams,
    rotationDegrees:
      p.streams[0].side_data_list?.find(s => s.rotation !== undefined)
        ?.rotation ?? 0,
    colorSpace: 'rec709-sdr'
  }
}

export async function derivatives(
  root: string,
  a: Asset,
  name: string
): Promise<Derivative> {
  const file = path.join(root, a.managedRelativePath),
    meta = await probe(file),
    s = a.streams[0],
    dur =
      a.kind === 'image' ? 3 : (s.durationPTS * s.timeBase.num) / s.timeBase.den
  const d: Derivative = {
    name,
    duration: dur,
    format: meta.format.format_name,
    variableFrameRate: meta.streams.some(
      s => s.codec_type === 'video' && s.avg_frame_rate !== s.r_frame_rate
    )
  }

  if (a.kind !== 'audio') {
    d.thumbnail = `cache/${a.id}.jpg`
    await run('ffmpeg', [
      '-v',
      'error',
      '-y',
      '-i',
      file,
      '-frames:v',
      '1',
      '-vf',
      'scale=480:-2',
      '-threads',
      '2',
      path.join(root, d.thumbnail)
    ])
  }

  if (a.kind === 'video') {
    d.proxy = `cache/${a.id}.mp4`
    await run('ffmpeg', [
      '-v',
      'error',
      '-y',
      '-i',
      file,
      '-vf',
      'scale=w=1280:h=720:force_original_aspect_ratio=decrease:force_divisible_by=2,fps=30',
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-crf',
      '26',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-ar',
      '48000',
      '-ac',
      '2',
      '-threads',
      '2',
      '-movflags',
      '+faststart',
      path.join(root, d.proxy)
    ])
  }

  if (a.streams.some(s => s.type === 'audio')) {
    // Decode to a bounded on-disk PCM, then reduce real samples into waveform peaks.
    const tmp = path.join(root, 'tmp', `${a.id}.pcm`)

    await run('ffmpeg', [
      '-v',
      'error',
      '-y',
      '-i',
      file,
      '-vn',
      '-ac',
      '1',
      '-ar',
      '8000',
      '-f',
      's16le',
      tmp
    ])
    const b = await readFile(tmp)
    const count = b.length / 2,
      bucket = Math.max(1, Math.ceil(count / 160))

    d.waveform = []

    for (let i = 0; i < count; i += bucket) {
      let peak = 0

      for (let j = i; j < Math.min(i + bucket, count); j++)
        peak = Math.max(peak, Math.abs(b.readInt16LE(j * 2)) / 32768)
      d.waveform.push(peak)
    }

    await unlink(tmp)
  }

  await writeFile(path.join(root, 'cache', `${a.id}.json`), JSON.stringify(d))

  return d
}
