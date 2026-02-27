export function createStablePartKey(
  baseKey: string,
  seenKeys: Map<string, number>,
) {
  const count = seenKeys.get(baseKey) ?? 0;
  seenKeys.set(baseKey, count + 1);

  if (count === 0) {
    return baseKey;
  }

  return `${baseKey}-${count}`;
}
