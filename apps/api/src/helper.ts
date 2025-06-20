export function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

export function convertGithubUrlToRepoName(url: string): string {
  return url.replace(/^https:\/\/github\.com\//i, '');
}

export async function askForConfirmation(message: string): Promise<boolean> {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question(`${message} (y/n): `, (ans) => {
      resolve(ans.trim().toLowerCase());
      rl.close();
    });
  });

  return answer === 'y' || answer === 'yes';
}
