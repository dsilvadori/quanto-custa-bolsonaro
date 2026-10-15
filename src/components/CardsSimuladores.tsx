import { Card, Link } from '@boralula/ui';
import { Fonte } from './Fonte';
import { DESTAQUES } from '../destaques';
import { ICONE_PAGINA, Selo } from '../icones';
import { PAGINAS, SIMULADORES, type PaginaId } from '../site';

/** Links entre simuladores: na Início, todos; num simulador, os outros. Cada cartão mostra o número principal. */
export function CardsSimuladores({ exceto, headingLevel = 2 }: { exceto?: PaginaId; headingLevel?: 2 | 3 }) {
  return (
    <ul className="grade-cards">
      {SIMULADORES.filter((id) => id !== exceto).map((id) => {
        const d = DESTAQUES[id];
        return (
          <li key={id}>
            <Card
              title={
                <span className="card-titulo">
                  <Selo icone={ICONE_PAGINA[id]} />
                  {PAGINAS[id].rotulo}
                </span>
              }
              headingLevel={headingLevel}
              action={<Link href={PAGINAS[id].path}>Abrir o simulador</Link>}
            >
              {d && (
                <p className="card-numero">
                  <strong>{d.numero}</strong> <span>{d.texto}</span> <Fonte id={d.fonte} />
                </p>
              )}
              <p>{PAGINAS[id].titulo}</p>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
