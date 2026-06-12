# Decisions Log — monetization-foundation

意思決定の記録。各判断にはエビデンス（実行コマンドと出力）を含める。

## D1: Stripe スキルは未導入、Context7 で代替（Setup, 2026-06-12）

- **判断**: plan.md セットアップ前提の「Stripe スキルのプロジェクトインストール」は、ローカル・marketplace・OpenSkills のいずれにも該当スキルが存在しないため、Context7 による最新ドキュメント参照で代替する
- **エビデンス**:
  - `ls ~/.claude/skills/ | grep -i stripe` → ヒットなし
  - `ls ~/.claude/plugins/marketplaces/*/plugins/*/skills/ | grep -i stripe` → ヒットなし
  - `npx openskills search stripe` → 出力なし（利用不可）
- **影響**: longrun-builder への指示に「Stripe 実装前に Context7 で `stripe` / `stripe-node` の最新パターンを確認すること」を含める
