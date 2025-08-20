import { fetchMagic } from "~/auth/repository";

export async function GET(request: Request) {
  try {
    const result = await fetchMagic(request);

    if (!result.success) {
      return Response.json(
        { error: result.message || "Failed to fetch magic string" },
        { status: parseInt(result.code) || 500 },
      );
    }

    return Response.json(result.data);
  } catch (error) {
    console.error("Magic API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
