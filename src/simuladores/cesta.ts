// Simulador 2: o que a página mostra. Usado no build e no navegador.
import { fatorCesta } from '../calc/cesta';
import { barras } from '../graficos/barras';
import { numero, pct, reais } from '../formato';

export interface Capital {
  nome: string;
  valor: number;
}

export interface DadosCesta {
  bolsonaroPct: number;
  bolsonaroMeses: number;
  atualPct: number;
  atualMeses: number;
  /** Valor da cesta em cada capital (DIEESE). */
  capitais: Capital[];
  minimoReal: number;
  /** Mínimo de hoje com a regra do governo Bolsonaro (só inflação). */
  minimoCenario: number;
}

export type Ritmo = '100' | '75' | '50';
export const RITMOS: Ritmo[] = ['100', '75', '50'];
/** Valor da opção "média das 27 capitais" no seletor. */
export const MEDIA = 'media';

export interface EstadoCesta {
  capital: string;
  ritmo: Ritmo;
}

export const ESTADO_PADRAO_CESTA: EstadoCesta = { capital: MEDIA, ritmo: '100' };

export function valorHoje(d: DadosCesta, capital: string): number {
  if (capital === MEDIA) return d.capitais.reduce((s, c) => s + c.valor, 0) / d.capitais.length;
  const c = d.capitais.find((x) => x.nome === capital);
  if (!c) throw new Error(`Capital "${capital}" não existe nos dados`);
  return c.valor;
}

export function lugarTexto(d: DadosCesta, capital: string): string {
  return capital === MEDIA ? `na média das ${d.capitais.length} capitais` : `em ${capital}`;
}

export function calcularCesta(d: DadosCesta, e: EstadoCesta) {
  const fator = fatorCesta({
    bolsonaroPct: d.bolsonaroPct,
    bolsonaroMeses: d.bolsonaroMeses,
    atualPct: d.atualPct,
    atualMeses: d.atualMeses,
    ritmo: Number(e.ritmo) / 100,
  });
  const hoje = valorHoje(d, e.capital);
  const cenario = hoje * fator;
  return {
    fator,
    hoje,
    cenario,
    porMes: cenario - hoje,
    porAno: (cenario - hoje) * 12,
    /** Parte do salário mínimo que a cesta leva hoje e no cenário (com o mínimo só pela inflação). */
    pesoHoje: (hoje / d.minimoReal) * 100,
    pesoCenario: (cenario / d.minimoCenario) * 100,
  };
}

export function graficoCesta(d: DadosCesta, e: EstadoCesta): string {
  const r = calcularCesta(d, e);
  return barras({
    id: 'grafico-cesta',
    titulo: `Valor da cesta básica ${lugarTexto(d, e.capital)}`,
    descricao: `Hoje: ${reais(r.hoje)}. No ritmo do governo Bolsonaro: ${reais(r.cenario)}.`,
    categorias: ['Hoje', 'Ritmo de Bolsonaro'],
    series: [{ nome: 'Valor', cor: 'var(--cp-color-primary)', valores: [r.hoje, r.cenario] }],
    rotulo: (v) => `R$ ${numero(v)}`,
  });
}

export function frasesCesta(d: DadosCesta, e: EstadoCesta) {
  const r = calcularCesta(d, e);
  const ritmoTexto = e.ritmo === '100' ? 'no ritmo do governo Bolsonaro' : `a ${e.ritmo}% do ritmo do governo Bolsonaro`;
  const lugar = lugarTexto(d, e.capital);
  return {
    hoje: reais(r.hoje),
    cenario: reais(r.cenario),
    porMes: reais(r.porMes),
    porAno: reais(r.porAno),
    peso: pct(r.pesoCenario, 0),
    resumo: `Se a comida subisse ${ritmoTexto}, a cesta básica custaria ${reais(r.cenario)} ${lugar}, e não ${reais(r.hoje)}: ${reais(r.porMes)} a mais por mês.`,
    pesoTexto: `Com o mínimo só pela inflação, a cesta levaria ${pct(r.pesoCenario, 0)} do salário mínimo, e não ${pct(r.pesoHoje, 0)}.`,
    whatsapp: (url: string) =>
      `Se a comida subisse ${ritmoTexto}, a cesta básica custaria ${reais(r.cenario)} ${lugar}, e não ${reais(r.hoje)}: ${reais(r.porMes)} a mais por mês. Veja a conta e as fontes: ${url}`,
    cartao: {
      numero: `+${reais(r.porMes)}`,
      linha: `por mês na cesta básica ${lugar}`,
      premissa: `Se a comida subisse ${ritmoTexto}: ${reais(r.cenario)}, e não ${reais(r.hoje)}.`,
      fonte: 'Fontes: IBGE e DIEESE',
    },
  };
}
