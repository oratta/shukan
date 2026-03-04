## Context

現在、evidenceのlife impactは日次（/日）で表示されている。数値が小さく（例: +30分/日、¥82/日）impactの大きさが伝わりにくい。年間表示（+182時間/年、¥29,930/年）にすることで、ユーザーがevidenceの価値を直感的に理解できる。

また、Evidence Manager Sheetを開くためのUIバーが表示されないバグがあり、habit詳細からevidenceの管理にアクセスできない状態。

## Goals / Non-Goals

**Goals:**
- Manage Evidenceバーの表示バグを修正
- 全箇所でevidenceのlife impactを年間数字で統一表示
- Evidence Manager内で各evidenceの年間impactを表示し、weight調整時にリアルタイム更新

**Non-Goals:**
- 累積impact（SavingsCard）の表示変更は対象外（これは実際の完了日数に基づく実績値）
- impact計算ロジック自体の変更（日次計算は維持し、表示時に×365）
- 新しいDB構造やAPI変更

## Decisions

### D1: 年間変換は表示層で行う
日次の計算ロジック（`calculateDailyImpact`）は維持し、表示時に`×365`で年間変換する。`calculateAnnualImpact`ヘルパー関数を`src/lib/impact.ts`に追加。

**理由**: 累積impact（completedDays × daily）の計算は日次ベースのまま正確に保ちたい。年間はあくまで「見せ方」の問題。

### D2: ImpactBadgeコンポーネントにmode propを追加
`mode: 'daily' | 'annual'`を追加し、デフォルトを`'annual'`にする。SavingsCardは変更しない（実績値のため）。

**理由**: 既存のSavingsCard等への影響を最小限にしつつ、全evidence表示箇所で統一的に年間表示に切り替え可能。

### D3: Evidence ManagerにインラインImpact表示を追加
各evidence行にweight適用後の年間impactを表示。sliderのonChange時にリアルタイムで再計算・表示。ローカルstateで管理し、保存時にのみAPI呼び出し。

## Risks / Trade-offs

- **表示の一貫性**: 「年間」と「累積」が混在する可能性 → ラベルに「/年」を明記して区別
- **パフォーマンス**: weight slider操作のたびに再計算 → 計算量は微小（掛け算のみ）なので問題なし
