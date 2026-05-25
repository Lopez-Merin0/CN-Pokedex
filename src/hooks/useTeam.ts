import { useCallback, useEffect, useMemo, useState } from "react";
import { readNumberArray, writeNumberArray } from "../storage/localStorage";
import type { Pokemon } from "../types/pokemon";

const TEAM_STORAGE_KEY = "pokedex:team";
const TEAM_SIZE = 6;

function createInitialTeam(): Array<number | null> {
  const storedTeam = readNumberArray(TEAM_STORAGE_KEY).slice(0, TEAM_SIZE);
  return Array.from({ length: TEAM_SIZE }, (_, index) => storedTeam[index] ?? null);
}

function useTeam(pokemons: Pokemon[]) {
  const [teamIds, setTeamIds] = useState<Array<number | null>>(createInitialTeam);

  useEffect(() => {
    writeNumberArray(
      TEAM_STORAGE_KEY,
      teamIds.filter((id): id is number => id !== null),
    );
  }, [teamIds]);

  const teamPokemons = useMemo(
    () => teamIds.map((id) => pokemons.find((pokemon) => pokemon.id === id) ?? null),
    [pokemons, teamIds],
  );

  const addToTeam = useCallback((pokemon: Pokemon) => {
    setTeamIds((current) => {
      if (current.includes(pokemon.id)) return current;

      const next = [...current];
      const emptyIndex = next.findIndex((id) => id === null);
      if (emptyIndex === -1) return next;

      next[emptyIndex] = pokemon.id;
      return next;
    });
  }, []);

  const removeFromTeam = useCallback((index: number) => {
    setTeamIds((current) => current.map((id, currentIndex) => (currentIndex === index ? null : id)));
  }, []);

  const clearTeam = useCallback(() => {
    setTeamIds(Array(TEAM_SIZE).fill(null));
  }, []);

  return {
    teamIds,
    teamPokemons,
    addToTeam,
    removeFromTeam,
    clearTeam,
  };
}

export default useTeam;
