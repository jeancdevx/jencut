import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

const fixtures = new URL('../../fixtures/smoke/', import.meta.url).pathname
const evidence = new URL('../../progress/evidence/', import.meta.url).pathname

test('H1 through real UI: import, preview, split, undo/redo, trim, reopen and inspected MP4', async ({
  page
}) => {
  const errors: string[] = []

  page.on('pageerror', e => errors.push(e.message))
  await mkdir(evidence, { recursive: true })
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Tu estudio, a tu ritmo.' })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Nuevo proyecto', exact: true })
    .click()
  await page
    .getByLabel('Nombre del proyecto')
    .fill('Estudio de color · montaje H1')
  await page.getByRole('combobox', { name: 'Formato del proyecto' }).click()
  await page
    .getByRole('option', { name: 'Vertical · 9:16 · 1080 × 1920', exact: true })
    .click()
  await expect(page.locator('.format-outline')).toHaveAttribute(
    'data-ratio',
    '9:16'
  )
  await page.getByRole('combobox', { name: 'Formato del proyecto' }).click()
  await page
    .getByRole('option', {
      name: 'Horizontal · 16:9 · 1920 × 1080',
      exact: true
    })
    .click()
  await page.screenshot({
    path: evidence + 'create-project.png',
    fullPage: false
  })
  await page
    .getByRole('button', { name: 'Crear proyecto', exact: true })
    .click()
  await expect(page.getByRole('heading', { name: 'Recursos' })).toBeVisible()
  await expect(page).toHaveURL(/\?project=/)
  const url = page.url(),
    id = new URL(url).searchParams.get('project')!
  const fileChooser = page.waitForEvent('filechooser')

  await page
    .getByRole('button', { name: 'Importar archivos', exact: true })
    .click()
  await (
    await fileChooser
  ).setFiles([fixtures + 'invalid-media.mp4', fixtures + 'clip-with-audio.mp4'])
  await expect(page.locator('.asset')).toHaveCount(1)
  await expect(
    page.getByRole('button', { name: 'Importar archivos' })
  ).toBeEnabled()
  await expect(page.getByRole('alert')).toContainText(
    'No se puede leer el medio'
  )
  await page.getByRole('button', { name: 'Cerrar error' }).click()
  await page
    .getByRole('button', { name: 'Ocultar resultados de importación' })
    .click()
  await page.locator('.asset').click()
  await expect(page.locator('.timeline-clip.video')).toHaveCount(1)
  await expect(page.locator('.timeline-clip.audio')).toHaveCount(1)
  await expect(
    page.getByRole('button', { name: 'Reproducir', exact: true })
  ).toBeEnabled({ timeout: 90000 })
  await expect
    .poll(() =>
      page
        .locator('.preview-stage video')
        .evaluate((v: HTMLVideoElement) => v.readyState)
    )
    .toBeGreaterThanOrEqual(2)
  await page.getByRole('button', { name: 'Reproducir', exact: true }).click()
  await expect
    .poll(() =>
      page
        .locator('.preview-stage video')
        .evaluate((v: HTMLVideoElement) => v.currentTime)
    )
    .toBeGreaterThan(0.05)
  await page.getByRole('button', { name: 'Pausar', exact: true }).click()
  await page.locator('.timeline-clip.video').click()
  await page.getByLabel('Frame del cabezal').fill('45')
  await page.locator('.timeline-clip.video').click()
  await expect(page.locator('.preview-stage')).toHaveAttribute(
    'data-presented-frame',
    '45'
  )
  await page.keyboard.press('s')
  await expect(page.locator('.timeline-clip.video')).toHaveCount(2)
  await page.getByRole('button', { name: 'Deshacer', exact: true }).click()
  await expect(page.locator('.timeline-clip.video')).toHaveCount(1)
  await page.getByRole('button', { name: 'Rehacer', exact: true }).click()
  await expect(page.locator('.timeline-clip.video')).toHaveCount(2)
  await page.locator('.timeline-clip.video').nth(1).click()
  await page.getByLabel('OUT relativo').fill('36')
  await page.getByRole('button', { name: 'Aplicar recorte' }).click()
  await expect(page.locator('.save-state')).toContainText('Guardado')
  await expect(page.locator('.editor-footer')).toContainText('00:00:02:21')
  await expect(
    page.getByRole('button', { name: 'Reproducir', exact: true })
  ).toBeEnabled({ timeout: 90000 })
  await page.screenshot({ path: evidence + 'editor-1440.png', fullPage: true })
  await page.locator('.timeline-clip.audio').first().click()
  await page.screenshot({ path: evidence + 'audio-1440.png', fullPage: true })
  await page
    .locator('.inspector [data-slot=scroll-area-viewport]')
    .evaluate(el => (el.scrollTop = 0))
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.screenshot({ path: evidence + 'editor-1280.png', fullPage: true })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.getByRole('button', { name: 'Proyectos', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Tus proyectos' })
  ).toBeVisible()
  await page.screenshot({
    path: evidence + 'projects-1440.png',
    fullPage: true
  })
  await page.goto(url)
  await expect(page.locator('.timeline-clip.video')).toHaveCount(2)
  await expect(page.locator('.editor-footer')).toContainText('00:00:02:21')
  await expect(
    page.getByRole('button', { name: 'Reproducir', exact: true })
  ).toBeEnabled({ timeout: 90000 })
  await page.getByRole('button', { name: 'Exportar', exact: true }).click()
  const dialog = page.getByRole('dialog')

  await expect(dialog.getByText('Montaje válido')).toBeVisible()
  await dialog.getByRole('radio', { name: '720p', exact: true }).click()
  await page.screenshot({ path: evidence + 'export-1440.png', fullPage: true })
  await dialog
    .getByRole('button', { name: 'Exportar video', exact: true })
    .click()
  await expect(
    dialog.getByText('Exportación verificada', { exact: true })
  ).toBeVisible({ timeout: 90000 })
  await page.screenshot({
    path: evidence + 'export-completed.png',
    fullPage: true
  })
  const downloadPromise = page.waitForEvent('download')

  await dialog.getByRole('link', { name: 'Descargar MP4' }).click()
  const download = await downloadPromise

  await mkdir('.jencut/evidence', { recursive: true })
  const out = '.jencut/evidence/h1-export.mp4'

  await download.saveAs(out)
  const output = JSON.parse(
    execFileSync(
      'ffprobe',
      ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', out],
      { encoding: 'utf8' }
    )
  )
  const v = output.streams.find(
      (s: { codec_type: string }) => s.codec_type === 'video'
    ),
    a = output.streams.find(
      (s: { codec_type: string }) => s.codec_type === 'audio'
    )

  expect(v.codec_name).toBe('h264')
  expect(v.nb_frames).toBe('81')
  expect(v.width).toBe(1280)
  expect(v.height).toBe(720)
  expect(v.avg_frame_rate).toBe('30/1')
  expect(a.codec_name).toBe('aac')
  expect(a.sample_rate).toBe('48000')
  expect(Math.abs(Number(output.format.duration) - 2.7)).toBeLessThan(0.06)
  const jobs = await page.request.get(`/api/jobs`)
  const completed = (await jobs.json()).find(
    (j: { projectId: string; kind: string; status: string }) =>
      j.projectId === id && j.kind === 'export' && j.status === 'completed'
  )
  const p = await (await page.request.get(`/api/projects/${id}`)).json()
  const originalHash = createHash('sha256')
    .update(await readFile(fixtures + 'clip-with-audio.mp4'))
    .digest('hex')

  await writeFile(
    evidence + 'h1-export.json',
    JSON.stringify(
      {
        projectId: id,
        revision: p.revision,
        job: completed,
        expected: { duration: 2.7, frames: 81, width: 1280, height: 720 },
        output,
        originalHash,
        originalManifestHash: p.assets[0].contentHash,
        outputFile: out,
        browser: await page.evaluate(() => navigator.userAgent),
        pageErrors: errors
      },
      null,
      2
    )
  )
  expect(p.assets[0].contentHash).toBe(originalHash)
  expect(errors).toEqual([])
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await page.getByRole('button', { name: 'Proyectos', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Tus proyectos', exact: true })
  ).toBeVisible()
})

test('keyboard dialogs, real editor accessibility and desktop geometry', async ({
  page
}) => {
  const results: Record<string, unknown> = {}

  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Tu estudio, a tu ritmo.' })
  ).toBeVisible()
  results.projects = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze()
  await page
    .getByRole('button', { name: 'Nuevo proyecto', exact: true })
    .click()
  const dialog = page.getByRole('dialog')

  await expect(page.getByLabel('Nombre del proyecto')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Nuevo proyecto', exact: true })
  ).toBeFocused()
  const meta = JSON.parse(
    await readFile('progress/evidence/h1-export.json', 'utf8')
  )

  await page.goto(`/?project=${meta.projectId}`)
  await expect(page.locator('.timeline-clip.video')).toHaveCount(2)
  await expect(
    page.getByRole('button', { name: 'Reproducir', exact: true })
  ).toBeEnabled({ timeout: 90000 })
  results.editor = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze()

  for (const size of [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 }
  ]) {
    await page.setViewportSize(size)
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(size.width)
    const box = await page.locator('.timeline-clip.video').first().boundingBox()

    expect(box!.height).toBeGreaterThanOrEqual(44)
    const play = await page
      .getByRole('button', { name: 'Reproducir', exact: true })
      .boundingBox()

    expect(play!.y + play!.height).toBeLessThanOrEqual(size.height - 260)
    results[`geometry-${size.width}`] = { clip: box, play }
  }

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.getByRole('button', { name: 'Exportar', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  results.export = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze()
  await writeFile(
    'progress/evidence/accessibility.json',
    JSON.stringify(
      Object.fromEntries(
        Object.entries(results).map(([key, value]) => [
          key,
          value && typeof value === 'object' && 'violations' in value
            ? {
                violations: value.violations,
                passes:
                  'passes' in value && Array.isArray(value.passes)
                    ? value.passes.length
                    : 0
              }
            : value
        ])
      ),
      null,
      2
    )
  )

  for (const [name, result] of Object.entries(results)) {
    if (result && typeof result === 'object' && 'violations' in result)
      expect(
        (result as { violations: unknown[] }).violations,
        `${name} axe violations`
      ).toEqual([])
  }

  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Proyectos', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Tus proyectos', exact: true })
  ).toBeVisible()
})

test('H2 increment: tracks, atomic lock rejection, resource menu and independent project copy', async ({
  page
}) => {
  const meta = JSON.parse(
    await readFile('progress/evidence/h1-export.json', 'utf8')
  )

  await page.goto(`/?project=${meta.projectId}`)
  await expect(page.locator('.timeline-clip.video')).toHaveCount(2)
  await page.getByRole('button', { name: 'Administrar pistas' }).click()
  const dialog = page.getByRole('dialog')

  await dialog
    .getByRole('button', { name: 'Añadir pista', exact: true })
    .first()
    .click()
  await expect(dialog.getByLabel('Nombre de V2')).toBeVisible()
  await dialog.getByLabel('Nombre de V2').fill('Planos superiores')
  await dialog
    .locator('form')
    .filter({ has: page.getByLabel('Nombre de V2') })
    .getByRole('button', { name: 'Renombrar', exact: true })
    .click()
  await expect(dialog.getByLabel('Nombre de V2')).toHaveValue(
    'Planos superiores'
  )
  await page.keyboard.press('Escape')
  await page.locator('.timeline-clip.video').first().click()
  await page.getByRole('combobox', { name: 'Pista destino' }).click()
  await page
    .getByRole('option', { name: 'Planos superiores', exact: true })
    .click()
  await page.getByRole('button', { name: 'Mover clip', exact: true }).click()
  await expect(
    page
      .locator('.track-row')
      .filter({
        has: page.getByRole('button', {
          name: 'V2 Planos superiores',
          exact: true
        })
      })
      .locator('.timeline-clip.video')
  ).toHaveCount(1)
  await page
    .getByRole('button', { name: 'Bloquear Audio original', exact: true })
    .click()
  await expect(page.locator('.save-state')).toContainText('Guardado')
  const before = await (
    await page.request.get(`/api/projects/${meta.projectId}`)
  ).json()

  await page.getByLabel('Inicio del clip').fill('12')
  await page.getByRole('button', { name: 'Mover clip', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('bloqueada')
  const after = await (
    await page.request.get(`/api/projects/${meta.projectId}`)
  ).json()

  expect(after).toEqual(before)
  await page.getByRole('button', { name: 'Cerrar error' }).click()
  await page
    .getByRole('button', { name: 'Desbloquear Audio original', exact: true })
    .click()
  const fileChooser = page.waitForEvent('filechooser')

  await page
    .getByRole('button', { name: 'Importar archivos', exact: true })
    .click()
  await (await fileChooser).setFiles(fixtures + 'audio-44100-mono.wav')
  await expect(page.locator('.asset')).toHaveCount(2)
  await expect(
    page.getByRole('button', { name: 'Importar archivos' })
  ).toBeEnabled()
  await page
    .getByRole('button', {
      name: 'Opciones de audio-44100-mono.wav',
      exact: true
    })
    .click()
  await page
    .getByRole('menuitem', { name: 'Quitar del proyecto', exact: true })
    .click()
  await expect(page.locator('.asset')).toHaveCount(1)
  await page.getByRole('button', { name: 'Proyectos', exact: true }).click()
  const copyResponse = page.waitForResponse(
    r => r.url().endsWith('/duplicate') && r.request().method() === 'POST'
  )

  await page
    .locator(`[data-project-id="${meta.projectId}"]`)
    .getByRole('button', { name: /^Duplicar/ })
    .click()
  const copy = await (await copyResponse).json()
  const original = await (
    await page.request.get(`/api/projects/${meta.projectId}`)
  ).json()

  expect(copy.id).not.toBe(original.id)
  expect(copy.assets).toEqual(original.assets)
  expect(copy.tracks[0].id).not.toBe(original.tracks[0].id)
  await writeFile(
    evidence + 'h2-increment.json',
    JSON.stringify(
      {
        originalId: original.id,
        copyId: copy.id,
        originalRevision: original.revision,
        tracks: original.tracks.map(
          (t: {
            name: string
            kind: string
            order: number
            clips: unknown[]
          }) => ({
            name: t.name,
            kind: t.kind,
            order: t.order,
            clips: t.clips.length
          })
        ),
        atomicLockRejection: true,
        unusedResourceRemoved: true,
        sharedImmutableAsset: copy.assets[0].contentHash,
        newMontageIds: true
      },
      null,
      2
    )
  )
})
