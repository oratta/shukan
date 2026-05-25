#!/usr/bin/env python3
"""Crop Section 7 (Testimony) — man at window + iPhone selected habits."""
from PIL import Image
import os

SRC = "docs/design/LP-Images/LPsection7.png"
OUT_DIR = "public/landing"

img = Image.open(SRC)
print(f"Source: {img.size}")  # 1792 x 1024

# Man at window (left)
img.crop((0, 50, 620, 1000)).save(f"{OUT_DIR}/photo-testimony-man.png")
# iPhone with "選んだ習慣" + "感じた変化" (right)
img.crop((1320, 80, 1730, 1000)).save(f"{OUT_DIR}/iphone-testimony.png")

for f in sorted(os.listdir(OUT_DIR)):
    if "testimony" in f and not f.startswith("section"):
        p = f"{OUT_DIR}/{f}"
        im = Image.open(p)
        print(f"  {f}: {im.size}")
