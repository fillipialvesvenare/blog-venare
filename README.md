# Venare News

Site de notícias, índices e análises do mercado imobiliário de Santa Catarina para investidores.

- Conteúdo: `content/edicoes/*.json` (5 publicações por dia) e `content/indices.json`.
- Visual: `static/style.css`, `static/app.js`, imagens da marca em `static/img/`.
- Fotos das notícias: catálogo `content/fotos.json` (crédito e licença) e arquivos 1200x600 em `static/fotos/`. Cada publicação aponta para uma foto com `"foto": {"id", "legenda"}`. Fotos novas e inéditas: `PIXABAY_KEY=... python3 scripts/fotos.py content/edicoes/AAAA-MM-DD.json`.
- Gerar o site: `node build.mjs` (sem dependências; saída em `dist/`).
- Hospedagem: Cloudflare Pages, conectado a este repositório. Build command `node build.mjs`, output `dist`.
- Rotina de publicação diária: ver `ROTINA.md`.
