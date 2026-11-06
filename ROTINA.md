# Rotina diária do Venare News

Duas tarefas agendadas, todos os dias (horário de Brasília):
- **06:47, preparar:** pesquisa, escreve a edição, publica a prévia e envia o e-mail de revisão.
- **09:47, publicar:** se o Fillipi não pediu para segurar, coloca a edição no ar.

Site: https://venarenews.pages.dev (futuro: https://venarenews.com.br)
Prévia: https://revisao.venarenews.pages.dev (branch `revisao`, gerada pelo Cloudflare Pages)
E-mail de revisão: fillipialves@venare.com.br

---

## Parte A: preparar (06:47)

### 1. Preparar o repositório
```
git clone https://github.com/fillipialvesvenare/blog-venare && cd blog-venare
git checkout -B revisao origin/main
```

### 2. Pesquisar (sempre com fonte)
- Mercado imobiliário e economia de Santa Catarina (Florianópolis, litoral norte, Joinville, Blumenau, São José, Itajaí, Itapema, Balneário Camboriú, Porto Belo).
- Panorama nacional que afete o investidor: Selic/Copom, IPCA, crédito imobiliário, FipeZAP, CUB/SC, INCC, regras de financiamento, reforma tributária.
- Prefira fontes primárias: Banco Central, IBGE, Fipe (downloads.fipe.org.br), Sinduscon, Secovi, prefeituras, Caixa. Imprensa (NSC Total, Valor, Exame, Portas, Poder360) para notícias.
- Priorize o que é novo nas últimas 24 a 72 horas. Não repita assunto das últimas 7 edições sem fato novo.
- Nunca invente número. Se um dado não for confirmado em fonte, não publique.

### 3. Escrever 5 publicações
Criar `content/edicoes/AAAA-MM-DD.json` no mesmo formato das edições existentes.
- A primeira publicação é o destaque do dia (aparece grande no topo).
- Formatos variados: Análise, Gráfico, Ranking, Notícia, Em números (visuais: `numero`, `barras`, `ranking`, `comparacao`). Pelo menos 2 publicações com gráfico ou ranking.
- Sempre que possível, comparar SC com o Brasil, de forma honesta (mostrar também quando SC fica abaixo).
- Público: investidores. Tom consultivo, claro, sem sensacionalismo e sem recomendação de compra.
- Texto 100% próprio (parafraseado). Nada de copiar parágrafos ou imagens de terceiros. Citação literal só se indispensável, com menos de 15 palavras.
- Cada publicação lista suas fontes com link.

### 4. Atualizar índices
Atualizar `content/indices.json` quando houver dado novo:
- `ticker` (esteira do topo), todos os dias: dólar e Ibovespa com o fechamento mais recente, variação do dia em `var` e `dir` ("alta" ou "baixa"). Demais índices (Selic, CDI, IPCA, IGP-M, INCC-M, FipeZAP, m²) sem `var`, só `dir` comparando com a divulgação anterior: "alta", "baixa" ou "estavel".
- `comparador`: as cidades são fixas (Florianópolis, Itajaí, Joinville, Itapema, Balneário Camboriú, Porto Belo, Penha). Só atualizar os números. As cinco primeiras vêm do FipeZAP. Porto Belo e Penha não são medidas pelo FipeZAP: usar a fonte mais confiável disponível (DWV, Brain, etc.), preencher `fonte`, `nota` e `resumo` explicando a métrica.
- `indices` (painel) e `agenda` (próximas divulgações; remover datas passadas). Remover da agenda eventos que já passaram e acrescentar os próximos.

### 5. Gerar e conferir
```
pip install --break-system-packages pillow   # se faltar
python3 scripts/og.py     # imagens de compartilhamento
node build.mjs            # precisa terminar com "OK"
```
Conferir cada número de cada publicação contra a fonte, um por um.

### 6. Publicar a prévia
```
git add -A && git commit -m "Edição AAAA-MM-DD (revisão)" && git push -f origin revisao
```
Esperar 2 a 3 minutos e abrir https://revisao.venarenews.pages.dev para confirmar que a edição nova aparece.

### 7. E-mail de revisão
Enviar para fillipialves@venare.com.br:
- Assunto: `Venare News: edição de DD/MM pronta para revisão`
- Corpo curto: link da prévia, os 5 títulos e esta instrução: "Para segurar a publicação, responda este e-mail com a palavra SEGURAR até 9h30. Sem resposta, a edição entra no ar às 9h47."

---

## Parte B: publicar (09:47)

1. No Gmail, procurar resposta de hoje ao e-mail `Venare News: edição de DD/MM pronta para revisão` contendo "SEGURAR" (ou "segurar").
2. Se houver: não publicar. Responder no mesmo fio: "Edição segurada. Ela continua na prévia para ajustes."
3. Se não houver:
```
git clone https://github.com/fillipialvesvenare/blog-venare && cd blog-venare
git fetch origin revisao && git merge --ff-only origin/revisao && git push origin main
```
   Se o merge não for fast-forward, fazer `git merge origin/revisao` resolvendo conflitos a favor da edição nova.
4. Conferir em https://venarenews.pages.dev, após 2 a 3 minutos, que a edição do dia está no ar.
5. Se não houver edição nova na branch `revisao` para hoje, não fazer nada.

---

## Regras de texto
- Ao falar do preço do m², nunca usar "caro". Usar "valorizado" (ex.: "m² mais valorizado do país").
- O nome do site é Venare News.

## Regras da marca
Cores: #070F40, #2A3BA0, #4C67FF, #8698FF, #F0F0F0, #1A1A1A, branco. Fonte Prompt. Títulos em caixa alta, ExtraBold. Não alterar logos, pattern, símbolo e glow em `static/img/` nem em `scripts/`.
Rodapé com CRECI 10879J e aviso de que o conteúdo não é recomendação de investimento.

## Se algo falhar
Tentar resolver de verdade antes de desistir (reexecutar, corrigir o JSON, refazer o build). Se ainda assim falhar, enviar e-mail curto para fillipialves@venare.com.br explicando o que falhou.
