export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface NamedApiResource {
  name: string;
  url: string;
}

export interface PokemonTypeSlot {
  slot: number;
  type: NamedApiResource;
}

export interface PokemonAbilitySlot {
  is_hidden: boolean;
  slot: number;
  ability: NamedApiResource;
}

export interface PokemonSprites {
  front_default: string | null;
  back_default?: string | null;
  front_shiny?: string | null;
  back_shiny?: string | null;
  other?: {
    "official-artwork"?: {
      front_default: string | null;
    };
    dream_world?: {
      front_default: string | null;
    };
  };
}

export interface PokemonStatSlot {
  base_stat: number;
  effort: number;
  stat: NamedApiResource;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonTypeSlot[];
  abilities: PokemonAbilitySlot[];
  sprites: PokemonSprites;
  stats: PokemonStatSlot[];
}

export interface PokemonSpeciesFlavorText {
  flavor_text: string;
  language: NamedApiResource;
  version: NamedApiResource;
}

export interface PokemonSpeciesGenus {
  genus: string;
  language: NamedApiResource;
}

export interface PokemonSpeciesResponse {
  id: number;
  name: string;
  flavor_text_entries: PokemonSpeciesFlavorText[];
  genera: PokemonSpeciesGenus[];
  evolution_chain: {
    url: string;
  };
}

export interface AbilityEffectEntry {
  effect: string;
  short_effect: string;
  language: NamedApiResource;
}

export interface AbilityFlavorTextEntry {
  flavor_text: string;
  language: NamedApiResource;
  version_group: NamedApiResource;
}

export interface AbilityResponse {
  id: number;
  name: string;
  effect_entries: AbilityEffectEntry[];
  flavor_text_entries: AbilityFlavorTextEntry[];
}

export interface EvolutionDetail {
  min_level: number | null;
  trigger: NamedApiResource | null;
  item: NamedApiResource | null;
}

export interface EvolutionChainLink {
  species: NamedApiResource;
  evolution_details: EvolutionDetail[];
  evolves_to: EvolutionChainLink[];
}

export interface EvolutionChainResponse {
  id: number;
  chain: EvolutionChainLink;
}

export interface AbilityDetail {
  name: string;
  description: string;
  isHidden: boolean;
}

export interface EvolutionStage {
  id: number;
  name: string;
  image: string;
  minLevel: number | null;
  trigger: string | null;
}

export interface PokemonExtraDetails {
  description: string;
  category: string;
  abilities: AbilityDetail[];
  evolutions: EvolutionStage[];
}

export type SortOption = "number-asc" | "number-desc" | "name-asc" | "name-desc" | "height-desc" | "weight-desc";
