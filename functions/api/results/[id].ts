interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;

    if (!id || id.length !== 8) {
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await context.env.DB.prepare(
      `SELECT id, survival_score, reproduction_score, intensity, dominant_axis, result_type, gender, created_at
       FROM results WHERE id = ?`
    )
      .bind(id)
      .first();

    if (!result) {
      return Response.json({ error: "Result not found" }, { status: 404 });
    }

    return Response.json(result, {
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
