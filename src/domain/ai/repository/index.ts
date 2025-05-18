import { generateText as generateTextFromAi } from "ai";
import { isAddress } from "viem";

import type { DataValue } from "@/types";

import type { AnalysisType } from "../typing";
import { generateAnalysisPrompt } from "../helper";
import openai from "./client";

const model = openai("gpt-4o");

async function generateText(opts: Record<string, DataValue>) {
  return generateTextFromAi({ model, ...opts });
}

async function getSearchKeyword(question: string) {
  const result = await generateText({
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

async function analyzeInfo( info: DataValue, type: AnalysisType ) {
  const stringified = JSON.stringify(info);

  let prompt;

  switch (type) {
  case "evm":
    prompt = `Analyze the following EVM address information and provide a concise summary:
        ${stringified}`;
    break;
  case "github_repo":
    prompt = `Analyze the following GitHub repository information and provide a concise summary:
        ${stringified}`;
    break;
  default:
    prompt = `Analyze the following information and provide a concise summary:
        ${stringified}`;
    break;
  }

  const result = await generateText({
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

async function fetchAnalysisPrompt(info: DataValue, keyword: string) {
  // Determine type based on keyword format
  let type: AnalysisType;

  if (isAddress(keyword) || keyword.endsWith(".eth")) {
    type = "evm";
  } else if (keyword.includes("/")) {
    type = "github_repo";
  } else {
    type = undefined;
  }

  const analysis = await analyzeInfo(info, type);

  return generateAnalysisPrompt(`[[citation:0]] ${analysis}`);
}

export { generateText, getSearchKeyword, fetchAnalysisPrompt };
