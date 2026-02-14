"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { questions } from "@/data/questions";

export default function TestPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(1); // 1: 앞으로, -1: 뒤로
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementText, setEncouragementText] = useState("");

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // 프로그레스 바 그라데이션 색상 계산 (녹색 → 빨강)
  const getProgressColor = () => {
    const ratio = progress / 100;
    const red = Math.round(46 + (230 - 46) * ratio);
    const green = Math.round(106 + (99 - 106) * ratio);
    const blue = Math.round(79 + (70 - 79) * ratio);
    return `rgb(${red}, ${green}, ${blue})`;
  };

  // 격려 메시지 표시
  useEffect(() => {
    const milestones = [
      { index: 4, text: "좋아요! 벌써 25% 완료 💪" },
      { index: 9, text: "절반 왔어요! 🔥" },
      { index: 14, text: "거의 다 왔어요! 조금만 더 💫" },
    ];

    const milestone = milestones.find(m => m.index === currentIndex);
    if (milestone) {
      setEncouragementText(milestone.text);
      setShowEncouragement(true);
      const timer = setTimeout(() => {
        setShowEncouragement(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  const handleAnswer = (value: number) => {
    // 답변 저장
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    };
    setAnswers(newAnswers);
    setDirection(1); // 앞으로 이동

    setTimeout(() => {
      if (currentIndex === questions.length - 1) {
        // 마지막 문항: 결과 페이지로 이동
        sessionStorage.setItem("instinct-test-answers", JSON.stringify(newAnswers));
        router.push("/result");
      } else {
        // 다음 문항으로
        setCurrentIndex(currentIndex + 1);
      }
    }, 200);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1); // 뒤로 이동
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 축 이모지
  const axisEmoji = currentQuestion.axis === "survival" ? "🛡️" : "💘";
  const axisBorderColor = currentQuestion.axis === "survival"
    ? "border-l-[#2D6A4F]"
    : "border-l-[#E63946]";

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* 격려 메시지 */}
        <AnimatePresence>
          {showEncouragement && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#FFB703] text-white px-6 py-3 rounded-full shadow-lg font-semibold"
            >
              {encouragementText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 이전 버튼 */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">이전 문항</span>
          </button>
        )}

        {/* 프로그레스 바 */}
        <div className="mb-8">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: getProgressColor()
              }}
              layout
            />
            {/* 현재 축 표시 */}
            <div
              className="absolute top-0 h-full flex items-center text-lg transition-all duration-300"
              style={{ left: `${Math.max(progress - 5, 2)}%` }}
            >
              {axisEmoji}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {axisEmoji} Q.{currentIndex + 1} / {questions.length}
          </p>
        </div>

        {/* 질문 카드 with AnimatePresence */}
        <div className="mb-8 relative" style={{ minHeight: "200px" }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              initial={{
                x: direction > 0 ? 300 : -300,
                opacity: 0
              }}
              animate={{
                x: 0,
                opacity: 1
              }}
              exit={{
                x: direction > 0 ? -300 : 300,
                opacity: 0
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className={`bg-white rounded-2xl shadow-sm p-8 border-l-4 ${axisBorderColor} absolute w-full`}
            >
              <h2 className="text-2xl font-bold text-center leading-relaxed">
                {currentQuestion.text}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 답변 버튼 */}
        {currentQuestion.type === "scale" ? (
          <div className="space-y-4">
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <motion.button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 h-16 rounded-xl font-semibold text-lg transition-all duration-200 active:scale-95 ${
                    answers[currentQuestion.id] === value
                      ? "bg-[#FFB703] text-white shadow-xl"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-[#FFB703] hover:shadow-lg"
                  }`}
                >
                  {value}
                </motion.button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-1">
              <span>전혀 아니다</span>
              <span>매우 그렇다</span>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <motion.button
              onClick={() => handleAnswer(5)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 h-24 rounded-xl font-bold text-xl transition-all duration-300 active:scale-95 ${
                answers[currentQuestion.id] === 5
                  ? "bg-[#2D6A4F] text-white shadow-xl"
                  : "bg-white hover:bg-[#2D6A4F] hover:text-white text-gray-700 border-2 border-gray-200 hover:border-[#2D6A4F] hover:shadow-lg"
              }`}
            >
              YES
            </motion.button>
            <motion.button
              onClick={() => handleAnswer(1)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 h-24 rounded-xl font-bold text-xl transition-all duration-300 active:scale-95 ${
                answers[currentQuestion.id] === 1
                  ? "bg-[#E63946] text-white shadow-xl"
                  : "bg-white hover:bg-[#E63946] hover:text-white text-gray-700 border-2 border-gray-200 hover:border-[#E63946] hover:shadow-lg"
              }`}
            >
              NO
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
