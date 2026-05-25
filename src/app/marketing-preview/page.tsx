import { CtaWaitlistForm } from '@/components/landing/CtaWaitlistForm';
import { SectionImage } from '@/components/landing/SectionImage';

export default function MarketingPreview() {
  return (
    <main lang="ja" className="min-h-screen bg-background text-foreground">
      <SectionImage
        src="/landing/section-1-hero.png"
        alt="Smitch: 人生は、続けた日数では変わらない。Smitch は、なりたい自分から始めて、科学的根拠のある習慣を自分で選び取るためのライフパスビルダーアプリです。"
        priority
      />
      <SectionImage
        src="/landing/section-2-problem.png"
        alt="習慣アプリに、疲れていませんか。ストリークが途切れた瞬間に全部が無意味に感じる / SNS で流れてきたライフハックをなんとなく始めてしまう / 続けることが目的になり、どんな自分になるかを見失う。"
      />
      <SectionImage
        src="/landing/section-3-process.png"
        alt="受動的な自己改善から、能動的に選び取る自己改善へ。①なりたい自分を選ぶ →②科学の選択肢から比べる →③自分で選ぶ →④インパクトを見える化する、4 ステップのプロセス。"
      />
      <SectionImage
        src="/landing/section-4-detail.png"
        alt="出てくるのは、根性論ではなく判断材料。研究サマリー / おすすめ習慣 / 習慣の詳細 / インパクトの見える化、4 つの画面で習慣を比較検討できる。"
      />
      <SectionImage
        src="/landing/section-5-outcome.png"
        alt="変化は、見せるものではなく、生活に戻ってくるもの。集中（+2.1 時間/日）/ 家族（+1,440 時間/年）/ 健康（健康寿命 +2.4 年）の 3 つのアウトカム。"
      />
      <SectionImage
        src="/landing/section-6-selection.png"
        alt="朝活も、冷水シャワーも、筋トレも。問題はそこではない。問われているのは、自分の意思で選んだか、科学的根拠があるか。意志・科学・インパクトの 3 つを軸に選ぶ。"
      />
      <SectionImage
        src="/landing/section-7-testimony.png"
        alt="ユーザーの声: ストリークを守るためではなく、自分の生活に意味があるかで習慣を選べた。 - 37 歳・企画職、過去に習慣アプリを 3 回挫折。"
      />
      <CtaWaitlistForm />
      <footer className="bg-background border-t border-border">
        <div className="container max-w-6xl mx-auto px-4 md:px-8 py-8 text-xs text-muted-foreground">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-semibold">Smitch</span>
            <span className="hidden sm:inline opacity-60">Switch your path.</span>
            <a href="/privacy" className="ml-auto hover:underline">
              Privacy
            </a>
            <a href="/terms" className="hover:underline">
              Terms
            </a>
            <span>© Genetta Inc.</span>
          </nav>
        </div>
      </footer>
    </main>
  );
}
