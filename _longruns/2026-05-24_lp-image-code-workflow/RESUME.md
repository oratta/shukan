# RESUME — LP image-to-code workflow longrun

> [!warning] このワークツリーは ABANDONED (2026-05-25)
> ユーザー判断により「本ワークツリーではまともな LP は作れない」として整理対象になった。
> 次回 LP 構築試行は **別ワークツリー** で行う。
>
> **次に読むべきドキュメント**: `_longruns/2026-05-24_lp-image-code-workflow/RETROSPECTIVE.md`
> （ボツ理由 / 効いたこと / 効かなかったこと / 再利用資産 / 次回への提言）
>
> 本 RESUME.md は当時の状況スナップショットとして残す（履歴価値あり）。次回は RETROSPECTIVE.md と CLAUDE.md / docs/design / docs/research を起点にする。

---

## 1. 現在の状況（一行）

Build フェーズ Hero pilot で画像生成プロセスを「LP 全体 1 枚絵」から「**セクション別 8 枚個別生成**」に切り替え、ユーザーが Codex App で 8 枚生成中。

---

## 2. ユーザーが今やっていること

ユーザーは **Codex App（OpenAI Codex デスクトップアプリ）** で、以下のファイルを使って 8 セクション分の画像を順次生成中（または Claude Code 側から `codex exec` で生成）:

**訂正 (2026-05-25)**: Codex App だけでなく、ローカル CLI からも生成可能。`bash scripts/codex-image-gen.sh` ラッパー、または `env -u OPENAI_API_KEY codex exec '<prompt>'` で直接呼べる。サブスク枠固定。

- ガイドファイル: `_longruns/2026-05-24_lp-image-code-workflow/codex-app-section-prompts.md`
- Style anchor 画像（**唯一**）: ユーザーが Codex App で作った LP 全体 mockup（前セッションで生成済み、`/Users/oratta/Downloads/LP候補.png` に保存されていた）

各セクションは 1792x1024 (16:9 landscape) で生成、人物写真主体のリッチな editorial 仕上げ。

---

## 3. 次セッションで Claude がやるべきこと

### ユーザーから「8 枚揃った」と連絡が来たら

1. **画像配置**: ユーザーが渡した 8 枚を `public/landing/` 配下に配置（命名: `section-1-hero.png` / `section-2-problem.png` / ... / `section-8-cta.png`）
2. **コンポーネント書き直し**: `src/components/landing/` 配下を新画像ベースで全面書き直し
   - 既存の `Hero.tsx` / `ProblemSolution.tsx` / `WhySmitch.tsx` / `HowItWorks.tsx` / `Evidence.tsx` / `CtaWaitlistForm.tsx` は**試作扱い**、参照価値はあるが書き換え対象
   - waitlist フォーム部分は shadcn primitives で再現（送信ロジックが必要なので画像ではダメ）
3. **組み立て**: `src/app/marketing-preview/page.tsx` で 8 セクション + Footer を縦に積む
4. **ローカル確認**: `npm run dev` → `http://localhost:3001/marketing-preview` で全体動作確認（dev サーバーはポート 3000 が Obsidian 占有のため 3001）
5. **ユーザーゲート**: ブラウザで OK 出たら、本番デプロイのインフラ作業をユーザーに依頼

### ユーザー手動タスク 3 件（change-A 完了時に依頼済み、未実施）

1. Cloudflare DNS で `www.s-mitch.com` の CNAME を `cname.vercel-dns.com` に向ける
2. Vercel project `shukan` に `www.s-mitch.com` ドメイン追加（`vercel domains add www.s-mitch.com shukan`）
3. Vercel env vars に `NEXT_PUBLIC_MARKETING_HOSTS=www.s-mitch.com` を Production + Preview に設定

これらが完了すれば `https://www.s-mitch.com` で本番 LP が見られる。

### Supabase migration 適用

`supabase/migrations/20260524000000_add_waitlist.sql` は change-G の Server Action 実装ゲートで `supabase db push` 予定。今は適用不要。

---

## 4. 主要ファイルパス

### Plan / 進捗管理

| ファイル | 役割 |
|---|---|
| `_longruns/2026-05-24_lp-image-code-workflow/plan.md` | 確定 Plan（Build Contract APPROVED） |
| `_longruns/2026-05-24_lp-image-code-workflow/checkpoint.md` | フェーズ進捗 + ハンドオフ情報 |
| `_longruns/2026-05-24_lp-image-code-workflow/decisions.md` | 全 change の設計判断ログ（D-S-1〜D-S-5, D-A-1〜D-A-6） |
| `_longruns/2026-05-24_lp-image-code-workflow/verification-guide.md` | Scenario 進捗トラッカー（change-A 分は更新済み） |
| `_longruns/2026-05-24_lp-image-code-workflow/codex-app-section-prompts.md` | **ユーザーが Codex App で使用中の 8 セクションプロンプト集** |
| `_longruns/2026-05-24_lp-image-code-workflow/RESUME.md` | 本ファイル |

### LP 関連実装

| ファイル | 状態 |
|---|---|
| `src/middleware.ts` | 既存、host 判定実装あり（D-S-1 確定、改修不要） |
| `src/app/marketing/{page.tsx, layout.tsx, copy.ts}` | 既存プレースホルダ LP（change-H で全面置換予定、現状触らない） |
| `src/app/marketing-preview/page.tsx` | **試作組み立てページ**（8 枚揃ったら新画像で書き直し） |
| `src/components/landing/*.tsx` | **試作コンポーネント 6 個**（書き直し対象、参照価値あり） |
| `src/lib/supabase/{client.ts, server.ts}` | 既存、change-G の Server Action で再利用 |
| `supabase/migrations/20260524000000_add_waitlist.sql` | 作成済み、本番適用は change-G まで保留 |

### 画像素材（試作で生成済み、要差し替え）

| ファイル | 用途 | 評価 |
|---|---|---|
| `public/landing/hero.png` (1920x1080) | 朝の窓辺ジャーナル | 写真として OK だが Smitch LP には**メッセージ性が弱い**（ユーザー却下） |
| `public/landing/problem-solution.png` (1920x1080) | 夜の閉じたジャーナル + ランプ | 同上、却下 |
| `public/landing/evidence.png` (1920x1080) | 本 + メガネ + 木の机 | 同上、却下 |
| `public/landing/hero-codex.png` | hero.png のリネーム前バックアップ | 同上 |
| `public/landing/lp-mockup-full.png` | Codex で生成した LP 全体 mockup | **使わない**（リサーチ §2.4 違反、各セクション潰れる） |

新画像が来たら全部削除して入れ替え推奨。

### Design system / Brief

| ファイル | 役割 |
|---|---|
| `docs/design/DESIGN.md` | LP design system（color HEX / typography / 8px rhythm / hard rules） |
| `docs/design/lp-design-brief.md` | サービスコンセプトのみのブリーフ |
| `docs/design/prompts/section-prompt-template.md` | リサーチ §5.1 ベースの汎用テンプレ |
| `docs/design/brand-references/README.md` | brand-references 構造定義 |
| `CLAUDE.md` | Smitch concept core + Hard rules（コード化向け） |

### ガイド / リサーチ

| ファイル | 役割 |
|---|---|
| `docs/research/lp-image-to-code-workflow-2026.md` | リサーチドキュメント（§2.4 / §3.1 がセクション分割推奨） |

### OpenSpec

| ファイル | 役割 |
|---|---|
| `openspec/changes/lp-foundation/` | change-A、APPROVED、未 archive |
| `openspec/backlog.md` | LP 関連 3 項目は plan に統合済み（削除済み） |

---

## 5. 重要な決定事項（decisions.md 要約）

### Setup フェーズ

- **D-S-1**: change-A の事前調査タスク結果 — middleware 改修不要
- **D-S-2**: change-H で marketing-page.test.tsx を書き換える方針
- **D-S-3**: LP 全体 1 枚絵 → セクション別 8 枚個別生成に切り替え（リサーチ §2.4 / §3.1 準拠）
- **D-S-4**: Style anchor は Codex App で作った LP 全体 mockup 1 枚のみ。既存生成済み hero/problem-solution/evidence は「メッセージ性のない本とコーヒー」として除外
- **D-S-5**: 既存 marketing-preview/page.tsx + landing/*.tsx は試作扱い、8 枚揃った後に新画像で書き直し

### Build フェーズ change-A（lp-foundation、APPROVED）

- **D-A-1**: DESIGN.md は globals.css の OKLCh + HEX 併記
- **D-A-2**: check-design-md-sync.sh は bash + grep + awk のみで実装
- **D-A-3**: codex-image-gen.sh は Codex CLI 未 install でも引数 validation までは exit 0/1 で動く
- **D-A-4**: waitlist migration の SELECT/UPDATE/DELETE policy は明示せず service_role 限定
- **D-A-5**: 既存 root の DESIGN.md は触らず、LP 用は `docs/design/DESIGN.md` に新規作成
- **D-A-6**: CLAUDE.md は新規作成（root に既存なし）

---

## 6. やってはいけないアプローチ（試行錯誤の教訓）

| 試したが却下されたアプローチ | 却下理由 |
|---|---|
| ~~Codex CLI で `codex image` サブコマンドを直接呼ぶ~~ | ~~Codex CLI 0.133.0 には `image` サブコマンドが存在しない~~ **訂正 (2026-05-25)**: 画像生成は `codex exec` で built-in image generation を呼び出せる（`OPENAI_API_KEY` を unset してサブスク枠固定、生成物は `~/.codex/generated_images/<session>/ig_*.png` に出力される）。vlog-album skill で実証済み |
| 画像 1 枚に頼ったセクションコード化（写真 = 「本とコーヒー」） | メッセージ性なし、Smitch のリッチな editorial 訴求と不整合 |
| LP 全体を 1 枚の mockup で生成 → コード化 | 各セクションが潰れる（リサーチ §2.4 / §3.1 が警告した「1 枚絵で LP 全体を一度に出さない」パターン） |
| ヒアリングで完璧主義的に全細目を詰める | スピード低下、ユーザーから「とっとと進めて」 |
| AskUserQuestion を Build フェーズで多用 | Build フェーズは自律実行が原則（plan の方針） |

### 正しいアプローチ（D-S-3 確定）

- 各セクションを 1792x1024 で**個別**生成
- Style anchor は LP mockup 1 枚のみ
- 写真素材は**人物中心**でリッチに（無人静物に逃げない）
- 8 枚揃ってから一気にコード化

---

## 7. 残タスク全体像

### Build フェーズ残

| change | 状態 | 内容 |
|---|---|---|
| **change-A** lp-foundation | ✅ 完了（APPROVED） | DESIGN.md / brand-references / CLAUDE.md / migration / scripts |
| **change-B** Hero pilot → **8 セクション同時実装に拡張** | 🟡 画像生成中（ユーザー Codex App 作業） | 8 セクション画像揃い次第コード化 |
| change-C〜G | ⏸ change-B に統合済み | （change-B の拡張で吸収） |
| **change-H** integration | ⏳ 未着手 | GA4 注入 / page.tsx 全面構築 / copy.ts 置換 / a11y |

**重要**: 8 枚個別生成方式に切り替えたことで、plan の「change-B〜G 各セクション 1 change」構造は実質的に**「change-B 拡張版 1 つで全セクション実装、change-H で統合」**に変わっている。Plan を厳密に守るなら openspec change を分けるが、スピード優先なら 1 つにまとめても OK。次セッションでユーザーと確認推奨。

### Verify / Feedback / Archive フェーズ

すべて未着手。Build 完了後に進む。

### ユーザー手動タスク（インフラ）

- Cloudflare DNS
- Vercel domain
- Vercel env vars

詳細は §3 参照。

---

## 8. dev server 状況

- ポート 3000 は Obsidian が占有（他プロジェクト、kill 禁止）
- 本プロジェクトは **3001** で起動: `PORT=3001 npm run dev`
- URL: `http://localhost:3001/marketing-preview`

---

## 9. 次セッションでまず実行するコマンド

```bash
# 状況確認
cat _longruns/2026-05-24_lp-image-code-workflow/RESUME.md
cat _longruns/2026-05-24_lp-image-code-workflow/checkpoint.md
git log --oneline -10

# Task 確認
# TaskList でフェーズ進捗を見る

# ユーザーに「8 枚揃った？ どこにありますか？」と確認
```

---

## 10. 出典

- 本ファイルは 2026-05-25 のセッション末で書かれた引き継ぎノート
- 経緯は前セッションの会話履歴を参照
- 関連: `LLM/2026-05-25-smitch-lp-image-direction.md`（ユーザー側の Codex App セッションログ）
