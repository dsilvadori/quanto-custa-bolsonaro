import { describe, expect, it } from 'vitest';
import { barras } from './barras';

const svg = barras({
  id: 'g',
  titulo: 'Título <com> "aspas"',
  descricao: 'Descrição',
  categorias: ['2025', '2026'],
  series: [
    { nome: 'Real', cor: 'red', valores: [100, 200] },
    { nome: 'Cenário', cor: 'gray', valores: [50, 100] },
  ],
  rotulo: String,
});

describe('barras', () => {
  it('tem title e desc ligados por aria-labelledby', () => {
    expect(svg).toContain('role="img" aria-labelledby="g-t g-d"');
    expect(svg).toContain('<title id="g-t">Título &lt;com> &quot;aspas&quot;</title>');
    expect(svg).toContain('<desc id="g-d">Descrição</desc>');
  });

  it('desenha uma barra e um rótulo por valor', () => {
    expect(svg.match(/<rect /g)).toHaveLength(4);
    for (const v of ['100', '200', '50']) expect(svg).toContain(`>${v}</text>`);
  });

  it('a maior barra ocupa a altura útil e as outras são proporcionais', () => {
    const alturas = [...svg.matchAll(/height="([\d.]+)"/g)].map((m) => Number(m[1]));
    const [real25, cen25, real26, cen26] = alturas;
    expect(real26).toBeCloseTo(2 * real25, 0);
    expect(cen26).toBeCloseTo(real25, 0);
    expect(cen25).toBeCloseTo(real25 / 2, 0);
  });
});
