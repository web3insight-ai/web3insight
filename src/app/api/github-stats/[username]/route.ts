import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const resolvedParams = await params;
    const { username } = resolvedParams;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }

    // Fetch both GitHub stats and top languages
    const [statsResponse, langsResponse] = await Promise.all([
      fetch(`https://yu-readme.vercel.app/api?username=${username}&count_private=true`),
      fetch(`https://yu-readme.vercel.app/api/top-langs/?username=${username}&hide=markdown,html,css,Svelte,smarty`),
    ]);

    if (!statsResponse.ok || !langsResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub data" },
        { status: 500 },
      );
    }

    const [statsSvg, langsSvg] = await Promise.all([
      statsResponse.text(),
      langsResponse.text(),
    ]);

    // Parse GitHub stats from SVG
    const parseGitHubStats = (svg: string) => {
      const descMatch = svg.match(/<desc[^>]*>(.*?)<\/desc>/s);
      const titleMatch = svg.match(/<title[^>]*>(.*?)<\/title>/s);
      
      if (!descMatch || !titleMatch) return null;

      const desc = descMatch[1];
      const title = titleMatch[1];
      
      // Extract rank from title
      const rankMatch = title.match(/Rank:\s*([A-F][+-]?)/);
      const rank = rankMatch ? rankMatch[1] : null;

      // Parse stats from description
      const starsMatch = desc.match(/Total Stars Earned:\s*(\d+(?:[.,]\d+)?[kmb]?)/i);
      const commitsMatch = desc.match(/Total Commits.*?:\s*(\d+(?:[.,]\d+)?[kmb]?)/i);
      const prsMatch = desc.match(/Total PRs:\s*(\d+(?:[.,]\d+)?[kmb]?)/i);
      const issuesMatch = desc.match(/Total Issues:\s*(\d+(?:[.,]\d+)?[kmb]?)/i);
      const contributedMatch = desc.match(/Contributed to.*?:\s*(\d+(?:[.,]\d+)?[kmb]?)/i);

      return {
        rank,
        totalStars: starsMatch ? starsMatch[1] : '0',
        totalCommits: commitsMatch ? commitsMatch[1] : '0',
        totalPRs: prsMatch ? prsMatch[1] : '0',
        totalIssues: issuesMatch ? issuesMatch[1] : '0',
        contributedTo: contributedMatch ? contributedMatch[1] : '0',
      };
    };

    // Parse top languages from SVG
    const parseTopLanguages = (svg: string) => {
      // Extract language names and percentages using more specific regex
      const langNameRegex = /<text[^>]*data-testid="lang-name"[^>]*>([^<]+)<\/text>/g;
      const percentageRegex = />\s*([\d.]+%)\s*</g;
      
      const langNames: string[] = [];
      const percentages: string[] = [];
      
      // Extract language names
      let langMatch;
      while ((langMatch = langNameRegex.exec(svg)) !== null) {
        langNames.push(langMatch[1].trim());
      }
      
      // Extract percentages
      let percentMatch;
      while ((percentMatch = percentageRegex.exec(svg)) !== null) {
        percentages.push(percentMatch[1].trim());
      }
      
      // Combine languages with percentages
      const languages: Array<{ name: string; percentage: string }> = [];
      const minLength = Math.min(langNames.length, percentages.length);
      
      for (let i = 0; i < minLength; i++) {
        languages.push({
          name: langNames[i],
          percentage: percentages[i],
        });
      }
      
      // Fallback: use known data if parsing fails
      if (languages.length === 0) {
        return [];
      }

      return languages.slice(0, 5); // Limit to top 5
    };

    const githubStats = parseGitHubStats(statsSvg);
    const topLanguages = parseTopLanguages(langsSvg);

    return NextResponse.json({
      success: true,
      data: {
        username,
        stats: githubStats,
        languages: topLanguages,
      },
    });

  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
