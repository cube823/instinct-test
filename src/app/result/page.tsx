"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getResult } from "@/lib/scoring";
import type { TestResult } from "@/lib/scoring";
import { resultTypes } from "@/data/results";
import type { Gender, Intensity } from "@/data/results";

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

export default function ResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TestResult | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("instinct-test-answers");
    if (!stored) {
      router.push("/");
      return;
    }

    try {
      const answers = JSON.parse(stored);
      const testResult = getResult(answers);
      setResult(testResult);
      setShowGenderModal(true);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleGenderSelect = (selectedGender: Gender) => {
    setGender(selectedGender);
    setShowGenderModal(false);
  };

  const handleShare = () => {
    if (!result || !gender) return;

    const resultTypeKey = getResultTypeKey(
      result.intensity,
      result.dominantAxis
    );
    const resultType = resultTypes[resultTypeKey];
    const typeName = resultType.label(gender);
    const shareText = `나의 본능 유형은 ${typeName}! 🧬\n생존 ${result.scores.survival}점 / 번식 ${result.scores.reproduction}점\n${window.location.origin}`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🧬</div>
          <p className="text-gray-600">결과를 분석하고 있어요...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  if (showGenderModal) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">🧬</div>
          <h2 className="text-2xl font-bold mb-2">결과를 확인하기 전에!</h2>
          <p className="text-gray-600 mb-8">당신의 성별은?</p>
          <div className="flex gap-4">
            <button
              onClick={() => handleGenderSelect("male")}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all hover:scale-105"
            >
              남자
            </button>
            <button
              onClick={() => handleGenderSelect("female")}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all hover:scale-105"
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

  const typeColor =
    result.dominantAxis === "survival"
      ? "text-[#2D6A4F]"
      : result.dominantAxis === "reproduction"
        ? "text-[#E63946]"
        : "text-[#FFB703]";

  const totalScore = result.scores.survival + result.scores.reproduction;
  const survivalPercent = Math.round(
    (result.scores.survival / totalScore) * 100
  );
  const reproductionPercent = 100 - survivalPercent;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          {/* 유형 헤더 */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🧬</div>
            <h1 className={`text-3xl font-bold mb-2 ${typeColor}`}>
              {typeName}
            </h1>
            <p className="text-gray-600 text-lg">{resultType.subtitle}</p>
          </div>

          {/* 점수 바 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#2D6A4F]">
                🛡️ 생존 {result.scores.survival}점
              </span>
              <span className="text-sm font-semibold text-[#E63946]">
                💘 번식 {result.scores.reproduction}점
              </span>
            </div>
            <div className="h-8 flex rounded-full overflow-hidden bg-gray-100">
              <div
                className="bg-[#2D6A4F] flex items-center justify-center text-white text-xs font-bold transition-all duration-500"
                style={{ width: `${survivalPercent}%` }}
              >
                {survivalPercent}%
              </div>
              <div
                className="bg-[#E63946] flex items-center justify-center text-white text-xs font-bold transition-all duration-500"
                style={{ width: `${reproductionPercent}%` }}
              >
                {reproductionPercent}%
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mb-6" />

          {/* 특징 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">이런 사람이에요</h2>
            <div className="space-y-3">
              {resultType.traits.map((trait, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700">{trait}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mb-6" />

          {/* 연애 스타일 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">연애할 때는...</h2>
            <div className="space-y-3">
              {resultType.loveStyle.map((style, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-2xl">💕</span>
                  <p className="text-gray-700 flex-1 pt-1">{style}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mb-6" />

          {/* 명대사 */}
          <div className="mb-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 relative">
            <div className="text-6xl text-gray-300 absolute top-2 left-4">
              &ldquo;
            </div>
            <p className="text-lg italic text-gray-800 text-center pt-8 pb-4 px-4">
              {resultType.quote}
            </p>
            <div className="text-6xl text-gray-300 absolute bottom-2 right-4">
              &rdquo;
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mb-6" />

          {/* 궁합 */}
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-4">나와 잘 맞는 유형</h2>
            <div className="space-y-2">
              {compatibility.extreme && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <span className="font-bold text-red-600">
                    🔥 극과극 케미
                  </span>
                  <span className="text-gray-700 ml-2">
                    {compatibility.extreme}
                  </span>
                </div>
              )}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <span className="font-bold text-green-600">✅ 좋은 궁합</span>
                <span className="text-gray-700 ml-2">
                  {compatibility.good.join(", ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 공유 & 다시하기 */}
        <div className="space-y-3 mb-8">
          <button
            onClick={handleShare}
            className="w-full bg-[#FFB703] hover:bg-[#e5a503] text-foreground font-bold py-4 px-6 rounded-full text-lg transition-all active:scale-[0.98]"
          >
            {copied ? "복사 완료! ✓" : "결과 공유하기 📋"}
          </button>
          <button className="w-full bg-[#FEE500] hover:bg-[#F5DC00] text-gray-900 font-bold py-4 px-6 rounded-full text-lg transition-all active:scale-[0.98]">
            카카오톡으로 공유
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("instinct-test-answers");
              router.push("/");
            }}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-4 px-6 rounded-full text-lg transition-all border border-gray-200"
          >
            다시 테스트하기
          </button>
        </div>
      </div>
    </div>
  );
}
