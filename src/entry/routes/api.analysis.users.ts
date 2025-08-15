import { json, type ActionFunctionArgs } from "@remix-run/node";
import { getVar } from "@/utils/env";
import { getSession } from "~/auth/helper/server-only";
import { fetchCurrentUser } from "~/auth/repository";
import type { AnalysisRequest } from "~/profile-analysis/typing";
import { createServerAction, createPreflightAction } from "../utils";

export const action = createServerAction("POST", async ({ request }: ActionFunctionArgs) => {
  
  try {
    // Parse request data
    const requestData = await request.json() as AnalysisRequest;
    
    // Validate request data
    if (!requestData.intent) {
      return json(
        { success: false, code: "INVALID_REQUEST", message: "Intent is required", data: null },
        { status: 400 },
      );
    }

    // For profile analysis, try user authentication first, fallback to server token
    const userResult = await fetchCurrentUser(request);
    let authToken: string | undefined;

    if (userResult.success) {
      // Use user token if authenticated
      const session = await getSession(request);
      authToken = session.get("userToken");
    }

    // Fallback to server token for public profile analysis
    if (!authToken) {
      authToken = getVar("DATA_API_TOKEN");
    }

    if (!authToken) {
      return json(
        { success: false, code: "UNAUTHORIZED", message: "No authentication token available", data: null },
        { status: 401 },
      );
    }

    const baseUrl = getVar("DATA_API_URL");

    const apiUrl = `${baseUrl}/v1/custom/analysis/users`;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      return json({
        success: false,
        code: `HTTP_${response.status}`,
        message: `HTTP ${response.status}: ${response.statusText}`,
        data: null,
      }, { status: response.status });
    }
    
    const rawResponse = await response.json();
    
    return json(rawResponse, { status: 200 });
    
  } catch (error) {
    
    return json(
      { 
        success: false, 
        code: "API_ERROR", 
        message: error instanceof Error ? error.message : "Unknown error",
        data: null, 
      },
      { status: 500 },
    );
  }
});

// Handle preflight requests for CORS
export const loader = createPreflightAction();
