import dotenv from "dotenv";
import axios from "axios";
import { z } from "zod";
import { agent, agentInputEvent, agentOutputEvent, agentStreamEvent, agentToolCallResultEvent } from "@llamaindex/workflow";
import { openai } from "@llamaindex/openai";
import { tool } from "llamaindex";

dotenv.config();

enum EcosystemEnum {
    near = "NEAR",
    openbuild = "OpenBuild",
    starknet = "Starknet",
    all = "ALL",
}

function matchEcosystem(ecosystem: string): string {
    const lower = ecosystem.toLowerCase();
    Object.entries(EcosystemEnum).forEach(([key, value]) => {
        if (key === lower) {
            return value;
        }
    });
    return EcosystemEnum.all;
}

const apiClient = axios.create({
    baseURL: "https://api.web3insights.app",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEB3INSIGHTS_API_KEY}`,
    },
});

async function countRepositories({ ecosystem = "all" }: { ecosystem?: string } = {}): Promise<any> {
    const ecoName = matchEcosystem(ecosystem);
    const res = await apiClient.get("/v1/repos/total", { params: { eco_name: ecoName } });
    return res.data;
}

async function countContributors(
    { ecosystem = "all", scope = "all" }: { ecosystem?: string; scope?: string } = {}
): Promise<any> {
    const ecoName = matchEcosystem(ecosystem);
    const scopeParam = scope.toLowerCase() === "core" ? "Core" : "ALL";
    const res = await apiClient.get("/v1/actors/total", {
        params: { eco_name: ecoName, scope: scopeParam },
    });
    return res.data;
}

async function countEcosystemAmount(): Promise<any> {
    const res = await apiClient.get("/v1/ecosystems/total");
    return res.data;
}

async function countRecentContributors(
    { ecosystem = "all", period = "week" }: { ecosystem?: string; period?: string } = {}
): Promise<any> {
    const ecoName = matchEcosystem(ecosystem);
    const periodParam = period.toLowerCase() === "month" ? "month" : "week";
    const res = await apiClient.get("/v1/actors/total/date", {
        params: { eco_name: ecoName, period: periodParam },
    });
    return res.data;
}

async function rankEcosystems(): Promise<any> {
    const res = await apiClient.get("/v1/ecosystems/top");
    return res.data;
}

async function rankRepositories({ ecosystem = "all" }: { ecosystem?: string } = {}): Promise<any> {
    const ecoName = matchEcosystem(ecosystem);
    const res = await apiClient.get("/v1/repos/top", { params: { eco_name: ecoName } });
    return res.data;
}

async function rankContributors({ ecosystem = "all" }: { ecosystem?: string } = {}): Promise<any> {
    const ecoName = matchEcosystem(ecosystem);
    const res = await apiClient.get("/v1/actors/top", { params: { eco_name: ecoName } });
    return res.data;
}

const countRepositoriesTool = tool({
    name: "countRepositories",
    description: "Count the total number of repositories in a specified ecosystem.",
    parameters: z.object({
        ecosystem: z.string({
            description: "The ecosystem to query. Valid options are ['NEAR', 'OpenBuild', 'Starknet', 'all'].",
        }),
    }),
    execute: countRepositories,
});

const countContributorsTool = tool({
    name: "countContributors",
    description: "Count the total number of contributors in a specified ecosystem and scope.",
    parameters: z.object({
        ecosystem: z.string({
            description: "The ecosystem to query. Valid options are ['NEAR', 'OpenBuild', 'Starknet', 'all'].",
        }),
        scope: z.string({
            description: "The scope of contributors to count. Valid options are ['core', 'all']."
        }),
    }),
    execute: countContributors,
});

const countEcosystemAmountTool = tool({
    name: "countEcosystemAmount",
    description: "Count the total number of ecosystems.",
    parameters: z.object({}),
    execute: countEcosystemAmount,
});

const countRecentContributorsTool = tool({
    name: "countRecentContributors",
    description: "Count recent contributors in a specified ecosystem and time period.",
    parameters: z.object({
        ecosystem: z.string({
            description: "The ecosystem to query. Valid options are ['NEAR', 'OpenBuild', 'Starknet', 'all'].",
        }),
        period: z.string({
            description: "The time period to consider. Valid options are ['week', 'month']."
        }),
    }),
    execute: countRecentContributors,
});

const rankEcosystemsTool = tool({
    name: "rankEcosystems",
    description: "Rank ecosystems based on some criteria.",
    parameters: z.object({}),
    execute: rankEcosystems,
});

const rankRepositoriesTool = tool({
    name: "rankRepositories",
    description: "Rank repositories within a specified ecosystem.",
    parameters: z.object({
        ecosystem: z.string({
            description: "The ecosystem to query. Valid options are ['NEAR', 'OpenBuild', 'Starknet', 'all'].",
        }),
    }),
    execute: rankRepositories,
});

const rankContributorsTool = tool({
    name: "rankContributors",
    description: "Rank contributors within a specified ecosystem.",
    parameters: z.object({
        ecosystem: z.string({
            description: "The ecosystem to query. Valid options are ['NEAR', 'OpenBuild', 'Starknet', 'all'].",
        }),
    }),
    execute: rankContributors,
});

const llm = openai({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
    model: "gpt-4o-mini",
});

const tools = [
    countRepositoriesTool,
    countContributorsTool,
    countEcosystemAmountTool,
    countRecentContributorsTool,
    rankEcosystemsTool,
    rankRepositoriesTool,
    rankContributorsTool,
];

const myAgent = agent({ llm, tools });

async function chatWithAgent(query: string) {
    // console.log(`QUERY: ${query}`);
    // const stream = myAgent.runStream(query);
    // let response = "";
    // for await (const event of stream) {
    //     if (agentInputEvent.include(event)) {
    //         console.log("LLM INPUT:", event.data.input);
    //     } else if (agentOutputEvent.include(event)) {
    //         console.log("LLM OUTPUT:", event.data.response);
    //     } else if (agentToolCallResultEvent.include(event)) {
    //         console.log("TOOL CALL NAME:", event.data.toolName, ', KWARGS:', event.data.toolKwargs, ', RESULT:', event.data.toolOutput.result);
    //     } else if (agentStreamEvent.include(event)) {
    //         response += event.data.delta;
    //     }
    // }
    // console.log(`RESPONSE: ${response}`);
    const result = await myAgent.run(query);
    return result.data;
}

export { chatWithAgent };
