import type { DataValue, ResponseResult } from "@/types";
import httpClient from "~/api/repository/client";
import { resolveEventDetail } from "../helper";
import type { EventReport, EventInsight } from "../typing";

type EventInsightsResponse = {
  list: EventInsight[];
  total: number;
};

async function fetchPublicEventInsights(params?: {
  skip?: number;
  take?: number;
  intent?: string;
  direction?: 'asc' | 'desc';
}): Promise<ResponseResult<EventInsight[]>> {
  try {
    const queryParams = {
      skip: params?.skip ?? 0,
      take: params?.take ?? 10,
      intent: params?.intent ?? 'hackathon',
      direction: params?.direction ?? 'asc',
    };

    const response = await httpClient.get('/v1/custom/analysis/users/public', {
      params: queryParams,
    });

    if (response.success && response.data) {
      const data = response.data as EventInsightsResponse;
      return {
        ...response,
        data: data.list || [],
        extra: {
          ...response.extra,
          total: data.total || 0,
        },
      };
    }

    return {
      success: false,
      code: response.code || "500",
      message: response.message || "Failed to fetch event insights",
      data: [],
    };
  } catch (error) {
    console.error("[Event Repository] fetchPublicEventInsights error:", error);
    return {
      success: false,
      code: "500",
      message: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

export { fetchPublicEventInsights };

async function fetchPublicEventDetail(id: number | string): Promise<ResponseResult<EventReport>> {
  try {
    const response = await httpClient.get(`/v1/custom/analysis/users/${id}`);

    if (response.success && response.data) {
      const eventReport = resolveEventDetail(response.data as Record<string, DataValue>);

      return {
        ...response,
        data: eventReport,
      };
    }

    return {
      success: false,
      code: response.code || "500",
      message: response.message || "Failed to fetch event detail",
      data: {} as EventReport,
    };
  } catch (error) {
    console.error("[Event Repository] fetchPublicEventDetail error:", error);
    return {
      success: false,
      code: "500",
      message: error instanceof Error ? error.message : "Unknown error",
      data: {} as EventReport,
    };
  }
}

export { fetchPublicEventDetail };
