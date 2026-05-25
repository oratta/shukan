const rows = [
  {
    existing: '「何をやるか」を自分で決める',
    smitch: '「なりたい自分」から科学が習慣を導く',
  },
  {
    existing: '習慣そのものにフォーカス',
    smitch: 'どんな人間になるかにフォーカス',
  },
  {
    existing: '続けることを手伝う（Tracker）',
    smitch: '選ぶ → 身につける → 次へ進むを支援',
  },
  {
    existing: 'ストリークやゲーミフィケーション',
    smitch: 'バリューに紐づくインパクトの可視化',
  },
];

export function WhySmitch() {
  return (
    <section id="why" className="bg-background">
      <div className="container max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="space-y-10 md:space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl text-foreground font-semibold">
              なぜ Smitch なのか
            </h2>
            <p className="text-muted-foreground">既存の習慣アプリと、どう違うのか</p>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary">
                  <th className="px-4 md:px-6 py-4 text-sm font-semibold text-muted-foreground w-1/2">
                    既存の習慣アプリ
                  </th>
                  <th className="px-4 md:px-6 py-4 text-sm font-semibold text-foreground w-1/2">
                    Smitch
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 md:px-6 py-4 text-sm md:text-base text-muted-foreground align-top">
                      {row.existing}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm md:text-base text-foreground font-medium align-top">
                      {row.smitch}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xl md:text-2xl text-foreground font-semibold pt-2">
            だから、人生が動く。
          </p>
        </div>
      </div>
    </section>
  );
}
