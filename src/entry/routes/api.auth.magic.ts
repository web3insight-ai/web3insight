import { json, LoaderFunction } from "@remix-run/node";
import { fetchMagic } from "~/auth/repository";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const result = await fetchMagic(request);
    
    if (!result.success) {
      return json(
        { error: result.message || "Failed to fetch magic string" },
        { status: parseInt(result.code) || 500 },
      );
    }
    
    return json(result.data);
  } catch (error) {
    console.error("Magic API error:", error);
    return json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
