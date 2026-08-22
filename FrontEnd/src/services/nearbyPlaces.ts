import { GooglePlaceSuggestion } from '@/types';

export interface NearbyPlacesResponse {
  places: GooglePlaceSuggestion[];
  error?: string;
  configured?: boolean;
  cached?: boolean;
}

/**
 * Fetches real point-of-interest suggestions for a destination using Google Places API (New)
 * through the server-side route handler.
 */
export async function fetchNearbySuggestions(
  destination: string,
  signal?: AbortSignal
): Promise<NearbyPlacesResponse> {
  const trimmed = destination.trim();
  if (!trimmed) {
    return { places: [] };
  }

  try {
    const response = await fetch(
      `/api/places/nearby?destination=${encodeURIComponent(trimmed)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        places: [],
        error: data.error || 'Failed to fetch suggestions from Google Places',
        configured: data.configured !== false,
      };
    }

    return {
      places: Array.isArray(data.places) ? data.places : [],
      cached: !!data.cached,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { places: [] };
    }
    return {
      places: [],
      error: error.message || 'Network error connecting to Places service',
    };
  }
}
