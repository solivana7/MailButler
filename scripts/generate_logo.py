from PIL import Image, ImageDraw, ImageFont
import math

FONT_PATH = '/Library/Fonts/Arial Unicode.ttf'

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def interpolate_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def draw_rounded_gradient_bg(draw, size, radius, c1, c2, direction='diagonal'):
    w, h = size
    for y in range(h):
        for x in range(w):
            if direction == 'diagonal':
                t = (x + y) / (w + h)
            else:
                t = y / h
            draw.point((x, y), fill=interpolate_color(c1, c2, t))
    # Mask to rounded rect via composite
    mask = Image.new('L', size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, w-1, h-1), radius=radius, fill=255)
    img = Image.new('RGB', size, (0,0,0))
    img.paste(Image.new('RGB', size, (0,0,0)), mask=mask)
    # Actually easier: create image with gradient, then apply mask

def create_gradient_image(size, c1, c2, radius=None, transparent_corners=False):
    w, h = size
    mode = 'RGBA' if transparent_corners else 'RGB'
    img = Image.new(mode, size, (0, 0, 0, 0) if transparent_corners else (0, 0, 0))
    draw = ImageDraw.Draw(img)
    c1 = hex_to_rgb(c1)
    c2 = hex_to_rgb(c2)
    for y in range(h):
        for x in range(w):
            t = (x + y) / (w + h)
            draw.point((x, y), fill=interpolate_color(c1, c2, t) + (255,))
    if radius:
        mask = Image.new('L', size, 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle((0, 0, w-1, h-1), radius=radius, fill=255)
        result = Image.new(mode, size, (0, 0, 0, 0) if transparent_corners else (0, 0, 0))
        result.paste(img, (0, 0), mask=mask)
        return result
    return img

def draw_envelope(draw, cx, cy, w, h, color, shadow=True):
    color = hex_to_rgb(color)
    # Envelope body rectangle
    x1, y1 = cx - w//2, cy - h//2
    x2, y2 = cx + w//2, cy + h//2
    # Draw with slight rounded corners
    draw.rounded_rectangle([x1, y1, x2, y2], radius=18, fill=color)
    # Flap lines
    line_color = hex_to_rgb('#EDE9FE')
    # Top triangular flap lines
    draw.line([(x1, y1), (cx, cy)], fill=line_color, width=8)
    draw.line([(x2, y1), (cx, cy)], fill=line_color, width=8)
    # Bottom V line
    draw.line([(x1, y2), (cx, cy + h//4)], fill=line_color, width=8)
    draw.line([(x2, y2), (cx, cy + h//4)], fill=line_color, width=8)

def draw_sparkle(draw, cx, cy, size, color):
    color = hex_to_rgb(color)
    # 4-point star
    pts = [
        (cx, cy - size), (cx + size*0.3, cy - size*0.3),
        (cx + size, cy), (cx + size*0.3, cy + size*0.3),
        (cx, cy + size), (cx - size*0.3, cy + size*0.3),
        (cx - size, cy), (cx - size*0.3, cy - size*0.3),
    ]
    draw.polygon(pts, fill=color)

def create_icon(size, transparent_corners=True):
    img = create_gradient_image((size, size), '#7C3AED', '#0D0D12', radius=size//5 if transparent_corners else 0, transparent_corners=transparent_corners)
    draw = ImageDraw.Draw(img)
    # Envelope
    env_w = int(size * 0.55)
    env_h = int(size * 0.40)
    draw_envelope(draw, size//2, size//2, env_w, env_h, '#FFFFFF')
    # Sparkle
    spark_x = int(size * 0.75)
    spark_y = int(size * 0.28)
    draw_sparkle(draw, spark_x, spark_y, size//18, '#A78BFA')
    return img

def create_horizontal(width=2000, height=600):
    bg = hex_to_rgb('#0D0D12')
    img = Image.new('RGBA', (width, height), bg + (255,))
    # Icon
    icon = create_icon(400)
    img.paste(icon, (80, 100), icon)
    draw = ImageDraw.Draw(img)
    # Text
    try:
        font = ImageFont.truetype(FONT_PATH, 200)
    except Exception:
        font = ImageFont.load_default()
    text = 'SoliMail'
    bbox = draw.textbbox((0,0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_x = 560
    text_y = (height - text_h) // 2 - 40
    # Subtle glow/shadow
    draw.text((text_x+4, text_y+4), text, font=font, fill='#4C1D95')
    draw.text((text_x, text_y), text, font=font, fill='#FFFFFF')
    # Tagline
    try:
        tag_font = ImageFont.truetype(FONT_PATH, 44)
    except Exception:
        tag_font = ImageFont.load_default()
    tag = 'AI Email Command Center'
    draw.text((text_x, text_y + text_h + 80), tag, font=tag_font, fill='#A78BFA')
    return img

def main():
    icon = create_icon(1024, transparent_corners=True)
    icon.save('/Users/Natasha/mailbutler-audit/public/logo.png')

    solid_icon = create_icon(1024, transparent_corners=False).convert('RGB')
    solid_icon.resize((180, 180), Image.LANCZOS).save('/Users/Natasha/mailbutler-audit/public/apple-touch-icon.png')
    solid_icon.resize((64, 64), Image.LANCZOS).save('/Users/Natasha/mailbutler-audit/public/favicon.png')

    horizontal = create_horizontal()
    horizontal.save('/Users/Natasha/mailbutler-audit/public/logo-horizontal.png')
    horizontal.resize((600, 180), Image.LANCZOS).save('/Users/Natasha/mailbutler-audit/public/logo-horizontal-sm.png')

    print('Logos generated in public/')

if __name__ == '__main__':
    main()
