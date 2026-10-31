#!/usr/bin/env python3
"""Rasteriza los SVG maestros con librsvg de FFmpeg; exporta PNG e ICO sin paquetes Python."""
import argparse
from pathlib import Path
import shutil
import struct
import subprocess
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]


def export(overwrite=False):
    ffmpeg=shutil.which('ffmpeg')
    if not ffmpeg:raise RuntimeError('FFmpeg con decoder librsvg debe estar disponible en PATH.')
    brand=ROOT/'assets/brand';out=brand/'png';out.mkdir(exist_ok=True)
    tasks=[]
    for size in [16,24,32,48,64,128,192,256,512,1024]:
        tasks.append((brand/'favicon.svg',out/f'icon-{size}.png',size,size))
    for name in ['logo-on-dark','logo-on-light']:
        src=brand/(name+'.svg');vb=list(map(float,ET.fromstring(src.read_text()).attrib['viewBox'].split()))
        for width in [256,512,1024,2048]:tasks.append((src,out/f'{name}-{width}.png',width,round(width*vb[3]/vb[2])))
    for src,dst,w,h in tasks:
        if dst.exists() and not overwrite:raise RuntimeError('Existe '+str(dst)+'; usa --overwrite para regenerar derivados de marca.')
        args=[ffmpeg,'-hide_banner','-loglevel','error','-y' if overwrite else '-n',
              '-width',str(w),'-height',str(h),'-keep_ar','1','-i',str(src),
              '-frames:v','1','-threads','1','-update','1',str(dst)]
        p=subprocess.run(args,capture_output=True,text=True)
        if p.returncode:raise RuntimeError(p.stderr)
    ico=brand/'favicon.ico'
    if ico.exists() and not overwrite:raise RuntimeError('favicon.ico ya existe; usa --overwrite para regenerarlo.')
    blobs=[(size,(out/f'icon-{size}.png').read_bytes()) for size in [16,32,48,64,128,256]]
    offset=6+16*len(blobs);entries=[]
    for size,blob in blobs:
        entries.append(struct.pack('<BBBBHHII',size if size<256 else 0,size if size<256 else 0,0,0,1,32,len(blob),offset));offset+=len(blob)
    ico.write_bytes(struct.pack('<HHH',0,1,len(blobs))+b''.join(entries)+b''.join(b for _,b in blobs))
    return len(tasks)


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--overwrite',action='store_true');args=parser.parse_args()
    try:print({'pngExports':export(args.overwrite),'ico':True})
    except RuntimeError as e:raise SystemExit(str(e))
