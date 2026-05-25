import { useState } from "react";
import FavoritesPanel from "../components/FavoritesPanel";
import CompareModal from "../components/CompareModal";
import PokemonDetailsPanel from "../components/PokemonDetailsPanel";
import PokemonList from "../components/PokemonList";
import SearchFilters from "../components/SearchFilters";
import Sidebar from "../components/Sidebar";
import TeamBuilder from "../components/TeamBuilder";
import useFavorites from "../hooks/useFavorites";
import usePokemonData from "../hooks/usePokemonData";
import usePokemonFilters from "../hooks/usePokemonFilters";
import useTeam from "../hooks/useTeam";
import type { Pokemon } from "../types/pokemon";

const POKEMON_LOAD_LIMIT = 1025;

function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pokemons, selectedPokemon, setSelectedPokemon, loading, error } = usePokemonData(POKEMON_LOAD_LIMIT);
  const [compareModalPokemon, setCompareModalPokemon] = useState<Pokemon | null>(null);

  const { favorites, favoritePokemons, isFavorite, toggleFavorite } = useFavorites(pokemons);

  const {
    search,
    selectedType,
    selectedGeneration,
    sortBy,
    favoritesOnly,
    page,
    totalPages,
    filteredPokemons,
    currentPagePokemons,
    setSearch,
    setSelectedType,
    setSelectedGeneration,
    setSortBy,
    setFavoritesOnly,
    resetFilters,
    goToPreviousPage,
    goToNextPage,
    setPage,
  } = usePokemonFilters(pokemons, favorites);

  const { teamPokemons, addToTeam, removeFromTeam, clearTeam } = useTeam(pokemons);

  const showFavoritesOnly = () => {
    setFavoritesOnly(true);
    window.location.hash = "pokedex";
  };

  return (
    <div className="app-shell">
      <Sidebar
        loadedCount={pokemons.length}
        totalCount={POKEMON_LOAD_LIMIT}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((current) => !current)}
        onClose={() => setIsSidebarOpen(false)}
        onShowFavorites={showFavoritesOnly}
      />

      <main className="main-layout" id="pokedex">
        <SearchFilters
          search={search}
          selectedType={selectedType}
          selectedGeneration={selectedGeneration}
          sortBy={sortBy}
          favoritesOnly={favoritesOnly}
          onSearchChange={setSearch}
          onTypeChange={setSelectedType}
          onGenerationChange={setSelectedGeneration}
          onSortChange={setSortBy}
          onFavoritesOnlyChange={setFavoritesOnly}
          onResetFilters={resetFilters}
        />

        <section className="content-grid">
          <div className="pokedex-column">
            <TeamBuilder
              teamPokemons={teamPokemons}
              selectedPokemon={selectedPokemon}
              onAddToTeam={addToTeam}
              onRemoveFromTeam={removeFromTeam}
              onClearTeam={clearTeam}
            />

            <PokemonList
              pokemons={currentPagePokemons}
              totalResults={filteredPokemons.length}
              loading={loading}
              error={error}
              page={page}
              totalPages={totalPages}
              favorites={favorites}
              selectedPokemonId={selectedPokemon?.id ?? null}
              onSelectPokemon={setSelectedPokemon}
              onToggleFavorite={toggleFavorite}
              onPreviousPage={goToPreviousPage}
              onNextPage={goToNextPage}
              onPageChange={setPage}
            />
          </div>

          <aside className="details-column">
            <FavoritesPanel
              favoritePokemons={favoritePokemons}
              favoritesCount={favorites.length}
              onSelectPokemon={setSelectedPokemon}
              onShowFavorites={showFavoritesOnly}
            />

            <PokemonDetailsPanel
              pokemon={selectedPokemon}
              isFavorite={selectedPokemon ? isFavorite(selectedPokemon.id) : false}
              onToggleFavorite={toggleFavorite}
              onAddToTeam={addToTeam}
              onAddToCompare={setCompareModalPokemon}
              onClose={() => setSelectedPokemon(null)}
            />
          </aside>
        </section>
      </main>

      <CompareModal
        initialPokemon={compareModalPokemon}
        pokemons={pokemons}
        onClose={() => setCompareModalPokemon(null)}
      />
    </div>
  );
}

export default HomePage;
