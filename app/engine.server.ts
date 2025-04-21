import axios from "axios";
import { Redis } from "ioredis";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { isAddress } from "viem";

export const redis = new Redis(process.env.REDIS_URL as string);

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export const PROMPT = (context: string) => `You are an advanced AI assistant specializing in Web3, blockchain technology, and software development. Your role is to provide concise, accurate, and insightful analysis of GitHub users, repositories, or Ethereum addresses based on the given context. Limit your response to 1024 tokens and stay focused on the query.

**Crucial:** Respond in the same language as the user's query, adapting your tone, expressions, and cultural references appropriately.

Begin with a direct, concise answer to the user's query. Then, based on whether the analysis concerns an EVM address or GitHub entity, use the following structure:

For EVM Addresses:

**🔢 Transaction Overview**

* Total transaction count (include critical observations on frequency and patterns)
* Notable interactions (highlight anomalies, quantify where possible)

**💼 Asset Analysis**

* Significant holdings (evaluate portfolio diversity and risk exposure)
* DeFi engagements (assess strategy effectiveness and potential vulnerabilities)

**🤖 Smart Contract Interaction**

* Frequently used contracts (analyze variety and purpose)
* Innovative or unusual contract usage (evaluate impact and originality)

For GitHub Users/Repositories:

**⭐ Project Impact**

* Starred projects (assess relevance and influence in the ecosystem)
* Web3 contributions (evaluate significance to blockchain technology)

**📊 Activity Metrics**

* Commit frequency and distribution (analyze consistency and productivity trends)
* Issue and PR engagement (assess collaboration skills and problem-solving approach)

**🛠️ Technical Proficiency**

* Primary languages and technologies (evaluate expertise and versatility)

**⛓️‍💥 Web3-specific skills**

assess depth of blockchain knowledge and implementation

**🔖 Conclusion**

Provide a brief summary of the key insights and critical observations from your analysis.

Provide a balanced yet critical analysis, highlighting both strengths and areas for improvement. Use data-driven insights to support your observations. Offer constructive criticism where appropriate, demonstrating a nuanced understanding of Web3 and software development best practices.

If the provided context lacks sufficient information on a relevant topic, clearly state "Information is insufficient regarding [topic]" rather than speculating.

Your analysis should be:
1. Accurate and fact-based, avoiding speculation
2. Critical and balanced, addressing both positives and negatives
3. Insightful, offering unique perspectives based on the data
4. Concise, prioritizing key information within the token limit

Here's the context for your analysis:
${context}

Now, provide a thorough, balanced, and critically insightful analysis of the query.`;

export async function getInfo(query: string) {
  if (isAddress(query) || query.endsWith(".eth")) {
    return getEVMInfo(query);
  } else if (query.includes("/")) {
    return getGitHubRepoInfo(query);
  } else {
    return getGitHubUserInfo(query);
  }
}

async function getEVMInfo(address: string) {
  const apiUrl = `${process.env.RSS3_DSL_URL}/decentralized/${address}?limit=50&action_limit=10`;
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching EVM info:", error);
    return null;
  }
}

async function getGitHubRepoInfo(repo: string) {
  const key = `github:repo:${repo}`;
  const cached = await redis.get(key);

  if (cached) {
    const parsedCache = JSON.parse(cached);
    if (Object.keys(parsedCache).length !== 0) {
      return parsedCache;
    }
  }

  const apiUrl = `${process.env.OSSINSIGHT_URL}/repo/${repo}`;

  try {
    const response = await axios.get(apiUrl);
    const result = response.data.data;

    await redis.set(key, JSON.stringify(result), "EX", 60 * 60 * 24 * 2);
    return result;
  } catch (error) {
    console.error("Error fetching GitHub repo info:", error);
    return null;
  }
}

async function getGitHubUserInfo(user: string) {
  const key = `github:user:${user}`;
  const cached = await redis.get(key);

  if (cached) {
    const parsedCache = JSON.parse(cached);
    if (Object.keys(parsedCache).length !== 0) {
      return parsedCache;
    }
  }

  const apiUrl = `${process.env.OSSINSIGHT_URL}/users/${user}`;

  try {
    const response = await axios.get(apiUrl);
    const result = response.data.data;

    await redis.set(key, JSON.stringify(result), "EX", 60 * 60 * 24 * 2);
    return result;
  } catch (error) {
    console.error("Error fetching GitHub user info:", error);
    return null;
  }
}

export async function analyzeInfo(
  info: any,
  type: "evm" | "github_repo" | undefined,
) {
  const model = openai("gpt-4o");
  let prompt;

  switch (type) {
    case "evm":
      prompt = `Analyze the following EVM address information and provide a concise summary:
        ${JSON.stringify(info)}`;
      break;
    case "github_repo":
      prompt = `Analyze the following GitHub repository information and provide a concise summary:
        ${JSON.stringify(info)}`;
      break;
    default:
      prompt = `Analyze the following information and provide a concise summary:
        ${JSON.stringify(info)}`;
      break;
  }

  const result = await generateText({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant that analyzes EVM address, GitHub user, and repository information.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    maxTokens: 4096,
    topP: 0.5,
  });

  return result.text;
}

export async function getSearchKeyword(question: string) {
  const model = openai("gpt-4o");
  const result = await generateText({
    model,
    messages: [
      {
        role: "system",
        content: `You are a search expert specializing in extracting blockchain/crypto ecosystem names, community names, GitHub repo names, and Web3 addresses from questions. Follow these rules:

        1. Ecosystem names:
          - Only return "starknet" if explicitly mentioned.
          - Do not return anything for other ecosystems.

        2. Community names:
          - Only return "openbuild" if explicitly mentioned.
          - Do not return anything for other communities.

        3. GitHub Repositories:
          - If a specific repository is mentioned, return it in the format {user/repo}.
          - Example: "pseudoyu/yu-tools" for "analyze pseudoyu/yu-tools".

        4. EVM Addresses or ENS Domains:
          - Return the exact EVM address or ENS domain if mentioned.

        5. Prioritization:
          - If multiple elements are present, prioritize: Ecosystem > Community > Repository > EVM Address/ENS Domain.

        6. Match:
          - If the query doesn't match any of the above categories, return an empty string.

        Return only the extracted information without any additional text or explanation. If no valid match is found, return an empty string.`,
      },
      {
        role: "user",
        content: question,
      },
    ],
    maxTokens: 4096,
    topP: 0.5,
  });

  return result.text.trim();
}
