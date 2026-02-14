import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <main className="max-w-lg w-full mx-auto">
        {/* 상단 아이콘 */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🧬</div>
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            본능 테스트
          </h1>
          <p className="text-xl text-foreground/80 font-medium">
            나는 생존형? 번식형?
          </p>
        </div>

        {/* 설명 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <p className="text-base text-foreground/70 leading-relaxed mb-4">
            인간의 두 가지 근본 욕구 — <span className="font-semibold text-[#2D6A4F]">생존 본능</span>과{" "}
            <span className="font-semibold text-[#E63946]">번식 본능</span>.
            20개 질문으로 당신의 본능 유형을 알아보세요.
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-foreground/60">
            <span className="flex items-center gap-1">
              <span>⏱</span>
              <span>약 3분 소요</span>
            </span>
            <span className="text-foreground/30">·</span>
            <span className="flex items-center gap-1">
              <span>📊</span>
              <span>20문항</span>
            </span>
          </div>
        </div>

        {/* 두 축 미리보기 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#2D6A4F]/10 border-2 border-[#2D6A4F]/30 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="font-semibold text-[#2D6A4F] text-sm">생존 본능</div>
            <div className="text-xs text-[#2D6A4F]/70 mt-1">안정 · 자원 · 방어</div>
          </div>
          <div className="bg-[#E63946]/10 border-2 border-[#E63946]/30 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">💘</div>
            <div className="font-semibold text-[#E63946] text-sm">번식 본능</div>
            <div className="text-xs text-[#E63946]/70 mt-1">매력 · 관계 · 확장</div>
          </div>
        </div>

        {/* CTA 버튼 */}
        <Link
          href="/test"
          className="block w-full bg-[#FFB703] hover:bg-[#FFB703]/90 text-foreground font-bold text-lg py-4 px-6 rounded-full text-center shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
        >
          테스트 시작하기
        </Link>

        {/* 하단 텍스트 */}
        <p className="text-center text-sm text-foreground/50 mt-6">
          결과를 친구와 공유해보세요! 🌟
        </p>
      </main>
    </div>
  );
}
