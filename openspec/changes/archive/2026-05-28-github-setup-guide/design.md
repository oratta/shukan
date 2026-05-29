## Context

change-B でワークフローを配置しても、GitHub 側の各種設定（Secrets/Vars/Environment/Branch Protection/Merge Queue/ラベル）が未設定だと一切動作しない。これらは GitHub UI から手動設定するか `gh` CLI から自動化できる。本 change はその手順書を作成する。

## Goals / Non-Goals

**Goals:**
- 後日の運用者（=自分）が手順書通りに設定すれば全機能が動く状態を作る
- 「PR 上では `ci` を Required Status Check にしない」の設計理由を明文化（将来「なぜこれ設定してないの？」となるのを防ぐ）
- `gh` CLI コマンドを優先（UI クリック手順より再現性が高い）

**Non-Goals:**
- 実 token / 実 key の記載（取得元のみ。実値は `gh secret set` の対話入力 or `pbpaste` 経由）
- Cloudflare DNS や Vercel 側設定（change-D で別ドキュメント）
- 自動化スクリプト（手順書のみ。ワンクリック実行 wrapper は後日）

## Decisions

### D1: Branch Protection で PR 上の Required Status Check に `ci` を指定しない
- 理由: ラベル `preview` 未付与の PR では `ci` が走らないため、Required にすると pending のまま永久にマージ不可になる
- 代わりに Merge Queue 側の Required Status Check で `ci` を指定し、`merge_group` イベントで走る `ci` の PASS のみがマージ条件になる
- GitHub の Merge Queue 仕様: Required Status Check は `merge_group` で実行されたチェックを参照する

### D2: ラベル作成は workflow merge 前に行う必要がある（順序ガイダンス）
- ラベル不在では「PR にラベル付与」操作自体ができないため、`deploy-preview.yml` が永久に発火しない
- `gh label create preview` を初手のステップとして手順書冒頭に置く

### D3: GitHub Environment "Production" + Required reviewers = oratta
- indie 開発の二段階確認（手動トリガー + 自己承認）
- 将来共同開発者が増えた場合に reviewer 追加で拡張可能

### D4: Vercel env 手動登録（`setup-vercel-env.yml` の代替）
- OAK Casino にはこの workflow があるが、Smitch は plan で除外
- 代わりに `vercel env add` コマンドで Preview / Production それぞれに登録する手順を手順書に明記

## Risks / Trade-offs

- **リスク**: 手順書は手動実行が必要で、人間がスキップすると動かない → 設定漏れチェック用に「動作確認チェックリスト」をセクション末尾に置いて検証可能にする
- **トレードオフ**: `gh secret set` は対話入力モードで使う想定だが、CI 経由で機械的に登録したい場合は別途。今は手動運用想定でシンプル化
