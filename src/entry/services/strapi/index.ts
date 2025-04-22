import httpClient from "@/utils/http/strapi";

export interface StrapiQuery {
  id: number;
  documentId: string;
  query: string;
  keyboard?: string; // Seems like there's a typo in the schema (keyboard vs keyword)
  answer?: string;
  pin: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  user?: {
    id: number;
    documentId: string;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  }
}

// Type for query data
export interface QueryData {
  query: string;
  keyboard?: string;
  pin?: boolean;
  user?: number;
}

// Query methods
export async function fetchUserQueries(userId: number, limit = 10): Promise<StrapiQuery[]> {
  try {
    const url = `/api/queries?filters[user][id][$eq]=${userId}&populate[]=user&sort[]=createdAt:desc&pagination[limit]=${limit}`;
    const response = await httpClient.get(url);

    if (!response.data?.data || !Array.isArray(response.data.data)) {
      return [];
    }

    return response.data.data.filter((query: StrapiQuery) => {
      const queryText = query.query || '';
      return queryText.trim() !== '' && queryText !== 'Untitled query';
    });
  } catch (error) {
    return [];
  }
}

export async function fetchPinnedQueries(): Promise<StrapiQuery[]> {
  try {
    const url = `/api/queries?filters[pin][$eq]=true&populate[]=user&sort[]=createdAt:desc`;
    const response = await httpClient.get(url);

    if (!response.data?.data || !Array.isArray(response.data.data)) {
      return [];
    }

    return response.data.data.filter((query: StrapiQuery) => {
      const queryText = query.query || '';
      return queryText.trim() !== '' && queryText !== 'Untitled query';
    });
  } catch (error) {
    return [];
  }
}

export async function fetchQuery(id: string): Promise<StrapiQuery | null> {
  try {
    const response = await httpClient.get(`/api/queries/${id}`, {
      params: {
        populate: ['user']
      }
    });

    return response.data?.data || null;
  } catch (error) {
    return null;
  }
}

export async function createQuery(
  queryData: {
    query: string;
    keyboard?: string;
    userId?: number
  }
): Promise<StrapiQuery> {
  const data: QueryData = {
    query: queryData.query,
    keyboard: queryData.keyboard,
    pin: false
  };

  if (queryData.userId) {
    data.user = queryData.userId;
  }

  const response = await httpClient.post(`/api/queries`, { data });
  return response.data.data;
}

export async function updateQueryAnswer(id: string, answer: string): Promise<StrapiQuery> {
  const response = await httpClient.put(`/api/queries/${id}`, {
    data: { answer }
  });

  return response.data.data;
}
