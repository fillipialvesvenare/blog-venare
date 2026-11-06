"""Gera as imagens de compartilhamento (1200x630) de cada publicação em static/og/.
Uso: python3 scripts/og.py   (requer Pillow)"""
import json, glob, os, textwrap
from PIL import Image, ImageDraw, ImageFont
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = lambda n, s: ImageFont.truetype(os.path.join(R, 'scripts/fonts', n), s)
NAVY, ELET, LAV = '#070F40', '#4C67FF', '#8698FF'
pattern = Image.open(os.path.join(R, 'scripts/pattern.png')).convert('RGBA')
logo = Image.open(os.path.join(R, 'scripts/venare-news-branco.png')).convert('RGBA')
logo.thumbnail((560, 60))

def base():
    im = Image.new('RGBA', (1200, 630), NAVY)
    p = pattern.copy(); p.thumbnail((760, 760))
    a = p.split()[3].point(lambda v: int(v * .28)); p.putalpha(a)
    im.alpha_composite(p, (1200 - p.width + 140, -60))
    im.alpha_composite(logo, (72, 72))
    return im

def wrap(draw, txt, font, maxw):
    words, lines, cur = txt.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=font) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur); return lines

def card(titulo, tag, destaque, out):
    im = base(); d = ImageDraw.Draw(im)
    ft = F('Prompt-Medium.ttf', 26)
    tw = d.textlength(tag, font=ft)
    d.rounded_rectangle((72, 190, 72 + tw + 28, 232), 6, fill=ELET)
    d.text((86, 194), tag, font=ft, fill='white')
    size = 62
    while True:
        fh = F('Prompt-ExtraBold.ttf', size)
        lines = wrap(d, titulo.upper(), fh, 1056 if not destaque else 720)
        if len(lines) <= 4 or size <= 40: break
        size -= 4
    y = 262
    for l in lines:
        d.text((72, y), l, font=fh, fill='white'); y += int(size * 1.08)
    if destaque:
        fd = F('Prompt-ExtraBold.ttf', 96)
        w = d.textlength(destaque, font=fd)
        d.text((1128 - w, 300), destaque, font=fd, fill=LAV)
    d.text((72, 572), 'venarenews.com.br', font=F('Prompt-Medium.ttf', 22), fill=LAV)
    im.convert('RGB').save(out, quality=88)

os.makedirs(os.path.join(R, 'static/og'), exist_ok=True)
card('Mercado imobiliário de Santa Catarina para investidores', 'Venare News', None, os.path.join(R, 'static/og/padrao.jpg'))
for f in glob.glob(os.path.join(R, 'content/edicoes/*.json')):
    ed = json.load(open(f, encoding='utf-8'))
    for p in ed['publicacoes']:
        out = os.path.join(R, 'static/og', p['slug'] + '.jpg')
        if os.path.exists(out): continue
        v = p.get('visual') or {}
        dest = v.get('valor') if v.get('tipo') == 'numero' else None
        card(p['titulo'], p['formato'], dest, out)
print('OG ok')
