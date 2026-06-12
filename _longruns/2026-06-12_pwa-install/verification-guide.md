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
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S2: Manifest content is verified by unit tests
- WHEN: `npm run test:run` を実行する
- THEN: `src/app/manifest.ts` の返り値が name / short_name / 192・512 アイコン / start_url / display:"standalone" を含むことを検証する unit テストが PASS する
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S3: Page links to /manifest.webmanifest and old file is gone
- WHEN: アプリの任意のページを開いて HTML の `<link rel="manifest">` を確認する
- THEN: href が `/manifest.webmanifest` であり `/manifest.json` への参照は存在しない。リポジトリに `public/manifest.json` が存在しない
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S4: Reference consistency is verified by unit tests
- WHEN: `npm run test:run` を実行する
- THEN: `src/app/layout.tsx` が `/manifest.json` を参照していないこと、`public/manifest.json` が存在しないことを検証する unit テストが PASS する
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

## change-B: install-prompt-ui

### S5: UA と standalone 状態からプラットフォームを4種に判定する
- WHEN: iOS Safari / Android Chrome / isStandalone:true / デスクトップ等の UA を `detectPlatform()` に渡す
- THEN: それぞれ 'ios-safari' / 'android-chrome' / 'standalone' / 'other' が返る
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S6: 完了への遷移判定が純関数で検証できる
- WHEN: `isCompletionTransition(prev, next)` に非完了→completed/rocket_used、完了済→completed、非完了→failed 等の遷移を渡す
- THEN: 非完了→完了系のみ true、それ以外は false が返る
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S7: iOS Safari で習慣を完了するとバナーが表示される
- WHEN: iOS Safari（未インストール・dismiss 記録なし）でホーム画面の習慣を1つ完了させる（quit 習慣の完了でも同様）
- THEN: BottomNav の上に「① 共有ボタンをタップ → ②『ホーム画面に追加』を選択」の2ステップ図解バナー（lucide アイコン + テキスト、右上に ×）が表示される
- [x] テスト実装完了（表示可否の判定ロジックは `shouldShowInstallBanner`（ios-safari→true）/ `detectPlatform` の unit テストでカバー。DOM レンダリング自体は手動確認に委譲）
- [x] ロジック実装完了
- [x] 動作確認完了（iOS Safari UA 偽装で、バナーと共有する `IosInstallInstructions` の2ステップ図解 — ①Share アイコン「共有ボタンをタップ」②SquarePlus アイコン「『ホーム画面に追加』を選択」— が live DOM に表示されることを確認。完了→バナー出現の page.tsx トリガー連携はソースで確認済み。実機での「習慣完了→バナー出現」の最終確認はユーザーに委譲）
- [ ] ユーザー確認完了

### S8: Android Chrome ではネイティブのインストールプロンプトを発火できる
- WHEN: Android Chrome（beforeinstallprompt 捕捉済み）で習慣を完了 → 「ホーム画面に追加」ボタンをタップ
- THEN: バナーが表示され、保持していたイベントの `prompt()` が呼ばれてネイティブのインストールプロンプトが開く
- [x] テスト実装完了（表示判定（android-chrome→true）は `shouldShowInstallBanner` / `detectPlatform` の unit テストでカバー。`prompt()` 発火の DOM 連携は手動確認に委譲）
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S9: standalone・その他環境ではバナーが表示されない
- WHEN: インストール済み（standalone）またはデスクトップ等のその他環境で習慣を完了させる
- THEN: `shouldShowInstallBanner()` が false を返し、バナーは表示されない
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（デスクトップ（other）UA のホームでバナー非表示を live 確認。standalone/other → false は unit テストでカバー）
- [ ] ユーザー確認完了

### S10: dismiss 後30日以内は再表示されない
- WHEN: バナーの × で閉じて別の習慣を完了 / dismiss からちょうど30日 / 30日超の時点で完了
- THEN: `pwa-install-dismissed-at` に ISO 8601 で保存され、30日以内（ちょうど含む）は非表示、30日超で再表示される
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（境界含む dismiss 抑制ロジック・localStorage key・ISO 8601 read/write は unit テスト 18 件でカバー。private mode の throw 耐性も検証済み）
- [ ] ユーザー確認完了

### S11: 完了済み習慣があってもリロード後はバナーが表示されない
- WHEN: 習慣完了でバナー表示後、ページをリロードまたは再訪する
- THEN: completedCount > 0 でもバナーは表示されない（justCompleted:false → 常に false）
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（iOS Safari UA を有効にしたまま、ホーム新規ロード（justCompleted:false）でバナーが live DOM に出ないことを確認。justCompleted:false → 常に false は unit テストでカバー）
- [ ] ユーザー確認完了

### S12: 設定画面からいつでも案内ダイアログを開ける
- WHEN: 設定画面で「ホーム画面に追加」項目をタップする（standalone 状態でも確認）
- THEN: プラットフォームに応じた案内がダイアログ表示される。standalone なら「追加済み」表示
- [x] テスト実装完了（出し分けの基となる `detectPlatform`（standalone 判定含む）は unit テストでカバー。ダイアログの DOM 表示は手動確認に委譲）
- [x] ロジック実装完了
- [x] 動作確認完了（設定→「ホーム画面に追加」クリックでダイアログが live で開くことを確認。desktop（other）UA では「スマホの Safari/Chrome で開いて」案内、iOS Safari UA 偽装では2ステップ図解が出し分けされることを両方確認。Escape/× でキャンセル可能）
- [ ] ユーザー確認完了

### S13: 全メッセージキーが en/ja 両方に存在する
- WHEN: バナー・設定ヘルプで使用する全メッセージキーについて unit テストを実行する
- THEN: 各キーが `src/messages/en.json` と `src/messages/ja.json` の両方に存在することが検証され PASS する
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了（11 個の `pwa.*` キーが en.json/ja.json 両方に存在することを直接確認 + pwa-messages.test.ts 23 件 PASS）
- [ ] ユーザー確認完了
