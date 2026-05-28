## 1. github-setup.md 本体作成

- [ ] 1.1 `docs/infrastructure/github-setup.md` を新規作成
- [ ] 1.2 ドキュメント冒頭に概要（4 workflow を動かすための GitHub 側設定一覧）を記述
- [ ] 1.3 設定順序の推奨フロー（ラベル作成 → Secrets → Vars → Environment → Branch Protection + Merge Queue → Vercel env 登録）を記述

## 2. ラベル作成セクション（最優先）

- [ ] 2.1 「PR ラベル `preview` の作成」セクションを冒頭付近に配置
- [ ] 2.2 コマンド: `gh label create preview --color ededed --description "Trigger preview deploy and CI"` を記載
- [ ] 2.3 「**重要: workflow merge 前に必ず作成すること**」を太字警告として明示

## 3. Secrets / Vars セクション

- [ ] 3.1 Secrets 9 件を表形式で記述（キー名 / 取得元 / 用途）:
  - VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID (Vercel Dashboard > Settings > Tokens / Project Settings)
  - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase dev project xhqddzdpcpvxpprxykct)
  - SUPABASE_SERVICE_ROLE_KEY (Supabase dev project)
  - PROD_SUPABASE_URL, PROD_SUPABASE_ANON_KEY, PROD_SUPABASE_SERVICE_ROLE_KEY (Supabase prod project erminkotxfnxlkxktejv)
- [ ] 3.2 Vars 2 件を記述: STAGING_DOMAIN=staging.s-mitch.com, PRODUCTION_DOMAIN=s-mitch.com
- [ ] 3.3 一括登録の `gh` コマンド例を記述（対話入力モード）

## 4. GitHub Environment "Production" セクション

- [ ] 4.1 Environment 作成手順（UI: Settings > Environments > New environment）を記述
- [ ] 4.2 Required reviewers = oratta の設定手順を記述
- [ ] 4.3 `gh api` 経由のコマンド例も併記（オプション）

## 5. Branch Protection + Merge Queue セクション（非標準設計理由含む）

- [ ] 5.1 main ブランチへの Branch Protection Rule の設定手順を記述
- [ ] 5.2 **「PR 上では `ci` を Required Status Check に指定しない」設計理由を明記**（ラベル未付与で pending 化する問題）
- [ ] 5.3 Merge Queue を有効化する手順を記述（Settings > Branches > Branch protection rule > Require merge queue）
- [ ] 5.4 Merge Queue 側の Required Status Check に `ci` を指定する手順を記述
- [ ] 5.5 GitHub の Merge Queue 仕様（`merge_group` イベントで走る check が Required の対象）を脚注で記述
- [ ] 5.6 `gh api` でも設定できるコマンド例を併記

## 6. Vercel env 手動登録セクション（setup-vercel-env.yml の代替）

- [ ] 6.1 Vercel CLI の `vercel env add` 使い方を簡潔に記述
- [ ] 6.2 Preview スコープへ NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY を登録する手順
- [ ] 6.3 Production スコープへ NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY を登録する手順

## 7. 動作確認チェックリスト

- [ ] 7.1 末尾に「設定完了確認チェックリスト」セクションを追加
- [ ] 7.2 各項目: ラベル存在 / Secrets 9 件登録 / Vars 2 件登録 / Environment 存在 / Branch Protection 有効 / Merge Queue 有効 / Vercel env 登録 / 動作確認用テスト PR 起票

## 8. assertion 検証

- [ ] 8.1 `test -f docs/infrastructure/github-setup.md` が成功
- [ ] 8.2 `grep -c "gh secret set\\|gh secret list" docs/infrastructure/github-setup.md` が 1 以上
- [ ] 8.3 `grep -c "Merge Queue\\|merge_group" docs/infrastructure/github-setup.md` が 1 以上
- [ ] 8.4 `grep -c "Required Status Check" docs/infrastructure/github-setup.md` が 1 以上
- [ ] 8.5 `grep -c "gh label create preview" docs/infrastructure/github-setup.md` が 1 以上
- [ ] 8.6 `grep -c "vercel env add" docs/infrastructure/github-setup.md` が 1 以上
- [ ] 8.7 `grep -c "Production" docs/infrastructure/github-setup.md` が 1 以上（Environment 名）

## 9. コミット

- [ ] 9.1 `git add docs/infrastructure/github-setup.md openspec/changes/github-setup-guide/`
- [ ] 9.2 commit message: `docs: add github-setup guide (Merge Queue + Branch Protection + Secrets)`
