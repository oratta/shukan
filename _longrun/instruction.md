# 計算ロジック表示 + フィードバック機能 + 全記事の計算検証・修正

## 概要

エビデンス記事の数値（dailyHealthMinutes, dailyCostSaving, dailyIncomeGain）の算出根拠を構造化データとして各記事に追加し、記事シートのSources下に展開可能セクションとして表示する。加えて、ユーザーが数値根拠に疑問を感じた際のバッドマーク＋自由コメント機能を実装する。最後に全30記事の計算ロジックを作成し、矛盾を検出・修正する。

## 実行フロー

**Phase 1: データモデル拡張** → **Phase 2: UI実装** → **Phase 3: 全30記事の計算ロジック作成 + 矛盾チェック・修正** → **Phase 4: ビルド検証 + コミット**

---

## Phase 1: データモデル拡張

### 1.1 LifeImpactArticle 型に calculationLogic フィールド追加

`src/types/impact.ts` の `LifeImpactArticle` に以下を追加:

```typescript
calculationLogic: {
  health: CalcStep[];
  cost: CalcStep[];
  income: CalcStep[];
};
```

```typescript
export interface CalcStep {
  label: string;      // ステップの説明（例: "研究結果"）
  value?: string;     // 値（例: "10年延命"）
  formula?: string;   // 計算式（例: "8年 × 525,600分 ÷ 40年 ÷ 365日"）
  result?: string;    // 結果（例: "288分/日"）
}
```

### 1.2 article_feedbacks テーブル（Supabase マイグレーション）

```sql
CREATE TABLE article_feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('bad', 'comment')),
  content text,  -- type='comment' の場合の自由入力テキスト
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE article_feedbacks ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のフィードバックを操作可能
CREATE POLICY "Users can insert own feedback"
  ON article_feedbacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own feedback"
  ON article_feedbacks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedback"
  ON article_feedbacks FOR DELETE
  USING (auth.uid() = user_id);

-- 集計View（全ユーザーの統計、将来LLM調査用）
CREATE VIEW article_feedback_stats AS
SELECT
  article_id,
  COUNT(*) FILTER (WHERE type = 'bad') AS bad_count,
  COUNT(*) FILTER (WHERE type = 'comment') AS comment_count,
  MAX(created_at) AS last_feedback_at
FROM article_feedbacks
GROUP BY article_id;
```

### 1.3 Supabase データ層

`src/lib/supabase/feedbacks.ts` を新規作成:
- `submitBadMark(articleId: string): Promise<void>` — バッドマーク投稿（同一ユーザー・同一記事で1回まで）
- `removeBadMark(articleId: string): Promise<void>` — バッドマーク取消
- `submitComment(articleId: string, content: string): Promise<void>` — コメント投稿
- `getUserFeedback(articleId: string): Promise<{ hasBadMark: boolean }>` — 自分のフィードバック取得
- snake_case ↔ camelCase マッピング

---

## Phase 2: UI実装

### 2.1 展開可能な計算ロジックセクション

`src/components/habits/evidence-article-sheet.tsx` の Sources セクションの下に追加:

- 折りたたみ可能（デフォルト閉じ）
- ヘッダー: 「計算ロジック」+ ChevronDown/ChevronUp アイコン
- 中身: 3指標（健康寿命 / コスト削減 / 収入増加）ごとにステップを表示
- 各ステップ: label → value/formula → result の流れで表示
- コンパクトなデザイン（text-xs, muted-foreground）

### 2.2 フィードバックセクション

計算ロジックセクションの下に配置:

- 「この数値に疑問がありますか？」というテキスト
- バッドマーク（ThumbsDown アイコン）ボタン — トグル式（押すと色が変わる）
- バッドマーク済みの場合: コメント入力欄が表示される（textarea + 送信ボタン）
- コメント送信後: 「フィードバックありがとうございます」トースト表示

### 2.3 i18n キー追加

`src/messages/ja.json` と `src/messages/en.json` に以下を追加:
- `evidence.calculationLogic` — 「計算ロジック」/ "Calculation Logic"
- `evidence.healthLabel` / `evidence.costLabel` / `evidence.incomeLabel` — 指標ラベル
- `evidence.feedbackQuestion` — 「この数値に疑問がありますか？」/ "Do you question these numbers?"
- `evidence.feedbackThanks` — 「フィードバックありがとうございます」/ "Thanks for your feedback"
- `evidence.commentPlaceholder` — 「具体的にどこがおかしいか教えてください」/ "Tell us what seems off"
- `evidence.submit` — 「送信」/ "Submit"

---

## Phase 3: 全30記事の計算ロジック作成 + 矛盾チェック・修正

### 3.1 計算方針の統一ルール

全記事で統一する計算方法:

**健康寿命（dailyHealthMinutes）**:
- 研究の延命効果をユーザープロフィール（42歳日本人男性）で調整
- 残存寿命で日割り: `効果年数 × 525,600分 ÷ 残存寿命年数 ÷ 365日`
- 「統計的期待値」であることを calculationLogic のステップで明記

**コスト削減（dailyCostSaving）**:
- 直接コスト（購入費など）+ 間接コスト（医療費など）の積み上げ
- 日本の価格データを使用

**収入増加（dailyIncomeGain）**:
- 研究の効果量（%）× ユーザー年収（¥15,000,000）÷ 365日
- 複数の経路（生産性向上、欠勤減少等）は個別に計算して合算

### 3.2 作業手順（各記事ごと）

1. 既存の `calculationParams` の値を確認
2. コードコメントの Research basis を読む
3. inferences テキストの数値を確認
4. cumulative テキストの数値を確認
5. 以下の整合性チェックを実行:
   - **健康寿命**: 研究の効果量 → ユーザープロフィール調整 → dailyHealthMinutes への変換が数学的に正しいか
   - **コスト**: 個別コスト項目の積み上げ → dailyCostSaving と一致するか
   - **収入**: 収入プレミアム計算 → dailyIncomeGain と一致するか
   - **累積**: dailyX × 30日/365日/3650日 が cumulative テキストの数値と一致するか
6. 矛盾があれば:
   - calculationParams の数値を修正
   - inferences テキストの数値を修正
   - cumulative テキストの数値を修正
7. `calculationLogic` フィールドを構造化データで追加

### 3.3 禁煙（quit_smoking）の既知の問題

先に発見済みの計算ミス:
- 研究: 30歳で禁煙 → 10年延命、42歳調整 → 約8年
- 現在の計算: `dailyHealthMinutes: 12` → 40年で約4ヶ月（8年に遠く及ばない）
- 正しい計算: `8年 × 525,600分 ÷ 40年 ÷ 365日 = 288分/日`
- この修正を起点に、全記事の健康寿命計算を統一ルールで再計算する

### 3.4 全30記事のリスト

以下の順序で処理する:

**Quit系（9記事）**:
1. quit_smoking ← 既知のバグあり
2. quit_porn
3. quit_alcohol
4. quit_sugar
5. quit_junk_food
6. quit_social_media
7. no_youtube
8. no_screens_before_bed
9. no_impulse_buying

**Exercise系（5記事）**:
10. daily_cardio
11. daily_strength
12. daily_walking
13. daily_stretching
14. daily_yoga

**その他（16記事）**:
15. cold_shower
16. daily_meditation
17. daily_journaling
18. gratitude_practice
19. sleep_7hours
20. wake_early
21. drink_water
22. eat_vegetables
23. intermittent_fasting
24. home_cooking
25. morning_planning
26. daily_reading
27. deep_work
28. learn_language
29. daily_saving
30. time_in_nature

---

## Phase 4: ビルド検証 + コミット

- TypeScript 型チェック（`npx tsc --noEmit`）
- Next.js ビルド（`npx next build`）
- Supabase マイグレーション適用（`supabase db push`）
- 適切な単位でコミット:
  1. `feat(types): add calculationLogic to LifeImpactArticle and CalcStep type`
  2. `feat(db): add article_feedbacks table and stats view`
  3. `feat(ui): add calculation logic section and feedback UI`
  4. `fix(articles): verify and fix calculation logic for all 30 articles`（または記事グループごとに分割）
- life-impact-article スキル（SKILL.md）も calculationLogic の追加手順を反映して更新

---

## 制約・注意事項

- i18n: ja/en 両方を更新すること
- CalcStep の label/value/formula/result は日本語で記載（V2はハードコードプロフィール）
- バッドマークは同一ユーザー・同一記事で1回まで（トグル式）
- コメントは複数投稿可
- article_feedback_stats View は将来のLLM調査用であり、今回のUIでは使わない
- Phase 3 で矛盾修正した場合、inferences テキストと cumulative テキストも連動して修正すること

---

## 完了条件

**必須条件（ワークフロー成果物）:**
- [ ] OpenSpec 仕様（proposal.md, spec.md, design.md, tasks.md）が作成・レビュー済み
- [ ] テストが作成され全てPASSしている
- [ ] ビルドエラーなし（型チェック + ビルド）

**機能固有の条件:**
- [ ] CalcStep 型と calculationLogic フィールドが LifeImpactArticle に追加されている
- [ ] article_feedbacks テーブルと RLS ポリシーが作成されている
- [ ] article_feedback_stats View が作成されている
- [ ] Supabase データ層（feedbacks.ts）が実装されている
- [ ] 計算ロジック展開セクションが evidence-article-sheet に表示される
- [ ] バッドマーク + コメント機能が動作する
- [ ] i18n 対応（ja/en）
- [ ] 全30記事に calculationLogic が追加されている
- [ ] 全30記事の calculationParams が整合性チェック済みで矛盾なし
- [ ] inferences / cumulative テキストが修正済みの calculationParams と一致
- [ ] life-impact-article スキルが更新されている
