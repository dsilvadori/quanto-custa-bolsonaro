import { describe, expect, it } from 'vitest';
import { PAGINAS, dataPorExtenso } from './site';

const paginas = Object.entries(PAGINAS);

describe('SEO das páginas', () => {
  it.each(paginas)('%s: title com até 60 caracteres', (_, p) => {
    expect(p.titulo.length).toBeLessThanOrEqual(60);
  });

  it.each(paginas)('%s: description com até 155 caracteres', (_, p) => {
    expect(p.descricao.length).toBeLessThanOrEqual(155);
  });

  it('titles, descriptions e paths são únicos', () => {
    for (const campo of ['titulo', 'descricao', 'path'] as const) {
      const valores = paginas.map(([, p]) => p[campo]);
      expect(new Set(valores).size).toBe(valores.length);
    }
  });
});

describe('dataPorExtenso', () => {
  it('formata em português sem deslocar o dia', () => {
    expect(dataPorExtenso('2026-10-15')).toBe('15 de outubro de 2026');
    expect(dataPorExtenso('2026-01-01')).toBe('1 de janeiro de 2026');
  });
});
