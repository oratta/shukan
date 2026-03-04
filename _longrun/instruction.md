# ホーム画面デイリーインパクト表示 + 年間ビュー具体的数字

## 概要

2つの変更を行う:
1. **ホーム画面を「今日」に集中させる**: 完了インジケーター下に「今日獲得したライフインパクト」セクションを追加し、HabitCard展開時のImpactBadgeもデイリー表示に変更
2. **年間ビューの金額を具体的数字で表示**: ¥54万 → ¥547,500 のように四捨五入せずフル表示

## 実行フロー

**Phase 1: ホーム画面デイリーインパクトセクション** → **Phase 2: ImpactBadgeデイリー切替 + 年間ビュー具体的数字** → **Phase 3: ビルド検証 + コミット**

---

## Phase 1: ホーム画面デイリーインパクトセクション

### 1.1 DailyImpactSummary コンポーネント作成

`src/components/habits/daily-impact-summary.tsx` を新規作成。

**入力**: 今日の全習慣リスト（completedToday + evidences 情報）

**計算ロジック**:
- 各習慣について、紐づくevidences（重み付き）から1日のデイリーインパクト（healthMinutes, costSaving, incomeGain）を計算
  - 既存の `calculateDailyImpact` 関数（`src/lib/impact.ts`）を利用
- 分母（total）: 全習慣のデイリーインパクト合計
- 分子（earned）: `completedToday === true` の習慣のデイリーインパクト合計
- evidenceが紐づいていない習慣はインパクト計算対象外

**表示レイアウト**（3指標並列表示）:

```
┌─────────────────────────────────────────┐
│  今日のライフインパクト                   │
│                                         │
│  ❤️ 19分/33分    💰 ¥1,780/¥2,580       │
│  健康寿命         コスト削減              │
│                                         │
│  📈 ¥7,190/¥12,380                      │
│  収入増加                                │
└─────────────────────────────────────────┘
```

- 分子/分母のフォーマット: 金額は `formatCurrency(amount, false)` で具体的数字表示
- 健康寿命は `formatHealthMinutes` でフォーマット
- 分子 < 分母: 通常表示（muted-foreground の分母）
- 分子 === 分母（全達成）: 🎉 パーフェクト表示

### 1.2 パーフェクト表示

全習慣を達成した場合:
- テキスト: 「🎉 パーフェクト！」（i18nキー）
- 背景色やボーダーの変化（例: `bg-green-50 border-green-200 dark:bg-green-950/30`）
- subtle なアニメーション（CSS animation で pulse 1回程度）
- 3指標の分子/分母は同値になるので、分母表示を省略して数値のみ表示

### 1.3 page.tsx への組み込み

`src/app/(app)/page.tsx` の完了インジケーター（プログレスバー）の直下に `DailyImpactSummary` を配置:

```
今日の習慣         2/3 完了
████████████████░░░░░░░░

[DailyImpactSummary コンポーネント]

[HabitList]
```

- evidenceを持つ習慣が1つもない場合はセクション自体を非表示
- habit データを props で渡す（既に page.tsx で `todayHabits` を計算済み）

### 1.4 i18n キー追加

`src/messages/ja.json` / `src/messages/en.json`:
- `impact.todayImpact`: 「今日のライフインパクト」/ "Today's Life Impact"
- `impact.perfect`: 「パーフェクト！」/ "Perfect!"

---

## Phase 2: ImpactBadge デイリー切替 + 年間ビュー具体的数字

### 2.1 HabitCard の ImpactBadge をデイリーに変更

`src/components/habits/habit-card.tsx`:
- `ImpactBadge` の呼び出しに `mode="daily"` を追加

`src/components/habits/habit-detail-modal.tsx`:
- 同様に `mode="daily"` を追加（ホーム画面全体を「今日」に統一）

### 2.2 formatCurrency の年間ビュー対応

`src/lib/impact.ts` の `formatCurrency` 関数:

**現状**:
```typescript
export function formatCurrency(amount: number, useMan = true): string {
  if (useMan && amount >= 100_000) return `¥${Math.floor(amount / 10000)}万`;
  if (useMan && amount >= 10_000) return `¥${(amount / 10000).toFixed(1)}万`;
  return `¥${Math.round(amount).toLocaleString()}`;
}
```

**変更方針**: 年間ビュー（evidence-article-sheet 等）で `formatCurrency(amount, false)` を呼んで具体的数字を表示。

変更対象ファイル:
- `src/components/habits/evidence-article-sheet.tsx` — ImpactBadge 呼び出し箇所で年間表示する場合に `useMan={false}` を指定
  - ※ evidence-article-sheet の ImpactBadge は年間モードのままでよい（記事レベルの年間インパクト表示）
  - ただし金額は具体的数字にする

### 2.3 ImpactBadge への useMan prop 追加

`src/components/habits/impact-badge.tsx`:
- `useMan?: boolean` prop を追加（デフォルト: mode === 'daily'）
- 内部の `formatCurrency` 呼び出しに `useMan` を透過

---

## Phase 3: ビルド検証 + コミット

- TypeScript 型チェック（`npx tsc --noEmit`）
- テスト実行（`npx vitest run`）
- Next.js ビルド（`npx next build`）
- コミット

---

## 制約・注意事項

- i18n: ja/en 両方を更新すること
- DailyImpactSummary は習慣数が0件の場合やevidence未紐付けの場合に適切にフォールバック
- パーフェクト表示はCSSのみで実装（ライブラリ追加なし）
- formatCurrency の変更は後方互換性を保つ（useMan のデフォルト値は true のまま）
- HabitCard / HabitDetailModal の SavingsCard（累積貯金）は変更しない

---

## 完了条件

**必須条件（ワークフロー成果物）:**
- [ ] OpenSpec 仕様（proposal.md, spec.md, design.md, tasks.md）が作成・レビュー済み
- [ ] テストが作成され全てPASSしている
- [ ] ビルドエラーなし（型チェック + ビルド）

**機能固有の条件:**
- [ ] DailyImpactSummary コンポーネントが作成されている
- [ ] ホーム画面の完了インジケーター下にデイリーインパクトが3指標で表示される
- [ ] 分母 = 全習慣の合計デイリーインパクト、分子 = 達成済み習慣の合計
- [ ] 全達成時にパーフェクト表示が出る
- [ ] evidence未紐付け習慣はインパクト計算から除外される
- [ ] HabitCard展開時の ImpactBadge が /日 表示になっている
- [ ] HabitDetailModal の ImpactBadge が /日 表示になっている
- [ ] 年間ビュー（evidence-article-sheet等）の金額が ¥XXX,XXX 形式で表示される
- [ ] i18n 対応（ja/en）
