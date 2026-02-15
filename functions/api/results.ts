interface Env {
  DB: D1Database;
}

const VALID_INTENSITIES = ["crazy", "real", "half", "balanced"] as const;
const VALID_AXES = ["survival", "reproduction", "balanced"] as const;
const VALID_RESULT_TYPES = [
  "crazySurvival",
  "realSurvival",
  "crazyReproduction",
  "realReproduction",
  "half",
  "balanced",
] as const;
const VALID_GENDERS = ["male", "female"] as const;

function generateId(length = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json<{
      survival_score: number;
      reproduction_score: number;
      intensity: string;
      dominant_axis: string;
      result_type: string;
      gender: string;
      answers?: Record<string, number>;
    }>();

    // Validation
    if (
      typeof body.survival_score !== "number" ||
      body.survival_score < 10 ||
      body.survival_score > 50
    ) {
      return Response.json(
        { error: "survival_score must be 10-50" },
        { status: 400 }
      );
    }
    if (
      typeof body.reproduction_score !== "number" ||
      body.reproduction_score < 10 ||
      body.reproduction_score > 50
    ) {
      return Response.json(
        { error: "reproduction_score must be 10-50" },
        { status: 400 }
      );
    }
    if (!VALID_INTENSITIES.includes(body.intensity as any)) {
      return Response.json({ error: "Invalid intensity" }, { status: 400 });
    }
    if (!VALID_AXES.includes(body.dominant_axis as any)) {
      return Response.json({ error: "Invalid dominant_axis" }, { status: 400 });
    }
    if (!VALID_RESULT_TYPES.includes(body.result_type as any)) {
      return Response.json({ error: "Invalid result_type" }, { status: 400 });
    }
    if (!VALID_GENDERS.includes(body.gender as any)) {
      return Response.json({ error: "Invalid gender" }, { status: 400 });
    }

    const id = generateId();
    const userAgent = context.request.headers.get("User-Agent") || "";

    await context.env.DB.prepare(
      `INSERT INTO results (id, survival_score, reproduction_score, intensity, dominant_axis, result_type, gender, answers, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        body.survival_score,
        body.reproduction_score,
        body.intensity,
        body.dominant_axis,
        body.result_type,
        body.gender,
        body.answers ? JSON.stringify(body.answers) : null,
        userAgent
      )
      .run();

    return Response.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Error saving result:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
