import { questions } from "../data/questions";
import type { Intensity } from "../data/results";

export interface Scores {
  survival: number;      // 10-50
  reproduction: number;  // 10-50
}

export interface TestResult {
  scores: Scores;
  intensity: Intensity;
  dominantAxis: "survival" | "reproduction" | "balanced";
}

/**
 * 답변 데이터를 받아서 테스트 결과를 계산합니다.
 * @param answers - questionId를 키로 하고 점수(1-5)를 값으로 하는 객체
 * @returns 점수, 강도, 우세 축을 포함한 테스트 결과
 */
export function getResult(answers: Record<string, number>): TestResult {
  let survivalScore = 0;
  let reproductionScore = 0;

  // 각 질문에 대한 답변을 축별로 합산
  questions.forEach((question) => {
    const answer = answers[question.id];
    if (answer === undefined) return;

    // yesno 타입: yes=5, no=1로 변환 (이미 변환되어 전달됨)
    // scale 타입: 1-5 그대로 사용
    const score = answer;

    if (question.axis === "survival") {
      survivalScore += score;
    } else {
      reproductionScore += score;
    }
  });

  const scores: Scores = {
    survival: survivalScore,
    reproduction: reproductionScore
  };

  // 차이 계산
  const difference = Math.abs(survivalScore - reproductionScore);

  // 우세 축 결정
  let dominantAxis: "survival" | "reproduction" | "balanced";
  if (survivalScore > reproductionScore) {
    dominantAxis = "survival";
  } else if (reproductionScore > survivalScore) {
    dominantAxis = "reproduction";
  } else {
    dominantAxis = "balanced";
  }

  // 강도 결정
  let intensity: Intensity;
  const dominantScore = Math.max(survivalScore, reproductionScore);

  if (difference <= 4) {
    // 차이 0~4: 균형형
    intensity = "balanced";
    dominantAxis = "balanced";
  } else if (difference >= 5 && difference <= 9) {
    // 차이 5~9: 반반형
    intensity = "half";
  } else if (difference >= 15 && dominantScore >= 45) {
    // 차이 15+ & 우세축 45+: 미친
    intensity = "crazy";
  } else if (difference >= 10 && dominantScore >= 35) {
    // 차이 10+ & 우세축 35+: 찐
    intensity = "real";
  } else if (difference >= 10) {
    // 차이 10+ but 우세축 35 미만: 반반으로 분류
    intensity = "half";
  } else {
    // 기본값 (이론상 도달 불가)
    intensity = "half";
  }

  return {
    scores,
    intensity,
    dominantAxis
  };
}
