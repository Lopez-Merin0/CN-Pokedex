// src/hooks/usePokemonExtraDetails.ts
import { useEffect, useState } from 'react';
import { getPokemonDetails, getPokemonExtraDetails } from '../services/pokemonService';
import type { Pokemon, PokemonExtraDetails } from '../types/pokemon';

interface UsePokemonExtraDetailsReturn {
  extraDetails: PokemonExtraDetails | null;
  loadingExtraDetails: boolean;
  extraDetailsError: Error | null;
  updatedPokemon: Pokemon | null;  // ← NUEVO: Pokémon con stats actualizadas
}

export function usePokemonExtraDetails(pokemon: Pokemon | null): UsePokemonExtraDetailsReturn {
  const [extraDetails, setExtraDetails] = useState<PokemonExtraDetails | null>(null);
  const [loadingExtraDetails, setLoadingExtraDetails] = useState(false);
  const [extraDetailsError, setExtraDetailsError] = useState<Error | null>(null);
  const [updatedPokemon, setUpdatedPokemon] = useState<Pokemon | null>(null);  // ← NUEVO

  useEffect(() => {
    if (!pokemon) {
      setExtraDetails(null);
      setUpdatedPokemon(null);
      setExtraDetailsError(null);
      return;
    }

    let isMounted = true;

    const fetchExtraDetails = async () => {
      setLoadingExtraDetails(true);
      setExtraDetailsError(null);
      
      try {
        console.log("🌱 usePokemonExtraDetails - Obteniendo detalles para:", pokemon.name);
        
        // PASO 1: Obtener detalles COMPLETOS desde Azure Function
        const fullPokemon = await getPokemonDetails(pokemon.id);
        console.log("📦 Pokémon completo desde Azure Function:", fullPokemon);
        console.log("📊 Stats en fullPokemon:", fullPokemon.stats);
        
        if (isMounted) {
          setUpdatedPokemon(fullPokemon);  // ← NUEVO: Guardar Pokémon con stats
        }
        
        // PASO 2: Obtener detalles extras
        const extra = await getPokemonExtraDetails(fullPokemon);
        console.log("✨ Detalles extras obtenidos:", extra);
        
        if (isMounted) {
          setExtraDetails(extra);
        }
      } catch (err) {
        console.error("❌ Error fetching extra details:", err);
        if (isMounted) {
          setExtraDetailsError(err instanceof Error ? err : new Error('Unknown error'));
          setUpdatedPokemon(pokemon);  // Fallback al Pokémon original
          setExtraDetails({
            description: `${pokemon.name} is a Pokémon.`,
            category: "Pokémon",
            abilities: [],
            evolutions: [],
          });
        }
      } finally {
        if (isMounted) {
          setLoadingExtraDetails(false);
        }
      }
    };

    fetchExtraDetails();

    return () => {
      isMounted = false;
    };
  }, [pokemon]);

  return { extraDetails, loadingExtraDetails, extraDetailsError, updatedPokemon };
}

export default usePokemonExtraDetails;