import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative min-h-[600px] md:min-h-[720px] flex items-center bg-background overflow-hidden">
      <Image
        src="/landing/hero.png"
        alt="A quiet morning workspace with a journal and a mug by a window"
        fill
        priority
        className="object-cover object-right"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent md:via-background/70" />
      <div className="relative z-10 container max-w-6xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <div className="max-w-2xl space-y-5 md:space-y-7">
          <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight text-foreground font-semibold">
            <span className="block">なりたい自分への</span>
            <span className="block">最短コースを見つける</span>
          </h1>
          <div className="space-y-1 text-lg md:text-xl text-foreground/80 leading-relaxed">
            <p>エビデンスベースで習慣を組み合わせて</p>
            <p>
              人生を切り替えるためのアプリ{' '}
              <span className="font-bold text-foreground">→ Smitch</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-4">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
            >
              waitlist に登録する
            </a>
            <a
              href="#why"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background/80 px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent transition backdrop-blur"
            >
              詳しく見る
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
