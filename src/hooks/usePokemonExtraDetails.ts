import { useEffect, useState } from "react";
import { getPokemonExtraDetails } from "../services/pokemonService";
import type { Pokemon, PokemonExtraDetails } from "../types/pokemon";

interface PokemonExtraDetailsState {
  pokemonId: number | null;
  extraDetails: PokemonExtraDetails | null;
  error: string | null;
}

function usePokemonExtraDetails(pokemon: Pokemon | null) {
  const [state, setState] = useState<PokemonExtraDetailsState>({
    pokemonId: null,
    extraDetails: null,
    error: null,
  });

  useEffect(() => {
    if (!pokemon) return;

    let ignore = false;
    const pokemonId = pokemon.id;

    getPokemonExtraDetails(pokemon)
      .then((details) => {
        if (ignore) return;
        setState({
          pokemonId,
          extraDetails: details,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setState({
          pokemonId,
          extraDetails: null,
          error: err instanceof Error ? err.message : "Error loading Pokemon details",
        });
      });

    return () => {
      ignore = true;
    };
  }, [pokemon]);

  const isStale = Boolean(pokemon && state.pokemonId !== pokemon.id);

  return {
    extraDetails: pokemon && !isStale ? state.extraDetails : null,
    loadingExtraDetails: isStale,
    extraDetailsError: pokemon && !isStale ? state.error : null,
  };
}

export default usePokemonExtraDetails;
