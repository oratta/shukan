import Image from 'next/image';

const CARDS = [
  {
    label: '集中',
    metric: '今週 +2.1 時間/日',
    src: '/landing/photo-outcome-focus.png',
    alt: '静かなオフィスで PC に深く集中する 30 代男性。傍らに集中時間グラフを表示した iPhone',
  },
  {
    label: '家族',
    metric: '家族との時間 +1,440 時間/年',
    src: '/landing/photo-outcome-family.png',
    alt: '自宅のテーブルで子供と穏やかに会話する 30-40 代の親。傍らに家族時間メトリクスを表示した iPhone',
  },
  {
    label: '健康',
    metric: '健康寿命 +2.4 年',
    src: '/landing/photo-outcome-health.png',
    alt: '緑のある場所で朝のヨガをする 40 代女性。傍らに健康寿命グラフを表示した iPhone',
  },
];

export function OutcomeGallery() {
  return (
    <section className="bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-center leading-tight tracking-tight text-foreground mb-10 md:mb-16">
          変化は、見せるものではなく、
          <br className="hidden sm:block" />
          生活に戻ってくるもの。
        </h2>

        <ul className="grid sm:grid-cols-3 gap-6 md:gap-8">
          {CARDS.map(({ label, metric, src, alt }) => (
            <li key={label} className="space-y-3">
              <div className="relative aspect-[540/630] rounded-md overflow-hidden bg-muted">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 33vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xl md:text-2xl font-serif font-semibold text-foreground">
                  {label}
                </p>
                <p className="text-sm md:text-base text-muted-foreground">{metric}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
