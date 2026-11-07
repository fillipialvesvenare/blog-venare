# Rotina diária do Venare News

Duas tarefas agendadas, todos os dias (horário de Brasília):
- **06:47, preparar:** pesquisa, escreve a edição, publica a prévia e envia o e-mail de revisão.
- **09:47, publicar:** se o Fillipi não pediu para segurar, coloca a edição no ar.

Site: https://venarenews.com.br (também responde em https://venarenews.pages.dev)
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
- Texto 100% próprio (parafraseado). Nada de copiar parágrafos ou imagens de terceiros (fotos só pelo `scripts/fotos.py`, que usa banco de licença livre e registra o crédito). Citação literal só se indispensável, com menos de 15 palavras.
- Cada publicação lista suas fontes com link.
- Cada publicação tem uma foto inédita, buscada com `scripts/fotos.py`. Ver a seção "Fotos das notícias".

### 4. Atualizar índices
Atualizar `content/indices.json` quando houver dado novo:
- `ticker` (esteira do topo), todos os dias: dólar e Ibovespa com o fechamento mais recente, variação do dia em `var` e `dir` ("alta" ou "baixa"). Demais índices (Selic, CDI, IPCA, IGP-M, INCC-M, FipeZAP, m²) sem `var`, só `dir` comparando com a divulgação anterior: "alta", "baixa" ou "estavel".
- `comparador`: as cidades são fixas (Florianópolis, Itajaí, Joinville, Itapema, Balneário Camboriú, Porto Belo). Só atualizar os números. As cinco primeiras vêm do FipeZAP. Porto Belo não é medida pelo FipeZAP: usar a fonte mais confiável disponível (DWV, Brain, etc.), preencher `fonte`, `nota` e `resumo` explicando a métrica.
- `indices` (painel) e `agenda` (próximas divulgações; remover datas passadas). Remover da agenda eventos que já passaram e acrescentar os próximos.

### 5. Gerar e conferir
```
pip install --break-system-packages pillow   # se faltar
PIXABAY_KEY=<chave> python3 scripts/fotos.py content/edicoes/AAAA-MM-DD.json   # fotos inéditas (ver seção Fotos) e conferir cada uma
python3 scripts/og.py     # imagens de compartilhamento (links e Stories)
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
4. Conferir em https://venarenews.com.br, após 2 a 3 minutos, que a edição do dia está no ar.
5. Se não houver edição nova na branch `revisao` para hoje, não fazer nada.

---

## Fotos das notícias (regra do Fillipi, atualizada em 07/11/2026)
Toda publicação leva uma foto INÉDITA, coerente com o assunto. Nenhuma foto pode se repetir no site, nem na mesma edição nem em edições diferentes. O site exibe a foto de forma sutil (fundo esmaecido do destaque, faixa no topo dos cards e foto principal com legenda e crédito na matéria) a partir do campo `foto`.

Como fazer, depois de escrever as 5 publicações:
1. Em cada publicação, logo depois de `resumo`, escreva:
   `"foto": {"busca": ["termo específico", "termo alternativo", "termo genérico do tema"], "legenda": "..."}`
   - Termos do mais fiel ao mais genérico: primeiro o lugar/objeto real da notícia ("Balneário Camboriú prédios", "Florianópolis Beira-Mar", "Banco Central Brasília"), depois o tema ("construção civil guindaste", "chaves apartamento novo", "gráfico economia", "porto contêineres"). Pode misturar português e inglês.
2. Rode: `PIXABAY_KEY=<chave informada no prompt da tarefa> python3 scripts/fotos.py content/edicoes/AAAA-MM-DD.json`
   O script busca no Pixabay (fotos reais, uso comercial liberado), pula toda foto já usada no site, recorta em 1200x600, salva em `static/fotos/` e registra autor, licença e link em `content/fotos.json`. Tem que terminar com "FOTOS OK".
3. CONFIRA CADA FOTO com a ferramenta Read (abra `static/fotos/<slug>.jpg`). A foto tem que combinar com a notícia e ser honesta:
   - Nunca usar foto de outro lugar como se fosse a cidade da notícia (ex.: o Pixabay devolve a Joinville da França para "Joinville"). Se não houver foto fiel da cidade, use uma foto do tema (indústria, apartamento, obra, praia genérica) e escreva a legenda como ilustrativa.
   - Nada de foto com marca, logotipo, texto em outra língua em destaque, pessoas em trajes de banho em primeiro plano ou temas sem relação.
   - Se não combinar: no campo foto da publicação coloque `"trocar": true` e termos novos em `"busca"`, e rode o script de novo. Repita até ficar boa (a foto rejeitada é apagada e não volta).
4. `legenda`: uma frase que descreve o que aparece na foto e liga ao assunto, usando só números que já estão na publicação. Foto genérica: comece com "Imagem ilustrativa." (ex.: "Imagem ilustrativa. O crédito imobiliário com recursos da poupança somou R$ 146,1 bilhões de janeiro a setembro."). Foto do lugar real: descreva o lugar (ex.: "Prédios da Praia Brava, em Itajaí. A cidade vendeu R$ 3,11 bilhões em imóveis de janeiro a agosto.").
5. Nunca reaproveite fotos antigas trocando o `id` à mão, nunca baixe imagens de sites de notícias ou de terceiros sem licença livre, e nunca grave a chave do Pixabay em arquivo do repositório (o repositório é público).
6. Se o Pixabay falhar (fora do ar, limite), tente de novo após alguns minutos. Se ainda assim faltar foto, publique a prévia mesmo assim e avise no e-mail de revisão quais publicações ficaram sem foto.

## Regra fixa: não mexer no visual
O visual do site está aprovado e congelado (incluindo o jeito de exibir as fotos). Todos os dias, mexer SOMENTE no conteúdo: `content/edicoes/*.json` (as 5 publicações), `content/indices.json` (números) e as fotos novas que o `scripts/fotos.py` grava em `static/fotos/` e `content/fotos.json`. Nunca alterar `build.mjs`, `static/style.css`, `static/app.js`, `static/img/`, `scripts/` (fontes, logo, pattern, og.py), layout, cores, fontes, logo, pattern, cabeçalho, esteira, comparador, rodapé ou botões. Novos textos seguem exatamente os formatos e visuais que já existem.

## Linha editorial (regra do Fillipi)
- NUNCA publicar notícias, números, porcentagens ou comparações que deixem Santa Catarina ou Florianópolis em situação ruim (ex.: "custo de construir em SC sobe mais que a inflação", "aluguel rende menos em SC do que no Brasil", "preço desacelera", "cidade de SC abaixo da média do país").
- Escolher pautas e ângulos em que SC e Florianópolis aparecem bem: valorização acima da média, crescimento, investimentos, obras, população, emprego, turismo, lançamentos, demanda, qualidade de vida, rankings positivos.
- Assuntos variados e não sensacionalistas: principais cidades de SC (Florianópolis, Balneário Camboriú, Itajaí, Itapema, Porto Belo, Joinville, Blumenau, São José), economia, crédito, Selic, tendências.
- Comparações com o Brasil só quando SC/Florianópolis ficam à frente.
- Isso é escolha de pauta, nunca distorção: os números publicados continuam verdadeiros e com fonte. Se um dado é desfavorável, simplesmente não vira notícia.

## Regras de texto
- Ao falar do preço do m², nunca usar "caro". Usar "valorizado" (ex.: "m² mais valorizado do país").
- O nome do site é Venare News.

## Regras da marca
Cores: #070F40, #2A3BA0, #4C67FF, #8698FF, #F0F0F0, #1A1A1A, branco. Fonte Prompt. Títulos em caixa alta, ExtraBold. Não alterar logos, pattern, símbolo e glow em `static/img/` nem em `scripts/`.
Rodapé com CRECI 10879J e aviso de que o conteúdo não é recomendação de investimento.

## Se algo falhar
Tentar resolver de verdade antes de desistir (reexecutar, corrigir o JSON, refazer o build). Se ainda assim falhar, enviar e-mail curto para fillipialves@venare.com.br explicando o que falhou.
