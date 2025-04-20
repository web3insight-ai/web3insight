import axios from 'axios';

// Create an axios instance for Strapi API
const strapiApi = axios.create({
  baseURL: process.env.STRAPI_API_URL || 'http://localhost:1337',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add API token to requests if available
if (process.env.STRAPI_API_TOKEN) {
  strapiApi.defaults.headers.common['Authorization'] = `Bearer ${process.env.STRAPI_API_TOKEN}`;
}

// Authentication types
export interface StrapiAuthResponse {
  jwt: string;
  user: StrapiUser;
}

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

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

// Auth methods
export async function loginUser(identifier: string, password: string): Promise<StrapiAuthResponse> {
  try {
    const response = await strapiApi.post('/api/auth/local', {
      identifier,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Strapi login error:', error);
    throw error;
  }
}

export async function registerUser(username: string, email: string, password: string): Promise<StrapiAuthResponse> {
  try {
    const response = await strapiApi.post('/api/auth/local/register', {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Strapi registration error:', error);
    throw error;
  }
}

export async function forgotPassword(email: string): Promise<void> {
  try {
    await strapiApi.post('/api/auth/forgot-password', {
      email,
    });
  } catch (error) {
    console.error('Strapi forgot password error:', error);
    throw error;
  }
}

export async function resetPassword(code: string, password: string, passwordConfirmation: string): Promise<StrapiAuthResponse> {
  try {
    const response = await strapiApi.post('/api/auth/reset-password', {
      code,
      password,
      passwordConfirmation,
    });
    return response.data;
  } catch (error) {
    console.error('Strapi reset password error:', error);
    throw error;
  }
}

// Query methods
export async function fetchUserQueries(userId: number, limit = 10): Promise<StrapiQuery[]> {
  try {
    const url = `/api/queries?filters[user][id][$eq]=${userId}&populate[]=user&sort[]=createdAt:desc&pagination[limit]=${limit}`;
    const response = await strapiApi.get(url);

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
    const response = await strapiApi.get(url);

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
    const response = await strapiApi.get(`/api/queries/${id}`, {
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

  const response = await strapiApi.post(`/api/queries`, { data });
  return response.data.data;
}

export async function updateQueryAnswer(id: string, answer: string): Promise<StrapiQuery> {
  const response = await strapiApi.put(`/api/queries/${id}`, {
    data: { answer }
  });

  return response.data.data;
}