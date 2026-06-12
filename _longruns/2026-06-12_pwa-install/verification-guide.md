# Verification Guide

権威ソースは各 change の spec.md。本ファイルはその派生ビュー + 進捗トラッカー。

## 環境
- URL: http://localhost:3000 （ポート使用中の場合は 3001 等。他プロジェクトのプロセスは kill しない）
- 起動: `npm run dev`
- テスト: `npm run test:run`（Vitest, node 環境）

## change-A: pwa-manifest

### S1: Manifest is installable-complete at /manifest.webmanifest
- WHEN: ブラウザで `/manifest.webmanifest` にアクセスする
- THEN: name "Smitch - Switch your path" / short_name "Smitch" / icons 192・512 / start_url "/" / display "standalone" / id・lang・dir・categories / theme_color "#2B4162" / background_color "#F8F9FA" を含む JSON が返る
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S2: Manifest content is verified by unit tests
- WHEN: `npm run test:run` を実行する
- THEN: `src/app/manifest.ts` の返り値が name / short_name / 192・512 アイコン / start_url / display:"standalone" を含むことを検証する unit テストが PASS する
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S3: Page links to /manifest.webmanifest and old file is gone
- WHEN: アプリの任意のページを開いて HTML の `<link rel="manifest">` を確認する
- THEN: href が `/manifest.webmanifest` であり `/manifest.json` への参照は存在しない。リポジトリに `public/manifest.json` が存在しない
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S4: Reference consistency is verified by unit tests
- WHEN: `npm run test:run` を実行する
- THEN: `src/app/layout.tsx` が `/manifest.json` を参照していないこと、`public/manifest.json` が存在しないことを検証する unit テストが PASS する
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

## change-B: install-prompt-ui

### S5: UA と standalone 状態からプラットフォームを4種に判定する
- WHEN: iOS Safari / Android Chrome / isStandalone:true / デスクトップ等の UA を `detectPlatform()` に渡す
- THEN: それぞれ 'ios-safari' / 'android-chrome' / 'standalone' / 'other' が返る
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S6: 完了への遷移判定が純関数で検証できる
- WHEN: `isCompletionTransition(prev, next)` に非完了→completed/rocket_used、完了済→completed、非完了→failed 等の遷移を渡す
- THEN: 非完了→完了系のみ true、それ以外は false が返る
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S7: iOS Safari で習慣を完了するとバナーが表示される
- WHEN: iOS Safari（未インストール・dismiss 記録なし）でホーム画面の習慣を1つ完了させる（quit 習慣の完了でも同様）
- THEN: BottomNav の上に「① 共有ボタンをタップ → ②『ホーム画面に追加』を選択」の2ステップ図解バナー（lucide アイコン + テキスト、右上に ×）が表示される
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S8: Android Chrome ではネイティブのインストールプロンプトを発火できる
- WHEN: Android Chrome（beforeinstallprompt 捕捉済み）で習慣を完了 → 「ホーム画面に追加」ボタンをタップ
- THEN: バナーが表示され、保持していたイベントの `prompt()` が呼ばれてネイティブのインストールプロンプトが開く
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S9: standalone・その他環境ではバナーが表示されない
- WHEN: インストール済み（standalone）またはデスクトップ等のその他環境で習慣を完了させる
- THEN: `shouldShowInstallBanner()` が false を返し、バナーは表示されない
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S10: dismiss 後30日以内は再表示されない
- WHEN: バナーの × で閉じて別の習慣を完了 / dismiss からちょうど30日 / 30日超の時点で完了
- THEN: `pwa-install-dismissed-at` に ISO 8601 で保存され、30日以内（ちょうど含む）は非表示、30日超で再表示される
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S11: 完了済み習慣があってもリロード後はバナーが表示されない
- WHEN: 習慣完了でバナー表示後、ページをリロードまたは再訪する
- THEN: completedCount > 0 でもバナーは表示されない（justCompleted:false → 常に false）
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S12: 設定画面からいつでも案内ダイアログを開ける
- WHEN: 設定画面で「ホーム画面に追加」項目をタップする（standalone 状態でも確認）
- THEN: プラットフォームに応じた案内がダイアログ表示される。standalone なら「追加済み」表示
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S13: 全メッセージキーが en/ja 両方に存在する
- WHEN: バナー・設定ヘルプで使用する全メッセージキーについて unit テストを実行する
- THEN: 各キーが `src/messages/en.json` と `src/messages/ja.json` の両方に存在することが検証され PASS する
- [ ] テスト実装完了
- [ ] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了
