import { Button } from '@boralula/ui';
import type { ReactNode } from 'react';

/** Atalho do carrinho (quinzena, mês, esvaziar). Ligado em src/scripts/sim-carrinho.ts. */
export function BotaoAtalho({ acao, children }: { acao: 'quinzena' | 'mes' | 'vazio'; children: ReactNode }) {
  return (
    <Button variant="outline" type="button" data-atalho={acao}>
      {children}
    </Button>
  );
}
