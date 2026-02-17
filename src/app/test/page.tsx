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

  // 프로그레스 바 그라데이션 색상 계산 (Symbiosis 파랑 → Renegade 빨강)
  const getProgressColor = () => {
    const ratio = progress / 100;
    const red = Math.round(61 + (255 - 61) * ratio);
    const green = Math.round(77 + (42 - 77) * ratio);
    const blue = Math.round(122 + (27 - 122) * ratio);
    return `rgb(${red}, ${green}, ${blue})`;
  };

  // 격려 메시지 표시
  useEffect(() => {
    const milestones = [
      { index: 4, text: "좋아요! 벌써 25% 완료" },
      { index: 9, text: "절반 왔어요!" },
      { index: 14, text: "거의 다 왔어요! 조금만 더" },
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

  // 축 상단 테두리 색상
  const axisTopColor = currentQuestion.axis === "survival"
    ? "border-t-[#3D4D7A]"
    : "border-t-[#FF2A1B]";

  return (
    <div className="min-h-screen bg-background py-8 px-4 overflow-hidden">
      <div className="max-w-lg mx-auto">
        {/* 격려 메시지 */}
        <AnimatePresence>
          {showEncouragement && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#2C2C35] text-white px-6 py-3 rounded-full shadow-lg font-semibold"
            >
              {encouragementText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 이전 버튼 */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="mb-4 flex items-center gap-2 text-[#8A8690] hover:text-[#2C2C35] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">이전 문항</span>
          </button>
        )}

        {/* 프로그레스 바 */}
        <div className="mb-8">
          <div className="h-2 bg-[#E8E4DC] rounded-full overflow-hidden relative">
            <motion.div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: getProgressColor()
              }}
              layout
            />
          </div>
          <p className="text-sm text-[#8A8690] mt-2 text-center">
            {currentIndex + 1} / {questions.length}
          </p>
        </div>

        {/* 질문 카드 with AnimatePresence */}
        <div className="mb-8 relative" style={{ minHeight: "200px" }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              initial={{
                x: direction > 0 ? 80 : -80,
                opacity: 0
              }}
              animate={{
                x: 0,
                opacity: 1
              }}
              exit={{
                x: direction > 0 ? -80 : 80,
                opacity: 0
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className={`bg-white rounded-2xl p-8 border-t-[3px] ${axisTopColor} border border-[#E8E4DC] absolute w-full`}
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
                      ? "bg-[#B87830] text-white shadow-xl"
                      : "bg-white hover:bg-gray-50 text-[#2C2C35] border-2 border-[#E8E4DC] hover:border-[#B87830] hover:shadow-lg"
                  }`}
                >
                  {value}
                </motion.button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-[#8A8690] px-1">
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
                  ? "bg-[#3D4D7A] text-white shadow-xl"
                  : "bg-white hover:bg-[#3D4D7A] hover:text-white text-[#2C2C35] border-2 border-[#E8E4DC] hover:border-[#3D4D7A] hover:shadow-lg"
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
                  ? "bg-[#FF2A1B] text-white shadow-xl"
                  : "bg-white hover:bg-[#FF2A1B] hover:text-white text-[#2C2C35] border-2 border-[#E8E4DC] hover:border-[#FF2A1B] hover:shadow-lg"
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
