# Tasks: first-run-tutorial

## 1. 純ロジック
- [x] 1.1 `src/lib/tutorial.ts`: ステップ定義（selector / interactive / advance / skipToOnMissing）、localStorage 制御（pending/done）、CustomEvent 発火ヘルパー
- [x] 1.2 `src/__tests__/tutorial-logic.test.ts`: ステップ構成・進捗計算・フォールバック先の整合テスト

## 2. オーバーレイ描画
- [x] 2.1 `src/components/tutorial/tutorial-overlay.tsx`: スポットライト（box-shadow 方式の穴）＋4面クリックブロッカー＋パルスリング＋ツールチップ（上下自動配置）
- [x] 2.2 ようこそ/完走カード（中央モーダル型）、進捗ドット、スキップ/Escape 離脱
- [x] 2.3 rAF ループでの anchor 追従（スクロール・レイアウト変化対応）、必要時のみ scrollIntoView
- [x] 2.4 シート（z-50）表示中の退避（sheetWait）と復帰、復帰直後の Escape 誤発火ガード
- [x] 2.5 ラッパー pointer-events-none ＋ブロッカーのみ auto（穴の中の実操作を通す）

## 3. 実UI配線
- [x] 3.1 `data-tutorial` アンカー付与（habit-status / nav-discover / discover-articles / discover-create）
- [x] 3.2 `dashboard-client.tsx`: 達成/取り消し/シート開閉の emitTutorialEvent 通知
- [x] 3.3 `onboarding-wizard.tsx`: 完了書き込み成功後に markTutorialPending
- [x] 3.4 `(app)/layout.tsx` にオーバーレイ設置
- [x] 3.5 i18n: ja/en に `tutorial` namespace 追加

## 4. 検証
- [x] 4.1 vitest 全件 PASS / eslint クリーン / `next build` 成功
- [x] 4.2 Playwright（magiclink 認証・モバイル 390×844）で全6ステップ＋完走カード＋再表示抑止を実操作走破（console エラーなし）
