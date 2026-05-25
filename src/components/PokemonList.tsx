import type { Pokemon } from "../types/pokemon";
import PokemonCard from "./PokemonCard";
import SectionHeading from "./SectionHeading";

interface PokemonListProps {
  pokemons: Pokemon[];
  totalResults: number;
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  favorites: number[];
  selectedPokemonId: number | null;
  onSelectPokemon: (pokemon: Pokemon) => void;
  onToggleFavorite: (pokemonId: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
}

function getVisiblePages(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, "ellipsis", totalPages];
  }

  if (page >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
}

function PokemonList({
  pokemons,
  totalResults,
  loading,
  error,
  page,
  totalPages,
  favorites,
  selectedPokemonId,
  onSelectPokemon,
  onToggleFavorite,
  onPreviousPage,
  onNextPage,
  onPageChange,
}: PokemonListProps) {
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="pokemon-list card-surface">
      <SectionHeading eyebrow="Found" title={`${totalResults} Pokémon`} />

      {loading && <p className="status">Cargando Pokémon…</p>}
      {error && <p className="status status--error">{error}</p>}
      {!loading && !error && pokemons.length === 0 && <p className="status">No Pokémon match those filters.</p>}
      {!loading && !error && pokemons.length > 0 && (
        <div className="pokemon-grid">
          {pokemons.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              isFavorite={favorites.includes(pokemon.id)}
              isSelected={selectedPokemonId === pokemon.id}
              onSelect={onSelectPokemon}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      <div className="pagination" aria-label="Pagination">
        <button type="button" disabled={page === 1} onClick={onPreviousPage} aria-label="Previous page">
          ‹
        </button>

        {visiblePages.map((pageItem, index) =>
          pageItem === "ellipsis" ? (
            <span className="pagination__ellipsis" key={`ellipsis-${index}`}>…</span>
          ) : (
            <button
              className={pageItem === page ? "pagination__page pagination__page--active" : "pagination__page"}
              type="button"
              key={pageItem}
              onClick={() => onPageChange(pageItem)}
              aria-current={pageItem === page ? "page" : undefined}
            >
              {pageItem}
            </button>
          ),
        )}

        <button type="button" disabled={page === totalPages} onClick={onNextPage} aria-label="Next page">
          ›
        </button>
      </div>
    </div>
  );
}

export default PokemonList;
