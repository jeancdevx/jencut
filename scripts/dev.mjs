import { spawnSync } from 'node:child_process'

const action = process.argv[2] ?? 'start'
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

function command(bin, args) {
  const r = spawnSync(bin, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  })

  if (r.status !== 0) process.exit(r.status ?? 1)
}

if (action === 'start') {
  command('docker', ['compose', 'up', '-d', '--build'])
  command(pnpm, [
    'exec',
    'astro',
    'dev',
    '--background',
    '--host',
    '127.0.0.1',
    '--port',
    '4321'
  ])
} else if (action === 'stop') {
  command(pnpm, ['exec', 'astro', 'dev', 'stop'])
  command('docker', ['compose', 'stop', 'service'])
} else if (action === 'status') {
  command('docker', ['compose', 'ps'])
  command(pnpm, ['exec', 'astro', 'dev', 'status'])
} else if (action === 'logs') {
  command('docker', ['compose', 'logs', '--tail', '40', 'service'])
  command(pnpm, ['exec', 'astro', 'dev', 'logs'])
} else if (action === 'preview') {
  command('docker', ['compose', 'up', '-d'])
  command(pnpm, [
    'exec',
    'astro',
    'preview',
    '--background',
    '--host',
    '127.0.0.1',
    '--port',
    '4173'
  ])
} else {
  console.error(`Acción desconocida: ${action}`)
  process.exit(1)
}
