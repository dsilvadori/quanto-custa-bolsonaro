import { IconButton } from '@boralula/ui';
import { Minus, Plus } from 'lucide-react';
import { Fonte } from './Fonte';
import { preco } from '../formato';
import { ICONE_PRODUTO, Selo } from '../icones';

export interface LinhaLista {
  id: string;
  nome: string;
  unidade: string;
  preco: number;
  cenario: number;
  qtd: number;
  disponivel: boolean;
  fontePreco: string;
}

/**
 * Produtos do carrinho. Sem JS, mostra o carrinho padrão (quantidades fixas);
 * com JS, src/scripts/sim-carrinho.ts liga os botões e troca preços ao mudar de capital.
 */
export function ListaCarrinho({ linhas, fonteSubitem }: { linhas: LinhaLista[]; fonteSubitem: string }) {
  return (
    <ul className="carrinho" data-carrinho="">
      {linhas.map((l) => (
        <li key={l.id} className="produto" data-produto={l.id} hidden={!l.disponivel}>
          <Selo icone={ICONE_PRODUTO[l.id]} />
          <p className="produto__nome">
            {l.nome} <span className="produto__unidade">({l.unidade})</span>
          </p>
          <div className="produto__qtd">
            <IconButton className="so-com-js" icon={<Minus />} label={`Tirar ${l.nome}`} data-menos={l.id} />
            <output className="produto__numero" data-qtd={l.id} aria-label={`Quantidade de ${l.nome}`}>
              {l.qtd}
            </output>
            <IconButton className="so-com-js" icon={<Plus />} label={`Pôr ${l.nome}`} data-mais={l.id} />
          </div>
          <p className="produto__precos" data-numero="">
            <span className="junto">
              Hoje <span data-preco="">{preco(l.preco)}</span> <Fonte id={l.fontePreco} />
            </span>{' '}
            <span className="junto">
              Governo do Bolsonaro <strong data-cenario="">{preco(l.cenario)}</strong> <Fonte id={fonteSubitem} />
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}
