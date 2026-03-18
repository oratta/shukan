## Why

HabitCard の過去ドット列はステータスを色で示すが、各ドットがどの曜日に対応するか視覚的に分からない。特に weekly・custom 頻度の習慣ではドットが非連続になるため、ユーザーが「どの曜日を達成したか」を把握しにくい。曜日ラベルを追加することで、ドットの意味が一目で分かるようになる。

## What Changes

- HabitCard の過去ドット（`.slice(1).map()` セクション）に、各ドットの上へ曜日略称ラベルを追加
- 表示例: 日本語 `月 火 水 木 金`、英語 `M T W T F`
- `toLocaleDateString(locale, { weekday: 'narrow' })` でロケール対応
- 今日の StatusIndicator（大きいボタン）にはラベルを付与しない（視覚的に既に区別されているため）

## Capabilities

### New Capabilities

- `weekday-labels`: HabitCard の過去ドット上に曜日略称を表示する機能

### Modified Capabilities

(なし — 既存のドット表示ロジックは変更しない)

## Impact

- `src/components/habits/habit-card.tsx` — 過去ドットのレンダリング部分に曜日ラベルを追加
- 追加クエリ・追加 state なし（date 文字列と useLocale から算出）
- i18n キーの追加なし（ブラウザ標準 API で自動対応）
