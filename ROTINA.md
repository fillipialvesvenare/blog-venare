# Rotina diária do Blog Venare

Instruções para a tarefa agendada que publica a edição do dia. Rodar em dias úteis, de manhã.

## 1. Pesquisar (sempre com fonte)
- Mercado imobiliário e economia de Santa Catarina (Florianópolis, litoral norte, Joinville, Blumenau, São José, Itajaí, Itapema, Balneário Camboriú, Porto Belo).
- Panorama nacional que afete o investidor: Selic/Copom, IPCA, crédito imobiliário, FipeZAP, CUB/SC, INCC, regras de financiamento, reforma tributária.
- Prefira fontes primárias: Banco Central, IBGE, Fipe (downloads.fipe.org.br), Sinduscon, Secovi, prefeituras, Caixa. Imprensa (NSC Total, Valor, Exame, Portas, Poder360) para notícias.
- Nunca invente número. Se um dado não for confirmado em fonte, não publique.

## 2. Escrever 5 publicações
Criar `content/edicoes/AAAA-MM-DD.json` no mesmo formato das edições existentes.
- Formatos variados: Análise, Gráfico, Ranking, Notícia, Em números (visuais: `numero`, `barras`, `ranking`, `comparacao`).
- Sempre que possível, comparar SC com o Brasil, de forma honesta (mostrar também quando SC fica abaixo).
- Público: investidores. Tom consultivo, claro, sem sensacionalismo e sem recomendação de compra.
- Texto 100% próprio (parafraseado). Nada de copiar parágrafos ou imagens de terceiros. Citação literal só se indispensável, com menos de 15 palavras.
- Cada publicação lista suas fontes com link.

## 3. Atualizar índices
Atualizar `content/indices.json` (Selic, IPCA, FipeZAP, comparador e agenda) quando houver dado novo. Remover da agenda eventos que já passaram.

## 4. Conferir e publicar
- `node build.mjs` precisa terminar com "OK".
- Conferir cada número contra a fonte.
- `git add -A && git commit -m "Edição AAAA-MM-DD" && git push`. O Cloudflare Pages publica sozinho.

## Regras da marca
Cores: #070F40, #2A3BA0, #4C67FF, #8698FF, #F0F0F0, #1A1A1A, branco. Fonte Prompt. Títulos em caixa alta, ExtraBold. Não alterar logos, pattern, símbolo e glow em `static/img/`.
Rodapé com CRECI 10879J e aviso de que o conteúdo não é recomendação de investimento.
