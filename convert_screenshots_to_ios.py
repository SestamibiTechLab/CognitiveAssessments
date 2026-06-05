from PIL import Image
import os

# iOS target resolution (iPhone 6.7")
iOS_WIDTH = 1290
iOS_HEIGHT = 2796
BG_LIGHT = (219, 231, 243)  # App background color

# Android screenshots to convert
android_screenshots = [
    ("store/screenshots/PlayStore_screenshot1.png", "01_main_screen.png"),
    ("store/screenshots/PlayStore_screenshot2.png", "02_assessment_intro.png"),
    ("store/screenshots/PlayStore_screenshot3.png", "03_assessment_question.png"),
    ("store/screenshots/PlayStore_screenshot4.png", "04_assessment_results.png"),
    ("store/screenshots/PlayStore_screenshot5.png", "05_history.png"),
    ("store/screenshots/PlayStore_screenshot6.png", "06_about.png"),
]

def convert_to_ios(android_path, ios_filename):
    """Convert Android screenshot to iOS resolution"""
    try:
        # Open Android screenshot
        img = Image.open(android_path)
        print(f"Opened {android_path}: {img.size}")

        # Calculate aspect ratio and resize
        android_ratio = img.width / img.height
        ios_ratio = iOS_WIDTH / iOS_HEIGHT

        if android_ratio > ios_ratio:
            # Android is wider - fit by height
            new_height = iOS_HEIGHT
            new_width = int(iOS_HEIGHT * android_ratio)
        else:
            # Android is narrower - fit by width
            new_width = iOS_WIDTH
            new_height = int(iOS_WIDTH / android_ratio)

        # Resize
        img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # Create iOS canvas with app background color
        ios_img = Image.new('RGB', (iOS_WIDTH, iOS_HEIGHT), BG_LIGHT)

        # Center the screenshot on the canvas
        x = (iOS_WIDTH - new_width) // 2
        y = (iOS_HEIGHT - new_height) // 2
        ios_img.paste(img_resized, (x, y))

        # Save to ios directory
        os.makedirs("store/screenshots/ios", exist_ok=True)
        output_path = f"store/screenshots/ios/{ios_filename}"
        ios_img.save(output_path)
        print(f"[OK] Saved: {output_path}")
        return True
    except Exception as e:
        print(f"[ERROR] Converting {android_path}: {e}")
        return False

print("Converting Android screenshots to iOS resolution (1290x2796)...\n")

success_count = 0
for android_path, ios_filename in android_screenshots:
    if os.path.exists(android_path):
        if convert_to_ios(android_path, ios_filename):
            success_count += 1
    else:
        print(f"[MISSING] File not found: {android_path}")

print(f"\n{'='*60}")
print(f"Conversion complete: {success_count}/{len(android_screenshots)} screenshots")
print(f"Output directory: store/screenshots/ios/")
print(f"{'='*60}")
