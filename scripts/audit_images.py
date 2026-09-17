"""One-off audit: every image the catalog references, plus size/dimension checks.

Not part of CI; run manually: python scripts/audit_images.py
"""
from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import unquote

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PROTO = ROOT / "prototype-amazon"

data = json.loads((PROTO / "catalog-data.json").read_text(encoding="utf-8"))
images: set[str] = set()
for item in data:
    if item.get("image"):
        images.add(item["image"])
    for im in item.get("imageSet") or []:
        images.add(im)

rows = []
for rel in sorted(images):
    path = (ROOT / unquote(rel)).resolve()
    if not path.exists():
        rows.append((rel, "MISSING", None, None, None))
        continue
    size_kb = path.stat().st_size / 1024
    try:
        with Image.open(path) as im:
            w, h = im.size
            fmt = im.format
    except Exception as exc:
        rows.append((rel, f"UNREADABLE ({exc})", None, None, None))
        continue
    rows.append((rel, "ok", size_kb, f"{w}x{h}", fmt))

print(f"{'file':70} {'status':10} {'KB':>8}  dims        fmt")
total_kb = 0.0
oversized = []
tiny_but_heavy = []
has_space = []
for rel, status, size_kb, dims, fmt in rows:
    kb_str = f"{size_kb:.0f}" if size_kb else "-"
    print(f"{rel[:70]:70} {status:10} {kb_str:>8}  {dims or '-':10}  {fmt or '-'}")
    if size_kb:
        total_kb += size_kb
        if size_kb > 400:
            oversized.append((rel, size_kb, dims))
    if " " in rel:
        has_space.append(rel)

print()
print(f"Total: {len(rows)} images, {total_kb/1024:.1f} MB combined")
print(f"Missing/unreadable: {sum(1 for r in rows if r[1] != 'ok')}")
print(f"Over 400KB: {len(oversized)}")
for rel, kb, dims in sorted(oversized, key=lambda r: -r[1]):
    print(f"  {rel} — {kb:.0f} KB ({dims})")
print(f"Filenames containing spaces: {len(has_space)}")
for rel in has_space:
    print(f"  {rel}")
