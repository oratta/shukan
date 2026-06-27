import Image from 'next/image';

export function SelectionCriterion() {
  return (
    <section className="bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-[minmax(0,3.5fr)_minmax(0,3.5fr)_minmax(0,3fr)] gap-8 md:gap-10 items-center">
          <div className="space-y-5">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-foreground">
              朝活も、冷水シャワーも、筋トレも。
              <br />
              問題はそこではない。
            </h2>
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
              問われているのは、「自分の意思で選んだか」「科学的根拠があるか」。
              Smitch は流行りの習慣を押し付けず、
              あなたの目的に合う選択肢だけを静かに差し出します。
            </p>
          </div>

          <div className="relative aspect-[640/1024] rounded-md overflow-hidden">
            <Image
              src="/landing/photo-selection-notebook.png"
              alt="木の机に置かれたノートに「Listen」「Healthy sleep」「Read books」「Athletic」「日記」「散歩」「Be focused」「朝の光」など日英のキーワードが手書きされている editorial documentary 写真"
              fill
              sizes="(min-width: 1024px) 400px, 80vw"
              className="object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="relative aspect-[380/970] max-w-[280px] mx-auto lg:mx-0">
              <Image
                src="/landing/iphone-selection-venn.png"
                alt="iPhone 画面: あなたの選択の基準 — 意志 / 科学 / インパクト の 3 つが交差する領域に Smitch のロゴが置かれたベン図"
                fill
                sizes="(min-width: 1024px) 280px, 60vw"
                className="object-contain"
              />
            </div>
            <p className="text-center text-sm md:text-base text-muted-foreground">
              自分で選び、未来を変えていく。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
