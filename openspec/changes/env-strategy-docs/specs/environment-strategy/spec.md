## ADDED Requirements

### Requirement: 環境戦略ドキュメントの存在

`docs/infrastructure/environment-strategy.md` SHALL 存在し、4 環境（dev / preview / staging / prod）の URL・Supabase 接続先・デプロイ方法を表形式で記述している MUST。

#### Scenario: 4 環境の URL と Supabase 接続先の対応表が記載されている
- **WHEN** 運用者が `docs/infrastructure/environment-strategy.md` を開く
- **THEN** dev (localhost:3000 + dev Supabase `xhqddzdpcpvxpprxykct`) / preview (動的 Vercel URL + dev Supabase) / staging (staging.s-mitch.com + prod Supabase `erminkotxfnxlkxktejv`) / production (s-mitch.com + prod Supabase) の対応表が確認できる

#### Scenario: LIFF/LINE 記述が含まれていない
- **WHEN** 運用者が `grep -i liff docs/infrastructure/environment-strategy.md` および `grep -i "line developers" docs/infrastructure/environment-strategy.md` を実行する
- **THEN** どちらも 0 件で返ること（Smitch は LINE を使用しないため、OAK Casino から流用しない）

### Requirement: Staging 禁則事項セクションの存在

Staging 環境は prod Supabase を参照するため、動作確認時の禁則事項を運用者が読める形で MUST 明記する。

#### Scenario: 禁則事項セクションが (a)(b)(c) の 3 観点を含む
- **WHEN** 運用者が `docs/infrastructure/environment-strategy.md` の「Staging 動作確認時の禁則事項」セクションを読む
- **THEN** (a) staging での書き込みは prod DB に直接反映される / (b) RLS により他ユーザーのデータは見えないが書き込みは本物 / (c) QA 用途では prod に専用 QA アカウントを作成して使う、の 3 点が明記されている

### Requirement: vercel.json 設計理由セクションの存在

`vercel.json` の `github.enabled: false` 設定の意図を、change-B の実装結果を見なくても運用者が理解できるよう設計理由を MUST 明記する。

#### Scenario: vercel.json 設計理由が記載されている
- **WHEN** 運用者が `docs/infrastructure/environment-strategy.md` を読み「`vercel.json`」「`enabled: false`」「`autoAlias`」のキーワードで検索する
- **THEN** 「GitHub Actions + Vercel CLI でデプロイするため Git 連携自体を無効化。`autoAlias` は Git 連携前提のオプションのため削除した」旨の説明が見つかる

### Requirement: 開発ワークフローセクションの新運用反映

開発ワークフローセクションは、Draft PR + Merge Queue + ラベル `preview` 発火の運用を MUST 反映する。

#### Scenario: 新ワークフロー手順が記載されている
- **WHEN** 運用者が「開発ワークフロー」セクションを読む
- **THEN** (1) feature branch で Draft PR 起票 / (2) ラベル `preview` 付与で CI + Preview deploy 発火 / (3) Ready 化後 Merge Queue で最終 CI / (4) main マージで staging 自動 / (5) `gh workflow run deploy-production.yml` + approval で prod の 5 段階が記述されている
