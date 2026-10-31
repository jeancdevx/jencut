import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const manifest = JSON.parse(
  await readFile(
    new URL('../fixtures/smoke/fixture-manifest.json', import.meta.url),
    'utf8'
  )
)

for (const f of manifest.files) {
  const data = await readFile(
    new URL(`../fixtures/smoke/${f.name}`, import.meta.url)
  )

  if (createHash('sha256').update(data).digest('hex') !== f.sha256)
    throw new Error(`Hash incorrecto: ${f.name}`)
  console.log(`OK ${f.name} (${data.length} bytes)`)
}
