/**
 * Location and Reverse Geocoding Service for MenuZap Platform
 * Generic, multi-tenant and secure implementation using browser Geolocation API
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeocodedAddress {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  formattedAddress?: string;
  latitude: number;
  longitude: number;
}

export type LocationErrorType =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NOT_SUPPORTED'
  | 'GEOCODE_ERROR'
  | 'UNKNOWN';

export interface LocationServiceError {
  type: LocationErrorType;
  message: string;
}

// Brazilian state name to abbreviation dictionary
const BRAZIL_STATES: Record<string, string> = {
  'Acre': 'AC',
  'Alagoas': 'AL',
  'Amapá': 'AP',
  'Amazonas': 'AM',
  'Bahia': 'BA',
  'Ceará': 'CE',
  'Distrito Federal': 'DF',
  'Espírito Santo': 'ES',
  'Goiás': 'GO',
  'Maranhão': 'MA',
  'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG',
  'Pará': 'PA',
  'Paraíba': 'PB',
  'Paraná': 'PR',
  'Pernambuco': 'PE',
  'Piauí': 'PI',
  'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS',
  'Rondônia': 'RO',
  'Roraima': 'RR',
  'Santa Catarina': 'SC',
  'São Paulo': 'SP',
  'Sergipe': 'SE',
  'Tocantins': 'TO'
};

function normalizeState(stateName?: string): string {
  if (!stateName) return '';
  const trimmed = stateName.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return BRAZIL_STATES[trimmed] || trimmed;
}

/**
 * Requests the single-shot current GPS position from the browser.
 * NEVER starts background watching or continuous tracking.
 */
export function requestCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const error: LocationServiceError = {
        type: 'NOT_SUPPORTED',
        message: 'Seu navegador não possui suporte a geolocalização.',
      };
      return reject(error);
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (geoError) => {
        let errorType: LocationErrorType = 'UNKNOWN';
        let message = 'Não foi possível acessar sua localização.';

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            errorType = 'PERMISSION_DENIED';
            message = 'Você não permitiu o acesso à localização. Você pode preencher seu endereço manualmente.';
            break;
          case geoError.POSITION_UNAVAILABLE:
            errorType = 'POSITION_UNAVAILABLE';
            message = 'Não conseguimos determinar sua localização. Verifique o sinal de GPS e tente novamente.';
            break;
          case geoError.TIMEOUT:
            errorType = 'TIMEOUT';
            message = 'A localização demorou muito para responder. Tente novamente ou preencha o endereço manualmente.';
            break;
          default:
            errorType = 'UNKNOWN';
            message = 'Ocorreu um erro ao obter sua localização. Preencha os dados manualmente.';
            break;
        }

        const error: LocationServiceError = {
          type: errorType,
          message,
        };
        reject(error);
      },
      options
    );
  });
}

/**
 * Reverse geocodes latitude and longitude coordinates into a structured Brazilian address.
 * Abstracted to easily swap or expand geocoding providers in the future.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodedAddress> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocode failed with status ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    const street = addr.road || addr.street || addr.pedestrian || addr.avenue || addr.path || '';
    const number = addr.house_number || '';
    const neighborhood = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.district || '';
    const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || '';
    const state = normalizeState(addr.state);
    const zipCode = addr.postcode ? addr.postcode.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2') : '';
    const country = addr.country || 'Brasil';

    return {
      street,
      number,
      neighborhood,
      city,
      state,
      zipCode,
      country,
      formattedAddress: data.display_name || '',
      latitude,
      longitude,
    };
  } catch (err) {
    const error: LocationServiceError = {
      type: 'GEOCODE_ERROR',
      message: 'Não conseguimos identificar seu endereço automaticamente. Confira ou preencha os dados manualmente.',
    };
    throw error;
  }
}

/**
 * High-level orchestration function: requests GPS location and converts to address.
 * Calls `onProgress` callback with descriptive status messages.
 */
export async function getAddressFromCurrentLocation(
  onProgress?: (statusText: string) => void
): Promise<GeocodedAddress> {
  if (onProgress) onProgress('Obtendo sua localização...');
  const coords = await requestCurrentLocation();

  if (onProgress) onProgress('Encontrando seu endereço...');
  const address = await reverseGeocode(coords.latitude, coords.longitude);

  return address;
}
