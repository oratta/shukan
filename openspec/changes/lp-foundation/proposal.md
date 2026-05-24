## Why

LP image-to-code workflow longrun の foundation。後続 7 changes (Hero pilot 〜 統合) が依存する design system / brand references / Codex prompt template / waitlist DB / hard rules を一括整備する。
特に「DESIGN.md を権威ソース」として位置付ける Google Stitch ワークフロー (リサーチ §1-D) を Smitch 用に立ち上げ、Codex CLI が brand reference を参照しながら反復生成しても "AI slop" に収束しないガードレールを敷く。

## What Changes

- **NEW** `docs/design/DESIGN.md` を作成 (既存 `src/app/globals.css` の OKLCh palette をスナップショット転記 + typography 候補 + 8px rhythm + motion budget + AI generation Style Block + hard rules)
- **NEW** `scripts/check-design-md-sync.sh` を作成 (globals.css ↔ DESIGN.md の OKLCh / HEX 差分検出スクリプト、CI hook 候補)
- **NEW** `docs/design/brand-references/README.md` を作成 (16 枚 role-label 仕組みを明示: palette / mood / composition / typography-layout / anti-reference)
- **NEW** `docs/design/prompts/section-prompt-template.md` を作成 (リサーチ §5.1 のテンプレを Smitch 値で埋めた状態で配置)
- **NEW** `scripts/codex-image-gen.sh` を作成 (Codex CLI 薄ラッパ。`--refs <dir>` / `--prompt-file <file>` / `--n <variants>` / `--size <WxH>` を受ける)
- **NEW** `CLAUDE.md` を作成 (Smitch コンセプトコア + LP image-to-code hard rules)
- **NEW** Supabase migration `supabase/migrations/20260524000000_add_waitlist.sql` (waitlist テーブル + 4 boolean env カラム + `at_least_one_env` check + RLS INSERT policy)
- **NEW** vitest テスト追加 (DESIGN.md 構造検証 / migration SQL シンタックス / check-design-md-sync.sh 戻り値 / brand-references/README.md 存在)
- 既存 197 vitest tests は壊さない (regression なし)

## Capabilities

### New Capabilities

- `lp-foundation`: LP 制作の design system / brand reference 規約 / Codex プロンプトテンプレ / waitlist DB スキーマを束ねる基盤 capability

### Modified Capabilities

(なし - lp-foundation は新規 capability。既存 `marketing-host-routing` は middleware ロジックに触れないため変更しない。)

## Impact

- **Affected code**: `docs/design/`, `scripts/`, `supabase/migrations/`, `CLAUDE.md` を新規追加。既存 `src/` には触らない (regression リスクなし)
- **Dependencies**: 追加なし (bash / jq / grep / diff / sqlite で完結。Codex CLI は scripts ラッパのみで実体 install は別途)
- **Database**: Supabase に `waitlist` テーブル 1 つ追加。RLS enabled。anon INSERT のみ許可
- **後続 changes**: change-B 〜 change-H 全てが本 foundation に依存
