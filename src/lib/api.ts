const API_BASE = "/api";

export interface SaveResultPayload {
  survival_score: number;
  reproduction_score: number;
  intensity: string;
  dominant_axis: string;
  result_type: string;
  gender: string;
  answers?: Record<string, number>;
  ref_id?: string;
}

export interface SavedResult {
  id: string;
  survival_score: number;
  reproduction_score: number;
  intensity: string;
  dominant_axis: string;
  result_type: string;
  gender: string;
  created_at: string;
}

export interface Stats {
  total: number;
  distribution: Record<string, number>;
}

export async function saveResult(
  payload: SaveResultPayload
): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getResult(id: string): Promise<SavedResult | null> {
  try {
    const res = await fetch(`${API_BASE}/results/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getStats(): Promise<Stats | null> {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
