import { describe, expect, it } from 'vitest';
import { barrasH } from './barrasH';

const svg = barrasH({
  id: 'h',
  titulo: 'T',
  descricao: 'D',
  linhas: [
    { rotulo: 'Café', valor: 40, texto: '+40%', destaque: true },
    { rotulo: 'Arroz', valor: 20, texto: '+20%' },
    { rotulo: 'Gasolina', valor: -10, texto: '−10%' },
  ],
});

describe('barrasH', () => {
  it('acessível: title, desc e role=img', () => {
    expect(svg).toContain('role="img" aria-labelledby="h-t h-d"');
    expect(svg).toContain('<title id="h-t">T</title>');
  });

  it('uma barra por linha, proporcionais; negativa do outro lado do zero', () => {
    const rects = [...svg.matchAll(/<rect x="([\d.]+)" y="[\d.]+" width="([\d.]+)"/g)].map((m) => ({ x: Number(m[1]), w: Number(m[2]) }));
    expect(rects).toHaveLength(3);
    expect(rects[0].w).toBeCloseTo(2 * rects[1].w, 0);
    expect(rects[2].w).toBeCloseTo(rects[1].w / 2, 0);
    expect(rects[2].x + rects[2].w).toBeCloseTo(rects[0].x, 0); // a negativa termina no zero
  });

  it('cores: destaque na primária, negativa na terciária', () => {
    expect(svg).toContain('fill="var(--cp-color-primary)"');
    expect(svg).toContain('fill="var(--cp-color-tertiary)"');
  });
});
