import type { MouseEvent } from "react";
import type { Pokemon } from "../types/pokemon";
import { formatPokemonName, getPokemonImage, padPokemonId } from "../utils/pokemonFormat";

interface PokemonCardProps {
  pokemon: Pokemon;
  isFavorite: boolean;
  isSelected: boolean;
  onSelect: (pokemon: Pokemon) => void;
  onToggleFavorite: (pokemonId: number) => void;
}

function PokemonCard({ pokemon, isFavorite, isSelected, onSelect, onToggleFavorite }: PokemonCardProps) {
  const primaryType = pokemon.types[0]?.type.name ?? "normal";

  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleFavorite(pokemon.id);
  };

  return (
    <article
      className={`pokemon-card pokemon-card--${primaryType} ${isSelected ? "pokemon-card--selected" : ""}`}
      onClick={() => onSelect(pokemon)}
      aria-label={`Select ${pokemon.name}`}
    >
      <div className="pokemon-card__topline">
        <span>{padPokemonId(pokemon.id).replace("#", "")}</span>
        <button
          className={`icon-button favorite-button ${isFavorite ? "favorite-button--active" : ""}`}
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="pokemon-card__image-ring">
        <img className="pokemon-card__image" src={getPokemonImage(pokemon)} alt={pokemon.name} loading="lazy" />
      </div>

      <h3>{formatPokemonName(pokemon.name)}</h3>
      <div className="type-row">
        {pokemon.types.map(({ type }) => (
          <span key={type.name} className={`type-badge type-badge--${type.name}`}>
            {type.name}
          </span>
        ))}
      </div>
    </article>
  );
}

export default PokemonCard;
