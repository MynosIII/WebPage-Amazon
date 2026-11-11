"""Make small WebP thumbnails for the catalog cards.

Catalog cards are 182 px tall, but they used to load the full-size originals
(up to 860 KB each). Each card image gets a 480 px and an 800 px wide WebP at
assets/catalog-thumbs/<slug>-<width>.webp. The slug is derived from the image
path the same way catalog.js and build_catalog_static.py derive it.

Run: python scripts/build_catalog_thumbs.py [--check] [--force to rebuild after replacing an image]
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "prototype-amazon" / "catalog-data.json"
OUT = ROOT / "assets" / "catalog-thumbs"
WIDTHS = (480, 800)


def slug(image: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", image.lower()).strip("-")


def thumb_path(image: str, width: int) -> Path:
    return OUT / f"{slug(image)}-{width}.webp"


def card_images() -> list[str]:
    items = json.loads(DATA.read_text(encoding="utf-8"))
    images = {item["image"] for item in items if item.get("image") and not item.get("imageSet")}
    return sorted(image for image in images if not image.lower().endswith(".svg"))


def main() -> int:
    check = "--check" in sys.argv
    missing = []
    OUT.mkdir(parents=True, exist_ok=True)
    for image in card_images():
        source = ROOT / image
        for width in WIDTHS:
            target = thumb_path(image, width)
            if target.exists() and "--force" not in sys.argv:
                continue
            missing.append(target.relative_to(ROOT).as_posix())
            if check:
                continue
            with Image.open(source) as original:
                frame = original.convert("RGBA" if original.mode in ("RGBA", "LA", "P") else "RGB")
                if frame.width > width:
                    frame = frame.resize((width, round(frame.height * width / frame.width)), Image.LANCZOS)
                frame.save(target, "WEBP", quality=78, method=6)
    if check and missing:
        print("Catalog thumbnails are missing or stale: " + ", ".join(missing[:8]))
        return 1
    print(f"Catalog thumbnails {'checked' if check else 'built'}; {len(missing)} {'stale' if check else 'written'}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
