import { NextRequest, NextResponse } from 'next/server';
import { GooglePlaceSuggestion } from '@/types';
import { mockCities, mockActivities } from '@/lib/mockData';

// In-memory cache for API requests to minimize redundant billing & improve speed
const placeCache = new Map<string, { timestamp: number; data: GooglePlaceSuggestion[] }>();
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes cache

// Curated dynamic destination places catalog for cities when offline or without API key
const dynamicCityCatalog: Record<string, GooglePlaceSuggestion[]> = {
  tokyo: [
    {
      id: 'poi-tokyo-1',
      displayName: 'Senso-ji Temple & Asakusa District',
      formattedAddress: '2-3-1 Asakusa, Taito City, Tokyo',
      rating: 4.7,
      userRatingCount: 58200,
      primaryType: 'Shrine & Temple',
      photoUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'poi-tokyo-2',
      displayName: 'Tsukiji Outer Seafood Market',
      formattedAddress: '4-16-2 Tsukiji, Chuo City, Tokyo',
      rating: 4.5,
      userRatingCount: 32100,
      primaryType: 'Market & Street Food',
      photoUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'poi-tokyo-3',
      displayName: 'TeamLab Planets Digital Art Museum',
      formattedAddress: '6-1-16 Toyosu, Koto City, Tokyo',
      rating: 4.8,
      userRatingCount: 41900,
      primaryType: 'Art & Museum',
      photoUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'poi-tokyo-4',
      displayName: 'Shibuya Crossing & Hachiko Statue',
      formattedAddress: 'Dogenzaka, Shibuya City, Tokyo',
      rating: 4.6,
      userRatingCount: 65400,
      primaryType: 'Landmark',
      photoUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80',
    },
  ],
  kyoto: [
    {
      id: 'poi-kyoto-1',
      displayName: 'Fushimi Inari Taisha Shrine',
      formattedAddress: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto',
      rating: 4.9,
      userRatingCount: 71200,
      primaryType: 'Shrine & Landmark',
      photoUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'poi-kyoto-2',
      displayName: 'Kinkaku-ji (Golden Pavilion)',
      formattedAddress: '1 Kinkakujicho, Kita Ward, Kyoto',
      rating: 4.7,
      userRatingCount: 48900,
      primaryType: 'Historical Temple',
      photoUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'poi-kyoto-3',
      displayName: 'Arashiyama Bamboo Grove',
      formattedAddress: 'Ukyo Ward, Kyoto',
      rating: 4.6,
      userRatingCount: 39500,
      primaryType: 'Nature & Landmark',
      photoUrl: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'poi-kyoto-4',
      displayName: 'Gion Historic Teahouse District',
      formattedAddress: 'Higashiyama Ward, Kyoto',
      rating: 4.7,
      userRatingCount: 28400,
      primaryType: 'Culture & Cafe',
      photoUrl: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=600&auto=format&fit=crop&q=80',
    },
  ],
  interlaken: [
    {
      id: 'poi-interlaken-1',
      displayName: 'Jungfraujoch Top of Europe',
      formattedAddress: 'Lauterbrunnen, Bernese Alps, Switzerland',
      rating: 4.9,
      userRatingCount: 22100,
      primaryType: 'Mountain & Adventure',
      photoUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'poi-interlaken-2',
      displayName: 'Harder Kulm Panorama Viewpoint',
      formattedAddress: 'Harder Kulm, 3800 Interlaken',
      rating: 4.7,
      userRatingCount: 15400,
      primaryType: 'Scenic Viewpoint',
      photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'poi-interlaken-3',
      displayName: 'Lake Brienz Turquoise Cruise',
      formattedAddress: 'Seestrasse, Brienz / Interlaken',
      rating: 4.8,
      userRatingCount: 12800,
      primaryType: 'Boat Tour & Nature',
      photoUrl: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=600&auto=format&fit=crop&q=80',
    },
  ],
  santorini: [
    {
      id: 'poi-santorini-1',
      displayName: 'Oia Sunset Point & Caldera Walk',
      formattedAddress: 'Oia Village, Santorini, Greece',
      rating: 4.9,
      userRatingCount: 49800,
      primaryType: 'Scenic Landmark',
      photoUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'poi-santorini-2',
      displayName: 'Red Beach & Akrotiri Ruins',
      formattedAddress: 'Akrotiri, Santorini',
      rating: 4.6,
      userRatingCount: 18700,
      primaryType: 'Beach & Archaeological',
      photoUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'poi-santorini-3',
      displayName: 'Fira to Oia Cliffside Trail',
      formattedAddress: 'Fira, Santorini',
      rating: 4.8,
      userRatingCount: 14200,
      primaryType: 'Hiking & Adventure',
      photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    },
  ],
  athens: [
    {
      id: 'poi-athens-1',
      displayName: 'Acropolis & The Parthenon',
      formattedAddress: 'Athens 105 58, Greece',
      rating: 4.8,
      userRatingCount: 82000,
      primaryType: 'Ancient Landmark',
      photoUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'poi-athens-2',
      displayName: 'Plaka Historic Neighborhood & Cafes',
      formattedAddress: 'Plaka, Athens',
      rating: 4.7,
      userRatingCount: 31000,
      primaryType: 'Culture & Dining',
      photoUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'poi-athens-3',
      displayName: 'Acropolis Museum',
      formattedAddress: 'Dionysiou Areopagitou 15, Athens',
      rating: 4.9,
      userRatingCount: 45600,
      primaryType: 'Museum',
      photoUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=80',
    },
  ],
  paris: [
    {
      id: 'poi-paris-1',
      displayName: 'Eiffel Tower & Champ de Mars',
      formattedAddress: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris',
      rating: 4.7,
      userRatingCount: 120000,
      primaryType: 'Landmark',
      photoUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'poi-paris-2',
      displayName: 'Louvre Museum & Glass Pyramid',
      formattedAddress: 'Rue de Rivoli, 75001 Paris',
      rating: 4.8,
      userRatingCount: 110000,
      primaryType: 'Museum & Art',
      photoUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format&fit=crop&q=80',
    },
  ],
  rome: [
    {
      id: 'poi-rome-1',
      displayName: 'Colosseum & Roman Forum',
      formattedAddress: 'Piazza del Colosseo, 1, 00184 Roma RM, Italy',
      rating: 4.8,
      userRatingCount: 95000,
      primaryType: 'Historical Landmark',
      photoUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'poi-rome-2',
      displayName: 'Trevi Fountain',
      formattedAddress: 'Piazza di Trevi, 00187 Roma RM, Italy',
      rating: 4.7,
      userRatingCount: 88000,
      primaryType: 'Monument & Plaza',
      photoUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=600&auto=format&fit=crop&q=80',
    },
  ],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination')?.trim();

  if (!destination) {
    return NextResponse.json(
      { error: 'Destination parameter is required', places: [] },
      { status: 400 }
    );
  }

  const cacheKey = destination.toLowerCase();
  const cached = placeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ places: cached.data, cached: true });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // 1. If Google Maps API key is configured, execute live Google Places API (New) request
  if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your_google_maps')) {
    try {
      const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.primaryType,places.types,places.photos,places.googleMapsUri,places.location',
        },
        body: JSON.stringify({
          textQuery: `top points of interest and attractions in ${destination}`,
          maxResultCount: 8,
          pageSize: 8,
        }),
      });

      const data = await response.json();

      if (response.ok && data.places && Array.isArray(data.places)) {
        const suggestions: GooglePlaceSuggestion[] = data.places.map((place: any) => {
          let photoUrl: string | undefined = undefined;
          if (place.photos && place.photos.length > 0 && place.photos[0].name) {
            photoUrl = `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=400&maxWidthPx=600&key=${apiKey}`;
          }

          return {
            id: place.id,
            displayName: place.displayName?.text || '',
            formattedAddress: place.formattedAddress || undefined,
            rating: typeof place.rating === 'number' ? place.rating : undefined,
            userRatingCount: typeof place.userRatingCount === 'number' ? place.userRatingCount : undefined,
            primaryType: place.primaryType || undefined,
            types: Array.isArray(place.types) ? place.types : undefined,
            photoUrl,
            googleMapsUri: place.googleMapsUri || undefined,
            location: place.location
              ? {
                  latitude: place.location.latitude,
                  longitude: place.location.longitude,
                }
              : undefined,
          };
        });

        placeCache.set(cacheKey, { timestamp: Date.now(), data: suggestions });
        return NextResponse.json({ places: suggestions, source: 'google' });
      }
    } catch (googleError) {
      console.warn('Google Places API request failed, falling back to dynamic destination catalog:', googleError);
    }
  }

  // 2. Dynamic resolver based on searched destination
  const lowerDest = destination.toLowerCase();
  let matchedPlaces: GooglePlaceSuggestion[] = [];

  // Check matching key from dynamic catalog
  for (const [cityKey, places] of Object.entries(dynamicCityCatalog)) {
    if (lowerDest.includes(cityKey) || cityKey.includes(lowerDest)) {
      matchedPlaces = places;
      break;
    }
  }

  // If no direct city match, dynamically generate contextual points of interest for that custom destination
  if (matchedPlaces.length === 0) {
    matchedPlaces = [
      {
        id: `poi-custom-${lowerDest.replace(/\s+/g, '-')}-1`,
        displayName: `${destination} City Center & Historic Walk`,
        formattedAddress: `Central ${destination}`,
        rating: 4.8,
        userRatingCount: 1420,
        primaryType: 'Landmark & Walk',
        photoUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: `poi-custom-${lowerDest.replace(/\s+/g, '-')}-2`,
        displayName: `${destination} Cultural Heritage Museum`,
        formattedAddress: `Cultural District, ${destination}`,
        rating: 4.7,
        userRatingCount: 980,
        primaryType: 'Museum & Art',
        photoUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: `poi-custom-${lowerDest.replace(/\s+/g, '-')}-3`,
        displayName: `Old Town Traditional Market in ${destination}`,
        formattedAddress: `Market Square, ${destination}`,
        rating: 4.6,
        userRatingCount: 2150,
        primaryType: 'Local Market',
        photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: `poi-custom-${lowerDest.replace(/\s+/g, '-')}-4`,
        displayName: `${destination} Panoramic Sunset Viewpoint`,
        formattedAddress: `Lookout Hill, ${destination}`,
        rating: 4.9,
        userRatingCount: 3400,
        primaryType: 'Scenic Viewpoint',
        photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      },
    ];
  }

  placeCache.set(cacheKey, { timestamp: Date.now(), data: matchedPlaces });
  return NextResponse.json({ places: matchedPlaces, source: 'catalog' });
}
