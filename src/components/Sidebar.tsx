interface SidebarProps {
  loadedCount: number;
  totalCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onShowFavorites: () => void;
}

function Sidebar({ loadedCount, totalCount, isOpen, onToggle, onClose, onShowFavorites }: SidebarProps) {
  const progress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 0;

  return (
    <>
      <button
        className={`sidebar-toggle ${isOpen ? "sidebar-toggle--open" : ""}`}
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? "Hide sidebar" : "Show sidebar"}
        aria-controls="app-sidebar"
        aria-expanded={isOpen}
      >
        <span className="pokeball-icon" aria-hidden="true" />
      </button>

      {isOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      <aside
        id="app-sidebar"
        className={`sidebar ${isOpen ? "sidebar--open" : ""}`}
        aria-hidden={!isOpen}
      >
        <button className="brand brand--button" type="button" onClick={onToggle}>
          <span className="brand__mark"><span className="pokeball-icon" aria-hidden="true" /></span>
          <div>
            <strong>Pokédex</strong>
            <span>Gotta catch ’em all!</span>
          </div>
        </button>

        <nav className="sidebar__nav" aria-label="Main navigation">
          <a className="sidebar__link sidebar__link--active" href="#pokedex" onClick={onClose}>
            ⌂ Home
          </a>
          <a
            className="sidebar__link"
            href="#pokedex"
            onClick={(event) => {
              event.preventDefault();
              onShowFavorites();
              onClose();
            }}
          >
            ♡ Favorites
          </a>
          <a className="sidebar__link" href="#team" onClick={onClose}>
            ⚔ Team Builder
          </a>
          <a className="sidebar__link" href="#details" onClick={onClose}>
            ◎ Details
          </a>
        </nav>

        <div className="progress-card">
          <span className="progress-card__mascot">⚡</span>
          <h2>Welcome, Trainer!</h2>
          <p>Search, filter, favorite Pokémon, and build a team of six.</p>
          <div className="progress-card__row">
            <span>Loaded</span>
            <strong>
              {loadedCount} / {totalCount}
            </strong>
          </div>
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
