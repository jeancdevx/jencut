import { ScissorsIcon, TrashIcon } from '@phosphor-icons/react'
import { useState } from 'react'

import type { Clip, Command, Project } from '../../contracts/index.ts'
import { Button } from '../ui/button.tsx'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '../ui/field.tsx'
import { Input } from '../ui/input.tsx'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select.tsx'
import { Switch } from '../ui/switch.tsx'

type Props = {
  clip: Clip
  project: Project
  disabled: boolean
  execute: (cmd: Command | 'undo' | 'redo') => Promise<void>
}

export function ClipInspector({ clip, project, disabled, execute }: Props) {
  const [inFrame, setIn] = useState(0),
    [outFrame, setOut] = useState(clip.durationFrames),
    [start, setStart] = useState(clip.startFrame),
    [track, setTrack] = useState(clip.trackId),
    [ripple, setRipple] = useState(false)

  const validTrim =
    Number.isSafeInteger(inFrame) &&
    Number.isSafeInteger(outFrame) &&
    inFrame >= 0 &&
    outFrame <= clip.durationFrames &&
    outFrame > inFrame
  const validStart = Number.isSafeInteger(start) && start >= 0 && start < 18000

  return (
    <>
      <form
        className='inspector-section'
        onSubmit={e => {
          e.preventDefault()

          if (validTrim)
            void execute({
              type: 'trim',
              clipId: clip.id,
              inFrames: inFrame,
              outFrames: outFrame
            })
        }}
      >
        <h3>
          <ScissorsIcon />
          Recorte
        </h3>
        <FieldGroup className='field-pair'>
          <Field data-invalid={!validTrim}>
            <FieldLabel htmlFor='trim-in'>IN · frames</FieldLabel>
            <Input
              id='trim-in'
              aria-label='IN relativo'
              aria-invalid={!validTrim}
              aria-describedby='trim-description'
              type='number'
              required
              min={0}
              max={clip.durationFrames - 1}
              value={inFrame}
              disabled={disabled}
              onChange={e => setIn(Number(e.target.value))}
            />
          </Field>
          <Field data-invalid={!validTrim}>
            <FieldLabel htmlFor='trim-out'>OUT · frames</FieldLabel>
            <Input
              id='trim-out'
              aria-label='OUT relativo'
              aria-invalid={!validTrim}
              aria-describedby='trim-description'
              type='number'
              required
              min={inFrame + 1}
              max={clip.durationFrames}
              value={outFrame}
              disabled={disabled}
              onChange={e => setOut(Number(e.target.value))}
            />
          </Field>
        </FieldGroup>
        <FieldDescription id='trim-description'>
          {validTrim
            ? `Rango relativo al clip seleccionado.${clip.linkGroupId ? ' Incluye su audio o video vinculado.' : ''}`
            : 'Conserva al menos un frame y mantén IN y OUT dentro del clip.'}
        </FieldDescription>
        <Button
          variant='outline'
          type='submit'
          disabled={
            disabled ||
            !validTrim ||
            (inFrame === 0 && outFrame === clip.durationFrames)
          }
        >
          Aplicar recorte
        </Button>
      </form>
      <form
        className='inspector-section'
        onSubmit={e => {
          e.preventDefault()

          if (validStart)
            void execute({
              type: 'move',
              clipId: clip.id,
              startFrame: start,
              trackId: track
            })
        }}
      >
        <h3>Posición en secuencia</h3>
        <FieldGroup>
          <Field data-invalid={!validStart}>
            <FieldLabel htmlFor='clip-start'>Inicio · frames</FieldLabel>
            <Input
              id='clip-start'
              aria-label='Inicio del clip'
              type='number'
              required
              min={0}
              max={17999}
              value={start}
              aria-invalid={!validStart}
              disabled={disabled}
              onChange={e => setStart(Number(e.target.value))}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor='clip-track'>Pista</FieldLabel>
            <Select value={track} onValueChange={setTrack} disabled={disabled}>
              <SelectTrigger id='clip-track' aria-label='Pista destino'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {project.tracks
                    .filter(
                      t => (t.kind === 'audio') === (clip.kind === 'audio')
                    )
                    .map(t => (
                      <SelectItem key={t.id} value={t.id} disabled={t.locked}>
                        {t.name}
                        {t.locked ? ' · bloqueada' : ''}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
        <Button
          variant='outline'
          type='submit'
          disabled={
            disabled ||
            !validStart ||
            (start === clip.startFrame && track === clip.trackId)
          }
        >
          Mover clip
        </Button>
      </form>
      <div className='inspector-section delete-section'>
        <Field orientation='horizontal'>
          <Switch
            id='ripple-delete'
            checked={ripple}
            onCheckedChange={setRipple}
            disabled={disabled}
          />
          <FieldContent>
            <FieldLabel htmlFor='ripple-delete'>
              Cerrar hueco en todas las pistas
            </FieldLabel>
            {ripple && (
              <FieldDescription>
                Afecta {project.tracks.map(t => t.name).join(', ')}. Se
                rechazará si un clip cruza el intervalo o una pista afectada
                está bloqueada.
              </FieldDescription>
            )}
          </FieldContent>
        </Field>
        <Button
          variant='destructive'
          className='danger'
          disabled={disabled}
          onClick={() =>
            void execute({ type: 'delete', clipId: clip.id, ripple })
          }
        >
          <TrashIcon data-icon='inline-start' />
          Eliminar {clip.linkGroupId ? 'grupo vinculado' : 'clip'}
        </Button>
      </div>
    </>
  )
}
