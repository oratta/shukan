# Proposal: install-prompt-ui

## Why

change-A（pwa-manifest）で Smitch は技術的にインストール可能（installable）になるが、ユーザーがその存在に気付く導線がない。特に日本市場で6割超を占める iPhone の Safari はインストールバナーを一切自動表示しないため、明示的な案内なしではホーム画面追加はほぼ発生しない。習慣を完了した直後（モチベーションが最も高い瞬間）に、プラットフォームに応じたインストール導線を一度だけ提示することで、ホーム画面からの再訪導線を確立する。

## What Changes

1. **純関数レイヤー `src/lib/pwa/`**: 表示判定ロジックを React から分離し、Vitest（node 環境）で完全にテスト可能にする
   - `detectPlatform(ua, isStandalone): 'ios-safari' | 'android-chrome' | 'standalone' | 'other'`
   - `shouldShowInstallBanner({ platform, dismissedAt, now, justCompleted }): boolean`
   - dismiss 記録の読み書き（localStorage キー `pwa-install-dismissed-at`、ISO 8601）
2. **インストール導線バナー（`src/components/pwa/`、薄い表示層）**:
   - iOS Safari: 共有 →「ホーム画面に追加」の2ステップ図解バナー（lucide アイコン + テキスト）
   - Android Chrome: `beforeinstallprompt` 捕捉 →「ホーム画面に追加」ボタン → `prompt()` 発火
   - その他環境・standalone: 非表示
   - BottomNav の上に非モーダルのカード型（shadcn Card 規約）、右上に ×（dismiss）
3. **表示トリガー（`(app)/page.tsx`）**: 習慣が非completed → completed に遷移した瞬間のみ表示フラグを立てる。通常習慣の `setDayStatus` 経路と quit 習慣の `markQuitDailyDone` 経路の両方を対象。リロード・再訪・`completedCount > 0` だけでは表示しない
4. **設定画面ヘルプ**: 「ホーム画面に追加」項目を常設。タップで同じ案内をダイアログ表示。インストール済み（standalone）なら「追加済み」表示
5. **i18n**: `src/messages/{en,ja}.json` への新規キー追加のみ + 全キーが en/ja 両方に存在することのテスト

## Capabilities

### New Capabilities
- `install-prompt-ui`: プラットフォーム別インストール導線（純関数判定レイヤー + バナー + 設定ヘルプ + i18n）

### Modified Capabilities
- なし（既存 spec の要件変更はない。`(app)/page.tsx` への組み込みは表示トリガーの追加のみで、既存習慣機能の振る舞いは変えない）

## Impact

### 影響を受けるコード
- `src/lib/pwa/`（新規）- detectPlatform / shouldShowInstallBanner / dismiss 管理の純関数
- `src/components/pwa/`（新規）- インストールバナー・案内ダイアログ（薄い表示層、分岐ロジック禁止）
- `src/app/(app)/page.tsx` - 完了遷移トリガーの組み込み（prevStatusRef パターン）
- `src/app/(app)/settings/page.tsx` - 「ホーム画面に追加」ヘルプ項目の追加
- `src/messages/en.json` / `src/messages/ja.json` - 新規キー追加のみ（既存キーの変更・削除・移動禁止）
- `src/__tests__/`（または同等のテスト配置）- 純関数 unit テスト + メッセージキー存在テスト

### 影響を受けるシステム
- なし。DB 変更なし、localStorage（`pwa-install-dismissed-at`）のみで完結

### 制約（他 worktree との競合回避・plan.md 由来）
- 依存パッケージ追加禁止（UA 判定・display-mode 判定は自前実装。DOM テストライブラリも追加しない）
- `src/middleware.ts` 変更禁止
- Service Worker 導入禁止

### 依存関係
- change-A（pwa-manifest）が先行（manifest が正しく配信されていることが前提）
