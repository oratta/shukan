# LP image-to-code workflow — Retrospective

**Worktree**: `lp-image-code-workflow`
**Period**: 2026-05-24 〜 2026-05-25
**結論**: 本ワークツリーでは **まともな LP は作れない** とユーザー判断 → 整理 → 次回別ワークツリーで再着手予定

このドキュメントは次の LP 構築試行のための引き継ぎノート。やったこと / 効いたこと / 効かなかったこと / 再利用できる資産 / 次回への提言を 1 ページにまとめる。

---

## 1. このワークツリーで判断した「ボツ」の理由

1. **AI 画像生成のテキストが信用できない**
   - Codex CLI / Codex App どちらも、生成された LP セクション画像の中の **iPhone モック内 UI テキスト** は AI が「それっぽく」捏造する
   - "Smitch からの提案" や "比較して選ぶ" 等の見出しは画像内テキストとして残り、コードでも参照しているが、本来は実 UI 仕様に合わせて差し替えるべきもの
   - 結果として「画像内テキスト」と「JSX で書くべきテキスト」が二重管理状態になる
2. **画像から切り出した subasset は妥協産物**
   - 1 枚絵としては OK だが、iPhone モックの周囲には隣のフォン / 引用文 / 見出し / 矢印などが映り込み、クリーンに切り出せない（重なり構図がソースの段階で発生する）
   - 切り出した結果も「ピクセルアートに人物が貼られた」程度の品質で、LP に載せる素材としては editorial 信頼感が出ない
3. **タイポグラフィの再現が困難**
   - Codex は editorial serif っぽいフォントで日本語見出しを描くが、Lora / Public Sans のような特定フォントには似ない
   - LP の Hard rules（Lora 見出し + Public Sans 本文 + 8px rhythm）を厳守するには、テキスト部分はすべて JSX で書き直す必要がある（本ワークツリーでも実施したが、画像内の見出しと JSX の見出しが二重に並ぶ違和感が残る）
4. **「写真主役の editorial LP」と「Web LP の情報密度」は両立しない**
   - 画像生成では editorial documentary の人物写真が主役だが、それを Web LP のセクションとして 1792x1024 で切ると、テキスト / iPhone / 写真の比率が常に「写真寄り」になり、可読性が落ちる
   - 結局 LP の最終形は HTML/CSS で組まれた構造勝負で、AI 画像は「人物写真の素材供給源」にとどまる
5. **change-B〜G のスコープが膨らみすぎた**
   - 当初 plan では 6〜8 個の change に分割していたが、画像生成方式を切り替えた瞬間に "8 セクション一気実装" となり、change 分割の意味が失われた
   - 1 change = 1 セクションのリズムが崩れ、Build Contract / Verify サイクルが回らなくなった

---

## 2. やったこと（要約）

| フェーズ | やったこと | コミット |
|---|---|---|
| Setup | OpenSpec init + change-A `lp-foundation` 設計 / 設計判断 D-S-1〜D-S-5 記録 | `5d2b19f` / `384caab` |
| Build change-A | DESIGN.md / brand-references / CLAUDE.md / waitlist migration / codex-image-gen.sh / check-design-md-sync.sh / 6 commits / 230 tests PASS | `ff3d2d5` 周辺 |
| 試作 LP | プロトタイプ 6 コンポーネント (Hero/ProblemSolution/WhySmitch/HowItWorks/Evidence/CtaWaitlistForm) + 3 静物写真。ユーザー却下 | `51f1a06` |
| Codex App 移行 | LP 全体 1 枚絵 → セクション別 8 枚に切替 (D-S-3)。Codex App プロンプト集を整備 | `11d6115` |
| 引き継ぎノート | RESUME.md / checkpoint.md / decisions.md 整理 | `bf76cc3` |
| **本セッション** | Codex CLI で残り Section 4-8 生成 + 8 セクション全部画像貼りで実装 (一旦) | `2054327` / `5970f49` |
| **本セッション (再ビルド)** | 画像貼りはベスプラ違反と判断 → 要素分解して HTML/CSS で 7 セクション再実装 + 22 subasset クロップ | `96fba97` |

---

## 3. 効いたこと

- **Codex CLI の built-in `image_gen`** は問題なく動く（旧 RESUME.md の「`image` サブコマンドは未提供」は誤情報、訂正済み）
  - 呼び出し: `env -u OPENAI_API_KEY codex exec --skip-git-repo-check --sandbox workspace-write '<prompt>'`
  - サブスク枠固定、生成物は `~/.codex/generated_images/<session>/ig_*.png` に保存
  - 1 セクション 1792x1024 で 約 5 分、4 セクション並列実行も成功
- **セクション別画像生成 + style anchor 参照** で生成画像のスタイル統一性は確保できた（既存 1-3 と新規 4-8 の見た目が揃った）
- **PIL でクロップ + JSX でテキスト再現** のパターンは技術的に動作する。lucide-react / shadcn Button / Tailwind tokens / CSS variables 経由の色管理まで通った
- **vitest 230 tests を最後まで PASS で維持**（既存テストにも自分の変更にも影響を出さず）

---

## 4. 効かなかったこと（次回の地雷リスト）

1. **「LP 全体 1 枚絵 mockup」アプローチ** — リサーチ §2.4 が警告した通り、各セクションが潰れて使えない
2. **静物写真（本 + コーヒー + メガネ）に逃げる** — メッセージ性が皆無、Smitch の編集的訴求と不整合
3. **画像をそのまま貼ってお茶を濁す** — テキスト選択不可 / a11y NG / SEO NG。MVP でも避けるべき
4. **AskUserQuestion を Build フェーズで多用** — 自律実行が原則。事前にヒアリングで詰めるか、即時意思決定する
5. **画像内テキストへの依存** — AI が捏造する。LP のコピーは必ず JSX で持つ
6. **Plan の change 分割を画像生成方式変更後も維持しようとする** — 実態と plan が乖離。change-B〜G は 1 change にマージするか plan 自体を捨てる
7. **Codex CLI を諦めて Codex App に逃げる** — Codex CLI で十分動く。検証不足が原因の「動かない」判断は危険

---

## 5. 再利用できる資産（次回も使う）

| 場所 | 内容 | 使い道 |
|---|---|---|
| `CLAUDE.md` (root) | Smitch concept core + Hard rules | プロジェクト常時参照 |
| `docs/design/DESIGN.md` | LP design system (color HEX + OKLCh, typography, 8px rhythm, hard rules) | デザイン判断の権威 |
| `docs/design/lp-design-brief.md` | サービスコンセプトブリーフ | LP コピーライティング参照 |
| `docs/design/brand-references/` | brand reference 画像群 | Codex プロンプトに添付する style anchor |
| `docs/design/prompts/section-prompt-template.md` | リサーチ §5.1 ベースの汎用 prompt テンプレ | Codex 画像生成の出発点 |
| `docs/research/lp-image-to-code-workflow-2026.md` | リサーチドキュメント (§2.4 / §3.1 がセクション分割を推奨) | 設計判断の根拠 |
| `docs/context/product-concept.md` | プロダクトコンセプト | LP の核 |
| `docs/design/LP-Images/LPsection{1..8}.png` | **8 セクション LP 画像（最終生成物）** | デザインスペック / mockup として参照可能 |
| `docs/design/LP-Images/LP1枚出力(低解像度).png` | LP 全体 mockup 1 枚絵 | style anchor として使える（が、コード化の参照には使わないこと） |
| `_longruns/2026-05-24_lp-image-code-workflow/codex-app-section-prompts.md` | 8 セクション分の Codex App プロンプト集 | 再生成 / 別バリアント生成のレシピ |
| `_longruns/2026-05-24_lp-image-code-workflow/codex-prompts/section-{4..8}.md` | Codex CLI 用プロンプト 5 本 | `codex exec` で再生成可能 |
| `_longruns/2026-05-24_lp-image-code-workflow/scripts/crop-section{1..7}.py` | PIL クロップスクリプト | LP セクション画像から人物写真 / iPhone を切り出すレシピ |
| `scripts/codex-image-gen.sh` | Codex CLI 画像生成ラッパー | プロンプトファイル指定で呼び出すラッパー |
| `scripts/check-design-md-sync.sh` | DESIGN.md ↔ globals.css の同期チェッカー | CI / pre-commit で使える |
| `supabase/migrations/20260524000000_add_waitlist.sql` | waitlist テーブル migration | 本番 LP の form submit 先 |
| `src/components/landing/CtaWaitlistForm.tsx` | waitlist フォーム実装（7 項目 / honeypot / submitted 状態） | 次回 LP でもほぼそのまま流用可能 |
| `src/middleware.ts` | host 判定実装（`www.s-mitch.com` / `s-mitch.com` 分離） | 既存改修不要、そのまま使える |
| `_longruns/2026-05-24_lp-image-code-workflow/decisions.md` | D-S-1〜D-S-5 / D-A-1〜D-A-6 の設計判断ログ | 同じ判断を再度しなくて済む |

---

## 6. 捨てて良い資産

| 場所 | 理由 |
|---|---|
| `src/components/landing/{Hero,Problem,Process,Detail,OutcomeGallery,SelectionCriterion,Testimony}.tsx` | 本ワークツリー固有の試作。次回は別アプローチで再実装するため流用しない（参照はしてよい） |
| `src/app/marketing-preview/page.tsx` | 試作組み立てページ。change-H で本番 `src/app/marketing/page.tsx` に統合する想定だったが、それも未着手 |
| `public/landing/{iphone-*,photo-*}.png` (22 枚 subassets) | クロップ済み素材。次回は再クロップ or 再生成する可能性が高い |
| `_longruns/2026-05-24_lp-image-code-workflow/codex-prompts/section-*.log` | Codex exec 実行ログ。デバッグ済みなので不要 |
| `openspec/changes/lp-foundation/` | change-A APPROVED 済み、未 archive。次回ワークツリーで archive するか、本ワークツリーの archive 作業の中で処理 |

---

## 7. 次回 LP 構築への提言（核心）

### 推奨アプローチ: **画像生成は素材供給のみ、LP 構造は最初から HTML/CSS で組む**

1. **AI 画像生成の役割を「人物写真の素材供給源」に限定する**
   - 1 セクション 1 枚絵を生成して切り出すのではなく、`photo-knowledge-worker-male-thinking.png` / `photo-woman-with-coffee.png` のように **人物単体** で生成する
   - サイズは Web 用に正方形 or 縦長（1024x1024 or 1024x1536）。LP のセクション幅とアスペクトを切り離す
   - iPhone モックは **生成画像で作らない**。CSS で iPhone フレーム + 実 React UI で組む（shadcn primitives で内部 UI を構築）
2. **LP の各セクションは個別の React component として実装する。画像は `<Image src="...">` で部分的に挿入するのみ**
   - copy.ts に全コピーを集約（GA4 / a11y のために必須）
   - shadcn Button / Card / Form を貫徹
   - Lora + Public Sans を next/font/google で組み込み、`font-serif` / `font-sans` で参照
3. **change の分割を画像生成方式に依存させない**
   - change-B Hero / change-C Problem / change-D Process / ... のように **コンポーネント単位** で 1 change
   - 画像素材は change-A `lp-foundation` で一括生成 or 後追いで個別生成
4. **既存資産から借りる**:
   - `CtaWaitlistForm.tsx` はそのまま流用
   - `DESIGN.md` の色 / typography / spacing token に従う
   - `middleware.ts` は触らない
   - `supabase/migrations/20260524000000_add_waitlist.sql` で waitlist テーブル準備済み
5. **「LP 全体 mockup を 1 枚作って参照する」のは OK だが、それをコード化の対象にしない**
   - mockup は方向性確認用。最終 LP は最初から HTML で組む。

### 推奨フロー (次回)

```
1. 新規 worktree 作成
2. 既存 docs/design / docs/research / CLAUDE.md / src/components/ui / supabase/migrations をそのまま継承
3. change-B〜G を「セクション単位」で 1 つずつ実装
   - 必要な人物写真は Codex CLI で単体生成 → public/landing/photo-*.png に配置
   - iPhone モックは CSS frame + 内部 JSX で組む（生成画像は使わない）
   - コピーは copy.ts に集約
   - shadcn primitives 厳守
4. change-H で marketing/page.tsx に統合 (本ワークツリー未着手の部分)
5. ローカル動作確認 → archive → ユーザー側で Cloudflare DNS + Vercel domain + env vars 設定
```

---

## 8. 残課題（次回ワークツリーが拾うべきタスク）

- [ ] **change-A 関連の openspec archive**
  - `openspec/changes/lp-foundation/` を完了として archive する
  - 仕様 (`openspec/specs/lp-foundation/spec.md`) は archive 時に main spec に sync
- [ ] **本番 LP (`src/app/marketing/page.tsx`) の全面置換** (change-H)
  - `marketing-page.test.tsx` の 5 tests (S9-S13) が依存しているので、テスト書き直しも必要 (D-S-2 で方針確認済み)
  - `copy.ts` 全面置換
  - GA4 注入
  - a11y チェック (axe / contrast / keyboard nav)
- [ ] **waitlist form の Server Action 実装** (旧 change-G)
  - `src/app/marketing/waitlist/action.ts` を新規作成
  - Supabase service_role で `waitlist_submissions` テーブルに INSERT
  - honeypot で bot 弾く
- [ ] **ユーザー手動タスク 3 件** (RESUME.md §3)
  - Cloudflare DNS `www.s-mitch.com` → `cname.vercel-dns.com`
  - Vercel project `shukan` に `www.s-mitch.com` ドメイン追加
  - Vercel env vars に `NEXT_PUBLIC_MARKETING_HOSTS=www.s-mitch.com` を Production + Preview に設定
- [ ] **本ワークツリーの整理**
  - 本 worktree (`lp-image-code-workflow`) を `wt-clean` で整理
  - 次回ワークツリーは新規スラグで開始

---

## 9. 関連コミット（時系列）

```
96fba97 refactor(lp): decompose section images into HTML/CSS + cropped subassets
5970f49 feat(lp): wire 8 sections into marketing-preview with image-based components
2054327 feat(lp): generate LP sections 4-8 via codex CLI built-in image_gen
bf76cc3 docs(longrun): add RESUME + update checkpoint/decisions for session handoff
11d6115 docs(longrun): add Codex App section-by-section prompts (8 sections)
0c228dd docs(lp): add Smitch service concept brief
51f1a06 feat(lp-prototype): add provisional landing components and section images
ff3d2d5 docs(longrun): update checkpoint / decisions / verification-guide for change-A
384caab feat(lp-foundation): add waitlist Supabase migration
5d2b19f docs(lp-foundation): add CLAUDE.md with Smitch concept core and hard rules
```

---

## 10. 出典

- 本ファイルは 2026-05-25 のセッション末で書かれた最終引き継ぎノート
- 経緯: `RESUME.md` / `checkpoint.md` / `decisions.md`
- リサーチ根拠: `docs/research/lp-image-to-code-workflow-2026.md`
- 設計権威: `CLAUDE.md` / `docs/design/DESIGN.md`
