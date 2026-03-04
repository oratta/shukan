# Life Impact Feature — アーキテクチャ設計

## 概要

習慣の1日ごとの達成が人生に与えるインパクトを3指標（健康寿命・コスト削減・収入増加）で定量化し、エビデンスベースの記事と累積貯金ビューで可視化する機能。

---

## 設計方針

### 原則
1. **記事データは静的** — ビルド時にバンドル、DB不要
2. **貯金は導出データ** — completions数 × daily値で算出、保存不要
3. **純粋関数の維持** — `getHabitsWithStats()`はデータ依存を注入で受け取り、静的importしない
4. **既存パターンに従う** — snake_case↔camelCase変換、useHabitsフック拡張
5. **最小限のDB変更** — habitsテーブルに1カラム追加のみ
6. **V3移行を設計に組み込む** — テンプレート展開はV2でもランタイム関数で行う

### 記事の2層構造（重要）
記事は「普遍的な研究結果」と「ユーザーへの推論適用」の2層で構成される:

```
┌─────────────────────────────────────────────────────┐
│  researchBody（固定レイヤー）                         │
│  - 誰が読んでもモチベーションになる研究結果            │
│  - 出典つきのエビデンス紹介                           │
│  - プレースホルダーなし、全ユーザー共通                │
│                                                      │
│  例: 「英国医師5万人を50年追跡した研究によると、       │
│       禁煙した人は約10年の延命効果がある」             │
└─────────────────────────┬───────────────────────────┘
                          │ ここに推論セクションを挿入
┌─────────────────────────▼───────────────────────────┐
│  inferences（推論レイヤー — ユーザーごとに異なる）     │
│  - 研究結果 → あなたへの適用 → 調整理由 → 数値        │
│  - 3指標それぞれに推論段落がある                       │
│  - V2: プロフィール固定で事前作成                      │
│  - V3: LLMがユーザープロフィールから動的生成            │
│                                                      │
│  例: 「あなたは42歳の日本人男性です。この研究は英国人  │
│       を対象としていますが、喫煙の健康被害メカニズムは  │
│       人種を問わず共通です。日本人男性の平均寿命が長い  │
│       ため、残存寿命ベースで計算すると1日約12分の延伸  │
│       に相当します。」                                 │
└─────────────────────────────────────────────────────┘
```

**なぜ数値だけのプレースホルダーではダメか:**
- 研究が「20代男性」を対象にしていて、ユーザーが50代なら、数値が下がる
- 数値だけ下がっていると「なぜ？」となる
- 「50代では筋タンパク合成率が約20%低下するため、少なく見積もっても...」という推論過程が必要
- つまりプレースホルダーは「数値」ではなく「推論段落まるごと」

### V2→V3の境界
- V2: `researchBody`は静的、`inferences`はハードコードプロフィール用に事前作成（静的テキスト）
- V3: `researchBody`は同じ、`inferences`をLLMがユーザープロフィールから動的生成

---

## 1. データモデル

### 1.1 新しい型定義 (`src/types/impact.ts`)

```typescript
// 有効な記事IDの型安全な定義
export type ArticleId = 'quit_smoking' | 'quit_porn';

// 記事データ（静的、ビルド時バンドル）
export interface LifeImpactArticle {
  habitCategory: ArticleId;
  habitName: string;               // "禁煙", "ポルノ視聴をやめる"

  // 固定レイヤー: 普遍的な研究結果（全ユーザー共通）
  article: {
    // 研究紹介テキスト。{{health_inference}}, {{cost_inference}},
    // {{income_inference}}, {{cumulative}} をブロックプレースホルダーとして含む。
    // 数値プレースホルダー（{{daily_health_minutes}}等）は含まない。
    researchBody: string;
    sources: {
      id: number;
      text: string;
      url?: string;
    }[];
  };

  // 推論レイヤー: ユーザープロフィールに基づく推論段落
  // V2: ハードコードプロフィール用に事前作成
  // V3: LLMがユーザープロフィールから動的生成
  inferences: {
    health: string;    // 健康寿命: 研究→ユーザー適用→調整理由→数値を含む段落
    cost: string;      // コスト: 同上
    income: string;    // 収入: 同上
    cumulative: string; // 累積効果: 1ヶ月/1年/10年の数値と意味を含む段落
  };

  // 計算用パラメータ（貯金計算に使用、記事表示とは独立）
  calculationParams: {
    dailyHealthMinutes: number;    // 分/日
    dailyCostSaving: number;       // ¥/日
    dailyIncomeGain: number;       // ¥/日
  };

  confidenceLevel: 'high' | 'medium' | 'low';
}

// V2ハードコードプロフィール
export const V2_DEFAULT_PROFILE = {
  nationality: 'Japanese' as const,
  gender: 'male' as const,
  birthYear: 1984,
  age: 42,
  annualIncome: 15_000_000,
  currency: 'JPY' as const,
  remainingWorkingYears: 23,
  dailyWage: 62_500,
  remainingLifeExpectancy: 40,
  userContext: '42歳の日本人男性（年収1,500万円）',
};

// 累積インパクト（算出値、保存なし）
export interface LifeImpactSavings {
  completedDays: number;
  healthMinutes: number;           // 累積分
  costSaving: number;              // 累積¥
  incomeGain: number;              // 累積¥
}
```

### 1.2 既存型の拡張 (`src/types/habit.ts`)

```typescript
import type { ArticleId, LifeImpactSavings } from './impact';

export interface Habit {
  // ... 既存フィールド
  impactArticleId?: ArticleId;        // ← 新規追加: 記事データへの型安全キー
}

export interface HabitWithStats extends Habit {
  // ... 既存フィールド
  impactSavings?: LifeImpactSavings;  // ← 新規追加: 算出済み貯金
}
```

### 1.3 DBスキーマ変更

```sql
-- マイグレーション: 1カラム追加のみ
ALTER TABLE habits ADD COLUMN IF NOT EXISTS impact_article_id TEXT;
```

RLSポリシー変更: なし（既存のhabitsポリシーでカバー）

---

## 2. 記事データの格納

### 構成

```
src/data/impact-articles/
  ├── index.ts              // Map + getArticle/getArticleList をexport
  ├── quit-smoking.ts       // 禁煙
  ├── quit-porn.ts          // ポルノ視聴をやめる
  └── ...                   // 習慣ごとに追加
```

### index.ts

```typescript
import { quitSmoking } from './quit-smoking';
import { quitPorn } from './quit-porn';
import type { LifeImpactArticle, ArticleId } from '@/types/impact';

const impactArticles: Map<ArticleId, LifeImpactArticle> = new Map([
  ['quit_smoking', quitSmoking],
  ['quit_porn', quitPorn],
]);

export function getArticle(id: ArticleId): LifeImpactArticle | undefined {
  return impactArticles.get(id);
}

export function getArticleList(): { id: ArticleId; name: string }[] {
  return Array.from(impactArticles.entries()).map(([id, article]) => ({
    id,
    name: article.habitName,
  }));
}
```

### 選定理由: 静的ファイル vs DBテーブル

| 観点 | 静的ファイル | DBテーブル |
|------|-------------|-----------|
| 実装コスト | ◎ ファイル追加のみ | △ migration + CRUD + RLS |
| パフォーマンス | ◎ ビルド時バンドル | △ API呼び出し必要 |
| オフライン | ◎ 動作する | × DB接続必要 |
| V3移行 | ○ calculations部分をランタイム計算に切替 | ◎ そのまま |
| 新規記事追加 | △ デプロイ必要 | ○ DB操作のみ |

V2では記事数が限られるため静的ファイルが最適。

---

## 3. 計算ロジック (`src/lib/impact.ts`)

```typescript
import type { HabitCompletion, HabitWithStats } from '@/types/habit';
import type { LifeImpactArticle, LifeImpactSavings } from '@/types/impact';

/**
 * 1つの習慣のインパクト貯金を計算
 * completions数（達成日数）× 1日あたりの値
 */
export function calculateImpactSavings(
  habitId: string,
  completions: HabitCompletion[],
  article: LifeImpactArticle
): LifeImpactSavings {
  const completedDays = completions.filter(
    (c) => c.habitId === habitId &&
           (c.status === 'completed' || c.status === 'rocket_used')
  ).length;

  return {
    completedDays,
    healthMinutes: completedDays * article.calculationParams.dailyHealthMinutes,
    costSaving: completedDays * article.calculationParams.dailyCostSaving,
    incomeGain: completedDays * article.calculationParams.dailyIncomeGain,
  };
}

/**
 * 全習慣の合計インパクト貯金
 * HabitWithStats[]を直接受け取る（呼び出し側でMap構築不要）
 */
export function calculateTotalSavings(
  habits: HabitWithStats[]
): LifeImpactSavings {
  const initial: LifeImpactSavings = {
    completedDays: 0,
    healthMinutes: 0,
    costSaving: 0,
    incomeGain: 0,
  };
  return habits.reduce((total, habit) => {
    if (!habit.impactSavings) return total;
    return {
      completedDays: total.completedDays + habit.impactSavings.completedDays,
      healthMinutes: total.healthMinutes + habit.impactSavings.healthMinutes,
      costSaving: total.costSaving + habit.impactSavings.costSaving,
      incomeGain: total.incomeGain + habit.impactSavings.incomeGain,
    };
  }, initial);
}

/**
 * researchBody + inferences を結合して完成記事を生成
 * researchBody内の {{health_inference}}, {{cost_inference}},
 * {{income_inference}}, {{cumulative}} を推論段落で置換
 */
export function renderArticle(article: LifeImpactArticle): string {
  const replacements: Record<string, string> = {
    health_inference: article.inferences.health,
    cost_inference: article.inferences.cost,
    income_inference: article.inferences.income,
    cumulative: article.inferences.cumulative,
  };

  return article.article.researchBody.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => replacements[key] ?? `{{${key}}}`
  );
}

/**
 * 分を人間が読める形式に変換
 */
export function formatHealthMinutes(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes);
  if (rounded < 60) return `${rounded}分`;
  if (rounded < 1440) {
    const h = Math.floor(rounded / 60);
    const m = rounded % 60;
    if (m === 0) return `${h}時間`;
    return `${h}時間${m}分`;
  }
  const days = Math.floor(rounded / 1440);
  const hours = Math.floor((rounded % 1440) / 60);
  if (hours === 0) return `${days}日`;
  return `${days}日${hours}時間`;
}

/**
 * 金額をフォーマット
 */
export function formatCurrency(amount: number): string {
  if (amount >= 100_000) return `¥${Math.floor(amount / 10000)}万`;
  if (amount >= 10_000) return `¥${(amount / 10000).toFixed(1)}万`;
  return `¥${Math.round(amount).toLocaleString()}`;
}

// V2_DEFAULT_PROFILE は @/types/impact から直接 import して使う
// renderArticle は上で定義済みのため re-export 不要
```

---

## 4. 既存コードへの統合

### 4.1 Supabase CRUD (`src/lib/supabase/habits.ts`)

変更箇所:
- `HabitRow`に`impact_article_id`追加
- `toHabit()`に変換追加
- `insertHabit()`, `updateHabitById()`にフィールド追加

```typescript
// HabitRow
interface HabitRow {
  // ... 既存
  impact_article_id: string | null;  // 追加
}

// toHabit
function toHabit(row: HabitRow): Habit {
  return {
    // ... 既存
    impactArticleId: (row.impact_article_id as ArticleId) ?? undefined,  // 追加
  };
}

// insertHabit .insert({}) 内
impact_article_id: habit.impactArticleId ?? null,

// updateHabitById row構築
if (updates.impactArticleId !== undefined) {
  row.impact_article_id = updates.impactArticleId ?? null;  // null で解除をサポート
}
```

### 4.2 HabitWithStats計算 (`src/lib/habits.ts`)

**重要: `getArticle`を直接importしない。注入パラメータとして受け取る。**

```typescript
import type { LifeImpactArticle } from '@/types/impact';
import { calculateImpactSavings } from '@/lib/impact';

export function getHabitsWithStats(
  habits: Habit[],
  completions: HabitCompletion[],
  urgeLogs?: UrgeLog[],
  copingStepsMap?: Map<string, CopingStep[]>,
  getArticleFn?: (id: ArticleId) => LifeImpactArticle | undefined  // ← 注入
): HabitWithStats[] {
  return habits.map((habit) => {
    // ... 既存の計算（streaks, completion rate, rockets等）

    // Impact savings（記事lookupが提供され、かつhabitにarticle IDがある場合のみ）
    const article = habit.impactArticleId && getArticleFn
      ? getArticleFn(habit.impactArticleId)
      : undefined;

    return {
      // ... 既存のスプレッド
      ...(article
        ? { impactSavings: calculateImpactSavings(habit.id, completions, article) }
        : {}),
    };
  });
}
```

**理由**: `getHabitsWithStats()`は純粋関数で、全データを引数で受け取るパターン。`src/data/`を直接importすると隠れた依存が生まれ、テスタビリティが下がる。`urgeLogs`や`copingStepsMap`と同様のオプショナル注入パターン。

### 4.3 呼び出し側の更新

3箇所すべてで `getArticle` を渡す:

```typescript
// src/hooks/useHabits.ts
import { getArticle } from '@/data/impact-articles';

const getStats = useCallback((): HabitWithStats[] => {
  return getHabitsWithStats(habits, completions, urgeLogs, copingStepsMap, getArticle);
}, [habits, completions, urgeLogs, copingStepsMap]);

// src/app/(app)/page.tsx
import { getArticle } from '@/data/impact-articles';

const todayHabits = useMemo(() => {
  const filtered = habits.filter(shouldShowToday);
  return getHabitsWithStats(filtered, completions, urgeLogs, copingStepsMap, getArticle);
}, [habits, completions, urgeLogs, copingStepsMap]);

// src/app/(app)/stats/page.tsx
import { getArticle } from '@/data/impact-articles';

const withStats = getHabitsWithStats(habits, completions, undefined, undefined, getArticle);
```

---

## 5. UIコンポーネント

### 5.1 コンポーネント一覧

| コンポーネント | 場所 | 役割 |
|---------------|------|------|
| `ImpactBadge` | habit-card.tsx内 | 展開時に1日あたりの3指標を表示 |
| `ImpactArticleSheet` | 新規コンポーネント | 記事全文を底面シートで表示 |
| `SavingsCard` | 新規コンポーネント | 習慣ごとの累積貯金を表示 |
| `TotalSavingsSection` | stats/page.tsx内 | 全習慣の合計貯金を表示 |

### 5.2 HabitCard拡張（展開時）

現在の展開ビュー:
```
[Life Significance]
[Streak Card: 連続日数 + プログレスバー]
[Rockets + Detail ボタン]
```

新しい展開ビュー:
```
[Life Significance]  ← 残す（ユーザー独自の意義）
[Impact Badge: 🏥 +3分 💰 ¥130 📈 ¥1,810 /日]  ← 新規（タップで記事シート）
[Streak Card: 連続日数 + プログレスバー]
[Savings: 累積 🏥 45分 💰 ¥1,950 📈 ¥27,150]  ← 新規
[Rockets + Detail ボタン]
```

**条件付きレンダリング**: `habit.impactSavings`がない場合はImpactBadge/SavingsCardを非表示:
```typescript
{habit.impactSavings && (
  <ImpactBadge
    article={getArticle(habit.impactArticleId!)}
    onTap={() => onOpenArticle(habit.id)}
  />
)}
```

**ImpactArticleSheet状態管理**: 既存の `detailHabitId`, `vsHabitId` と同じパターン:
```typescript
// src/app/(app)/page.tsx
const [articleHabitId, setArticleHabitId] = useState<string | null>(null);
const articleHabit = useMemo(
  () => todayHabits.find((h) => h.id === articleHabitId) ?? null,
  [todayHabits, articleHabitId]
);
```

### 5.3 Stats Page拡張

```
[既存: 平均連続日数 | 最長連続 | 完了率]

[=== 人生インパクト貯金 ===]  ← 新規セクション
┌────────────────────────┐
│ 🏥 健康寿命 +2.5時間   │
│ 💰 コスト削減 ¥15,600  │
│ 📈 収入増加 ¥108,600   │
│ (全習慣合計・今月)       │
└────────────────────────┘

[既存: 習慣ごとの統計カード]
```

**ゼロステート処理**: 記事が設定された習慣が1つもない場合、TotalSavingsSectionは非表示（`null`を返す）。CTA表示なし（余計なUIノイズ）。

### 5.4 HabitForm拡張

**配置: type選択の直後**（typeによるフィルタリングが必要なため）

```
[名前]
[説明]
[人生への意義]
[タイプ: positive / quit]
[インパクト記事を選択]  ← 新規: typeでフィルタされたドロップダウン
  → quit選択時: "禁煙", "ポルノ視聴をやめる", ...
  → positive選択時: "毎日の運動", ...
  → "なし"（デフォルト）
[やらない系: copingSteps, dailyTarget]
[アイコン]
[色]
[頻度]
```

**必須実装ポイント**:
1. `impactArticleId` stateを `useState` + `useEffect`両方に追加
2. `type`変更時に `impactArticleId` をリセット
3. sentinel値 `'none'` → `undefined` 変換を `handleSubmit` で行う

```typescript
// useEffect sync (line 95-106の既存パターンに追加)
setImpactArticleId(initialData?.impactArticleId ?? '');

// type変更時のリセット
const handleTypeChange = (newType: 'positive' | 'quit') => {
  setType(newType);
  setImpactArticleId('');  // リセット
};

// handleSubmit内
impactArticleId: impactArticleId && impactArticleId !== 'none'
  ? impactArticleId as ArticleId
  : undefined,
```

---

## 6. i18n追加キー

```json
{
  "impact": {
    "title": "人生インパクト",
    "dailyHealth": "健康寿命",
    "dailyCost": "コスト削減",
    "dailyIncome": "収入増加",
    "perDay": "/日",
    "savings": "累積貯金",
    "totalSavings": "人生インパクト貯金",
    "readArticle": "根拠を読む",
    "selectArticle": "インパクト記事を選択",
    "noArticle": "なし",
    "sources": "出典",
    "thisMonth": "今月",
    "allTime": "累計",
    "confidence": {
      "high": "信頼度: 高",
      "medium": "信頼度: 中",
      "low": "信頼度: 低（推定）"
    }
  }
}
```

---

## 7. ファイル変更サマリー

### 新規作成
| ファイル | 内容 |
|---------|------|
| `src/types/impact.ts` | ArticleId, LifeImpactArticle, LifeImpactSavings, V2_DEFAULT_PROFILE |
| `src/lib/impact.ts` | 計算ロジック + テンプレート展開 + フォーマッター |
| `src/data/impact-articles/index.ts` | 記事データのインデックス |
| `src/data/impact-articles/quit-smoking.ts` | 禁煙記事データ |
| `src/data/impact-articles/quit-porn.ts` | ポルノ視聴をやめる記事データ |
| `src/components/habits/impact-badge.tsx` | 1日インパクト表示コンポーネント |
| `src/components/habits/impact-article-sheet.tsx` | 記事全文表示シート |
| `src/components/habits/savings-card.tsx` | 累積貯金カード |
| `supabase/migrations/YYYYMMDD_impact_article.sql` | impact_article_idカラム追加 |

### 変更
| ファイル | 変更内容 |
|---------|---------|
| `src/types/habit.ts` | Habit, HabitWithStatsにフィールド追加 |
| `src/lib/supabase/habits.ts` | HabitRow, toHabit, insert/update拡張 |
| `src/lib/habits.ts` | getHabitsWithStatsに`getArticleFn?`パラメータ追加 |
| `src/hooks/useHabits.ts` | getStats()で`getArticle`を注入 |
| `src/components/habits/habit-card.tsx` | ImpactBadge + Savings表示追加 |
| `src/components/habits/habit-form.tsx` | type後に記事選択ドロップダウン追加 |
| `src/app/(app)/page.tsx` | getArticle注入 + articleHabitId状態管理 |
| `src/app/(app)/stats/page.tsx` | getArticle注入 + TotalSavingsSection追加 |
| `src/messages/ja.json` | impactキー追加 |
| `src/messages/en.json` | impactキー追加 |

---

## 8. 実装順序

```
Phase 1: 型基盤（TypeScriptエラーなく進むための順序）
  1. src/types/impact.ts (ArticleId, LifeImpactArticle, LifeImpactSavings, V2_DEFAULT_PROFILE)
  2. src/types/habit.ts (Habit, HabitWithStatsにフィールド追加)

Phase 2: DB + Supabaseレイヤー
  3. supabase/migrations/YYYYMMDD_impact_article.sql
  4. src/lib/supabase/habits.ts (HabitRow, toHabit, insert/update拡張)

Phase 3: 記事データ + 計算ロジック
  5. src/data/impact-articles/quit-smoking.ts
  6. src/data/impact-articles/quit-porn.ts
  7. src/data/impact-articles/index.ts
  8. src/lib/impact.ts (calculateImpactSavings, renderArticle, formatters)

Phase 4: 計算統合（注入パターン）
  9. src/lib/habits.ts (getHabitsWithStatsに getArticleFn? パラメータ追加)
  10. src/hooks/useHabits.ts (getArticle注入)
  11. src/app/(app)/page.tsx (getArticle注入)
  12. src/app/(app)/stats/page.tsx (getArticle注入)

Phase 5: 新規UIコンポーネント
  13. src/components/habits/impact-badge.tsx
  14. src/components/habits/impact-article-sheet.tsx
  15. src/components/habits/savings-card.tsx

Phase 6: 既存UIへの統合
  16. src/components/habits/habit-card.tsx (ImpactBadge, SavingsCard, onOpenArticle)
  17. src/components/habits/habit-form.tsx (impactArticleId state + useEffect sync + dropdown)
  18. src/app/(app)/page.tsx (articleHabitId state + ImpactArticleSheet)
  19. src/app/(app)/stats/page.tsx (TotalSavingsSection)
  20. src/messages/ja.json, en.json (impactキー追加)

Phase 7: 記事生成
  21. life-impact-articleスキルで残りの習慣記事を生成
```

---

## 9. V3への拡張ポイント

V2→V3の設計境界が明確に分離されている:

| 要素 | V2（現在） | V3（将来） | 変更量 |
|------|-----------|-----------|--------|
| `article.researchBody` | 静的ファイル | 同じ | なし |
| `article.sources` | 静的ファイル | 同じ | なし |
| `calculationParams` | 静的ファイル（研究生数値） | 同じ | なし |
| `inferences` | 静的テキスト（V2プロフィール用） | **LLMが動的生成** | 生成ロジック追加 |
| `calculationParams → daily値` | そのまま使用 | ユーザー調整係数を適用 | ロジック変更 |
| ユーザープロフィール | `V2_DEFAULT_PROFILE`定数 | `user_settings`テーブル | DB + フック追加 |

V3移行ステップ:
1. `user_settings`テーブルにprofileカラム追加（age, income, nationality等）
2. `inferences`をLLMで動的生成する関数追加:
   - 入力: `researchBody` + `sources` + `calculationParams` + `userProfile`
   - 出力: `{ health: string, cost: string, income: string, cumulative: string }`
   - LLMが研究結果をユーザーに適用し、調整理由を説明する段落を生成
3. `calculationParams`からユーザー固有のdaily値を計算する関数を追加
4. LLMコストはユーザー負担（subscription or per-use）
5. `researchBody`と`sources`は変更なし（記事の固定部分）

### V3の推論生成フロー

```
ユーザープロフィール (age: 55, nationality: Japanese, income: ¥8M)
         +
研究データ (calculationParams + sources)
         │
         ▼
    LLM API呼び出し
    「この研究結果を55歳の日本人女性（年収800万円）に
     当てはめて、調整理由と具体的数値を含む推論段落を生成」
         │
         ▼
inferences: {
  health: "あなたは55歳の日本人女性です。この研究は主に男性を対象と
           していますが、禁煙の心血管系への効果は性別を問わず報告されて
           います。55歳からの禁煙でも約5年の延命効果が見込まれ（Doll &
           Peto, 2004）、1日あたり約9分の健康寿命延伸に相当します。",
  cost: "...",
  income: "...",
  cumulative: "..."
}
```

---

## 10. レビュー指摘と対応

| 指摘 | 重要度 | 対応 |
|------|--------|------|
| `getHabitsWithStats`に静的importは純粋性を壊す | HIGH | `getArticleFn`注入パラメータに変更 |
| `renderedArticle`はV3移行トラップ | HIGH | 削除、`renderArticle()`関数に置換 |
| `impactArticleId`が`string`だと型安全でない | MEDIUM | `ArticleId`ユニオン型に変更 |
| `calculateTotalSavings`のシグネチャがMapで不自然 | MEDIUM | `HabitWithStats[]`を直接受取に変更 |
| HabitFormの`useEffect` sync漏れリスク | MEDIUM | 明示的にドキュメント化 |
| ゼロステートでTotalSavingsSectionが¥0表示 | MEDIUM | 記事未設定時は非表示 |
| HabitFormのドロップダウンがtype選択前 | MEDIUM | type選択直後に配置、typeでフィルタ |
| `formatHealthMinutes`の小数時間表示 | MEDIUM | 時間+分形式に変更 |
| `formatCurrency`の¥1万境界 | LOW | ¥10万以上は万表記、¥1万〜は小数点1桁 |
| Phase順序でTypeScriptエラー | LOW | 型定義→DB→Supabase→記事→計算の順に修正 |
