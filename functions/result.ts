// Dynamic OG metadata injection for shared result pages
// Intercepts /result?id=X requests and injects appropriate OG meta tags

interface Env {
  DB: D1Database;
}

// Result type label mapping (inlined since Functions can't import from src/)
const RESULT_LABELS: Record<string, { male: string; female: string; subtitle: string }> = {
  crazySurvival: {
    male: "미친생존남",
    female: "미친생존녀",
    subtitle: "핵전쟁이 나도 마지막까지 살아남을 사람",
  },
  realSurvival: {
    male: "찐생존남",
    female: "찐생존녀",
    subtitle: "조용하지만 확실한 서바이버",
  },
  crazyReproduction: {
    male: "미친번식남",
    female: "미친번식녀",
    subtitle: "존재 자체가 페로몬, 걸어다니는 끌림 본능",
  },
  realReproduction: {
    male: "찐번식남",
    female: "찐번식녀",
    subtitle: "자연스럽게 사람을 끌어모으는 인간 자석",
  },
  half: {
    male: "반반형 남",
    female: "반반형 녀",
    subtitle: "생존 모드 ↔ 번식 모드 전환하는 하이브리드",
  },
  balanced: {
    male: "균형형 남",
    female: "균형형 녀",
    subtitle: "생존과 번식의 완벽 밸런스",
  },
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const resultId = url.searchParams.get("id");

  // No ID = serve normally with default OG
  if (!resultId) {
    return context.next();
  }

  // Fetch result from D1
  let resultData: {
    result_type: string;
    gender: string;
    survival_score: number;
    reproduction_score: number;
  } | null = null;

  try {
    const stmt = context.env.DB.prepare(
      "SELECT result_type, gender, survival_score, reproduction_score FROM results WHERE id = ?"
    ).bind(resultId);
    resultData = await stmt.first();
  } catch {
    // DB error - serve with default OG
    return context.next();
  }

  if (!resultData) {
    return context.next();
  }

  const typeInfo = RESULT_LABELS[resultData.result_type];
  if (!typeInfo) {
    return context.next();
  }

  const gender = resultData.gender as "male" | "female";
  const typeName = typeInfo[gender] || typeInfo.male;
  const ogTitle = `나의 본능 유형: ${typeName}`;
  const ogDescription = `${typeInfo.subtitle} | 생존 ${resultData.survival_score}점 / 번식 ${resultData.reproduction_score}점`;
  const ogImage = `${url.origin}/og/${resultData.result_type}-${resultData.gender}.png`;
  const ogUrl = `${url.origin}/result?id=${resultId}`;

  // Get the static HTML from Next.js
  const response = await context.next();

  // Use HTMLRewriter to inject dynamic OG meta tags
  return new HTMLRewriter()
    .on('meta[property="og:title"]', {
      element(element) {
        element.setAttribute("content", ogTitle);
      },
    })
    .on('meta[property="og:description"]', {
      element(element) {
        element.setAttribute("content", ogDescription);
      },
    })
    .on('meta[property="og:image"]', {
      element(element) {
        element.setAttribute("content", ogImage);
      },
    })
    .on('meta[property="og:url"]', {
      element(element) {
        element.setAttribute("content", ogUrl);
      },
    })
    .on('meta[name="twitter:title"]', {
      element(element) {
        element.setAttribute("content", ogTitle);
      },
    })
    .on('meta[name="twitter:description"]', {
      element(element) {
        element.setAttribute("content", ogDescription);
      },
    })
    .on('meta[name="twitter:image"]', {
      element(element) {
        element.setAttribute("content", ogImage);
      },
    })
    .on("title", {
      element(element) {
        element.setInnerContent(`${typeName} - 본능 테스트`);
      },
    })
    .transform(response);
};
