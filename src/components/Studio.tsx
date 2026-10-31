import {
  ArrowClockwiseIcon as ArrowClockwise,
  ArrowCounterClockwiseIcon as ArrowCounterClockwise,
  ArrowsOutIcon as ArrowsOut,
  CheckIcon as Check,
  ClockIcon as Clock,
  CopyIcon as Copy,
  DownloadSimpleIcon as DownloadSimple,
  EyeIcon as Eye,
  EyeSlashIcon as EyeSlash,
  FilmStripIcon as FilmStrip,
  FolderIcon as Folder,
  FolderOpenIcon as FolderOpen,
  GearIcon as Gear,
  GridFourIcon as GridFour,
  ImageIcon,
  KeyboardIcon as Keyboard,
  ListIcon as List,
  LockIcon as Lock,
  LockOpenIcon as LockOpen,
  MagnifyingGlassIcon as MagnifyingGlass,
  MinusIcon as Minus,
  MusicNotesIcon as MusicNotes,
  PauseIcon as Pause,
  PlayIcon as Play,
  PlusIcon as Plus,
  ScissorsIcon as Scissors,
  SkipBackIcon as SkipBack,
  SkipForwardIcon as SkipForward,
  SpeakerHighIcon as SpeakerHigh,
  SpeakerSlashIcon as SpeakerSlash,
  TrashIcon as Trash,
  UploadSimpleIcon as UploadSimple,
  XIcon as X
} from '@phosphor-icons/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import type {
  Command,
  Derivative,
  Job,
  Project,
  ProjectSummary
} from '../contracts/index.ts'
import { clipsOf, durationFrames, timecode } from '../domain/index.ts'

import { api, sessionId } from './api.ts'
import { ClipInspector as ClipEditor } from './editor/ClipInspector.tsx'
import { Alert, AlertDescription } from './ui/alert.tsx'
/* oxlint-disable jsx-a11y/media-has-caption -- Editing user media; subtitle authoring belongs to M2. */
import { Button } from './ui/button.tsx'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './ui/card.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from './ui/dialog.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu.tsx'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from './ui/empty.tsx'
import { Field, FieldDescription, FieldGroup, FieldLabel } from './ui/field.tsx'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from './ui/input-group.tsx'
import { Input } from './ui/input.tsx'
import { Label } from './ui/label.tsx'
import { NativeSelect } from './ui/native-select.tsx'
import { Progress } from './ui/progress.tsx'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from './ui/resizable.tsx'
import { ScrollArea } from './ui/scroll-area.tsx'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select.tsx'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from './ui/sidebar.tsx'
import { Skeleton } from './ui/skeleton.tsx'
import { Slider } from './ui/slider.tsx'
import { Switch } from './ui/switch.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.tsx'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group.tsx'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip.tsx'

import '../styles/global.css'

const assetURL = (id: string, kind = 'thumbnail') => `/api/assets/${id}/${kind}`
const initialId = () => new URLSearchParams(location.search).get('project')

export default function Studio() {
  const [deleteProject, setDeleteState] = useState<ProjectSummary | null>(null)
  const [projects, setProjects] = useState<ProjectSummary[]>([]),
    [project, setProject] = useState<Project | null>(null),
    [derivs, setDerivs] = useState<Record<string, Derivative>>({}),
    [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(''),
    [readOnly, setReadOnly] = useState(false),
    [tab, setTab] = useState('projects'),
    [search, setSearch] = useState(''),
    [filter, setFilter] = useState('all'),
    [list, setList] = useState(false)
  const [createOpen, setCreateOpen] = useState(false),
    [tracksOpen, setTracksOpen] = useState(false),
    [exportOpen, setExportOpen] = useState(false),
    [diagnostic, setDiagnostic] = useState<Record<string, unknown> | null>(
      null
    ),
    [help, setHelp] = useState(false)
  const [frame, setFrame] = useState(0),
    [presentedFrame, setPresentedFrame] = useState(-1),
    [playing, setPlaying] = useState(false),
    [preview, setPreview] = useState<Job | null>(null),
    [exportJob, setExportJob] = useState<Job | null>(null),
    [history, setHistory] = useState({ undo: 0, redo: 0 }),
    [zoom, setZoom] = useState(1),
    [snapping, setSnapping] = useState(true),
    [libraryVisible, setLibraryVisible] = useState(true),
    [inspectorVisible, setInspectorVisible] = useState(true)
  const [importStates, setImportStates] = useState<
      { name: string; state: string }[]
    >([]),
    [activeTrack, setActiveTrack] = useState('')
  const video = useRef<HTMLVideoElement>(null),
    upload = useRef<HTMLInputElement>(null),
    timeline = useRef<HTMLDivElement>(null),
    [timelineWidth, setTimelineWidth] = useState(900)
  const total = project ? durationFrames(project) : 0,
    clip = project ? clipsOf(project).find(c => c.id === selected) : undefined
  const refresh = useCallback(async () => {
    setProjects(await api<ProjectSummary[]>('/projects'))
  }, [])
  const load = useCallback(async (id: string) => {
    setBusy('Abriendo proyecto')
    setError('')

    try {
      const p = await api<Project>(`/projects/${id}`)

      historyReplace(id)
      setProject(p)
      const [derivatives, jobs] = await Promise.all([
        api<Record<string, Derivative>>(`/projects/${id}/derivatives`),
        api<Job[]>('/jobs')
      ])

      setDerivs(derivatives)
      setExportJob(
        jobs.filter(j => j.projectId === id && j.kind === 'export').at(-1) ??
          null
      )
      setSelected(null)
      setFrame(0)
      setPreview(null)
      setReadOnly(false)
      setActiveTrack(p.tracks.find(t => t.kind === 'visual')?.id ?? '')

      try {
        await api(`/projects/${id}/lease`, { sessionId })
      } catch (e) {
        setReadOnly(true)
        setError((e as Error).message)
      }

      setHistory(await api(`/projects/${id}/history`))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy('')
    }
  }, [])

  useEffect(() => {
    void Promise.resolve()
      .then(refresh)
      .catch(e => setError(e.message))
    const id = initialId()

    if (id) void Promise.resolve().then(() => load(id))
  }, [refresh, load])
  useEffect(() => {
    if (!project || readOnly) return
    const timer = setInterval(() => {
      void api(`/projects/${project.id}/lease`, { sessionId }).catch(e => {
        setReadOnly(true)
        setError(e.message)
      })
    }, 10000)

    return () => clearInterval(timer)
  }, [project, readOnly])
  useEffect(() => {
    const el = timeline.current

    if (!el) return
    const ro = new ResizeObserver(entries =>
      setTimelineWidth(entries[0].contentRect.width)
    )

    ro.observe(el)

    return () => ro.disconnect()
  }, [project?.id])
  const execute = useCallback(
    async (command: Command | 'undo' | 'redo') => {
      if (!project || busy || readOnly) return
      setBusy('Guardando')
      setError('')
      setPlaying(false)
      video.current?.pause()

      try {
        const next = await api<Project>(
          `/projects/${project.id}/${typeof command === 'string' ? command : 'commands'}`,
          {
            sessionId,
            expectedRevision: project.revision,
            ...(typeof command === 'string' ? {} : { command })
          }
        )

        setProject(next)
        setFrame(f => Math.min(f, Math.max(0, durationFrames(next) - 1)))
        setHistory(await api(`/projects/${next.id}/history`))

        if (selected && !clipsOf(next).some(c => c.id === selected))
          setSelected(null)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setBusy('')
      }
    },
    [project, busy, readOnly, selected]
  )

  useEffect(() => {
    if (!project || !total) {
      const clear = setTimeout(() => setPreview(null), 0)

      return () => clearTimeout(clear)
    }

    let stopped = false
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const job = await api<Job>(`/projects/${project.id}/exports`, {
          expectedRevision: project.revision,
          resolution: 720,
          kind: 'preview',
          idempotencyKey: `preview-${project.id}-${project.revision}`
        })

        if (!stopped) setPreview(job)
      } catch (e) {
        if (!stopped) setError((e as Error).message)
      }
    }, 700)

    return () => {
      stopped = true
      controller.abort()
      clearTimeout(timer)
    }
  }, [project, total])
  useEffect(() => {
    const pending = [preview, exportJob].filter(
      (j): j is Job =>
        !!j && !['completed', 'failed', 'cancelled'].includes(j.status)
    )

    if (!pending.length) return
    const timer = setInterval(() => {
      for (const j of pending)
        void api<Job>(`/jobs/${j.id}`)
          .then(next => {
            if (next.kind === 'preview')
              setPreview(current => (current?.id === next.id ? next : current))
            else
              setExportJob(current =>
                current?.id === next.id ? next : current
              )
          })
          .catch(e => setError(e.message))
    }, 500)

    return () => clearInterval(timer)
  }, [preview, exportJob])
  const seek = useCallback(
    (next: number) => {
      const f = Math.max(0, Math.min(Math.max(0, total - 1), Math.round(next)))

      setFrame(f)

      if (
        video.current &&
        preview?.status === 'completed' &&
        preview.revision === project?.revision &&
        preview.projectId === project?.id
      )
        video.current.currentTime = f / 30
    },
    [total, preview, project?.revision, project?.id]
  )
  const togglePlay = useCallback(() => {
    if (!video.current) return

    if (video.current.paused)
      void video.current.play().catch(e => setError(e.message))
    else video.current.pause()
  }, [])

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement

      if (
        target.closest(
          'input,textarea,select,[role=combobox],[role=slider],[role=dialog],[role=menu],[role=listbox]'
        ) ||
        createOpen ||
        exportOpen ||
        help
      )
        return

      if (e.code === 'Space') {
        if (target.closest('button') && !target.closest('.timeline-clip'))
          return
        e.preventDefault()
        togglePlay()
      } else if (
        e.key.toLowerCase() === 's' &&
        clip &&
        target.closest('.timeline')
      ) {
        e.preventDefault()
        void execute({ type: 'split', clipId: clip.id, frame })
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        seek(frame - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        seek(frame + 1)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        void execute(e.shiftKey ? 'redo' : 'undo')
      } else if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        clip &&
        target.closest('.timeline')
      ) {
        e.preventDefault()
        void execute({ type: 'delete', clipId: clip.id })
      }
    }

    window.addEventListener('keydown', key)

    return () => window.removeEventListener('keydown', key)
  }, [clip, frame, execute, seek, togglePlay, createOpen, exportOpen, help])

  async function importFiles(files: FileList | File[]) {
    if (!project || busy || readOnly) return
    setBusy('Importando e inspeccionando')
    setError('')
    let p = project
    const states = Array.from(files).map(f => ({
      name: f.name,
      state: 'Pendiente'
    }))

    setImportStates([...states])

    for (const [i, file] of Array.from(files).entries()) {
      states[i].state = 'Copiando e inspeccionando'
      setImportStates([...states])

      try {
        const data = new FormData()

        data.append('file', file)
        const res = await fetch(`/api/projects/${p.id}/import`, {
          method: 'POST',
          headers: {
            'x-jencut-client': 'jencut-local-v1',
            'x-jencut-session': sessionId,
            'x-jencut-revision': String(p.revision)
          },
          body: data
        })
        const result = await res.json()

        if (!res.ok) throw new Error(result.message)
        p = result.project
        setProject(p)
        setDerivs(d => ({ ...d, [result.asset.id]: result.derivative }))
        states[i].state = 'Disponible'
      } catch (e) {
        states[i].state = (e as Error).message
        setError(`${file.name}: ${(e as Error).message}`)
      }

      setImportStates([...states])
    }

    setBusy('')

    if (upload.current) upload.current.value = ''
  }

  async function back() {
    if (project)
      await api(`/projects/${project.id}/release`, { sessionId }).catch(
        () => {}
      )
    setProject(null)
    historyReplace(null)
    setSearch('')
    setError('')
    void refresh()
  }

  async function projectAction(
    p: ProjectSummary,
    action: 'duplicate' | 'trash' | 'restore'
  ) {
    try {
      await api(`/projects/${p.id}/${action}`, { sessionId })
      await refresh()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function addAsset(id: string) {
    if (!project) return
    const a = project.assets.find(a => a.id === id)!
    const t =
      project.tracks.find(
        t =>
          t.id === activeTrack && (t.kind === 'audio') === (a.kind === 'audio')
      ) ||
      project.tracks.find(t => (t.kind === 'audio') === (a.kind === 'audio'))

    if (t)
      void execute({
        type: 'add',
        assetId: id,
        trackId: t.id,
        startFrame: Math.max(
          0,
          ...t.clips.map(c => c.startFrame + c.durationFrames)
        )
      })
  }

  function dropClip(e: React.DragEvent<HTMLElement>, trackId: string) {
    e.preventDefault()

    if (!project) return

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/jencut'))
      const rect = e.currentTarget.getBoundingClientRect()
      let start = Math.max(
        0,
        Math.round((e.clientX - rect.left - data.offset) / pixelsPerFrame)
      )

      if (snapping) {
        const points = [
          frame,
          ...clipsOf(project)
            .filter(c => c.id !== data.clipId)
            .flatMap(c => [c.startFrame, c.startFrame + c.durationFrames])
        ]
        const closest = points.sort(
          (a, b) => Math.abs(a - start) - Math.abs(b - start)
        )[0]

        if (
          closest !== undefined &&
          Math.abs(closest - start) * pixelsPerFrame <= 6
        )
          start = closest
      }

      void execute({
        type: 'move',
        clipId: data.clipId,
        trackId,
        startFrame: start
      })
    } catch {
      setError('No se pudo mover el clip. Usa los campos del inspector.')
    }
  }

  const pixelsPerFrame = ((timelineWidth - 184) / Math.max(total, 90)) * zoom,
    contentWidth = Math.max(timelineWidth - 184, total * pixelsPerFrame)
  const ready =
    preview?.status === 'completed' &&
    preview.revision === project?.revision &&
    preview.projectId === project?.id

  useEffect(() => {
    const element = video.current

    if (!ready || !element || !element.requestVideoFrameCallback) return
    let handle: number
    const presented = (_now: number, metadata: VideoFrameCallbackMetadata) => {
      const actual = Math.max(
        0,
        Math.min(total - 1, Math.round(metadata.mediaTime * 30))
      )

      setPresentedFrame(actual)
      setFrame(actual)
      handle = element.requestVideoFrameCallback(presented)
    }

    handle = element.requestVideoFrameCallback(presented)

    return () => element.cancelVideoFrameCallback(handle)
  }, [ready, preview?.id, total])
  const currentAsset = clip && project?.assets.find(a => a.id === clip.assetId)

  return (
    <TooltipProvider delayDuration={400}>
      <div className='studio'>
        <a className='skip' href='#main'>
          Ir al contenido
        </a>
        <header className='topbar'>
          <img className='logo' src='/brand/logo-on-dark.svg' alt='Jencut' />
          <div className='breadcrumb'>
            {project ? (
              <>
                <Button onClick={() => void back()}>Proyectos</Button>
                <span>/</span>
                <strong>{project.name}</strong>
              </>
            ) : (
              <span>Mi estudio</span>
            )}
          </div>
          {project ? (
            <>
              <span
                className={`save-state ${busy ? 'muted' : ''}`}
                aria-live='polite'
              >
                {busy || readOnly ? (
                  busy || 'Solo lectura'
                ) : (
                  <>
                    <Check size={16} />
                    Guardado · r{project.revision}
                  </>
                )}
              </span>
              <div className='header-actions'>
                <IconButton
                  label='Deshacer'
                  disabled={!history.undo || !!busy || readOnly}
                  onClick={() => void execute('undo')}
                >
                  <ArrowCounterClockwise />
                </IconButton>
                <IconButton
                  label='Rehacer'
                  disabled={!history.redo || !!busy || readOnly}
                  onClick={() => void execute('redo')}
                >
                  <ArrowClockwise />
                </IconButton>
                <Button
                  className='primary'
                  disabled={!total || !!busy}
                  onClick={() => setExportOpen(true)}
                >
                  <UploadSimple />
                  Exportar
                </Button>
              </div>
            </>
          ) : (
            <span className='local-status'>
              <span />
              Espacio local
            </span>
          )}
        </header>
        {error && (
          <Alert variant='destructive' className='error-banner'>
            <AlertDescription>{error}</AlertDescription>
            <Button onClick={() => setError('')} aria-label='Cerrar error'>
              <X />
            </Button>
          </Alert>
        )}
        {!project ? (
          <SidebarProvider
            className='projects-layout'
            style={
              {
                '--sidebar-width': '208px',
                '--sidebar-width-icon': '64px'
              } as React.CSSProperties
            }
          >
            <Sidebar className='project-sidebar' collapsible='icon'>
              <SidebarHeader>
                <div className='studio-sidebar-header'>
                  <span className='sidebar-studio-label'>Mi estudio</span>
                  <SidebarTrigger />
                </div>
              </SidebarHeader>
              <SidebarContent>
                <nav aria-label='Mi estudio'>
                  <SidebarMenu>
                    {[
                      { value: 'projects', label: 'Proyectos', icon: Folder },
                      { value: 'recent', label: 'Recientes', icon: Clock },
                      { value: 'trash', label: 'Papelera', icon: Trash }
                    ].map(item => (
                      <SidebarMenuItem key={item.value}>
                        <SidebarMenuButton
                          isActive={tab === item.value}
                          tooltip={item.label}
                          aria-current={tab === item.value ? 'page' : undefined}
                          onClick={() => setTab(item.value)}
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </nav>
              </SidebarContent>
              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip='Diagnóstico'
                      onClick={() =>
                        void api<Record<string, unknown>>('/diagnostics')
                          .then(setDiagnostic)
                          .catch(e => setError(e.message))
                      }
                    >
                      <Gear />
                      <span>Diagnóstico</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip='Atajos'
                      onClick={() => setHelp(true)}
                    >
                      <Keyboard />
                      <span>Atajos</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
                <p className='sidebar-version'>Jencut 0.1 · M1 en desarrollo</p>
              </SidebarFooter>
            </Sidebar>
            <SidebarInset id='main' className='projects-main'>
              <div className='sidebar-toggle'>
                <SidebarTrigger />
                <span>Mi estudio</span>
              </div>

              <div className='welcome'>
                <div>
                  <h1>Tu estudio, a tu ritmo.</h1>
                  <p>Cada historia empieza con un primer corte.</p>
                </div>
                <img src='/mascot/jeni.png' alt='' className='welcome-jeni' />
                <Button
                  className='primary large'
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus />
                  Nuevo proyecto
                </Button>
              </div>
              {projects.filter(p => !p.trashedAt).length > 0 &&
                tab !== 'trash' && (
                  <Featured
                    project={projects.find(p => !p.trashedAt)!}
                    open={id => void load(id)}
                  />
                )}
              <div className='projects-toolbar'>
                <h2>{tab === 'trash' ? 'Papelera' : 'Tus proyectos'}</h2>
                <InputGroup className='search'>
                  <InputGroupAddon>
                    <MagnifyingGlass />
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-label='Buscar proyectos'
                    placeholder='Buscar proyectos…'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </InputGroup>
                <div className='segmented'>
                  <IconButton
                    label='Vista de cuadrícula'
                    onClick={() => setList(false)}
                    pressed={!list}
                  >
                    <GridFour />
                  </IconButton>
                  <IconButton
                    label='Vista de lista'
                    onClick={() => setList(true)}
                    pressed={list}
                  >
                    <List />
                  </IconButton>
                </div>
                <span className='muted'>Más recientes primero</span>
              </div>
              <div className={list ? 'project-list' : 'project-grid'}>
                {projects
                  .filter(p => (tab === 'trash' ? !!p.trashedAt : !p.trashedAt))
                  .filter(p =>
                    p.name
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase())
                  )
                  .slice(0, tab === 'recent' ? 6 : undefined)
                  .map(p => (
                    <Card
                      className='project-card'
                      key={p.id}
                      data-project-id={p.id}
                    >
                      <CardContent>
                        <Button
                          className='project-cover'
                          onClick={() => void load(p.id)}
                          aria-label={`Abrir ${p.name}`}
                        >
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt='' />
                          ) : (
                            <div className='empty-cover'>
                              <FilmStrip size={40} />
                              <span>
                                {p.durationFrames
                                  ? 'Montaje sin portada'
                                  : 'Tu próximo primer corte'}
                              </span>
                            </div>
                          )}
                          <span className='cover-ratio'>
                            {p.width === p.height
                              ? '1:1'
                              : p.width > p.height
                                ? '16:9'
                                : '9:16'}
                          </span>
                          <span className='cover-duration'>
                            {timecode(p.durationFrames)}
                          </span>
                        </Button>
                      </CardContent>
                      <CardHeader className='card-title'>
                        <CardTitle>
                          <Button onClick={() => void load(p.id)}>
                            {p.name}
                          </Button>
                        </CardTitle>
                        <div className='card-actions'>
                          <IconButton
                            label={`Duplicar ${p.name}`}
                            onClick={() => void projectAction(p, 'duplicate')}
                          >
                            <Copy />
                          </IconButton>
                          <IconButton
                            label={`${p.trashedAt ? 'Restaurar' : 'Enviar a papelera'} ${p.name}`}
                            onClick={() =>
                              p.trashedAt
                                ? void projectAction(p, 'restore')
                                : setDeleteProject(p)
                            }
                          >
                            <Trash />
                          </IconButton>
                        </div>
                      </CardHeader>
                      <CardFooter>
                        <CardDescription className='project-meta'>
                          <Clock size={14} />
                          {new Date(p.updatedAt).toLocaleDateString('es-PE')}
                          <span>
                            {p.width} × {p.height}
                          </span>
                          <span>30 fps · r{p.revision}</span>
                        </CardDescription>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
              {!projects.some(p =>
                tab === 'trash' ? !!p.trashedAt : !p.trashedAt
              ) && (
                <Empty className='empty-projects'>
                  <EmptyHeader>
                    <img src='/mascot/jeni.png' alt='' />
                    <EmptyTitle>
                      {tab === 'trash'
                        ? 'La papelera está vacía'
                        : 'Aquí empieza tu próxima historia'}
                    </EmptyTitle>
                    <EmptyDescription>
                      {tab === 'trash'
                        ? 'Los proyectos que envíes aquí se conservan para recuperarlos.'
                        : 'Crea un proyecto e importa tus videos. Tus originales permanecen intactos.'}
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    {tab !== 'trash' && (
                      <Button
                        className='primary'
                        onClick={() => setCreateOpen(true)}
                      >
                        <Plus />
                        Crear mi primer proyecto
                      </Button>
                    )}
                  </EmptyContent>
                </Empty>
              )}
              <footer className='projects-footer'>
                <span>
                  {projects.filter(p => !p.trashedAt).length} proyectos
                </span>
                <span>Procesamiento local · sin subir tus medios</span>
              </footer>
            </SidebarInset>
          </SidebarProvider>
        ) : (
          <main id='main' className='editor'>
            <h1 className='sr-only'>{project.name} · Editor de video</h1>
            <ResizablePanelGroup
              orientation='vertical'
              className='editor-panels'
            >
              <ResizablePanel id='workspace' defaultSize='62%' minSize={240}>
                <div
                  className={`workspace ${libraryVisible ? '' : 'hide-library'} ${inspectorVisible ? '' : 'hide-inspector'}`}
                >
                  <nav className='rail' aria-label='Herramientas'>
                    <Button
                      className={libraryVisible ? 'current' : ''}
                      onClick={() => setLibraryVisible(v => !v)}
                      title='Mostrar u ocultar medios'
                    >
                      <Folder size={22} />
                      <span>Medios</span>
                    </Button>
                    <Button
                      onClick={() => setInspectorVisible(v => !v)}
                      title='Mostrar u ocultar inspector'
                    >
                      <List size={22} />
                      <span>Inspector</span>
                    </Button>
                    <Button
                      onClick={() => {
                        setFilter('audio')
                        setLibraryVisible(true)
                      }}
                    >
                      <MusicNotes size={22} />
                      <span>Audio</span>
                    </Button>
                    <Button
                      onClick={() => {
                        setFilter('image')
                        setLibraryVisible(true)
                      }}
                    >
                      <ImageIcon size={22} />
                      <span>Imágenes</span>
                    </Button>
                    <Button
                      onClick={() =>
                        void api<Record<string, unknown>>('/diagnostics')
                          .then(setDiagnostic)
                          .catch(e => setError(e.message))
                      }
                    >
                      <Gear size={22} />
                      <span>Ajustes</span>
                    </Button>
                  </nav>
                  {libraryVisible && (
                    <aside className='library'>
                      <ScrollArea className='panel-scroll'>
                        <div className='panel-inner'>
                          <div className='panel-title'>
                            <h2>Recursos</h2>
                            <span className='muted'>
                              {project.assets.length}/30
                            </span>
                          </div>
                          <Button
                            className='primary import-button'
                            disabled={!!busy || readOnly}
                            onClick={() => upload.current?.click()}
                          >
                            <Plus />
                            Importar archivos
                          </Button>
                          <input
                            ref={upload}
                            tabIndex={-1}
                            type='file'
                            multiple
                            accept='.mp4,.mov,.mkv,.webm,.wav,.mp3,.m4a,.aac,.ogg,.png,.jpg,.jpeg'
                            className='sr-only'
                            aria-label='Seleccionar medios'
                            onChange={e =>
                              e.target.files && void importFiles(e.target.files)
                            }
                          />
                          <InputGroup className='search compact'>
                            <InputGroupAddon>
                              <MagnifyingGlass />
                            </InputGroupAddon>
                            <InputGroupInput
                              aria-label='Buscar recursos'
                              placeholder='Buscar en el proyecto…'
                              value={search}
                              onChange={e => setSearch(e.target.value)}
                            />
                          </InputGroup>
                          <ToggleGroup
                            type='single'
                            value={filter}
                            onValueChange={value => {
                              if (value) setFilter(value)
                            }}
                            className='tabs resource-filters'
                            aria-label='Filtrar recursos'
                          >
                            {[
                              ['all', 'Todo'],
                              ['video', 'Video'],
                              ['audio', 'Audio'],
                              ['image', 'Imagen']
                            ].map(([value, label]) => (
                              <ToggleGroupItem
                                key={value}
                                className={filter === value ? 'active' : ''}
                                value={value}
                              >
                                {label}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                          <div
                            className='asset-grid'
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => {
                              e.preventDefault()
                              void importFiles(e.dataTransfer.files)
                            }}
                          >
                            {project.assets
                              .filter(
                                a => filter === 'all' || a.kind === filter
                              )
                              .filter(a =>
                                (derivs[a.id]?.name ?? '')
                                  .toLowerCase()
                                  .includes(search.toLowerCase())
                              )
                              .map(a => (
                                <div className='asset-tile' key={a.id}>
                                  <Button
                                    className='asset'
                                    disabled={!!busy || readOnly}
                                    onClick={() => addAsset(a.id)}
                                    title='Añadir al final de la pista compatible'
                                  >
                                    <div
                                      className={`asset-preview ${a.kind === 'audio' ? 'audio' : ''}`}
                                    >
                                      {a.kind === 'audio' ? (
                                        <Wave
                                          peaks={derivs[a.id]?.waveform ?? []}
                                        />
                                      ) : (
                                        <img src={assetURL(a.id)} alt='' />
                                      )}
                                      <span>
                                        {timecode(
                                          Math.floor(
                                            (derivs[a.id]?.duration ?? 0) * 30
                                          )
                                        )}
                                      </span>
                                    </div>
                                    <span className='asset-name'>
                                      {derivs[a.id]?.name ?? a.id}
                                    </span>
                                    <span className='asset-add'>
                                      <Plus size={12} />
                                      Añadir a secuencia
                                    </span>
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant='ghost'
                                        className='resource-menu'
                                        size='icon'
                                        aria-label={`Opciones de ${derivs[a.id]?.name ?? 'recurso'}`}
                                        disabled={!!busy || readOnly}
                                      >
                                        <List />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end'>
                                      <DropdownMenuGroup>
                                        <DropdownMenuItem
                                          onSelect={() => addAsset(a.id)}
                                        >
                                          <Plus />
                                          Añadir a secuencia
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onSelect={() =>
                                            void execute({
                                              type: 'removeAsset',
                                              assetId: a.id
                                            })
                                          }
                                        >
                                          <Trash />
                                          Quitar del proyecto
                                        </DropdownMenuItem>
                                      </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ))}
                          </div>
                          {!project.assets.length && (
                            <div
                              className='empty-assets'
                              onDragOver={e => e.preventDefault()}
                              onDrop={e => {
                                e.preventDefault()
                                void importFiles(e.dataTransfer.files)
                              }}
                            >
                              <FolderOpen size={32} />
                              <p>Trae tu primera toma</p>
                              <span>
                                Arrastra archivos aquí o usa el botón de
                                importación.
                              </span>
                              <small>Hasta 512 MiB por archivo</small>
                            </div>
                          )}
                          {importStates.length > 0 && (
                            <div className='import-status' aria-live='polite'>
                              {!busy && (
                                <Button onClick={() => setImportStates([])}>
                                  Ocultar resultados de importación
                                </Button>
                              )}
                              {importStates.map((s, i) => (
                                <p key={i}>
                                  <strong>{s.name}</strong>
                                  <span>{s.state}</span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </aside>
                  )}
                  <section className='viewer' aria-label='Previsualización'>
                    <div
                      className='preview-stage'
                      data-presented-frame={ready ? presentedFrame : undefined}
                    >
                      {ready ? (
                        <video
                          ref={video}
                          src={`/api/jobs/${preview.id}/output`}
                          playsInline
                          preload='auto'
                          onPlay={() => setPlaying(true)}
                          onPause={() => setPlaying(false)}
                          onEnded={() => setPlaying(false)}
                          onLoadedData={() => {
                            if (video.current)
                              video.current.currentTime = frame / 30
                          }}
                          onTimeUpdate={() => {
                            if (video.current)
                              setFrame(
                                Math.min(
                                  total - 1,
                                  Math.round(video.current.currentTime * 30)
                                )
                              )
                          }}
                        />
                      ) : total ? (
                        <div className='preview-wait'>
                          <Skeleton className='skeleton preview-skeleton' />
                          <FilmStrip size={32} />
                          <h2>
                            {preview?.status === 'failed'
                              ? 'No se pudo preparar el preview'
                              : 'Preparando tu montaje'}
                          </h2>
                          <p>
                            {preview?.status === 'failed'
                              ? preview.error
                              : 'FFmpeg está generando el preview a 720p con los cortes y el audio reales.'}
                          </p>
                          <span>
                            {preview?.status === 'processing'
                              ? `${Math.floor(preview.progress)}%`
                              : 'En cola'}
                          </span>
                        </div>
                      ) : (
                        <div className='viewer-empty'>
                          <img src='/brand/symbol.svg' alt='' />
                          <h2>Una historia por contar</h2>
                          <p>Importa un medio y añádelo a la secuencia.</p>
                          <Button
                            onClick={() => upload.current?.click()}
                            disabled={!!busy || readOnly}
                          >
                            <Plus />
                            Importar mi primer medio
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className='transport'>
                      <div className='play-controls'>
                        <IconButton
                          label='Retroceder un frame'
                          disabled={!ready}
                          onClick={() => seek(frame - 1)}
                        >
                          <SkipBack weight='fill' />
                        </IconButton>
                        <IconButton
                          label={playing ? 'Pausar' : 'Reproducir'}
                          disabled={!ready}
                          onClick={togglePlay}
                        >
                          {playing ? (
                            <Pause weight='fill' />
                          ) : (
                            <Play weight='fill' />
                          )}
                        </IconButton>
                        <IconButton
                          label='Avanzar un frame'
                          disabled={!ready}
                          onClick={() => seek(frame + 1)}
                        >
                          <SkipForward weight='fill' />
                        </IconButton>
                      </div>
                      <span className='timecode'>
                        <strong>{timecode(frame)}</strong> / {timecode(total)}
                      </span>
                      <span className='preview-quality'>
                        720p · {ready ? 'Preview de montaje' : 'Preparando'}
                      </span>
                      <IconButton
                        label='Pantalla completa'
                        disabled={!ready}
                        onClick={() => void video.current?.requestFullscreen()}
                      >
                        <ArrowsOut />
                      </IconButton>
                    </div>
                    <div className='monitor-volume'>
                      <SpeakerHigh size={14} />
                      <Label>
                        Monitor
                        <Slider
                          className='monitor-slider'
                          aria-label='Volumen de monitor'
                          min={0}
                          max={1}
                          step={0.05}
                          defaultValue={[1]}
                          onValueChange={values => {
                            if (video.current) video.current.volume = values[0]
                          }}
                        />
                      </Label>
                    </div>
                  </section>
                  {inspectorVisible && (
                    <aside className='inspector'>
                      <ScrollArea className='panel-scroll'>
                        <div className='panel-inner'>
                          <h2>Inspector</h2>
                          {clip && currentAsset ? (
                            <>
                              <Tabs
                                value={
                                  clip.kind === 'audio' ? 'audio' : 'video'
                                }
                                onValueChange={kind => {
                                  const linked = clipsOf(project).find(
                                    c =>
                                      c.linkGroupId &&
                                      c.linkGroupId === clip.linkGroupId &&
                                      (c.kind === 'audio') ===
                                        (kind === 'audio')
                                  )

                                  if (linked) setSelected(linked.id)
                                }}
                              >
                                <TabsList
                                  variant='line'
                                  className='inspector-tabs'
                                >
                                  <TabsTrigger
                                    value='video'
                                    disabled={
                                      clip.kind === 'audio' && !clip.linkGroupId
                                    }
                                  >
                                    Video
                                  </TabsTrigger>
                                  <TabsTrigger
                                    value='audio'
                                    disabled={
                                      clip.kind !== 'audio' && !clip.linkGroupId
                                    }
                                  >
                                    Audio
                                  </TabsTrigger>
                                </TabsList>
                                <TabsContent
                                  value={
                                    clip.kind === 'audio' ? 'audio' : 'video'
                                  }
                                >
                                  <div className='selected-asset'>
                                    {currentAsset.kind === 'audio' ? (
                                      <MusicNotes size={32} />
                                    ) : (
                                      <img
                                        src={assetURL(currentAsset.id)}
                                        alt=''
                                      />
                                    )}
                                    <div>
                                      <strong>
                                        {derivs[currentAsset.id]?.name}
                                      </strong>
                                      <small>
                                        {clip.kind === 'audio'
                                          ? 'Audio'
                                          : 'Video'}{' '}
                                        ·{' '}
                                        {clip.linkGroupId
                                          ? 'Vinculado'
                                          : 'Independiente'}
                                      </small>
                                    </div>
                                  </div>
                                  <div className='inspector-section'>
                                    <h3>
                                      {clip.kind === 'audio'
                                        ? 'Audio de origen'
                                        : 'Medio de origen'}
                                    </h3>
                                    <dl>
                                      <dt>Codec</dt>
                                      <dd>
                                        {
                                          currentAsset.streams.find(
                                            s => s.index === clip.streamIndex
                                          )?.codec
                                        }
                                      </dd>
                                      <dt>
                                        {clip.kind === 'audio'
                                          ? 'Frecuencia'
                                          : 'Resolución'}
                                      </dt>
                                      <dd>
                                        {clip.kind === 'audio'
                                          ? `${currentAsset.streams.find(s => s.index === clip.streamIndex)?.sampleRate} Hz`
                                          : `${currentAsset.streams[0].width} × ${currentAsset.streams[0].height}`}
                                      </dd>
                                      <dt>Rango fuente</dt>
                                      <dd>
                                        {(
                                          (clip.sourceInPTS *
                                            clip.sourceTimeBase.num) /
                                          clip.sourceTimeBase.den
                                        ).toFixed(3)}{' '}
                                        s
                                      </dd>
                                      <dt>Duración colocada</dt>
                                      <dd>{timecode(clip.durationFrames)}</dd>
                                    </dl>
                                    {clip.kind === 'audio' && (
                                      <Wave
                                        peaks={
                                          derivs[currentAsset.id]?.waveform ??
                                          []
                                        }
                                      />
                                    )}
                                  </div>
                                  <ClipEditor
                                    key={`${clip.id}-${project.revision}`}
                                    clip={clip}
                                    project={project}
                                    disabled={!!busy || readOnly}
                                    execute={execute}
                                  />
                                  <div className='inspector-section source-note'>
                                    <Lock size={16} />
                                    <p>
                                      Edición no destructiva.
                                      <br />
                                      El original permanece intacto.
                                    </p>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </>
                          ) : (
                            <div className='inspector-empty'>
                              <List size={32} />
                              <h3>Todo empieza con una selección</h3>
                              <p>
                                Selecciona un clip de la secuencia para ajustar
                                su rango y posición.
                              </p>
                              <dl>
                                <dt>Formato</dt>
                                <dd>
                                  {project.canvas.width} ×{' '}
                                  {project.canvas.height}
                                </dd>
                                <dt>Fotogramas</dt>
                                <dd>30 fps CFR</dd>
                                <dt>Revisión</dt>
                                <dd>{project.revision}</dd>
                              </dl>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </aside>
                  )}
                </div>
              </ResizablePanel>
              <ResizableHandle
                className='timeline-resize'
                withHandle
                aria-label='Ajustar altura del timeline'
              />
              <ResizablePanel id='timeline' defaultSize='38%' minSize={240}>
                <section
                  className='timeline'
                  aria-label='Secuencia principal'
                  ref={timeline}
                >
                  <div className='timeline-toolbar'>
                    <Button
                      className='sequence-settings'
                      onClick={() => setTracksOpen(true)}
                      aria-label='Administrar pistas'
                    >
                      <List />
                      Secuencia principal
                    </Button>
                    <Button
                      disabled={
                        !clip ||
                        !!busy ||
                        readOnly ||
                        frame <= clip.startFrame ||
                        frame >= clip.startFrame + clip.durationFrames
                      }
                      onClick={() =>
                        clip &&
                        void execute({ type: 'split', clipId: clip.id, frame })
                      }
                    >
                      <Scissors />
                      Dividir <kbd>S</kbd>
                    </Button>
                    <Button
                      disabled={!clip || !!busy || readOnly}
                      onClick={() =>
                        clip &&
                        void execute({
                          type: 'duplicate',
                          clipId: clip.id,
                          trackId: clip.trackId,
                          startFrame: Math.max(
                            ...project.tracks
                              .find(t => t.id === clip.trackId)!
                              .clips.map(c => c.startFrame + c.durationFrames)
                          )
                        })
                      }
                    >
                      <Copy />
                      Duplicar
                    </Button>
                    <Label className='snapping-switch'>
                      <Switch
                        aria-label='Ajuste magnético'
                        checked={snapping}
                        onCheckedChange={setSnapping}
                      />
                      <span>Ajuste magnético</span>
                    </Label>
                    <Label className='frame-field'>
                      Frame
                      <Input
                        aria-label='Frame del cabezal'
                        type='number'
                        min='0'
                        max={Math.max(0, total - 1)}
                        value={frame}
                        onChange={e => seek(Number(e.target.value))}
                      />
                    </Label>
                    <Label className='zoom'>
                      <Minus size={14} />
                      <Slider
                        className='zoom-slider'
                        aria-label='Zoom del timeline'
                        min={1}
                        max={5}
                        step={0.25}
                        value={[zoom]}
                        onValueChange={values => setZoom(values[0])}
                      />
                      <Plus size={14} />
                      <span>{Math.round(zoom * 100)}%</span>
                    </Label>
                  </div>
                  <div className='timeline-scroller'>
                    <div style={{ minWidth: contentWidth + 184 }}>
                      <div className='ruler-row'>
                        <div className='track-label'>30 fps</div>
                        <div className='ruler' style={{ width: contentWidth }}>
                          <input
                            className='ruler-input'
                            type='range'
                            aria-label='Posición del cabezal'
                            min={0}
                            max={Math.max(total, 90) - 1}
                            value={frame}
                            onChange={e => seek(Number(e.target.value))}
                          />
                          {Array.from({ length: 7 }, (_, i) => (
                            <span key={i} style={{ left: `${(i / 6) * 100}%` }}>
                              {timecode(
                                Math.round((i / 6) * Math.max(total, 90))
                              ).slice(3)}
                            </span>
                          ))}
                          <div
                            className='ruler-head'
                            style={{ left: frame * pixelsPerFrame }}
                          >
                            {timecode(frame)}
                          </div>
                        </div>
                      </div>
                      {[...project.tracks]
                        .sort((a, b) =>
                          a.kind === b.kind
                            ? a.kind === 'visual'
                              ? b.order - a.order
                              : a.order - b.order
                            : a.kind === 'visual'
                              ? -1
                              : 1
                        )
                        .map(t => (
                          <div
                            className={`track-row ${t.kind} ${activeTrack === t.id ? 'active-track' : ''}`}
                            key={t.id}
                          >
                            <div className='track-label'>
                              <Button
                                className='track-name'
                                onClick={() => setActiveTrack(t.id)}
                                title='Seleccionar pista destino'
                              >
                                <strong>
                                  {t.kind === 'visual' ? 'V' : 'A'}
                                  {t.order + 1}
                                </strong>
                                <span>{t.name}</span>
                              </Button>
                              <IconButton
                                label={`${t.locked ? 'Desbloquear' : 'Bloquear'} ${t.name}`}
                                disabled={!!busy || readOnly}
                                onClick={() =>
                                  void execute({
                                    type: 'track',
                                    trackId: t.id,
                                    patch: { locked: !t.locked }
                                  })
                                }
                              >
                                {t.locked ? <Lock /> : <LockOpen />}
                              </IconButton>
                              <IconButton
                                label={`${t.kind === 'visual' ? (t.hidden ? 'Mostrar' : 'Ocultar') : t.muted ? 'Activar' : 'Silenciar'} ${t.name}`}
                                disabled={!!busy || readOnly}
                                onClick={() =>
                                  void execute({
                                    type: 'track',
                                    trackId: t.id,
                                    patch:
                                      t.kind === 'visual'
                                        ? { hidden: !t.hidden }
                                        : { muted: !t.muted }
                                  })
                                }
                              >
                                {t.kind === 'visual' ? (
                                  t.hidden ? (
                                    <EyeSlash />
                                  ) : (
                                    <Eye />
                                  )
                                ) : t.muted ? (
                                  <SpeakerSlash />
                                ) : (
                                  <SpeakerHigh />
                                )}
                              </IconButton>
                            </div>
                            <fieldset
                              className={`track-lane ${t.hidden || t.muted ? 'track-dimmed' : ''}`}
                              aria-label={`Clips de ${t.name}`}
                              style={{ width: contentWidth }}
                            >
                              <Button
                                onDragOver={e => {
                                  if (
                                    e.dataTransfer.types.includes(
                                      'application/jencut'
                                    )
                                  )
                                    e.preventDefault()
                                }}
                                onDrop={e => dropClip(e, t.id)}
                                className='lane-seek'
                                aria-label={`Colocar cabezal en ${t.name}`}
                                onClick={e => {
                                  const rect =
                                    e.currentTarget.getBoundingClientRect()

                                  seek((e.clientX - rect.left) / pixelsPerFrame)
                                  setActiveTrack(t.id)
                                }}
                              />
                              {!t.clips.length && (
                                <span className='lane-hint'>
                                  {t.kind === 'visual'
                                    ? 'Añade tus tomas aquí'
                                    : 'Añade un recurso de audio'}
                                </span>
                              )}
                              {t.clips.map(c => (
                                <Button
                                  onDragOver={e => {
                                    if (
                                      e.dataTransfer.types.includes(
                                        'application/jencut'
                                      )
                                    )
                                      e.preventDefault()
                                  }}
                                  onDrop={e => dropClip(e, t.id)}
                                  key={c.id}
                                  aria-label={`Seleccionar ${derivs[c.assetId]?.name ?? 'clip'} ${c.kind} ${timecode(c.startFrame)}`}
                                  aria-pressed={selected === c.id}
                                  className={`timeline-clip ${c.kind} ${selected === c.id ? 'selected' : ''}`}
                                  style={{
                                    left: c.startFrame * pixelsPerFrame,
                                    width: Math.max(
                                      4,
                                      c.durationFrames * pixelsPerFrame
                                    ),
                                    ...(c.kind !== 'audio'
                                      ? {
                                          backgroundImage: `url(${assetURL(c.assetId)})`
                                        }
                                      : {})
                                  }}
                                  onClick={e => {
                                    e.stopPropagation()
                                    setSelected(c.id)
                                    setActiveTrack(t.id)
                                  }}
                                  draggable={!busy && !readOnly && !t.locked}
                                  onDragStart={e =>
                                    e.dataTransfer.setData(
                                      'application/jencut',
                                      JSON.stringify({
                                        clipId: c.id,
                                        offset: e.nativeEvent.offsetX
                                      })
                                    )
                                  }
                                >
                                  <span className='clip-handle' />
                                  {c.kind === 'audio' && (
                                    <Wave
                                      peaks={derivs[c.assetId]?.waveform ?? []}
                                    />
                                  )}
                                  <span className='clip-title'>
                                    {derivs[c.assetId]?.name ?? 'Clip'}
                                  </span>
                                  <small>{timecode(c.durationFrames)}</small>
                                </Button>
                              ))}
                              <div
                                className='playhead'
                                style={{ left: frame * pixelsPerFrame }}
                              />
                            </fieldset>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className='track-add'>
                    <Button
                      disabled={
                        !!busy ||
                        readOnly ||
                        project.tracks.filter(t => t.kind === 'visual')
                          .length >= 4
                      }
                      onClick={() =>
                        void execute({ type: 'addTrack', kind: 'visual' })
                      }
                    >
                      <Plus />
                      Pista de video
                    </Button>
                    <Button
                      disabled={
                        !!busy ||
                        readOnly ||
                        project.tracks.filter(t => t.kind === 'audio').length >=
                          4
                      }
                      onClick={() =>
                        void execute({ type: 'addTrack', kind: 'audio' })
                      }
                    >
                      <Plus />
                      Pista de audio
                    </Button>
                  </div>
                </section>
              </ResizablePanel>
            </ResizablePanelGroup>
            <footer className='editor-footer'>
              <span>
                {project.canvas.width} × {project.canvas.height} · 30 fps{' '}
                <span className='divider'>|</span> Duración: {timecode(total)}
              </span>
              <span>
                <kbd>Space</kbd> Reproducir/Pausar <kbd>S</kbd> Dividir{' '}
                <kbd>← →</kbd> Un frame{' '}
                <Button onClick={() => setHelp(true)}>Atajos</Button>
              </span>
            </footer>
          </main>
        )}
        {tracksOpen && project && (
          <Modal
            title='Pistas de la secuencia'
            close={() => setTracksOpen(false)}
          >
            <TrackManager
              project={project}
              execute={execute}
              disabled={!!busy || readOnly}
            />
          </Modal>
        )}
        {createOpen && (
          <Modal title='Nuevo proyecto' close={() => setCreateOpen(false)}>
            <NewProject
              onCreate={async (name, ratio) => {
                setBusy('Creando')

                try {
                  const p = await api<Project>('/projects', { name, ratio })

                  setCreateOpen(false)
                  await refresh()
                  await load(p.id)
                } catch (e) {
                  setError((e as Error).message)
                } finally {
                  setBusy('')
                }
              }}
            />
          </Modal>
        )}
        {exportOpen && project && (
          <ExportModal
            project={project}
            job={exportJob}
            setJob={setExportJob}
            close={() => setExportOpen(false)}
            preview={ready ? `/api/jobs/${preview.id}/output` : undefined}
          />
        )}
        {diagnostic && (
          <Modal title='Diagnóstico local' close={() => setDiagnostic(null)}>
            <dl className='diagnostic'>
              {Object.entries(diagnostic).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{String(v)}</dd>
                </div>
              ))}
              <div>
                <dt>Navegador</dt>
                <dd>{navigator.userAgent}</dd>
              </div>
              <div>
                <dt>H.264 / AAC en navegador</dt>
                <dd>
                  {document
                    .createElement('video')
                    .canPlayType(
                      'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
                    ) || 'No anunciado'}
                </dd>
              </div>
            </dl>
          </Modal>
        )}
        {help && (
          <Modal title='Atajos de edición' close={() => setHelp(false)}>
            <dl className='shortcut-list'>
              <dt>Reproducir o pausar</dt>
              <dd>Space</dd>
              <dt>Dividir en el cabezal</dt>
              <dd>S</dd>
              <dt>Avanzar o retroceder un frame</dt>
              <dd>← / →</dd>
              <dt>Deshacer</dt>
              <dd>Ctrl / ⌘ Z</dd>
              <dt>Rehacer</dt>
              <dd>Ctrl / ⌘ Shift Z</dd>
              <dt>Eliminar dejando hueco</dt>
              <dd>Delete</dd>
            </dl>
            <p>
              Los atajos se aplican al editor, fuera de campos de texto y
              diálogos.
            </p>
          </Modal>
        )}
        {deleteProject && (
          <Modal
            title='Enviar proyecto a la papelera'
            close={() => setDeleteProject(null)}
          >
            <p>
              «{deleteProject.name}» se ocultará de tus proyectos. El montaje y
              los medios se conservan y puedes restaurarlo desde Papelera. Esta
              versión no elimina medios automáticamente.
            </p>
            <div className='modal-actions'>
              <Button onClick={() => setDeleteProject(null)}>
                Conservar proyecto
              </Button>
              <Button
                className='danger'
                onClick={() => {
                  void projectAction(deleteProject, 'trash')
                  setDeleteProject(null)
                }}
              >
                Enviar a papelera
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </TooltipProvider>
  )

  function setDeleteProject(p: ProjectSummary | null) {
    setDeleteState(p)
  }
}

function historyReplace(id: string | null) {
  window.history.replaceState({}, '', id ? `/?project=${id}` : '/')
}

function IconButton({
  label,
  children,
  disabled,
  onClick,
  pressed
}: {
  label: string
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
  pressed?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='icon-button'
          aria-label={label}
          title={label}
          disabled={disabled}
          onClick={onClick}
          aria-pressed={pressed}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function Wave({ peaks }: { peaks: number[] }) {
  if (!peaks.length)
    return <span className='wave-unavailable'>Sin forma de onda</span>
  const peak = Math.max(...peaks, 0.000001)

  return (
    <svg
      className='waveform'
      viewBox='0 0 320 48'
      preserveAspectRatio='none'
      aria-label='Forma de onda normalizada del medio'
    >
      <path
        d={peaks
          .map(
            (v, i) =>
              `M${(i / peaks.length) * 320},${24 - (v / peak) * 22}v${(v / peak) * 44}`
          )
          .join(' ')}
        stroke='currentColor'
        strokeWidth='1.4'
      />
    </svg>
  )
}

function Featured({
  project: p,
  open
}: {
  project: ProjectSummary
  open: (id: string) => void
}) {
  return (
    <Card className='featured'>
      <CardContent className='featured-cover'>
        {p.thumbnail ? (
          <img src={p.thumbnail} alt='' />
        ) : (
          <div className='empty-cover'>
            <FilmStrip size={64} />
            <span>
              {p.durationFrames
                ? 'Tu montaje, en progreso'
                : 'Cada historia empieza aquí'}
            </span>
          </div>
        )}
        <CardHeader className='featured-name'>
          <CardDescription>Continuar editando</CardDescription>
          <CardTitle>{p.name}</CardTitle>
        </CardHeader>
      </CardContent>
      <CardContent className='featured-detail'>
        <div className='feature-specs'>
          <span>
            <Clock />
            {timecode(p.durationFrames)}
          </span>
          <span>
            <FilmStrip />
            {p.width} × {p.height}
          </span>
          <span>30 fps</span>
        </div>
        <div className='project-facts'>
          <FolderOpen size={28} />
          <p>Tu proyecto está guardado en este equipo.</p>
          <span>
            Revisión {p.revision} ·{' '}
            {new Date(p.updatedAt).toLocaleString('es-PE')}
          </span>
        </div>
        <CardFooter>
          <Button className='primary large' onClick={() => open(p.id)}>
            <Play weight='fill' />
            Continuar edición
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  )
}

function Modal({
  title,
  children,
  close,
  wide = false
}: {
  title: string
  children: React.ReactNode
  close: () => void
  wide?: boolean
}) {
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement
  }, [])

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open) close()
      }}
    >
      <DialogContent
        className={wide ? 'jencut-modal wide' : 'jencut-modal'}
        aria-describedby={undefined}
        onCloseAutoFocus={e => {
          e.preventDefault()
          previousFocus.current?.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

function NewProject({
  onCreate
}: {
  onCreate: (name: string, ratio: string) => Promise<void>
}) {
  const [name, setName] = useState('Mi primera historia'),
    [ratio, setRatio] = useState('16:9'),
    [saving, setSaving] = useState(false),
    [touched, setTouched] = useState(false)
  const invalid =
    touched &&
    (!name.trim() ||
      name.length > 80 ||
      Array.from(name).some(
        char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127
      ))

  return (
    <form
      className='create-form'
      onSubmit={e => {
        e.preventDefault()
        setTouched(true)

        if (!name.trim() || invalid || saving) return
        setSaving(true)
        void onCreate(name, ratio).finally(() => setSaving(false))
      }}
    >
      <p>Un espacio para montar tus ideas, sin modificar los originales.</p>
      <FieldGroup>
        <Field data-invalid={invalid}>
          <FieldLabel htmlFor='project-name'>Nombre del proyecto</FieldLabel>
          <Input
            id='project-name'
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            minLength={1}
            maxLength={80}
            required
            aria-invalid={invalid}
            aria-describedby='project-name-help'
          />
          <FieldDescription id='project-name-help'>
            {invalid
              ? 'Escribe entre 1 y 80 caracteres, sin caracteres de control.'
              : 'Puedes usar el mismo nombre para proyectos distintos.'}
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor='project-format'>Formato</FieldLabel>
          <Select value={ratio} onValueChange={setRatio}>
            <SelectTrigger
              id='project-format'
              aria-label='Formato del proyecto'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position='popper'>
              <SelectGroup>
                <SelectItem value='16:9'>
                  Horizontal · 16:9 · 1920 × 1080
                </SelectItem>
                <SelectItem value='9:16'>
                  Vertical · 9:16 · 1080 × 1920
                </SelectItem>
                <SelectItem value='1:1'>
                  Cuadrado · 1:1 · 1080 × 1080
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>
            30 fps CFR · audio a 48 kHz · procesamiento local
          </FieldDescription>
        </Field>
      </FieldGroup>
      <div className='project-format-preview'>
        <div className='format-outline' data-ratio={ratio}>
          <FilmStrip />
        </div>
        <div>
          <strong>
            {ratio === '16:9'
              ? 'Una mirada panorámica'
              : ratio === '9:16'
                ? 'Una historia en vertical'
                : 'Un encuadre equilibrado'}
          </strong>
          <p>
            {ratio === '16:9'
              ? 'Para piezas horizontales y pantallas.'
              : ratio === '9:16'
                ? 'Para pantallas verticales.'
                : 'Para composiciones cuadradas.'}
          </p>
        </div>
      </div>
      <Button
        className='primary'
        type='submit'
        disabled={!name.trim() || invalid || saving}
      >
        <Plus data-icon='inline-start' />
        {saving ? 'Creando proyecto…' : 'Crear proyecto'}
      </Button>
    </form>
  )
}

function ExportModal({
  project: p,
  job,
  setJob,
  close,
  preview
}: {
  project: Project
  job: Job | null
  setJob: (j: Job) => void
  close: () => void
  preview?: string
}) {
  const [resolution, setResolution] = useState<720 | 1080>(1080),
    [preflight, setPreflight] = useState<{
      media: boolean
      disk: boolean
      montage: boolean
    } | null>(null),
    [error, setError] = useState(''),
    [starting, setStarting] = useState(false)
  const total = durationFrames(p),
    running = job && !['completed', 'failed', 'cancelled'].includes(job.status)

  useEffect(() => {
    void api<{ media: boolean; disk: boolean; montage: boolean }>(
      `/projects/${p.id}/preflight`
    )
      .then(setPreflight)
      .catch(e => setError(e.message))
  }, [p.id, p.revision])

  async function start() {
    setStarting(true)
    setError('')

    try {
      setJob(
        await api<Job>(`/projects/${p.id}/exports`, {
          expectedRevision: p.revision,
          resolution,
          kind: 'export',
          idempotencyKey: crypto.randomUUID()
        })
      )
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setStarting(false)
    }
  }

  const width =
      p.canvas.width >= p.canvas.height
        ? Math.round(((p.canvas.width / p.canvas.height) * resolution) / 2) * 2
        : resolution,
    height =
      p.canvas.width >= p.canvas.height
        ? resolution
        : Math.round(((p.canvas.height / p.canvas.width) * resolution) / 2) * 2

  return (
    <Modal title='Exportar video' close={close} wide>
      <p className='export-subtitle'>
        {p.name} · Revisión {p.revision}
      </p>
      <div className='export-columns'>
        <div className='export-left'>
          {preview ? (
            <video
              className='export-preview'
              src={preview}
              preload='metadata'
              muted
              playsInline
            />
          ) : (
            <div className='export-preview empty-cover'>
              <FilmStrip size={48} />
              <span>Montaje de {timecode(total)}</span>
            </div>
          )}
          <div className='export-facts'>
            <span>
              <Clock />
              Duración<strong>{timecode(total)}</strong>
            </span>
            <span>
              <FilmStrip />
              Formato
              <strong>
                {p.canvas.width === p.canvas.height
                  ? '1:1'
                  : p.canvas.width > p.canvas.height
                    ? '16:9'
                    : '9:16'}
              </strong>
            </span>
            <span>
              Fotogramas<strong>30 fps</strong>
            </span>
          </div>
          <div className='jeni-export'>
            <img src='/mascot/jeni.png' alt='' />
            <div>
              <h3>
                {job?.status === 'completed'
                  ? 'Tu historia ya tiene archivo final.'
                  : running
                    ? 'Tu montaje está en proceso.'
                    : 'Cada corte, tal como lo pensaste.'}
              </h3>
              <p>
                {job?.status === 'completed'
                  ? 'El archivo pasó la inspección de duración, video y audio.'
                  : running
                    ? 'Puedes volver al editor. El servicio continúa con esta revisión.'
                    : 'La exportación usa los originales y conserva tu proyecto.'}
              </p>
            </div>
          </div>
        </div>
        <div className='export-right'>
          <Label>
            Perfil
            <NativeSelect disabled>
              <option>MP4 · H.264 + AAC</option>
            </NativeSelect>
          </Label>
          <p id='resolution-label'>Resolución</p>
          <ToggleGroup
            type='single'
            value={String(resolution)}
            onValueChange={value => {
              if (value) setResolution(Number(value) as 720 | 1080)
            }}
            className='resolution-options'
            aria-labelledby='resolution-label'
            disabled={!!running}
          >
            <ToggleGroupItem value='1080'>1080p</ToggleGroupItem>
            <ToggleGroupItem value='720'>720p</ToggleGroupItem>
          </ToggleGroup>
          <p className='export-dimensions'>
            {width} × {height} · 30 fps CFR
          </p>
          <Label>
            Destino
            <input
              readOnly
              value={
                job
                  ? `renders/${job.id}.mp4`
                  : 'renders/ · nombre único al crear el trabajo'
              }
            />
          </Label>
          <p className='muted'>
            Tamaño aproximado: {((total / 30) * 1.5).toFixed(1)} MB
          </p>
          <div className='preflight'>
            <h3>Antes de exportar</h3>
            {preflight ? (
              <>
                <p>
                  <Check />
                  Medios disponibles
                </p>
                <p>
                  <Check />
                  Espacio suficiente
                </p>
                <p>
                  <Check />
                  Montaje válido
                </p>
              </>
            ) : (
              <p>{error || 'Comprobando medios, montaje y espacio…'}</p>
            )}
          </div>
          {job && (
            <div className='job-state' aria-live='polite'>
              <strong>
                {
                  {
                    pending: 'En cola',
                    processing: 'Exportando',
                    verifying: 'Inspeccionando salida',
                    completed: 'Exportación verificada',
                    failed: 'La exportación falló',
                    cancelled: 'Exportación cancelada'
                  }[job.status]
                }
              </strong>
              <Progress value={job.progress} aria-label='Progreso del render' />
              <span>
                {Math.floor(job.progress)}% · revisión {job.revision}
              </span>
              {job.error && <p className='inline-error'>{job.error}</p>}
              {job.inspection && (
                <p>
                  {job.inspection.width} × {job.inspection.height} ·{' '}
                  {job.inspection.frames} frames ·{' '}
                  {job.inspection.audio.toUpperCase()}{' '}
                  {job.inspection.sampleRate} Hz
                </p>
              )}
            </div>
          )}
          {error && (
            <p role='alert' className='inline-error'>
              {error}
            </p>
          )}
        </div>
      </div>
      {job && job.revision !== p.revision && (
        <p className='muted'>
          El trabajo mostrado pertenece a la revisión {job.revision}. El montaje
          actual está en la revisión {p.revision}.
        </p>
      )}
      <div className='export-actions'>
        <Button variant='outline' onClick={close}>
          Volver al editor
        </Button>
        {running ? (
          <Button
            variant='outline'
            onClick={() =>
              void api<Job>(`/jobs/${job.id}/cancel`, {})
                .then(setJob)
                .catch(e => setError(e.message))
            }
          >
            Cancelar render
          </Button>
        ) : job?.status === 'completed' ? (
          <>
            <a
              className='primary button-link'
              href={`/api/jobs/${job.id}/output?download`}
              download
            >
              <DownloadSimple />
              Descargar MP4
            </a>
            {job.revision !== p.revision && (
              <Button
                className='primary'
                disabled={!preflight || starting}
                onClick={() => void start()}
              >
                Exportar esta revisión
              </Button>
            )}
          </>
        ) : (
          <Button
            className='primary'
            disabled={!preflight || starting}
            onClick={() => void start()}
          >
            <UploadSimple />
            {starting
              ? 'Creando trabajo…'
              : job
                ? 'Volver a exportar'
                : 'Exportar video'}
          </Button>
        )}
      </div>
    </Modal>
  )
}

function TrackManager({
  project: p,
  execute,
  disabled
}: {
  project: Project
  execute: (cmd: Command) => Promise<void>
  disabled: boolean
}) {
  return (
    <div className='track-manager'>
      <p>
        Hasta cuatro pistas de video y cuatro de audio. El orden visual
        determina qué pista se compone encima.
      </p>
      {(['visual', 'audio'] as const).map(kind => (
        <section key={kind}>
          <h3>{kind === 'visual' ? 'Pistas de video' : 'Pistas de audio'}</h3>
          {p.tracks
            .filter(t => t.kind === kind)
            .sort((a, b) => a.order - b.order)
            .map(t => (
              <form
                key={`${t.id}-${p.revision}`}
                onSubmit={e => {
                  e.preventDefault()
                  const name = new FormData(e.currentTarget).get(
                    'name'
                  ) as string

                  void execute({
                    type: 'track',
                    trackId: t.id,
                    patch: { name }
                  })
                }}
              >
                <Label>
                  Nombre de {kind === 'visual' ? 'V' : 'A'}
                  {t.order + 1}
                  <Input
                    name='name'
                    defaultValue={t.name}
                    required
                    maxLength={160}
                    disabled={disabled}
                  />
                </Label>
                <div>
                  <Button type='submit' variant='outline' disabled={disabled}>
                    Renombrar
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    disabled={disabled || t.order === 0}
                    onClick={() =>
                      void execute({
                        type: 'track',
                        trackId: t.id,
                        patch: { order: t.order - 1 }
                      })
                    }
                  >
                    Subir
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    disabled={
                      disabled ||
                      t.order ===
                        p.tracks.filter(other => other.kind === kind).length - 1
                    }
                    onClick={() =>
                      void execute({
                        type: 'track',
                        trackId: t.id,
                        patch: { order: t.order + 1 }
                      })
                    }
                  >
                    Bajar
                  </Button>
                </div>
              </form>
            ))}
          <Button
            variant='outline'
            disabled={
              disabled || p.tracks.filter(t => t.kind === kind).length >= 4
            }
            onClick={() => void execute({ type: 'addTrack', kind })}
          >
            <Plus />
            Añadir pista
          </Button>
        </section>
      ))}
    </div>
  )
}
