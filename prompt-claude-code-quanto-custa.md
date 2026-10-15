# Projeto: "Quanto custa Bolsonaro no poder" — site de simuladores

## Objetivo
Construir um site estático, leve e mobile-first, com 4 simuladores que mostram ao
eleitor, em reais e em horas de trabalho, o que mudaria no orçamento dele se as regras
econômicas de 2019–2022 voltassem.

**Público:** trabalhadores de até 2 salários mínimos, aposentados no piso do INSS e
beneficiários do BPC. A maioria chega pelo WhatsApp ou pelo Google, em celular simples
e conexão ruim.

**Prazo:** a v1 precisa estar no ar até 19/10/2026. Priorize os Simuladores 1 e 4.

**Divulgação:** 100% orgânica. Não haverá impulsionamento pago. Por isso, SEO e
compartilhamento são os únicos canais e precisam funcionar muito bem.

---

## Stack
- **Astro** (geração estática) com **ilhas React** só onde houver interação. O Bora Lula
  DS é em React/TSX, então os componentes entram como ilhas
  (`client:visible` ou `client:idle`, nunca `client:load` sem motivo).
- Todo conteúdo (títulos, textos, resultado padrão, gráficos, fontes) é renderizado em
  HTML no build. A página precisa fazer sentido sem JavaScript; o JS só acrescenta a
  personalização do cálculo.
- Sem backend, sem login, sem coleta de dado pessoal. Todo cálculo roda no navegador.
- Dados em `/data/*.csv` e `/data/fontes.json`, versionados.
- Lógica de cálculo em `/src/calc/*.ts` (funções puras), com testes em Vitest.
- Deploy estático (Vercel, Netlify ou Cloudflare Pages) com HTTPS, compressão Brotli e
  cache longo para assets com hash.

## Design system (obrigatório)
Use o Bora Lula Design System: https://www.ntmedina.com/bora-lula-ui/
- Índice de componentes e docs: https://www.ntmedina.com/bora-lula-ui/index.json
- ANTES de codar, leia "Começando", "Foundations/Cores", "Tipografia",
  "Espaço e forma", "Grid", "Ícones", "Regras/Acessibilidade e qualidade" e
  "Regras/Como escrever". Descubra como o pacote é instalado (npm, repositório ou cópia
  dos componentes). Se não conseguir descobrir, PARE e me pergunte; não recrie os
  componentes do zero.
- Use só os tokens do DS (cores, tipografia, espaçamento, elevação).
- Importe só os componentes usados (tree-shaking). Não importe o DS inteiro.
- Mapeamento sugerido:
  - TopNavigation / Footer / BackLink → navegação
  - Stat / StatGroup → resultado principal ("R$ 145 a menos por mês")
  - TextField → renda ou valor do benefício (`inputmode="decimal"`)
  - SelectionOption / SegmentedButton → cenário, capital, produto, combustível
  - ProgressBar (StepIndicator) → perguntas da página inicial
  - Callout / Alert → premissas e ressalvas (sempre visíveis)
  - FaqItem → "Como calculamos" (usar `<details>`/`<summary>` nativo se o componente
    permitir, para funcionar sem JS)
  - Tag + Link (externo) → selo de fonte
  - CtaBlock / Button → compartilhar no WhatsApp e baixar dados
  - Card → resumos na home
- O DS não tem gráficos. Gere os gráficos como **SVG inline no build** (sem biblioteca
  de gráficos no cliente), estilizados com os tokens do DS e com descrição em texto
  (`<title>`, `<desc>` e uma frase visível abaixo).

---

## Mobile e leveza (metas obrigatórias)
- **Base de projeto: tela de 360 px.** Depois adaptar para tablet e desktop.
- **Orçamento por página:** JS ≤ 60 KB gzip, CSS ≤ 30 KB gzip, peso total ≤ 300 KB
  no primeiro carregamento.
- **Core Web Vitals (perfil Moto G / 4G lento no Lighthouse):** LCP < 2,5 s,
  INP < 200 ms, CLS < 0,1. Lighthouse mobile ≥ 95 em Performance, Acessibilidade, Boas
  práticas e SEO.
- **Fontes:** self-hosted em WOFF2, com subset latino, `font-display: swap`, no
  máximo 2 pesos, e `preload` só da fonte do título.
- **Imagens:** AVIF/WebP com `width`/`height` definidos e `loading="lazy"` fora da
  primeira dobra. Nada de vídeo, carrossel ou animação pesada.
- **Carregar sob demanda:** a geração do cartão PNG (html-to-image ou similar) só é
  importada quando a pessoa toca em "Compartilhar imagem".
- **Interação:** alvos de toque ≥ 44 px, botão de compartilhar fixo no rodapé da tela
  nos simuladores, sem rolagem horizontal, teclado numérico nos campos de valor.
- **Respeitar `prefers-reduced-motion`** e o modo de economia de dados
  (`navigator.connection.saveData`: se ativo, não carregar fontes extras).
- Sem pixel de anúncio, sem tags de remarketing e sem scripts de terceiros. Se houver
  métrica de acesso, usar analytics agregado sem cookies (ex.: Plausible), carregado
  com `defer`.

---

## SEO
- **URLs curtas em português:** `/`, `/salario-minimo`, `/cesta-basica`,
  `/combustivel`, `/aposentadoria-bpc`, `/carrinho`, `/como-calculamos`, `/fontes`,
  `/quem-somos`.
- **Por página:** `<title>` único (≤ 60 caracteres) e `meta description` única
  (≤ 155 caracteres), escritos como a pergunta que o eleitor faz no Google. Ex.:
  - `/salario-minimo` → title "Quanto seria o salário mínimo hoje com a regra de
    Bolsonaro?"; description "Com a correção só pela inflação, o mínimo de 2026 seria
    cerca de R$ 1.476, não R$ 1.621. Veja a conta, as fontes e calcule a sua perda."
- **Um `<h1>` por página** com a mesma pergunta, e hierarquia `h2`/`h3` lógica. A
  resposta em números aparece no primeiro parágrafo, em HTML (não só dentro de ilha JS).
- `<html lang="pt-BR">`, `link rel="canonical"` em todas as páginas.
  URLs com parâmetros de simulação (`?renda=2`) apontam o canonical para a página limpa.
- **Open Graph e Twitter Card** por página: `og:title`, `og:description`,
  `og:image` 1200×630 gerada no build (com o número principal e a fonte),
  `og:locale=pt_BR`. Testar a pré-visualização do WhatsApp.
- **Dados estruturados (JSON-LD):**
  - `WebSite` e `Organization` (com os dados de "Quem somos") na home
  - `Dataset` em `/fontes`, descrevendo cada CSV com `distribution` e `isBasedOn`
    apontando para as fontes oficiais
  - `FAQPage` em `/como-calculamos`
  - `BreadcrumbList` nas páginas internas
- `sitemap.xml` (via @astrojs/sitemap), `robots.txt` liberando tudo e apontando o
  sitemap, página 404 útil com links para os simuladores.
- **Links internos:** cada simulador liga para os outros quatro, para
  "Como calculamos" e para "Fontes".
- **Textos alternativos** descritivos em todas as imagens e gráficos.
- Toda página com data de atualização visível (`<time datetime="...">`).

---

## Fontes (prioridade máxima)
Cada número do site precisa ter fonte acessível em no máximo 1 toque.

- **Registro central:** `/data/fontes.json`, um item por fonte:
  `id`, `titulo`, `orgao` (IBGE, DIEESE, ANP, Diário Oficial...), `url` (link direto
  para a tabela, PDF ou decreto, não para a home do órgão), `url_arquivo` (snapshot no
  web.archive.org), `data_publicacao`, `data_coleta`, `valor_usado` (o número exato
  tirado dali) e `usado_em` (telas que usam).
- **Ao lado de cada número:** componente `<Fonte id="...">` usando Tag do DS. Mostra o
  órgão ("IBGE") e, ao tocar, abre um painel com título, data, valor original, botão
  "Abrir fonte" (Link externo), link do arquivo e botão "Copiar fonte". Sem JS, o selo
  é um link comum para `/fontes#id`.
- **Hierarquia:** número econômico vem SEMPRE de fonte primária (IBGE/SIDRA,
  DIEESE/Conab, ANP, Diário Oficial, Previdência). Imprensa só para declarações e
  propostas (ex.: a negativa de Flávio), sempre com data.
- **Página /fontes:** lista completa agrupada por simulador, com âncora por fonte
  (`/fontes#inpc-nov-2024`), filtro por órgão e botão para baixar `fontes.json` e os
  CSVs.
- **"Como calculamos":** cada passo da fórmula linka para as fontes dos números que usa.
- **Cartão de compartilhamento:** rodapé com o órgão da fonte e a URL curta da âncora
  em /fontes.
- **Teste no build:** `npm run check-fontes` falha se (a) algum número renderizado não
  tiver `<Fonte>`, (b) algum `id` não existir no registro ou (c) alguma URL não
  responder 200.
- Dado sem fonte confirmada não aparece: exibir "em atualização".

---

## Páginas
1. **Início** — "Quanto você ganha ou recebe?" → resumo dos 4 resultados + compartilhar
2. **Salário mínimo** (Simulador 1)
3. **Cesta básica** (Simulador 2)
4. **Combustível** (Simulador 3)
5. **Aposentadoria e BPC** (Simulador 4)
6. **Carrinho de compras** (Simulador 5)
7. **Como calculamos** — fórmulas, premissas, contrapontos, registro público de
   correções
8. **Fontes** — registro completo e downloads
9. **Quem somos** — o site faz parte do Comitê Popular do Lula de Tecnologia
   (https://comitedetecnologia.com.br/). Sem dados de responsável individual, por decisão
   do responsável pelo projeto.

---

## Simuladores e dados

### Simulador 1 — Salário mínimo
- Real (decretos): 2019 998 · 2020 1.045 · 2021 1.100 · 2022 1.212 · 2023 1.320 ·
  2024 1.412 · 2025 1.518 · 2026 1.621
- Cenário "regra Bolsonaro" (só INPC): SM(t) = SM(t−1) × (1 + INPC até nov de t−1),
  arredondado ao real. INPC: 3,85% (nov/23), 4,84% (nov/24), 4,18% (nov/25).
  - Base R$ 1.302 (padrão) → 1.352 · 1.417 · 1.476
  - Base R$ 1.320 (alternativa, via SegmentedButton) → 1.371 · 1.437 · 1.497
- Entrada: quantos salários mínimos a pessoa ganha. Saída: perda por mês, por ano
  (×13) e acumulada 2023–2026.
- Testes obrigatórios: 2026 = 1.476 (base 1.302) e 1.497 (base 1.320).

### Simulador 2 — Cesta básica
- Alimentação no domicílio (IPCA): Bolsonaro +56,16% em 48 meses; Lula 3 +12,9% em
  44 meses (jan/23–ago/26).
- Ritmo mensal Bolsonaro = 1,5616^(1/48) − 1. Aplicar por 44 meses e dividir por 1,129
  → fator ≈ 1,33.
- Controle de ritmo: 100% / 75% / 50% do ritmo de 2019–2022.
- Horas de trabalho = custo da cesta ÷ (SM ÷ 220). Referência atual: 100h24 (DIEESE,
  jul/26). Cenário ≈ 147h.
- Por capital e produto: estrutura pronta e CSV com cabeçalhos; os dados por item serão
  preenchidos depois (DIEESE + subitens do IPCA, SIDRA 7060).
- Ressalva fixa: o período 2019–2022 teve pandemia, choque de commodities e câmbio.

### Simulador 3 — Combustível sem o fim do PPI
- Entrada: defasagem em R$/L (série Abicom). Exemplo: mar/26 diesel +R$ 2,18, gasolina
  +R$ 1,26.
- Repasse na bomba = defasagem × fração fóssil (gasolina 0,70; diesel 0,85),
  parametrizável. ICMS e PIS/Cofins são fixos por litro e não multiplicam.
- Impacto no IPCA = variação % × peso no IPCA (parâmetro, sem valor inventado).
- Na v1, só versão estática com o exemplo e as ressalvas: a Abicom representa
  importadores, a Petrobras contesta a conta, e em 2022 o governo Bolsonaro também
  conteve preços.

### Simulador 4 — Aposentadoria e BPC desvinculados
- Retrospectivo: igual ao Simulador 1 (benefício só com INPC).
- Prospectivo 2027–2030: mínimo = INPC + ganho real (slider 0,6%–2,5%); benefício = só
  INPC. Perda % = 1 − 1/(1+g)^anos.
- Entrada: valor do benefício. Saída: perda mês a mês até 2030 e total acumulado.
- OBRIGATÓRIO, na mesma tela e acima do resultado: Callout dizendo que a proposta foi
  reportada como estudo da equipe econômica de Flávio Bolsonaro e que o candidato negou
  em 08/10/2026, com `<Fonte>` para as duas informações. Título: "E se a proposta
  estudada pela equipe de Flávio fosse aprovada?", nunca "Flávio vai cortar".

### Simulador 5 — Carrinho de compras
- **Ideia:** a pessoa monta um carrinho de compras do dia a dia e vê, item a item e no
  total, quanto ele custa hoje e quanto custaria se cada produto tivesse subido como no
  governo do Bolsonaro.
- **URL:** `/carrinho`. Title (≤ 60): "Quanto custaria o seu carrinho no governo do
  Bolsonaro?".
- **Produtos (v1):** os 13 itens da cesta do DIEESE (carne, leite, feijão, arroz,
  farinha, batata, tomate, pão, café, banana, açúcar, óleo e manteiga), mais gás de
  botijão. Cada produto com unidade de compra (ex.: arroz 5 kg, café 500 g, gás 13 kg).
  A gasolina fica só no Simulador 3.
- **Preço de hoje:** fonte primária por produto. Alimentos: preço médio do DIEESE por
  capital (padrão: média das 27 capitais). Gás de botijão: preço médio da ANP
  (pesquisa semanal mais recente).
- **Preço como no governo do Bolsonaro**, por produto, com o subitem do IPCA correspondente
  (SIDRA 1419 para 2019 e 7060 de 2020 em diante):
  `preço_cenário = preço_hoje × (1 + B)^(n/48) ÷ (1 + L)`, em que B é a alta do subitem
  de jan/2019 a dez/2022 (48 meses), L é a alta do subitem de jan/2023 até o último mês
  publicado, e n é o número de meses desse período. Mesma lógica do Simulador 2, produto
  a produto.
- **Interação (JS puro, sem framework):** botões − e + com alvo de 44 px, quantidade
  visível, total do carrinho hoje × no governo do Bolsonaro, diferença em R$ e em %. Seletor
  de capital (como no Simulador 2). Carrinho padrão = 1 unidade de cada alimento da
  cesta. URL guarda o carrinho (`?itens=arroz:2,cafe:1`) para compartilhar.
- **Sem JS:** tabela com o carrinho padrão, preços de hoje e no ritmo de Bolsonaro,
  renderizada no build.
- **Fontes:** `<Fonte>` em cada preço de hoje e em cada alta de subitem. Produto sem preço
  ou sem subitem confirmado aparece como "em atualização" e fica fora do total.
- **Dados:** `/data/carrinho-produtos.csv` (`produto`, `unidade`, `capital`, `preco`,
  `referencia`, `fonte_preco`, `subitem_ipca`, `fonte_indice`) e
  `/data/ipca-subitens.csv` (`subitem_ipca`, `periodo`, `variacao_pct`, `governo`,
  `meses`, `fonte`).
- **Compartilhar:** cartão 1080×1080 com os 3 ou 4 itens do carrinho que mais subiriam,
  o total hoje × no governo do Bolsonaro e a premissa.
- **Testes:** fator por produto igual ao do Simulador 2 quando B e L são os da
  alimentação no domicílio; total do carrinho = soma dos itens × quantidades; produto
  "em atualização" não entra no total.

---

## Compartilhamento
- Cada resultado gera um cartão 1080×1080 PNG com: número, premissa em fonte legível,
  órgão da fonte e URL curta. O cartão nunca sai sem a premissa.
- Botão "Mandar no WhatsApp" com `https://wa.me/?text=` e texto pronto + link da página.
- Usar a Web Share API (`navigator.share`) quando disponível, com fallback para copiar
  link.

## Regras de texto
- Siga "Regras/Como escrever" do DS. Frases curtas, valores em reais e em itens do dia a
  dia, sem adjetivos sobre candidatos.
- Nada de imagens, voz ou vídeo gerados por IA de pessoas reais.
- Não invente dados. Se faltar número, "em atualização" e TODO no CSV.

## Qualidade
- Siga "Regras/Acessibilidade e qualidade" do DS: contraste AA, foco visível, texto
  ≥ 16 px, navegação por teclado, leitores de tela.
- Testes Vitest para todas as funções de `/src/calc`.
- CI no build: testes, `check-fontes`, verificação de orçamento de peso (falhar se
  passar do limite) e Lighthouse CI no perfil mobile.

---

## Ordem de trabalho
1. Ler o DS e me dizer como vai instalá-lo. Esperar meu OK.
2. Scaffold Astro + ilhas React, layout base (TopNavigation, Footer), componente de SEO
   (title, description, canonical, OG, JSON-LD) e páginas vazias.
3. `/data/fontes.json` + componente `<Fonte>` + `/src/calc` com testes (Simuladores 1 e
   4 primeiro). Nenhuma tela com número antes disso existir.
4. Páginas dos Simuladores 1 e 4 completas, com gráfico SVG, compartilhamento e OG image.
5. Simuladores 2 e 3 em versão estática.
6. "Como calculamos", "Fontes" e "Quem somos"; sitemap, robots e 404.
7. Rodar testes, `check-fontes`, orçamento de peso e Lighthouse mobile e me mostrar os
   resultados.
8. Simulador 5 (carrinho de compras): conferir na origem os preços por produto e os
   subitens do IPCA, montar os CSVs e só depois a página interativa.

Ao final de cada etapa, faça um resumo curto do que mudou e pergunte antes de seguir.
