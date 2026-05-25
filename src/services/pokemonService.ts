// src/services/pokemonService.ts
import type {
  AbilityDetail,
  AbilityResponse,
  EvolutionChainLink,
  EvolutionChainResponse,
  EvolutionStage,
  Pokemon,
  PokemonExtraDetails,
  PokemonListResponse,
  PokemonSpeciesResponse,
} from "../types/pokemon";

// ============================================
// CONFIGURACIÓN
// ============================================
const AZURE_FUNCTION_URL = "https://cn-pokedex-gneghta4dycxh8dt.eastus-01.azurewebsites.net/api/PokemonFilter";
const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
const OFFICIAL_ARTWORK_BASE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

export const POKEMON_TYPES = [
  "normal", "fire", "water", "grass", "electric", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dark", "dragon", "steel", "fairy",
];

export const GENERATION_RANGES = {
  all: { label: "All generations", min: 1, max: 1025 },
  gen1: { label: "Generation I", min: 1, max: 151 },
  gen2: { label: "Generation II", min: 152, max: 251 },
  gen3: { label: "Generation III", min: 252, max: 386 },
  gen4: { label: "Generation IV", min: 387, max: 493 },
  gen5: { label: "Generation V", min: 494, max: 649 },
  gen6: { label: "Generation VI", min: 650, max: 721 },
  gen7: { label: "Generation VII", min: 722, max: 809 },
  gen8: { label: "Generation VIII", min: 810, max: 905 },
  gen9: { label: "Generation IX", min: 906, max: 1025 },
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================
async function fetchJson<T>(url: string): Promise<T> {
  console.log("📡 Fetching:", url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching ${url}: ${response.statusText}`);
  }
  return (await response.json()) as T;
}

function cleanApiText(text: string): string {
  return text.replace(/\f/g, " ").replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

function extractIdFromResourceUrl(url: string): number {
  const parts = url.split("/").filter(Boolean);
  const id = Number(parts.at(-1));
  return Number.isNaN(id) ? 0 : id;
}

function getEvolutionLabel(detail: EvolutionStage): string | null {
  if (detail.minLevel) return `Lv. ${detail.minLevel}`;
  if (detail.trigger) return detail.trigger.replace(/-/g, " ");
  return null;
}

function flattenEvolutionChain(link: EvolutionChainLink, evolutionDetail?: EvolutionStage): EvolutionStage[] {
  const id = extractIdFromResourceUrl(link.species.url);
  const firstDetail = link.evolution_details[0];
  const currentStage: EvolutionStage = {
    id,
    name: link.species.name,
    image: `${OFFICIAL_ARTWORK_BASE_URL}/${id}.png`,
    minLevel: firstDetail?.min_level ?? evolutionDetail?.minLevel ?? null,
    trigger: firstDetail?.trigger?.name ?? evolutionDetail?.trigger ?? null,
  };
  return [currentStage, ...link.evolves_to.flatMap((child) => flattenEvolutionChain(child))];
}

function getEnglishDescription(species: PokemonSpeciesResponse): string {
  const preferredVersions = ["firered", "leafgreen", "ruby", "sapphire", "emerald", "x", "y"];
  const preferredEntry = preferredVersions
    .map((versionName) =>
      species.flavor_text_entries.find(
        (entry) => entry.language.name === "en" && entry.version.name === versionName
      )
    )
    .find(Boolean);
  const fallbackEntry = species.flavor_text_entries.find((entry) => entry.language.name === "en");
  return cleanApiText(preferredEntry?.flavor_text ?? fallbackEntry?.flavor_text ?? "No description available yet.");
}

function getEnglishCategory(species: PokemonSpeciesResponse): string {
  return species.genera.find((genus) => genus.language.name === "en")?.genus ?? "Pokémon";
}

function getAbilityDescription(ability: AbilityResponse): string {
  const effectEntry = ability.effect_entries.find((entry) => entry.language.name === "en");
  const flavorEntry = ability.flavor_text_entries.find((entry) => entry.language.name === "en");
  return cleanApiText(effectEntry?.short_effect ?? flavorEntry?.flavor_text ?? "No description available.");
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

export async function getPokemonList(limit = 151, offset = 0): Promise<PokemonListResponse> {
  const url = `${AZURE_FUNCTION_URL}?limit=${limit}&offset=${offset}`;
  console.log("🔧 Fetching Pokémon list from:", url);

  const data = await fetchJson<any>(url);

  if (data.results && Array.isArray(data.results)) {
    return {
      count: data.count,
      next: null,
      previous: null,
      results: data.results.map((p: any) => ({
        name: p.name,
        url: `${POKEAPI_BASE_URL}/pokemon/${p.id}`
      }))
    };
  }

  return { count: 0, next: null, previous: null, results: [] };
}

export async function getPokemonDetails(idOrName: number | string): Promise<Pokemon> {
  const url = `${AZURE_FUNCTION_URL}?name=${idOrName}`;
  console.log("🔧 1. Fetching Pokémon details from:", url);

  const data = await fetchJson<any>(url);
  console.log("📦 2. Datos CRUDOS de tu función:", data);

  // ============================================
  // MAPEO DE STATS - FORMATO CORRECTO
  // ============================================
  // Tu función devuelve: stats: [{ name: "hp", value: 35 }, ...]
  // Necesitamos: stats: [{ base_stat: 35, stat: { name: "hp" } }, ...]
  const stats = (data.stats || []).map((s: any) => ({
    base_stat: s.value,        // ← value → base_stat
    effort: 0,
    stat: {
      name: s.name,            // ← name dentro de stat
      url: `${POKEAPI_BASE_URL}/stat/${s.name}`
    }
  }));

  // ============================================
  // MAPEO DE ABILITIES - FORMATO CORRECTO
  // ============================================
  const abilities = (data.abilities || []).map((ability: any, index: number) => {
    let abilityName = "";
    if (typeof ability === 'string') {
      abilityName = ability;
    } else if (ability && typeof ability === 'object') {
      abilityName = ability.name || (ability as any).ability?.name || "";
    } else {
      abilityName = String(ability);
    }

    return {
      ability: {
        name: abilityName,
        url: `${POKEAPI_BASE_URL}/ability/${abilityName}`
      },
      is_hidden: false,
      slot: index + 1
    };
  });

  console.log("📊 3. Stats formateadas:", stats);
  console.log("💪 4. Abilities formateadas:", abilities);

  return {
    id: data.id,
    name: data.name,
    base_experience: data.base_experience || 0,
    height: data.height || 0,
    weight: data.weight || 0,
    types: (data.types || []).map((typeName: string, index: number) => ({
      slot: index + 1,
      type: { name: typeName, url: `${POKEAPI_BASE_URL}/type/${typeName}` }
    })),
    abilities: abilities,
    stats: stats,  // ← Stats correctamente formateadas
    sprites: {
      front_default: data.image,
      other: {
        "official-artwork": {
          front_default: data.image
        }
      }
    }
  };
}

export async function getPokemonBatch(limit = 151): Promise<Pokemon[]> {
  const url = `${AZURE_FUNCTION_URL}?limit=${limit}`;
  console.log("🔧 Fetching Pokémon batch from:", url);

  const data = await fetchJson<any>(url);

  if (data.results && Array.isArray(data.results)) {
    return data.results.map((p: any) => ({
      id: p.id,
      name: p.name,
      base_experience: 0,
      height: p.height || 0,
      weight: p.weight || 0,
      types: (p.types || []).map((typeName: string, index: number) => ({
        slot: index + 1,
        type: { name: typeName, url: `${POKEAPI_BASE_URL}/type/${typeName}` }
      })),
      abilities: [],
      stats: [],
      sprites: {
        front_default: p.sprite,
        other: {
          "official-artwork": {
            front_default: p.sprite
          }
        }
      }
    }));
  }

  return [];
}

// ============================================
// FUNCIONES PARA DETALLES EXTRA
// ============================================

export async function getPokemonSpecies(idOrName: number | string): Promise<PokemonSpeciesResponse> {
  return fetchJson<PokemonSpeciesResponse>(`${POKEAPI_BASE_URL}/pokemon-species/${idOrName}`);
}

export async function getAbilityDetails(name: string): Promise<AbilityResponse> {
  return fetchJson<AbilityResponse>(`${POKEAPI_BASE_URL}/ability/${name}`);
}

export async function getEvolutionChainByUrl(url: string): Promise<EvolutionChainResponse> {
  return fetchJson<EvolutionChainResponse>(url);
}

export async function getPokemonExtraDetails(pokemon: Pokemon): Promise<PokemonExtraDetails> {
  const species = await getPokemonSpecies(pokemon.id);

  const abilityResults = await Promise.allSettled(
    (pokemon.abilities || []).map(async ({ ability, is_hidden }): Promise<AbilityDetail> => {
      try {
        const abilityDetails = await getAbilityDetails(ability.name);
        return {
          name: ability.name,
          description: getAbilityDescription(abilityDetails),
          isHidden: is_hidden,
        };
      } catch (error) {
        console.error(`Error fetching ability ${ability.name}:`, error);
        return {
          name: ability.name,
          description: "No description available.",
          isHidden: is_hidden,
        };
      }
    })
  );

  const abilities = abilityResults.map((result) => {
    if (result.status === "fulfilled") return result.value;
    return {
      name: "unknown",
      description: "No description available.",
      isHidden: false,
    };
  });

  try {
    const evolutionChain = await getEvolutionChainByUrl(species.evolution_chain.url);
    const evolutions = flattenEvolutionChain(evolutionChain.chain).map((stage) => ({
      ...stage,
      trigger: getEvolutionLabel(stage),
    }));

    return {
      description: getEnglishDescription(species),
      category: getEnglishCategory(species),
      abilities,
      evolutions,
    };
  } catch (error) {
    console.error("Error fetching evolution chain:", error);
    return {
      description: getEnglishDescription(species),
      category: getEnglishCategory(species),
      abilities,
      evolutions: [],
    };
  }
}