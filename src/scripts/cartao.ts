// Cartão 1080×1080 em PNG, desenhado em <canvas>. Carregado sob demanda por compartilhar.ts.
// O cartão nunca sai sem a premissa e a fonte. Cores lidas dos tokens do DS na página.

export interface DadosCartao {
  numero: string;
  linha: string;
  premissa: string;
  /** Ex.: "Fontes: Diário Oficial e IBGE" */
  fonte: string;
  /** URL curta da âncora em /fontes, sem https:// */
  url: string;
}

const T = 1080;
const M = 80;

function token(nome: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
}

function quebrar(ctx: CanvasRenderingContext2D, texto: string, largura: number): string[] {
  const linhas: string[] = [];
  let linha = '';
  for (const palavra of texto.split(' ')) {
    const teste = linha ? `${linha} ${palavra}` : palavra;
    if (ctx.measureText(teste).width > largura && linha) {
      linhas.push(linha);
      linha = palavra;
    } else linha = teste;
  }
  if (linha) linhas.push(linha);
  return linhas;
}

export async function gerarCartao(d: DadosCartao): Promise<Blob> {
  const fonte = getComputedStyle(document.body).fontFamily;
  await Promise.all([document.fonts?.load(`800 120px ${fonte}`), document.fonts?.load(`700 40px ${fonte}`)]);

  const canvas = document.createElement('canvas');
  canvas.width = T;
  canvas.height = T;
  const ctx = canvas.getContext('2d')!;
  const principal = token('--cp-green-700');
  const branco = token('--cp-white');
  const amarelo = token('--cp-yellow-400');
  const tinta = token('--cp-ink');

  // Fundo verde com as faixas da marca (mesma geometria do BrandStripes, no canto de baixo).
  ctx.fillStyle = principal;
  ctx.fillRect(0, 0, T, T);
  const faixas: [string, number][] = [
    [token('--cp-blue-500'), 0],
    [amarelo, 1],
    [branco, 2],
  ];
  for (const [cor, i] of faixas) {
    const x = 760 + i * 110;
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.moveTo(x, T - 200);
    ctx.lineTo(x + 86, T - 200);
    ctx.lineTo(x + 86 - 90, T);
    ctx.lineTo(x - 90, T);
    ctx.closePath();
    ctx.fill();
  }

  ctx.textBaseline = 'top';
  let y = M;
  ctx.fillStyle = branco;
  ctx.font = `800 34px ${fonte}`;
  ctx.fillText('QUANTO CUSTA', M, y);
  y += 90;

  ctx.fillStyle = amarelo;
  let tamanho = 190;
  ctx.font = `800 ${tamanho}px ${fonte}`;
  while (ctx.measureText(d.numero).width > T - 2 * M && tamanho > 80) {
    tamanho -= 10;
    ctx.font = `800 ${tamanho}px ${fonte}`;
  }
  ctx.fillText(d.numero, M, y);
  y += tamanho + 20;

  ctx.fillStyle = branco;
  ctx.font = `800 52px ${fonte}`;
  for (const l of quebrar(ctx, d.linha, T - 2 * M)) {
    ctx.fillText(l, M, y);
    y += 64;
  }
  y += 36;

  // Premissa em caixa branca, letra grande o bastante para ler no celular.
  ctx.font = `700 36px ${fonte}`;
  const premissa = quebrar(ctx, d.premissa, T - 2 * M - 64);
  const alturaCaixa = premissa.length * 48 + 56;
  ctx.fillStyle = branco;
  ctx.beginPath();
  ctx.roundRect(M, y, T - 2 * M, alturaCaixa, 16);
  ctx.fill();
  ctx.fillStyle = tinta;
  premissa.forEach((l, i) => ctx.fillText(l, M + 32, y + 28 + i * 48));

  ctx.fillStyle = branco;
  ctx.font = `700 32px ${fonte}`;
  ctx.fillText(d.fonte, M, T - M - 84);
  ctx.font = `800 32px ${fonte}`;
  ctx.fillText(d.url, M, T - M - 36);

  return new Promise((ok, erro) => canvas.toBlob((b) => (b ? ok(b) : erro(new Error('toBlob'))), 'image/png'));
}
