# install-prompt-ui Specification

## ADDED Requirements

### Requirement: プラットフォーム判定
システムは `detectPlatform(ua, isStandalone)` 純関数により、実行環境を `'ios-safari'` / `'android-chrome'` / `'standalone'` / `'other'` の4種に判定しなければならない（MUST）。判定ロジックは `src/lib/pwa/` に置き、Vitest（node 環境）でテスト可能でなければならない（MUST）。

#### Scenario: UA と standalone 状態からプラットフォームを4種に判定する
- **WHEN** iOS Safari の UA 文字列を渡す
- **THEN** `'ios-safari'` が返る
- **WHEN** Android Chrome の UA 文字列を渡す
- **THEN** `'android-chrome'` が返る
- **WHEN** `isStandalone: true`（ホーム画面から起動）で呼び出す
- **THEN** UA にかかわらず `'standalone'` が返る
- **WHEN** デスクトップブラウザ等それ以外の UA を渡す
- **THEN** `'other'` が返る

### Requirement: 習慣完了直後のインストールバナー表示
システムは、習慣がこの操作で非完了から完了（`completed` または `rocket_used`）に遷移した直後のみ、ホーム画面（`(app)/page.tsx`）の BottomNav の上に非モーダルのカード型インストールバナーを表示しなければならない（MUST）。遷移検出は習慣の today status の変化に基づいて行い、通常習慣・quit 習慣のどちらの完了操作もトリガー対象としなければならない（MUST）。遷移判定は `src/lib/pwa/` の純関数 `isCompletionTransition(prev, next)` で行わなければならない（MUST）。バナーはユーザー操作をブロックしてはならない（MUST NOT）。

#### Scenario: 完了への遷移判定が純関数で検証できる
- **WHEN** `isCompletionTransition(prev, next)` に非完了 status（`'none'` / `'skipped'` / `'failed'` / 未記録）から `'completed'` または `'rocket_used'` への遷移を渡す
- **THEN** `true` が返る
- **WHEN** `prev` が既に `'completed'` または `'rocket_used'`、あるいは `next` が完了系でない遷移を渡す
- **THEN** `false` が返る

#### Scenario: iOS Safari で習慣を完了するとバナーが表示される
- **WHEN** iOS Safari（未インストール・dismiss 記録なし）でホーム画面の習慣を1つ完了させる
- **THEN** BottomNav の上に「① 共有ボタンをタップ → ②『ホーム画面に追加』を選択」の2ステップ図解バナー（lucide アイコン + テキスト、右上に ×）が表示される
- **THEN** quit 習慣を完了させた場合（today status が完了に遷移した場合）でも同様にバナーが表示される

#### Scenario: Android Chrome ではネイティブのインストールプロンプトを発火できる
- **WHEN** Android Chrome（`beforeinstallprompt` 捕捉済み・未インストール・dismiss 記録なし）で習慣を1つ完了させる
- **THEN** 「ホーム画面に追加」ボタンを持つバナーが表示される
- **WHEN** そのボタンをタップする
- **THEN** 保持していたイベントの `prompt()` が呼ばれ、ネイティブのインストールプロンプトが開く

#### Scenario: standalone・その他環境ではバナーが表示されない
- **WHEN** インストール済み（standalone 表示）またはデスクトップ等のその他環境で習慣を完了させる
- **THEN** `shouldShowInstallBanner()` が `false` を返し、バナーは表示されない

### Requirement: dismiss による30日間の再表示抑制
システムはバナーの ×（dismiss）タップ時に localStorage キー `pwa-install-dismissed-at` へ ISO 8601 形式で日時を記録し、記録から30日以内は `shouldShowInstallBanner()` が `false` を返さなければならない（MUST）。30日を超えた場合は再び表示可能としなければならない（MUST）。

#### Scenario: dismiss 後30日以内は再表示されない
- **WHEN** バナーの × をタップして閉じ、その後別の習慣を完了させる
- **THEN** localStorage の `pwa-install-dismissed-at` に ISO 8601 の日時が保存され、バナーは再表示されない
- **WHEN** dismiss からちょうど30日経過した時点で習慣を完了させる
- **THEN** `shouldShowInstallBanner()` は `false` を返す（境界値は抑制側）
- **WHEN** dismiss から30日を超えた時点で習慣を完了させる
- **THEN** `shouldShowInstallBanner()` は `true` を返し、バナーが再表示される

### Requirement: リロード・再訪では表示しない
システムは `justCompleted: false`（ページリロード・再訪・`completedCount > 0` の定常状態）では、他の条件を満たしていてもバナーを表示してはならない（MUST NOT）。

#### Scenario: 完了済み習慣があってもリロード後はバナーが表示されない
- **WHEN** 習慣を完了してバナーが表示された後、ページをリロードまたは再訪する
- **THEN** 完了済み習慣（completedCount > 0）が存在していてもバナーは表示されない
- **THEN** `shouldShowInstallBanner({ justCompleted: false, ... })` は platform・dismiss 状態にかかわらず `false` を返す

### Requirement: 設定画面の常設ヘルプ
システムは設定画面に「ホーム画面に追加」ヘルプ項目を常設し、タップでバナーと同じ案内をダイアログ表示しなければならない（MUST）。インストール済み（standalone）の場合は案内の代わりに「追加済み」を表示しなければならない（MUST）。この導線には完了トリガー条件・dismiss 抑制を適用してはならない（MUST NOT）。

#### Scenario: 設定画面からいつでも案内ダイアログを開ける
- **WHEN** 設定画面で「ホーム画面に追加」項目をタップする
- **THEN** プラットフォームに応じた案内（iOS: 2ステップ図解 / Android: 追加ボタン）がダイアログで表示される
- **WHEN** インストール済み（standalone）の状態で同じ項目を見る
- **THEN** 「追加済み」である旨が表示される

### Requirement: i18n メッセージキーの完全性
システムはバナー・設定ヘルプで使用する全メッセージを next-intl のメッセージキー経由で解決し、使用する全キーが `src/messages/en.json` と `src/messages/ja.json` の両方に存在しなければならない（MUST）。既存キーの変更・削除・移動は行ってはならない（MUST NOT）。

#### Scenario: 全メッセージキーが en/ja 両方に存在する
- **WHEN** バナー・設定ヘルプで使用する全メッセージキーについて unit テストを実行する
- **THEN** 各キーが `src/messages/en.json` と `src/messages/ja.json` の両方に存在することが検証され PASS する
