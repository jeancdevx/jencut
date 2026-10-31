import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const run = (bin, args) => execFileSync(bin, args, { encoding: 'utf8' }).trim()
const target = 'progress/evidence'

await mkdir(target, { recursive: true })
const pkg = JSON.parse(await readFile('package.json', 'utf8'))
const meta = JSON.parse(
  await readFile(path.join(target, 'h1-export.json'), 'utf8')
)
const jobSnapshot = run('docker', [
  'compose',
  'exec',
  '-T',
  'service',
  'cat',
  `/data/jobs/${meta.job.id}.json`
])
const captured = JSON.parse(jobSnapshot)

await writeFile(path.join(target, 'h1-job-snapshot.json'), jobSnapshot + '\n')
await writeFile(
  path.join(target, 'h1-ffmpeg.json'),
  run('docker', [
    'compose',
    'exec',
    '-T',
    'service',
    'cat',
    `/data/jobs/${meta.job.id}.ffmpeg.json`
  ]) + '\n'
)
const managed = captured.project.assets[0]
const actualHash = run('docker', [
  'compose',
  'exec',
  '-T',
  'service',
  'sha256sum',
  `/data/${managed.managedRelativePath}`
]).split(/\s/)[0]

if (actualHash !== meta.originalHash)
  throw new Error('El hash del original administrado no coincide.')
const sha = async file =>
  createHash('sha256')
    .update(await readFile(file))
    .digest('hex')
const codeHashes = {}

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)

    if (entry.isDirectory()) await walk(file)
    else if (/\.(tsx?|astro|css)$/.test(file))
      codeHashes[file] = await sha(file)
  }
}

await walk('src')
codeHashes['pnpm-lock.yaml'] = await sha('pnpm-lock.yaml')
const diagnostics = await (
  await fetch('http://127.0.0.1:4318/api/diagnostics')
).json()
const environment = {
  at: new Date().toISOString(),
  build: pkg.version,
  baseCommit: run('git', ['rev-parse', 'HEAD']),
  workingTree: true,
  node: process.version,
  pnpm: run('pnpm', ['--version']),
  platform: os.platform(),
  release: os.release(),
  arch: os.arch(),
  cpu: os.cpus()[0]?.model,
  cpuCount: os.cpus().length,
  totalMemoryBytes: os.totalmem(),
  docker: run('docker', ['version', '--format', '{{.Server.Version}}']),
  compose: run('docker', ['compose', 'version', '--short']),
  hostFfmpeg: run('ffmpeg', ['-version']).split('\n')[0],
  hostFfprobe: run('ffprobe', ['-version']).split('\n')[0],
  service: diagnostics,
  browser: meta.browser,
  dependencies: pkg.dependencies,
  devDependencies: pkg.devDependencies,
  codeHashes
}

await writeFile(
  path.join(target, 'environment.json'),
  JSON.stringify(environment, null, 2) + '\n'
)
meta.managedOriginalHashAfter = actualHash
meta.outputSha256 = await sha('.jencut/evidence/h1-export.mp4')
await writeFile(
  path.join(target, 'h1-export.json'),
  JSON.stringify(meta, null, 2) + '\n'
)
await cp(
  '.jencut/evidence/h1-export.mp4',
  '.jencut/evidence/verified-export.mp4'
)
console.log(
  `Evidence recorded: project ${meta.projectId}, revision ${meta.revision}, ${meta.job.inspection.frames} frames; original SHA-256 unchanged.`
)
