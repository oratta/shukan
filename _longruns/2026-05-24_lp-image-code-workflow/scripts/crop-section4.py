#!/usr/bin/env python3
"""Crop Section 4 (Detail) subassets: 4 iPhones + reading man photo."""
from PIL import Image
import os

SRC = "docs/design/LP-Images/LPsection4.png"
OUT_DIR = "public/landing"

img = Image.open(SRC)
print(f"Source: {img.size}")  # 1792 x 1024

# Reading man at left (with coffee mug + book)
img.crop((0, 250, 540, 1000)).save(f"{OUT_DIR}/photo-detail-reading.png")

# 4 iPhones in row — roughly span x=580 to x=1740
crops = [
    ("iphone-detail-1.png", (560, 230, 850, 970)),
    ("iphone-detail-2.png", (860, 230, 1130, 970)),
    ("iphone-detail-3.png", (1160, 230, 1410, 970)),
    ("iphone-detail-4.png", (1450, 230, 1740, 970)),
]
for name, box in crops:
    img.crop(box).save(f"{OUT_DIR}/{name}")

for f in sorted(os.listdir(OUT_DIR)):
    if "detail" in f and not f.startswith("section"):
        p = f"{OUT_DIR}/{f}"
        im = Image.open(p)
        print(f"  {f}: {im.size}")
