import { useEffect, useState } from "react";
import { GENERATION_RANGES, POKEMON_TYPES } from "../services/pokemonService";
import type { SortOption } from "../types/pokemon";
import { formatPokemonName } from "../utils/pokemonFormat";

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("pokedex-theme");

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface SearchFiltersProps {
  search: string;
  selectedType: string;
  selectedGeneration: keyof typeof GENERATION_RANGES;
  sortBy: SortOption;
  favoritesOnly: boolean;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onGenerationChange: (value: keyof typeof GENERATION_RANGES) => void;
  onSortChange: (value: SortOption) => void;
  onFavoritesOnlyChange: (value: boolean) => void;
  onResetFilters: () => void;
}

function SearchFilters({
  search,
  selectedType,
  selectedGeneration,
  sortBy,
  favoritesOnly,
  onSearchChange,
  onTypeChange,
  onGenerationChange,
  onSortChange,
  onFavoritesOnlyChange,
  onResetFilters,
}: SearchFiltersProps) {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("pokedex-theme", theme);
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <section className="toolbar" aria-label="Pokédex filters">
      <div className="topbar">
        <div className="search-field topbar__search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search Pokémon by name or number..."
            aria-label="Search Pokémon"
          />
        </div>

        <div className="filters-panel">
          <div className="filters-grid">
          <label>
            Type
            <select value={selectedType} onChange={(event) => onTypeChange(event.target.value)}>
              <option value="all">All types</option>
              {POKEMON_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatPokemonName(type)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Generation
            <select
              value={selectedGeneration}
              onChange={(event) => onGenerationChange(event.target.value as keyof typeof GENERATION_RANGES)}
            >
              {Object.entries(GENERATION_RANGES).map(([value, generation]) => (
                <option key={value} value={value}>
                  {generation.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sort by
            <select value={sortBy} onChange={(event) => onSortChange(event.target.value as SortOption)}>
              <option value="number-asc">Number ascending</option>
              <option value="number-desc">Number descending</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="height-desc">Tallest</option>
              <option value="weight-desc">Heaviest</option>
            </select>
          </label>

          <label className="switch-control">
            <span className="switch-control__label"><span aria-hidden="true">♡</span> Favorites Only</span>
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(event) => onFavoritesOnlyChange(event.target.checked)}
            />
            <span className="switch-control__track" />
          </label>
          </div>

          <button className="filters-panel__reset filters-panel__reset-link" type="button" onClick={onResetFilters}>
            Reset filters
          </button>
        </div>

        <div className="topbar__actions" aria-label="Display actions">
          <button
            className="icon-action"
            type="button"
            aria-label={`Switch to ${nextTheme} theme`}
            title={`Switch to ${nextTheme} theme`}
            onClick={() => setTheme(nextTheme)}
          >
            {theme === "dark" ? "☾" : "☼"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default SearchFilters;
