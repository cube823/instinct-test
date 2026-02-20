export type QuestionType = "scale" | "yesno";

export interface Question {
  id: string;
  axis: "survival" | "reproduction";
  text: string;
  type: QuestionType;
}

// 실제 테스트 출제 순서대로 배열 (축이 교차되도록)
export const questions: Question[] = [
  {
    id: "S3",
    axis: "survival",
    text: "좀비 아포칼립스가 오면 나는 끝까지 살아남을 자신이 있다",
    type: "yesno",
  },
  {
    id: "B1",
    axis: "reproduction",
    text: "외출 전 거울을 안 보면 하루가 불안하다",
    type: "scale",
  },
  {
    id: "S1",
    axis: "survival",
    text: "통장에 비상금이 없으면 불안해서 잠이 안 온다",
    type: "scale",
  },
  {
    id: "B2",
    axis: "reproduction",
    text: "좋아하는 사람 앞에서 나도 모르게 다른 사람이 된다",
    type: "scale",
  },
  {
    id: "S6",
    axis: "survival",
    text: "위험해 보이는 골목길은 돌아가더라도 피한다",
    type: "scale",
  },
  {
    id: "B3",
    axis: "reproduction",
    text: "SNS에 올린 사진 반응이 별로면 슬쩍 삭제한 적이 있다",
    type: "yesno",
  },
  {
    id: "S2",
    axis: "survival",
    text: "길을 걸을 때 무의식적으로 도망칠 경로를 파악하고 있다",
    type: "scale",
  },
  {
    id: "B4",
    axis: "reproduction",
    text: "매력적인 사람이 옆에 있으면 나도 모르게 자세를 고쳐 앉는다",
    type: "scale",
  },
  {
    id: "S4",
    axis: "survival",
    text: "먹고 싶은 것보다 몸에 좋은 것을 먼저 고른다",
    type: "scale",
  },
  {
    id: "B6",
    axis: "reproduction",
    text: '"매력 있다"는 말 한마디면 일주일은 기분 좋게 산다',
    type: "scale",
  },
  {
    id: "S5",
    axis: "survival",
    text: "경쟁에서 지면 그날 밤 잠이 안 온다",
    type: "scale",
  },
  {
    id: "B5",
    axis: "reproduction",
    text: "향수, 옷, 헤어 등 외모 관리에 월 10만 원 이상 쓴다",
    type: "yesno",
  },
  {
    id: "S8",
    axis: "survival",
    text: "혼자서도 충분히 잘 살 수 있다는 확신이 있다",
    type: "scale",
  },
  {
    id: "B9",
    axis: "reproduction",
    text: "좋아하는 사람의 이성 친구가 은근히 신경 쓰인다",
    type: "scale",
  },
  {
    id: "S9",
    axis: "survival",
    text: "10년 뒤의 안정이 오늘의 즐거움보다 중요하다",
    type: "scale",
  },
  {
    id: "B7",
    axis: "reproduction",
    text: "연애 상대의 외모가 신체보다 더 중요하다",
    type: "yesno",
  },
  {
    id: "S7",
    axis: "survival",
    text: "여행 전에 보험, 비상약을 미리 다 챙긴다",
    type: "yesno",
  },
  {
    id: "B8",
    axis: "reproduction",
    text: "사람들 사이에서 주목받고 싶은 욕구가 있다",
    type: "scale",
  },
  {
    id: "S10",
    axis: "survival",
    text: "세상이 망해도 나만은 살아남을 계획이 있다",
    type: "scale",
  },
  {
    id: "B10",
    axis: "reproduction",
    text: "나는 언젠가 꽤 괜찮은 부모가 될 자신이 있다",
    type: "scale",
  },
];
