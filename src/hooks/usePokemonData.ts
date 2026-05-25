import { useEffect, useState } from "react";
import { getPokemonBatch } from "../services/pokemonService";
import type { Pokemon } from "../types/pokemon";

interface PokemonDataState {
  limit: number | null;
  pokemons: Pokemon[];
  selectedPokemon: Pokemon | null;
  error: string | null;
  loading: boolean;
}

function usePokemonData(limit: number) {
  const [state, setState] = useState<PokemonDataState>({
    limit: null,
    pokemons: [],
    selectedPokemon: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    let ignore = false;

    getPokemonBatch(limit)
      .then((data) => {
        if (ignore) return;
        setState({
          limit,
          pokemons: data,
          selectedPokemon: null,
          error: null,
          loading: false,
        });
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setState({
          limit,
          pokemons: [],
          selectedPokemon: null,
          error: err instanceof Error ? err.message : "Error loading Pokemon",
          loading: false,
        });
      });

    return () => {
      ignore = true;
    };
  }, [limit]);

  const isStale = state.limit !== limit;

  const setSelectedPokemon = (pokemon: Pokemon | null) => {
    setState((current) => ({ ...current, selectedPokemon: pokemon }));
  };

  return {
    pokemons: isStale ? [] : state.pokemons,
    selectedPokemon: isStale ? null : state.selectedPokemon,
    setSelectedPokemon,
    loading: isStale || state.loading,
    error: isStale ? null : state.error,
  };
}

export default usePokemonData;
