const steps = [
  {
    no: '01',
    title: 'なりたい自分を選ぶ',
    desc: 'テンプレートまたは自由入力で、あなたが向かいたい姿を言語化します。年齢・状況を加味してパーソナライズ。',
  },
  {
    no: '02',
    title: '科学が習慣を導く',
    desc: '「なりたい自分」を KPA（Key Performance Area）に分解し、研究に基づいた数値でインパクトを可視化します。',
  },
  {
    no: '03',
    title: '1 週間で実感、次にアンロック',
    desc: '1 つの習慣を 1 週間トラッキング。連続達成で次の習慣が解放されます。一歩ずつ、確実に。',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-secondary/30">
      <div className="container max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="space-y-10 md:space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl text-foreground font-semibold">使い方</h2>
            <p className="text-muted-foreground">3 ステップで、最短コースを歩み始める</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.no}
                className="space-y-3 p-6 rounded-lg bg-background border border-border"
              >
                <div className="text-3xl text-primary font-bold tracking-tight">{step.no}</div>
                <h3 className="font-semibold text-lg md:text-xl text-foreground">{step.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
