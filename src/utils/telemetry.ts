// src/utils/telemetry.ts
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

// Leer la cadena de conexión desde las variables de entorno
const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;

if (!connectionString) {
  console.warn('⚠️ Application Insights: No connection string found. Add VITE_APPINSIGHTS_CONNECTION_STRING to .env');
}

const appInsights = new ApplicationInsights({
  config: {
    connectionString: connectionString || '',
    enableAutoRouteTracking: true, // Rastrea cambios de ruta automáticamente
    enableCorsCorrelation: false,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
  }
});

// Solo cargar si hay connection string
if (connectionString) {
  appInsights.loadAppInsights();
  console.log('📊 Application Insights initialized');
}

// ============================================
// EVENTOS PERSONALIZADOS
// ============================================

// Rastrear cuando se ve un Pokémon
export const trackPokemonView = (pokemonId: number, pokemonName: string) => {
  if (!connectionString) return;
  appInsights.trackEvent({
    name: 'PokemonViewed',
    properties: {
      pokemonId: String(pokemonId),
      pokemonName: pokemonName,
      timestamp: new Date().toISOString()
    }
  });
};

// Rastrear búsquedas
export const trackSearch = (searchTerm: string, resultCount: number) => {
  if (!connectionString) return;
  appInsights.trackEvent({
    name: 'SearchPerformed',
    properties: {
      searchTerm: searchTerm || 'empty',
      resultCount: String(resultCount)
    }
  });
};

// Rastrear uso de filtros
export const trackFilter = (filterType: string, filterValue: string) => {
  if (!connectionString) return;
  appInsights.trackEvent({
    name: 'FilterUsed',
    properties: {
      filterType: filterType,
      filterValue: filterValue
    }
  });
};

// Rastrear cuando se agrega al equipo
export const trackAddToTeam = (pokemonName: string, teamSize: number) => {
  if (!connectionString) return;
  appInsights.trackEvent({
    name: 'AddedToTeam',
    properties: {
      pokemonName: pokemonName,
      teamSize: String(teamSize)
    }
  });
};

// Rastrear comparaciones
export const trackCompare = (pokemon1: string, pokemon2: string) => {
  if (!connectionString) return;
  appInsights.trackEvent({
    name: 'PokemonCompared',
    properties: {
      pokemon1: pokemon1,
      pokemon2: pokemon2
    }
  });
};

// Rastrear favoritos
export const trackFavorite = (pokemonName: string, isFavorite: boolean) => {
  if (!connectionString) return;
  appInsights.trackEvent({
    name: isFavorite ? 'FavoriteAdded' : 'FavoriteRemoved',
    properties: {
      pokemonName: pokemonName
    }
  });
};

// Rastrear errores
export const trackError = (errorMessage: string, componentName: string) => {
  if (!connectionString) return;
  appInsights.trackException({
    exception: new Error(errorMessage),
    properties: {
      component: componentName
    }
  });
};

export default appInsights;