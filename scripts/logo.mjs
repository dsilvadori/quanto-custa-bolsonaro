// node scripts/logo.mjs — gera o logo "Quanto custa Bolsonaro no poder" em public/logo/ (SVG com o texto em
// contornos, que não depende de fonte instalada, e PNG). Cores e fonte do Bora Lula DS. Rode quando mudar o desenho.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const require = createRequire(import.meta.url);
const fonte = (peso) => readFileSync(require.resolve(`@fontsource/montserrat/files/montserrat-latin-${peso}-normal.woff`));
const tokens = readFileSync(require.resolve('@boralula/ui/tokens.css'), 'utf8');
const cor = (nome) => tokens.match(new RegExp(`${nome}:\\s*(#[0-9A-Fa-f]{6})`))[1];
const C = {
  principal: cor('--cp-green-700'),
  amarelo: cor('--cp-yellow-400'),
  branco: cor('--cp-white'),
  tinta: cor('--cp-ink'),
  azul: cor('--cp-blue-500'),
};
const fonts = [
  { name: 'Montserrat', data: fonte(700), weight: 700, style: 'normal' },
  { name: 'Montserrat', data: fonte(800), weight: 800, style: 'normal' },
  { name: 'Montserrat', data: fonte(900), weight: 900, style: 'normal' },
];

/** Etiqueta de preço (ponta à esquerda, furo, cantos redondos). `furo` é a cor do fundo. */
function etiqueta(fundo, furo) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">
  <path d="M40 10 H104 a8 8 0 0 1 8 8 V82 a8 8 0 0 1 -8 8 H40 L8 56 a9 9 0 0 1 0 -12 Z" fill="${fundo}"/>
  <circle cx="30" cy="50" r="7" fill="${furo}"/>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const el = (type, style, children) => ({ type, props: { style, children } });

/** Ícone: etiqueta amarela com "R$" verde. */
function icone(tamanho, furo) {
  return el('div', { display: 'flex', position: 'relative', width: tamanho * 1.2, height: tamanho }, [
    { type: 'img', props: { src: etiqueta(C.amarelo, furo), width: tamanho * 1.2, height: tamanho, style: { position: 'absolute', top: 0, left: 0 } } },
    el(
      'div',
      {
        position: 'absolute',
        top: 0,
        left: tamanho * 0.42,
        width: tamanho * 0.7,
        height: tamanho,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: tamanho * 0.42,
        fontWeight: 900,
        color: C.principal,
        letterSpacing: -1,
      },
      'R$',
    ),
  ]);
}

/** Texto em três linhas. */
function marca(escala, corTexto, corDestaque) {
  return el('div', { display: 'flex', flexDirection: 'column', lineHeight: 1 }, [
    el('div', { fontSize: 30 * escala, fontWeight: 800, color: corTexto, letterSpacing: 0.5 * escala }, 'QUANTO CUSTA'),
    el('div', { fontSize: 44 * escala, fontWeight: 900, color: corDestaque, marginTop: 2 * escala, letterSpacing: -0.5 * escala }, 'BOLSONARO'),
    el('div', { fontSize: 22 * escala, fontWeight: 800, color: corTexto, marginTop: 4 * escala, letterSpacing: 3 * escala }, 'NO PODER'),
  ]);
}

/** Faixas da marca (azul, amarela, branca), inclinadas como no BrandStripes do DS. */
function faixas(altura, posicao = { right: altura * 0.18, top: 0 }) {
  const w = altura * 0.22;
  return el(
    'div',
    { display: 'flex', position: 'absolute', ...posicao, height: altura },
    [C.azul, C.amarelo, C.branco].map((c) =>
      el('div', { width: w, height: altura, background: c, marginLeft: w * 0.35, transform: 'skewX(-24deg)' }, []),
    ),
  );
}

const versoes = {
  // Topo do site e redes: fundo verde.
  'horizontal-verde': {
    w: 640,
    h: 160,
    tree: el(
      'div',
      { display: 'flex', alignItems: 'center', gap: 22, width: 640, height: 160, padding: '0 28px', background: C.principal, position: 'relative', overflow: 'hidden' },
      [icone(96, C.principal), marca(1, C.branco, C.amarelo), faixas(160, { right: 10, top: 0 })],
    ),
  },
  // Fundo claro (documentos, impressos).
  'horizontal-branco': {
    w: 560,
    h: 160,
    tree: el(
      'div',
      { display: 'flex', alignItems: 'center', gap: 22, width: 560, height: 160, padding: '0 28px', background: C.branco },
      [icone(96, C.branco), marca(1, C.tinta, C.principal)],
    ),
  },
  // Avatar de redes e ícone: quadrado.
  selo: {
    w: 512,
    h: 512,
    tree: el(
      'div',
      {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
        width: 512,
        height: 512,
        background: C.principal,
        position: 'relative',
        overflow: 'hidden',
      },
      [
        icone(150, C.principal),
        el('div', { display: 'flex', textAlign: 'center', marginBottom: 40 }, [marca(1.45, C.branco, C.amarelo)]),
        faixas(70, { right: 40, bottom: 0 }),
      ],
    ),
  },
  // Topo do site: sem fundo, sobre o verde do TopNavigation.
  topo: {
    w: 330,
    h: 96,
    tree: el('div', { display: 'flex', alignItems: 'center', gap: 14, width: 330, height: 96 }, [
      icone(64, C.principal),
      el('div', { display: 'flex' }, [marca(0.68, C.branco, C.amarelo)]),
    ]),
  },
  // Só o ícone (favicon).
  icone: {
    w: 256,
    h: 256,
    tree: el('div', { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 256, height: 256, background: C.principal, borderRadius: 128 }, [
      icone(150, C.principal),
    ]),
  },
};

mkdirSync('public/logo', { recursive: true });
for (const [nome, v] of Object.entries(versoes)) {
  const svg = await satori(v.tree, { width: v.w, height: v.h, fonts });
  writeFileSync(`public/logo/${nome}.svg`, svg);
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: v.w * 2 } }).render().asPng();
  writeFileSync(`public/logo/${nome}.png`, png);
  console.log(nome, `${(svg.length / 1024).toFixed(1)} KB svg`, `${(png.length / 1024).toFixed(1)} KB png`);
}
