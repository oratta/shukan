## ADDED Requirements

### Requirement: Monthly calendar displayed on Stats page

Stats ページの既存コンテンツの下部に月間カレンダーセクションが表示されなければならない（SHALL）。既存のストリーク・達成率・インパクト・習慣別内訳セクションは変更されない。

#### Scenario: Stats page shows review history section

- **WHEN** ユーザーが Stats ページを開く
- **THEN** 既存コンテンツの下部に「振り返り履歴」セクションが表示される
- **AND** 現在月の月間カレンダーが表示される
- **AND** 曜日ヘッダー（月〜日）がロケールに応じた言語で表示される

---

### Requirement: Mood color dots on calendar days

カレンダーの各日には、その日の振り返りムードに対応する色ドットが表示されなければならない（SHALL）。

| ムード値 | ドット色 |
|---------|---------|
| 4–5 | 緑（green/lime） |
| 3 | 黄（yellow） |
| 1–2 | 赤（red） |
| 未入力 | ドットなし |

#### Scenario: Mood dot displayed for reviewed day

- **WHEN** カレンダーに mood=4 が登録されている日が表示される
- **THEN** その日のセルに緑色ドットが表示される

#### Scenario: Mood dot for neutral mood

- **WHEN** カレンダーに mood=3 が登録されている日が表示される
- **THEN** その日のセルに黄色ドットが表示される

#### Scenario: No dot for day without data

- **WHEN** カレンダーにデータが登録されていない日が表示される
- **THEN** その日のセルにドットが表示されない

---

### Requirement: Month navigation

前月・次月ナビゲーションボタンで表示月を切り替えられなければならない（SHALL）。

#### Scenario: Navigate to previous month

- **WHEN** ユーザーが前月ボタン（ChevronLeft）をタップする
- **THEN** カレンダーが前月の表示に切り替わる
- **AND** 前月のデータが Supabase から取得される
- **AND** 選択中の日付がリセットされる（詳細パネルが閉じる）

#### Scenario: Navigate to next month

- **WHEN** ユーザーが次月ボタン（ChevronRight）をタップする
- **THEN** カレンダーが次月の表示に切り替わる
- **AND** 次月のデータが Supabase から取得される

#### Scenario: Next month button disabled in current month

- **WHEN** 表示中の月が現在月と同じ場合
- **THEN** 次月ボタンが無効化（disabled）される

---

### Requirement: Future dates are non-interactive

今日より未来の日付はタップ不可で、視覚的に非アクティブ状態で表示されなければならない（SHALL）。

#### Scenario: Future date appears dimmed

- **WHEN** 今日が 2026-03-19 の場合、カレンダーに 2026-03-20 が表示される
- **THEN** 2026-03-20 のセルはテキスト色が薄く表示される
- **AND** 2026-03-20 のセルはタップしても詳細が展開されない

---

### Requirement: Day tap expands inline detail

日付をタップするとカレンダーの直下に振り返り詳細がインライン展開されなければならない（SHALL）。詳細は読み取り専用で、編集機能は含まない。

#### Scenario: Tap a day with review data

- **WHEN** ユーザーがレビューデータのある日付をタップする
- **THEN** カレンダー直下に選択日の振り返り詳細が表示される
- **AND** ムードアイコン（Lucide）とコメントが表示される
- **AND** その日の全習慣（非アーカイブ）のステータスとメモが表示される

#### Scenario: Tap the same day again deselects it

- **WHEN** 既に選択中の日付を再度タップする
- **THEN** 振り返り詳細パネルが閉じる（選択が解除される）

#### Scenario: Tap a different day switches detail

- **WHEN** 別の日付をタップする
- **THEN** 詳細パネルが新しく選択した日の内容に切り替わる

---

### Requirement: Day detail shows mood icon and comment

振り返り詳細にはムード（Lucide アイコン + 色）とコメントが表示されなければならない（SHALL）。

#### Scenario: Detail displays mood icon

- **WHEN** mood=4 の日の詳細が展開される
- **THEN** Smile アイコンが lime-500 色で表示される
- **AND** ムードに対応するラベルテキストが表示される

#### Scenario: Detail displays comment

- **WHEN** コメントが入力されている日の詳細が展開される
- **THEN** コメントテキストが表示される

#### Scenario: No comment section when empty

- **WHEN** コメントが空の日の詳細が展開される
- **THEN** コメントセクションが表示されない（または空欄表示）

---

### Requirement: Day detail shows all habits with status and note

振り返り詳細には非アーカイブ全習慣のステータス（completed/failed/skipped/none）とメモが表示されなければならない（SHALL）。

| ステータス | 表示アイコン |
|----------|------------|
| completed | ✓（Check、緑） |
| failed | ✗（X、赤/オレンジ） |
| skipped | −（Minus、灰） |
| none | ○（Circle、薄灰） |

#### Scenario: All habits shown in detail

- **WHEN** 習慣が5件（非アーカイブ）あり、うち3件がレビュー済みの日の詳細が展開される
- **THEN** 全5件の習慣が表示される
- **AND** レビュー済み3件はそのステータスのアイコンで表示される
- **AND** 未入力2件は none 状態（Circle アイコン）で表示される

#### Scenario: Habit note displayed when present

- **WHEN** 習慣にメモが入力されている日の詳細が展開される
- **THEN** メモテキストが習慣名の下に表示される

---

### Requirement: No data state

データがない日をタップした場合、「記録なし」メッセージが表示されなければならない（SHALL）。

#### Scenario: Tap day with no reflection and no completions

- **WHEN** ユーザーが振り返りデータのない日付をタップする
- **THEN** 「この日の記録はありません」というメッセージが表示される

---

### Requirement: MOOD_ICONS extracted to shared module

`MOOD_ICONS` 定数は `src/lib/mood-icons.ts` に定義され、`yesterday-review-sheet.tsx` と `review-day-detail.tsx` の両方からインポートして使用されなければならない（SHALL）。

#### Scenario: mood-icons.ts exports MOOD_ICONS

- **WHEN** `src/lib/mood-icons.ts` が存在する
- **THEN** `MOOD_ICONS` 配列が export されている
- **AND** 各要素は `{ Icon: LucideIcon; colorClass: string; value: number; dotColor: string }` 型を持つ

#### Scenario: yesterday-review-sheet imports from mood-icons

- **WHEN** `yesterday-review-sheet.tsx` をコードレビューする
- **THEN** ファイル内に MOOD_ICONS の独自定義が存在しない
- **AND** `src/lib/mood-icons.ts` から MOOD_ICONS を import している

---

### Requirement: i18n support

全テキストが ja/en の両言語に対応しなければならない（SHALL）。

#### Scenario: Japanese locale shows Japanese labels

- **WHEN** ロケールが ja の場合、Stats ページの振り返り履歴セクションを開く
- **THEN** セクションタイトル、ナビゲーションラベル、ステータスラベル等が日本語で表示される

#### Scenario: English locale shows English labels

- **WHEN** ロケールが en の場合、Stats ページの振り返り履歴セクションを開く
- **THEN** セクションタイトル、ナビゲーションラベル、ステータスラベル等が英語で表示される
