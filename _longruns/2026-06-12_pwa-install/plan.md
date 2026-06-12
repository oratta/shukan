# Plan: PWA インストール可能化（ホーム画面追加 + インストール導線）

## 生成情報
- 作成日: 2026-06-12
- Brain Dump元: セッション内（/longrun:plan 引数 + 対話 + 並列リサーチ2本）
- 質問回数: 5問
- レビュー: longrun-reviewer Round 1 REQUEST_CHANGES → 指摘反映済み（v2）

## ゴール
Smitch を PWA としてホーム画面に追加できるようにし、スマホユーザーにアプリライクな standalone 体験と、状況に応じたインストール導線（iOS 図解バナー / Android ネイティブプロンプト）を提供する。Web Push 通知は今回スコープ外（ユーザー獲得後の別 run。調査結果は本ファイル付録に保存済み）。

## ビジネスコンテキスト
- 対象ユーザー: スマホで Smitch を使う習慣形成ユーザー（日本市場、iPhone シェア6割超）
- 提供価値: ホーム画面からの再訪導線（PWA インストールでリテンション大幅向上の事例多数: Rakuten 24 +450% 等）。将来の Web Push（iOS はホーム画面追加が前提条件）への布石
- 成功指標: Chrome DevTools の installability チェック通過 / インストール導線の表示ロジックが unit テストで検証可能

## 技術要件
- スタック: Next.js 16.1.6 (App Router / Turbopack), React 19, TypeScript 5, Tailwind CSS 4, shadcn UI, next-intl (en/ja), Supabase auth
- 参照パターン: 既存 `public/manifest.json`（移行元）、`src/app/layout.tsx` の metadata、`(app)` route group の UI 規約、`src/hooks/useHabits.ts`（`setDayStatus` / `markQuitDailyDone` — 完了操作の2経路）、`src/lib/habits.ts`（純関数レイヤーの規約）、`src/__tests__/` の既存テスト方式
- 制約:
  - **Service Worker は導入しない**（オフラインキャッシュ事故リスク回避。Chrome の installability は manifest + HTTPS で満たせる）
  - **next-pwa / Serwist 等のライブラリを追加しない**（next-pwa は無メンテで非推奨、Serwist は Turbopack 非互換。Next.js 公式 PWA ガイド準拠の素の構成）
  - **依存パッケージを追加しない**（`package.json` は monetization worktree も変更中のため競合回避。happy-dom / @testing-library/react も追加しない）
  - `src/messages/{en,ja}.json` への追記は新規キーの追加のみ（monetization worktree が同ファイルを触るため、既存キーの変更・移動は禁止）
  - `src/middleware.ts` は変更しない
- テストフレームワーク: Vitest（`environment: 'node'`。DOM 環境は導入しないため、**テストは純関数レイヤー + 設定値アサート中心**に設計する）
- テスト実行コマンド: `npm run test:run`
- テスト戦略（レビュー指摘1・2 反映）:
  - インストール導線のロジックは `src/lib/pwa/` に**純関数として分離**し、node 環境の unit テストで担保する。React コンポーネントは純関数を呼ぶだけの薄い表示層とする
  - 新規 Playwright E2E は書かない（`playwright.config.ts`・認証済み storageState の基盤が存在せず、Google OAuth の自動化は保守的方針に反する投資のため）。ブラウザでの表示確認は「動作確認方法」の手動手順で担保する
- **実装 Agent の指定: 実装フェーズ（longrun-builder）は `model: opus`（Opus 4.8）で起動すること**（検証・レビュー Agent はデフォルトモデルのまま）

## スコープ
### 含むもの
- `public/manifest.json` から `src/app/manifest.ts`（MetadataRoute.Manifest）への移行と強化（`id`, `lang`, `dir`, `categories` 追加、`src/app/layout.tsx` の `manifest` 参照を `/manifest.webmanifest` に更新、`public/manifest.json` 削除）
- 表示ロジックの純関数レイヤー `src/lib/pwa/`:
  - `detectPlatform(ua, isStandalone): 'ios-safari' | 'android-chrome' | 'standalone' | 'other'`
  - `shouldShowInstallBanner({ platform, dismissedAt, now, justCompleted }): boolean`
  - dismiss 記録の読み書きロジック（localStorage キー名・30日判定）
- インストール導線コンポーネント（薄い表示層）: iOS Safari は共有→「ホーム画面に追加」の2ステップ図解バナー / Android Chrome は `beforeinstallprompt` 捕捉 → 「ホーム画面に追加」ボタン → `prompt()` 発火 / その他環境は非表示
- 表示トリガー（レビュー指摘3 反映）: ホーム画面 `(app)/page.tsx` で習慣の状態が **`'completed'` へ遷移した瞬間**（`onDayStatusChange` 系の呼び出しで `none/skipped/failed` → `completed` になった時のみ）に一度だけ表示フラグを立てる。**ページ再訪・リロード時に `completedCount > 0` というだけでは表示しない**
- 設定画面に「ホーム画面に追加」ヘルプ項目（常設の再到達導線。タップで同じ案内をダイアログ表示、インストール済みなら「追加済み」表示）
- バナー・ヘルプの i18n（en/ja、新規キー追加のみ）

### 含まないもの
- Service Worker / オフライン対応（理由: SW キャッシュ事故が PWA 最頻出の落とし穴であり、インストール可能化には不要）
- Web Push 通知・購読 DB・送信パイプライン（理由: ユーザー獲得前で投資効果が先になる。付録の調査結果を基に別 run で実施）
- ネイティブアプリ化（理由: PWA で検証後にデータで判断）
- DB スキーマ変更・Supabase マイグレーション（理由: 不要。localStorage のみで完結）
- manifest への screenshots 追加・maskable アイコンのアセット制作（理由: 専用アセット制作が必要。将来改善）
- Playwright 基盤の新設（config / 認証 storageState）（理由: 今回の投資対効果が低い。手動確認で代替）
- DOM テスト環境（happy-dom / @testing-library/react）の導入（理由: 依存追加禁止の制約。純関数分離で代替）

## Changes分解

### change-A: pwa-manifest
- **スコープ**: `src/app/manifest.ts` 新設（既存 `public/manifest.json` の内容を移行・強化）、`public/manifest.json` 削除、`src/app/layout.tsx` の `manifest: "/manifest.json"` 参照を `/manifest.webmanifest` に更新。manifest 内容（name / short_name / icons 192・512 / start_url / display: standalone）の unit テスト
- **使用スキル**: なし（標準実装）
- **依存関係**: 独立
- **config.yaml rules**:
  - "Service Worker を追加しない。manifest と metadata の変更のみに留める"
  - "既存のテーマカラー（#2B4162 / #F8F9FA）とブランド文言を変更しない"
  - "既存アイコンが maskable セーフゾーンを満たすか不明なため、icons の purpose は変更せず 'any'（未指定）のまま据え置く。maskable アセット制作は今回 run に含めない"

### change-B: install-prompt-ui
- **スコープ**: 純関数レイヤー `src/lib/pwa/`（detectPlatform / shouldShowInstallBanner / dismiss 管理）+ その unit テスト、インストール導線コンポーネント（`src/components/pwa/` 配下の薄い表示層）、`(app)/page.tsx` への完了遷移トリガー組み込み、設定画面ヘルプ項目、en/ja メッセージ追加 + メッセージキー存在テスト
- **使用スキル**: frontend-design（バナー UI）
- **依存関係**: change-A（manifest が正しく配信されていることが前提）
- **config.yaml rules**:
  - "依存パッケージを追加しない（UA 判定・display-mode 判定は自前の小ユーティリティで実装。DOM テストライブラリも追加しない）"
  - "ロジックは src/lib/pwa/ の純関数に置き、React コンポーネントには分岐ロジックを書かない（テスト可能性の担保）"
  - "表示トリガーは『この操作で completed に遷移した直後』のみ。リロード後や completedCount>0 だけでは表示しない"
  - "src/messages/{en,ja}.json は新規キー追加のみ。既存キーの変更・削除・移動は禁止"
  - "バナーは非モーダル。ユーザー操作をブロックしない"

## 画面・UI設計
- **インストール導線バナー**: `(app)` 配下の画面下部（BottomNav の上）に非モーダルのカード型バナー。shadcn のカード規約に準拠
  - iOS Safari: 「① 共有ボタンをタップ → ②『ホーム画面に追加』を選択」の2ステップを lucide アイコン + テキストで図解
  - Android Chrome（`beforeinstallprompt` 発火時）: 「ホーム画面に追加」ボタン1つ。タップでネイティブのインストールプロンプトを発火
  - その他環境（デスクトップ等）: 表示しない
  - 右上に「×」（dismiss）
- **表示条件**: 未インストール（`display-mode: browser`）AND この操作で習慣が completed に遷移した直後 AND（dismiss 記録なし OR dismiss から30日経過）
- **設定画面**: 「ホーム画面に追加」項目を追加。タップで同じ案内をダイアログ表示（常設・完了トリガー条件なし。インストール済みなら「追加済み」表示）

## データモデル
- DB 変更なし
- localStorage: `pwa-install-dismissed-at`（ISO 8601 文字列）のみ
- `beforeinstallprompt` イベントは React state（または ref）に保持。永続化しない

## 受け入れ条件

**必須条件（常に含める）:**
1. [ ] 全changeのOpenSpec仕様が作成・レビュー済み
2. [ ] 全changeのテストが作成され全てPASSしている
3. [ ] ビルドエラーなし（型チェック + ビルド）
4. [ ] 統合テストがPASS（worktreeマージ後の `npm run test:run` + `next build`）

**機能固有の条件（全て Vitest node 環境の unit テスト）:**
5. [ ] `src/app/manifest.ts` の返り値が `name` / `short_name` / 192px・512px アイコン / `start_url` / `display: "standalone"` を含む
6. [ ] `detectPlatform()` が iOS Safari の UA を `'ios-safari'`、Android Chrome の UA を `'android-chrome'`、standalone 表示を `'standalone'`、それ以外（デスクトップ等）を `'other'` に判定する
7. [ ] `shouldShowInstallBanner()` が `justCompleted: true` かつ platform が `'ios-safari'` / `'android-chrome'` かつ dismiss 記録なしのとき `true` を返す
8. [ ] `shouldShowInstallBanner()` が `platform: 'standalone'` または `'other'` のとき常に `false` を返す
9. [ ] `shouldShowInstallBanner()` が dismiss から30日以内なら `false`、30日超なら `true` を返す（境界値テスト含む）
10. [ ] `shouldShowInstallBanner()` が `justCompleted: false`（リロード・再訪）のとき `false` を返す
11. [ ] バナー・設定ヘルプで使用する全メッセージキーが `src/messages/en.json` と `src/messages/ja.json` の両方に存在する
12. [ ] `src/app/layout.tsx` が `/manifest.json` を参照していない（`/manifest.webmanifest` へ更新済み）こと、および `public/manifest.json` が存在しないこと

## 意思決定ガイドライン
- 優先順位: シンプルさ > 拡張性 > パフォーマンス。**実装中に SW・ライブラリ・DOM テスト環境を入れたくなっても入れない**
- リスク許容度: 保守的
- 不明点の扱い: シンプルな方を選ぶ。UI の細部は shadcn / 既存 `(app)` 画面の規約に従う
- 実装 Agent: longrun-builder は `model: opus`（Opus 4.8）で起動

## 動作確認方法
- 開発サーバー: `npm run dev` → http://localhost:3000（ポート使用中の場合は 3001 等。他プロジェクトのプロセスは kill しない）
- テスト: `npm run test:run`（Vitest）
- 確認手順（unit テストで担保できないブラウザ挙動はここで手動確認する）:
  1. ログイン → 習慣を1つ完了 → バナーが表示されること（リロード直後には表示されないこと）
  2. Chrome DevTools → Application → Manifest で `/manifest.webmanifest` が読め、installability エラーがないこと
  3. バナーを「×」で閉じる → 別の習慣を完了 → 再表示されないこと（30日抑制）
  4. DevTools デバイスモードで iPhone Safari UA に切替 → 図解バナーが表示されること
  5. デスクトップ Chrome で `beforeinstallprompt` 発火時に「ホーム画面に追加」ボタンが出て、タップでネイティブプロンプトが開くこと
  6. 設定画面 → 「ホーム画面に追加」→ 案内ダイアログが開くこと

## ワークツリー競合検証結果（2026-06-12 時点）
- `src/app/layout.tsx` / `public/manifest.json` / `src/app/(app)/settings/page.tsx` / `src/app/(app)/page.tsx`: 他のアクティブブランチ（lp-image-code-workflow / monetization-strategy-pla / onboarding-data-setup）は未接触 → 競合なし
- `src/messages/{en,ja}.json`: monetization-strategy-pla が変更中 → **新規キー追加のみ**で競合最小化（制約に反映済み）
- `package.json`: monetization-strategy-pla が変更中 → **依存追加なし**で競合ゼロ化（制約に反映済み）

## 付録: 調査結果サマリ（Web Push を見送った根拠 / 将来 run 用）

### 通知のリテンション効果（2026-06-12 調査）
- 査読付き RCT: 通知は当日のアプリ起動確率を3.5倍にする（JMIR mHealth 2023）。リテンション相関 2〜3倍（Airship / Localytics、因果は未確定）
- 副作用: 週1通でも10%が通知OFF、週6通超で46%がOFF・32%がアンインストール。条件付き送信（未完了者のみ）は一斉送信より残存率2倍以上
- 成功している個人開発習慣アプリ（Loop / HabitKit）の標準は「習慣ごとの固定時刻リマインダー + 通知から直接完了」。スマート通知（未完了時のみ）は Habitify / Atoms が実装

### iOS Web Push の現実（2026-06-12 調査）
- iOS はホーム画面追加した PWA のみ Web Push 可能（iOS 16.4+、2026年現在も制約継続）。日本の iPhone シェア6割超 → 到達は現実的に訪問者の数%
- iOS 18.4+ は Declarative Web Push 対応（SW の push ハンドラ不要、信頼性向上）
- iOS は push 購読が1〜2週間でサイレント失効し、Safari の push server は失効済み購読にも 410 を返さないことがある → アプリ起動時の購読再検証が必須

### 将来 run での推奨アーキテクチャ（合意済み設計）
- 自前運用: `web-push`（VAPID 自前鍵）。OneSignal は VAPID 鍵ロックインがあり見送り
- 送信基盤: **Vercel Cron（15分間隔、有料プランで可）→ `/api/notifications/dispatch`（CRON_SECRET 保護）**。Supabase Edge Function（Deno）は web-push 互換性と Vitest テスト容易性の点で不利のため不採用
- 通知設計: 1日1回・ユーザー設定時刻・**未完了者のみ送信**・ストリーク防衛文言（例:「あと3時間で7日連続が途切れます」）。習慣ごと時刻はデータが取れてから拡張
- DB: `push_subscriptions`（RLS、user_id 紐付け）+ 通知設定（時刻・ON/OFF）。410/404 で購読即削除、`pushsubscriptionchange` ハンドラ、起動時再検証
- 送信ロジック（未完了者抽出・文言生成）はチャネル非依存に作る → 将来ネイティブ化時は FCM/APNs に差し替えるだけで資産が残る

## Brain Dumpからの原文メモ
> アプリの体験を高めるためにPWA化し、通知が来たりホーム画面に追加できたりする機能を実装したいと考えています。現在の他のワークツリーと作業が競合しない形で、どう進められるかまず検証しましょう。大丈夫そうであれば、プランを作成し実装に移りましょう。

> 1回だったらサーバーの必要ないんじゃない？その状況に応じてプッシュ通知を送るとかがサーバーの価値なんじゃないかな。

> そもそも通知もいるのかとか、それも含めて検証・検討してほしい。どこまでどの機能を入れて、それをどういうUXにするのか、想像したり考えるっていうよりは、調査をもとにどうすべきかっていう判断をしてほしい。うまくいってるアプリ（俺みたいな個人開発規模であることを前提として）の運用の工数と、UXの良さによってユーザーに与えるリテンションの向上とか、その辺のバランスの良さを鑑みておすすめを作って。

> だとしたらPWA化はせずにウェブでスマホの人が使ってもらって安定してからネイティブ化の方がいいのかな → （検討の結果）インストール可能化のみ今回実施、Web Push はユーザー獲得後の別 run に分離

> 切り替え可能であれば実装はopus4.8でやってね。
