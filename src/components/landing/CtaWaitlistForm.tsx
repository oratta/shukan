'use client';

import { useState } from 'react';

const ENVIRONMENTS = ['Web (PC)', 'Web (Mobile)', 'iOS (Mobile)', 'Android (Mobile)'] as const;
const WTPS = [0, 300, 500, 1000, 2000, 3000] as const;

export function CtaWaitlistForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <section id="waitlist" className="bg-primary/5">
        <div className="container max-w-2xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="space-y-6 text-center">
            <h2 className="text-3xl md:text-4xl text-foreground font-semibold">
              ご登録ありがとうございます
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              頂いた声をもとに、Smitch をより良いプロダクトにしていきます。
            </p>
            <div className="pt-6 border-t border-border space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                なお、今回のコンセプトとは少し方向性が異なりますが、
                <br />
                エビデンスベースの習慣管理を体験できる
                <br />
                <span className="font-semibold text-foreground">
                  Smitch (Concept Prototype ver)
                </span>{' '}
                が現在公開されています。
              </p>
              <a
                href="https://s-mitch.com"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent transition"
              >
                Smitch (Concept Prototype ver) を試す →
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="waitlist" className="bg-primary/5">
      <div className="container max-w-2xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="space-y-6 md:space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl text-foreground font-semibold">
              Smitch は現在準備中です
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              あなたが「困っていること」「なりたい自分」を教えてくれれば、
              <br className="hidden sm:block" />
              要望の多いものから、科学的根拠に基づいたライフハックや習慣を
              <br className="hidden sm:block" />
              リサーチして、プロダクトに反映していきます。
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-6 bg-background rounded-lg border border-border p-6 md:p-8"
          >
            {/* honeypot */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden
            />

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">
                メールアドレス <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-foreground">
                使いたい環境（複数可） <span className="text-destructive">*</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {ENVIRONMENTS.map((env) => (
                  <label
                    key={env}
                    className="flex items-center gap-2 p-2 rounded-md border border-input cursor-pointer hover:bg-accent"
                  >
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{env}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="current_apps" className="text-sm font-semibold text-foreground">
                使っている類似アプリ{' '}
                <span className="text-xs text-muted-foreground font-normal">（任意）</span>
              </label>
              <input
                id="current_apps"
                type="text"
                placeholder="Habitify / Streaks / 何も使ってない 等"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="pain_points" className="text-sm font-semibold text-foreground">
                困っている理由 / 足りないポイント{' '}
                <span className="text-xs text-muted-foreground font-normal">（任意）</span>
              </label>
              <textarea
                id="pain_points"
                rows={3}
                placeholder="ストリークが切れると無に帰す感じ 等"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-foreground">
                困りごとが解消されるなら月いくらまで払えますか{' '}
                <span className="text-xs text-muted-foreground font-normal">（任意）</span>
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {WTPS.map((p) => (
                  <label
                    key={p}
                    className="flex items-center justify-center p-2 rounded-md border border-input cursor-pointer hover:bg-accent text-sm has-[:checked]:bg-primary has-[:checked]:text-primary-foreground"
                  >
                    <input type="radio" name="wtp" className="sr-only" />
                    <span>{p === 0 ? '¥0' : `¥${p.toLocaleString()}${p === 3000 ? '+' : ''}`}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="ideal_self" className="text-sm font-semibold text-foreground">
                どんなふうに自分を変えたいですか{' '}
                <span className="text-xs text-muted-foreground font-normal">（任意）</span>
              </label>
              <textarea
                id="ideal_self"
                rows={3}
                placeholder="もっと落ち着いて判断できる人になりたい 等"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
            >
              waitlist に登録する
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
