## Why

Quit 習慣（やらない系）のホーム画面で「今日失敗した（やってしまった）」を記録する手段がない。Positive 習慣は左の丸をタップしてステータスを切り替えられるが、quit 習慣の左リング（誘惑カウント表示）はタップ不可。ユーザーが失敗を記録するには詳細画面のカレンダーまで辿る必要があり、導線が不明確。

## What Changes

- Quit 習慣の StatusIndicator（左のリング）をタップ可能にし、タップすると VS モーダルが開くようにする
- VS モーダルに「負けた…」ボタンを追加し、今日のステータスを `failed` に設定できるようにする
- カード行の独立した `VS` ボタンを削除する（リングタップに統合）
- 結果として、全習慣タイプで「左の丸/リングをタップ = メインアクション」という統一パターンになる

## Capabilities

### New Capabilities

- `quit-habit-failure-recording`: quit 習慣の失敗を VS モーダルから記録する機能

### Modified Capabilities

- `habit-skip`: quit 習慣のカード行から VS ボタンが削除されることによるレイアウト変更（要件レベルの変更なし、実装のみ）

## Impact

- `src/components/habits/habit-card.tsx` - StatusIndicator のタップ可能化、VS ボタン削除
- `src/components/habits/vs-temptation-modal.tsx` - 「負けた」ボタン追加、失敗記録フロー
- `src/app/(app)/page.tsx` - イベントハンドラの接続変更
- `src/messages/en.json`, `src/messages/ja.json` - i18n 文字列追加
