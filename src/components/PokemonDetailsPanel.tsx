import usePokemonExtraDetails from "../hooks/usePokemonExtraDetails";
import type { AbilityDetail, Pokemon } from "../types/pokemon";
import {
  formatPokemonName,
  getPokemonImage,
  getStatLabel,
  getTotalStats,
  padPokemonId,
} from "../utils/pokemonFormat";
import EvolutionChain from "./EvolutionChain";
import StatBar from "./StatBar";

interface PokemonDetailsPanelProps {
  pokemon: Pokemon | null;
  isFavorite: boolean;
  onToggleFavorite: (pokemonId: number) => void;
  onAddToTeam: (pokemon: Pokemon) => void;
  onAddToCompare: (pokemon: Pokemon) => void;
  onClose: () => void;
}

function AbilityList({ abilities }: { abilities: AbilityDetail[] }) {
  if (abilities.length === 0) return null;

  return (
    <ul>
      {abilities.map((ability) => (
        <li key={`${ability.name}-${ability.isHidden ? "hidden" : "normal"}`}>
          <span className="ability-icon" aria-hidden="true">✺</span>
          <div className="ability-copy">
            <div className="ability-title-row">
              <strong>{formatPokemonName(ability.name)}</strong>
            </div>
            <p>{ability.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function PokemonDetailsPanel({
  pokemon,
  isFavorite,
  onToggleFavorite,
  onAddToTeam,
  onAddToCompare,
  onClose,
}: PokemonDetailsPanelProps) {
  const { extraDetails, loadingExtraDetails, extraDetailsError } = usePokemonExtraDetails(pokemon);

  if (!pokemon) {
    return null;
  }

  const primaryType = pokemon.types[0]?.type.name ?? "normal";
  const typeNames = pokemon.types.map(({ type }) => formatPokemonName(type.name)).join(" / ");
  const description =
    extraDetails?.description ??
    `${formatPokemonName(pokemon.name)} is a ${typeNames} type Pokémon with a base stat total of ${getTotalStats(pokemon)}.`;
  const category = loadingExtraDetails ? "Loading…" : extraDetails?.category ?? "Pokémon";
  const abilities = extraDetails?.abilities ?? pokemon.abilities.map(({ ability, is_hidden }) => ({
    name: ability.name,
    description: loadingExtraDetails ? "Loading ability description…" : "No description available.",
    isHidden: is_hidden,
  }));
  const regularAbilities = abilities.filter((ability) => !ability.isHidden);
  const hiddenAbilities = abilities.filter((ability) => ability.isHidden);

  return (
    <section className={`details-panel card-surface details-panel--visible details-panel--${primaryType}`} id="details">
      <button
        className="icon-button details-panel__close details-panel__close--corner"
        type="button"
        onClick={onClose}
        aria-label="Close Pokémon details"
      >
        ×
      </button>

      <button
        className={`icon-button favorite-button details-panel__favorite ${isFavorite ? "favorite-button--active" : ""}`}
        type="button"
        onClick={() => onToggleFavorite(pokemon.id)}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite ? "♥" : "♡"}
      </button>

      <div className="details-panel__main">
        <div className="details-panel__identity">
          <span className="pokemon-number">{padPokemonId(pokemon.id)}</span>
          <h2>{formatPokemonName(pokemon.name)}</h2>
          <div className="type-row type-row--left">
            {pokemon.types.map(({ type }) => (
              <span key={type.name} className={`type-badge type-badge--${type.name}`}>
                {type.name}
              </span>
            ))}
          </div>
        </div>

        <div className="details-panel__hero">
          <span className="details-panel__hero-ring" aria-hidden="true" />
          <img className="details-panel__image" src={getPokemonImage(pokemon)} alt={pokemon.name} />
        </div>
      </div>

      <p className="details-panel__description">{description}</p>

      {extraDetailsError && <p className="details-panel__warning">Extra details could not be loaded. Showing available data.</p>}

      <div className="details-metrics">
        <span>
          <small>Height</small>
          <strong>{pokemon.height / 10} m</strong>
        </span>
        <span>
          <small>Weight</small>
          <strong>{pokemon.weight / 10} kg</strong>
        </span>
        <span>
          <small>Category</small>
          <strong>{category}</strong>
        </span>
      </div>

      <div className="details-actions">
        <button className="primary-button" type="button" onClick={() => onAddToTeam(pokemon)}>
          Add to team
        </button>
        <button className="secondary-button" type="button" onClick={() => onAddToCompare(pokemon)}>
          Compare
        </button>
      </div>

      <div className="details-panel__info-grid">
        <section className="details-subcard">
          <div className="details-subcard__heading">
            <h3>Stats</h3>
            <span>Base Stats</span>
          </div>
          <div className="stats-list">
            {pokemon.stats.map((stat) => (
              <StatBar key={stat.stat.name} name={stat.stat.name} label={getStatLabel(stat.stat.name)} value={stat.base_stat} />
            ))}
            <div className="stat-row stat-row--total">
              <span>Total</span>
              <strong>{getTotalStats(pokemon)}</strong>
              <div className="stat-row__bar" aria-hidden="true">
                <span className="stat-row__fill stat-row__fill--total" style={{ width: "100%" }} />
              </div>
            </div>
          </div>
        </section>

        <section className="details-subcard abilities-box">
          <div className="details-subcard__heading">
            <h3>Abilities</h3>
            <span>{loadingExtraDetails ? "Loading traits" : "Battle traits"}</span>
          </div>
          <AbilityList abilities={regularAbilities} />
          {hiddenAbilities.length > 0 && (
            <>
              <p className="abilities-box__group-label">Hidden Ability</p>
              <AbilityList abilities={hiddenAbilities} />
            </>
          )}
        </section>
      </div>

      <EvolutionChain evolutions={extraDetails?.evolutions ?? []} loading={loadingExtraDetails} />
    </section>
  );
}

export default PokemonDetailsPanel;