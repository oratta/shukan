#!/usr/bin/env python3
"""Crop Section 3 (Process) subassets: 4 iPhone mocks horizontally."""
from PIL import Image
import os

SRC = "docs/design/LP-Images/LPsection3.png"
OUT_DIR = "public/landing"

img = Image.open(SRC)
print(f"Source: {img.size}")  # 1659 x 948

# 4 iPhones horizontally. Estimate each iPhone region.
crops = [
    ("iphone-process-1.png", (490, 200, 730, 720)),
    ("iphone-process-2.png", (820, 200, 1010, 720)),
    ("iphone-process-3.png", (1080, 200, 1270, 720)),
    ("iphone-process-4.png", (1340, 200, 1540, 720)),
]
for name, box in crops:
    img.crop(box).save(f"{OUT_DIR}/{name}")

for f in sorted(os.listdir(OUT_DIR)):
    if "process" in f and not f.startswith("section"):
        p = f"{OUT_DIR}/{f}"
        im = Image.open(p)
        print(f"  {f}: {im.size}")
