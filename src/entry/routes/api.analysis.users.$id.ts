import { json, type LoaderFunctionArgs } from "@remix-run/node";
import HttpClient from "@/clients/http/HttpClient";
import { getVar } from "@/utils/env";
import { getSession } from "~/auth/helper/server-only";
import { fetchCurrentUser } from "~/auth/repository";
import { createServerAction, createPreflightAction } from "../utils";

export const loader = createServerAction("GET", async ({ params, request }: LoaderFunctionArgs) => {
  try {
    // Get analysis ID from URL params
    const analysisId = params.id;
    
    if (!analysisId) {
      return json(
        { success: false, code: "INVALID_REQUEST", message: "Analysis ID is required", data: null },
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

    // Create HTTP client with user's token (not server token)  
    // Note: Don't use normalizeRestfulResponse since the analysis API returns raw data
    const userHttpClient = new HttpClient({
      baseUrl: getVar("DATA_API_URL"),
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    // Make server-side request to external API to get analysis results
    const rawResponse = await userHttpClient.get(`/v1/custom/analysis/users/${analysisId}`);
    

    // The external API can return data in different structures
    let response;
    
    // Check if rawResponse is the direct data with id field 
    if (rawResponse && typeof rawResponse === 'object' && 'id' in rawResponse && ('github' in rawResponse || 'data' in rawResponse || 'ai' in rawResponse)) {
      // Direct response format - use rawResponse as the data
      response = {
        success: true,
        code: 200,
        message: "Analysis data retrieved successfully",
        data: rawResponse,
      };
    } else if (rawResponse?.success && rawResponse.extra && rawResponse.extra.id) {
      // Success case with data in extra field
      response = {
        success: true,
        code: 200,
        message: "Analysis data retrieved successfully",
        data: rawResponse.extra,
      };
    } else if (rawResponse?.success && rawResponse.data && rawResponse.data.id) {
      // Success case with data in data field
      response = {
        success: true,
        code: 200,
        message: "Analysis data retrieved successfully",
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
export const action = createPreflightAction();
