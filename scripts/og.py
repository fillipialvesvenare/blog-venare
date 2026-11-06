"""Gera as imagens de compartilhamento: 1200x630 (links) em static/og/ e 1080x1920 (Stories do Instagram) em static/story/.
Uso: python3 scripts/og.py   (requer Pillow)"""
import json, glob, os, textwrap
from PIL import Image, ImageDraw, ImageFont
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = lambda n, s: ImageFont.truetype(os.path.join(R, 'scripts/fonts', n), s)
NAVY, ELET, LAV = '#070F40', '#4C67FF', '#8698FF'
tile = Image.open(os.path.join(R, 'scripts/padrao-tile.png')).convert('RGBA')
tile = tile.resize((150, round(150*tile.height/tile.width)), Image.LANCZOS)
logo = Image.open(os.path.join(R, 'scripts/venare-news-branco.png')).convert('RGBA')
logo.thumbnail((560, 60))
SITE = json.load(open(os.path.join(R, 'site.json'), encoding='utf-8'))
HOST = SITE['url'].split('//')[1].rstrip('/')

def base():
    im = Image.new('RGBA', (1200, 630), NAVY)
    layer = Image.new('RGBA', (1200, 630), (0, 0, 0, 0))
    for y in range(0, 630, tile.height):
        for x in range(1200 - tile.width, -tile.width, -tile.width):
            layer.alpha_composite(tile, (x, y))
    # esmaece da direita para a esquerda, sem chegar ao meio
    mask = Image.new('L', (1200, 630), 0)
    px = mask.load()
    for x in range(1200):
        t = (x - 650) / 550
        v = 0 if t <= 0 else int(255 * 0.30 * min(1, t) ** 1.3)
        for y in range(630): px[x, y] = v
    a = layer.split()[3]
    from PIL import ImageChops
    layer.putalpha(ImageChops.multiply(a, mask))
    im.alpha_composite(layer)
    im.alpha_composite(logo, (72, 72))
    return im

def wrap(draw, txt, font, maxw):
    words, lines, cur = txt.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=font) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur); return lines

def padrao(W, H, inicio, forca, tam):
    t = tile.resize((tam, round(tam*tile.height/tile.width)), Image.LANCZOS)
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for y in range(0, H, t.height):
        for x in range(W - t.width, -t.width, -t.width):
            layer.alpha_composite(t, (x, y))
    mask = Image.new('L', (W, H), 0); px = mask.load()
    for x in range(W):
        k = (x - inicio) / (W - inicio)
        v = 0 if k <= 0 else int(255 * forca * min(1, k) ** 1.3)
        for y in range(H): px[x, y] = v
    from PIL import ImageChops
    layer.putalpha(ImageChops.multiply(layer.split()[3], mask))
    return layer

def story(p, out):
    W, H = 1080, 1920
    im = Image.new('RGBA', (W, H), NAVY)
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dg = ImageDraw.Draw(glow)
    for i in range(60):
        r = 900 - i * 12; a = int(2 + i * 0.9)
        dg.ellipse((-r // 2 - 200, H - r // 2 - 100, r // 2 + 200 - 200, H + r // 2 - 100), fill=(76, 103, 255, a))
    im.alpha_composite(glow)
    im.alpha_composite(padrao(W, H, 520, 0.22, 200))
    lg = Image.open(os.path.join(R, 'scripts/venare-news-branco.png')).convert('RGBA'); lg.thumbnail((640, 80))
    im.alpha_composite(lg, (90, 150))
    d = ImageDraw.Draw(im)
    ft = F('Prompt-Medium.ttf', 40); tag = p['formato']
    tw = d.textlength(tag, font=ft)
    d.rounded_rectangle((90, 420, 90 + tw + 44, 486), 10, fill=ELET)
    d.text((112, 426), tag, font=ft, fill='white')
    size = 96
    while True:
        fh = F('Prompt-ExtraBold.ttf', size)
        lines = wrap(d, p['titulo'].upper(), fh, 900)
        if len(lines) <= 6 or size <= 60: break
        size -= 6
    y = 530
    for l in lines:
        d.text((90, y), l, font=fh, fill='white'); y += int(size * 1.08)
    y += 50
    v = p.get('visual') or {}
    if v.get('tipo') == 'numero':
        fd = F('Prompt-ExtraBold.ttf', 170)
        d.text((86, y), v['valor'], font=fd, fill=LAV); y += 200
        for l in wrap(d, v.get('legenda', ''), F('Prompt-Medium.ttf', 40), 900):
            d.text((90, y), l, font=F('Prompt-Medium.ttf', 40), fill='white'); y += 54
    else:
        fr = F('Prompt-Medium.ttf', 44)
        for l in wrap(d, p['resumo'], fr, 900)[:6]:
            d.text((90, y), l, font=fr, fill=(255, 255, 255, 230)); y += 62
    # rodapé com chamada
    caixa = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(caixa).rounded_rectangle((90, 1600, 990, 1740), 28, fill=(255, 255, 255, 30), outline=(255, 255, 255, 110), width=2)
    im.alpha_composite(caixa); d = ImageDraw.Draw(im)
    d.text((130, 1622), 'Leia a notícia completa no', font=F('Prompt-Medium.ttf', 36), fill=LAV)
    d.text((130, 1670), HOST, font=F('Prompt-ExtraBold.ttf', 44), fill='white')
    d.text((90, 1790), '@venareinvestimentos', font=F('Prompt-Medium.ttf', 34), fill=LAV)
    im.convert('RGB').save(out, quality=86)

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
    d.text((72, 572), HOST, font=F('Prompt-Medium.ttf', 22), fill=LAV)
    im.convert('RGB').save(out, quality=88)

os.makedirs(os.path.join(R, 'static/og'), exist_ok=True)
os.makedirs(os.path.join(R, 'static/story'), exist_ok=True)
card('Mercado imobiliário de Santa Catarina para investidores', 'Venare News', None, os.path.join(R, 'static/og/padrao.jpg'))
for f in glob.glob(os.path.join(R, 'content/edicoes/*.json')):
    ed = json.load(open(f, encoding='utf-8'))
    for p in ed['publicacoes']:
        st = os.path.join(R, 'static/story', p['slug'] + '.jpg')
        if not os.path.exists(st): story(p, st)
        out = os.path.join(R, 'static/og', p['slug'] + '.jpg')
        if os.path.exists(out): continue
        v = p.get('visual') or {}
        dest = v.get('valor') if v.get('tipo') == 'numero' else None
        card(p['titulo'], p['formato'], dest, out)
print('OG ok')
