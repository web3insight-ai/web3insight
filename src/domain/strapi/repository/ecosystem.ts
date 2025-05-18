import type { DataValue, ResponseResult } from "@/types";
import { generateSuccessResponse } from "@/clients/http";

import httpClient from "./client";

async function fetchEcosystem(keyword?: string): Promise<ResponseResult<Record<string, DataValue> | null>> {
  if (!keyword) {
    return generateSuccessResponse(null);
  }

  let found: Record<string, DataValue> | null;

  try {
    const { success, data: resData } = await httpClient.get(
      "/api/ecosystems",
      {
        params: {
          'filters[name][$eqi]': keyword,
          'populate[logo][fields][0]': 'url',
        },
      },
    );
    const data = resData?.data;

    // Check if we have data
    if (!success || !data || data.length === 0) {
      found = null;
    } else {
      // Extract first result and transform to expected format
      const ecosystemData = data[0];

      // Handle logo URL based on response structure
      const logoUrl = ecosystemData.attributes?.logo?.data?.attributes?.url || ecosystemData.logo?.url || "";

      // Map Strapi ecosystem data to the project data format expected by the UI
      found = {
        id: ecosystemData.id,
        documentId: ecosystemData.documentId,
        name: ecosystemData.attributes?.name || ecosystemData.name,
        description: ecosystemData.attributes?.description || ecosystemData.description,
        website: ecosystemData.attributes?.website || ecosystemData.website,
        type: "ecosystem", // Set type to ecosystem
        logo: logoUrl, // Use the extracted logo URL
        coreContributors: ecosystemData.attributes?.coreContributors || ecosystemData.coreContributors || [],
        coreRepos: ecosystemData.attributes?.coreRepos || ecosystemData.coreRepos || [],
      };
    }
  } catch (error) {
    console.error("Error fetching ecosystem data from Strapi:", error);
    found = null;
  }

  return generateSuccessResponse(found);
}

export { fetchEcosystem };
