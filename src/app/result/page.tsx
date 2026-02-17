"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { getResult } from "@/lib/scoring";
import type { TestResult } from "@/lib/scoring";
import { resultTypes } from "@/data/results";
import type { Gender, Intensity } from "@/data/results";
import {
  saveResult as apiSaveResult,
  getResult as apiGetResult,
} from "@/lib/api";

// Kakao SDK 타입 선언
declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: {
          objectType: string;
          content: {
            title: string;
            description: string;
            imageUrl: string;
            link: {
              mobileWebUrl: string;
              webUrl: string;
            };
          };
          buttons: Array<{
            title: string;
            link: {
              mobileWebUrl: string;
              webUrl: string;
            };
          }>;
        }) => void;
      };
    };
  }
}

type ResultTypeKey =
  | "crazySurvival"
  | "realSurvival"
  | "crazyReproduction"
  | "realReproduction"
  | "half"
  | "balanced";

function getResultTypeKey(
  intensity: Intensity,
  dominantAxis: string
): ResultTypeKey {
  if (intensity === "balanced") return "balanced";
  if (intensity === "half") return "half";
  if (intensity === "crazy" && dominantAxis === "survival")
    return "crazySurvival";
  if (intensity === "crazy" && dominantAxis === "reproduction")
    return "crazyReproduction";
  if (intensity === "real" && dominantAxis === "survival")
    return "realSurvival";
  if (intensity === "real" && dominantAxis === "reproduction")
    return "realReproduction";
  return "balanced";
}

const compatibilityData: Record<
  ResultTypeKey,
  { extreme?: string; good: string[] }
> = {
  crazySurvival: { extreme: "미친번식", good: ["찐번식", "균형형"] },
  realSurvival: { good: ["찐번식", "균형형"] },
  crazyReproduction: { extreme: "미친생존", good: ["찐생존", "균형형"] },
  realReproduction: { good: ["찐생존", "균형형"] },
  half: { good: ["찐번식", "균형형"] },
  balanced: { good: ["균형형", "모든 유형"] },
};

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sharedId = searchParams.get("id");

    if (sharedId) {
      // 공유 링크로 접속한 경우 → API에서 결과 조회
      apiGetResult(sharedId).then((saved) => {
        if (saved) {
          setResult({
            scores: {
              survival: saved.survival_score,
              reproduction: saved.reproduction_score,
            },
            intensity: saved.intensity as Intensity,
            dominantAxis: saved.dominant_axis as
              | "survival"
              | "reproduction"
              | "balanced",
          });
          setGender(saved.gender as Gender);
          setResultId(saved.id);
          setLoading(false);
        } else {
          // API 실패 → 홈으로
          router.push("/");
        }
      });
      return;
    }

    // 직접 테스트 완료 → sessionStorage에서 결과 계산
    const stored = sessionStorage.getItem("instinct-test-answers");
    if (!stored) {
      router.push("/");
      return;
    }

    try {
      const answers = JSON.parse(stored);
      const testResult = getResult(answers);
      setResult(testResult);

      // 3단계 분석 연출 (각 1초)
      const steps = [
        { step: 0, delay: 0 },
        { step: 1, delay: 1000 },
        { step: 2, delay: 2000 },
      ];

      steps.forEach(({ step, delay }) => {
        setTimeout(() => setAnalyzingStep(step), delay);
      });

      // 3초 후 성별 선택 모달 표시
      setTimeout(() => {
        setLoading(false);
        setShowGenderModal(true);
      }, 3000);
    } catch {
      router.push("/");
    }
  }, [router, searchParams]);

  const handleGenderSelect = async (selectedGender: Gender) => {
    setGender(selectedGender);
    setShowGenderModal(false);

    // API에 결과 저장 (비동기, 실패해도 결과 표시에 영향 없음)
    if (result) {
      const resultTypeKey = getResultTypeKey(
        result.intensity,
        result.dominantAxis
      );

      let answers: Record<string, number> | undefined;
      try {
        const stored = sessionStorage.getItem("instinct-test-answers");
        if (stored) answers = JSON.parse(stored);
      } catch {
        // answers 없이도 저장 가능
      }

      const saved = await apiSaveResult({
        survival_score: result.scores.survival,
        reproduction_score: result.scores.reproduction,
        intensity: result.intensity,
        dominant_axis: result.dominantAxis,
        result_type: resultTypeKey,
        gender: selectedGender,
        answers,
      });

      if (saved) {
        setResultId(saved.id);
        window.history.replaceState(null, "", `/result?id=${saved.id}`);
      }
    }
  };

  const getShareUrl = () => {
    if (resultId) {
      return `${window.location.origin}/result?id=${resultId}`;
    }
    return window.location.origin;
  };

  const handleShare = () => {
    if (!result || !gender) return;

    const resultTypeKey = getResultTypeKey(
      result.intensity,
      result.dominantAxis
    );
    const resultType = resultTypes[resultTypeKey];
    const typeName = resultType.label(gender);
    const shareUrl = getShareUrl();
    const shareText = `나의 본능 유형은 ${typeName}! 🧬\n생존 ${result.scores.survival}점 / 번식 ${result.scores.reproduction}점\n${shareUrl}`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = "instinct-test-result.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("이미지 생성 실패:", error);
    }
  };

  const handleKakaoShare = () => {
    if (!result || !gender) return;

    const resultTypeKey = getResultTypeKey(
      result.intensity,
      result.dominantAxis
    );
    const resultType = resultTypes[resultTypeKey];
    const typeName = resultType.label(gender);
    const shareUrl = getShareUrl();

    if (typeof window !== "undefined" && window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_KEY;
        if (kakaoKey) {
          window.Kakao.init(kakaoKey);
        }
      }

      if (window.Kakao.isInitialized()) {
        window.Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: `나의 본능 유형: ${typeName}`,
            description: `생존 ${result.scores.survival}점 / 번식 ${result.scores.reproduction}점`,
            imageUrl: `${window.location.origin}/og-image.png`,
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
          buttons: [
            {
              title: "나도 테스트하기",
              link: {
                mobileWebUrl: window.location.origin,
                webUrl: window.location.origin,
              },
            },
          ],
        });
      }
    }
  };

  if (loading) {
    const steps = [
      {
        text: "생존 본능을 분석하고 있어요...",
        color: "bg-[#3D4D7A]",
      },
      {
        text: "번식 본능을 분석하고 있어요...",
        color: "bg-[#FF2A1B]",
      },
      {
        text: "결과를 생성하고 있어요...",
        color: "bg-[#B87830]",
      },
    ];

    const currentStep = steps[analyzingStep];

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={analyzingStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <p className="text-[#2C2C35] text-lg font-medium mb-6">
                {currentStep.text}
              </p>
              <div className="w-full bg-[#E8E4DC] rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-full ${currentStep.color}`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (!result) return null;

  if (showGenderModal) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#E8E4DC] p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">결과를 확인하기 전에!</h2>
          <p className="text-[#8A8690] mb-8">당신의 성별은?</p>
          <div className="flex gap-4">
            <button
              onClick={() => handleGenderSelect("male")}
              className="flex-1 bg-[#3D4D7A] hover:bg-[#3D4D7A]/90 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all hover:scale-105"
            >
              남자
            </button>
            <button
              onClick={() => handleGenderSelect("female")}
              className="flex-1 bg-[#FF2A1B] hover:bg-[#FF2A1B]/90 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all hover:scale-105"
            >
              여자
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resultTypeKey = getResultTypeKey(
    result.intensity,
    result.dominantAxis
  );
  const resultType = resultTypes[resultTypeKey];
  const typeName = resultType.label(gender!);
  const compatibility = compatibilityData[resultTypeKey];

  const typeGradient =
    result.dominantAxis === "survival"
      ? "bg-gradient-to-r from-[#3D4D7A] to-[#7B6BAE]"
      : result.dominantAxis === "reproduction"
        ? "bg-gradient-to-r from-[#FF2A1B] to-[#F0882A]"
        : "bg-gradient-to-r from-[#B87830] to-[#C8A060]";

  const typeBorderColor =
    result.dominantAxis === "survival"
      ? "border-l-[#3D4D7A]"
      : result.dominantAxis === "reproduction"
        ? "border-l-[#FF2A1B]"
        : "border-l-[#B87830]";

  const quoteBackground =
    result.dominantAxis === "survival"
      ? "bg-[#C8D0E8]/30"
      : result.dominantAxis === "reproduction"
        ? "bg-[#FFE0DD]/50"
        : "bg-[#F5F0E8]";

  const totalScore = result.scores.survival + result.scores.reproduction;
  const survivalPercent = Math.round(
    (result.scores.survival / totalScore) * 100
  );
  const reproductionPercent = 100 - survivalPercent;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* 결과 카드 (이미지 생성용) */}
        <div
          ref={cardRef}
          className="bg-white rounded-2xl shadow-sm p-8 mb-6"
        >
          {/* 유형 헤더 */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
            className="text-center mb-8"
          >
            <h1
              className={`text-4xl font-bold mb-3 bg-clip-text text-transparent ${typeGradient} tracking-tight`}
            >
              {typeName}
            </h1>
            <p className="text-[#8A8690] text-lg">{resultType.subtitle}</p>
          </motion.div>

          {/* 점수 바 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#3D4D7A]">
                생존 {result.scores.survival}점
              </span>
              <span className="text-sm font-semibold text-[#FF2A1B]">
                번식 {result.scores.reproduction}점
              </span>
            </div>
            <div className="h-8 flex rounded-full overflow-hidden bg-[#E8E4DC]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${survivalPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                className="bg-[#3D4D7A] flex items-center justify-center text-white text-sm font-bold"
              >
                {survivalPercent}%
              </motion.div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${reproductionPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                className="bg-[#FF2A1B] flex items-center justify-center text-white text-sm font-bold"
              >
                {reproductionPercent}%
              </motion.div>
            </div>
          </motion.div>

          <div className="border-t border-[#E8E4DC] pt-8 mb-8" />

          {/* 특징 */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-5">이런 사람이에요</h2>
            <div className="space-y-3">
              {resultType.traits.map((trait, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`bg-[#F5F0E8] rounded-xl p-4 border-l-4 ${typeBorderColor}`}
                >
                  <p className="text-[#2C2C35]/80">{trait}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#E8E4DC] pt-8 mb-8" />

          {/* 연애 스타일 */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-5">연애할 때는...</h2>
            <div className="space-y-4">
              {resultType.loveStyle.map((style, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 1.0 + index * 0.15,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className="flex items-start gap-3"
                >
                  <span className="w-2 h-2 rounded-full bg-[#FF2A1B]/60 mt-2 shrink-0"></span>
                  <p className="text-[#2C2C35]/80 flex-1 pt-1">{style}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#E8E4DC] pt-8 mb-8" />

          {/* 명대사 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className={`mb-10 ${quoteBackground} rounded-2xl p-8 relative`}
          >
            <div className="text-6xl text-[#B5A48A]/40 absolute top-2 left-4">
              &ldquo;
            </div>
            <p className="text-lg italic text-[#2C2C35] text-center pt-8 pb-4 px-4">
              {resultType.quote}
            </p>
            <div className="text-6xl text-[#B5A48A]/40 absolute bottom-2 right-4">
              &rdquo;
            </div>
          </motion.div>

          <div className="border-t border-[#E8E4DC] pt-8 mb-8" />

          {/* 궁합 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="mb-6"
          >
            <h2 className="text-xl font-bold mb-5">나와 잘 맞는 유형</h2>
            <div className="space-y-3">
              {compatibility.extreme && (
                <div className="bg-[#FFE0DD]/50 border border-[#FF2A1B]/20 rounded-xl p-4">
                  <span className="font-bold text-[#FF2A1B]">
                    극과극 케미
                  </span>
                  <span className="text-[#2C2C35]/80 ml-2">
                    {compatibility.extreme}
                  </span>
                </div>
              )}
              <div className="bg-[#C8D0E8]/30 border border-[#3D4D7A]/20 rounded-xl p-4">
                <span className="font-bold text-[#3D4D7A]">좋은 궁합</span>
                <span className="text-[#2C2C35]/80 ml-2">
                  {compatibility.good.join(", ")}
                </span>
              </div>
            </div>
          </motion.div>

          {/* 워터마크 (이미지 생성용) */}
          <div className="text-center text-[#B5A48A] text-sm mt-6">
            본능테스트
          </div>
        </div>

        {/* 공유 & 다시하기 */}
        <div className="space-y-3 mb-8">
          <button
            onClick={handleDownloadImage}
            className="w-full bg-[#3D4D7A] hover:bg-[#3D4D7A]/90 text-white font-bold py-4 px-6 rounded-full text-lg transition-all active:scale-[0.98] shadow-md"
          >
            이미지로 저장하기
          </button>
          <button
            onClick={handleShare}
            className="w-full bg-[#B87830] hover:bg-[#C25A28] text-white font-bold py-4 px-6 rounded-full text-lg transition-all active:scale-[0.98] shadow-md"
          >
            {copied ? "복사 완료! ✓" : "텍스트 복사하기"}
          </button>
          <button
            onClick={handleKakaoShare}
            disabled={!process.env.NEXT_PUBLIC_KAKAO_KEY}
            className="w-full bg-[#FEE500] hover:bg-[#F5DC00] disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 font-bold py-4 px-6 rounded-full text-lg transition-all active:scale-[0.98] shadow-md disabled:cursor-not-allowed"
          >
            {process.env.NEXT_PUBLIC_KAKAO_KEY
              ? "카카오톡으로 공유"
              : "카카오톡 공유 준비중"}
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("instinct-test-answers");
              router.push("/");
            }}
            className="w-full bg-white hover:bg-[#F5F0E8] text-[#2C2C35] font-medium py-4 px-6 rounded-full text-lg transition-all border-2 border-[#E8E4DC] active:scale-[0.98]"
          >
            다시 테스트하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#8A8690]">로딩 중...</p>
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
