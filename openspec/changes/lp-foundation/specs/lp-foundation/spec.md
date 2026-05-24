## ADDED Requirements

### Requirement: DESIGN.md は LP 制作の権威ソースとして存在する

システムは `docs/design/DESIGN.md` を LP 画像生成 → コード化ワークフローの単一の権威ソース (single source of truth) として保持しなければならない (MUST)。
このファイルは color palette / typography 候補 / 8px rhythm / motion budget / hard rules / AI generation Style Block を含むものとする (SHALL)。

#### Scenario: DESIGN.md が必要なセクションを全て含む

- **WHEN** `docs/design/DESIGN.md` を読む
- **THEN** 以下の見出しが全て存在する: `## Color Palette` (HEX を含む) / `## Typography` (候補フォントを含む) / `## Spacing & Rhythm` (8px を含む) / `## Motion Budget` / `## Hard Rules` / `## AI Generation Style Block`

#### Scenario: DESIGN.md の HEX が globals.css とスナップショット同期されている

- **WHEN** `docs/design/DESIGN.md` を読む
- **THEN** `--primary` / `--background` / `--foreground` / `--ring` / `--impact-health` / `--impact-cost` / `--impact-income` に対応する HEX 表記または OKLCh 表記が記載されている

### Requirement: DESIGN.md と globals.css の同期検証スクリプトが提供される

システムは `scripts/check-design-md-sync.sh` を提供し、`docs/design/DESIGN.md` の色定義が `src/app/globals.css` の `:root` ブロックと同期しているかを検証できなければならない (MUST)。

#### Scenario: 同期が取れている場合は exit 0

- **WHEN** `bash scripts/check-design-md-sync.sh` を実行する
- **THEN** 同期が取れていれば exit code は 0 で、`OK` を含むメッセージが標準出力に出る

#### Scenario: 同期が崩れている場合は非ゼロで exit

- **WHEN** `docs/design/DESIGN.md` から特定の `oklch(...)` 値を取り除いた状態で `bash scripts/check-design-md-sync.sh` を実行する
- **THEN** exit code は非ゼロで、欠落している token を含むエラーメッセージが標準出力または標準エラーに出る

### Requirement: brand-references ディレクトリは 16 枚 role-label 仕組みを README で明示する

システムは `docs/design/brand-references/README.md` を提供し、Codex CLI に渡す reference image を palette / mood / composition / typography-layout / anti-reference の 5 ロールに分類するルールを記載しなければならない (MUST)。

#### Scenario: README が 5 つの role を明示している

- **WHEN** `docs/design/brand-references/README.md` を読む
- **THEN** `palette` / `mood` / `composition` / `typography-layout` / `anti-reference` の 5 つの role が記述されている

#### Scenario: smitch-logo の参照メモが含まれる

- **WHEN** `docs/design/brand-references/README.md` を読む
- **THEN** `src/components/ui/smitch-logo.tsx` または `/smitch-logo.svg` への参照メモが含まれる

### Requirement: Codex プロンプトテンプレートが Smitch 値で埋まった状態で配置される

システムは `docs/design/prompts/section-prompt-template.md` を提供し、リサーチドキュメント §5.1 のテンプレ構造 (Scene / Subject / Important Details / Use Case / Reference Images / Project Style Block / Hard Constraints / Output Quality / Post-generation) を Smitch のブランド値 ("science × soul" / quiet, intentional tone / palette HEX) で埋めた状態で持たなければならない (MUST)。

#### Scenario: テンプレートが Smitch 固定値を含む

- **WHEN** `docs/design/prompts/section-prompt-template.md` を読む
- **THEN** "Smitch" / "science × soul" / "Switch your path" / "quiet, intentional" のいずれかの語句と、Project Style Block セクションが含まれる

#### Scenario: NG ビジュアル 12 項目が Hard Constraints に列挙される

- **WHEN** `docs/design/prompts/section-prompt-template.md` の Hard Constraints セクションを読む
- **THEN** plan.md の「NG ビジュアル 12 項目」のうち最低 10 項目が NEVER / NO 形式で列挙されている

### Requirement: codex-image-gen.sh ラッパが必要な引数を受け取る

システムは `scripts/codex-image-gen.sh` を提供し、`--refs <dir>` / `--prompt-file <file>` / `--n <variants>` / `--size <WxH>` の 4 引数を受け取れなければならない (MUST)。
Codex CLI が install されていない環境では実行はスキップし、引数 parsing と help 出力までは正常動作することとする (SHALL)。

#### Scenario: --help でヘルプを表示する

- **WHEN** `bash scripts/codex-image-gen.sh --help` を実行する
- **THEN** exit code は 0 で、`--refs` / `--prompt-file` / `--n` / `--size` の説明を含むヘルプテキストが出力される

#### Scenario: 必須引数欠落時はエラー終了

- **WHEN** `bash scripts/codex-image-gen.sh` を引数なしで実行する
- **THEN** exit code は非ゼロで、`--prompt-file` が必要である旨のエラーメッセージが出る

### Requirement: CLAUDE.md が Smitch コンセプトコアと hard rules を持つ

システムはリポジトリ root に `CLAUDE.md` を持ち、Smitch のコンセプトコア (受動経路 → 能動経路の転換、手段と目的の逆転) および LP image-to-code の hard rules (Tailwind v4 / shadcn 必須 / 8px rhythm / banned tokens) を記載しなければならない (MUST)。

#### Scenario: CLAUDE.md がコンセプトコアを含む

- **WHEN** `CLAUDE.md` を読む
- **THEN** 「受動」「能動」「経路」のいずれかの語句と、「手段」「目的」のいずれかの語句が含まれる

#### Scenario: CLAUDE.md が hard rules を含む

- **WHEN** `CLAUDE.md` を読む
- **THEN** "Hard Rules" 見出し配下で `shadcn` / `Tailwind` / `8px` / `WCAG` / `prefers-reduced-motion` のいずれかが言及されている

### Requirement: waitlist テーブル migration が plan の SQL Draft に準拠する

システムは `supabase/migrations/20260524000000_add_waitlist.sql` を提供し、plan.md データモデルの SQL Draft に準拠した `waitlist` テーブル定義を含まなければならない (MUST)。
テーブルは `email` unique 制約 / `wants_web_pc`, `wants_web_mobile`, `wants_ios_mobile`, `wants_android_mobile` の 4 boolean / `at_least_one_env` check constraint / RLS enabled / anon INSERT policy を持つこととする (SHALL)。

#### Scenario: migration ファイルが必要な要素を全て含む

- **WHEN** `supabase/migrations/20260524000000_add_waitlist.sql` を読む
- **THEN** 以下の要素が全て出現する: `create table waitlist` / `email text not null unique` / `wants_web_pc boolean` / `wants_web_mobile boolean` / `wants_ios_mobile boolean` / `wants_android_mobile boolean` / `constraint at_least_one_env check` / `enable row level security` / `for insert with check (true)`

#### Scenario: willingness_to_pay_jpy の値域 check が存在する

- **WHEN** `supabase/migrations/20260524000000_add_waitlist.sql` を読む
- **THEN** `willingness_to_pay_jpy` カラム定義と `check (willingness_to_pay_jpy in (0, 300, 500, 1000, 2000, 3000))` 相当の制約が存在する
