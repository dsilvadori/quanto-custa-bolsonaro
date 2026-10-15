// Simulador 4: o que a página mostra. Usado no build e no navegador.
import { desvincularDesde, perdaPercentual, projetarDesvinculacao, type Pagamentos } from '../calc/beneficio';
import type { Vigencia } from '../calc/salarioMinimo';
import { barras } from '../graficos/barras';
import { numero, pct, reais } from '../formato';

export interface DadosBeneficio {
  /** Vigências do salário mínimo (= piso). */
  real: Vigencia[];
  /** Último ano antes da desvinculação (o piso parte do mínimo de dezembro desse ano). */
  anoBase: number;
  /** INPC do ano anterior, em %, por ano em que seria aplicado. */
  inpcPorAno: Record<number, number>;
  piso: number;
  anoAtual: number;
  ateAno: number;
  /** Limites de ganho real do mínimo, em % ao ano (LC 200/2023 e Lei 15.077/2024). */
  ganhoMin: number;
  ganhoMax: number;
}

export type Tipo = 'bpc' | 'aposentadoria';
export const TIPOS: Tipo[] = ['bpc', 'aposentadoria'];
const PAGAMENTOS: Record<Tipo, Pagamentos> = { bpc: 12, aposentadoria: 13 };
const NOME: Record<Tipo, string> = { bpc: 'o BPC', aposentadoria: 'a aposentadoria de 1 salário mínimo' };
/** Concordância: "o BPC … desvinculado", "a aposentadoria … desvinculada". */
const DESVINCULADO: Record<Tipo, string> = { bpc: 'desvinculado', aposentadoria: 'desvinculada' };

export interface EstadoBeneficio {
  tipo: Tipo;
  /** Ganho real do mínimo na projeção, em % ao ano. */
  ganho: number;
}

export function estadoPadraoBeneficio(d: DadosBeneficio): EstadoBeneficio {
  // Ganho real no mínimo da lei: o cenário mais conservador.
  return { tipo: 'bpc', ganho: d.ganhoMin };
}

export function calcularBeneficio(d: DadosBeneficio, e: EstadoBeneficio) {
  const pagamentos = PAGAMENTOS[e.tipo];
  const retro = desvincularDesde({ real: d.real, anoBase: d.anoBase, inpcPorAno: d.inpcPorAno, pagamentos });
  const projecao = projetarDesvinculacao({ piso: d.piso, ganhoReal: e.ganho / 100, anoAtual: d.anoAtual, ateAno: d.ateAno, pagamentos });
  const ultimo = projecao.anos[projecao.anos.length - 1];
  return { pagamentos, retro, projecao, ultimo, perdaPctFinal: perdaPercentual(e.ganho / 100, d.ateAno - d.anoAtual) * 100 };
}

export function graficoRetro(d: DadosBeneficio, e: EstadoBeneficio): string {
  const { retro } = calcularBeneficio(d, e);
  return barras({
    id: 'grafico-retro',
    titulo: `Valor do benefício de ${d.anoBase + 1} a ${d.anoAtual}: ligado ao mínimo e desvinculado`,
    descricao: retro.anos.map((a) => `${a.ano}: ligado ao mínimo ${reais(a.real)}, desvinculado ${reais(a.desvinculado)}`).join('; ') + '.',
    categorias: retro.anos.map((a) => String(a.ano)),
    series: [
      { nome: 'Ligado ao mínimo', cor: 'var(--cp-color-primary)', valores: retro.anos.map((a) => a.real) },
      { nome: 'Desvinculado', cor: 'var(--cp-color-on-surface-variant)', valores: retro.anos.map((a) => a.desvinculado) },
    ],
    rotulo: numero,
  });
}

export function graficoProjecao(d: DadosBeneficio, e: EstadoBeneficio): string {
  const { projecao } = calcularBeneficio(d, e);
  return barras({
    id: 'grafico-projecao',
    titulo: `Benefício de ${d.anoAtual + 1} a ${d.ateAno}, em reais de hoje: ligado ao mínimo e desvinculado`,
    descricao: projecao.anos.map((a) => `${a.ano}: ligado ao mínimo ${reais(a.vinculado)}, desvinculado ${reais(a.desvinculado)}`).join('; ') + '.',
    categorias: projecao.anos.map((a) => String(a.ano)),
    series: [
      { nome: 'Ligado ao mínimo', cor: 'var(--cp-color-primary)', valores: projecao.anos.map((a) => a.vinculado) },
      { nome: 'Desvinculado', cor: 'var(--cp-color-on-surface-variant)', valores: projecao.anos.map((a) => a.desvinculado) },
    ],
    rotulo: numero,
  });
}

/** Linhas <tr> das tabelas (sem selos: a figura que as contém leva as fontes). */
export function linhasRetro(d: DadosBeneficio, e: EstadoBeneficio): string {
  return calcularBeneficio(d, e)
    .retro.anos.map(
      (a) =>
        `<tr><th scope="row">${a.ano}</th><td>${reais(a.real)}</td><td>${reais(a.desvinculado)}</td><td>${reais(a.perdaMensal)}</td><td>${reais(a.perdaAno)}</td></tr>`,
    )
    .join('');
}

export function linhasProjecao(d: DadosBeneficio, e: EstadoBeneficio): string {
  return calcularBeneficio(d, e)
    .projecao.anos.map(
      (a) =>
        `<tr><th scope="row">${a.ano}</th><td>${reais(a.vinculado)}</td><td>${reais(a.desvinculado)}</td><td>${reais(a.perdaMensal)}</td><td>${reais(a.perdaAno)}</td></tr>`,
    )
    .join('');
}

export function frasesBeneficio(d: DadosBeneficio, e: EstadoBeneficio) {
  const r = calcularBeneficio(d, e);
  const ultimoRetro = r.retro.anos[r.retro.anos.length - 1];
  const nome = NOME[e.tipo];
  const desv = DESVINCULADO[e.tipo];
  const Nome = nome.charAt(0).toUpperCase() + nome.slice(1);
  const ganho = pct(e.ganho, 1);
  const periodo = `${d.anoBase + 1} a ${d.anoAtual}`;
  return {
    pagamentos: e.tipo === 'bpc' ? '12 pagamentos por ano (o BPC não tem 13º)' : '12 pagamentos e o 13º',
    hoje: reais(ultimoRetro.desvinculado),
    retroPorMes: reais(r.retro.porMes),
    retroTotal: reais(r.retro.total),
    retro: `Se ${nome} tivesse sido ${desv} do salário mínimo em ${d.anoBase + 1}, hoje seria ${reais(ultimoRetro.desvinculado)}, e não ${reais(ultimoRetro.real)}: ${reais(r.retro.porMes)} a menos por mês. De ${periodo}, a perda somaria ${reais(r.retro.total)}.`,
    porMesFinal: reais(r.ultimo.perdaMensal),
    total: reais(r.projecao.total),
    perdaPct: pct(r.perdaPctFinal, 1),
    futuro: `${Nome} ${desv} ficaria em ${reais(d.piso)}, em reais de hoje. Com ganho real de ${ganho} ao ano no mínimo, em ${d.ateAno} seriam ${reais(r.ultimo.perdaMensal)} a menos por mês, e ${reais(r.projecao.total)} de ${d.anoAtual + 1} a ${d.ateAno}.`,
    whatsapp: (url: string) =>
      `Se ${nome} tivesse sido ${desv} do salário mínimo em ${d.anoBase + 1}, hoje seria ${reais(ultimoRetro.desvinculado)}, e não ${reais(ultimoRetro.real)}: ${reais(r.retro.porMes)} a menos por mês e ${reais(r.retro.total)} perdidos de ${periodo}. Veja a conta e as fontes: ${url}`,
    cartao: {
      numero: `−${reais(r.retro.porMes)}`,
      linha: `por mês para quem recebe ${e.tipo === 'bpc' ? 'o BPC' : 'aposentadoria de 1 mínimo'}`,
      premissa: `Se ${nome} tivesse sido ${desv} do mínimo em ${d.anoBase + 1} e subisse só pela inflação: ${reais(ultimoRetro.desvinculado)} hoje, e não ${reais(ultimoRetro.real)}. Perda de ${reais(r.retro.total)} de ${periodo}.`,
      fonte: 'Fontes: Diário Oficial e IBGE',
    },
  };
}
