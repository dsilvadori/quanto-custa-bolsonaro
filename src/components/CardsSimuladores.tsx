import { Card, Link } from '@boralula/ui';
import { PAGINAS, SIMULADORES, type PaginaId } from '../site';

/** Links entre simuladores: na home, todos; num simulador, os outros três. */
export function CardsSimuladores({ exceto, headingLevel = 2 }: { exceto?: PaginaId; headingLevel?: 2 | 3 }) {
  return (
    <ul className="grade-cards">
      {SIMULADORES.filter((id) => id !== exceto).map((id) => (
        <li key={id}>
          <Card
            title={PAGINAS[id].rotulo}
            headingLevel={headingLevel}
            action={<Link href={PAGINAS[id].path}>Abrir o simulador</Link>}
          >
            <p>{PAGINAS[id].titulo}</p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
