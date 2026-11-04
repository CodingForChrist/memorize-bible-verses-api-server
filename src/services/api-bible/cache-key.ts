export function createCacheKey(
  data: Record<string, string | string[] | number | boolean | null | undefined>,
): string {
  const sortedKeys = Object.keys(data)
    .filter((key) => data[key] !== null && data[key] !== undefined)
    .toSorted((a, b) => a.localeCompare(b)); // Explicit string comparison function

  const serialized = sortedKeys.map((key) => {
    return `${key}:${String(data[key])}`;
  });

  return `{${serialized.join(",")}}`;
}
