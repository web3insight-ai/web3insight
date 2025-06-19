const githubUrlPrefix = "https://github.com/";

function resolveContestants(rawText: string): string[] {
  return [
    ...new Set(
      rawText
        .split(/[\n,]/)
        .map(item => item.trim())
        .filter(item => item !== "")
        .map(item => item.startsWith(githubUrlPrefix) ? item : `${githubUrlPrefix}${item}`),
    ),
  ];
}

export { resolveContestants };
