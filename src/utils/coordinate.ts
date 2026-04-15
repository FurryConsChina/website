type CoordinateType = "latitude" | "longitude";

const coordinateRanges: Record<CoordinateType, { min: number; max: number }> = {
  latitude: { min: -90, max: 90 },
  longitude: { min: -180, max: 180 },
};

function parseCoordinateText(value: string | null | undefined, type: CoordinateType) {
  if (!value) {
    return undefined;
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);
  if (!Number.isFinite(parsedValue)) {
    return undefined;
  }

  const range = coordinateRanges[type];
  if (parsedValue < range.min || parsedValue > range.max) {
    return undefined;
  }

  return parsedValue;
}

export function parseCoordinates(latitudeText: string | null | undefined, longitudeText: string | null | undefined) {
  const latitude = parseCoordinateText(latitudeText, "latitude");
  const longitude = parseCoordinateText(longitudeText, "longitude");

  return {
    latitude,
    longitude,
    isValid: latitude !== undefined && longitude !== undefined,
  };
}
