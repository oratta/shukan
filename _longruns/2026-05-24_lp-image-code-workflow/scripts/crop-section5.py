#!/usr/bin/env python3
"""Crop Section 5 (Outcome Gallery) — 3 person photos (excluding the iPhone overlay)."""
from PIL import Image
import os

SRC = "docs/design/LP-Images/LPsection5.png"
OUT_DIR = "public/landing"

img = Image.open(SRC)
print(f"Source: {img.size}")  # 1792 x 1024

# Photo crops only — iPhone metrics will be rendered as HTML text cards
# 3 photos: focus / family / health
img.crop((40, 170, 580, 800)).save(f"{OUT_DIR}/photo-outcome-focus.png")
img.crop((620, 170, 1170, 800)).save(f"{OUT_DIR}/photo-outcome-family.png")
img.crop((1210, 170, 1770, 800)).save(f"{OUT_DIR}/photo-outcome-health.png")

for f in sorted(os.listdir(OUT_DIR)):
    if "outcome" in f and not f.startswith("section"):
        p = f"{OUT_DIR}/{f}"
        im = Image.open(p)
        print(f"  {f}: {im.size}")
