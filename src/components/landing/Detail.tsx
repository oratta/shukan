import Image from 'next/image';

const SCREENS = [
  {
    label: '研究サマリー',
    src: '/landing/iphone-detail-1.png',
    alt: 'iPhone 画面: 就寝 90 分前の照明調整が睡眠の質に与える影響 — 何に効くか / どのくらい確からしいか / 注意点 のサマリーとエビデンスの強さラベル',
  },
  {
    label: 'おすすめ習慣',
    src: '/landing/iphone-detail-2.png',
    alt: 'iPhone 画面: 4 つの習慣カード（就寝 90 分前の照明調整 / 週 2 回の軽い筋トレ / 朝の 10 分ジャーナリング / 朝を浴びる）にエビデンスレベル付き',
  },
  {
    label: '習慣の詳細',
    src: '/landing/iphone-detail-3.png',
    alt: 'iPhone 画面: 就寝 90 分前の照明調整 — 効果の確からしさ / 始めやすさ / 生活との相性 のスライダー指標 + 具体的なやり方',
  },
  {
    label: 'インパクトの見える化',
    src: '/landing/iphone-detail-4.png',
    alt: 'iPhone 画面: 数値カード 4 つ（健康寿命 / 出費削減 / 増える収入 / 前向きな気持ちの時間）+ 上昇トレンドグラフ',
  },
];

export function Detail() {
  return (
    <section className="bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-center leading-tight tracking-tight text-foreground mb-10 md:mb-16">
          出てくるのは、
          <br className="sm:hidden" />
          根性論ではなく
          <br className="sm:hidden" />
          判断材料。
        </h2>

        <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] gap-8 md:gap-12 items-center">
          <div className="relative aspect-[540/750] max-w-[400px] mx-auto lg:mx-0 w-full rounded-md overflow-hidden">
            <Image
              src="/landing/photo-detail-reading.png"
              alt="自宅デスクで本を読む 30 代男性。マグカップが手前にあり、自然光の中で静かに考えている editorial documentary 写真"
              fill
              sizes="(min-width: 1024px) 360px, 80vw"
              className="object-cover"
            />
          </div>

          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-2">
            {SCREENS.map(({ label, src, alt }) => (
              <li key={label} className="flex flex-col items-center text-center gap-3">
                <span className="text-xs md:text-sm font-semibold text-foreground">
                  {label}
                </span>
                <div className="relative w-full max-w-[220px] aspect-[290/740]">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(min-width: 1024px) 220px, 40vw"
                    className="object-contain"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-12 md:mt-16 text-center italic font-serif text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
          「漠然とした『頑張る』ではなく、根拠に基づいて、自分で選べるようになる。」
        </p>
      </div>
    </section>
  );
}
