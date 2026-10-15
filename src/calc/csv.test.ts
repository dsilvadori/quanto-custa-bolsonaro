import { describe, expect, it } from 'vitest';
import { lerCsv } from './csv';

describe('lerCsv', () => {
  it('lê cabeçalho e linhas, com células vazias como null', () => {
    expect(lerCsv('a,b\n1,\n3,4\n')).toEqual([
      { a: '1', b: null },
      { a: '3', b: '4' },
    ]);
  });

  it('aceita fim de linha do Windows', () => {
    expect(lerCsv('a\r\n1\r\n')).toEqual([{ a: '1' }]);
  });

  it('falha com número errado de colunas', () => {
    expect(() => lerCsv('a,b\n1,2,3')).toThrow(/linha 2/);
  });
});
