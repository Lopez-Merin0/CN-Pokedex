/**
 * Formatea un nombre de Pokémon para mostrarlo de forma legible.
 * @param name - El nombre del Pokémon (puede ser string, objeto o undefined)
 * @returns El nombre formateado con la primera letra en mayúscula
 */
export function formatPokemonName(name: unknown): string {
  // Si no hay nombre, retornar un valor por defecto
  if (!name) return 'Pokémon';
  
  // Si es un objeto, intentar extraer la propiedad 'name'
  let nameStr: string;
  if (typeof name === 'object' && name !== null) {
    // Intentar obtener la propiedad 'name' del objeto
    nameStr = (name as any).name || (name as any).ability?.name || String(name);
  } else {
    nameStr = String(name);
  }
  
  // Si después de todo sigue vacío, retornar default
  if (!nameStr) return 'Pokémon';
  
  // Formatear: primera letra mayúscula, resto minúsculas
  return nameStr.charAt(0).toUpperCase() + nameStr.slice(1).toLowerCase();
}

/**
 * Obtiene la imagen oficial del Pokémon
 */
export function getPokemonImage(pokemon: { 
  sprites?: { 
    other?: { 
      "official-artwork"?: { 
        front_default: string | null 
      } 
    }; 
    front_default?: string | null 
  } 
}): string {
  return pokemon.sprites?.other?.["official-artwork"]?.front_default || 
         pokemon.sprites?.front_default || 
         "";
}

/**
 * Obtiene la etiqueta legible para una estadística
 */
export function getStatLabel(statName: string): string {
  const labels: Record<string, string> = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Speed",
  };
  return labels[statName] || statName;
}

/**
 * Calcula el total de puntos de estadística de un Pokémon
 */
export function getTotalStats(pokemon: { stats?: Array<{ base_stat: number }> }): number {
  if (!pokemon.stats) return 0;
  return pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
}

/**
 * Formatea el ID del Pokémon con ceros a la izquierda (ej: 001, 025, 151)
 */
export function padPokemonId(id: number): string {
  return id.toString().padStart(3, '0');
}