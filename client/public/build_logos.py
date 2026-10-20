import base64
from PIL import Image, ImageDraw
import numpy as np

# 1. Load source banner
banner_path = 'client/public/AIXChange_banner.png'
im = Image.open(banner_path).convert('RGB')
w, h = im.size

# Exact bounding box of the emblem: X: [156, 684], Y: [163, 567]
pad = 16
x0 = max(0, 156 - pad)
y0 = max(0, 163 - pad)
x1 = min(685, 684 + pad)
y1 = min(h, 567 + pad)

ew = x1 - x0
eh = y1 - y0
side = max(ew, eh)
cx = (x0 + x1) / 2
cy = (y0 + y1) / 2
sq_x0 = int(cx - side / 2)
sq_y0 = int(cy - side / 2)
sq_x1 = sq_x0 + side
sq_y1 = sq_y0 + side

crop = im.crop((sq_x0, sq_y0, sq_x1, sq_y1))
arr = np.array(crop).astype(np.float32)

# Save exact high-res square crop
crop.save('client/public/aix-logo-raw.png')

# 2. Transparent version with smooth luminance alpha
v = np.max(arr, axis=2) / 255.0
# Alpha with soft threshold
alpha = np.clip((v - 0.02) / (1.0 - 0.02), 0.0, 1.0)
alpha = np.power(alpha, 0.75) * 255.0
safe_alpha = np.maximum(alpha / 255.0, 0.001)[:, :, np.newaxis]
rgb_unpremult = np.clip(arr / safe_alpha, 0, 255)
rgb_final = np.where(safe_alpha > 0.35, arr, rgb_unpremult).astype(np.uint8)
rgba = np.dstack((rgb_final, alpha.astype(np.uint8)))
img_rgba = Image.fromarray(rgba, 'RGBA')
img_rgba.save('client/public/aix-logo.png')

# 3. Squircle icon for high contrast in browser tabs (light/dark mode tabs)
squircle = Image.new('RGBA', (side, side), (0, 0, 0, 0))
draw = ImageDraw.Draw(squircle)
r = int(side * 0.22)
draw.rounded_rectangle([2, 2, side - 2, side - 2], radius=r, fill=(5, 8, 15, 255), outline=(56, 189, 248, 120), width=6)
crop_rgba = crop.convert('RGBA')
squircle_icon = Image.alpha_composite(squircle, crop_rgba)
squircle_icon.save('client/public/aix-logo-squircle.png')

# 4. Multi-resolution PNGs
for s in [16, 32, 48, 64, 128, 180, 192, 256, 512]:
    resized = squircle_icon.resize((s, s), Image.Resampling.LANCZOS)
    if s == 32:
        resized.save('client/public/favicon-32x32.png')
    elif s == 16:
        resized.save('client/public/favicon-16x16.png')
    elif s == 180:
        resized.save('client/public/apple-touch-icon.png')
    elif s == 192:
        resized.save('client/public/logo192.png')
    elif s == 512:
        resized.save('client/public/logo512.png')

# 5. Build base64 strings
with open('client/public/aix-logo.png', 'rb') as f:
    b64_trans = base64.b64encode(f.read()).decode('utf-8')

with open('client/public/aix-logo-squircle.png', 'rb') as f:
    b64_squircle = base64.b64encode(f.read()).decode('utf-8')

# 6. Build favicon.svg (used in browser tab)
# It has a rich modern squircle container with cyan/blue accents and the radiant emblem
favicon_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="aix-glow-bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0E2138" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="#050913" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#020408" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="aix-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.7"/>
      <stop offset="50%" stop-color="#1D4ED8" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#00F0FF" stop-opacity="0.6"/>
    </linearGradient>
    <filter id="tab-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- High-contrast dark container ensuring visibility in any browser tab theme -->
  <rect x="12" y="12" width="488" height="488" rx="110" fill="url(#aix-glow-bg)" stroke="url(#aix-border)" stroke-width="4"/>

  <!-- AIXchange 3D Substrate Emblem -->
  <g filter="url(#tab-glow)">
    <image href="data:image/png;base64,{b64_trans}" x="30" y="30" width="452" height="452" preserveAspectRatio="xMidYMid meet"/>
  </g>
</svg>"""

with open('client/public/favicon.svg', 'w', encoding='utf-8') as f:
    f.write(favicon_svg)

# 7. Pure transparent SVG
pure_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side} {side}" width="100%" height="100%">
  <defs>
    <filter id="aix-subtle-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <image href="data:image/png;base64,{b64_trans}" x="0" y="0" width="{side}" height="{side}" preserveAspectRatio="xMidYMid meet" filter="url(#aix-subtle-glow)"/>
</svg>"""

with open('client/public/aix-logo.svg', 'w', encoding='utf-8') as f:
    f.write(pure_svg)

print("SUCCESS: Generated all logo assets and SVGs!")
