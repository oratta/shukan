# Tasks: Weekday Labels on Past-Day Dots

## Group 1: 実装

- [ ] 1.1: `src/components/habits/habit-card.tsx` — `useLocale` を next-intl からインポート追加
- [ ] 1.2: `src/components/habits/habit-card.tsx` — `recentDays.slice(1).map()` 内の各 DayStatusDot を `flex flex-col items-center gap-0.5` の div でラップし、上部に曜日ラベルを追加

## Group 2: 検証

- [ ] 2.1: `npx tsc --noEmit` — 型エラーなし（既存エラーのみ、新規なし）
- [ ] 2.2: `npx next build` — ビルドエラーなし
- [ ] 2.3: ブラウザで日本語ロケール確認 — ドット上に `月` `火` `水` 等が表示される
- [ ] 2.4: ブラウザで英語ロケール確認 — ドット上に `M` `T` `W` 等が表示される
