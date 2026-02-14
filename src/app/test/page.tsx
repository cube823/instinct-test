"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/data/questions";

export default function TestPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = (value: number) => {
    // 답변 저장
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    };
    setAnswers(newAnswers);
    setIsTransitioning(true);

    // 0.3초 후 다음 문항으로 이동
    setTimeout(() => {
      if (currentIndex === questions.length - 1) {
        // 마지막 문항: 결과 페이지로 이동
        sessionStorage.setItem("instinct-test-answers", JSON.stringify(newAnswers));
        router.push("/result");
      } else {
        // 다음 문항으로
        setCurrentIndex(currentIndex + 1);
        setIsTransitioning(false);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* 이전 버튼 */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span className="text-sm">이전 문항</span>
          </button>
        )}

        {/* 프로그레스 바 */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFB703] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Q.{currentIndex + 1} / {questions.length}
          </p>
        </div>

        {/* 질문 카드 */}
        <div
          className={`bg-white rounded-2xl shadow-sm p-8 mb-8 transition-opacity duration-300 ${
            isTransitioning ? "opacity-50" : "opacity-100"
          }`}
        >
          <h2 className="text-2xl font-bold text-center leading-relaxed">
            {currentQuestion.text}
          </h2>
        </div>

        {/* 답변 버튼 */}
        {currentQuestion.type === "scale" ? (
          <div className="space-y-4">
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  disabled={isTransitioning}
                  className={`flex-1 h-16 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    answers[currentQuestion.id] === value
                      ? "bg-[#FFB703] text-white scale-105 shadow-lg"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-[#FFB703] hover:scale-105"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-1">
              <span>전혀 아니다</span>
              <span>매우 그렇다</span>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer(5)}
              disabled={isTransitioning}
              className={`flex-1 h-24 rounded-xl font-bold text-xl transition-all duration-200 ${
                answers[currentQuestion.id] === 5
                  ? "bg-[#2D6A4F] text-white scale-105 shadow-lg"
                  : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-[#2D6A4F] hover:scale-105"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              YES
            </button>
            <button
              onClick={() => handleAnswer(1)}
              disabled={isTransitioning}
              className={`flex-1 h-24 rounded-xl font-bold text-xl transition-all duration-200 ${
                answers[currentQuestion.id] === 1
                  ? "bg-[#E63946] text-white scale-105 shadow-lg"
                  : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-[#E63946] hover:scale-105"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              NO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
