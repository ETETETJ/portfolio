"""Use lightweight posters and reserve video dimensions without changing playback quality."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
metadata = json.loads((ROOT / 'image/video-posters/metadata.json').read_text())
for page in (ROOT / 'works html').glob('*.html'):
    if page.stem in {'jet', 'welcomepage', 'cv', 'book', '2dpdf', 'flowerspdf'}:
        continue
    def configure(match):
        block = match.group(0)
        source = re.search(r'src="[^\"]*/([^/\"]+\.mp4)"', block)
        if not source or source[1] not in metadata:
            return block
        info = metadata[source[1]]
        end = block.index('>') + 1
        tag = block[:end]
        for attribute in ('preload', 'width', 'height', 'poster'):
            tag = re.sub(r'\s+' + attribute + r'="[^"]*"', '', tag)
        tag = tag[:-1] + (f' preload="none" width="{info["width"]}" '
                          f'height="{info["height"]}" poster="{info["poster"]}">')
        return tag + block[end:]
    content = re.sub(r'<video\b[^>]*>.*?</video>', configure, page.read_text(), flags=re.S)
    if page.stem == 'root':
        content = content.replace('../video/veggie.mp4', '../video/web/veggie.mp4')
    if '../js/project-media.js' not in content:
        content = content.replace('</body>', '    <script src="../js/project-media.js"></script>\n</body>')
    page.write_text(content)
