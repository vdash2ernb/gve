# Turns the supplied client logos into single-colour navy marks for the homepage logo strip.
# Needs Python 3 with Pillow. Run from the project root:  python scripts/make-client-logos.py
#
# Each logo is reduced to a mask, then filled with GVE navy on a transparent background:
#   alpha  the logo's own transparency (shapes on a transparent background)
#   ink    darkness within the logo, so white details and white backgrounds drop out
#   key    distance from a solid background colour (logos supplied on a coloured square)
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter

NAVY = (0, 32, 61)
SOURCE, OUT = Path('public/partners'), Path('public/partners/mono')
TARGET_HEIGHT = 240  # Sharp at the largest display size on high-density screens.

logos = {
    'antler.png': ('alpha', {}),
    'big-bear-logo.jpg': ('key', {'bg': (65, 65, 65), 'spread': 60}),
    'calistar-management.png': ('ink', {}),
    'high-desert-homes.png': ('alpha', {}),
    'hill-mortgage.png': ('alpha', {}),
    'izozi.png': ('alpha', {}),
    'mw-design.png': ('alpha', {}),
    'navo-builders.webp': ('ink', {'low': .06, 'high': .5}),
    'onebio.png': ('ink', {'low': .02, 'high': .42}),
    'river-roofing.png': ('alpha', {}),
    'silver-peak.png': ('alpha', {}),
    'truss.png': ('alpha', {}),
    'window-door-shoppe.png': ('alpha', {}),
}


def mask_for(image, mode, options):
    rgba = image.convert('RGBA')
    alpha = rgba.getchannel('A')
    if mode == 'alpha':
        return alpha
    if mode == 'ink':
        low, high = options.get('low', .1), options.get('high', .9)
        # Darkness rescaled so near-white is clear and anything darker than `high` is solid.
        dark = rgba.convert('L').point(lambda v: round(255 * min(1, max(0, (1 - v / 255 - low) / (high - low)))))
        return ImageChops.multiply(dark, alpha)
    bg, spread = options['bg'], options['spread']
    solid = Image.new('RGB', rgba.size, bg)
    distance = ImageChops.difference(rgba.convert('RGB'), solid).convert('L')
    return distance.point(lambda v: round(255 * min(1, v / spread)))


def build(name, mode, options):
    mask = mask_for(Image.open(SOURCE / name), mode, options)
    box = mask.point(lambda v: 255 if v > 10 else 0).getbbox()
    mask = mask.crop(box)
    scale = TARGET_HEIGHT / mask.height
    mask = mask.resize((round(mask.width * scale), TARGET_HEIGHT), Image.LANCZOS)
    if scale > 1.5:
        # Small sources: firm up the soft edges left by enlarging, keeping a little antialiasing.
        mask = mask.filter(ImageFilter.GaussianBlur(.6)).point(lambda v: round(255 * min(1, max(0, (v - 70) / 115))))
    mark = Image.new('RGBA', mask.size, NAVY + (0,))
    mark.putalpha(mask)
    out = OUT / (Path(name).stem + '.png')
    mark.save(out, optimize=True)
    return {'src': '/' + out.as_posix().removeprefix('public/'), 'width': mark.width, 'height': mark.height}


OUT.mkdir(exist_ok=True)
manifest = {name: build(name, mode, options) for name, (mode, options) in logos.items()}
Path('src/content/client-logos.json').write_text(json.dumps(manifest, indent=2) + '\n')
for name, mark in manifest.items():
    print(f"{name:28} {mark['width']}x{mark['height']}")
