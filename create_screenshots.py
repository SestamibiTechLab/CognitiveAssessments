from PIL import Image, ImageDraw, ImageFont
import textwrap

# Colors (matching app theme)
BG_LIGHT = (219, 231, 243)      # #dbe7f3 (light blue)
BG_WHITE = (255, 255, 255)      # white
TEXT_DARK = (31, 45, 92)        # #1f2d5c (dark blue)
TEXT_ACCENT = (91, 159, 187)    # #5b9fbb (medium blue)
BUTTON_BLUE = (13, 110, 253)    # #0d6efd (action blue)
TEXT_MUTED = (136, 136, 136)    # gray
BORDER_COLOR = (208, 220, 232)  # light border

# iPhone 6.7" (iOS App Store requirement)
PHONE_WIDTH = 1290
PHONE_HEIGHT = 2796
SAFE_AREA = 120

def get_font(size):
    """Load a TrueType font, with fallback to default"""
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",  # Linux
        "/System/Library/Fonts/Helvetica.ttc",  # macOS
        "C:\\Windows\\Fonts\\arial.ttf",  # Windows
    ]
    for path in font_paths:
        try:
            return ImageFont.truetype(path, size)
        except:
            continue
    return ImageFont.load_default()

def create_phone_frame(content_image):
    """Add iOS phone frame around screenshot"""
    frame = Image.new('RGB', (PHONE_WIDTH, PHONE_HEIGHT), (0, 0, 0))
    # Paste content
    frame.paste(content_image, (0, SAFE_AREA))
    return frame

def create_main_screen():
    """Opening screen with assessment cards"""
    img = Image.new('RGB', (PHONE_WIDTH, PHONE_HEIGHT - SAFE_AREA), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    title_font = get_font(72)
    card_title_font = get_font(42)
    card_text_font = get_font(33)

    # Title
    draw.text((60, 90), "Cognitive Assessments", fill=TEXT_DARK, font=title_font)

    # Assessment cards
    cards = [
        ("SLUMS", "Saint Louis University\nMental Status Exam"),
        ("RUDAS", "Rowland Universal\nDementia Assessment"),
        ("AD8", "AD8 Dementia Screening\nInterview"),
        ("MoCA", "Montreal Cognitive\nAssessment"),
    ]

    y = 270
    for title, subtitle in cards:
        draw.rectangle([(60, y), (1230, y + 210)], fill=BG_WHITE, outline=BORDER_COLOR, width=3)
        draw.text((90, y + 30), title, fill=BUTTON_BLUE, font=card_title_font)
        for i, line in enumerate(subtitle.split('\n')):
            draw.text((90, y + 90 + (i * 45)), line, fill=TEXT_DARK, font=card_text_font)
        y += 255

    return img

def create_slums_intro():
    """SLUMS first question screen"""
    img = Image.new('RGB', (PHONE_WIDTH, PHONE_HEIGHT - SAFE_AREA), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    title_font = get_font(54)
    question_font = get_font(42)

    draw.text((60, 60), "SLUMS Assessment", fill=TEXT_DARK, font=title_font)
    draw.text((60, 135), "Question 1 of 11", fill=TEXT_ACCENT, font=question_font)

    draw.rectangle([(60, 225), (1230, 840)], fill=BG_WHITE, outline=BORDER_COLOR, width=3)
    draw.text((90, 255), "What is the day of the\nweek?", fill=TEXT_DARK, font=question_font)

    y = 480
    draw.rectangle([(90, y), (1200, y + 135)], fill=BG_LIGHT, outline=BUTTON_BLUE, width=6)
    draw.text((135, y + 36), "Correct (1 point)", fill=TEXT_DARK, font=question_font)

    y = 570
    draw.rectangle([(90, y), (1200, y + 105)], fill=BG_WHITE, outline=BORDER_COLOR, width=3)
    draw.text((135, y + 24), "Incorrect", fill=TEXT_MUTED, font=question_font)

    return img

def create_slums_timer():
    """SLUMS with timer visible"""
    img = Image.new('RGB', (PHONE_WIDTH, PHONE_HEIGHT - SAFE_AREA), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    title_font = get_font(54)
    question_font = get_font(42)
    timer_font = get_font(96)

    draw.text((60, 60), "Animal Naming Task", fill=TEXT_DARK, font=title_font)

    # Timer
    draw.rectangle([(840, 45), (1200, 195)], fill=BUTTON_BLUE)
    draw.text((855, 60), "00:45", fill=BG_WHITE, font=timer_font)

    draw.rectangle([(60, 225), (1230, 600)], fill=BG_WHITE, outline=BORDER_COLOR, width=3)
    draw.text((90, 270), "Name as many animals\nas possible in 60 seconds.", fill=TEXT_DARK, font=question_font)
    draw.text((90, 450), "Counted: 3 animals", fill=TEXT_ACCENT, font=question_font)

    return img

def create_slums_results():
    """SLUMS results screen"""
    img = Image.new('RGB', (PHONE_WIDTH, PHONE_HEIGHT - SAFE_AREA), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    title_font = get_font(66)
    score_font = get_font(144)
    label_font = get_font(39)

    draw.text((60, 90), "Assessment Complete", fill=TEXT_DARK, font=title_font)

    draw.rectangle([(150, 270), (1140, 600)], fill=BG_WHITE, outline=BORDER_COLOR, width=3)
    draw.text((330, 330), "25", fill=BUTTON_BLUE, font=score_font)
    draw.text((345, 510), "out of 30 points", fill=TEXT_ACCENT, font=label_font)

    draw.rectangle([(60, 660), (1230, 1020)], fill='#e8f0fa', outline='#0d6efd', width=3)
    draw.text((90, 705), "Interpretation:", fill=BUTTON_BLUE, font=label_font)
    draw.text((90, 780), "Normal Cognition", fill=TEXT_DARK, font=title_font)
    draw.text((90, 870), "Score indicates no cognitive\nimpairment.", fill=TEXT_DARK, font=label_font)

    return img

def create_rudas_intro():
    """RUDAS first question screen"""
    img = Image.new('RGB', (PHONE_WIDTH, PHONE_HEIGHT - SAFE_AREA), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    title_font = get_font(54)
    question_font = get_font(39)

    draw.text((60, 60), "RUDAS Assessment", fill=TEXT_DARK, font=title_font)
    draw.text((60, 135), "Question 1 of 6", fill=TEXT_ACCENT, font=question_font)

    draw.rectangle([(60, 225), (1230, 840)], fill=BG_WHITE, outline=BORDER_COLOR, width=3)
    draw.text((90, 255), "Body Orientation", fill=TEXT_DARK, font=title_font)
    draw.text((90, 345), "Can you tell me which\npart of the body this is?", fill=TEXT_MUTED, font=question_font)

    draw.rectangle([(150, 450), (1140, 720)], fill='#f0f4fa', outline=BORDER_COLOR, width=3)
    draw.text((300, 555), "[Body Part Image]", fill=TEXT_ACCENT, font=question_font)

    return img

def create_rudas_cube():
    """RUDAS cube drawing screen"""
    img = Image.new('RGB', (PHONE_WIDTH, PHONE_HEIGHT - SAFE_AREA), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    title_font = get_font(54)
    question_font = get_font(42)

    draw.text((60, 60), "RUDAS - Cube Drawing", fill=TEXT_DARK, font=title_font)
    draw.text((60, 135), "Draw a cube in the space", fill=TEXT_ACCENT, font=question_font)

    draw.rectangle([(60, 255), (1230, 1350)], fill=BG_WHITE, outline=BORDER_COLOR, width=6)

    # Simple cube (scaled up)
    draw.rectangle([(240, 450), (390, 600)], outline=TEXT_DARK, width=6)
    draw.rectangle([(330, 360), (480, 510)], outline=TEXT_DARK, width=6)
    draw.line([(390, 450), (480, 510)], fill=TEXT_DARK, width=6)
    draw.line([(390, 600), (480, 660)], fill=TEXT_DARK, width=6)
    draw.rectangle([(480, 510), (630, 660)], outline=TEXT_DARK, width=6)

    return img

def create_rudas_results():
    """RUDAS results screen"""
    img = Image.new('RGB', (PHONE_WIDTH, PHONE_HEIGHT - SAFE_AREA), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    title_font = get_font(66)
    score_font = get_font(144)
    label_font = get_font(39)

    draw.text((60, 90), "Assessment Complete", fill=TEXT_DARK, font=title_font)

    draw.rectangle([(150, 270), (1140, 600)], fill=BG_WHITE, outline=BORDER_COLOR, width=3)
    draw.text((330, 330), "28", fill=BUTTON_BLUE, font=score_font)
    draw.text((345, 510), "out of 30 points", fill=TEXT_ACCENT, font=label_font)

    draw.rectangle([(60, 660), (1230, 1020)], fill='#e8f0fa', outline='#0d6efd', width=3)
    draw.text((90, 705), "Interpretation:", fill=BUTTON_BLUE, font=label_font)
    draw.text((90, 780), "No Cognitive Impairment", fill=TEXT_DARK, font=title_font)
    draw.text((90, 870), "Score above cutoff (>22).", fill=TEXT_DARK, font=label_font)

    return img

def create_ad8_intro():
    """AD8 first question screen"""
    img = Image.new('RGB', (PHONE_WIDTH, PHONE_HEIGHT - SAFE_AREA), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    title_font = get_font(54)
    question_font = get_font(36)

    draw.text((60, 60), "AD8 Dementia Screening", fill=TEXT_DARK, font=title_font)
    draw.text((60, 135), "Question 1 of 8", fill=TEXT_ACCENT, font=question_font)

    draw.rectangle([(60, 225), (1230, 660)], fill=BG_WHITE, outline=BORDER_COLOR, width=3)
    draw.text((90, 270), "Is there evidence of\ndecreased judgment\ncompared to 10 years ago?", fill=TEXT_DARK, font=question_font)

    y = 480
    for label in ["Yes, definitely", "Yes, probably"]:
        draw.rectangle([(90, y), (1200, y + 105)], fill=BG_LIGHT, outline=BUTTON_BLUE, width=3)
        draw.text((135, y + 24), label, fill=TEXT_DARK, font=question_font)
        y += 120

    return img

def create_ad8_results():
    """AD8 results screen"""
    img = Image.new('RGB', (PHONE_WIDTH, PHONE_HEIGHT - SAFE_AREA), BG_LIGHT)
    draw = ImageDraw.Draw(img)

    title_font = get_font(66)
    score_font = get_font(144)
    label_font = get_font(39)

    draw.text((60, 90), "Assessment Complete", fill=TEXT_DARK, font=title_font)

    draw.rectangle([(210, 270), (1080, 600)], fill=BG_WHITE, outline=BORDER_COLOR, width=3)
    draw.text((390, 330), "1", fill=BUTTON_BLUE, font=score_font)
    draw.text((360, 510), "out of 8 points", fill=TEXT_ACCENT, font=label_font)

    draw.rectangle([(60, 660), (1230, 1020)], fill='#e8f0fa', outline='#0d6efd', width=3)
    draw.text((90, 705), "Interpretation:", fill=BUTTON_BLUE, font=label_font)
    draw.text((90, 780), "No Dementia Suspected", fill=TEXT_DARK, font=title_font)
    draw.text((90, 870), "Score <2 suggests no\ncognitive decline.", fill=TEXT_DARK, font=label_font)

    return img

# Create screenshots
screenshots = {
    "01_main_screen.png": create_main_screen(),
    "02_slums_intro.png": create_slums_intro(),
    "03_slums_timer.png": create_slums_timer(),
    "04_slums_results.png": create_slums_results(),
    "05_rudas_intro.png": create_rudas_intro(),
    "06_rudas_cube.png": create_rudas_cube(),
    "07_rudas_results.png": create_rudas_results(),
    "08_ad8_intro.png": create_ad8_intro(),
    "09_ad8_results.png": create_ad8_results(),
}

for filename, img in screenshots.items():
    framed = create_phone_frame(img)
    framed.save(filename)
    print(f"Created {filename}")

print("\nAll screenshots created!")
