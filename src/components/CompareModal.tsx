import { useEffect, useMemo, useRef, useState } from "react";
import type { Pokemon } from "../types/pokemon";
import { formatPokemonName, getPokemonImage, getStatLabel, getTotalStats, padPokemonId } from "../utils/pokemonFormat";

interface CompareModalProps {
  initialPokemon: Pokemon | null;
  pokemons: Pokemon[];
  onClose: () => void;
}

type CompareModalMode = "pick" | "search" | "ready" | "result";

const STAT_NAMES = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
const MAX_STAT_VALUE = 255;

function PokemonCompareCard({ pokemon, compact = false }: { pokemon: Pokemon; compact?: boolean }) {
  return (
    <article className={`compare-modal-card ${compact ? "compare-modal-card--compact" : ""}`}>
      <span className="compare-modal-card__number">{padPokemonId(pokemon.id)}</span>
      <div className="compare-modal-card__image-wrap">
        <img src={getPokemonImage(pokemon)} alt={pokemon.name} />
      </div>
      <strong>{formatPokemonName(pokemon.name)}</strong>
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

function EmptyCompareSlot({ onClick }: { onClick: () => void }) {
  return (
    <button className="compare-modal-empty" type="button" onClick={onClick}>
      <strong>+</strong>
      <span>Search Pokémon</span>
    </button>
  );
}

function CompareStatsView({ firstPokemon, secondPokemon }: { firstPokemon: Pokemon; secondPokemon: Pokemon }) {
  return (
    <div className="compare-results-view">
      <div className="compare-results-view__header">
        <PokemonCompareCard pokemon={firstPokemon} compact />
        <span className="compare-results-view__versus" aria-hidden="true">⇄</span>
        <PokemonCompareCard pokemon={secondPokemon} compact />
      </div>

      <div className="compare-results-table" aria-label="Base stats comparison">
        {STAT_NAMES.map((statName) => {
          const firstValue = firstPokemon.stats.find((stat) => stat.stat.name === statName)?.base_stat ?? 0;
          const secondValue = secondPokemon.stats.find((stat) => stat.stat.name === statName)?.base_stat ?? 0;
          const firstWins = firstValue > secondValue;
          const secondWins = secondValue > firstValue;

          return (
            <div className="compare-results-row" key={statName}>
              <div className="compare-results-row__side compare-results-row__side--left">
                <strong className={firstWins ? "compare-results-row__winner" : ""}>{firstValue}</strong>
                <span className="compare-results-row__bar" aria-hidden="true">
                  <span style={{ width: `${Math.min((firstValue / MAX_STAT_VALUE) * 100, 100)}%` }} />
                </span>
              </div>
              <span className="compare-results-row__label">{getStatLabel(statName)}</span>
              <div className="compare-results-row__side compare-results-row__side--right">
                <span className="compare-results-row__bar" aria-hidden="true">
                  <span style={{ width: `${Math.min((secondValue / MAX_STAT_VALUE) * 100, 100)}%` }} />
                </span>
                <strong className={secondWins ? "compare-results-row__winner" : ""}>{secondValue}</strong>
              </div>
            </div>
          );
        })}

        <div className="compare-results-row compare-results-row--total">
          <div className="compare-results-row__side compare-results-row__side--left">
            <strong className={getTotalStats(firstPokemon) > getTotalStats(secondPokemon) ? "compare-results-row__winner" : ""}>
              {getTotalStats(firstPokemon)}
            </strong>
          </div>
          <span className="compare-results-row__label">Total</span>
          <div className="compare-results-row__side compare-results-row__side--right">
            <strong className={getTotalStats(secondPokemon) > getTotalStats(firstPokemon) ? "compare-results-row__winner" : ""}>
              {getTotalStats(secondPokemon)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CompareModalContentProps {
  initialPokemon: Pokemon;
  pokemons: Pokemon[];
  onClose: () => void;
}

function CompareModalContent({ initialPokemon, pokemons, onClose }: CompareModalContentProps) {
  const [mode, setMode] = useState<CompareModalMode>("pick");
  const [query, setQuery] = useState("");
  const [secondPokemon, setSecondPokemon] = useState<Pokemon | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode !== "search") return;

    searchInputRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const matchingPokemons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return pokemons
      .filter((pokemon) => pokemon.id !== initialPokemon.id)
      .filter((pokemon) => {
        if (!normalizedQuery) return pokemon.id <= 12;

        return pokemon.name.toLowerCase().includes(normalizedQuery) || pokemon.id.toString().includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [initialPokemon.id, pokemons, query]);

  const handleSecondPokemonSelect = (pokemon: Pokemon) => {
    setSecondPokemon(pokemon);
    setMode("ready");
  };

  const modalTitle = mode === "result" ? "Comparison results" : "Compare Pokémon";

  return (
    <div className="compare-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`compare-modal card-surface compare-modal--${mode}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="compare-modal__topline">
          <div>
            <p className="eyebrow">Compare stats</p>
            <h2 id="compare-modal-title">{modalTitle}</h2>
          </div>
          <button className="icon-button compare-modal__close" type="button" onClick={onClose} aria-label="Close comparison modal">
            ×
          </button>
        </div>

        {mode === "result" && secondPokemon ? (
          <>
            <CompareStatsView firstPokemon={initialPokemon} secondPokemon={secondPokemon} />
            <div className="compare-modal__footer compare-modal__footer--center">
              <button className="secondary-button" type="button" onClick={() => setMode("ready")}>
                Back
              </button>
              <button className="primary-button" type="button" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="compare-modal__selection-grid">
              <PokemonCompareCard pokemon={initialPokemon} />

              <span className="compare-modal__swap" aria-hidden="true">⇄</span>

              {mode === "search" ? (
                <div className="compare-modal-search-panel">
                  <div className="search-field compare-modal-search-panel__field">
                    <span>⌕</span>
                    <input
                      ref={searchInputRef}
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search Pokémon by name or number..."
                      aria-label="Search Pokémon to compare"
                    />
                  </div>

                  <div className="compare-modal-search-list">
                    {matchingPokemons.map((pokemon) => (
                      <button key={pokemon.id} type="button" onClick={() => handleSecondPokemonSelect(pokemon)}>
                        <img src={getPokemonImage(pokemon)} alt={pokemon.name} />
                        <span>
                          <strong>{formatPokemonName(pokemon.name)}</strong>
                          <small>{padPokemonId(pokemon.id)}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : secondPokemon ? (
                <PokemonCompareCard pokemon={secondPokemon} />
              ) : (
                <EmptyCompareSlot onClick={() => setMode("search")} />
              )}
            </div>

            {mode === "pick" && (
              <p className="compare-modal__hint">Select another Pokémon to compare it against {formatPokemonName(initialPokemon.name)}.</p>
            )}

            {mode === "ready" && secondPokemon && (
              <div className="compare-modal__footer">
                <button className="secondary-button" type="button" onClick={() => setMode("search")}>
                  Change Pokémon
                </button>
                <button className="primary-button" type="button" onClick={() => setMode("result")}>
                  Compare
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function CompareModal({ initialPokemon, pokemons, onClose }: CompareModalProps) {
  if (!initialPokemon) return null;

  return (
    <CompareModalContent
      key={initialPokemon.id}
      initialPokemon={initialPokemon}
      pokemons={pokemons}
      onClose={onClose}
    />
  );
}

export default CompareModal;
