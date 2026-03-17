## Context

ホーム画面に「Today's Life Impact」が表示されている。過去のドット操作に対するフィードバックがないため、5日間の累積インパクトを追加する。

## Goals

- 過去5日間の completed 日のインパクト合計を Today の下に表示
- 既存の Today's Impact と Perfect 判定は変更しない
- 追加の DB クエリなしで実現する（recentDays を活用）

## Non-Goals

- 5 Days 側の Perfect 判定
- 期間のカスタマイズ（7日、30日など）
- グラフやチャートの表示

## Decisions

### D1: データソース
**選択**: `HabitWithStats.recentDays` の status を使い、completed/rocket_used な日をカウントして dailyImpact を掛ける。
**理由**: 追加クエリ不要。recentDays は既に5日分のデータを持つ（frequency 対応で weekday/custom は対象日のみ）。

### D2: UI 配置
**選択**: 既存の DailyImpactSummary コンポーネント内に、Today セクションの下に区切り線で 5 Days セクションを追加。
**理由**: 別コンポーネントにする複雑さがない。一つのカード内で today と 5 days を見せる方がコンパクト。

### D3: Weekly 習慣の扱い
**選択**: Weekly 習慣も recentDays の completed 日数 × dailyImpact で計算する。
**理由**: Weekly 習慣の recentDays は7日分あるが、completed な日だけカウントすれば同じロジックで統一できる。「5 Days Impact」のラベルだが、実データは各習慣の recentDays の completed 日数に基づく。

### D4: 表示形式
**選択**: Today と同じ3カラム（健康寿命、コスト削減、収入増加）で金額のみ表示。earned/total の分数表示はしない。
**理由**: 5日間の「やれたはずの total」は計算が複雑（スキップ日、非対象日を考慮）で、ユーザーにとっても「獲得した合計」だけで十分。

## Risks

- recentDays の日数が frequency によって異なる（everyday=5, weekly=7, weekday/custom=対象日5日分）ため、「5 Days」というラベルが厳密には正確でないケースがある → 許容範囲。ユーザーにとっては「直近の成果」という意味で十分。
