"""Busca uma foto inédita para cada publicação de uma edição e salva no site.

Uso:  PIXABAY_KEY=xxxx python3 scripts/fotos.py content/edicoes/AAAA-MM-DD.json

Em cada publicação, o campo `foto` deve ter:
  "foto": {"busca": ["termo mais específico", "termo alternativo", "termo genérico"], "legenda": "..."}
Os termos são tentados em ordem (em português ou inglês). O script:
  - procura no Pixabay (fotos reais, uso comercial liberado), prioriza imagens grandes e horizontais;
  - nunca usa uma foto que já apareceu no site (registro em content/fotos.json, campo `origem`);
  - recorta em 1200x600, salva em static/fotos/<slug>.jpg e registra crédito e licença em content/fotos.json;
  - grava "id" no campo foto da publicação (mantendo a legenda).
Publicações que já têm `foto.id` válido e ainda não usado por outra publicação ficam como estão.
Para trocar uma foto que não combinou: no campo foto, coloque "trocar": true (e, se quiser, novos termos em "busca").
A foto rejeitada é apagada e nunca mais é escolhida.
"""
import io, json, os, sys, time, urllib.parse, urllib.request
from PIL import Image

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAT = os.path.join(R, 'content/fotos.json')
DIR = os.path.join(R, 'static/fotos')
KEY = os.environ.get('PIXABAY_KEY', '').strip()
UA = {'User-Agent': 'VenareNewsBot/1.0 (https://venarenews.com.br; contato@venare.com.br)'}


def get(url, tries=3):
    for i in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read()
        except Exception as e:
            if i == tries - 1:
                raise
            time.sleep(3 * (i + 1))


def pixabay(q):
    if not KEY:
        sys.exit('Falta a variável PIXABAY_KEY.')
    out = []
    for lang in ('pt', 'en'):
        p = urllib.parse.urlencode({'key': KEY, 'q': q[:100], 'lang': lang, 'image_type': 'photo', 'orientation': 'horizontal',
                                    'min_width': 1600, 'safesearch': 'true', 'per_page': 40, 'order': 'popular'})
        d = json.loads(get('https://pixabay.com/api/?' + p))
        out += d.get('hits', [])
        if out:
            break
    return out


def recorta(data):
    im = Image.open(io.BytesIO(data)).convert('RGB')
    w, h = im.size
    if w / h > 2:  # muito panorâmica: corta as laterais
        nw = int(h * 2); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:          # corta em cima e embaixo, um pouco acima do centro
        nh = int(w / 2); top = max(0, int((h - nh) * 0.45)); im = im.crop((0, top, w, top + nh))
    return im.resize((1200, 600), Image.LANCZOS)


def main(fn):
    ed = json.load(open(fn, encoding='utf-8'))
    cat = json.load(open(CAT, encoding='utf-8')) if os.path.exists(CAT) else {}
    usadas = {v.get('origem') for v in cat.values() if v.get('origem')}
    dono = {k: v.get('usada_em') for k, v in cat.items()}
    falhas = []
    for p in ed['publicacoes']:
        f = p.get('foto') or {}
        fid = f.get('id')
        evitar = set(f.get('evitar', []))
        if f.get('trocar') and fid in cat:
            evitar.add(cat[fid].get('origem'))
            try: os.remove(os.path.join(DIR, fid + '.jpg'))
            except FileNotFoundError: pass
            cat.pop(fid); fid = None
        if fid and fid in cat and os.path.exists(os.path.join(DIR, fid + '.jpg')) and dono.get(fid) in (None, p['slug']):
            cat[fid]['usada_em'] = p['slug']; dono[fid] = p['slug']
            continue
        termos = f.get('busca') or [p['titulo']]
        escolhida = None
        for q in termos:
            for h in pixabay(q):
                origem = f"pixabay:{h['id']}"
                if origem in usadas or origem in evitar:
                    continue
                escolhida = (q, h, origem)
                break
            if escolhida:
                break
        if not escolhida:
            falhas.append(p['slug']); continue
        q, h, origem = escolhida
        img = recorta(get(h['largeImageURL']))
        fid = p['slug'][:80]
        img.save(os.path.join(DIR, fid + '.jpg'), quality=84, optimize=True, progressive=True)
        cat[fid] = {
            'descricao': f.get('legenda') or q,
            'temas': h.get('tags', ''),
            'autor': h.get('user', 'Pixabay'),
            'licenca': 'Licença Pixabay',
            'fonte': 'Pixabay',
            'url': h.get('pageURL', 'https://pixabay.com'),
            'origem': origem,
            'busca': q,
            'usada_em': p['slug'],
        }
        usadas.add(origem)
        novo = {k: v for k, v in f.items() if k not in ('busca', 'trocar')}
        if evitar: novo['evitar'] = sorted(x for x in evitar if x)
        novo['id'] = fid
        p['foto'] = novo
        print(f"{p['slug'][:60]} <- {origem} ({q}) por {h.get('user')}")
        time.sleep(1)
    json.dump(cat, open(CAT, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    with open(fn, 'w', encoding='utf-8') as o:
        json.dump(ed, o, ensure_ascii=False, indent=2); o.write('\n')
    ids = [p.get('foto', {}).get('id') for p in ed['publicacoes']]
    if len(set(ids)) != len(ids):
        sys.exit('ERRO: foto repetida na edição.')
    if falhas:
        sys.exit('Sem foto para: ' + ', '.join(falhas) + '. Tente outros termos em foto.busca.')
    print('FOTOS OK')


if __name__ == '__main__':
    main(sys.argv[1])
