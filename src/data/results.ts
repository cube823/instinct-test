export type Intensity = "crazy" | "real" | "half" | "balanced";
export type Gender = "male" | "female";

export interface ResultType {
  intensity: Intensity;
  dominantAxis: "survival" | "reproduction" | "balanced";
  label: (gender: Gender) => string;
  subtitle: string;
  traits: string[];
  loveStyle: string[];
  quote: string;
}

export const resultTypes: Record<string, ResultType> = {
  crazySurvival: {
    intensity: "crazy",
    dominantAxis: "survival",
    label: (gender: Gender) => `미친생존${gender === "male" ? "남" : "녀"}`,
    subtitle: "핵전쟁이 나도 마지막까지 살아남을 사람",
    traits: [
      "통장 잔고 = 심장 박동수",
      "건강검진 예약은 새해 첫 일",
      '"위험해 보이는데?" 입에 붙어 있음',
      "무인도에서 3일 안에 집 짓는 사람",
      "계획 없는 여행은 조난"
    ],
    loveStyle: [
      '"먼저 각자 경제적으로 독립하고 그다음에 만나자"',
      "감정보다 안정, 설렘보다 신뢰",
      "연애는 하고 싶지만 생존 시스템 흔들 정도는 NO"
    ],
    quote: "사랑으로 밥을 먹을 수 있어?"
  },
  realSurvival: {
    intensity: "real",
    dominantAxis: "survival",
    label: (gender: Gender) => `찐생존${gender === "male" ? "남" : "녀"}`,
    subtitle: "조용하지만 확실한 서바이버",
    traits: [
      "적당히 아끼고 적당히 조심, 근데 다 계산된 거",
      "보험 3개 이상 가입, 남한테 자랑 안 함",
      '"일단 안전한 선택지"가 기본 세팅',
      "모험은 가끔 하지만 안전장치 확인 후",
      "사람은 좋아하는데 결국 혼자가 편함"
    ],
    loveStyle: [
      "안정적인 관계 원함, 롤러코스터 연애 사절",
      "느리지만 한번 믿으면 끝까지",
      '"너 보험 있어?" 물어본 적 있음'
    ],
    quote: "좋아는 하는데... 일단 내 할 일 먼저 하고"
  },
  crazyReproduction: {
    intensity: "crazy",
    dominantAxis: "reproduction",
    label: (gender: Gender) => `미친번식${gender === "male" ? "남" : "녀"}`,
    subtitle: "존재 자체가 페로몬, 걸어다니는 끌림 본능",
    traits: [
      "외출 준비 최소 1시간, 향수는 무기",
      "SNS 프사 교체 주기 = 계절마다",
      "매력적인 사람 3m 진입시 자동 매력 모드 ON",
      '"좋아요" 알림이 도파민 공급원',
      "사람들 사이에서 빛나야 살아있는 느낌"
    ],
    loveStyle: [
      "항상 누군가를 좋아하고 있거나 찾는 중",
      "밀당은 본능, 눈맞춤은 기술",
      "연애 감정이 인생 에너지 80%"
    ],
    quote: "사는 게 뭐야, 사랑해야 사는 거지"
  },
  realReproduction: {
    intensity: "real",
    dominantAxis: "reproduction",
    label: (gender: Gender) => `찐번식${gender === "male" ? "남" : "녀"}`,
    subtitle: "자연스럽게 사람을 끌어모으는 인간 자석",
    traits: [
      "의식적으로 안 꾸미는데 신경은 씀",
      "사람 만나는 거 좋아하고 관계 잘 유지",
      '"너 매력 있다" 한마디에 일주일 충전',
      "상대 외모도 보지만 인정하기 싫어함",
      "좋아하는 사람 생기면 생활 패턴 변함"
    ],
    loveStyle: [
      "연애 중요하지만 인생 전부 걸진 않음",
      "자연스러운 만남 선호, 억지 소개팅 어색",
      "한번 빠지면 깊이 빠지는데 티 안 내려 노력"
    ],
    quote: "관심 없는 척하는데... 아 근데 그 사람 인스타 뭐지?"
  },
  half: {
    intensity: "half",
    dominantAxis: "balanced",
    label: (gender: Gender) => `반반형 ${gender === "male" ? "남" : "녀"}`,
    subtitle: "상황에 따라 생존 모드 ↔ 번식 모드 전환하는 하이브리드",
    traits: [
      "평소엔 현실적인데 좋아하는 사람 앞에서 갑자기 로맨티스트",
      "돈 아끼다가도 데이트때는 지갑 열림",
      "혼자도 좋고 같이도 좋음, 선택하라면 고민 5시간",
      "양쪽 유형 친구한테 다 공감",
      '"나 이거 맞는 거 같기도 하고 아닌 거 같기도"'
    ],
    loveStyle: [
      "연애와 개인 생활 밸런스 중시",
      "때로는 생존형처럼 이성적, 때로는 번식형처럼 감성적",
      "상대 유형에 따라 맞춰가는 카멜레온"
    ],
    quote: "둘 다 중요하지 않아? 왜 하나만 골라"
  },
  balanced: {
    intensity: "balanced",
    dominantAxis: "balanced",
    label: (gender: Gender) => `균형형 ${gender === "male" ? "남" : "녀"}`,
    subtitle: "생존과 번식의 완벽 밸런스, 진화가 설계한 최적의 인간",
    traits: [
      "생존과 번식 본능이 거의 정확히 50:50",
      "현실적이면서 로맨틱, 조심스러우면서 매력적",
      "어떤 상황에서든 적응 가능한 올라운더",
      '"너는 좀 특이하다"는 말 자주 들음',
      "양쪽 극단 유형들이 부러워하는 타입"
    ],
    loveStyle: [
      "이상적인 파트너상이 명확하면서 유연",
      "연애도 즐기고 개인 성장도 놓치지 않음",
      "의외로 가장 오래가는 관계를 만듦"
    ],
    quote: "나? 그냥 적당히 다 하는 편인데?"
  }
};
