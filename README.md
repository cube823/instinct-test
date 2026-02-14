# 본능 테스트 - 나는 생존형? 번식형?

A viral personality test that measures your **survival instinct** vs **reproduction instinct** balance through 20 questions.

## Concept

Inspired by the Korean viral trend of Teto/Egen personality tests, this test categorizes people based on two fundamental human drives:

- **Survival Instinct** - Risk aversion, financial security, self-preservation, independence
- **Reproduction Instinct** - Social attractiveness, relationship formation, mate selection, social validation

## Result Types

Results are determined by score difference and intensity:

| Type | Condition | Example |
|------|-----------|---------|
| **Crazy (미친~)** | Dominant axis 45+ & difference 15+ | 미친생존남, 미친번식녀 |
| **Real (찐~)** | Dominant axis 35+ & difference 10+ | 찐생존녀, 찐번식남 |
| **Half (반반~)** | Difference 5~9 | 반반생존남 |
| **Balanced (균형형)** | Difference 0~4 | 균형형 |

Each result includes personality traits, love style, a signature quote, and compatibility info.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Deployment**: Cloudflare Pages (static export)

## Project Structure

```
src/
├── data/
│   ├── questions.ts     # 20 questions (10 survival + 10 reproduction)
│   └── results.ts       # 6 result type definitions
├── lib/
│   └── scoring.ts       # Score calculation & type determination
└── app/
    ├── page.tsx          # Home - test intro & start
    ├── test/
    │   └── page.tsx      # Test - 20 questions one by one
    └── result/
        └── page.tsx      # Result - type, scores, traits, compatibility
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to try the test.

## Build & Deploy

```bash
npm run build    # outputs static files to /out
```

Deployed on Cloudflare Pages with auto-deploy on `git push`.

## Design

- Mobile-first layout (max-w-lg)
- Color scheme: Survival (#2D6A4F green), Reproduction (#E63946 red), Accent (#FFB703 yellow)
- Smooth transitions between questions
- Shareable results via clipboard copy
