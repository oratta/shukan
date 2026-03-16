# Design Decisions

## D1: DailyImpactSummary を独立コンポーネントに
page.tsx に直接書くのではなく、再利用性とテスト容易性のため独立コンポーネント化。

## D2: ImpactBadge の useMan prop
formatCurrency の useMan パラメータをコンポーネントレベルで制御可能にする。デフォルトは true（後方互換）。

## D3: パーフェクト表示の演出
CSSのみで実装（pulse animation）。ライブラリ追加なし。
