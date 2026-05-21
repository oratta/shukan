# Proposal: lp-shell-and-copy

## Why

change-A で marketing routing 基盤を作ったが、`src/app/marketing/page.tsx` はプレースホルダのみ。実際の LP コアメッセージ（"Switch your path."、「なりたい自分から科学が習慣を導く」）を product-concept.md から落とし込み、Hero / Problem→Solution / CTA / フッターで構成される v0 LP を実装する。これにより codex+gpt-image-2 への本格デザイン委譲時の入力資料も同時に整う。

## What Changes

- **新規追加**: `src/app/marketing/copy.ts`（タグライン / ヒーローサブコピー / Problem→Solution パラグラフ / CTA ラベル を ja で保持）
- **更新**: `src/app/marketing/page.tsx`（プレースホルダ → 実コピー反映 + DESIGN.md セマンティックカラー使用 + Lucide アイコン等の既存コンポーネント活用）
- **更新**: `src/app/marketing/layout.tsx`（最低限のメタデータ + フォント設定）
- **新規追加**: `src/__tests__/marketing-page.test.tsx`（または同等の Vitest テスト）で Hero/CTA/フッターの存在と CTA リンク先を assert

## Capabilities

### New Capabilities
- `lp-content`: LP のコアコピー・セクション構造能力

### Modified Capabilities
- なし

## Impact

- **影響コード**: `src/app/marketing/page.tsx` / `src/app/marketing/layout.tsx` / `src/app/marketing/copy.ts`（新規）/ `src/__tests__/marketing-page.test.tsx`（新規）
- **影響ファイル**: DESIGN.md / product-concept.md を読み取り専用で参照
- **影響範囲限定**: marketing 配下のみ。既存 (app) には触らない
