import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SmitchLogo } from '@/components/ui/smitch-logo';

const SELECTION_OPTIONS = [
  '集中して働ける自分',
  '疲れにくい自分',
  '家族との時間を増やす自分',
  '自分の軸で選べる自分',
];

export function Hero() {
  return (
    <section className="bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 pt-8 md:pt-12 pb-16 md:pb-24">
        <SmitchLogo height={28} className="mb-8 md:mb-12" />

        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 md:gap-12 items-center">
          <div className="space-y-6 md:space-y-8">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight text-foreground">
              人生は、
              <br />
              続けた日数では
              <br />
              変わらない。
            </h1>
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
              Smitch は、「なりたい自分」から始めて、
              <br className="hidden sm:block" />
              科学的根拠のある習慣を自分で選び取るための
              <br className="hidden sm:block" />
              ライフパスビルダーアプリです。
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="lg" asChild>
                <a href="#waitlist">なりたい自分を選ぶ</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#process">アプリの中身を見る</a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              ストリークではなく、人生へのインパクトを見える化。
            </p>
          </div>

          <div className="relative aspect-[7/6] lg:aspect-[6/5]">
            <Image
              src="/landing/photo-hero-man.png"
              alt="マフラーとコートを羽織って都会の街角に佇む 30 代後半の男性が、何かを考えながら横を向いている editorial documentary 写真"
              fill
              sizes="(min-width: 1024px) 700px, 100vw"
              className="object-cover object-center rounded-md"
              priority
            />
            <div className="absolute right-0 bottom-0 sm:bottom-4 sm:right-4 w-[42%] max-w-[280px] shadow-2xl rounded-[2rem] overflow-hidden">
              <div className="aspect-[330/725] bg-background relative">
                <Image
                  src="/landing/iphone-hero.png"
                  alt="Smitch アプリの「なりたい自分を選ぶ」画面: 集中して働ける自分 / 疲れにくい自分 / 家族との時間を増やす自分 / 自分の軸で選べる自分 の 4 つの選択肢"
                  fill
                  sizes="280px"
                  className="object-cover object-center"
                />
                <span className="sr-only">
                  なりたい自分を選ぶ画面: {SELECTION_OPTIONS.join('、')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 mt-12 md:mt-16">
          <div className="relative aspect-[490/228] rounded-md overflow-hidden">
            <Image
              src="/landing/photo-hero-reading.png"
              alt="カフェ風の静かな空間でメガネをかけた 30 代男性がコーヒーを傍らに本を読んでいる editorial documentary 写真"
              fill
              sizes="(min-width: 768px) 480px, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[490/228] rounded-md overflow-hidden">
            <Image
              src="/landing/photo-hero-writing.png"
              alt="自宅の窓辺で 30 代女性が子供と並んでノートに何かを書いている editorial documentary 写真"
              fill
              sizes="(min-width: 768px) 480px, 50vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
