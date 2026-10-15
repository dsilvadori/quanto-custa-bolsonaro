import { IconButton } from '@boralula/ui';
import { Minus, Plus } from 'lucide-react';
import { Fonte } from './Fonte';
import { preco } from '../formato';

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
          <div className="produto__info">
            <p className="produto__nome">
              {l.nome} <span className="produto__unidade">({l.unidade})</span>
            </p>
            <p className="produto__precos" data-numero="">
              Hoje <span data-preco="">{preco(l.preco)}</span> <Fonte id={l.fontePreco} />
              <br />
              Ritmo de Bolsonaro <strong data-cenario="">{preco(l.cenario)}</strong> <Fonte id={fonteSubitem} />
            </p>
          </div>
          <div className="produto__qtd">
            <IconButton className="so-com-js" icon={<Minus />} label={`Tirar ${l.nome}`} data-menos={l.id} />
            <output className="produto__numero" data-qtd={l.id} aria-label={`Quantidade de ${l.nome}`}>
              {l.qtd}
            </output>
            <IconButton className="so-com-js" icon={<Plus />} label={`Pôr ${l.nome}`} data-mais={l.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}
