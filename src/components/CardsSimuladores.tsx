import { Card, Link } from '@boralula/ui';
import { Fonte } from './Fonte';
import { DESTAQUES } from '../destaques';
import { ICONE_PAGINA, Selo } from '../icones';
import { PAGINAS, SIMULADORES, type PaginaId, link } from '../site';

/**
 * Links entre simuladores: na Início, todos; num simulador, os outros. Cada cartão mostra o número principal.
 * `comCovid` acrescenta o cartão das vidas perdidas na covid (só na Início: nas outras páginas já há o resumo da covid).
 */
export function CardsSimuladores({
  exceto,
  headingLevel = 2,
  comCovid = false,
}: {
  exceto?: PaginaId;
  headingLevel?: 2 | 3;
  comCovid?: boolean;
}) {
  const ids: PaginaId[] = [...SIMULADORES.filter((id) => id !== exceto), ...(comCovid ? (['covid'] as const) : [])];
  return (
    <ul className="grade-cards">
      {ids.map((id) => {
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
              action={<Link href={link(PAGINAS[id].path)}>{id === 'covid' ? 'Ver os números' : 'Abrir o simulador'}</Link>}
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
