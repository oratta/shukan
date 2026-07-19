# Proposal: first-run-tutorial

Refs: PR #115

## Why

オンボーディング（KPI選択→習慣選択）を終えてホームに着地した新規ユーザーは、日々の中核操作（タップで達成・再タップで取り消し・長押しで失敗/スキップ記録）と習慣を増やす導線（発見タブ・エビデンス記事からの追加・ゼロからの自作）を発見する手段を持たない。特に長押しメニューとエビデンス割合（%）による効果配分の調整は UI から自然に発見しにくく、機能説明を文章（FAQ）で行うのは難しい。実UIの上で実際に操作させながら覚えてもらうコーチマーク方式のチュートリアルを、オンボーディング完了直後に一度だけ提供する。

## What Changes

- **コーチマーク・チュートリアルの新設**: 暗幕にスポットライトの穴を開けて実UIに重ね、穴の中の実操作（タップ/長押し/タブ遷移）でステップが進む使い方ガイド（全6ステップ＋ようこそ/完走カード）
  - [1] タップで達成 → [2] 再タップで取り消し → [3] 長押しでアクションシート → [4] 発見タブへ遷移 → [5] エビデンス記事からの追加説明 → [6] ゼロから自作（複数行動の束ね＋エビデンス割合%調整）の説明
- **起動制御**: オンボーディング完了時に localStorage へ `pending` を記録し、ホーム到着で一度だけ起動。完走/スキップで `done` となり以後表示しない。`?tutorial=1` で再実行可能（動作確認用）
- **実UIへの配線**: 達成/取り消し/アクションシート開閉を CustomEvent で通知（非アクティブ時は no-op）。アンカーは `data-tutorial` 属性（`habit-status` / `nav-discover` / `discover-articles` / `discover-create`）
- **共存制御**: アクションシート等の z-50 レイヤー表示中はオーバーレイを退避し、閉じたら復帰。習慣0件などアンカー不在時は該当ステップを自動スキップ

## Capabilities

### New Capabilities
- `first-run-tutorial`: 初回チュートリアルの起動条件・ステップ構成と進行条件・スポットライトの操作制御・離脱手段・アンカー不在時のフォールバックを定義する

### Modified Capabilities
- なし（onboarding spec のフロー自体は不変更。完了時に pending フラグを記録する副作用のみ追加）

## Impact

- **新規**: `src/lib/tutorial.ts`（ステップ定義・localStorage・イベントの純ロジック）、`src/components/tutorial/tutorial-overlay.tsx`（スポットライト描画）、`src/__tests__/tutorial-logic.test.ts`
- **配線**: `(app)/layout.tsx`（オーバーレイ設置。ルート横断で状態維持）、`dashboard-client.tsx`（イベント通知）、`onboarding-wizard.tsx`（完了時 pending 記録）、`habit-card.tsx` / `bottom-nav.tsx` / `header.tsx` / `discover/page.tsx`（`data-tutorial` アンカー付与）
- **i18n**: `messages/ja.json` / `en.json` に `tutorial` namespace 追加
- **DB**: 変更なし（表示制御は localStorage のみ。クロスデバイス化する場合の `user_profiles` カラム追加は将来課題）
