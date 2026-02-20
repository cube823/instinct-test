import satori from "satori";
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import React from "react";

const OUTPUT_DIR = join(process.cwd(), "public", "og");

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const types = [
  {
    key: "crazySurvival",
    label: (g: string) => `미친생존${g === "male" ? "남" : "녀"}`,
    subtitle: "핵전쟁이 나도 마지막까지 살아남을 사람",
    axis: "survival",
  },
  {
    key: "realSurvival",
    label: (g: string) => `찐생존${g === "male" ? "남" : "녀"}`,
    subtitle: "조용하지만 확실한 서바이버",
    axis: "survival",
  },
  {
    key: "crazyReproduction",
    label: (g: string) => `미친번식${g === "male" ? "남" : "녀"}`,
    subtitle: "존재 자체가 페로몬, 걸어다니는 끌림 본능",
    axis: "reproduction",
  },
  {
    key: "realReproduction",
    label: (g: string) => `찐번식${g === "male" ? "남" : "녀"}`,
    subtitle: "자연스럽게 사람을 끌어모으는 인간 자석",
    axis: "reproduction",
  },
  {
    key: "half",
    label: (g: string) => `반반형 ${g === "male" ? "남" : "녀"}`,
    subtitle: "생존 모드 ↔ 번식 모드 전환하는 하이브리드",
    axis: "balanced",
  },
  {
    key: "balanced",
    label: (g: string) => `균형형 ${g === "male" ? "남" : "녀"}`,
    subtitle: "생존과 번식의 완벽 밸런스",
    axis: "balanced",
  },
] as const;

const genders = ["male", "female"] as const;

function getColors(axis: string) {
  if (axis === "survival") {
    return { from: "#3D4D7A", to: "#7B6BAE", bg: "#E8EAF6" };
  }
  if (axis === "reproduction") {
    return { from: "#FF2A1B", to: "#F0882A", bg: "#FFF3E0" };
  }
  return { from: "#B87830", to: "#C8A060", bg: "#F5F0E8" };
}

function loadFont(): ArrayBuffer {
  const fontPaths = [
    join(process.cwd(), "scripts", "fonts", "NotoSansKR-Bold.ttf"),
    "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
    "/usr/share/fonts/truetype/noto/NotoSansKR-Regular.ttf",
  ];

  for (const p of fontPaths) {
    try {
      if (existsSync(p)) {
        return readFileSync(p).buffer as ArrayBuffer;
      }
    } catch {
      continue;
    }
  }

  throw new Error(
    "No suitable Korean font found. Run: curl -L -o scripts/fonts/NotoSansKR-Bold.ttf 'https://github.com/google/fonts/raw/main/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf'"
  );
}

function makeTypeCard(typeName: string, subtitle: string, axis: string) {
  const colors = getColors(axis);
  return React.createElement(
    "div",
    {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${colors.bg} 0%, #FFFFFF 50%, ${colors.bg} 100%)`,
        fontFamily: "Korean",
        position: "relative" as const,
      },
    },
    // Top accent bar
    React.createElement("div", {
      style: {
        position: "absolute" as const,
        top: "0",
        left: "0",
        right: "0",
        height: "8px",
        background: `linear-gradient(to right, ${colors.from}, ${colors.to})`,
      },
    }),
    // Branding
    React.createElement(
      "div",
      {
        style: {
          fontSize: "28px",
          color: "#8A8690",
          marginBottom: "16px",
          letterSpacing: "2px",
        },
      },
      "본능 테스트"
    ),
    // Type name
    React.createElement(
      "div",
      {
        style: {
          fontSize: "72px",
          fontWeight: "bold",
          background: `linear-gradient(to right, ${colors.from}, ${colors.to})`,
          backgroundClip: "text",
          color: "transparent",
          marginBottom: "20px",
          lineHeight: "1.2",
        },
      },
      typeName
    ),
    // Subtitle
    React.createElement(
      "div",
      {
        style: {
          fontSize: "28px",
          color: "#2C2C35",
          opacity: 0.7,
          marginBottom: "40px",
          maxWidth: "800px",
          textAlign: "center" as const,
        },
      },
      subtitle
    ),
    // CTA
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 40px",
          borderRadius: "50px",
          background: `linear-gradient(to right, ${colors.from}, ${colors.to})`,
          color: "white",
          fontSize: "24px",
          fontWeight: "bold",
        },
      },
      "나도 테스트하기 →"
    ),
    // Bottom branding
    React.createElement(
      "div",
      {
        style: {
          position: "absolute" as const,
          bottom: "24px",
          fontSize: "20px",
          color: "#B5A48A",
        },
      },
      "instinct-test.pages.dev"
    )
  );
}

function makeDefaultCard() {
  return React.createElement(
    "div",
    {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #E8EAF6 0%, #FFFFFF 30%, #FFF3E0 70%, #F5F0E8 100%)",
        fontFamily: "Korean",
        position: "relative" as const,
      },
    },
    React.createElement("div", {
      style: {
        position: "absolute" as const,
        top: "0",
        left: "0",
        right: "0",
        height: "8px",
        background:
          "linear-gradient(to right, #3D4D7A, #7B6BAE, #FF2A1B, #F0882A)",
      },
    }),
    React.createElement(
      "div",
      {
        style: {
          fontSize: "80px",
          fontWeight: "bold",
          background:
            "linear-gradient(to right, #3D4D7A, #7B6BAE, #FF2A1B)",
          backgroundClip: "text",
          color: "transparent",
          marginBottom: "20px",
        },
      },
      "본능 테스트"
    ),
    React.createElement(
      "div",
      {
        style: {
          fontSize: "36px",
          color: "#2C2C35",
          marginBottom: "40px",
        },
      },
      "나는 생존형? 번식형?"
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 40px",
          borderRadius: "50px",
          background: "linear-gradient(to right, #B87830, #C8A060)",
          color: "white",
          fontSize: "28px",
          fontWeight: "bold",
        },
      },
      "20문항 · 3분 소요"
    ),
    React.createElement(
      "div",
      {
        style: {
          position: "absolute" as const,
          bottom: "24px",
          fontSize: "20px",
          color: "#B5A48A",
        },
      },
      "instinct-test.pages.dev"
    )
  );
}

async function generateImage(
  element: React.ReactElement,
  outputPath: string,
  fontData: ArrayBuffer
) {
  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Korean",
        data: fontData,
        weight: 400,
        style: "normal" as const,
      },
    ],
  });

  const png = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer();
  writeFileSync(outputPath, png);
  console.log(`Generated: ${outputPath}`);
}

async function main() {
  console.log("Generating OG images...\n");

  const fontData = loadFont();
  const promises: Promise<void>[] = [];

  for (const type of types) {
    for (const gender of genders) {
      const typeName = type.label(gender);
      const element = makeTypeCard(typeName, type.subtitle, type.axis);
      const outputPath = join(OUTPUT_DIR, `${type.key}-${gender}.png`);
      promises.push(generateImage(element, outputPath, fontData));
    }
  }

  // Default OG image
  const defaultElement = makeDefaultCard();
  const defaultPath = join(OUTPUT_DIR, "default.png");
  promises.push(generateImage(defaultElement, defaultPath, fontData));

  await Promise.all(promises);

  console.log("\nDone! Generated 13 OG images (12 types + 1 default).");
}

main().catch(console.error);
