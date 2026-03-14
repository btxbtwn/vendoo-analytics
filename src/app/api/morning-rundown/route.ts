import { buildMorningDashboardRundown } from "../../../lib/morning-rundown";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const responseFormat = url.searchParams.get("format") === "json" ? "json" : "text";

  try {
    const report = await buildMorningDashboardRundown();

    if (responseFormat === "json") {
      return Response.json(report, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    return new Response(report.summary, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown morning rundown error";

    if (responseFormat === "json") {
      return Response.json(
        { error: message },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return new Response(`Morning dashboard rundown unavailable: ${message}`, {
      status: 500,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}
