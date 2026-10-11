type CoordinateType = "latitude" | "longitude";

const coordinateRanges: Record<CoordinateType, { min: number; max: number }> = {
  latitude: { min: -90, max: 90 },
  longitude: { min: -180, max: 180 },
};

function parseCoordinate(value: number | null | undefined, type: CoordinateType) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return undefined;
  }

  const range = coordinateRanges[type];
  if (value < range.min || value > range.max) {
    return undefined;
  }

  return value;
}

export function parseCoordinates(latitude: number | null | undefined, longitude: number | null | undefined) {
  const parsedLatitude = parseCoordinate(latitude, "latitude");
  const parsedLongitude = parseCoordinate(longitude, "longitude");

  return {
    latitude: parsedLatitude,
    longitude: parsedLongitude,
    isValid: parsedLatitude !== undefined && parsedLongitude !== undefined,
  };
}
