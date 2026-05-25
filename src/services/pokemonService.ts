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

const API_BASE_URL = "https://pokeapi.co/api/v2";
const OFFICIAL_ARTWORK_BASE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
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

async function fetchJson<T>(url: string): Promise<T> {
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
  if (detail.minLevel) {
    return `Lv. ${detail.minLevel}`;
  }

  if (detail.trigger) {
    return detail.trigger.replace(/-/g, " ");
  }

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
        (entry) => entry.language.name === "en" && entry.version.name === versionName,
      ),
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

export async function getPokemonList(limit = 251): Promise<PokemonListResponse> {
  return fetchJson<PokemonListResponse>(`${API_BASE_URL}/pokemon?limit=${limit}`);
}

export async function getPokemonDetails(idOrName: number | string): Promise<Pokemon> {
  return fetchJson<Pokemon>(`${API_BASE_URL}/pokemon/${idOrName}`);
}

export async function getPokemonSpecies(idOrName: number | string): Promise<PokemonSpeciesResponse> {
  return fetchJson<PokemonSpeciesResponse>(`${API_BASE_URL}/pokemon-species/${idOrName}`);
}

export async function getAbilityDetails(name: string): Promise<AbilityResponse> {
  return fetchJson<AbilityResponse>(`${API_BASE_URL}/ability/${name}`);
}

export async function getEvolutionChainByUrl(url: string): Promise<EvolutionChainResponse> {
  return fetchJson<EvolutionChainResponse>(url);
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

export async function getPokemonBatch(limit = 1025): Promise<Pokemon[]> {
  const list = await getPokemonList(limit);
  const details = await mapWithConcurrency(list.results, 24, (pokemon) => getPokemonDetails(pokemon.name));
  return details.sort((a, b) => a.id - b.id);
}

export async function getPokemonExtraDetails(pokemon: Pokemon): Promise<PokemonExtraDetails> {
  const species = await getPokemonSpecies(pokemon.id);

  const abilityResults = await Promise.allSettled(
    pokemon.abilities.map(async ({ ability, is_hidden }): Promise<AbilityDetail> => {
      const abilityDetails = await getAbilityDetails(ability.name);

      return {
        name: ability.name,
        description: getAbilityDescription(abilityDetails),
        isHidden: is_hidden,
      };
    }),
  );

  const abilities = abilityResults.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    const fallbackAbility = pokemon.abilities[index];

    return {
      name: fallbackAbility.ability.name,
      description: "No description available.",
      isHidden: fallbackAbility.is_hidden,
    };
  });

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
}
