// Vidas perdidas na covid no governo do Bolsonaro: os números da página /covid, do resumo em todas as páginas
// e da imagem de compartilhamento. Cada número leva o id da fonte em data/fontes.json.

export const COVID = {
  /** Mortes registradas até o último boletim de 2022 divulgado pela Agência Brasil. */
  mortes: { texto: '693,7 mil', fonte: 'agenciabrasil-2022-12-29-covid-693-mil' },
  /** Mortes por milhão de habitantes em 3 de fevereiro de 2022. */
  porMilhao: { brasil: 2932, mundo: 720, fonte: 'fiocruz-2022-02-balanco-dois-anos' },
  /** Fatia do Brasil no total mundial, também em fevereiro de 2022. */
  fatia: { casos: 6.7, mortes: 11, fonte: 'fiocruz-2022-02-balanco-dois-anos' },
  /** Pedro Hallal (UFPel) à CPI, em junho de 2021: população e mortes, em % do mundo. */
  hallal: { populacao: 2.7, mortes: 13, evitaveis: '400 mil', fonte: 'senado-2021-06-24-hallal-400-mil' },
  /** Estimativas de mortes evitáveis, da menor para a maior. */
  evitaveis: [
    {
      valor: 120_000,
      texto: '120 mil',
      quem: 'Jurema Werneck e Grupo Alerta, à CPI',
      curto: 'Grupo Alerta',
      cenario: 'No primeiro ano da pandemia, com distanciamento, máscaras, testes e rastreamento de contatos.',
      fonte: 'senado-2021-06-24-hallal-400-mil',
    },
    {
      valor: 391_647,
      texto: '391.647',
      quem: 'UFMG, na Revista Brasileira de Epidemiologia',
      curto: 'UFMG',
      cenario:
        'De março de 2020 a junho de 2022, com a vacinação começando 40 dias antes, mais doses e medidas de proteção: 6 em cada 10 mortes.',
      fonte: 'rbepid-2023-ufmg-mortes-evitaveis',
    },
    {
      valor: 400_000,
      texto: '400 mil',
      quem: 'Pedro Hallal (UFPel), à CPI',
      curto: 'Pedro Hallal (UFPel)',
      cenario: 'Se o Brasil tivesse ficado na média mundial de mortes: 4 em cada 5 mortes até junho de 2021.',
      fonte: 'senado-2021-06-24-hallal-400-mil',
    },
  ],
  /** Mortes causadas pelo atraso das vacinas. */
  vacina: {
    atrasoPfizerCoronavac: { texto: '95,5 mil', fonte: 'senado-2021-06-24-hallal-400-mil' },
    ritmo: { texto: '145 mil', fonte: 'senado-2021-06-24-hallal-400-mil' },
    comoReinoUnido: { texto: '86.639', fonte: 'rbepid-2023-ufmg-mortes-evitaveis' },
  },
} as const;
