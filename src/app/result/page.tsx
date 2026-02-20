"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
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
  getStats,
} from "@/lib/api";
import type { Stats } from "@/lib/api";

// Kakao SDK type declaration
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

const TYPE_NAME_MAP: Record<ResultTypeKey, string> = {
  crazySurvival: "미친생존",
  realSurvival: "찐생존",
  crazyReproduction: "미친번식",
  realReproduction: "찐번식",
  half: "반반형",
  balanced: "균형형",
};

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

// Stats distribution bar chart component
function StatsSection({
  stats,
  myTypeKey,
}: {
  stats: Stats;
  myTypeKey: ResultTypeKey;
}) {
  const total = stats.total || 1;
  const typeKeys: ResultTypeKey[] = [
    "crazySurvival",
    "realSurvival",
    "crazyReproduction",
    "realReproduction",
    "half",
    "balanced",
  ];

  const myCount = stats.distribution[myTypeKey] || 0;
  const myPercent = Math.round((myCount / total) * 100);

  const getBarColor = (key: ResultTypeKey) => {
    if (key === "crazySurvival" || key === "realSurvival")
      return "bg-[#3D4D7A]";
    if (key === "crazyReproduction" || key === "realReproduction")
      return "bg-[#FF2A1B]";
    return "bg-[#B87830]";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.0 }}
    >
      <h2 className="text-xl font-bold mb-5">통계</h2>

      {/* Rarity badge */}
      <div className="bg-gradient-to-r from-[#B87830]/10 to-[#C8A060]/10 border border-[#B87830]/20 rounded-xl p-4 mb-5 text-center">
        <span className="text-[#B87830] font-bold text-lg">
          전체 참여자 중 {myPercent}%만 이 유형!
        </span>
      </div>

      {/* Distribution bar chart */}
      <div className="space-y-3">
        {typeKeys.map((key) => {
          const count = stats.distribution[key] || 0;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          const isMyType = key === myTypeKey;

          return (
            <div key={key} className={isMyType ? "opacity-100" : "opacity-60"}>
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm ${isMyType ? "font-bold text-[#2C2C35]" : "text-[#8A8690]"}`}
                >
                  {TYPE_NAME_MAP[key]}
                  {isMyType && " ← 나"}
                </span>
                <span
                  className={`text-sm ${isMyType ? "font-bold text-[#2C2C35]" : "text-[#8A8690]"}`}
                >
                  {percent}%
                </span>
              </div>
              <div className="h-3 bg-[#E8E4DC] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(percent, 2)}%` }}
                  transition={{ duration: 1, delay: 2.2 + typeKeys.indexOf(key) * 0.1 }}
                  className={`h-full rounded-full ${getBarColor(key)} ${isMyType ? "ring-2 ring-offset-1 ring-[#B87830]/50" : ""}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Challenge comparison component
function ChallengeComparison({
  myResult,
  myGender,
  myTypeKey,
  opponentId,
}: {
  myResult: TestResult;
  myGender: Gender;
  myTypeKey: ResultTypeKey;
  opponentId: string;
}) {
  const [opponent, setOpponent] = useState<{
    result_type: string;
    gender: string;
    survival_score: number;
    reproduction_score: number;
  } | null>(null);

  useEffect(() => {
    apiGetResult(opponentId).then((data) => {
      if (data) setOpponent(data);
    });
  }, [opponentId]);

  if (!opponent) return null;

  const opponentTypeKey = opponent.result_type as ResultTypeKey;
  const opponentType = resultTypes[opponentTypeKey];
  if (!opponentType) return null;

  const opponentName = opponentType.label(opponent.gender as Gender);
  const myName = resultTypes[myTypeKey].label(myGender);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-r from-[#3D4D7A]/5 to-[#FF2A1B]/5 border border-[#E8E4DC] rounded-2xl p-6 mb-6"
    >
      <h2 className="text-lg font-bold text-center mb-4">도전 결과 비교</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* My result */}
        <div className="text-center">
          <div className="text-sm text-[#8A8690] mb-1">나</div>
          <div className="font-bold text-[#2C2C35] text-lg">{myName}</div>
          <div className="text-sm text-[#3D4D7A] mt-1">
            생존 {myResult.scores.survival}
          </div>
          <div className="text-sm text-[#FF2A1B]">
            번식 {myResult.scores.reproduction}
          </div>
        </div>
        {/* VS */}
        <div className="text-center">
          <div className="text-sm text-[#8A8690] mb-1">상대</div>
          <div className="font-bold text-[#2C2C35] text-lg">{opponentName}</div>
          <div className="text-sm text-[#3D4D7A] mt-1">
            생존 {opponent.survival_score}
          </div>
          <div className="text-sm text-[#FF2A1B]">
            번식 {opponent.reproduction_score}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [challengeOpponent, setChallengeOpponent] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch stats
    getStats().then(setStats);

    // Check for challenge opponent
    const storedOpponent = sessionStorage.getItem("challenge-opponent");
    if (storedOpponent) {
      setChallengeOpponent(storedOpponent);
    }
  }, []);

  useEffect(() => {
    const sharedId = searchParams.get("id");

    if (sharedId) {
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
          router.push("/");
        }
      });
      return;
    }

    const stored = sessionStorage.getItem("instinct-test-answers");
    if (!stored) {
      router.push("/");
      return;
    }

    try {
      const answers = JSON.parse(stored);
      const testResult = getResult(answers);
      setResult(testResult);

      const steps = [
        { step: 0, delay: 0 },
        { step: 1, delay: 1000 },
        { step: 2, delay: 2000 },
      ];

      steps.forEach(({ step, delay }) => {
        setTimeout(() => setAnalyzingStep(step), delay);
      });

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
        // answers are optional
      }

      // Get ref_id from sessionStorage
      let refId: string | undefined;
      try {
        const storedRef = sessionStorage.getItem("instinct-ref");
        if (storedRef) refId = storedRef;
      } catch {
        // ref_id is optional
      }

      const saved = await apiSaveResult({
        survival_score: result.scores.survival,
        reproduction_score: result.scores.reproduction,
        intensity: result.intensity,
        dominant_axis: result.dominantAxis,
        result_type: resultTypeKey,
        gender: selectedGender,
        answers,
        ref_id: refId,
      });

      if (saved) {
        setResultId(saved.id);
        window.history.replaceState(null, "", `/result?id=${saved.id}`);
      }
    }
  };

  const getShareUrl = useCallback(() => {
    if (resultId) {
      return `${window.location.origin}/result?id=${resultId}`;
    }
    return window.location.origin;
  }, [resultId]);

  const handleShare = useCallback(async () => {
    if (!result || !gender) return;

    const resultTypeKey = getResultTypeKey(
      result.intensity,
      result.dominantAxis
    );
    const resultType = resultTypes[resultTypeKey];
    const typeName = resultType.label(gender);
    const shareUrl = getShareUrl();

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `나의 본능 유형: ${typeName}`,
          text: `생존 ${result.scores.survival}점 / 번식 ${result.scores.reproduction}점`,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or error - fall back to clipboard
      }
    }

    // Fallback: clipboard
    const shareText = `나의 본능 유형은 ${typeName}! 🧬\n생존 ${result.scores.survival}점 / 번식 ${result.scores.reproduction}점\n${shareUrl}`;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result, gender, getShareUrl]);

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
    const ogImageUrl = `${window.location.origin}/og/${resultTypeKey}-${gender}.png`;

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
            imageUrl: ogImageUrl,
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

  const handleChallengeShare = useCallback(async () => {
    if (!resultId) return;
    const challengeUrl = `${window.location.origin}/?challenge=${resultId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "본능 테스트 도전장!",
          text: "나의 본능과 비교해볼래?",
          url: challengeUrl,
        });
        return;
      } catch {
        // fallback
      }
    }

    navigator.clipboard.writeText(challengeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [resultId]);

  if (loading) {
    const steps = [
      { text: "생존 본능을 분석하고 있어요...", color: "bg-[#3D4D7A]" },
      { text: "번식 본능을 분석하고 있어요...", color: "bg-[#FF2A1B]" },
      { text: "결과를 생성하고 있어요...", color: "bg-[#B87830]" },
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
        {/* Challenge comparison (if opponent exists) */}
        {challengeOpponent && gender && (
          <ChallengeComparison
            myResult={result}
            myGender={gender}
            myTypeKey={resultTypeKey}
            opponentId={challengeOpponent}
          />
        )}

        {/* Result card (for image generation) */}
        <div
          ref={cardRef}
          className="bg-white rounded-2xl shadow-sm p-8 mb-6"
        >
          {/* Type header */}
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

          {/* Score bar */}
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

          {/* Traits */}
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

          {/* Love style */}
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

          {/* Quote */}
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

          {/* Compatibility */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="mb-8"
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

          <div className="border-t border-[#E8E4DC] pt-8 mb-8" />

          {/* Stats section */}
          {stats && (
            <StatsSection stats={stats} myTypeKey={resultTypeKey} />
          )}

          {/* Watermark (for image export) */}
          <div className="text-center text-[#B5A48A] text-sm mt-6">
            본능테스트
          </div>
        </div>

        {/* Share & actions */}
        <div className="space-y-3 mb-8">
          {/* Primary: Share */}
          <button
            onClick={handleShare}
            className="w-full bg-[#B87830] hover:bg-[#C25A28] text-white font-bold py-4 px-6 rounded-full text-lg transition-all active:scale-[0.98] shadow-md"
          >
            {copied ? "복사 완료!" : "공유하기"}
          </button>

          {/* Secondary row: Image save + Kakao */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadImage}
              className="bg-[#3D4D7A] hover:bg-[#3D4D7A]/90 text-white font-bold py-4 px-4 rounded-full text-base transition-all active:scale-[0.98] shadow-md"
            >
              이미지 저장
            </button>
            <button
              onClick={handleKakaoShare}
              disabled={!process.env.NEXT_PUBLIC_KAKAO_KEY}
              className="bg-[#FEE500] hover:bg-[#F5DC00] disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 font-bold py-4 px-4 rounded-full text-base transition-all active:scale-[0.98] shadow-md disabled:cursor-not-allowed"
            >
              카카오톡
            </button>
          </div>

          {/* Challenge button */}
          {resultId && (
            <button
              onClick={handleChallengeShare}
              className="w-full bg-gradient-to-r from-[#3D4D7A] to-[#FF2A1B] hover:opacity-90 text-white font-bold py-4 px-6 rounded-full text-lg transition-all active:scale-[0.98] shadow-md"
            >
              도전장 보내기
            </button>
          )}

          {/* Retry */}
          <button
            onClick={() => {
              sessionStorage.removeItem("instinct-test-answers");
              sessionStorage.removeItem("challenge-opponent");
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
