# Spec: 5 Days Life Impact

## Requirements

---

### REQ-5DI-01: 5 Days Impact セクション表示

DailyImpactSummary コンポーネント内で、Today セクションの下に「5 Days Impact」セクションを表示する。

**条件**: インパクトを持つ習慣が1つ以上存在する場合に表示する（Today セクションと同じ条件）。

---

### REQ-5DI-02: 累積インパクト計算

各習慣の `recentDays`（index 0 = today を含む）のうち、status が `completed` または `rocket_used` の日数をカウントし、その日数 × dailyImpact の合計を算出する。

- skipped の日はカウントしない
- failed / none の日はカウントしない
- 全習慣のインパクトを合算する

---

### REQ-5DI-03: 3カラム表示

Today と同じ形式で、健康寿命（分）、コスト削減（円）、収入増加（円）の3カラムを表示する。earned/total の分数表示はしない（合計のみ）。

---

### REQ-5DI-04: リアルタイム反映

ユーザーが recentDays のドットをタップして status を変更した場合、5 Days Impact の数値が即座に更新される。

---

### REQ-5DI-05: i18n 対応

「5 Days Impact」ラベルを ja/en で国際化する。

---

## Scenarios

### WHEN 3/5日が completed の習慣がある THEN 3日分の dailyImpact が表示される
- 習慣A: dailyImpact = {health: 6min, cost: ¥137, income: ¥68}
- recentDays: [completed, none, completed, failed, completed]
- 5 Days Impact: +18min, ¥411, ¥205

### WHEN 全日 none の場合 THEN 5 Days Impact は全て 0 表示
- recentDays: [none, none, none, none, none]
- 5 Days Impact: +0min, ¥0, ¥0

### WHEN 昨日のドットを none → completed に変更 THEN 5 Days の数値が増加する
- 変更前: 2日分のインパクト表示
- 昨日のドットをタップ → completed
- 変更後: 3日分のインパクトに更新

### WHEN skippedToday の習慣がある THEN Today 側はスキップだが 5 Days 側は過去の completed 分をカウント
- 今日はスキップ（Today の earned に含まない）
- 昨日・一昨日が completed → 5 Days には2日分が加算

### WHEN エビデンスのない習慣のみ THEN 5 Days セクションは非表示
- Today セクションと同様、hasImpact = false なら非表示
