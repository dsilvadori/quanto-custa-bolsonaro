// Simulador 2: o que a página mostra. Usado no build e no navegador.
import { fatorCesta, horasCenario, horasTexto } from '../calc/cesta';
import { barras } from '../graficos/barras';
import { pct } from '../formato';

export interface DadosCesta {
  bolsonaroPct: number;
  bolsonaroMeses: number;
  atualPct: number;
  atualMeses: number;
  horasHoje: number;
  minimoReal: number;
  minimoCenario: number;
}

export type Ritmo = '100' | '75' | '50';
export const RITMOS: Ritmo[] = ['100', '75', '50'];

export function calcularCesta(d: DadosCesta, ritmo: Ritmo) {
  const fator = fatorCesta({
    bolsonaroPct: d.bolsonaroPct,
    bolsonaroMeses: d.bolsonaroMeses,
    atualPct: d.atualPct,
    atualMeses: d.atualMeses,
    ritmo: Number(ritmo) / 100,
  });
  const horas = horasCenario(d.horasHoje, fator, d.minimoReal, d.minimoCenario);
  return { fator, horas, extra: horas - d.horasHoje, comidaMaisCara: (fator - 1) * 100 };
}

export function graficoCesta(d: DadosCesta, ritmo: Ritmo): string {
  const r = calcularCesta(d, ritmo);
  return barras({
    id: 'grafico-cesta',
    titulo: 'Horas de trabalho para comprar a cesta básica com o salário mínimo',
    descricao: `Hoje: ${horasTexto(d.horasHoje)}. No ritmo do governo Bolsonaro: ${horasTexto(r.horas)}.`,
    categorias: ['Hoje', 'Ritmo de Bolsonaro'],
    series: [{ nome: 'Horas', cor: 'var(--cp-color-primary)', valores: [d.horasHoje, r.horas] }],
    rotulo: horasTexto,
  });
}

export function frasesCesta(d: DadosCesta, ritmo: Ritmo) {
  const r = calcularCesta(d, ritmo);
  const ritmoTexto = ritmo === '100' ? 'no ritmo do governo Bolsonaro' : `a ${ritmo}% do ritmo do governo Bolsonaro`;
  return {
    horas: horasTexto(r.horas),
    extra: horasTexto(r.extra),
    comida: pct(r.comidaMaisCara, 0),
    resumo: `Se a comida subisse ${ritmoTexto} e o mínimo seguisse só a inflação, a cesta básica custaria ${horasTexto(r.horas)} de trabalho, e não ${horasTexto(d.horasHoje)}.`,
    whatsapp: (url: string) =>
      `Se a comida subisse ${ritmoTexto}, quem ganha o salário mínimo precisaria trabalhar ${horasTexto(r.extra)} a mais por mês para comprar a cesta básica. Veja a conta e as fontes: ${url}`,
    cartao: {
      numero: `+${horasTexto(r.extra)}`,
      linha: 'de trabalho por mês para comprar a cesta básica',
      premissa: `Se a comida subisse ${ritmoTexto} e o mínimo seguisse só a inflação: ${horasTexto(r.horas)} de trabalho, e não ${horasTexto(d.horasHoje)}.`,
      fonte: 'Fontes: IBGE e DIEESE',
    },
  };
}
