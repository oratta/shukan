# annual-impact-display Specification

## Purpose
TBD - created by archiving change evidence-annual-impact-display. Update Purpose after archive.
## Requirements
### Requirement: Annual impact calculation helper
`src/lib/impact.ts`に`calculateAnnualImpact`関数を追加し、日次impactを年間impactに変換する。関数はdailyImpactを受け取り、各値に365を掛けた`AnnualImpact`を返す。

#### Scenario: Daily impact to annual conversion
- **WHEN** dailyHealthMinutes=30, dailyCostSaving=82, dailyIncomeGain=50のDailyImpactが渡された場合
- **THEN** healthMinutes=10950, costSaving=29930, incomeGain=18250のAnnualImpactを返す

#### Scenario: Weight-adjusted annual impact
- **WHEN** weight=50%のevidenceのdailyImpactを年間変換する場合
- **THEN** weight適用後の日次値×365の年間impactを返す

### Requirement: Manage Evidence bar visibility fix
HabitDetailModal内のManage Evidenceバー/ボタンが、evidenceが存在する習慣で常に表示される。

#### Scenario: Evidence exists on habit
- **WHEN** 習慣にevidenceが1つ以上紐づいている
- **THEN** Manage Evidenceバー（Settingsアイコンボタン）が表示される

#### Scenario: No evidence on habit
- **WHEN** 習慣にevidenceが紐づいていない
- **THEN** Manage Evidenceバーは表示されない（Add Evidenceボタンのみ表示）

### Requirement: Annual impact display in ImpactBadge
ImpactBadgeコンポーネントがevidenceのlife impactを年間数字で表示する。ラベルは「/年」とする。

#### Scenario: Impact badge shows annual values
- **WHEN** ImpactBadgeがevidenceのimpactを表示する
- **THEN** 年間数字で表示される（例: HeartPulse +182時間/年、Wallet ¥29,930/年、TrendingUp ¥18,250/年）

### Requirement: Annual impact display in Evidence Picker
EvidencePickerの各article項目に年間impactを表示する。

#### Scenario: Article card in picker shows annual impact
- **WHEN** EvidencePickerで利用可能なarticle一覧が表示される
- **THEN** 各articleのlife impactが年間数字で表示される

### Requirement: Annual impact display in Discover page
Discover page（マーケットプレイス）のArticleCardに年間impactを表示する。

#### Scenario: Discover page article cards show annual impact
- **WHEN** Discoverページでarticle一覧が表示される
- **THEN** 各ArticleCardのlife impactが年間数字で表示される

### Requirement: Annual impact display in Evidence Article Sheet
EvidenceArticleSheetのdaily metricsセクションを年間数字に変更する。

#### Scenario: Article sheet shows annual metrics
- **WHEN** evidence記事の詳細シートが表示される
- **THEN** impact metricsが年間数字で表示される

### Requirement: Real-time impact display in Evidence Manager
Evidence Manager Sheet内で各evidenceのweight適用後の年間impactを表示し、weight slider操作時にリアルタイムで数値が更新される。

#### Scenario: Evidence shows weighted annual impact
- **WHEN** Evidence Managerが開かれている
- **THEN** 各evidenceにweight適用後の年間impact（healthMinutes, costSaving, incomeGain）が表示される

#### Scenario: Weight adjustment updates impact in real-time
- **WHEN** ユーザーがweight sliderを50%から75%に変更する
- **THEN** そのevidenceの年間impact数値がリアルタイムで更新される（保存前でも反映）

#### Scenario: Total impact updates with weight changes
- **WHEN** 複数evidenceのweightが調整される
- **THEN** 全evidenceの合計年間impactもリアルタイムで更新される

### Requirement: Impact metrics display with icons
All impact metric displays (health lifespan, cost saving, income gain) SHALL use Lucide icons (HeartPulse, Wallet, TrendingUp) instead of emoji characters. This applies to all views: impact-badge, evidence-manager-sheet, evidence-picker, evidence-article-sheet, discover page, savings-card, impact-article-sheet, and stats page.

#### Scenario: Annual impact with Lucide icons
- **WHEN** annual impact metrics are displayed in any view
- **THEN** HeartPulse icon precedes health minutes, Wallet icon precedes cost saving, TrendingUp icon precedes income gain

