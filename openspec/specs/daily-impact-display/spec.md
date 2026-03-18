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

### REQ-DI-07: レビューシートは全習慣を表示
レビューシートは昨日の全習慣（非アーカイブ）を表示しなければならない（SHALL）。入力済みの習慣はそのステータスで表示し、未入力（none）の習慣は未入力状態で表示する。バナーの表示条件とカウントは未レビュー数のみ。

### REQ-DI-08: ステータス選択はインラインボタン群
各習慣のステータス選択は、3つのインラインボタン（completed / skipped / failed）で行う（SHALL）。選択済みボタン再タップで none に戻す。タップサイクル式は使用しない。

### REQ-DI-09: ステータスボタンのビジュアル
- completed: Check アイコン、選択時 `bg-[#3D8A5A]/10 border-[#3D8A5A] text-[#3D8A5A]`
- skipped: Minus アイコン、選択時 `bg-gray-200 border-gray-400 text-gray-600`
- failed: X アイコン、選択時 `bg-[#D08068]/10 border-[#D08068] text-[#D08068]`
- 未選択: `border-muted-foreground/20 text-muted-foreground/40`

### REQ-DI-10: ムードアイコンは Lucide を使用
ムードスタンプはシステム絵文字ではなく Lucide アイコン（Frown, Meh, CircleMinus, Smile, Laugh）で表示する（SHALL）。色: red-400, orange-400, gray-400, lime-500, green-500。

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
