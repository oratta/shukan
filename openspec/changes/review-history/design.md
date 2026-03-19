## Context

Stats ページには現在、ストリーク・達成率・インパクト・習慣別内訳が表示される。`yesterday-review-sheet.tsx` でムード・コメント・習慣ステータスを入力できるが、過去の記録を後から読み返す手段がない。

既存の DB テーブル（`daily_reflections`, `habit_completions`, `habits`）にデータは存在するが、読み出し UI がない。

## Goals

- Stats ページで過去の振り返り記録を月間カレンダー形式で閲覧できるようにする
- 日付タップで詳細（ムード・コメント・習慣ステータス）をインライン展開できるようにする
- MOOD_ICONS を共有化し、今後の振り返り関連コンポーネントで一貫した表示を保つ

## Non-Goals

- 振り返り内容の編集機能（閲覧と編集は分離。編集は YesterdayReviewSheet で行う）
- 週間・年間カレンダー表示（月間で十分。将来拡張可能）
- カレンダーから過去日のレビューを新規入力する機能（昨日レビュー機能の範囲）
- DB スキーマの変更

## Decisions

### D1: コンポーネント配置 — review/ ディレクトリを新設

`src/components/review/` ディレクトリに `ReviewCalendar.tsx` と `ReviewDayDetail.tsx` を配置する。

`habits/` 配下に置く案も検討したが、振り返り履歴は習慣管理（CRUD）ではなく閲覧・振り返りの文脈に属するため、分離する。今後、振り返り関連コンポーネントが増えた場合も収容しやすい。

### D2: データ取得戦略 — 月単位バッチクエリ

月ナビゲーション時に `getMonthlyReflections(userId, year, month)` と `getMonthlyCompletions(userId, year, month)` を並列で呼び出す。

日別クエリ（日付タップ時に取得）の案も検討したが、カレンダー全体にムードドットを表示するために月全体のデータが必要なため、月単位バッチが適切。月変更時のみ再フェッチし、選択日変更だけの場合はキャッシュを使う。

### D3: MOOD_ICONS 抽出 — src/lib/mood-icons.ts

`yesterday-review-sheet.tsx` に定義されている `MOOD_ICONS` 定数を `src/lib/mood-icons.ts` に抽出し、両コンポーネントからインポートする。

型定義も同ファイルに含め、`MoodIconDef` インターフェース（`{ Icon: LucideIcon; colorClass: string; value: number; dotColor: string }`）を export する。ムード色ドット用の `dotColor` プロパティをこの機会に追加する（緑/黄/赤の Tailwind クラス）。

**代替案**: 各コンポーネントに MOOD_ICONS を重複定義 → DRY 違反で将来の変更時に同期漏れリスクがある

### D4: カレンダーグリッド — CSS Grid（7列）

CSS Grid（`grid-cols-7`）で月間カレンダーを実装する。

Flex の案も検討したが、7列固定グリッドは CSS Grid の方が週の行揃えが自然に実現でき、コード量が少ない。Tailwind の `grid-cols-7` で実装する。

### D5: インライン展開 — カレンダー直下に ReviewDayDetail をレンダリング

選択日の詳細は `ReviewCalendar` の直下（カレンダーグリッドの外、同じカード内）に `ReviewDayDetail` をレンダリングする。

Sheet やモーダルの案も検討したが、「インライン展開」という要件に従い、ページ内で展開する方式を採用する。スクロールの文脈が保たれ、閲覧体験が自然になる。

### D6: 日付ハンドリング — YYYY-MM-DD 文字列 + T00:00:00 付加

日付は YYYY-MM-DD 文字列で統一して扱い、`Date` オブジェクトへの変換が必要な場合は `new Date('YYYY-MM-DD' + 'T00:00:00')` とする。

Supabase の `date LIKE 'YYYY-MM-%'` クエリと整合し、タイムゾーンによる日付ズレを防ぐ。

### D7: useReviewHistory フックのロード状態管理

月変更時に `loading: true` をセットし、データ取得完了後に `loading: false` にする。エラー時は `error` ステートに格納し、UI でフォールバックを表示する。

選択日（`selectedDate`）は月変更時にリセットする（前月の選択状態が残らないようにする）。

## Risks / Trade-offs

- [habit_completions の月クエリ量] 習慣数×日数分のレコードを月単位で取得する。習慣数が多い場合はクエリ量が増えるが、現在は個人用（ドッグフーディング）で習慣数は少数のため許容する
- [カレンダーの初月表示] 初期表示は現在月とする。過去月へのナビゲーションは無制限に許可するが、アカウント作成日より前への移動は今後の改善項目とする（現時点ではスコープ外）
- [未来日タップ不可の実装] `today` と比較して未来日を判定する。「今日」の定義はクライアントのローカル日時を使用する（Supabase のサーバー時刻との1日差異は許容する）
