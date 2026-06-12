---
phase: Setup
status: complete
last_updated: 2026-06-12T10:55:00+09:00
---

# Checkpoint: 2026-06-12_onboarding-kpi

## ツール検証結果
- openspec: /Users/oratta/.volta/bin/openspec (v1.2.0) ← `which openspec` 出力を転記
- git: 2.40.1 on branch `onboarding-data-setup`
- openspec/ 初期化済み（changes/ specs/ schemas/longrun-tdd/ 存在、config.yaml は .gitignore:57 で除外済み）
- カスタムスキーマ longrun-tdd: セットアップ済み（templates/apply.md, propose.md ほか）

## テストベースライン
- `npm run test:run` (Vitest): **11 files / 197 tests 全PASS**（npm install 後に実行）

## 完了フェーズ
- [x] Setup: ツール検証・コードベース調査・ベースライン記録完了
- [ ] Build Contract
- [ ] Build
- [ ] Verify
- [ ] Feedback
- [ ] Archive

## コードベース調査サマリー（Explore Agent 実施）
- 記事: `src/data/impact-articles/` 37ファイル。`ImpactArticle` 型は `src/types/impact.ts:90-135`（calculationParams: dailyHealthMinutes/dailyCostSaving/dailyIncomeGain）
- 計算: `src/lib/impact.ts` 5関数 + DailyImpact/AnnualImpact/LifeImpactSavings（3軸: healthMinutes/costSaving/incomeGain）
- DB層: `src/lib/supabase/habits.ts`（snake↔camel手動マッピング）、client.ts/server.ts 分離
- 認証: `src/middleware.ts`（auth リダイレクトのみ）、`src/app/(app)/layout.tsx` は Server Component
- i18n: `src/i18n/request.ts`（cookie locale）、`src/messages/{ja,en}.json`
- マイグレーション: 14ファイル。user_settings の RLS パターン（auth.uid() = user_id で select/insert/update）が user_profiles の参照型
- habit_evidences: `insertHabit` → `replaceHabitEvidences(habitId, [{articleId, weight}])` の流れ（useHabits:82-99）
- CSS: `src/app/globals.css` OKLch 変数体系（--impact-health 等）+ .dark 再定義

## Changes状態
| Change | 依存 | Status |
|--------|------|--------|
| change-A: kpi-data-foundation | 独立 | Pending |
| change-B: user-profiles-db | A | Pending |
| change-C: onboarding-flow | A, B | Pending |

## 次フェーズへの引き継ぎ
- 依存が A→B→C の直列。worktree 並列化の余地は限定的（A 完了後に B、B 完了後に C）
- plan.md の受け入れ条件 15項目
- 確定ドキュメント: docs/context/onboarding-screens.md（文言）/ onboarding-data-model.md（データモデル）
