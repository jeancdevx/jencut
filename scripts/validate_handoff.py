#!/usr/bin/env python3
"""Comprueba el paquete de contexto original; no ejecuta pruebas del editor Jencut."""
import argparse
from fractions import Fraction
import hashlib
import json
from pathlib import Path,PurePosixPath
import re
import shutil
import struct
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def need(condition,message):
    if not condition:
        raise ValueError(message)


def sha(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for data in iter(lambda:f.read(1024*1024),b''):
            h.update(data)
    return h.hexdigest()


def check_project(p):
    need(p['schemaVersion']==1,'schemaVersion')
    need(p['fps']=={'num':30,'den':1},'M1 requiere 30/1 fps')
    need((p['canvas']['width'],p['canvas']['height']) in [(1920,1080),(1080,1920),(1080,1080),(1280,720),(720,1280),(720,720)],'Canvas M1')
    need(p['canvas']['colorSpace']=='rec709-sdr','Color M1')
    need(isinstance(p['revision'],int) and p['revision']>=0,'Revision')
    need(0<len(p['name'])<=80,'Nombre')
    assets={a['id']:a for a in p['assets']}
    need(len(assets)==len(p['assets'])<=30,'Assets únicos y límite')
    for a in assets.values():
        need(bool(re.fullmatch('[a-f0-9]{64}',a['contentHash'])),'Hash de asset')
        path=a['managedRelativePath'];q=PurePosixPath(path)
        need(not q.is_absolute() and '..' not in q.parts and '\\' not in path and ':' not in path,'Ruta relativa de asset')
    tracks=p['tracks'];need(len({t['id'] for t in tracks})==len(tracks)<=8,'Pistas únicas y límite')
    need(all(sum(t['kind']==k for t in tracks)<=4 for k in ['visual','audio']),'Cuatro pistas por tipo')
    clips={}
    for t in tracks:
        ranges=[]
        for c in t['clips']:
            need(c['id'] not in clips,'ID clip duplicado');clips[c['id']]=c
            need(c['trackId']==t['id'],'Clip en pista incorrecta')
            need(isinstance(c['startFrame'],int) and c['startFrame']>=0,'Inicio no negativo entero')
            need(isinstance(c['durationFrames'],int) and c['durationFrames']>=1,'Duración mínima de un frame')
            need(c['startFrame']+c['durationFrames']<=18000,'Duración máxima M1')
            need((c['kind']=='audio')==(t['kind']=='audio'),'Tipo de pista y clip')
            ranges.append((c['startFrame'],c['startFrame']+c['durationFrames']))
            e=c['effects'];need(e.get('fadeInFrames',0)+e.get('fadeOutFrames',0)<=c['durationFrames'],'Fundidos exceden clip')
            if c['kind']!='title':
                need(c['assetId'] in assets,'Asset ausente')
                matches=[s for s in assets[c['assetId']]['streams'] if s['index']==c['streamIndex']]
                need(len(matches)==1,'Stream ausente/duplicado');s=matches[0]
                need(s['type']==c['kind'] or c['kind']=='image','Tipo stream')
                need(c['sourceTimeBase']==s['timeBase'],'Time base del clip')
                b=s['timeBase'];unit=Fraction(b['num'],b['den'])
                need(c['sourceInPTS']>=0,'IN fuente no negativo')
                if c['kind']!='image':
                    need(c['sourceInPTS']*unit+Fraction(c['durationFrames'],30)<=s['durationPTS']*unit,'Rango fuera de fuente')
            else:
                need(len(c['title']['text'])<=500,'Título demasiado largo')
        ranges.sort()
        need(all(ranges[i][1]<=ranges[i+1][0] for i in range(len(ranges)-1)),'Colisión de clips')
    need(len(clips)<=50,'Límite de clips')
    groups={g['id']:g for g in p['linkGroups']}
    need(len(groups)==len(p['linkGroups']),'IDs de grupo duplicados')
    for g in groups.values():
        ids=g['memberClipIds'];need(len(ids)==2 and len(set(ids))==2,'Grupo V/A')
        need(all(i in clips for i in ids),'Miembro del grupo ausente');a,b=[clips[i] for i in ids]
        need({a['kind'],b['kind']}=={'video','audio'},'Grupo con tipos incorrectos')
        need(a['assetId']==b['assetId'] and a['startFrame']==b['startFrame'] and a['durationFrames']==b['durationFrames'],'Grupo desalineado')
        need(all(c.get('linkGroupId')==g['id'] for c in [a,b]),'Vínculo inconsistente')
    for c in clips.values():
        gid=c.get('linkGroupId')
        if gid:need(gid in groups and c['id'] in groups[gid]['memberClipIds'],'Grupo no resoluble')


def check_schema_refs(schema):
    def visit(obj):
        if isinstance(obj,dict):
            if '$ref' in obj:
                ref=obj['$ref'];need(ref.startswith('#/'),'Solo refs locales en contrato')
                target=schema
                for key in ref[2:].split('/'):
                    key=key.replace('~1','/').replace('~0','~')
                    need(key in target,'Ref de esquema ausente: '+ref);target=target[key]
            for value in obj.values():visit(value)
        elif isinstance(obj,list):
            for value in obj:visit(value)
    visit(schema)


def main(args):
    required=['AGENTS.md','START_HERE.md','README.md','PROMPT_INICIO_CODEX.md','PROMPT_CONTINUAR_CODEX.md','GOALS.md','PLANS.md','STATUS.md',
              'docs/current/BASELINE.md','docs/current/ARCHITECTURE.md','docs/current/BACKLOG.md','docs/current/DECISIONS.md','docs/current/QUALITY_AND_TESTS.md',
              'design/DESIGN_SPEC.md','design/RECONCILIATION.md','design/tokens.json','specification/requirements-v1.json','specification/project.schema.json',
              'fixtures/project-example.jencut.json','fixtures/empty-project.jencut.json','assets/brand/logo-on-dark.svg','assets/brand/favicon.svg',
              'assets/mascot/jeni.png','assets/fonts/Manrope-OFL.txt','assets/fonts/Inter-OFL.txt','reference/preproduction-v1/pdf/Jencut-wireframes-prototipo-v1.pdf']
    for f in required:need((ROOT/f).is_file(),'Archivo requerido ausente: '+f)
    need((ROOT/'AGENTS.md').stat().st_size<12000,'AGENTS.md debe mantenerse breve')
    data=json.loads((ROOT/'specification/requirements-v1.json').read_text())
    req={r['id']:r for r in data['requisitos']}
    need(len(req)==54,'54 requisitos');need(sum(r['entrega']=='M1' for r in req.values())==45,'45 requisitos M1')
    need(len(data['calidad'])==18 and len(data['reglas'])==22 and len(data['pantallas'])==12,'Conteo de especificación')
    rules={r['id'] for r in data['reglas']};flows={r['id'] for r in data['flujos']};screens={r['id'] for r in data['pantallas']}
    visited,active=set(),set()
    def traverse(id):
        need(id not in active,'Dependencia circular: '+id)
        if id in visited:return
        active.add(id)
        for dep in req[id]['dependencias']:
            need(dep in req,'Dependencia ausente')
            need(req[id]['entrega']!='M1' or req[dep]['entrega']=='M1','M1 depende de entrega futura')
            traverse(dep)
        active.remove(id);visited.add(id)
    for id,r in req.items():
        traverse(id);need(r['flujo'] in flows and r['pantalla'] in screens,'Flujo/pantalla ausente')
        need(all(x in rules for x in r['reglas']),'Regla ausente')
    schema=json.loads((ROOT/'specification/project.schema.json').read_text());check_schema_refs(schema)
    project=json.loads((ROOT/'fixtures/project-example.jencut.json').read_text());check_project(project)
    check_project(json.loads((ROOT/'fixtures/empty-project.jencut.json').read_text()))
    # Comprobar que los controles de ejemplo detectan tres corrupciones reales.
    for mutation in ['negative_frame','collision','wrong_fps']:
        bad=json.loads(json.dumps(project))
        if mutation=='negative_frame':bad['tracks'][0]['clips'][0]['startFrame']=-1
        elif mutation=='collision':
            dup=json.loads(json.dumps(bad['tracks'][0]['clips'][0]));dup['id']='collision';dup['linkGroupId']=None;bad['tracks'][0]['clips'].append(dup)
        else:bad['fps']={'num':60,'den':1}
        rejected=False
        try:check_project(bad)
        except ValueError:rejected=True
        need(rejected,'Mutación no detectada: '+mutation)
    pngs=0
    for folder in ['design/references','assets/mascot','assets/brand/png']:
        for path in (ROOT/folder).glob('*.png'):
            b=path.read_bytes()[:24];need(b[:8]==b'\x89PNG\r\n\x1a\n','PNG inválido: '+path.name)
            w,h=struct.unpack('>II',b[16:24]);need(w>0 and h>0,'PNG vacío');pngs+=1
    for path in (ROOT/'assets/brand').glob('*.svg'):
        tree=ET.fromstring(path.read_text());need(tree.tag.endswith('svg'),'SVG raíz');need(tree.attrib.get('viewBox'),'SVG viewBox')
        need('http://' not in path.read_text().replace('http://www.w3.org/2000/svg','') and '<script' not in path.read_text(),'SVG sin código ni recursos externos')
    need(len(list((ROOT/'design/references').glob('0[1-4]-*.png')))==4,'Cuatro diseños finales')
    fixture_manifest=json.loads((ROOT/'fixtures/smoke/fixture-manifest.json').read_text())
    valid_media=0;invalid_rejected=False
    ffprobe=shutil.which('ffprobe')
    if args.media:need(ffprobe is not None,'--media requiere ffprobe')
    for entry in fixture_manifest['files']:
        path=ROOT/'fixtures/smoke'/entry['name'];need(path.is_file() and sha(path)==entry['sha256'],'Hash fixture: '+entry['name'])
        if args.media:
            p=subprocess.run([ffprobe,'-v','error','-show_streams','-show_format','-of','json',str(path)],capture_output=True,text=True)
            if entry['kind']=='invalid_media':
                need(p.returncode!=0,'Falso MP4 no fue rechazado');invalid_rejected=True
            else:
                need(p.returncode==0,'ffprobe rechazó fixture válido: '+entry['name']);info=json.loads(p.stdout);need(info.get('streams'),'Sin streams')
                expected=entry['expectedDurationSeconds']
                if expected is not None:need(abs(float(info['format']['duration'])-expected)<=0.05,'Duración incorrecta')
                if entry['kind']=='video_audio':
                    need({s['codec_type'] for s in info['streams']}=={'video','audio'},'Streams A/V')
                    v=next(s for s in info['streams'] if s['codec_type']=='video');need(v['codec_name']=='h264' and v['avg_frame_rate']=='30/1','H.264/CFR30')
                valid_media+=1
    mapping=json.loads((ROOT/'fixtures/import-map.json').read_text())
    for asset in mapping['assets']:need(sha(ROOT/asset['source'])==asset['sha256'],'Import map hash')
    checksums=0;sumfile=ROOT/'SHA256SUMS.txt'
    if sumfile.exists() and not args.skip_checksums:
        for line in sumfile.read_text().splitlines():
            if not line.strip():continue
            expected,relative=line.split('  ',1);q=PurePosixPath(relative)
            need(not q.is_absolute() and '..' not in q.parts,'Checksum path')
            need((ROOT/relative).is_file() and sha(ROOT/relative)==expected,'Checksum: '+relative);checksums+=1
    return {'ok':True,'scope':'Paquete de contexto, ejemplos y fixtures; no pruebas de Jencut implementado',
            'requirements':len(req),'m1':45,'qualityAttributes':18,'referenceImages':4,'pngFiles':pngs,
            'crossInvariantExamples':True,'rejectedExampleMutations':3,'formalJSONSchemaEngineExecuted':False,
            'mediaProbeExecuted':bool(args.media),'validMediaProbed':valid_media,'invalidMediaRejected':invalid_rejected,
            'checksumFilesVerified':checksums,'productTests':'not_run'}


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--media',action='store_true',help='Reinspeccionar fixtures con ffprobe local.')
    parser.add_argument('--skip-checksums',action='store_true',help='Tras empezar desarrollo, no comparar archivos de contexto modificados con el snapshot original.')
    args=parser.parse_args()
    try:print(json.dumps(main(args),ensure_ascii=False,indent=2))
    except (ValueError,KeyError,OSError) as error:
        print(json.dumps({'ok':False,'error':str(error)},ensure_ascii=False),file=sys.stderr);sys.exit(1)
