# Quit Habit Failure Recording Specification

## ADDED Requirements

### Requirement: Quit 習慣のリングをタップして VS モーダルを開く

quit 習慣の StatusIndicator（誘惑カウントリング）をタップ可能にし、タップすると VS モーダルが開かなければならない（MUST）。

#### Scenario: リングタップで VS モーダルが開く
- **WHEN** quit 習慣のリング（StatusIndicator）をタップする
- **THEN** VsTemptationModal が開く
- **THEN** コーピングステップと「耐えた！」ボタンが表示される

#### Scenario: リングにタップ可能なスタイルが適用される
- **WHEN** quit 習慣のカードが表示される
- **THEN** リングに `cursor-pointer` が適用される
- **THEN** タップ/クリック時にインタラクションフィードバックがある

---

### Requirement: VS モーダルに「負けた」ボタンを表示する

VS モーダルに「負けた…」ボタンを追加し、ユーザーが失敗を記録できなければならない（MUST）。ボタンは「耐えた！」ボタンより視覚的に控えめでなければならない（MUST）。

#### Scenario: 「負けた」ボタンが表示される
- **WHEN** VS モーダルが開いている
- **THEN** 「耐えた！」ボタンの下に「負けた…」ボタンが表示される
- **THEN** 「負けた…」ボタンはテキストリンク風の控えめなスタイルである

#### Scenario: 「負けた」をタップすると今日が failed になる
- **WHEN** 「負けた…」ボタンをタップする
- **THEN** `setDayStatus(habitId, today, 'failed')` が呼ばれる
- **THEN** モーダルが閉じる（トロフィー演出なし）

#### Scenario: 「負けた」タップ後のリング表示
- **WHEN** 「負けた…」により今日が `failed` になった後
- **THEN** ホーム画面のリングの背景またはスタイルが失敗状態を反映する

---

### Requirement: カード行から独立した VS ボタンを削除する

quit 習慣のカード折りたたみ行から独立した `VS` ボタンを削除しなければならない（MUST）。リングタップが VS モーダルの唯一のエントリーポイントとなる。

#### Scenario: VS ボタンが表示されない
- **WHEN** quit 習慣のカード折りたたみ行が表示される
- **THEN** `Shield` アイコン付きの `VS` ボタンが表示されない

#### Scenario: リングが VS モーダルへの唯一のホーム画面エントリーポイントになる
- **WHEN** quit 習慣のホーム画面カードが表示される
- **THEN** VS モーダルを開くには StatusIndicator のリングをタップする以外の方法がない（カード行レベルで）

---

### Requirement: i18n 対応

「負けた」ボタンの文字列を日英両言語で表示できなければならない（MUST）。

#### Scenario: i18n 文字列が定義される
- **WHEN** アプリが表示される
- **THEN** 以下のキーが利用可能である

| キー | 日本語 | 英語 |
|------|--------|------|
| `habits.iGaveIn` | 負けた… | I gave in... |
