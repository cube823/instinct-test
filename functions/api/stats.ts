interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const [countResult, distributionResult] = await Promise.all([
      context.env.DB.prepare("SELECT COUNT(*) as total FROM results").first(),
      context.env.DB.prepare(
        "SELECT result_type, COUNT(*) as count FROM results GROUP BY result_type"
      ).all(),
    ]);

    const total = (countResult?.total as number) || 0;
    const distribution: Record<string, number> = {};

    if (distributionResult.results) {
      for (const row of distributionResult.results) {
        distribution[row.result_type as string] = row.count as number;
      }
    }

    return Response.json(
      { total, distribution },
      {
        headers: {
          "Cache-Control": "public, max-age=60",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
