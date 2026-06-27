#!/usr/bin/env python3
"""Crop Section 6 (Selection Criterion) — notebook still life + Venn iPhone."""
from PIL import Image
import os

SRC = "docs/design/LP-Images/LPsection6.png"
OUT_DIR = "public/landing"

img = Image.open(SRC)
print(f"Source: {img.size}")  # 1792 x 1024

# Notebook still life (center)
img.crop((600, 0, 1240, 1024)).save(f"{OUT_DIR}/photo-selection-notebook.png")
# iPhone with Venn diagram (right)
img.crop((1240, 30, 1620, 1000)).save(f"{OUT_DIR}/iphone-selection-venn.png")

for f in sorted(os.listdir(OUT_DIR)):
    if "selection" in f and not f.startswith("section"):
        p = f"{OUT_DIR}/{f}"
        im = Image.open(p)
        print(f"  {f}: {im.size}")
