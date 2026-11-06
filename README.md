# Blog Venare

Blog de notícias, índices e análises do mercado imobiliário de Santa Catarina para investidores.

- Conteúdo: `content/edicoes/*.json` (5 publicações por dia) e `content/indices.json`.
- Visual: `static/style.css`, `static/app.js`, imagens da marca em `static/img/`.
- Gerar o site: `node build.mjs` (sem dependências; saída em `dist/`).
- Hospedagem: Cloudflare Pages, conectado a este repositório. Build command `node build.mjs`, output `dist`.
- Rotina de publicação diária: ver `ROTINA.md`.
