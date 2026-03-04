# Proposal: 計算ロジック表示 + フィードバック機能

## Why

エビデンス記事の数値（健康寿命、コスト削減、収入増加）がどのように算出されているかユーザーに透明性がなく、信頼性に疑問を持たれる可能性がある。実際に禁煙記事の dailyHealthMinutes に計算ミスが発見されており、全30記事の整合性検証も必要。ユーザーからのフィードバック収集機能を追加し、将来的にLLMによる自動調査・修正に繋げる。

## What Changes

1. **LifeImpactArticle 型拡張**: 各記事に構造化された `calculationLogic` フィールドを追加（3指標 × ステップ配列）
2. **計算ロジック表示UI**: エビデンス記事シートのSources下に展開可能な計算根拠セクション
3. **フィードバック機能**: バッドマーク（数値疑問報告）+ 自由コメント投稿
4. **全30記事の検証・修正**: calculationParams の整合性チェックと矛盾修正
5. **article_feedbacks テーブル**: Supabase に新テーブル + RLS + 集計View

## Capabilities

### calculation-logic
- CalcStep 型の定義と LifeImpactArticle への組み込み
- 3指標（health/cost/income）ごとの計算ステップ表示
- 展開・折りたたみUI

### article-feedback
- article_feedbacks テーブル（bad マーク + comment）
- RLS ポリシー（ユーザー自身のフィードバックのみ操作可）
- 集計View（article_feedback_stats）
- バッドマークのトグルUI + コメント入力・送信UI

## Impact

- `src/types/impact.ts` — CalcStep 型追加、LifeImpactArticle 拡張
- `src/components/habits/evidence-article-sheet.tsx` — UI追加（計算ロジック + フィードバック）
- `src/lib/supabase/feedbacks.ts` — 新規（フィードバックCRUD）
- `src/data/impact-articles/*.ts` — 全30ファイルに calculationLogic 追加 + 数値修正
- `src/messages/ja.json`, `src/messages/en.json` — i18n キー追加
- `supabase/migrations/` — マイグレーションSQL追加
