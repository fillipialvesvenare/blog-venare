// Gera o site estático do Venare News a partir de content/ e static/.
// Uso: node build.mjs  (saída em dist/). Sem dependências externas.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, 'dist');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const site = read('site.json');
const indices = read('content/indices.json');
const fotos = fs.existsSync(path.join(ROOT, 'content/fotos.json')) ? read('content/fotos.json') : {};
const edDir = path.join(ROOT, 'content/edicoes');
const edicoes = fs.readdirSync(edDir).filter((f) => f.endsWith('.json')).sort().reverse()
  .map((f) => read(`content/edicoes/${f}`));
const hoje = edicoes[0];

import crypto from 'node:crypto';
const ver = (rel) => crypto.createHash('md5').update(fs.readFileSync(path.join(ROOT, 'static', rel))).digest('hex').slice(0, 8);
const V = { css: ver('style.css'), js: ver('app.js'), logoA: ver('img/venare-news-azul.png'), logoB: ver('img/venare-news-branco.png') };
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const dt = (iso) => new Date(iso + 'T12:00:00-03:00');
const dataLonga = (iso) => { const d = dt(iso); return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; };
const dataCurta = (iso) => { const d = dt(iso); return `${d.getDate()} de ${MESES[d.getMonth()]}`; };
const num = (v, casas = 2) => v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
const wa = () => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsapp_msg)}`;
const ICON = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2ZM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0Zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2.4V17h16V7.4l-8 5.3-8-5.3ZM5.2 7 12 11.5 18.8 7H5.2Z"/></svg>',
  web: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-3a15.7 15.7 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8ZM12 4c.8 1.2 1.5 2.5 1.9 4h-3.8c.4-1.5 1.1-2.8 1.9-4ZM4.3 14a8.2 8.2 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4H4.3Zm.8 2h3a15.7 15.7 0 0 0 1.4 3.6A8 8 0 0 1 5.1 16Zm3-8h-3a8 8 0 0 1 4.4-3.6C8.9 5.5 8.4 6.7 8.1 8ZM12 20c-.8-1.2-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.8-1.9 4Zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4Zm.2 5.6c.6-1.1 1.1-2.3 1.4-3.6h3a8 8 0 0 1-4.4 3.6ZM16.3 14a16.5 16.5 0 0 0 0-4h3.4a8.2 8.2 0 0 1 0 4h-3.4Z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>',
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V2Zm12 8H5v9h14v-9ZM5 6v2h14V6H5Zm2 6h4v4H7v-4Z"/></svg>',
};
// ---------- fotos (catálogo em content/fotos.json, arquivos em static/fotos/) ----------
const fotoDe = (p) => (p.foto && fotos[p.foto.id] && fs.existsSync(path.join(ROOT, 'static/fotos', p.foto.id + '.jpg'))) ? { ...fotos[p.foto.id], ...p.foto, src: `/fotos/${p.foto.id}.jpg` } : null;
const credito = (f) => `Foto: ${esc(f.autor)} / ${esc(f.fonte || 'Wikimedia Commons')} (${esc(f.licenca)})`;
const mini = (p) => { const f = fotoDe(p); return f ? `<img class="o-foto" src="${f.src}" alt="" loading="lazy" width="1200" height="600">` : ''; };
const postUrl = (ed, p) => `/${ed.data.replace(/-/g, '/')}/${p.slug}/`;

// ---------- visuais ----------
function visual(v, grande = false) {
  if (!v) return '';
  if (v.tipo === 'numero') {
    return `<figure class="vis vis-numero"><span class="vis-num">${esc(v.valor)}</span><figcaption>${esc(v.legenda)}</figcaption></figure>`;
  }
  if (v.tipo === 'comparacao') {
    return `<figure class="vis vis-comp">${v.itens.map((i, k) => `<div class="comp-item${k === 0 ? ' comp-forte' : ''}"><span class="comp-val">${esc(i.valor)}</span><span class="comp-rot">${esc(i.rotulo)}</span><span class="comp-det">${esc(i.detalhe)}</span></div>`).join('')}</figure>`;
  }
  if (v.tipo === 'barras' || v.tipo === 'ranking') {
    const max = Math.max(...v.itens.map((i) => i.valor));
    // Unidades longas viram abreviação para caber na coluna do valor (ex.: "R$ 350 mi")
    const un = (v.unidade && v.unidade !== '%' ? v.unidade : '').replace(/\bmilhões\b/g, 'mi').replace(/\bbilhões\b/g, 'bi');
    const fmt = (x) => (un ? (un.startsWith('R$ ') ? `R$ ${x.toLocaleString('pt-BR')} ${un.slice(3)}` : `${x.toLocaleString('pt-BR')} ${un}`) : v.tipo === 'ranking' ? `R$ ${x.toLocaleString('pt-BR')}` : `${num(x)}%`);
    const itens = grande ? v.itens : v.itens.slice(0, v.tipo === 'ranking' ? 6 : 9);
    return `<figure class="vis vis-barras${grande ? ' grande' : ''}">
      ${v.titulo ? `<figcaption class="vis-tit">${esc(v.titulo)}</figcaption>` : ''}
      <ol class="barras" role="list">${itens.map((i) => `
        <li class="barra tom-${i.tom}"><span class="b-rot">${esc(i.rotulo)}</span><span class="b-trilho"><span class="b-preench" style="--w:${((i.valor / max) * 100).toFixed(1)}%"></span></span><span class="b-val">${fmt(i.valor)}</span></li>`).join('')}
      </ol>
      ${un ? '' : `<p class="legenda-cores"><span class="lc lc-sc">Santa Catarina</span><span class="lc lc-br">${v.tipo === 'ranking' ? 'Outros estados' : 'Brasil'}</span><span class="lc lc-ref">${v.tipo === 'ranking' ? 'Média nacional' : 'Inflação (IPCA)'}</span></p>`}
      ${v.nota && grande ? `<p class="vis-nota">${esc(v.nota)}</p>` : ''}
    </figure>`;
  }
  return '';
}

function share(url, titulo, variante = '') {
  return `<div class="share ${variante}" data-url="${esc(url)}" data-title="${esc(titulo)}">
    <span class="share-rot">Compartilhar</span>
    <a class="sh sh-wa" data-net="whatsapp" href="#" aria-label="Compartilhar no WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg></a>
    <a class="sh sh-li" data-net="linkedin" href="#" aria-label="Compartilhar no LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V21h-4v-4.98c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.92 1.3-1.92 2.63V21h-4V9.75Z"/></svg></a>
    <a class="sh sh-fb" data-net="facebook" href="#" aria-label="Compartilhar no Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4a20 20 0 0 0-2.2-.1c-2.2 0-3.7 1.3-3.7 3.8v2.4H8.1v3h2.5V21h2.9Z"/></svg></a>
    <a class="sh sh-x" data-net="x" href="#" aria-label="Compartilhar no X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z"/></svg></a>
    <button class="sh sh-ig" type="button" data-net="instagram" aria-label="Compartilhar no Instagram">${ICON.ig}</button>
    <button class="sh sh-copy" type="button" data-net="copy" aria-label="Copiar link"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2v-2h2V5H9v2H7V5a2 2 0 0 1 2-2ZM5 7h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm0 2v10h10V9H5Z"/></svg></button>
    <span class="share-ok" role="status" aria-live="polite"></span>
  </div>`;
}

// ---------- layout ----------
function pagina({ titulo, descricao, canonical, corpo, og = {} }) {
  const full = titulo ? (titulo.length > 48 ? titulo : `${titulo} | ${site.nome}`) : `${site.nome}: mercado imobiliário de SC para investidores`;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(descricao || site.descricao)}">
<link rel="canonical" href="${site.url}${canonical}">
<meta property="og:type" content="${og.tipo || 'website'}">
<meta property="og:title" content="${esc(titulo || site.nome)}">
<meta property="og:description" content="${esc(descricao || site.descricao)}">
<meta property="og:url" content="${site.url}${canonical}">
<meta property="og:locale" content="pt_BR">
<meta property="og:image" content="${site.url}/og/${og.imagem || 'padrao'}.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#070F40">
<link rel="icon" href="/img/simbolo.png">
<link rel="alternate" type="application/rss+xml" title="${site.nome}" href="/rss.xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css?v=${V.css}">
${og.jsonld ? `<script type="application/ld+json">${JSON.stringify(og.jsonld)}</script>` : ''}
</head>
<body>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo">
  <div class="topo-in">
    <a class="marca" href="/" aria-label="${site.nome}, página inicial"><img class="logo-claro" src="/img/venare-news-azul.png?v=${V.logoA}" alt="Venare News" width="1357" height="120"><img class="logo-escuro" src="/img/venare-news-branco.png?v=${V.logoB}" alt="" aria-hidden="true" width="1357" height="120"></a>
    <nav class="menu" aria-label="Principal">
      <a href="/#hoje">Hoje</a><a href="/#indices">Índices</a><a href="/arquivo/">Arquivo</a>
    </nav>
    <a class="btn btn-topo" href="${wa()}" target="_blank" rel="noopener">Fale com um consultor</a>
  </div>
</header>
<main id="conteudo">
${corpo}
</main>
<footer class="rodape">
  <div class="padrao padrao-rodape" aria-hidden="true"></div>
  <div class="rodape-in">
    <div>
      <img src="/img/venare-news-branco.png?v=${V.logoB}" alt="Venare News" width="1357" height="120">
      <p class="rodape-desc">${esc(site.descricao)}</p>
      <p class="rodape-desc"><strong>Acompanhe e compartilhe.</strong></p>
    </div>
    <div class="rodape-col">
      <a class="rc" href="${site.instagram}" rel="noopener">${ICON.ig}<span>${site.instagram_handle}</span></a>
      <a class="rc" href="mailto:${site.email}">${ICON.mail}<span>${site.email}</span></a>
      <a class="rc" href="${site.site_venare}" rel="noopener">${ICON.web}<span>${site.site_venare_rotulo}</span></a>
      <a class="rc" href="${site.endereco_mapa}" rel="noopener">${ICON.pin}<span>${esc(site.endereco)}</span></a>
      <p class="rc-emp">${site.empresa}<br><span class="nowrap">${site.creci}</span></p>
    </div>
    <p class="aviso-legal">Conteúdo informativo, produzido com base em fontes públicas citadas em cada publicação. Não constitui recomendação de investimento. Rentabilidade passada não garante resultados futuros.</p>
  </div>
</footer>
<script src="/app.js?v=${V.js}" defer></script>
</body>
</html>`;
}

const cta = `<section class="cta-band"><div class="cta-in">
  <h2>Quer saber se um imóvel faz sentido para a sua carteira?</h2>
  <p>A Venare analisa construtora, localização, demanda e potencial de valorização antes de indicar qualquer oportunidade.</p>
  <a class="btn btn-claro btn-wa" href="${wa()}" target="_blank" rel="noopener"><span class="wa-ico">${ICON.wa}</span>Conversar com um consultor</a>
</div></section>`;

// ---------- agenda (calendário) ----------
const slugify = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
function calendario(a) {
  const d = a.data.replace(/-/g, '');
  const ini = `${d}T120000Z`, fim = `${d}T123000Z`; // 9h às 9h30 em Brasília
  const titulo = `Venare News: ${a.evento}`;
  const desc = `Hoje sai: ${a.evento} (${a.orgao}). Veja os números e a análise para investidores no Venare News: ${site.url}`;
  const file = `/agenda/${a.data}-${slugify(a.evento)}.ics`;
  arquivosIcs.push({ file, body: ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Venare News//PT-BR','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',`UID:${a.data}-${slugify(a.evento)}@venarenews`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z`,`DTSTART:${ini}`,`DTEND:${fim}`,`SUMMARY:${titulo}`,`DESCRIPTION:${desc}`,`URL:${site.url}`,'BEGIN:VALARM','ACTION:DISPLAY',`DESCRIPTION:${titulo}`,'TRIGGER:PT0M','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n') });
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&dates=${ini}/${fim}&details=${encodeURIComponent(desc)}&location=${encodeURIComponent(site.url)}`;
  return { google, ics: file };
}
const arquivosIcs = [];

// ---------- home ----------
function home(ed) {
  const [lead, ...resto] = ed.publicacoes;
  const c = indices.comparador;
  const cidadesJson = esc(JSON.stringify(c));
  const SETA = { alta: ['▲', 'alta'], baixa: ['▼', 'queda'], estavel: ['▬', 'estável'] };
  const tkItem = (i) => { const sd = SETA[i.dir]; return `<li class="tk"><span class="tk-nome">${esc(i.nome)}</span><span class="tk-val">${esc(i.valor)}</span>${sd ? `<span class="tk-var tk-${i.dir}" title="${i.var ? 'Variação do dia' : 'Em relação à divulgação anterior'}: ${sd[1]}"><span aria-hidden="true">${sd[0]}</span><span class="sr">${sd[1]}</span>${i.var ? ' ' + esc(i.var) : ''}</span>` : ''}<span class="tk-ref">${esc(i.ref)}</span></li>`; };
  const tkLista = (indices.ticker || []).map(tkItem).join('');
  const cards = resto.map((p, k) => `
    <article class="card card-${k}">
      <a class="card-link" href="${postUrl(ed, p)}">
        ${(() => { const f = fotoDe(p); return f ? `<div class="card-foto"><img src="${f.src}" alt="${esc(f.alt || f.descricao)}" loading="lazy" width="1200" height="600"><span class="formato">${esc(p.formato)}</span><small>Foto: ${esc(f.autor)}</small></div>` : `<span class="formato">${esc(p.formato)}</span>`; })()}
        <h3>${esc(p.titulo)}</h3>
        ${visual(p.visual)}
        <p class="card-resumo">${esc(p.resumo)}</p>
        <span class="card-abrir">Ler publicação completa<span class="seta" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span>
      </a>
      ${share(site.url + postUrl(ed, p), p.titulo, 'share-mini')}
    </article>`).join('');
  const painel = indices.indices.map((i) => `
    <div class="ind${i.destaque ? ' ind-dest' : ''}">
      <span class="ind-nome">${esc(i.nome)}</span>
      <span class="ind-val">${esc(i.valor)}</span>
      <span class="ind-nota">${esc(i.nota)}</span>
      <a class="ind-fonte" href="${esc(i.url)}" rel="noopener">${esc(i.fonte)}, ${esc(i.referencia.split(', ').pop())}</a>
    </div>`).join('');
  const agenda = indices.agenda.map((a) => { const c = calendario(a); return `<li><time datetime="${a.data}">${dataCurta(a.data)}</time><span>${esc(a.evento)}</span><small>${esc(a.orgao)}</small><span class="cal"><span class="cal-rot">${ICON.cal}Adicionar na sua agenda:</span><a href="${c.google}" target="_blank" rel="noopener">Google Agenda</a><a href="${c.ics}" type="text/calendar">Agenda do celular</a></span></li>`; }).join('');

  return pagina({
    titulo: '', canonical: '/',
    corpo: `
<div class="ticker" role="region" aria-label="Índices do mercado"><div class="ticker-trilho"><ul class="ticker-lista">${tkLista}</ul><ul class="ticker-lista" aria-hidden="true">${tkLista}</ul></div></div>
<section class="hero">
  ${(() => { const f = fotoDe(lead); return f ? `<div class="hero-foto" aria-hidden="true"><img src="${f.src}" alt="" width="1200" height="600"></div>` : ''; })()}
  <div class="padrao" aria-hidden="true"></div>
  <img class="hero-glow" src="/img/glow.webp" alt="" aria-hidden="true">
  <div class="hero-in">
    <div class="hero-txt">
      <p class="edicao">Edição de ${dataLonga(ed.data)}</p>
      <span class="formato formato-claro">${esc(lead.formato)}</span>
      <h1><a href="${postUrl(ed, lead)}">${esc(lead.titulo)}</a></h1>
      <p class="hero-resumo">${esc(lead.resumo)}</p>
      <div class="hero-acoes"><a class="btn btn-claro" href="${postUrl(ed, lead)}">Ler a análise</a>${share(site.url + postUrl(ed, lead), lead.titulo, 'share-escuro')}</div>
    </div>
    <div class="comparador" data-comp="${cidadesJson}">
      <h2>${esc(c.titulo)}</h2>
      <p class="comp-sub">Escolha uma cidade de SC e compare com o Brasil e a inflação.</p>
      <div class="chips" role="radiogroup" aria-label="Cidade">${c.cidades.map((x, k) => `<button type="button" role="radio" class="chip" aria-checked="${x.nome === 'Florianópolis'}" data-k="${k}">${esc(x.nome)}</button>`).join('')}</div>
      <div class="comp-barras">
        <div class="cb cb-sc"><span class="cb-rot" data-rot>Florianópolis</span><span class="cb-trilho"><span class="cb-preench" data-bar="sc"></span></span><span class="cb-val" data-val="sc"></span></div>
        <div class="cb cb-br"><span class="cb-rot">Brasil</span><span class="cb-trilho"><span class="cb-preench" data-bar="br"></span></span><span class="cb-val" data-val="br"></span></div>
        <div class="cb cb-ref"><span class="cb-rot">Inflação (IPCA)</span><span class="cb-trilho"><span class="cb-preench" data-bar="ref"></span></span><span class="cb-val" data-val="ref"></span></div>
      </div>
      <p class="comp-veredito" data-veredito aria-live="polite"></p>
      <p class="comp-fonte" data-fonte>${esc(c.fonte)}. ${esc(c.referencia)}</p>
    </div>
  </div>
  ${(() => { const f = fotoDe(lead); return f ? `<a class="foto-credito" href="${esc(f.url)}" rel="noopener">${credito(f)}</a>` : ''; })()}
</section>

<section class="secao secao-vidro" id="hoje" aria-labelledby="t-hoje">
  <div class="secao-in">
    <div class="secao-cab"><h2 id="t-hoje" class="com-selo">Mais publicações de hoje</h2><p>Dados de mercado com fonte, explicados para quem investe.</p></div>
    <div class="grade">${cards}</div>
  </div>
</section>

<section class="secao secao-escura" id="indices" aria-labelledby="t-ind">
  <div class="secao-in">
    <div class="secao-cab"><h2 id="t-ind" class="com-selo">Índices que movem o mercado</h2><p>Atualizados em ${dataCurta(indices.atualizado_em)}. Cada número leva à fonte original.</p></div>
    <div class="painel">${painel}</div>
    <div class="agenda"><h3 class="com-selo">Próximas divulgações</h3><ul>${agenda}</ul></div>
  </div>
</section>
${cta}`,
    og: { jsonld: { '@context': 'https://schema.org', '@type': 'WebSite', name: site.nome, url: site.url, description: site.descricao, publisher: { '@type': 'Organization', name: site.empresa } } },
  });
}

// ---------- post ----------
function post(ed, p) {
  const url = postUrl(ed, p);
  const corpo = p.corpo.map((b) => (b.h ? `<h2 class="com-selo">${esc(b.h)}</h2>` : `<p>${esc(b.p)}</p>`)).join('\n');
  const outros = ed.publicacoes.filter((x) => x.slug !== p.slug).map((x) => `<li><a href="${postUrl(ed, x)}"${fotoDe(x) ? ' class="com-foto"' : ''}>${mini(x)}<span class="formato">${esc(x.formato)}</span><span class="o-tit">${esc(x.titulo)}</span><span class="o-abrir">Ler publicação</span></a></li>`).join('');
  return pagina({
    titulo: p.titulo, descricao: p.resumo, canonical: url,
    og: { tipo: 'article', imagem: fs.existsSync(path.join(ROOT, 'static/og', p.slug + '.jpg')) ? p.slug : 'padrao', jsonld: { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: p.titulo, description: p.resumo, datePublished: `${ed.data}T07:00:00-03:00`, inLanguage: 'pt-BR', author: { '@type': 'Organization', name: 'Redação Venare News' }, publisher: { '@type': 'Organization', name: site.empresa }, mainEntityOfPage: site.url + url, ...(fotoDe(p) ? { image: site.url + fotoDe(p).src } : {}) } },
    corpo: `
<article class="post">
  <header class="post-cab">
    <div class="padrao" aria-hidden="true"></div>
    <div class="post-cab-in">
      <a class="voltar" href="/">Edição de ${dataCurta(ed.data)}</a>
      <span class="formato formato-claro">${esc(p.formato)}</span>
      <h1>${esc(p.titulo)}</h1>
      <p class="post-resumo">${esc(p.resumo)}</p>
      <p class="post-meta">Redação Venare News. Publicado em <time datetime="${ed.data}">${dataLonga(ed.data)}</time></p>
      ${share(site.url + url, p.titulo, 'share-escuro')}
    </div>
  </header>
  <div class="post-corpo">
    ${(() => { const f = fotoDe(p); return f ? `<figure class="foto-materia"><div class="fm-img"><img src="${f.src}" alt="${esc(f.alt || f.descricao)}" width="1200" height="600"></div><figcaption><span>${esc(f.legenda || f.descricao)}</span><a href="${esc(f.url)}" rel="noopener">${credito(f)}</a></figcaption></figure>` : ''; })()}
    ${visual(p.visual, true)}
    <div class="texto">${corpo}</div>
    <aside class="fontes"><h2 class="com-selo">Fontes</h2><ul>${p.fontes.map((f) => `<li><a href="${esc(f.url)}" rel="noopener">${esc(f.nome)}</a></li>`).join('')}</ul></aside>
    ${share(site.url + url, p.titulo)}
  </div>
</article>
${cta}
<section class="secao secao-vidro"><div class="secao-in"><div class="secao-cab"><h2 class="com-selo">Outras publicações desta edição</h2></div><ul class="outros">${outros}</ul></div></section>`,
  });
}

// ---------- arquivo ----------
function arquivo() {
  const lista = edicoes.map((ed) => `<section class="arq-ed"><h2>${dataLonga(ed.data)}</h2><ul class="outros">${ed.publicacoes.map((p) => `<li><a href="${postUrl(ed, p)}"${fotoDe(p) ? ' class="com-foto"' : ''}>${mini(p)}<span class="formato">${esc(p.formato)}</span><span class="o-tit">${esc(p.titulo)}</span><span class="o-abrir">Ler publicação</span></a></li>`).join('')}</ul></section>`).join('');
  return pagina({ titulo: 'Arquivo de edições', descricao: 'Todas as edições do Venare News.', canonical: '/arquivo/', corpo: `<section class="secao secao-vidro"><div class="secao-in"><div class="secao-cab"><h1 class="h1-simples com-selo">Arquivo de edições</h1><p>Cinco publicações por dia sobre o mercado imobiliário de Santa Catarina.</p></div>${lista}</div></section>` });
}

// ---------- escrita ----------
fs.rmSync(OUT, { recursive: true, force: true });
const write = (rel, html) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };
fs.cpSync(path.join(ROOT, 'static'), OUT, { recursive: true });
write('index.html', home(hoje));
for (const f of arquivosIcs) write(f.file, f.body);
write('arquivo/index.html', arquivo());
const urls = ['/', '/arquivo/'];
for (const ed of edicoes) for (const p of ed.publicacoes) { write(postUrl(ed, p) + 'index.html', post(ed, p)); urls.push(postUrl(ed, p)); }
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${site.url}${u}</loc></url>`).join('')}</urlset>`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
const itens = edicoes.slice(0, 6).flatMap((ed) => ed.publicacoes.map((p) => `<item><title>${esc(p.titulo)}</title><link>${site.url}${postUrl(ed, p)}</link><guid>${site.url}${postUrl(ed, p)}</guid><pubDate>${new Date(ed.data + 'T07:00:00-03:00').toUTCString()}</pubDate><description>${esc(p.resumo)}</description></item>`));
write('rss.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${site.nome}</title><link>${site.url}</link><description>${esc(site.descricao)}</description><language>pt-BR</language>${itens.join('')}</channel></rss>`);
console.log(`OK: ${urls.length} páginas em dist/`);
