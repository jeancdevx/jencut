#!/usr/bin/env python3
"""Medios sintéticos para Jencut; requiere Python 3, FFmpeg y ffprobe, sin paquetes Python."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def run(args):
    p = subprocess.run(args, capture_output=True, text=True)
    if p.returncode:
        raise RuntimeError('Comando fallido: ' + args[0] + '\n' + p.stderr[-5000:])
    return p.stdout


def generate(output, profile):
    ffmpeg, ffprobe = shutil.which('ffmpeg'), shutil.which('ffprobe')
    if not ffmpeg or not ffprobe:
        raise RuntimeError('Se necesitan ffmpeg y ffprobe en PATH. No se descargan binarios automáticamente.')
    output.mkdir(parents=True, exist_ok=True)
    old_path = output / 'fixture-manifest.json'
    old = json.loads(old_path.read_text()) if old_path.exists() else {'files': []}
    old_files = {x['name']: x for x in old['files']}
    files = []

    def create(name, args, kind, seconds):
        path = output / name
        if path.exists():
            if name not in old_files or digest(path) != old_files[name]['sha256']:
                raise RuntimeError('No se sobrescribe un archivo existente sin identidad válida: ' + str(path))
        else:
            run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-n', *args, str(path)])
        probe = json.loads(run([ffprobe, '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path)]))
        files.append({'name': name, 'kind': kind, 'expectedDurationSeconds': seconds,
                      'sha256': digest(path), 'bytes': path.stat().st_size, 'probe': probe})

    duration = 3 if profile == 'smoke' else 12
    count = 1 if profile == 'smoke' else 5
    for i in range(count):
        name = 'clip-with-audio.mp4' if profile == 'smoke' else f'clip-{i+1:02}.mp4'
        create(name, ['-f', 'lavfi', '-i', 'testsrc2=size=1920x1080:rate=30',
                      '-f', 'lavfi', '-i', f'sine=frequency={440+i*110}:sample_rate=48000',
                      '-map', '0:v:0', '-map', '1:a:0', '-t', str(duration),
                      '-vf', f'hue=h={i*35}', '-af', 'volume=0.1', '-c:v', 'libx264',
                      '-preset', 'ultrafast', '-crf', '28', '-pix_fmt', 'yuv420p',
                      '-threads', '2', '-c:a', 'aac', '-ar', '48000', '-ac', '2',
                      '-movflags', '+faststart'], 'video_audio', duration)

    create('clip-no-audio.mp4', ['-f', 'lavfi', '-i', 'testsrc2=size=1920x1080:rate=30',
                               '-t', str(duration), '-vf', 'hue=h=95', '-an', '-c:v', 'libx264',
                               '-preset', 'ultrafast', '-crf', '28', '-pix_fmt', 'yuv420p',
                               '-threads', '2', '-movflags', '+faststart'], 'video_without_audio', duration)
    audio_duration = 3 if profile == 'smoke' else 60
    create('music-48000.wav', ['-f', 'lavfi', '-i', 'sine=frequency=220:sample_rate=48000',
                             '-t', str(audio_duration), '-af', 'volume=0.08', '-ac', '2',
                             '-c:a', 'pcm_s16le'], 'audio_stereo_48000', audio_duration)
    create('audio-44100-mono.wav', ['-f', 'lavfi', '-i', 'sine=frequency=880:sample_rate=44100',
                                  '-t', '1', '-af', 'volume=0.1', '-ac', '1',
                                  '-c:a', 'pcm_s16le'], 'audio_mono_44100', 1)
    create('overlay-alpha.png', ['-f', 'lavfi', '-i', 'color=c=0xa78bfa@0.5:s=320x180,format=rgba',
                                 '-frames:v', '1', '-threads', '1', '-update', '1'], 'image_alpha', None)
    invalid = output / 'invalid-media.mp4'
    invalid_data = b'Jencut fixture: deliberately invalid MP4.\n'
    if invalid.exists() and invalid.read_bytes() != invalid_data:
        raise RuntimeError('No se reemplaza invalid-media.mp4 desconocido')
    invalid.write_bytes(invalid_data)
    files.append({'name': invalid.name, 'kind': 'invalid_media', 'expectedResult': 'reject',
                  'sha256': digest(invalid), 'bytes': invalid.stat().st_size})
    manifest = {'version': 1, 'profile': profile, 'synthetic': True,
                'ffmpegVersion': run([ffmpeg, '-version']).splitlines()[0],
                'ffprobeVersion': run([ffprobe, '-version']).splitlines()[0],
                'files': files,
                'note': 'Fixtures de entrada; no son renders ni pruebas aprobadas de Jencut. C1 requiere montar y medir según la especificación.'}
    old_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--profile', choices=['smoke', 'c1'], default='smoke')
    parser.add_argument('--output', type=Path, default=Path('fixtures/generated-smoke'))
    args = parser.parse_args()
    try:
        manifest = generate(args.output.resolve(), args.profile)
        print(json.dumps({'profile': args.profile, 'files': len(manifest['files']), 'output': str(args.output.resolve())}))
    except (RuntimeError, OSError, ValueError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
