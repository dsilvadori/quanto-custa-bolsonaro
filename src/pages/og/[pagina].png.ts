// Imagens Open Graph 1200×630 geradas no build (satori → SVG → PNG). Nada disso vai para o navegador.
import type { APIRoute, GetStaticPaths } from 'astro';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { COMBUSTIVEIS, DADOS_BENEFICIO, DADOS_CARRINHO, DADOS_CESTA, DADOS_SALARIO } from '../../dados';
import { estadoPadraoCarrinho, frasesCarrinho } from '../../simuladores/carrinho';
import { ESTADO_PADRAO_CESTA, frasesCesta } from '../../simuladores/cesta';
import { calcularCombustivel } from '../../simuladores/combustivel';
import { ESTADO_PADRAO, calcularSalario } from '../../simuladores/salario';
import { estadoPadraoBeneficio, frasesBeneficio } from '../../simuladores/beneficio';
import { reais } from '../../formato';
import { PAGINAS, SITE } from '../../site';

interface Conteudo {
  numero?: string;
  texto: string;
  fonte?: string;
}

const s = calcularSalario(DADOS_SALARIO, ESTADO_PADRAO);
const b = frasesBeneficio(DADOS_BENEFICIO, estadoPadraoBeneficio(DADOS_BENEFICIO));
const c = frasesCesta(DADOS_CESTA, ESTADO_PADRAO_CESTA);
const car = frasesCarrinho(DADOS_CARRINHO, estadoPadraoCarrinho(DADOS_CARRINHO));
const combustivel = (nome: string) => calcularCombustivel(COMBUSTIVEIS.find((l) => l.combustivel === nome)!);
const diesel = combustivel('diesel');
const gasolina = combustivel('gasolina');

const CONTEUDO: Record<string, Conteudo> = {
  inicio: {
    numero: reais(s.porMes),
    texto: `a menos por mês no salário mínimo de ${s.ultimo.ano} com a regra do governo Bolsonaro`,
    fonte: 'Fontes: Diário Oficial e IBGE',
  },
  'salario-minimo': {
    numero: reais(s.ultimo.cenario),
    texto: `seria o salário mínimo de ${s.ultimo.ano} só com a inflação, e não ${reais(s.ultimo.real)}`,
    fonte: 'Fontes: Diário Oficial e IBGE',
  },
  'cesta-basica': {
    numero: `+${c.porMes}`,
    texto: `por mês na cesta básica se a comida subisse como no governo do Bolsonaro (${c.cenario}, e não ${c.hoje})`,
    fonte: 'Fontes: IBGE e DIEESE',
  },
  carrinho: {
    numero: car.diferenca,
    texto: `no carrinho com um de cada alimento se os preços subissem como no governo do Bolsonaro (${car.cenario}, e não ${car.hoje})`,
    fonte: 'Fontes: DIEESE, ANP e IBGE',
  },
  combustivel: {
    numero: `+${reais(diesel.aumento)}`,
    texto: `no litro do diesel e +${reais(gasolina.aumento)} no da gasolina se a Petrobras voltasse ao preço de importação`,
    fonte: 'Fontes: Abicom, ANP, CNPE e IBGE',
  },
  'aposentadoria-bpc': {
    numero: `−${b.retroPorMes}`,
    texto: `por mês no BPC se ele tivesse sido desvinculado do salário mínimo em ${DADOS_BENEFICIO.anoBase + 1}: ${b.hoje} hoje, e não ${reais(DADOS_BENEFICIO.piso)}`,
    fonte: 'Fontes: Diário Oficial e IBGE',
  },
};

export const getStaticPaths: GetStaticPaths = () => Object.keys(CONTEUDO).map((pagina) => ({ params: { pagina } }));

const require = createRequire(import.meta.url);
const arquivoFonte = (peso: number) => require.resolve(`@fontsource/montserrat/files/montserrat-latin-${peso}-normal.woff`);

/** Cores do DS lidas do tokens.css do pacote (só tokens, nenhuma cor inventada). */
async function tokens() {
  const css = await readFile(require.resolve('@boralula/ui/tokens.css'), 'utf8');
  const cor = (nome: string) => css.match(new RegExp(`${nome}:\\s*(#[0-9A-Fa-f]{6})`))![1];
  return {
    vermelho: cor('--cp-red-500'),
    branco: cor('--cp-white'),
    amarelo: cor('--cp-yellow-400'),
    azul: cor('--cp-blue-500'),
    verde: cor('--cp-green-500'),
  };
}

export const GET: APIRoute = async ({ params }) => {
  const c = CONTEUDO[params.pagina!];
  const t = await tokens();
  const [f700, f800] = await Promise.all([readFile(arquivoFonte(700)), readFile(arquivoFonte(800))]);
  const faixa = (cor: string, x: number) => ({
    type: 'div',
    props: {
      style: { position: 'absolute', top: 0, left: x, width: 70, height: 630, background: cor, transform: 'skewX(-24deg)' },
    },
  });

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: 1200,
          height: 630,
          display: 'flex',
          position: 'relative',
          background: t.vermelho,
          color: t.branco,
          fontFamily: 'Montserrat',
          overflow: 'hidden',
        },
        children: [
          faixa(t.azul, 1000),
          faixa(t.amarelo, 1090),
          faixa(t.verde, 1180),
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', width: 900 },
              children: [
                { type: 'div', props: { style: { fontSize: 30, fontWeight: 800, letterSpacing: 2 }, children: SITE.nomeCurto.toUpperCase() } },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', gap: 12 },
                    children: [
                      c.numero && { type: 'div', props: { style: { fontSize: 132, fontWeight: 800, color: t.amarelo, lineHeight: 1 }, children: c.numero } },
                      { type: 'div', props: { style: { fontSize: 44, fontWeight: 800, lineHeight: 1.2 }, children: c.texto } },
                    ].filter(Boolean),
                  },
                },
                { type: 'div', props: { style: { fontSize: 26, fontWeight: 700 }, children: c.fonte ?? PAGINAS.fontes.rotulo } },
              ],
            },
          },
        ],
      },
    } as never,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Montserrat', data: f700, weight: 700, style: 'normal' },
        { name: 'Montserrat', data: f800, weight: 800, style: 'normal' },
      ],
    },
  );
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'content-type': 'image/png' } });
};
