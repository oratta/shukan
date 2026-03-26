# 習慣スキップ機能

## 概要

休暇中や当日実行できない日のために「スキップ機能」を追加する。スキップは今日だけ有効で翌日自動リセット。スキップした習慣は一覧下部の専用セクションに移動し、グレー表示になる。ストリーク・ライフインパクト・プログレスバーの分母からは除外される（「無かった日」扱い）。

## 実行フロー

**Phase 1: データ層** → **Phase 2: UI（HabitCard + HabitList）** → **Phase 3: ライフインパクト/プログレスバー対応** → **Phase 4: ビルド検証 + コミット**

---

## Phase 1: データ層

### 1.1 型定義の拡張

`src/types/habit.ts`:
- `HabitCompletion.status` に `'skipped'` を追加: `'completed' | 'failed' | 'rocket_used' | 'skipped'`
- `DayStatus.status` に `'skipped'` を追加: `'completed' | 'failed' | 'none' | 'rocket_used' | 'skipped'`
- `HabitWithStats` に `skippedToday: boolean` フィールドを追加

### 1.2 Supabase データ層

`src/lib/supabase/habits.ts`:
- `upsertCompletion` の status 型に `'skipped'` 追加
- `insertCompletion` の status 型に `'skipped'` 追加
- `toCompletion` のキャスト型に `'skipped'` 追加

※ DB の CHECK 制約は既に除去済みのためマイグレーション不要

### 1.3 useHabits フック

`src/hooks/useHabits.ts`:
- `setDayStatus` の status 型に `'skipped'` 追加: `'completed' | 'failed' | 'none' | 'skipped'`
- スキップは `upsertCompletion(userId, habitId, today, 'skipped')` で保存
- スキップ解除は `deleteCompletion(habitId, today)` で削除（status='none' と同じ動作）

### 1.4 ユーティリティ関数

`src/lib/habits.ts`:
- `getHabitsWithStats` で `skippedToday` を計算: 今日の completion が `'skipped'` なら true
- ストリーク計算（`calculateStreak`）: `'skipped'` 日は連続を途切れさせないが、連続日数にもカウントしない（透明な日として扱う。例: 完了→スキップ→完了 = 2日連続）
- `completionRate` 計算: `'skipped'` 日は分母から除外

---

## Phase 2: UI（HabitCard + HabitList）

### 2.1 HabitCard の変更

`src/components/habits/habit-card.tsx`:

**props に追加**:
- `onSkipToday: (id: string) => void`

**展開ボディのボタン行を変更**:
```
現在: [        Detail (w-full)        ]
変更: [ Detail (flex-1) ] [ Skip (shrink-0) ]
```

- Detail ボタン: `w-full` → `flex-1`、テキストとアイコンはそのまま
- Skip ボタン: `shrink-0` の副次ボタン、グレー背景
  - アイコン: `SkipForward`（lucide-react）
  - テキスト: i18n `habits.skip`
  - カラー: `bg-muted text-muted-foreground`
- スキップ済みの場合: Skip ボタンが「解除」ボタンに変わる
  - アイコン: `Undo2`（lucide-react）
  - テキスト: i18n `habits.unskip`
  - カラー: `bg-amber-100 text-amber-700` (dark: `bg-amber-900/30 text-amber-400`)

**スキップ済みハビットの見た目**:
- 折りたたみ行のハビット名: `text-muted-foreground`（グレー）
- StatusIndicator: グレーのダッシュ or 非表示
- DayStatusDot（今日のドット）: グレーの横線

**onDayStatusChange の型拡張**:
- `'completed' | 'failed' | 'none'` → `'completed' | 'failed' | 'none' | 'skipped'`

### 2.2 HabitList のセクション分割

`src/components/habits/habit-list.tsx`:

**2つのセクションに分離**:
1. **アクティブ習慣セクション**: `skippedToday === false` のもの（drag-and-drop対応）
2. **スキップ済みセクション**: `skippedToday === true` のもの（drag-and-drop無効）

**セクション間の仕切り**:
- スキップ済みが1つ以上ある場合のみ表示
- `border-t` + テキスト「スキップ中」（i18n `habits.skippedSection`）
- テキストカラー: `text-muted-foreground text-xs`

**トランジションアニメーション**:
- 習慣がアクティブ → スキップ、スキップ → アクティブに移動する際のアニメーション
- `framer-motion` の `AnimatePresence` + `motion.div` を使用（既にpackage.jsonに含まれているか要確認）
- もし `framer-motion` がない場合は CSS の `transition` + `key` トリックで実装
  - リスト全体を `transition-all duration-300` で高さ変化をアニメーション
  - 各カードに `animate-[slideIn_300ms_ease-out]` を適用

### 2.3 スキップボタンの動作フロー

1. ユーザーがカードを展開
2. Skip ボタンをタップ
3. `onSkipToday(habit.id)` → `setDayStatus(habitId, today, 'skipped')`
4. habit が `skippedToday === true` になる
5. HabitList がリレンダー → 習慣がスキップセクションに移動（アニメーション付き）
6. カードはグレー表示、展開するとDetailの脇に解除ボタン
7. 解除ボタンタップ → `setDayStatus(habitId, today, 'none')` → アクティブに戻る

---

## Phase 3: ライフインパクト/プログレスバー対応

### 3.1 page.tsx のプログレスバー

`src/app/(app)/page.tsx`:
- `completedCount` と `totalCount` からスキップ習慣を除外:
```typescript
const activeHabits = todayHabits.filter((h) => !h.skippedToday);
const completedCount = activeHabits.filter((h) => h.completedToday).length;
const totalCount = activeHabits.length;
```

### 3.2 DailyImpactSummary

`src/components/habits/daily-impact-summary.tsx`:
- スキップ習慣を計算から除外:
```typescript
for (const habit of habits) {
  if (habit.evidences.length === 0) continue;
  if (habit.skippedToday) continue;  // ← 追加
  // ... 以下同じ
}
```

---

## Phase 4: ビルド検証 + コミット

- TypeScript 型チェック
- テスト実行（`npx vitest run`）
- Next.js ビルド（`npx next build`）
- コミット

---

## i18n キー

`src/messages/ja.json` / `src/messages/en.json`:
- `habits.skip`: 「スキップ」/ "Skip"
- `habits.unskip`: 「解除」/ "Unskip"
- `habits.skippedSection`: 「スキップ中」/ "Skipped"

---

## 制約・注意事項

- スキップは「今日だけ」有効。翌日は自動的にアクティブに戻る（completion が今日の日付でのみ有効なため）
- ストリーク計算でスキップ日は「透明な日」扱い（連続を途切れさせないが、日数にもカウントしない。例: 完了5日→スキップ2日→完了3日 = 8日連続）
- ライフインパクトの分母からもスキップ習慣を除外（パーフェクト判定に影響しない）
- プログレスバーの分母からもスキップ習慣を除外
- quit 型の習慣も positive 型と同様にスキップ可能
- スキップ済みセクションは drag-and-drop 無効（並び順はアクティブ時の順序を維持）
- `nextStatus` サイクルにスキップは含めない（スキップは専用ボタンでのみ操作）

---

## 完了条件

**必須条件（ワークフロー成果物）:**
- [ ] OpenSpec 仕様が作成・レビュー済み
- [ ] テストが作成され全てPASSしている
- [ ] ビルドエラーなし

**機能固有の条件:**
- [ ] `'skipped'` ステータスが型・データ層・フックに追加されている
- [ ] HabitCard 展開時に Detail 横に Skip/解除 ボタンが表示される
- [ ] スキップした習慣が下部セクションにグレー表示で移動する
- [ ] セクション間に仕切りがある
- [ ] スキップ ↔ アクティブ移動時にアニメーションがある
- [ ] スキップ習慣はプログレスバーの分母から除外
- [ ] スキップ習慣はライフインパクトの分母から除外
- [ ] ストリーク計算でスキップ日は透明（途切れないが日数にカウントしない）
- [ ] i18n 対応（ja/en）
