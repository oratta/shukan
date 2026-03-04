# Evidence Marketplace Feature - Longrun Instruction

## 概要

Shukan 習慣トラッカーアプリに「Evidence Marketplace（Discover タブ）」機能を追加する。エビデンスベースの習慣を閲覧・選択し、新しい習慣を作成したり、既存の習慣にエビデンスを紐付けたりできる機能。

## 実行フロー

**Phase 1: エビデンス記事の作成** → **Phase 2: UI デザイン (Pencil)** → **Phase 3: ユーザーレビュー** → **Phase 4: 実装**

---

## Phase 1: エビデンス記事の作成

### 目的
マーケットプレイスに表示するエビデンス記事を5件新規作成する。

### 作成する記事一覧

既存の記事（変更不要）:
- `quit_smoking` - 禁煙（既存）
- `quit_porn` - ポルノ視聴をやめる（既存）

新規作成する記事:
1. `quit_alcohol` - 禁酒
2. `daily_cardio` - 毎日有酸素運動（30分）
3. `daily_strength` - 毎日筋トレ（30分）
4. `morning_planning` - 朝イチで一日のスケジュールを立てる
5. `no_youtube` - YouTube を見ない

### 記事の作成方法

`life-impact-article` スキルを使用してエビデンスベースの記事を自動生成する。

各記事は以下の構造に従う（既存記事 `src/data/impact-articles/quit-smoking.ts` を参考）:

```typescript
export const articleData: LifeImpactArticle = {
  habitCategory: ArticleId,
  habitName: string,
  article: {
    researchBody: string,  // {{health_inference}} 等のプレースホルダー含む
    sources: { id, text, url }[],
  },
  inferences: {
    health: string,
    cost: string,
    income: string,
    cumulative: string,
  },
  calculationParams: {
    dailyHealthMinutes: number,
    dailyCostSaving: number,
    dailyIncomeGain: number,
  },
  confidenceLevel: 'high' | 'medium' | 'low',
};
```

### V2 プロフィール（全記事共通）
- 42歳日本人男性、年収1,500万円
- 残り勤務年数23年、残り寿命40年
- 日給62,500円

### 各記事に必要な情報の指針

| 記事ID | デフォルトタイプ | confidence | 参考ポイント |
|--------|-----------------|------------|-------------|
| `quit_alcohol` | quit | high | 厚労省データ、医療費、肝疾患リスク |
| `daily_cardio` | positive | high | WHO推奨、心疾患リスク低減、認知機能 |
| `daily_strength` | positive | high | 筋肉量と代謝、骨密度、糖尿病予防 |
| `morning_planning` | positive | medium | 時間管理研究、生産性向上、ストレス低減 |
| `no_youtube` | quit | medium | スクリーンタイム研究、注意力、時間コスト |

### ファイル配置
- `src/data/impact-articles/{article-id}.ts` に各記事を作成
- `src/data/impact-articles/index.ts` を更新して全記事を登録
- `src/types/impact.ts` の `ArticleId` 型を拡張

### 品質基準
- 各記事に最低3つの学術的出典（DOI付き推奨）
- `calculationParams` の値は保守的な推定（控えめに）
- `inferences` は V2_DEFAULT_PROFILE に対してパーソナライズ
- `cumulative` に1ヶ月/1年/10年の累積値を含める

---

## Phase 2: UI デザイン (Pencil)

### 目的
実装前にPencilでUIデザインを作成し、ユーザーレビューを受ける。

### デザインする画面（3-4画面）

#### 画面1: Discover タブ（マーケットプレイス一覧）
- フッターナビの4つ目のタブ「Discover」（アイコン: Compass or Search）
- カテゴリ分けしたカードリスト
  - セクション「やめる習慣」: 禁煙、禁酒、ポルノ禁止、YouTube禁止
  - セクション「続ける習慣」: 有酸素運動、筋トレ、朝スケジュール
- 各カードに表示する情報:
  - アイコン（絵文字）
  - 習慣名
  - デイリーインパクト値（健康・コスト・収入）のサマリー
  - 信頼度バッジ
- カードタップで画面2（エビデンス詳細）へ

#### 画面2: エビデンス詳細ビュー
- 既存の `ImpactArticleSheet` をベースに
- 追加要素:
  - 「この習慣を追加」ボタン（目立つ CTA）
  - エビデンス記事本文
  - 出典リスト
  - デイリーインパクトのサマリーバナー

#### 画面3: マーケットプレイスからの習慣作成フロー
- 既存の `habit-form` をベースに
- 変更点:
  - 選択したエビデンスがプリセットされている
  - 習慣名にエビデンスのタイトルがデフォルト入力（編集可能）
  - 習慣タイプがエビデンスのデフォルトタイプで設定済み（変更可能）
  - エビデンスセクションに選択済みエビデンスが表示される

#### 画面4: エビデンス管理UI（既存習慣の詳細内）
- 既存の習慣詳細モーダルに「エビデンス」セクション追加
- 紐付いたエビデンスのリスト表示
- 各エビデンスの重み(%)表示（デフォルト100%、タップで変更可能）
- 「エビデンスを追加」ボタン → マーケットプレイスの選択モードへ
- エビデンスの削除機能
- 合計インパクト値の表示（各エビデンスの重み付き合算）

### デザインの制約
- 既存アプリのデザインシステムに合わせる
- カラー: OKLCH ベース、ゴールド（#B8860B）をインパクト系に使用
- フォント: 既存と統一
- レスポンシブ: モバイルファースト（max-w-2xl）
- ダークモード対応を意識

---

## Phase 3: ユーザーレビュー

### レビューポイント
- Pencil のスクリーンショットをユーザーに提示
- 各画面のフローを説明
- フィードバックを収集し、必要に応じて修正
- **レビュー承認を得てから Phase 4 に進む**

---

## Phase 4: 実装

### 4-1. データモデル変更

#### DB マイグレーション

**新規テーブル: `habit_evidences`（ジャンクションテーブル）**
```sql
CREATE TABLE habit_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 100,  -- パーセンテージ (1-100)
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(habit_id, article_id)
);

-- RLS: habits テーブル経由でユーザー所有を検証
ALTER TABLE habit_evidences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habit evidences"
  ON habit_evidences FOR ALL
  USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));
```

**既存データのマイグレーション:**
```sql
-- 既存の impact_article_id を新テーブルに移行
INSERT INTO habit_evidences (habit_id, article_id, weight)
SELECT id, impact_article_id, 100
FROM habits
WHERE impact_article_id IS NOT NULL;

-- impact_article_id カラムは段階的に廃止（v1では残す）
```

#### TypeScript 型の変更

```typescript
// src/types/impact.ts
export type ArticleId =
  | 'quit_smoking' | 'quit_porn'
  | 'quit_alcohol' | 'daily_cardio' | 'daily_strength'
  | 'morning_planning' | 'no_youtube';

// 新規型
export interface HabitEvidence {
  id: string;
  habitId: string;
  articleId: ArticleId;
  weight: number;  // 1-100
}
```

```typescript
// src/types/habit.ts - HabitWithStats に追加
export interface HabitWithStats extends Habit {
  // ... 既存フィールド
  evidences: HabitEvidence[];  // 追加
  impactSavings?: LifeImpactSavings;  // 複数エビデンスの重み付き合算
}
```

### 4-2. Supabase データ層

`src/lib/supabase/habits.ts` に追加:
- `getHabitEvidences(habitId)` - 習慣のエビデンス一覧取得
- `addHabitEvidence(habitId, articleId, weight)` - エビデンス追加
- `updateEvidenceWeight(evidenceId, weight)` - 重み更新
- `removeHabitEvidence(evidenceId)` - エビデンス削除

### 4-3. インパクト計算の変更

`src/lib/impact.ts`:
- `calculateImpactSavings()` を変更: 複数エビデンスの重み付き合算に対応
- 計算式: `dailyValue = Σ(article.calculationParams.dailyX × evidence.weight / 100)`

### 4-4. コンポーネント実装

#### 新規コンポーネント
- `src/app/(app)/discover/page.tsx` - Discover ページ
- `src/components/discover/evidence-card.tsx` - エビデンスカード
- `src/components/discover/evidence-detail-sheet.tsx` - エビデンス詳細シート
- `src/components/habits/evidence-manager.tsx` - エビデンス管理UI

#### 変更するコンポーネント
- `src/components/layout/bottom-nav.tsx` - 4つ目のタブ追加
- `src/components/habits/habit-form.tsx` - エビデンスプリセット対応
- `src/components/habits/habit-detail-modal.tsx` - エビデンスセクション追加
- `src/components/habits/habit-card.tsx` - 複数エビデンス対応
- `src/hooks/useHabits.ts` - エビデンスCRUD操作追加

### 4-5. i18n

`src/messages/ja.json` と `en.json` に追加:
- `discover.title` - "おすすめ" / "Discover"
- `discover.quitSection` - "やめる習慣" / "Quit Habits"
- `discover.buildSection` - "続ける習慣" / "Build Habits"
- `discover.addHabit` - "この習慣を追加" / "Add This Habit"
- `evidence.manage` - "エビデンス管理" / "Manage Evidence"
- `evidence.add` - "エビデンスを追加" / "Add Evidence"
- `evidence.weight` - "適用率" / "Apply Rate"
- `evidence.remove` - "削除" / "Remove"
- 各記事の habitName の翻訳

### 4-6. ルーティング

- `/discover` - Discover ページ（`src/app/(app)/discover/page.tsx`）
- クエリパラメータ: `?from=habit&habitId=xxx` で既存習慣へのエビデンス追加モード

---

## 制約・注意事項

### 技術的制約
- Supabase RLS ポリシーを必ず設定する
- `supabase db push` でマイグレーション適用（ユーザーに依頼しない）
- 既存の `impactArticleId` との後方互換性を維持
- ビルドエラーなしを確認してからコミット

### UX の指針
- マーケットプレイスは「探す・見つける」体験
- エビデンスの重み調整は上級設定（目立たせない）
- 習慣作成時のフリクションを最小化（エビデンスから1タップで作成開始）
- 既存の習慣カードUIとの一貫性を保つ

### エビデンス記事に含めるデフォルトタイプ

各エビデンス記事に推奨習慣タイプ（positive/quit）を持たせる:

| 記事 | デフォルトタイプ | デフォルトアイコン |
|------|-----------------|-------------------|
| quit_smoking | quit | 🚭 |
| quit_porn | quit | 🧠 |
| quit_alcohol | quit | 🍷 |
| daily_cardio | positive | 🏃 |
| daily_strength | positive | 💪 |
| morning_planning | positive | 📋 |
| no_youtube | quit | 📵 |

### スコープ外（今回は実装しない）
- V3 LLM 推論（ユーザープロフィールベース）
- エビデンス記事の検索・フィルタリング
- ユーザー生成エビデンス
- エビデンスのお気に入り機能
- カスタムエビデンス記事の作成UI

---

## 完了条件

- [ ] 5件の新規エビデンス記事が作成されている
- [ ] Pencil デザインが作成・レビュー済み
- [ ] DB マイグレーションが適用されている
- [ ] Discover ページが動作する
- [ ] マーケットプレイスから習慣作成ができる
- [ ] 既存習慣にエビデンスを追加できる
- [ ] エビデンスの重み調整ができる
- [ ] インパクト値が複数エビデンスの重み付き合算で表示される
- [ ] i18n 対応（ja/en）
- [ ] ビルドエラーなし
- [ ] ブラウザで動作確認済み
