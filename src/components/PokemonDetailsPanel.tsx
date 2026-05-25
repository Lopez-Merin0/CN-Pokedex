// src/components/PokemonDetailsPanel.tsx
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
  const { extraDetails, loadingExtraDetails, extraDetailsError, updatedPokemon } = usePokemonExtraDetails(pokemon);
  
  // Usar el Pokémon actualizado (con stats) o el original como fallback
  const displayPokemon = updatedPokemon || pokemon;

  if (!displayPokemon) {
    return null;
  }

  const primaryType = displayPokemon.types[0]?.type.name ?? "normal";
  const typeNames = displayPokemon.types.map(({ type }) => formatPokemonName(type.name)).join(" / ");
  const description =
    extraDetails?.description ??
    `${formatPokemonName(displayPokemon.name)} is a ${typeNames} type Pokémon with a base stat total of ${getTotalStats(displayPokemon)}.`;
  const category = loadingExtraDetails ? "Loading…" : extraDetails?.category ?? "Pokémon";
  const abilities = extraDetails?.abilities ?? displayPokemon.abilities.map(({ ability, is_hidden }) => ({
    name: ability.name,
    description: loadingExtraDetails ? "Loading ability description…" : "No description available.",
    isHidden: is_hidden,
  }));
  const regularAbilities = abilities.filter((ability) => !ability.isHidden);
  const hiddenAbilities = abilities.filter((ability) => ability.isHidden);

  // Calcular altura y peso con 2 decimales
  const heightInMeters = (displayPokemon.height / 10).toFixed(2);
  const weightInKg = (displayPokemon.weight / 10).toFixed(2);

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
        onClick={() => onToggleFavorite(displayPokemon.id)}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite ? "♥" : "♡"}
      </button>

      <div className="details-panel__main">
        <div className="details-panel__identity">
          <span className="pokemon-number">{padPokemonId(displayPokemon.id)}</span>
          <h2>{formatPokemonName(displayPokemon.name)}</h2>
          <div className="type-row type-row--left">
            {displayPokemon.types.map(({ type }) => (
              <span key={type.name} className={`type-badge type-badge--${type.name}`}>
                {type.name}
              </span>
            ))}
          </div>
        </div>

        <div className="details-panel__hero">
          <span className="details-panel__hero-ring" aria-hidden="true" />
          <img className="details-panel__image" src={getPokemonImage(displayPokemon)} alt={displayPokemon.name} />
        </div>
      </div>

      <p className="details-panel__description">{description}</p>

      {extraDetailsError && <p className="details-panel__warning">Extra details could not be loaded. Showing available data.</p>}

      {/* Métricas con altura y peso formateados a 2 decimales */}
      <div className="details-metrics">
        <span>
          <small>Height</small>
          <strong>{heightInMeters} m</strong>
        </span>
        <span>
          <small>Weight</small>
          <strong>{weightInKg} kg</strong>
        </span>
        <span>
          <small>Category</small>
          <strong>{category}</strong>
        </span>
      </div>

      <div className="details-actions">
        <button className="primary-button" type="button" onClick={() => onAddToTeam(displayPokemon)}>
          Add to team
        </button>
        <button className="secondary-button" type="button" onClick={() => onAddToCompare(displayPokemon)}>
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
            {displayPokemon.stats && displayPokemon.stats.length > 0 ? (
              <>
                {displayPokemon.stats.map((stat) => (
                  <StatBar 
                    key={stat.stat.name} 
                    name={stat.stat.name} 
                    label={getStatLabel(stat.stat.name)} 
                    value={stat.base_stat} 
                  />
                ))}
                <div className="stat-row stat-row--total">
                  <span>Total</span>
                  <strong>{getTotalStats(displayPokemon)}</strong>
                  <div className="stat-row__bar" aria-hidden="true">
                    <span className="stat-row__fill stat-row__fill--total" style={{ width: "100%" }} />
                  </div>
                </div>
              </>
            ) : (
              <p className="status status--small">Loading stats...</p>
            )}
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