import { FilterChip } from '@boralula/ui';

/** Chips de filtro de /fontes. Sem JS ficam escondidos (a lista aparece inteira); src/scripts/fontes-filtro.ts filtra. */
export function FiltroOrgaos({ orgaos }: { orgaos: string[] }) {
  return (
    <div className="filtro so-com-js" role="group" aria-label="Filtrar por órgão" data-filtro-orgaos="">
      <FilterChip selected data-orgao="">
        Todos
      </FilterChip>
      {orgaos.map((o) => (
        <FilterChip key={o} data-orgao={o}>
          {o}
        </FilterChip>
      ))}
    </div>
  );
}
