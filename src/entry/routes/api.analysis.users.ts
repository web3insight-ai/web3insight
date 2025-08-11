import { json, type ActionFunctionArgs } from "@remix-run/node";
import HttpClient from "@/clients/http/HttpClient";
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

    // Get user authentication
    const userResult = await fetchCurrentUser(request);
    
    if (!userResult.success) {
      return json(
        { success: false, code: "UNAUTHORIZED", message: "Authentication required", data: null },
        { status: 401 },
      );
    }

    // Get user token from session
    const session = await getSession(request);
    const userToken = session.get("userToken");
    
    if (!userToken) {
      return json(
        { success: false, code: "UNAUTHORIZED", message: "User token not found", data: null },
        { status: 401 },
      );
    }

    const baseUrl = getVar("DATA_API_URL");

    // Create HTTP client with user's token (not server token)
    // Note: Don't use normalizeRestfulResponse since the analysis API returns raw data
    const userHttpClient = new HttpClient({
      baseUrl,
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });


    // Make server-side request to external API with user authentication
    const rawResponse = await userHttpClient.post("/v1/custom/analysis/users", requestData);
    

    // The external API can return data in different structures
    let response;
    
    // Check if rawResponse is the direct data with id field 
    if (rawResponse && typeof rawResponse === 'object' && 'id' in rawResponse && 'users' in rawResponse) {
      // Direct response format - use rawResponse as the data
      response = {
        success: true,
        code: 201,
        message: "Analysis started successfully",
        data: rawResponse,
      };
    } else if (rawResponse?.success && rawResponse.extra && rawResponse.extra.id) {
      // Success case with data in extra field
      response = {
        success: true,
        code: 201,
        message: "Analysis started successfully",
        data: rawResponse.extra,
      };
    } else if (rawResponse?.success && rawResponse.data && rawResponse.data.id) {
      // Success case with data in data field
      response = {
        success: true,
        code: 201,
        message: "Analysis started successfully",
        data: rawResponse.data,
      };
    } else if (rawResponse && rawResponse.success === false) {
      // Error case: already in our expected format
      response = rawResponse;
    } else {
      // Unknown response format - log details for debugging
      
      response = {
        success: false,
        code: "UNKNOWN_RESPONSE",
        message: "Unexpected response format from external API",
        data: null,
      };
    }


    // Return the wrapped response
    return json(response, { status: response.success ? 200 : 400 });
    
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
