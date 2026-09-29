/**
 * Geolocation & Haversine Distance Engine
 * Computes exact spherical distance, urban driving travel times, and formatting utilities.
 */

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine spherical trigonometry formula.
 *
 * @param lat1 Latitude of origin point in decimal degrees
 * @param lng1 Longitude of origin point in decimal degrees
 * @param lat2 Latitude of destination point in decimal degrees
 * @param lng2 Longitude of destination point in decimal degrees
 * @returns Distance in kilometers, rounded to 1 decimal place
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  if (lat1 === lat2 && lng1 === lng2) {
    return 0;
  }

  const EARTH_RADIUS_KM = 6371;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  // Guard against numerical roundoff exceeding [0, 1]
  const clampedA = Math.max(0, Math.min(1, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Estimates driving travel time based on distance in kilometers
 * and average urban transit speed (default 25 km/h for Nigerian traffic realities).
 *
 * @param distanceKm Distance in kilometers
 * @param averageSpeedKmh Average driving speed in km/h (default: 25 km/h)
 * @returns Estimated travel time in minutes (minimum 1 min for non-zero distance)
 */
export function estimateTravelTime(
  distanceKm: number,
  averageSpeedKmh: number = 25
): number {
  if (distanceKm <= 0) {
    return 0;
  }

  const effectiveSpeed = averageSpeedKmh > 0 ? averageSpeedKmh : 25;
  const minutes = (distanceKm / effectiveSpeed) * 60;

  return Math.max(1, Math.round(minutes));
}

/**
 * Formats a distance number in kilometers to a clean user-facing string.
 * Examples:
 * - 0.4 -> "400 m"
 * - 9.3 -> "9.3 km"
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm <= 0) {
    return '0 km';
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Formats travel time in minutes to a clean human-readable duration string.
 * Examples:
 * - 0 -> "0 mins"
 * - 22 -> "22 mins"
 * - 60 -> "1 hr"
 * - 75 -> "1 hr 15 mins"
 */
export function formatTravelTime(minutes: number): string {
  if (minutes <= 0) {
    return '0 mins';
  }
  if (minutes < 1) {
    return '< 1 min';
  }
  if (minutes < 60) {
    return `${minutes} mins`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
  }

  return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${remainingMinutes} mins`;
}

/**
 * Checks whether a target point is within a given radial distance (in km)
 * from an origin point.
 */
export function isWithinRadius(
  originLat: number,
  originLng: number,
  targetLat: number,
  targetLng: number,
  radiusKm: number
): boolean {
  return calculateDistance(originLat, originLng, targetLat, targetLng) <= radiusKm;
}
