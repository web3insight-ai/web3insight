function resolveContestants(rawText: string): string[] {
  return [
    ...new Set(
      rawText
        .split(/[\n,]/)
        .map(item => item.trim())
        .filter(item => item !== ""),
    ),
  ];
}

export { resolveContestants };
