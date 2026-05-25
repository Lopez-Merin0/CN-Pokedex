import type { Pokemon } from "../types/pokemon";
import { formatPokemonName, getPokemonImage } from "../utils/pokemonFormat";
import SectionHeading from "./SectionHeading";

interface TeamBuilderProps {
  teamPokemons: Array<Pokemon | null>;
  selectedPokemon: Pokemon | null;
  onAddToTeam: (pokemon: Pokemon) => void;
  onRemoveFromTeam: (index: number) => void;
  onClearTeam: () => void;
}

function TeamBuilder({ teamPokemons, selectedPokemon, onAddToTeam, onRemoveFromTeam, onClearTeam }: TeamBuilderProps) {
  const selectedCount = teamPokemons.filter(Boolean).length;

  return (
    <section className="team-panel card-surface" id="team">
      <SectionHeading
        eyebrow="Create your team"
        title="Create Your Team"
        action={
          <div className="team-panel__actions">
            <span>{selectedCount} / 6</span>
            <button className="secondary-button secondary-button--compact" type="button" onClick={onClearTeam}>
              Clear
            </button>
          </div>
        }
      />

      <div className="team-slots">
        {teamPokemons.map((pokemon, index) => (
          <button
            className={`team-slot ${pokemon ? "team-slot--filled" : ""}`}
            type="button"
            key={`${pokemon?.id ?? "empty"}-${index}`}
            onClick={() => (pokemon ? onRemoveFromTeam(index) : selectedPokemon && onAddToTeam(selectedPokemon))}
            title={pokemon ? "Click to remove" : "Click to add selected Pokémon"}
          >
            <span className="team-slot__index">{index + 1}</span>
            {pokemon ? (
              <>
                <img src={getPokemonImage(pokemon)} alt={pokemon.name} />
                <span>{formatPokemonName(pokemon.name)}</span>
              </>
            ) : (
              <>
                <strong>+</strong>
                <span>Click to add Pokémon</span>
              </>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

export default TeamBuilder;
