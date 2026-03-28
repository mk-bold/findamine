/**
 * Hot/Cold GPS Meter
 *
 * 5-zone color gradient for navigation feedback:
 * - ICY (>500m): blue
 * - COLD (200-500m): light blue
 * - WARM (50-200m): green
 * - HOT (15-50m): orange
 * - BURNING (<15m): red/fire
 */

export interface HotColdZone {
  zone: "icy" | "cold" | "warm" | "hot" | "burning";
  color: string;
  label: string;
  emoji: string;
  distanceLabel: string;
}

export function getHotColdZone(distanceMeters: number): HotColdZone {
  if (distanceMeters < 15) {
    return {
      zone: "burning",
      color: "#EF4444",
      label: "You're right here!",
      emoji: "🔥",
      distanceLabel: `${Math.round(distanceMeters)}m`,
    };
  }
  if (distanceMeters < 50) {
    return {
      zone: "hot",
      color: "#F97316",
      label: "Very hot! Almost there!",
      emoji: "🌡️",
      distanceLabel: `${Math.round(distanceMeters)}m`,
    };
  }
  if (distanceMeters < 200) {
    return {
      zone: "warm",
      color: "#22C55E",
      label: "Getting warmer!",
      emoji: "☀️",
      distanceLabel: `${Math.round(distanceMeters)}m`,
    };
  }
  if (distanceMeters < 500) {
    return {
      zone: "cold",
      color: "#60A5FA",
      label: "Still a bit chilly...",
      emoji: "❄️",
      distanceLabel: `${Math.round(distanceMeters)}m`,
    };
  }
  return {
    zone: "icy",
    color: "#3B82F6",
    label: "Brrr! Pretty far away.",
    emoji: "🧊",
    distanceLabel: distanceMeters >= 1000
      ? `${(distanceMeters / 1000).toFixed(1)}km`
      : `${Math.round(distanceMeters)}m`,
  };
}

/**
 * Calculate distance between two GPS points using Haversine formula.
 * Returns distance in meters.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Should the hot/cold meter update?
 * Only update after significant movement (>10m) to avoid jitter.
 */
export function shouldUpdateMeter(
  prevLat: number,
  prevLon: number,
  newLat: number,
  newLon: number,
  minMovementMeters: number = 10
): boolean {
  const moved = haversineDistance(prevLat, prevLon, newLat, newLon);
  return moved >= minMovementMeters;
}
