import type { Pokemon } from "../types/pokemon";

export function formatPokemonName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function padPokemonId(id: number): string {
  return `#${id.toString().padStart(3, "0")}`;
}

export function getPokemonImage(pokemon: Pokemon): string {
  return (
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.other?.dream_world?.front_default ||
    pokemon.sprites.front_default ||
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
  );
}

export function getStatLabel(statName: string): string {
  const labels: Record<string, string> = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Speed",
  };

  return labels[statName] ?? formatPokemonName(statName);
}

export function getTotalStats(pokemon: Pokemon): number {
  return pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
}
