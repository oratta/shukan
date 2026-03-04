## 1. Core: 年間impact計算ヘルパー

- [ ] 1.1 `src/lib/impact.ts`に`AnnualImpact`型と`calculateAnnualImpact(daily: DailyImpact): AnnualImpact`関数を追加（×365変換）
- [ ] 1.2 年間表示用のフォーマットヘルパー追加（`formatAnnualHealth`, `formatAnnualCurrency`等、必要に応じ既存関数を流用）

## 2. Bug Fix: Manage Evidenceバー表示修正

- [ ] 2.1 `src/components/habits/habit-detail-modal.tsx`のManage Evidenceバー（Settingsアイコンボタン）が表示されない原因を特定し修正

## 3. ImpactBadge年間表示対応

- [ ] 3.1 `src/components/habits/impact-badge.tsx`にmode prop（`'daily' | 'annual'`、デフォルト`'annual'`）を追加
- [ ] 3.2 年間modeの場合、日次値×365で表示しラベルを「/年」に変更

## 4. Evidence Manager内impact表示

- [ ] 4.1 `src/components/habits/evidence-manager-sheet.tsx`の各evidence行にweight適用後の年間impact表示を追加
- [ ] 4.2 weight slider操作時にローカルstateでリアルタイム年間impact再計算・表示
- [ ] 4.3 全evidenceの合計年間impactサマリーを表示

## 5. 全箇所の年間表示統一

- [ ] 5.1 `src/components/habits/evidence-picker.tsx`のarticle一覧を年間impact表示に変更
- [ ] 5.2 `src/app/(app)/discover/page.tsx`のArticleCardを年間impact表示に変更
- [ ] 5.3 `src/components/habits/evidence-article-sheet.tsx`のmetrics表示を年間に変更

## 6. 検証

- [ ] 6.1 ビルドが通ることを確認（`npm run build`）
- [ ] 6.2 Manage Evidenceバーが表示されることを確認
- [ ] 6.3 全箇所で年間impactが正しく表示されることを確認
