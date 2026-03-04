## 1. Icon Infrastructure

- [x] 1.1 `src/lib/icon-registry.ts`を新規作成: ICON_REGISTRYマッピング（約50個のLucide名→コンポーネント）とICON_OPTIONS（Picker用24個）を定義
- [x] 1.2 `src/components/ui/habit-icon.tsx`を新規作成: HabitIconレンダラー（Lucide名→コンポーネント解決、絵文字フォールバック）

## 2. Impact Metrics絵文字→Lucide

- [x] 2.1 `src/components/habits/impact-badge.tsx`: 🏥💰📈をHeartPulse/Wallet/TrendingUpに置換
- [x] 2.2 `src/components/habits/evidence-manager-sheet.tsx`: total + per-evidence行の🏥💰📈をLucideに置換
- [x] 2.3 `src/components/habits/evidence-picker.tsx`: article一覧の🏥💰📈をLucideに置換
- [x] 2.4 `src/components/habits/evidence-article-sheet.tsx`: impact badges部分の🏥💰📈をLucideに置換
- [x] 2.5 `src/app/(app)/discover/page.tsx`: ArticleCardの🏥💰📈をLucideに置換
- [x] 2.6 `src/components/habits/savings-card.tsx`: 🏥💰📈をLucideに置換
- [x] 2.7 `src/components/habits/impact-article-sheet.tsx`: 全6箇所の🏥💰📈をLucideに置換
- [x] 2.8 `src/app/(app)/stats/page.tsx`: habits impact行の🏥💰📈をLucideに置換

## 3. UI装飾絵文字→Lucide

- [x] 3.1 `src/components/habits/streak-badge.tsx`: 🔥→Flame
- [x] 3.2 `src/components/habits/habit-list.tsx`: 🌱→Sprout (empty state)
- [x] 3.3 `src/app/(app)/stats/page.tsx`: 📊→BarChart3 (empty state)
- [x] 3.4 `src/components/habits/habit-form.tsx`: 💪→Dumbbell、🛡️→Shield（セクションヘッダー）

## 4. Article defaultIcon変更

- [x] 4.1 `src/data/impact-articles/*.ts` 30ファイルの`defaultIcon`を絵文字からLucide kebab-case名に変更
- [x] 4.2 `src/data/impact-articles/index.ts`: defaultIconの型がstringのまま動作することを確認

## 5. defaultIconの表示箇所をHabitIcon利用に変更

- [x] 5.1 `src/components/habits/evidence-manager-sheet.tsx`: article.defaultIcon表示をHabitIconに変更
- [x] 5.2 `src/components/habits/evidence-picker.tsx`: article.defaultIcon表示をHabitIconに変更
- [x] 5.3 `src/components/habits/habit-detail-modal.tsx`: evidence list内のarticle.defaultIcon表示をHabitIconに変更
- [x] 5.4 `src/components/habits/habit-form.tsx`: evidence tag内のarticle.defaultIcon表示をHabitIconに変更

## 6. Habit Icon Picker変更

- [x] 6.1 `src/components/habits/habit-form.tsx`: EMOJI_OPTIONSをICON_OPTIONS(Lucide名配列)に差し替え、グリッドをHabitIconで描画
- [x] 6.2 habit.icon表示箇所（stats/page.tsx等）でHabitIconを使用

## 7. Hero画像オーバーレイ削除

- [x] 7.1 `src/components/habits/evidence-article-sheet.tsx`: text-6xl defaultIconオーバーレイを削除
- [x] 7.2 `src/app/(app)/discover/page.tsx`: ArticleCardのtext-4xl iconオーバーレイを削除、iconプロパティ自体もカード内不要部分を削除

## 8. 検証

- [x] 8.1 ビルドが通ることを確認（`npm run build`）
- [x] 8.2 既存の絵文字iconを持つhabitが正しく表示されることを確認（後方互換）
