import { describe, expect, it } from 'vitest';
import { FONTES, existeFonte } from './fontes';
import { CESTA, COMBUSTIVEIS, INPC, PARAMETROS, SALARIO_MINIMO } from './dados';
import { PAGINAS } from './site';

const data = /^\d{4}-\d{2}-\d{2}$/;
const paths = new Set(Object.values(PAGINAS).map((p) => p.path));

describe('data/fontes.json', () => {
  it('ids únicos', () => {
    const ids = FONTES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(FONTES.map((f) => [f.id, f] as const))('%s: campos obrigatórios', (_, f) => {
    expect(f.id).toMatch(/^[a-z0-9-]+$/);
    for (const campo of ['titulo', 'orgao', 'valor_usado'] as const) expect(f[campo].trim()).not.toBe('');
    expect(f.url).toMatch(/^https:\/\//);
    if (f.url_arquivo !== null) expect(f.url_arquivo).toMatch(/^https?:\/\/web\.archive\.org\/web\/\d{14}\//);
    if (f.data_publicacao !== null) expect(f.data_publicacao).toMatch(data);
    expect(f.data_coleta).toMatch(data);
    expect(f.usado_em.length).toBeGreaterThan(0);
    for (const p of f.usado_em) expect(paths).toContain(p);
  });
});

describe('CSVs de /data', () => {
  it('toda linha aponta para uma fonte do registro', () => {
    const ids = [
      ...[...SALARIO_MINIMO, ...INPC, ...Object.values(PARAMETROS)].map((l) => l.fonte),
      ...CESTA.bolsonaro.fontes,
      ...CESTA.atual.fontes,
      CESTA.fonteHoras,
      ...COMBUSTIVEIS.flatMap((c) => Object.values(c.fontes)),
    ];
    for (const id of ids) expect(existeFonte(id), id).toBe(true);
  });
});
