"""Copy only reviewed, pinned skill files; never execute remote code."""
import hashlib, json, urllib.request
from pathlib import Path, PurePosixPath
from concurrent.futures import ThreadPoolExecutor
repo = Path(__file__).resolve().parent.parent
root = (repo / '.agents' / 'skills').resolve()
manifest = [e for e in json.loads((repo / 'docs/soft-lotus-v2/skills-manifest.json').read_text()) if '/demo/' not in e['source']]
def install(entry):
    relative = PurePosixPath(entry['destination'])
    if relative.is_absolute() or any(p in ('..', '.', '') for p in relative.parts):
        raise ValueError('Unsafe path')
    target = (root / str(relative)).resolve()
    if not target.is_relative_to(root): raise ValueError('Outside selected root')
    url = f"https://raw.githubusercontent.com/{entry['repository']}/{entry['ref']}/{entry['source']}"
    data = urllib.request.urlopen(url, timeout=45).read()
    digest = hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest()
    if digest != entry['sha']: raise ValueError('Git object mismatch: ' + entry['source'])
    data.decode('utf-8')
    if target.exists() and target.read_bytes() != data: raise ValueError('Refusing overwrite: ' + str(target))
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    return str(relative)
with ThreadPoolExecutor(max_workers=5) as pool:
    paths = list(pool.map(install, manifest))
print(json.dumps({'files': len(paths), 'root': str(root), 'executed_remote_scripts': False}))
