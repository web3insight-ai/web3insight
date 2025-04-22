import httpClient from "@/utils/http/strapi";

import type { StrapiAuthResponse } from "./typing";

// Auth methods
async function loginUser(identifier: string, password: string): Promise<StrapiAuthResponse> {
  try {
    const response = await httpClient.post('/api/auth/local', {
      identifier,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Strapi login error:', error);
    throw error;
  }
}

async function registerUser(username: string, email: string, password: string): Promise<StrapiAuthResponse> {
  try {
    const response = await httpClient.post('/api/auth/local/register', {
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

async function forgotPassword(email: string): Promise<void> {
  try {
    await httpClient.post('/api/auth/forgot-password', {
      email,
    });
  } catch (error) {
    console.error('Strapi forgot password error:', error);
    throw error;
  }
}

async function resetPassword(code: string, password: string, passwordConfirmation: string): Promise<StrapiAuthResponse> {
  try {
    const response = await httpClient.post('/api/auth/reset-password', {
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

export { loginUser, registerUser, forgotPassword, resetPassword };
