import Image from 'next/image';

export function Testimony() {
  return (
    <section className="bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-[minmax(0,3.5fr)_minmax(0,4fr)_minmax(0,2.5fr)] gap-8 md:gap-10 items-center">
          <div className="relative aspect-[620/950] rounded-md overflow-hidden">
            <Image
              src="/landing/photo-testimony-man.png"
              alt="都会の窓辺で街の夕景を見ながら静かに決意を固める 30 代後半男性の後ろ姿"
              fill
              sizes="(min-width: 1024px) 380px, 90vw"
              className="object-cover object-center"
            />
          </div>

          <figure className="space-y-6">
            <span aria-hidden className="block font-serif text-6xl md:text-7xl leading-none text-primary/30">
              &ldquo;
            </span>
            <blockquote className="font-serif text-2xl md:text-3xl leading-snug text-foreground -mt-4">
              ストリークを守るためではなく、
              <br />
              自分の生活に意味があるかで
              <br />
              習慣を選べた。
            </blockquote>
            <figcaption className="text-sm text-muted-foreground space-y-0.5">
              <p>37 歳・企画職</p>
              <p>過去に習慣アプリを 3 回挫折</p>
            </figcaption>
          </figure>

          <div className="relative aspect-[410/920] max-w-[260px] mx-auto lg:mx-0">
            <Image
              src="/landing/iphone-testimony.png"
              alt="iPhone 画面: 選んだ習慣 — 就寝 90 分前の照明調整 / 朝の 10 分ジャーナリング / 週 2 回の軽い筋トレ がチェック済み。下に「感じた変化」として「集中力が安定。家族との時間も増えた。自分の選択に納得感がある。」のメモ"
              fill
              sizes="(min-width: 1024px) 260px, 70vw"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
