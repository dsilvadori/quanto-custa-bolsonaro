// Simulador 4: o que a página mostra, a partir dos dados. Usado no build e no navegador.
import { perdaPercentual, projetarDesvinculacao, recebePiso } from '../calc/beneficio';
import { barras } from '../graficos/barras';
import { numero, pct, reais } from '../formato';
import { calcularSalario, type DadosSalario } from './salario';

export interface DadosBeneficio {
  salario: DadosSalario;
  /** Piso de hoje = salário mínimo em vigor. */
  piso: number;
  anoAtual: number;
  ateAno: number;
  /** Limites de ganho real do mínimo, em % ao ano (LC 200/2023 e Lei 15.077/2024). */
  ganhoMin: number;
  ganhoMax: number;
}

export interface EstadoBeneficio {
  valor: number;
  /** Ganho real do mínimo, em % ao ano. */
  ganho: number;
}

export function estadoPadraoBeneficio(d: DadosBeneficio): EstadoBeneficio {
  // Padrão no mínimo da lei: é o cenário mais conservador, sem escolher um valor no meio.
  return { valor: d.piso, ganho: d.ganhoMin };
}

export function calcularBeneficio(d: DadosBeneficio, e: EstadoBeneficio) {
  const noPiso = recebePiso(e.valor, d.piso);
  const retro = noPiso ? calcularSalario(d.salario, { quantidade: 1, base: 'padrao' }) : null;
  const projecao = projetarDesvinculacao({
    valor: e.valor,
    piso: d.piso,
    ganhoReal: e.ganho / 100,
    anoAtual: d.anoAtual,
    ateAno: d.ateAno,
  });
  const ultimo = projecao.anos[projecao.anos.length - 1];
  const perdaPctFinal = noPiso
    ? perdaPercentual(e.ganho / 100, d.ateAno - d.anoAtual) * 100
    : (ultimo.perdaMensal / ultimo.beneficioVinculado) * 100;
  return { noPiso, retro, projecao, ultimo, perdaPctFinal };
}

export function graficoBeneficio(d: DadosBeneficio, e: EstadoBeneficio): string {
  const { projecao } = calcularBeneficio(d, e);
  return barras({
    id: 'grafico-beneficio',
    titulo: `Benefício de ${d.anoAtual + 1} a ${d.ateAno}, em reais de hoje: ligado ao mínimo e só pela inflação`,
    descricao:
      projecao.anos.map((a) => `${a.ano}: ligado ao mínimo ${reais(a.beneficioVinculado)}, só inflação ${reais(a.beneficioDesvinculado)}`).join('; ') + '.',
    categorias: projecao.anos.map((a) => String(a.ano)),
    series: [
      { nome: 'Ligado ao mínimo', cor: 'var(--cp-color-primary)', valores: projecao.anos.map((a) => a.beneficioVinculado) },
      { nome: 'Só inflação', cor: 'var(--cp-color-on-surface-variant)', valores: projecao.anos.map((a) => a.beneficioDesvinculado) },
    ],
    rotulo: numero,
  });
}

/** Linhas <tr> da tabela ano a ano (sem selos de fonte: a figura que a contém leva as fontes). */
export function linhasProjecao(d: DadosBeneficio, e: EstadoBeneficio): string {
  return calcularBeneficio(d, e)
    .projecao.anos.map(
      (a) =>
        `<tr><th scope="row">${a.ano}</th><td>${reais(a.beneficioVinculado)}</td><td>${reais(a.beneficioDesvinculado)}</td><td>${reais(a.perdaMensal)}</td><td>${reais(a.perdaAno)}</td></tr>`,
    )
    .join('');
}

export function frasesBeneficio(d: DadosBeneficio, e: EstadoBeneficio) {
  const r = calcularBeneficio(d, e);
  const ganho = pct(e.ganho, 1);
  const retro = r.retro
    ? `Se o piso seguisse só a inflação desde ${d.salario.anoBase}, quem recebe ${reais(d.piso)} receberia ${reais(r.retro.ultimo.cenario)} em ${d.anoAtual}: ${reais(r.retro.porMes)} a menos por mês.`
    : `Benefícios acima do piso já são corrigidos só pela inflação. Por isso, a regra do governo Bolsonaro não mudaria o seu benefício de hoje.`;
  const futuro =
    r.projecao.total > 0
      ? `Com ganho real de ${ganho} ao ano no mínimo, em ${d.ateAno} você receberia ${reais(r.ultimo.perdaMensal)} a menos por mês. De ${d.anoAtual + 1} a ${d.ateAno}, a perda somaria ${reais(r.projecao.total)}.`
      : `Com ganho real de ${ganho} ao ano no mínimo, o piso não passaria do seu benefício até ${d.ateAno}. A desvinculação não mudaria o seu valor nesse período.`;
  return {
    porMesFinal: reais(r.ultimo.perdaMensal),
    total: reais(r.projecao.total),
    perdaPct: pct(r.perdaPctFinal, 1),
    retroPorMes: r.retro ? reais(r.retro.porMes) : reais(0),
    retroAcumulada: r.retro ? reais(r.retro.acumulada) : reais(0),
    retro,
    futuro,
    whatsapp: (url: string) =>
      r.projecao.total > 0
        ? `Se a aposentadoria e o BPC deixassem de seguir o ganho real do mínimo, quem recebe ${reais(e.valor)} perderia ${reais(r.projecao.total)} de ${d.anoAtual + 1} a ${d.ateAno} (ganho real de ${ganho} ao ano). Veja a conta e as fontes: ${url}`
        : `Veja quanto perderia quem recebe o piso do INSS ou o BPC se o benefício deixasse de seguir o mínimo: ${url}`,
    cartao: {
      numero: reais(r.projecao.total),
      linha: `a menos de ${d.anoAtual + 1} a ${d.ateAno} para quem recebe ${reais(e.valor)}`,
      premissa: `Se o benefício subisse só pela inflação e o salário mínimo tivesse ganho real de ${ganho} ao ano. Valores em reais de hoje, com 13º.`,
      fonte: 'Fontes: Diário Oficial e IBGE',
    },
  };
}
