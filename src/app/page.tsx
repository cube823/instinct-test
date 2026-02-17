"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getStats } from "@/lib/api";

// 애니메이션 variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const cardVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    x: direction * 50,
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,

      ease: "easeOut" as const,
    },
  },
};

const FALLBACK_COUNT = 0;

export default function Home() {
  const [participantCount, setParticipantCount] = useState(FALLBACK_COUNT);

  useEffect(() => {
    getStats().then((stats) => {
      if (stats && typeof stats.total === "number") {
        setParticipantCount(stats.total);
      }
    });
  }, []);

  const formattedCount = participantCount.toLocaleString();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#3D4D7A]/5 via-transparent to-[#FF2A1B]/5 pointer-events-none" />

      <motion.main
        className="max-w-lg w-full mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 상단 타이틀 */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl font-bold mb-2 text-foreground tracking-tight"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-[#3D4D7A] via-[#7B6BAE] to-[#FF2A1B] bg-clip-text text-transparent">
              본능
            </span>{" "}
            테스트
          </motion.h1>
          <motion.p
            className="text-xl text-foreground/80 font-medium"
            variants={itemVariants}
          >
            나는 생존형? 번식형?
          </motion.p>
        </div>

        {/* 설명 */}
        <motion.div
          className="bg-[#F5F0E8] rounded-2xl p-6 mb-6 border border-[#E8E4DC]"
          variants={itemVariants}
        >
          <p className="text-base text-foreground/70 leading-relaxed mb-4">
            인간의 두 가지 근본 욕구 —{" "}
            <span className="font-semibold text-[#3D4D7A]">생존 본능</span>과{" "}
            <span className="font-semibold text-[#FF2A1B]">번식 본능</span>.
            20개 질문으로 당신의 본능 유형을 알아보세요.
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-foreground/60">
            <span>약 3분 소요</span>
            <span className="text-foreground/30">·</span>
            <span>20문항</span>
          </div>
        </motion.div>

        {/* 두 축 미리보기 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            className="bg-[#3D4D7A]/8 border-2 border-[#3D4D7A]/20 rounded-xl p-4 text-center cursor-default"
            custom={-1}
            variants={cardVariants}
            whileHover={{ y: -2 }}
          >
            <div className="text-2xl mb-2">🛡️</div>
            <div className="font-semibold text-[#3D4D7A] text-sm">
              생존 본능
            </div>
            <div className="text-xs text-[#3D4D7A]/60 mt-1">
              안정 · 자원 · 방어
            </div>
          </motion.div>
          <motion.div
            className="bg-[#FF2A1B]/8 border-2 border-[#FF2A1B]/20 rounded-xl p-4 text-center cursor-default"
            custom={1}
            variants={cardVariants}
            whileHover={{ y: -2 }}
          >
            <div className="text-2xl mb-2">💘</div>
            <div className="font-semibold text-[#FF2A1B] text-sm">
              번식 본능
            </div>
            <div className="text-xs text-[#FF2A1B]/60 mt-1">
              매력 · 관계 · 확장
            </div>
          </motion.div>
        </div>

        {/* CTA 버튼 */}
        <motion.div variants={buttonVariants}>
          <Link
            href="/test"
            className="block w-full bg-[#B87830] hover:bg-[#C25A28] text-white font-bold text-lg py-4 px-6 rounded-full text-center shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
          >
            테스트 시작하기
          </Link>
        </motion.div>

        {/* 소셜 증거 */}
        <motion.p
          className="text-center text-sm text-foreground/60 mt-4 font-medium"
          variants={itemVariants}
        >
          지금까지{" "}
          <span className="text-[#B87830] font-bold">{formattedCount}명</span>이
          참여했어요
        </motion.p>

        {/* 결과 유형 미리보기 */}
        <motion.div
          className="mt-8 pt-6 border-t border-foreground/10"
          variants={itemVariants}
        >
          <p className="text-center text-sm text-foreground/60 mb-3">
            어떤 유형이 나올까?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "미친생존남",
              "찐번식녀",
              "생존주의자",
              "사랑꾼",
              "균형잡힌놈",
              "헷갈리는녀석",
            ].map((type, index) => (
              <motion.span
                key={type}
                className="px-3 py-1 bg-[#F5F0E8] text-[#2C2C35]/70 text-xs font-medium rounded-full border border-[#E8E4DC]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                {type}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* 하단 텍스트 */}
        <motion.p
          className="text-center text-sm text-foreground/50 mt-6"
          variants={itemVariants}
        >
          결과를 친구와 공유해보세요!
        </motion.p>
      </motion.main>
    </div>
  );
}
