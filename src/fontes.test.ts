import { describe, expect, it } from 'vitest';
import { FONTES, existeFonte } from './fontes';
import { CESTA, COMBUSTIVEIS, INPC, INPC_ANUAL, PARAMETROS, PICO_COMBUSTIVEL, SALARIO_MINIMO, SALARIO_MINIMO_REAL, CESTAS_SALARIO_MINIMO } from './dados';
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
    // Página web, não arquivo de dados (API, planilha, XML).
    expect(f.url).not.toMatch(/apisidra|\.xlsx?$|\.xml$|\.csv$/);
    if (f.data_publicacao !== null) expect(f.data_publicacao).toMatch(data);
    expect(f.data_coleta).toMatch(data);
    expect(f.usado_em.length).toBeGreaterThan(0);
    for (const p of f.usado_em) expect(paths).toContain(p);
  });
});

describe('CSVs de /data', () => {
  it('toda linha aponta para uma fonte do registro', () => {
    const ids = [
      ...[...SALARIO_MINIMO, ...SALARIO_MINIMO_REAL, ...INPC, ...INPC_ANUAL, ...Object.values(PARAMETROS)].map((l) => l.fonte),
      ...CESTAS_SALARIO_MINIMO.flatMap((c) => [c.fonteSalario, c.fonteCesta]),
      ...CESTA.bolsonaro.fontes,
      ...CESTA.atual.fontes,
      ...CESTA.capitais.map((c) => c.fonte),
      ...COMBUSTIVEIS.flatMap((c) => Object.values(c.fontes)),
      ...PICO_COMBUSTIVEL.flatMap((c) => Object.values(c.fontes)),
    ];
    for (const id of ids) expect(existeFonte(id), id).toBe(true);
  });
});
