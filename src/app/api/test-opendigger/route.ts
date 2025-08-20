import { fetchRepoOpenrank } from "~/opendigger/repository";

export async function GET() {
  try {
    const result = await fetchRepoOpenrank("bitcoin/bitcoin");

    return Response.json({
      success: true,
      message: "OpenDigger test completed",
      data: result,
    });
  } catch (error) {
    console.error("OpenDigger test error:", error);

    return Response.json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error: error,
    }, { status: 500 });
  }
}
