import { useMemo, useState } from "react";
import { GENERATION_RANGES } from "../services/pokemonService";
import type { Pokemon, SortOption } from "../types/pokemon";

const PAGE_SIZE = 24;

function usePokemonFilters(pokemons: Pokemon[], favorites: number[]) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedGeneration, setSelectedGeneration] = useState<keyof typeof GENERATION_RANGES>("all");
  const [sortBy, setSortBy] = useState<SortOption>("number-asc");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);

  const filteredPokemons = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const range = GENERATION_RANGES[selectedGeneration];

    return pokemons
      .filter((pokemon) => {
        const matchesSearch =
          pokemon.name.toLowerCase().includes(normalizedSearch) || pokemon.id.toString().includes(normalizedSearch);
        const matchesType = selectedType === "all" || pokemon.types.some(({ type }) => type.name === selectedType);
        const matchesGeneration = pokemon.id >= range.min && pokemon.id <= range.max;
        const matchesFavorite = !favoritesOnly || favorites.includes(pokemon.id);

        return matchesSearch && matchesType && matchesGeneration && matchesFavorite;
      })
      .sort((a, b) => {
        if (sortBy === "number-desc") return b.id - a.id;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "height-desc") return b.height - a.height;
        if (sortBy === "weight-desc") return b.weight - a.weight;
        return a.id - b.id;
      });
  }, [favorites, favoritesOnly, pokemons, search, selectedGeneration, selectedType, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPokemons.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const currentPagePokemons = useMemo(
    () => filteredPokemons.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredPokemons, safePage],
  );

  const resetFilters = () => {
    setSearch("");
    setSelectedType("all");
    setSelectedGeneration("all");
    setSortBy("number-asc");
    setFavoritesOnly(false);
    setPage(1);
  };

  const goToPreviousPage = () => {
    setPage((current) => Math.max(1, Math.min(current, totalPages) - 1));
  };

  const goToNextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1));
  };

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const updateSelectedType = (value: string) => {
    setSelectedType(value);
    setPage(1);
  };

  const updateSelectedGeneration = (value: keyof typeof GENERATION_RANGES) => {
    setSelectedGeneration(value);
    setPage(1);
  };

  const updateSortBy = (value: SortOption) => {
    setSortBy(value);
    setPage(1);
  };

  const updateFavoritesOnly = (value: boolean) => {
    setFavoritesOnly(value);
    setPage(1);
  };

  return {
    search,
    selectedType,
    selectedGeneration,
    sortBy,
    favoritesOnly,
    page: safePage,
    totalPages,
    filteredPokemons,
    currentPagePokemons,
    setSearch: updateSearch,
    setSelectedType: updateSelectedType,
    setSelectedGeneration: updateSelectedGeneration,
    setSortBy: updateSortBy,
    setFavoritesOnly: updateFavoritesOnly,
    setPage,
    resetFilters,
    goToPreviousPage,
    goToNextPage,
  };
}

export default usePokemonFilters;
