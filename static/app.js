// Venare News: comparador e compartilhamento.
(function () {
  const fmt = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

  // ----- comparador SC × Brasil -----
  const comp = document.querySelector('.comparador');
  if (comp) {
    const dados = JSON.parse(comp.dataset.comp);
    const max = Math.max(dados.brasil, dados.ipca, ...dados.cidades.map((c) => c.var12m));
    const $ = (s) => comp.querySelector(s);
    const chips = [...comp.querySelectorAll('.chip')];
    const pint = (k, primeira) => {
      const c = dados.cidades[k];
      chips.forEach((b, i) => b.setAttribute('aria-checked', String(i === k)));
      $('[data-rot]').textContent = c.nome;
      const set = (id, v) => { $(`[data-bar="${id}"]`).style.width = (v / max) * 100 + '%'; $(`[data-val="${id}"]`).textContent = fmt(v); };
      const aplicar = () => { set('sc', c.var12m); set('br', dados.brasil); set('ref', dados.ipca); };
      primeira ? requestAnimationFrame(() => requestAnimationFrame(aplicar)) : aplicar();
      const vezes = c.var12m / dados.brasil;
      const real = c.var12m - dados.ipca;
      let txt;
      if (c.var12m > dados.brasil) txt = `<strong>${c.nome}</strong> valorizou ${vezes.toFixed(1).replace('.', ',')} vez a média do Brasil, com ganho de ${real.toFixed(1).replace('.', ',')} ponto${Math.abs(real) >= 2 ? 's' : ''} acima da inflação.`;
      else if (c.var12m > dados.ipca) txt = `<strong>${c.nome}</strong> ficou abaixo da média do Brasil, mas ainda acima da inflação.`;
      else txt = `<strong>${c.nome}</strong> valorizou menos que a inflação em 12 meses. O m² médio está em R$ ${c.m2.toLocaleString('pt-BR')}.`;
      if (c.resumo) txt = c.resumo;
      if (c.nota) txt += `<span class="comp-nota">${c.nota}</span>`;
      $('[data-veredito]').innerHTML = txt;
      $('[data-fonte]').textContent = c.nota ? `${c.nome}: ${c.fonte}. Brasil: Índice FipeZAP, out/2026. IPCA: IBGE, set/2026.` : `${dados.fonte}. ${dados.referencia}`;
    };
    chips.forEach((b, i) => {
      b.addEventListener('click', () => pint(i));
      b.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + chips.length) % chips.length;
          chips[n].focus(); pint(n);
        }
      });
    });
    const inicial = Math.max(0, dados.cidades.findIndex((c) => c.nome === 'Florianópolis'));
    pint(inicial, true);
  }

  // ----- topo: vidro adapta ao fundo -----
  const topo = document.querySelector('.topo');
  if (topo) {
    // vidro líquido (como no iOS): só em Chromium, que aceita filtro SVG no backdrop-filter; os demais ficam com o desfoque do CSS.
    // Um mapa de deslocamento do tamanho da cápsula faz as bordas agirem como lente: o que passa por trás se curva e se comprime na borda.
    const ua = navigator.userAgentData;
    if (ua && ua.brands && ua.brands.some((x) => x.brand === 'Chromium')) {
      const caixa = topo.querySelector('.topo-in');
      document.body.insertAdjacentHTML('beforeend', '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><filter id="vn-liq" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"></filter></svg>');
      const filtro = document.getElementById('vn-liq');
      let tam = '';
      const lente = () => {
        const w = Math.round(caixa.offsetWidth), h = Math.round(caixa.offsetHeight);
        const r = Math.min(parseFloat(getComputedStyle(caixa).borderTopLeftRadius) || 0, h / 2);
        if (!w || !h || tam === w + 'x' + h) return;
        tam = w + 'x' + h;
        const borda = Math.min(26, h / 2), cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const cx = cv.getContext('2d'), img = cx.createImageData(w, h), d = img.data, hx = w / 2, hy = h / 2;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const px = x + 0.5 - hx, py = y + 0.5 - hy, qx = Math.abs(px) - (hx - r), qy = Math.abs(py) - (hy - r);
          const fora = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
          let nx = 0, ny = 0;
          if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy) || 1; nx = (qx / l) * Math.sign(px); ny = (qy / l) * Math.sign(py); }
          else if (qx > qy) nx = Math.sign(px); else ny = Math.sign(py);
          const t = Math.max(0, Math.min(1, 1 + fora / borda));      // 1 na borda, 0 no miolo
          const m = 1 - Math.sqrt(1 - t * t);                        // perfil de lente convexa
          const k = (y * w + x) * 4;
          d[k] = 128 - nx * m * 127; d[k + 1] = 128 - ny * m * 127; d[k + 2] = 128; d[k + 3] = 255;
        }
        cx.putImageData(img, 0, 0);
        const canal = (n, esc, mat) => `<feDisplacementMap in="b" in2="m" scale="${esc}" xChannelSelector="R" yChannelSelector="G" result="d${n}"/><feColorMatrix in="d${n}" type="matrix" values="${mat}" result="c${n}"/>`;
        filtro.innerHTML = `<feImage x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" href="${cv.toDataURL()}" result="m"/>`
          + '<feGaussianBlur in="SourceGraphic" stdDeviation="1.8 6" result="b"/>'
          + canal('r', 118, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0')
          + canal('g', 106, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0')
          + canal('b', 94, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0')
          + '<feBlend in="cr" in2="cg" mode="screen" result="rg"/><feBlend in="rg" in2="cb" mode="screen" result="rgb"/><feGaussianBlur in="rgb" stdDeviation="1.2"/>';
      };
      lente(); addEventListener('resize', lente); addEventListener('load', lente);
      document.documentElement.classList.add('liq');
    }
    const escuros = '.ticker,.hero,.post-cab,.secao-escura,.cta-band,.rodape';
    let pend = false;
    const checar = () => {
      pend = false;
      const r = topo.querySelector('.topo-in').getBoundingClientRect();
      const y = r.top + r.height / 2;
      const els = document.elementsFromPoint(window.innerWidth / 2, y);
      const atras = els.find((el) => !topo.contains(el));
      topo.classList.toggle('sobre-escuro', !!(atras && atras.closest(escuros)));
    };
    const agendar = () => { if (!pend) { pend = true; requestAnimationFrame(checar); } };
    addEventListener('scroll', agendar, { passive: true }); addEventListener('resize', agendar); checar();
  }

  // ----- compartilhamento -----
  const linkDe = (box) => {
    // No site publicado usa a URL canônica; fora dele (prévia), a URL atual.
    const u = box.dataset.url;
    return location.hostname.endsWith('venarenews.com.br') || location.hostname.endsWith('pages.dev')
      ? location.origin + new URL(u).pathname : u;
  };
  document.querySelectorAll('.share').forEach((box) => {
    const titulo = box.dataset.title;
    const ok = box.querySelector('.share-ok');
    box.querySelectorAll('[data-net]').forEach((el) => {
      const net = el.dataset.net;
      const url = linkDe(box);
      const e = encodeURIComponent;
      const destinos = {
        whatsapp: `https://wa.me/?text=${e(url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
        x: `https://twitter.com/intent/tweet?text=${e(titulo)}&url=${e(url)}`,
      };
      if (destinos[net]) { el.href = destinos[net]; el.target = '_blank'; el.rel = 'noopener'; }
      if (net === 'instagram') {
        // Gera o compartilhamento para os Stories: imagem vertical da notícia (1080x1920) pelo menu nativo do celular.
        const slug = new URL(url).pathname.split('/').filter(Boolean).pop();
        const storyUrl = slug && /\d{4}/.test(new URL(url).pathname) ? `/story/${slug}.jpg` : null;
        let arquivo = null;
        const preparar = () => {
          if (!storyUrl || arquivo) return;
          fetch(storyUrl).then((r) => (r.ok ? r.blob() : null)).then((b) => { if (b) arquivo = new File([b], `venare-news-${slug}.jpg`, { type: 'image/jpeg' }); }).catch(() => {});
        };
        (window.requestIdleCallback || setTimeout)(preparar, 800);
        el.addEventListener('pointerenter', preparar);
        el.addEventListener('touchstart', preparar, { passive: true });
        el.addEventListener('click', () => {
          navigator.clipboard && navigator.clipboard.writeText(url).catch(() => {});
          if (arquivo && navigator.canShare && navigator.canShare({ files: [arquivo] })) {
            ok.textContent = 'Escolha Instagram e depois Stories. O link já está copiado: cole no adesivo de link.';
            navigator.share({ files: [arquivo] }).catch(() => {});
          } else if (storyUrl) {
            ok.textContent = 'Imagem aberta em nova aba: salve e publique nos Stories. O link já está copiado.';
            window.open(storyUrl, '_blank', 'noopener');
          } else {
            ok.textContent = 'Link copiado. Cole nos Stories ou no Direct do Instagram.';
          }
          setTimeout(() => { ok.textContent = ''; }, 7000);
        });
      }
      if (net === 'copy') {
        el.addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(url); ok.textContent = 'Link copiado'; }
          catch { ok.textContent = url; }
          setTimeout(() => { ok.textContent = ''; }, 2500);
        });
      }
    });
  });
})();
