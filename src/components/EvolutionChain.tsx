import { Fragment } from "react";
import type { EvolutionStage } from "../types/pokemon";
import { formatPokemonName } from "../utils/pokemonFormat";

interface EvolutionChainProps {
  evolutions: EvolutionStage[];
  loading: boolean;
}

function EvolutionChain({ evolutions, loading }: EvolutionChainProps) {
  if (loading) {
    return (
      <section className="evolution-panel details-subcard">
        <div className="details-subcard__heading">
          <h3>Evolutions</h3>
          <span>Loading chain</span>
        </div>
        <p className="status status--small">Loading evolution chain…</p>
      </section>
    );
  }

  if (evolutions.length <= 1) {
    return (
      <section className="evolution-panel details-subcard">
        <div className="details-subcard__heading">
          <h3>Evolutions</h3>
          <span>No known chain</span>
        </div>
        <p className="status status--small">This Pokémon does not have a known evolution chain.</p>
      </section>
    );
  }

  return (
    <section className="evolution-panel details-subcard">
      <div className="details-subcard__heading">
        <h3>Evolutions</h3>
        <span>{evolutions.length} stages</span>
      </div>

      <div className="evolution-chain" aria-label="Evolution chain">
        {evolutions.map((evolution, index) => (
          <Fragment key={`${evolution.id}-${index}`}>
            {index > 0 && (
              <div className="evolution-chain__connector" aria-hidden="true">
                <span>{evolution.trigger}</span>
                <strong>→</strong>
              </div>
            )}

            <div className="evolution-stage">
              <img src={evolution.image} alt={evolution.name} loading="lazy" />
              <strong>{formatPokemonName(evolution.name)}</strong>
              <span>#{evolution.id.toString().padStart(3, "0")}</span>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}

export default EvolutionChain;
