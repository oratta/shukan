# Daily Impact Display Specification

## Requirements

### REQ-DI-01: DailyImpactSummary コンポーネント
ホーム画面の完了プログレスバー下に、今日のデイリーインパクト（3指標）を分子/分母形式で表示する。

### REQ-DI-02: 分子/分母計算
- 分母: 全習慣（evidenceあり）のデイリーインパクト合計
- 分子: completedToday === true の習慣のデイリーインパクト合計
- evidence未紐付け習慣は除外

### REQ-DI-03: パーフェクト表示
全習慣達成時（分子 === 分母 && 分母 > 0）にパーフェクト表示に切り替わる。

### REQ-DI-04: HabitCard/HabitDetailModal デイリー表示
ImpactBadgeのモードを annual → daily に変更。

### REQ-DI-05: 年間ビュー具体的数字
EvidenceArticleSheetの年間金額を ¥XXX,XXX 形式で表示（万単位丸めを無効化）。

### REQ-DI-06: ImpactBadge useMan prop
ImpactBadgeに useMan プロパティを追加し、formatCurrency に透過させる。

## Test Scenarios

### SCENARIO-DI-01: calculateDailyImpact returns correct values
GIVEN: 2つのevidences（weight 100, weight 50）
WHEN: calculateDailyImpact を呼ぶ
THEN: 重み付き合計が正しい

### SCENARIO-DI-02: formatCurrency with useMan=false
GIVEN: amount = 547500
WHEN: formatCurrency(547500, false) を呼ぶ
THEN: "¥547,500" を返す

### SCENARIO-DI-03: formatCurrency with useMan=true (default)
GIVEN: amount = 547500
WHEN: formatCurrency(547500) を呼ぶ
THEN: "¥54万" を返す（既存動作維持）

### SCENARIO-DI-04: Daily impact aggregation
GIVEN: 3習慣（2つにevidence、1つにevidenceなし）、2つ達成済み
WHEN: earned/total を計算
THEN: evidenceなし習慣は除外、達成済み2つの合計が earned
