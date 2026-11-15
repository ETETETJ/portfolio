"""Move a conventional MP4's tail moov atom ahead of mdat without re-encoding."""
from pathlib import Path
import hashlib
import struct

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'video/veggie.mp4'
destination = ROOT / 'video/web/veggie.mp4'
destination.parent.mkdir(exist_ok=True)

def atoms(stream, end):
    while stream.tell() < end:
        start = stream.tell()
        size, kind = struct.unpack('>I4s', stream.read(8))
        if size == 1:
            size = struct.unpack('>Q', stream.read(8))[0]
        if size == 0:
            size = end - start
        if size < 8:
            raise ValueError('Invalid MP4 atom')
        yield start, size, kind
        stream.seek(start + size)

with source.open('rb') as stream:
    layout = list(atoms(stream, source.stat().st_size))
    moov = next(a for a in layout if a[2] == b'moov')
    mdat = next(a for a in layout if a[2] == b'mdat')
    assert moov[0] > mdat[0] and moov[0] + moov[1] == source.stat().st_size
    stream.seek(moov[0])
    data = bytearray(stream.read(moov[1]))

def update_offsets(start, end):
    while start < end:
        size, kind = struct.unpack_from('>I4s', data, start)
        assert size >= 8 and start + size <= end
        if kind in (b'stco', b'co64'):
            count = struct.unpack_from('>I', data, start + 12)[0]
            code, step = ('>I', 4) if kind == b'stco' else ('>Q', 8)
            for i in range(count):
                position = start + 16 + i * step
                offset = struct.unpack_from(code, data, position)[0]
                assert mdat[0] <= offset < moov[0]
                struct.pack_into(code, data, position, offset + len(data))
        elif kind in (b'moov', b'trak', b'mdia', b'minf', b'stbl'):
            update_offsets(start + 8, start + size)
        start += size

update_offsets(0, len(data))
with source.open('rb') as stream, destination.open('wb') as output:
    output.write(stream.read(mdat[0]))
    output.write(data)
    remaining = moov[0] - mdat[0]
    original_hash = hashlib.sha256()
    while remaining:
        chunk = stream.read(min(4 * 1024 * 1024, remaining))
        if not chunk:
            raise ValueError('Unexpected end of MP4')
        original_hash.update(chunk)
        output.write(chunk)
        remaining -= len(chunk)

with destination.open('rb') as stream:
    stream.seek(mdat[0] + len(data))
    copied_hash = hashlib.sha256()
    for chunk in iter(lambda: stream.read(4 * 1024 * 1024), b''):
        copied_hash.update(chunk)
assert original_hash.hexdigest() == copied_hash.hexdigest()
assert source.stat().st_size == destination.stat().st_size
print('Fast-start copy verified: video/audio payload is byte-for-byte identical.')
