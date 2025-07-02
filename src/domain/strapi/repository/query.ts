import type { DataValue, ResponseResult } from "@/types";
import { isArray } from "@/utils";
import { generateSuccessResponse } from "@/clients/http";

import type { StrapiQuery, QueryData } from "../typing";
import httpClient from "./client";

async function fetchQueryList(params: Record<string, DataValue>): Promise<ResponseResult<StrapiQuery[]>> {
  try {
    const { data, ...others } = await httpClient.get("/queries", { params });

    const resolved: StrapiQuery[] = isArray(data?.data) ?
      data.data.filter(({ query }: StrapiQuery) => {
        const queryText = query || '';
        return queryText.trim() !== '' && queryText !== 'Untitled query';
      }) :
      [];

    return { ...others, data: resolved };
  } catch (error) {
    return generateSuccessResponse([]);
  }
}

async function fetchQuery(
  id: string,
  params?: Record<string, DataValue>,
): Promise<ResponseResult<StrapiQuery | null>> {
  try {
    const { data, ...others } = await httpClient.get(`/queries/${id}`, { params });

    return { ...others, data: data?.data ?? null };
  } catch (error) {
    return generateSuccessResponse(null);
  }
}

async function createQuery(
  { query, keyboard }: {
    query: string;
    keyboard?: string;
  },
): Promise<ResponseResult<StrapiQuery>> {
  const data: QueryData = { query, keyboard, pin: false };

  const { data: strapiData, ...others } = await httpClient.post(`/queries`, { data });

  return { ...others, data: strapiData?.data };
}

async function updateQuery(
  id: string,
  data?: {
    answer?: string;
    keyboard?: string;
  },
): Promise<ResponseResult<StrapiQuery>> {
  const { data: strapiData, ...others } = await httpClient.put(`/queries/${id}`, data);

  return { ...others, data: strapiData?.data };
}


async function fetchPinnedQueries(): Promise<ResponseResult<StrapiQuery[]>> {
  return fetchQueryList({
    'filters[pin][$eq]': true,
    'populate[]': 'user',
    'sort[]': 'createdAt:desc',
  });
}

export { fetchQueryList, fetchQuery, createQuery, updateQuery, fetchPinnedQueries };
