"""Generate the Open Graph card for the prototype-amazon (Vercel) experience.

Run: python scripts/generate_prototype_og_card.py
Produces prototype-amazon/og-card.png (1200x630). The root-level og-card.png
still names matiasgaglio.onrender.com and belongs to the legacy site only;
this card carries the new site's own branding and domain.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "prototype-amazon" / "og-card.png"
FONTS = Path("C:/Windows/Fonts")

W, H = 1200, 630
NAVY = (11, 17, 24)
NAVY_PANEL = (28, 39, 50)
ORANGE = (242, 157, 56)
WHITE = (245, 247, 248)
MUTED = (170, 181, 191)


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


def vertical_gradient(draw: ImageDraw.ImageDraw) -> None:
    for y in range(H):
        t = y / H
        r = int(NAVY[0] + (NAVY_PANEL[0] - NAVY[0]) * (1 - abs(t - 0.15)) * 0.5)
        g = int(NAVY[1] + (NAVY_PANEL[1] - NAVY[1]) * (1 - abs(t - 0.15)) * 0.5)
        b = int(NAVY[2] + (NAVY_PANEL[2] - NAVY[2]) * (1 - abs(t - 0.15)) * 0.5)
        draw.line([(0, y), (W, y)], fill=(r, g, b))


def wrap(text: str, fnt: ImageFont.FreeTypeFont, max_width: int, draw: ImageDraw.ImageDraw) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textlength(candidate, font=fnt) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def main() -> None:
    image = Image.new("RGB", (W, H), NAVY)
    draw = ImageDraw.Draw(image)
    vertical_gradient(draw)

    draw.rectangle([0, 0, 14, H], fill=ORANGE)

    left = 90
    # Logo mark (scaled version of prototype-amazon/logo-signal.svg's bars + checkmark).
    bx, by, s = left, 66, 1.6
    draw.rectangle([bx + int(2 * s), by + int(28 * s), bx + int(9 * s), by + int(38 * s)], fill=ORANGE)
    draw.rectangle([bx + int(13 * s), by + int(20 * s), bx + int(20 * s), by + int(38 * s)], fill=ORANGE)
    draw.rectangle([bx + int(24 * s), by + int(8 * s), bx + int(31 * s), by + int(38 * s)], fill=ORANGE)
    draw.line(
        [
            (bx + int(3 * s), by + int(34 * s)),
            (bx + int(12 * s), by + int(34 * s)),
            (bx + int(20 * s), by + int(26 * s)),
            (bx + int(28 * s), by + int(30 * s)),
            (bx + int(43 * s), by + int(15 * s)),
        ],
        fill=WHITE,
        width=6,
        joint="curve",
    )
    brand_font = font("arialbd.ttf", 30)
    draw.text((bx + int(58 * s), by + int(6 * s)), "Matías Gaglio", font=brand_font, fill=WHITE)

    eyebrow_font = font("arialbd.ttf", 21)
    draw.text((left, 170), "ECOMMERCE & AMAZON GROWTH STRATEGIST", font=eyebrow_font, fill=ORANGE)

    h1_font = font("arialbd.ttf", 60)
    headline = "Datos y pauta convertidos en decisiones ejecutables"
    y = 225
    for line in wrap(headline, h1_font, 940, draw):
        draw.text((left, y), line, font=h1_font, fill=(252, 252, 251))
        y += 70

    body_font = font("arial.ttf", 27)
    body = "Business Intelligence, Amazon PPC y contenido visual para mejorar conversión y rentabilidad."
    y += 12
    for line in wrap(body, body_font, 820, draw):
        draw.text((left, y), line, font=body_font, fill=MUTED)
        y += 38

    domain_font = font("arialbd.ttf", 24)
    domain_text = "matiasgaglio.vercel.app"
    pad_x, pad_y = 22, 13
    tw = draw.textlength(domain_text, font=domain_font)
    box_top = H - 120
    draw.rectangle([left, box_top, left + tw + pad_x * 2, box_top + 24 + pad_y * 2], fill=ORANGE)
    draw.text((left + pad_x, box_top + pad_y), domain_text, font=domain_font, fill=(19, 25, 33))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUT, "PNG")
    print(f"Wrote {OUT} ({W}x{H})")


if __name__ == "__main__":
    main()
