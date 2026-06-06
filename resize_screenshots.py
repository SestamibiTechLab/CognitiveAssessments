#!/usr/bin/env python3
"""Resize screenshots to Apple App Store requirements."""

from PIL import Image
import os
from pathlib import Path

# Target dimensions for iOS App Store (iPhone 15 Pro Max and Pro)
TARGET_WIDTH = 1284
TARGET_HEIGHT = 2778

# Directory containing screenshots
screenshot_dir = Path("store/screenshots/ios/en-US")

if not screenshot_dir.exists():
    print(f"Error: {screenshot_dir} does not exist")
    exit(1)

# Get all PNG files
png_files = list(screenshot_dir.glob("*.png"))

if not png_files:
    print(f"No PNG files found in {screenshot_dir}")
    exit(1)

print(f"Found {len(png_files)} screenshots to resize")
print(f"Target size: {TARGET_WIDTH}x{TARGET_HEIGHT}px\n")

for png_file in sorted(png_files):
    try:
        # Open image
        img = Image.open(png_file)
        original_size = img.size
        print(f"Processing {png_file.name}...")
        print(f"  Original size: {original_size[0]}x{original_size[1]}")

        # Calculate aspect ratio
        original_ratio = original_size[0] / original_size[1]
        target_ratio = TARGET_WIDTH / TARGET_HEIGHT

        # Resize with aspect ratio preservation
        if original_ratio > target_ratio:
            # Image is wider - fit to height
            new_height = TARGET_HEIGHT
            new_width = int(TARGET_HEIGHT * original_ratio)
        else:
            # Image is taller - fit to width
            new_width = TARGET_WIDTH
            new_height = int(TARGET_WIDTH / original_ratio)

        # Resize image
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # Create new image with target size and paste resized image centered
        final_img = Image.new('RGB', (TARGET_WIDTH, TARGET_HEIGHT), (255, 255, 255))
        offset_x = (TARGET_WIDTH - new_width) // 2
        offset_y = (TARGET_HEIGHT - new_height) // 2
        final_img.paste(img, (offset_x, offset_y))

        # Save
        final_img.save(png_file, 'PNG', quality=95)
        print(f"  [OK] Resized and saved: {TARGET_WIDTH}x{TARGET_HEIGHT}")

    except Exception as e:
        print(f"  [ERROR] {e}")

print(f"\n[COMPLETE] All screenshots resized to {TARGET_WIDTH}x{TARGET_HEIGHT}px")
