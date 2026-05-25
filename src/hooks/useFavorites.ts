import { useCallback, useEffect, useMemo, useState } from "react";
import { readNumberArray, writeNumberArray } from "../storage/localStorage";
import type { Pokemon } from "../types/pokemon";

const FAVORITES_STORAGE_KEY = "pokedex:favorites";
const FAVORITES_PREVIEW_LIMIT = 6;

function useFavorites(pokemons: Pokemon[]) {
  const [favorites, setFavorites] = useState<number[]>(() => readNumberArray(FAVORITES_STORAGE_KEY));

  useEffect(() => {
    writeNumberArray(FAVORITES_STORAGE_KEY, favorites);
  }, [favorites]);

  const favoritePokemons = useMemo(
    () => pokemons.filter((pokemon) => favorites.includes(pokemon.id)).slice(0, FAVORITES_PREVIEW_LIMIT),
    [favorites, pokemons],
  );

  const isFavorite = useCallback((pokemonId: number) => favorites.includes(pokemonId), [favorites]);

  const toggleFavorite = useCallback((pokemonId: number) => {
    setFavorites((current) =>
      current.includes(pokemonId) ? current.filter((id) => id !== pokemonId) : [...current, pokemonId],
    );
  }, []);

  return {
    favorites,
    favoritePokemons,
    isFavorite,
    toggleFavorite,
  };
}

export default useFavorites;
