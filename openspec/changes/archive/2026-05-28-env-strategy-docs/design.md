## Context

OAK Casino リポジトリには 110 行の `docs/environment-strategy.md` が存在し、4 環境の責務・接続先・LIFF 設定・Git ブランチ戦略・GitHub Actions 構成・費用見積もりが集約されている。Smitch でも同形のドキュメントが必要だが、Smitch は LINE を使わず、Draft PR + Merge Queue というカスタムワークフローを採用するため、単純流用ではなく再構成が必要。

## Goals / Non-Goals

**Goals:**
- 運用者（=自分）が後から「なぜこの構成か」を追える集約ドキュメントを作る
- change-B の workflow 実装、change-C/D の手順書がこのドキュメントを起点に整合する
- Staging が prod DB を参照する点のリスクを明示的に記述する

**Non-Goals:**
- 実 secret 値・ token・key の記載（取得元のみ記述）
- OAK Casino docs の完全な逐次翻訳（Smitch 文脈で再構成）
- 費用見積もりの詳細（Smitch の既存 Supabase は Free tier だが将来の Pro 化判断はユーザー側）

## Decisions

### D1: OAK Casino docs の構造を踏襲しつつ Smitch 用に再構成
- セクション順序: アーキテクチャ図 → 画面別アクセス → 各サービスの環境構成 → 環境変数 → Git ブランチ戦略 → 開発ワークフロー → GitHub Actions 構成 → **禁則事項（新規）** → **vercel.json 設計理由（新規）**
- アーキテクチャ図は ASCII で OAK Casino と同形

### D2: LIFF/LINE 関連はゼロ削除、Google OAuth 認証セクションを追加
- Smitch の認証は Supabase Auth + Google OAuth + メール認証検討中（MEMORY.md より）
- 「画面別アクセス」表で `/login` / `(app)/*` 構成を記述

### D3: 費用見積もりは「現状 Free」のみ記述、Pro 化判断は別途
- OAK Casino docs は $0 / $25 の段階的見積もりがあったが Smitch では Pro 化判断未確定のため脚注扱い

### D4: 「開発ワークフロー」セクションは Draft PR + Merge Queue + `preview` ラベル発火 + workflow_dispatch の 5 段階で記述
- plan.md の change-D verify 手順 5 段階と完全に対応させる

## Risks / Trade-offs

- **リスク**: docs が長くなりすぎて読まれない可能性 → OAK Casino docs は 230 行で破綻していないため、同程度を上限とする
- **トレードオフ**: change-B の実装結果を待たずに `vercel.json` 設計理由を書くため、もし plan.md と異なる最終形になった場合 docs と齟齬が出る → Build Contract Round 2 で「vercel.json 最終形は確定」と config.yaml rules に明記済みのため、齟齬リスクは低い
