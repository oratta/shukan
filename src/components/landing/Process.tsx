import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  {
    n: 1,
    label: 'なりたい自分',
    src: '/landing/iphone-process-1.png',
    alt: 'iPhone 画面: なりたい自分を選ぶ — 4 つの選択肢から自分の目的を選ぶ画面',
  },
  {
    n: 2,
    label: '科学の選択肢',
    src: '/landing/iphone-process-2.png',
    alt: 'iPhone 画面: Smitch からの提案 — 科学的根拠に基づいた習慣リスト',
  },
  {
    n: 3,
    label: '自分で選ぶ',
    src: '/landing/iphone-process-3.png',
    alt: 'iPhone 画面: 比較して選ぶ — 効果 / 始めやすさ / 生活との相性で比較',
  },
  {
    n: 4,
    label: 'インパクト',
    src: '/landing/iphone-process-4.png',
    alt: 'iPhone 画面: インパクト（予測）— 健康寿命 / 出費削減 / 増える収入 / 前向きな気持ちの時間',
  },
];

export function Process() {
  return (
    <section id="process" className="bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] gap-10 md:gap-16 items-start">
          <div className="space-y-6 md:space-y-8">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-foreground">
              受動的な
              <br />
              自己改善から、
              <br />
              能動的に選び取る
              <br />
              自己改善へ。
            </h2>
            <blockquote className="border-l-2 border-primary/40 pl-4 italic font-serif text-base md:text-lg leading-relaxed text-foreground/80">
              「習慣は目的ではなく、
              <br />
              人生が動くための手段です。」
            </blockquote>
          </div>

          <ol className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-8 md:gap-x-1">
            {STEPS.map(({ n, label, src, alt }, i) => (
              <li key={n} className="relative flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    aria-hidden
                    className="inline-flex items-center justify-center size-8 rounded-full border border-primary text-primary text-sm font-semibold"
                  >
                    {n}
                  </span>
                  <span className="text-sm md:text-base font-semibold text-foreground">
                    {label}
                  </span>
                </div>
                <div className="relative w-full max-w-[200px] aspect-[200/520]">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(min-width: 1024px) 200px, 40vw"
                    className="object-contain"
                  />
                </div>
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="hidden md:flex absolute top-32 -right-2 lg:-right-1 items-center justify-center text-foreground/40"
                  >
                    <ArrowRight className="size-4" />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
