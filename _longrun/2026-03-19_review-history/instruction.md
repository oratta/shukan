# Instruction: 過去レビュー振り返りビュー

## 生成情報
- 作成日: 2026-03-19
- Brain Dump元: セッション内対話（explore → instruction再生成）
- 質問回数: 2問（配置場所、カレンダー粒度、詳細表示方法）

## ゴール
Stats ページに月間カレンダーと日次振り返り詳細を追加し、ユーザーが過去のレビュー記録（ムード・コメント・各習慣のステータス/メモ）を読み取り専用で見返せるようにする。

## ビジネスコンテキスト
- 対象ユーザー: Shukan を毎日使っている自分自身（ドッグフーディング中）
- 提供価値: 昨日レビューで書いたムード・メモ・コメントが振り返れないと、書く動機が薄れる。可視化することで振り返り習慣を定着させる
- 成功指標: Stats ページでカレンダーから任意の過去日のレビュー内容を閲覧できる

## 技術要件
- スタック: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Shadcn UI, Supabase, next-intl
- 参照パターン: 既存の `src/app/(app)/stats/page.tsx` のレイアウト、`useHabits` hook のデータ取得パターン、`yesterday-review-sheet.tsx` の MOOD_ICONS
- 制約:
  - 既存の Stats コンテンツを壊さない（下部に追加するのみ）
  - DB スキーマの変更なし（daily_reflections, habit_completions は既存）
  - 読み取り専用（編集機能は含まない）
- テストフレームワーク: Vitest
- テスト実行コマンド: `npx vitest run`

## スコープ
### 含むもの
- 月間カレンダー UI（ムード色ドット付き）
- 月ナビゲーション（前月/次月）
- 日付タップでインライン展開する日次振り返り詳細
- Supabase からの月間一括データ取得関数
- useReviewHistory カスタムフック
- MOOD_ICONS の共有化（mood-icons.ts 抽出）
- i18n キー（ja/en）

### 含まないもの
- 振り返り内容の編集機能（理由: 編集は YesterdayReviewSheet で行う。閲覧と編集は分離）
- 週間/年間カレンダー表示（理由: 月間で十分。将来拡張可能だが今は不要）
- カレンダーからの過去日レビュー新規入力（理由: 昨日レビュー機能の範囲）

## Changes分解

### change-A: `review-history`
- **スコープ**: Supabase CRUD 関数 + useReviewHistory hook + ReviewCalendar + ReviewDayDetail + Stats ページ統合 + MOOD_ICONS 共有化 + i18n
- **使用スキル**: `nextjs-server-client-components`
- **依存関係**: 独立
- **config.yaml rules**:
  - "既存の Stats ページのコンテンツを変更してはならない。下部に追加するのみ"
  - "MOOD_ICONS は src/lib/mood-icons.ts に抽出し、yesterday-review-sheet.tsx と review-day-detail.tsx の両方から import すること"
  - "カレンダーの日付は YYYY-MM-DD 文字列で扱い、Date オブジェクト生成時は T00:00:00 を付加してタイムゾーンズレを防ぐこと"

## 画面・UI設計

### Stats ページ（追加セクション）
```
[既存: ストリーク / 達成率 / インパクト / 習慣別内訳]
─── 区切り線 ───
📅 振り返り履歴

  < 2026年3月 >         ← 月ナビゲーション
  月 火 水 木 金 土 日   ← 曜日ヘッダー（locale対応）
           1  2  3  4
  5  6  7  8  9 10 11
 12 13 14 15 16 17 [18] ← 選択中: ring-2
 19 20 21 ...

各日セル: 日付番号 + ムード色ドット
  🟢(4-5) 🟡(3) 🔴(1-2) ⚪(未入力)
未来日: テキスト薄い + タップ不可

▼ 3月18日（火）の振り返り  ← インライン展開
  ムード: 😊 Smile (lime-500)
  コメント: 「集中できた1日だった」
  ───────────
  ✅ 運動      「ジムで30分」
  ✅ 読書
  ❌ 瞑想      「時間がなかった」
  ⏭ 散歩
  ○ 薬                          ← none
```

### コンポーネント構成
```
stats/page.tsx
  └─ <ReviewCalendar />         (月間カレンダー)
      └─ <ReviewDayDetail />    (選択日の振り返り、インライン展開)
```

## データモデル

既存テーブルをそのまま使用（新規テーブルなし）:

- `daily_reflections`: user_id, date, mood(1-5), comment
- `habit_completions`: habit_id, date, status, note
- `habits`: id, name, icon, color, archived

月間クエリ:
- `getMonthlyReflections(userId, year, month)`: `date LIKE 'YYYY-MM-%'`
- `getMonthlyCompletions(userId, year, month)`: 同上

## 受け入れ条件

**必須条件（常に含める）:**
1. [ ] 全changeのOpenSpec仕様が作成・レビュー済み
2. [ ] 全changeのテストが作成され全てPASSしている
3. [ ] ビルドエラーなし（型チェック + ビルド）
4. [ ] 統合テストがPASS（worktreeマージ後）

**機能固有の条件:**
5. [ ] Stats ページに月間カレンダーが表示される
6. [ ] 各日にムード色ドットが表示される（mood 4-5=緑, 3=黄, 1-2=赤, 未入力=灰）
7. [ ] 前月/次月のナビゲーションボタンでカレンダーが切り替わり、データが再取得される
8. [ ] 日付タップでカレンダー直下にインラインで振り返り詳細が展開される
9. [ ] 振り返り詳細にムード（Lucide アイコン + 色）+ コメントが表示される
10. [ ] 振り返り詳細にその日の全習慣（非アーカイブ）のステータス（✓/−/✗/○）+ メモが表示される
11. [ ] データがない日をタップすると「この日の記録はありません」が表示される
12. [ ] 未来の日付はタップ不可（テキスト色が薄い）
13. [ ] i18n 対応（ja/en の全キー追加）
14. [ ] MOOD_ICONS が `src/lib/mood-icons.ts` に抽出され、yesterday-review-sheet.tsx と review-day-detail.tsx の両方で使用されている

## 意思決定ガイドライン
- 優先順位: シンプルさ > 表示の美しさ > 拡張性
- リスク許容度: 保守的（既存機能を壊さない）
- 不明点の扱い: シンプルな方を選ぶ。迷ったら design.md の Decisions に記録

## 動作確認方法
- 開発サーバー: `npm run dev` → http://localhost:3000
- テスト: `npx vitest run`
- 型チェック: `npx tsc --noEmit`
- ビルド: `npx next build`
- 確認手順:
  1. Stats タブを開く → 下部に「振り返り履歴」セクションとカレンダーが表示される
  2. 過去にレビューを入力した日をタップ → ムード・コメント・習慣ステータスが展開表示される
  3. データがない日をタップ → 「記録なし」メッセージ
  4. 前月ボタンをタップ → カレンダーが前月に切り替わる
  5. 未来の日付がタップ不可であること

## Brain Dumpからの原文メモ
> 過去の振り返りビューが欲しいな。設計から手伝って
> Stats タブに追加、月間カレンダー、インライン展開で選択
