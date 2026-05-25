import Image from 'next/image';
import { Clock, Smartphone, Target } from 'lucide-react';

const BULLETS = [
  {
    Icon: Clock,
    text: ['ストリークが途切れた瞬間、', '全部が無意味に感じる'],
  },
  {
    Icon: Smartphone,
    text: ['SNS で流れてきたライフハックを、', 'なんとなく始めてしまう'],
  },
  {
    Icon: Target,
    text: ['続けることが目的になり、', 'どんな自分になるかを見失う'],
  },
];

export function Problem() {
  return (
    <section className="bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-foreground mb-10 md:mb-16">
          習慣アプリに、
          <br />
          疲れていませんか。
        </h2>

        <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)_minmax(0,3fr)] gap-8 md:gap-12 items-center">
          <div className="relative aspect-[400/650] max-w-[320px] mx-auto lg:mx-0 w-full">
            <Image
              src="/landing/iphone-problem.png"
              alt="古い習慣アプリの画面: ストリークが途切れました / 0 日 / 月カレンダーの多くにチェックと途切れた空白 / 「やる気を出す」「再開する」ボタン"
              fill
              sizes="(min-width: 1024px) 320px, 80vw"
              className="object-contain"
            />
          </div>

          <ul className="space-y-6 md:space-y-8">
            {BULLETS.map(({ Icon, text }, i) => (
              <li key={i} className="flex items-start gap-4 md:gap-5">
                <span
                  aria-hidden
                  className="flex-shrink-0 inline-flex items-center justify-center size-10 md:size-12 rounded-full border border-border text-foreground/70"
                >
                  <Icon className="size-5 md:size-6" />
                </span>
                <p className="text-base md:text-lg leading-relaxed text-foreground">
                  {text.map((line, j) => (
                    <span key={j} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ul>

          <div className="relative aspect-[649/948] rounded-md overflow-hidden">
            <Image
              src="/landing/photo-problem-woman.png"
              alt="カフェの窓辺でスマホを見つめる 30 代女性が、何度目かの挫折を噛み締めている editorial documentary 写真"
              fill
              sizes="(min-width: 1024px) 400px, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
