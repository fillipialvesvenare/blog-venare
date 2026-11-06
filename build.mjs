// Gera o site estático do Blog Venare a partir de content/ e static/.
// Uso: node build.mjs  (saída em dist/). Sem dependências externas.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, 'dist');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const site = read('site.json');
const indices = read('content/indices.json');
const edDir = path.join(ROOT, 'content/edicoes');
const edicoes = fs.readdirSync(edDir).filter((f) => f.endsWith('.json')).sort().reverse()
  .map((f) => read(`content/edicoes/${f}`));
const hoje = edicoes[0];

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const dt = (iso) => new Date(iso + 'T12:00:00-03:00');
const dataLonga = (iso) => { const d = dt(iso); return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; };
const dataCurta = (iso) => { const d = dt(iso); return `${d.getDate()} de ${MESES[d.getMonth()]}`; };
const num = (v, casas = 2) => v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
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
    const fmt = (x) => (v.tipo === 'ranking' ? `R$ ${x.toLocaleString('pt-BR')}` : `${num(x)}%`);
    const itens = grande ? v.itens : v.itens.slice(0, v.tipo === 'ranking' ? 6 : 9);
    return `<figure class="vis vis-barras${grande ? ' grande' : ''}">
      ${v.titulo ? `<figcaption class="vis-tit">${esc(v.titulo)}</figcaption>` : ''}
      <ol class="barras" role="list">${itens.map((i) => `
        <li class="barra tom-${i.tom}"><span class="b-rot">${esc(i.rotulo)}</span><span class="b-trilho"><span class="b-preench" style="--w:${((i.valor / max) * 100).toFixed(1)}%"></span></span><span class="b-val">${fmt(i.valor)}</span></li>`).join('')}
      </ol>
      <p class="legenda-cores"><span class="lc lc-sc">Santa Catarina</span><span class="lc lc-br">${v.tipo === 'ranking' ? 'Outros estados' : 'Brasil'}</span><span class="lc lc-ref">${v.tipo === 'ranking' ? 'Média nacional' : 'Inflação (IPCA)'}</span></p>
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
    <button class="sh sh-copy" type="button" data-net="copy" aria-label="Copiar link"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a3 3 0 1 1 4.2 4.2l-2 2a1 1 0 1 1-1.4-1.4l2-2a1 1 0 1 0-1.4-1.4l-3.5 3.5a1 1 0 0 1-1.4 0Zm2.8-2.8a1 1 0 0 1 0 1.4l-3.5 3.5a3 3 0 1 1-4.2-4.2l2-2a1 1 0 1 1 1.4 1.4l-2 2a1 1 0 1 0 1.4 1.4l3.5-3.5a1 1 0 0 1 1.4 0Z"/></svg></button>
    <span class="share-ok" role="status" aria-live="polite"></span>
  </div>`;
}

// ---------- layout ----------
function pagina({ titulo, descricao, canonical, corpo, og = {} }) {
  const full = titulo ? `${titulo} | ${site.nome}` : `${site.nome}: mercado imobiliário de SC para investidores`;
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
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#070F40">
<link rel="icon" href="/img/simbolo.png">
<link rel="alternate" type="application/rss+xml" title="${site.nome}" href="/rss.xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
${og.jsonld ? `<script type="application/ld+json">${JSON.stringify(og.jsonld)}</script>` : ''}
</head>
<body>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo">
  <div class="topo-in">
    <a class="marca" href="/" aria-label="${site.nome}, página inicial"><img src="/img/logo-azul.png" alt="Venare investimentos imobiliários" width="156" height="50"><span class="marca-blog">Blog</span></a>
    <nav class="menu" aria-label="Principal">
      <a href="/#hoje">Hoje</a><a href="/#indices">Índices</a><a href="/arquivo/">Arquivo</a>
    </nav>
    <a class="btn btn-topo" href="${site.instagram}" rel="noopener">Fale com um consultor</a>
  </div>
</header>
<main id="conteudo">
${corpo}
</main>
<footer class="rodape">
  <img class="rodape-pattern" src="/img/pattern.webp" alt="" aria-hidden="true">
  <div class="rodape-in">
    <div>
      <img src="/img/logo-branco.png" alt="Venare investimentos imobiliários" width="190" height="61">
      <p class="rodape-desc">${esc(site.descricao)}</p>
    </div>
    <div class="rodape-col">
      <p><a href="${site.instagram}" rel="noopener">${site.instagram_handle}</a></p>
      <p>${site.email}</p>
      <p>${site.empresa}. ${site.creci}</p>
    </div>
    <p class="aviso-legal">Conteúdo informativo, produzido com base em fontes públicas citadas em cada publicação. Não constitui recomendação de investimento. Rentabilidade passada não garante resultados futuros.</p>
  </div>
</footer>
<script src="/app.js" defer></script>
</body>
</html>`;
}

const cta = `<section class="cta-band"><div class="cta-in">
  <h2>Quer saber se um imóvel faz sentido para a sua carteira?</h2>
  <p>A Venare analisa construtora, localização, demanda e potencial de valorização antes de indicar qualquer oportunidade.</p>
  <a class="btn btn-claro" href="${site.instagram}" rel="noopener">Conversar com um consultor</a>
</div></section>`;

// ---------- home ----------
function home(ed) {
  const [lead, ...resto] = ed.publicacoes;
  const c = indices.comparador;
  const cidadesJson = esc(JSON.stringify(c));
  const ticker = indices.indices.map((i) => `<li class="tk${i.destaque ? ' tk-dest' : ''}"><span class="tk-nome">${esc(i.nome)}</span><span class="tk-val">${esc(i.valor)}</span><span class="tk-ref">${esc(i.referencia)}</span></li>`).join('');
  const cards = resto.map((p, k) => `
    <article class="card card-${k}">
      <a class="card-link" href="${postUrl(ed, p)}">
        <span class="formato">${esc(p.formato)}</span>
        <h3>${esc(p.titulo)}</h3>
        ${visual(p.visual)}
        <p class="card-resumo">${esc(p.resumo)}</p>
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
  const agenda = indices.agenda.map((a) => `<li><time datetime="${a.data}">${dataCurta(a.data)}</time><span>${esc(a.evento)}</span><small>${esc(a.orgao)}</small></li>`).join('');

  return pagina({
    titulo: '', canonical: '/',
    corpo: `
<ul class="ticker" aria-label="Índices do dia">${ticker}</ul>
<section class="hero">
  <img class="hero-pattern" src="/img/pattern.webp" alt="" aria-hidden="true">
  <img class="hero-glow" src="/img/glow.webp" alt="" aria-hidden="true">
  <div class="hero-in">
    <div class="hero-txt">
      <p class="edicao">Edição de ${dataLonga(ed.data)}. ${ed.publicacoes.length} publicações</p>
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
      <p class="comp-fonte">${esc(c.fonte)}. ${esc(c.referencia)}</p>
    </div>
  </div>
</section>

<section class="secao" id="hoje" aria-labelledby="t-hoje">
  <div class="secao-in">
    <div class="secao-cab"><h2 id="t-hoje">Mais publicações de hoje</h2><p>Dados de mercado com fonte, explicados para quem investe.</p></div>
    <div class="grade">${cards}</div>
  </div>
</section>

<section class="secao secao-cinza" id="indices" aria-labelledby="t-ind">
  <div class="secao-in">
    <div class="secao-cab"><h2 id="t-ind">Índices que movem o mercado</h2><p>Atualizados em ${dataCurta(indices.atualizado_em)}. Cada número leva à fonte original.</p></div>
    <div class="painel">${painel}</div>
    <div class="agenda"><h3>Próximas divulgações</h3><ul>${agenda}</ul></div>
  </div>
</section>
${cta}`,
    og: { jsonld: { '@context': 'https://schema.org', '@type': 'WebSite', name: site.nome, url: site.url, description: site.descricao, publisher: { '@type': 'Organization', name: site.empresa } } },
  });
}

// ---------- post ----------
function post(ed, p) {
  const url = postUrl(ed, p);
  const corpo = p.corpo.map((b) => (b.h ? `<h2>${esc(b.h)}</h2>` : `<p>${esc(b.p)}</p>`)).join('\n');
  const outros = ed.publicacoes.filter((x) => x.slug !== p.slug).map((x) => `<li><a href="${postUrl(ed, x)}"><span class="formato">${esc(x.formato)}</span>${esc(x.titulo)}</a></li>`).join('');
  return pagina({
    titulo: p.titulo, descricao: p.resumo, canonical: url,
    og: { tipo: 'article', jsonld: { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: p.titulo, description: p.resumo, datePublished: `${ed.data}T07:00:00-03:00`, inLanguage: 'pt-BR', author: { '@type': 'Organization', name: 'Redação Blog Venare' }, publisher: { '@type': 'Organization', name: site.empresa }, mainEntityOfPage: site.url + url } },
    corpo: `
<article class="post">
  <header class="post-cab">
    <img class="hero-pattern" src="/img/pattern.webp" alt="" aria-hidden="true">
    <div class="post-cab-in">
      <a class="voltar" href="/">Edição de ${dataCurta(ed.data)}</a>
      <span class="formato formato-claro">${esc(p.formato)}</span>
      <h1>${esc(p.titulo)}</h1>
      <p class="post-resumo">${esc(p.resumo)}</p>
      <p class="post-meta">Redação Blog Venare. Publicado em <time datetime="${ed.data}">${dataLonga(ed.data)}</time></p>
      ${share(site.url + url, p.titulo, 'share-escuro')}
    </div>
  </header>
  <div class="post-corpo">
    ${visual(p.visual, true)}
    <div class="texto">${corpo}</div>
    <aside class="fontes"><h2>Fontes</h2><ul>${p.fontes.map((f) => `<li><a href="${esc(f.url)}" rel="noopener">${esc(f.nome)}</a></li>`).join('')}</ul></aside>
    ${share(site.url + url, p.titulo)}
  </div>
</article>
${cta}
<section class="secao"><div class="secao-in"><div class="secao-cab"><h2>Outras publicações desta edição</h2></div><ul class="outros">${outros}</ul></div></section>`,
  });
}

// ---------- arquivo ----------
function arquivo() {
  const lista = edicoes.map((ed) => `<section class="arq-ed"><h2>${dataLonga(ed.data)}</h2><ul class="outros">${ed.publicacoes.map((p) => `<li><a href="${postUrl(ed, p)}"><span class="formato">${esc(p.formato)}</span>${esc(p.titulo)}</a></li>`).join('')}</ul></section>`).join('');
  return pagina({ titulo: 'Arquivo de edições', descricao: 'Todas as edições do Blog Venare.', canonical: '/arquivo/', corpo: `<section class="secao"><div class="secao-in"><div class="secao-cab"><h1 class="h1-simples">Arquivo de edições</h1><p>Cinco publicações por dia sobre o mercado imobiliário de Santa Catarina.</p></div>${lista}</div></section>` });
}

// ---------- escrita ----------
fs.rmSync(OUT, { recursive: true, force: true });
const write = (rel, html) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };
fs.cpSync(path.join(ROOT, 'static'), OUT, { recursive: true });
write('index.html', home(hoje));
write('arquivo/index.html', arquivo());
const urls = ['/', '/arquivo/'];
for (const ed of edicoes) for (const p of ed.publicacoes) { write(postUrl(ed, p) + 'index.html', post(ed, p)); urls.push(postUrl(ed, p)); }
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${site.url}${u}</loc></url>`).join('')}</urlset>`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
const itens = edicoes.slice(0, 6).flatMap((ed) => ed.publicacoes.map((p) => `<item><title>${esc(p.titulo)}</title><link>${site.url}${postUrl(ed, p)}</link><guid>${site.url}${postUrl(ed, p)}</guid><pubDate>${new Date(ed.data + 'T07:00:00-03:00').toUTCString()}</pubDate><description>${esc(p.resumo)}</description></item>`));
write('rss.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${site.nome}</title><link>${site.url}</link><description>${esc(site.descricao)}</description><language>pt-BR</language>${itens.join('')}</channel></rss>`);
console.log(`OK: ${urls.length} páginas em dist/`);
