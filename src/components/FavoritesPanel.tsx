import type { Pokemon } from "../types/pokemon";
import { formatPokemonName, getPokemonImage, padPokemonId } from "../utils/pokemonFormat";
import SectionHeading from "./SectionHeading";

interface FavoritesPanelProps {
  favoritePokemons: Pokemon[];
  favoritesCount: number;
  onSelectPokemon: (pokemon: Pokemon) => void;
  onShowFavorites: () => void;
}

function FavoritesPanel({ favoritePokemons, favoritesCount, onSelectPokemon, onShowFavorites }: FavoritesPanelProps) {
  return (
    <section className="favorites-panel card-surface" id="favorites">
      <SectionHeading
        eyebrow="Favorites"
        title={`${favoritesCount} saved`}
        action={
          <button className="section-heading__link-action" type="button" onClick={onShowFavorites}>
            View all
          </button>
        }
      />

      {favoritePokemons.length > 0 ? (
        <div className="favorites-strip">
          {favoritePokemons.map((pokemon) => (
            <button key={pokemon.id} type="button" onClick={() => onSelectPokemon(pokemon)}>
              <img src={getPokemonImage(pokemon)} alt={pokemon.name} />
              <span>{formatPokemonName(pokemon.name)}</span>
              <small>{padPokemonId(pokemon.id)}</small>
            </button>
          ))}
        </div>
      ) : (
        <p className="status status--small">Tap the heart on any Pokémon to save it here.</p>
      )}
    </section>
  );
}

export default FavoritesPanel;
