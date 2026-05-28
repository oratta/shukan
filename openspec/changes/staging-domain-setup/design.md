## Context

change-B のワークフローは `STAGING_DOMAIN`（Vars）が設定されていれば `vercel alias` を実行する。しかし alias 対象のドメインが Vercel project に追加されていなければ alias は失敗し、Cloudflare DNS が Vercel に向いていなければそもそも到達できない。さらに Vercel の Git Integration が有効なままだと GitHub Actions のデプロイと Vercel 自動デプロイが衝突する。

## Goals / Non-Goals

**Goals:**
- staging.s-mitch.com を Vercel にエイリアスする全手順を 1 ドキュメントに集約
- Vercel Git Integration を**安全な順序で**切断する手順を明記（順序ミスでダウンタイム発生を防ぐ）
- 全体動作確認のための e2e フローを明示

**Non-Goals:**
- Cloudflare の API キー操作（UI 手順のみ。理由: Cloudflare API トークン管理が別 run）
- Pro 化判断（Supabase / Vercel ともに料金プランは別途）
- 既存 prod デプロイの切替検証（indie プロダクトでダウンタイム許容）

## Decisions

### D1: 切断順序を明示
- 切断順序: (1) workflow merge → (2) main マージで deploy-staging.yml が走り staging.s-mitch.com で動くことを確認 → (3) Vercel Dashboard で Git Integration 切断
- 順序を逆にすると、切断後 GitHub Actions が動作する前の窓で「Vercel 側はデプロイしない / GitHub Actions も動かない」期間が発生し、サービス停止する

### D2: A レコード方式（CNAME ではなく）
- Vercel ドキュメント推奨: A レコード `76.76.21.21` で apex/サブとも統一できる
- Smitch の既存 apex `s-mitch.com` も A レコード方式（MEMORY.md より）。同じ方式で揃える

### D3: `vercel domains add` の運用
- Vercel CLI で `vercel domains add staging.s-mitch.com <project>` で追加
- UI でも可だが、CLI の方が手順書化しやすい

### D4: 動作確認 e2e フロー 5 ステップは change-B/C の依存と整合
- ラベル作成（change-C 依存）→ Secrets 登録（change-C 依存）→ Preview deploy（change-B 依存）→ Staging deploy（change-B 依存）→ Prod deploy（change-B + GitHub Environment）

## Risks / Trade-offs

- **リスク**: 切断順序を誤ったときの復旧手順がない → 手順書末尾に「もし切断後 staging が動かない場合は Vercel Dashboard で Git Integration を再接続して暫定復旧する」を追記
- **トレードオフ**: Cloudflare 操作を UI のみにしたため自動化できない → indie 開発の初期構築は手動で十分、自動化は API トークン管理が必要になる別 run で
