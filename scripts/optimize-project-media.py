"""Generate responsive lossless WebP copies; keep source assets and HTML layout intact."""
import json
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'image/project-web'
OUTPUT.mkdir(exist_ok=True)
SKIP_PAGES = {'jet', 'welcomepage', 'cv', 'flowerspdf', '2dpdf', 'book'}
SKIP_CLASSES = {'seedan-pdf-page', 'seedan-script-page', 'seedan-script-modal-page',
                'neworgan-research-page', 'neworgan-research-modal-page',
                'earthbound-modal-image', 'mei-postcard-modal-image'}
ATTR = re.compile(r'([\w-]+)="([^"]*)"')
assets = {}
original_bytes = optimized_bytes = 0

def prepare(src):
    global original_bytes, optimized_bytes
    if src in assets:
        return assets[src]
    source = (ROOT / 'works html' / unquote(urlsplit(src).path)).resolve()
    if not source.is_file() or source.stat().st_size < 180_000:
        return None
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        if image.mode not in ('RGB', 'RGBA'):
            image = image.convert('RGBA' if 'transparency' in image.info else 'RGB')
        width, height = image.size
        variants = []
        # Full-size WebP is lossless; smaller copies retain alpha and use Lanczos resizing.
        for target in sorted(set([min(width, 1280), min(width, 2560), width])):
            destination = OUTPUT / f'{source.stem}-{target}.webp'
            if not destination.exists() or destination.stat().st_mtime < source.stat().st_mtime:
                resized = image if target == width else image.resize(
                    (target, round(height * target / width)), Image.Resampling.LANCZOS)
                resized.save(destination, 'WEBP', lossless=True, method=4)
            if target == width and destination.stat().st_size >= source.stat().st_size:
                variants.append((src, target, source.stat().st_size))
            else:
                variants.append(('../image/project-web/' + destination.name, target, destination.stat().st_size))
        result = (width, height, variants)
        assets[src] = result
        original_bytes += source.stat().st_size
        optimized_bytes += min(variants, key=lambda v: abs(v[1] - 2560))[2]
        return result

for page in (ROOT / 'works html').glob('*.html'):
    if page.stem in SKIP_PAGES:
        continue
    content_count = [0]
    def replace_image(match):
        tag = match.group(0)
        attrs = dict(ATTR.findall(tag))
        src = attrs.get('src', '')
        name = Path(urlsplit(src).path).name.lower()
        if not src or name in {'back.png', 'blackstar.png', 'redstar.png'}:
            return tag
        if set(attrs.get('class', '').split()) & SKIP_CLASSES:
            return tag
        content_count[0] += 1
        additions = {}
        info = prepare(src)
        if info:
            width, height, variants = info
            additions.update(width=str(width), height=str(height),
                             srcset=', '.join(f'{url} {w}w' for url, w, _ in variants),
                             sizes='100vw')
            if 'data-full-src' not in attrs:
                additions['data-full-src'] = src
        additions['decoding'] = 'async'
        if 'loading' not in attrs:
            additions['loading'] = 'eager' if content_count[0] <= 3 else 'lazy'
        if info and additions.get('loading', attrs.get('loading')) == 'lazy':
            additions['sizes'] = 'auto, 100vw'
        if info and 'animation-niangao-image' in attrs.get('class', '').split():
            # This image uses natural width plus max-width; retain its intrinsic dimensions.
            additions['srcset'] = variants[-1][0] + ' 1x'
        # Existing src and filename-dependent CSS/JS are deliberately preserved.
        for key, value in additions.items():
            if key in attrs:
                tag = re.sub(r'\b' + re.escape(key) + r'="[^"]*"', f'{key}="{value}"', tag)
            else:
                tag = tag[:-1] + f' {key}="{value}">'
        return tag
    content = re.sub(r'<img\b[^>]*>', replace_image, page.read_text())
    page.write_text(content)

report = {'assets': len(assets), 'original_bytes': original_bytes,
          'display_bytes_at_2560': optimized_bytes}
(OUTPUT / 'report.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report))
