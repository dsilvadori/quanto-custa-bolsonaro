import { describe, expect, it } from 'vitest';
import { barrasH } from './barrasH';

const svg = barrasH({
  id: 'h',
  titulo: 'T',
  descricao: 'D',
  linhas: [
    { rotulo: 'Café', valor: 40, texto: '+40%', detalhe: 'Lula R$ 1 → Bolsonaro R$ 2' },
    { rotulo: 'Arroz', valor: 20, texto: '+20%' },
    { rotulo: 'Gasolina', valor: -10, texto: '−10%' },
  ],
});

/** Barras preenchidas (a segunda rect de cada linha; a primeira é o trilho). */
const barras = (s: string) =>
  [...s.matchAll(/<rect x="0" y="([\d.]+)" width="([\d.]+)"[^>]*fill="([^"]+)"/g)]
    .map((m) => ({ w: Number(m[2]), cor: m[3] }))
    .filter((b) => b.cor !== 'var(--cp-color-surface-container)');

describe('barrasH (lista)', () => {
  it('acessível: title, desc e role=img', () => {
    expect(svg).toContain('role="img" aria-labelledby="h-t h-d"');
    expect(svg).toContain('<title id="h-t">T</title>');
  });

  it('nome alinhado à esquerda e valor à direita', () => {
    expect(svg).toContain('<text x="0" y="12" font-size="13" font-weight="800" fill="var(--cp-color-on-surface)">Café</text>');
    expect(svg).toMatch(/<text x="360" y="12" text-anchor="end"[^>]*>\+40%<\/text>/);
  });

  it('barras proporcionais ao maior valor, em vermelho; negativa em azul', () => {
    const b = barras(svg);
    expect(b).toHaveLength(3);
    expect(b[0].w).toBeCloseTo(360, 5);
    expect(b[1].w).toBeCloseTo(180, 5);
    expect(b[2].w).toBeCloseTo(90, 5);
    expect(b[0].cor).toBe('var(--cp-color-primary)');
    expect(b[2].cor).toBe('var(--cp-color-tertiary)');
  });

  it('detalhe embaixo da barra', () => {
    expect(svg).toContain('>Lula R$ 1 → Bolsonaro R$ 2</text>');
  });
});
