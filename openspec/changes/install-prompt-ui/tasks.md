# Implementation Tasks

TDD 順（Red → Green → Refactor）。各グループでテストを先に書き、失敗を確認してから実装する。

## 1. 純関数レイヤー: detectPlatform（テスト先行）

- [ ] 1.1 `detectPlatform` の unit テストを作成（iOS Safari UA → 'ios-safari' / Android Chrome UA → 'android-chrome' / isStandalone → 'standalone' / デスクトップ・CriOS 等 → 'other'）— Red 確認
- [ ] 1.2 `src/lib/pwa/platform.ts` に `detectPlatform(ua, isStandalone)` を実装 — Green 確認

## 2. 純関数レイヤー: shouldShowInstallBanner + dismiss 管理（テスト先行）

- [ ] 2.1 `shouldShowInstallBanner` の unit テストを作成（justCompleted:true × ios-safari/android-chrome × dismiss なし → true / standalone・other → 常に false / justCompleted:false → 常に false / dismiss 30日以内 → false・30日ちょうど → false・30日超 → true の境界値）— Red 確認
- [ ] 2.2 `src/lib/pwa/banner.ts` に `shouldShowInstallBanner` を実装 — Green 確認
- [ ] 2.3 dismiss 読み書きの unit テストを作成（キー `pwa-install-dismissed-at` / ISO 8601 保存 / 不正値・未設定は null / storage 注入のメモリ実装でテスト）— Red 確認
- [ ] 2.4 `src/lib/pwa/dismissal.ts` に readDismissedAt / writeDismissedAt を実装（try/catch でクラッシュ防止）— Green 確認
- [ ] 2.5 `isCompletionTransition(prev, next)` の unit テストを作成（非完了→completed / 非完了→rocket_used → true、completed→completed / rocket_used→completed / 非完了→failed・skipped・none → false、prev 未記録(undefined/null)→completed → true）— Red 確認
- [ ] 2.6 `src/lib/pwa/completion.ts` に `isCompletionTransition` を実装 — Green 確認

## 3. i18n（テスト先行）

- [ ] 3.1 バナー・設定ヘルプで使用するメッセージキー一覧を定義し、en/ja 両方に存在することの unit テストを作成 — Red 確認
- [ ] 3.2 `src/messages/en.json` / `src/messages/ja.json` に新規キーを追加（既存キーの変更・削除・移動なし）— Green 確認

## 4. UI コンポーネント（薄い表示層・分岐ロジック禁止）

- [ ] 4.1 `src/components/pwa/ios-install-instructions.tsx` — 共有 →「ホーム画面に追加」2ステップ図解（lucide アイコン + テキスト）
- [ ] 4.2 `src/components/pwa/android-install-button.tsx` — 「ホーム画面に追加」ボタン。保持済み `beforeinstallprompt` イベントの `prompt()` を発火
- [ ] 4.3 `src/components/pwa/install-banner.tsx` — UA / display-mode 取得 → `detectPlatform` → `shouldShowInstallBanner` の戻り値のみで出し分け。`beforeinstallprompt` を useEffect で捕捉し ref/state 保持（永続化しない）。× で `writeDismissedAt`。shadcn Card 規約・非モーダル
- [ ] 4.4 `src/components/pwa/install-help-dialog.tsx` — 同じ案内のダイアログ版。standalone なら「追加済み」表示

## 5. 表示トリガー組み込み

- [ ] 5.1 `src/app/(app)/page.tsx` — 「習慣ID → today status」マップを導出し `useRef` で前回スナップショットを保持。レンダー間で `isCompletionTransition(prev, next)` が true の習慣があれば `justCompleted` フラグを立てる（status 遷移ベース。setDayStatus / markQuitDailyDone どちらの経路でも検出される。通常習慣・quit 習慣の両方が対象）
- [ ] 5.2 初回マウント（prev スナップショット無し）では発火しないことをコード上で保証（リロード・再訪で completedCount > 0 でも表示されない）
- [ ] 5.3 InstallBanner を BottomNav の上に配置し `justCompleted` を渡す（state のみ・永続化なし → リロードで必ず非表示）

## 6. 設定画面

- [ ] 6.1 `src/app/(app)/settings/page.tsx` に「ホーム画面に追加」ヘルプ項目を常設追加（タップで install-help-dialog を開く）

## 7. 検証

- [ ] 7.1 `npm run test:run` 全 PASS（受け入れ条件 6〜11 を網羅していることを確認）
- [ ] 7.2 型チェック + `next build` がエラーなしで通る
- [ ] 7.3 手動確認（plan.md「動作確認方法」）: 完了直後のみ表示 / リロード非表示 / dismiss 30日抑制 / iPhone UA で図解バナー / beforeinstallprompt でネイティブプロンプト / 設定ヘルプダイアログ
