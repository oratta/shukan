#!/usr/bin/env python3
"""Crop Section 1 (Hero) subassets."""
from PIL import Image
import os

SRC = "docs/design/LP-Images/LPsection1.png"
OUT_DIR = "public/landing"

img = Image.open(SRC)
print(f"Source: {img.size}")

# Width 1659 x height 948.
# Man with scarf + coat (center)
img.crop((640, 0, 1180, 720)).save(f"{OUT_DIR}/photo-hero-man.png")
# iPhone (right, "なりたい自分を選ぶ" screen) — extend right edge
img.crop((1170, 5, 1530, 730)).save(f"{OUT_DIR}/iphone-hero.png")
# Bottom editorial collage photos — 2 clean strips
img.crop((10, 720, 500, 948)).save(f"{OUT_DIR}/photo-hero-reading.png")
img.crop((820, 720, 1140, 948)).save(f"{OUT_DIR}/photo-hero-writing.png")

# remove obsolete crops
for f in ["photo-hero-bottom-1.png", "photo-hero-bottom-2.png", "photo-hero-bottom-3.png"]:
    p = f"{OUT_DIR}/{f}"
    if os.path.exists(p):
        os.remove(p)

for f in sorted(os.listdir(OUT_DIR)):
    if f.startswith("photo-hero") or f.startswith("iphone-hero"):
        p = f"{OUT_DIR}/{f}"
        im = Image.open(p)
        print(f"  {f}: {im.size}")
