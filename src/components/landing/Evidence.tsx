import Image from 'next/image';

const metrics = [
  { label: '健康寿命', value: '+3.2 年', token: '--impact-health' },
  { label: '生涯コスト', value: '-¥4.8M', token: '--impact-cost' },
  { label: '可処分時間', value: '+0.8h/日', token: '--impact-income' },
];

export function Evidence() {
  return (
    <section className="bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl text-foreground font-semibold leading-tight">
              科学的根拠で、習慣を選ぶ
            </h2>
            <div className="space-y-4 text-foreground/85 leading-relaxed">
              <p>
                ハーバード大学の研究によると、「なりたい自分の姿」を明確に言語化したグループは、
                習慣の長期継続率が <span className="font-semibold text-foreground">約 3 倍</span>{' '}
                高いことが示されています。
              </p>
              <p>
                行動科学の知見では、「習慣そのもの」を目的化するより、「その習慣がもたらす自己像」に
                フォーカスする方が、内発的な動機づけが続くとされています。
              </p>
              <p className="text-sm text-muted-foreground pt-2">
                Smitch は、こうした研究に基づき、あなたのバリューに紐づくインパクトを
                health / cost / time の 3 軸で可視化します。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="space-y-1 p-3 rounded-md bg-secondary/60"
                >
                  <div className="text-xs text-muted-foreground">{m.label}</div>
                  <div
                    className="text-base md:text-lg font-semibold"
                    style={{ color: `var(${m.token})` }}
                  >
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-border">
              <Image
                src="/landing/evidence.png"
                alt="科学書とリーディンググラスのある静かな机"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
