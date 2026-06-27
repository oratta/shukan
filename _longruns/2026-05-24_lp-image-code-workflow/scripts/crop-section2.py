#!/usr/bin/env python3
"""Crop Section 2 (Problem) subassets: broken-streak iPhone + woman portrait."""
from PIL import Image
import os

SRC = "docs/design/LP-Images/LPsection2.png"
OUT_DIR = "public/landing"

img = Image.open(SRC)
print(f"Source: {img.size}")  # 1659 x 948

# iPhone with broken streak "0日" (left)
img.crop((50, 230, 450, 880)).save(f"{OUT_DIR}/iphone-problem.png")
# Woman with sweater + phone (right)
img.crop((1010, 0, 1659, 948)).save(f"{OUT_DIR}/photo-problem-woman.png")

for f in sorted(os.listdir(OUT_DIR)):
    if "problem" in f:
        p = f"{OUT_DIR}/{f}"
        im = Image.open(p)
        print(f"  {f}: {im.size}")
