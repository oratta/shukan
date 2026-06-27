## 1. DESIGN.md + sync script (TDD)

- [x] 1.1 vitest テスト追加: `src/__tests__/lp-foundation-design-md.test.ts` で DESIGN.md の必須セクション (Color Palette / Typography / Spacing & Rhythm / Motion Budget / Hard Rules / AI Generation Style Block) と必須 OKLCh token の存在を検証 (RED)
- [x] 1.2 `docs/design/DESIGN.md` を実装し RED → GREEN
- [x] 1.3 vitest テスト追加: `src/__tests__/lp-foundation-check-sync.test.ts` で `scripts/check-design-md-sync.sh --help` 戻り値 0、不正 case で非ゼロを spawnSync で検証 (RED)
- [x] 1.4 `scripts/check-design-md-sync.sh` 実装し RED → GREEN

## 2. brand-references README + Codex prompt template (TDD)

- [x] 2.1 vitest テスト追加: `src/__tests__/lp-foundation-brand-refs.test.ts` で `docs/design/brand-references/README.md` の 5 role 記載と smitch-logo 参照メモを検証 (RED)
- [x] 2.2 `docs/design/brand-references/README.md` を実装し RED → GREEN
- [x] 2.3 vitest テスト追加: `src/__tests__/lp-foundation-prompt-template.test.ts` で Smitch 固定値 (science × soul / quiet, intentional 等) と NG 12 項目 (最低 10) の存在を検証 (RED)
- [x] 2.4 `docs/design/prompts/section-prompt-template.md` を実装し RED → GREEN

## 3. codex-image-gen.sh wrapper (TDD)

- [x] 3.1 vitest テスト追加: `src/__tests__/lp-foundation-codex-gen.test.ts` で `--help` exit 0 + 引数なし exit 非ゼロを spawnSync で検証 (RED)
- [x] 3.2 `scripts/codex-image-gen.sh` を実装し RED → GREEN

## 4. CLAUDE.md (TDD)

- [x] 4.1 vitest テスト追加: `src/__tests__/lp-foundation-claude-md.test.ts` で「受動/能動/経路」「手段/目的」「Hard Rules + shadcn/Tailwind/8px/WCAG/prefers-reduced-motion」の言及を検証 (RED)
- [x] 4.2 リポジトリ root に `CLAUDE.md` を新規作成し RED → GREEN

## 5. Supabase waitlist migration (TDD)

- [x] 5.1 vitest テスト追加: `src/__tests__/lp-foundation-waitlist-migration.test.ts` で migration ファイル必須要素 (create table / 4 boolean / at_least_one_env / RLS / insert policy / willingness_to_pay check) を検証 (RED)
- [x] 5.2 `supabase/migrations/20260524000000_add_waitlist.sql` を実装し RED → GREEN

## 6. Verification + regression

- [x] 6.1 `npm run test:run` で 197 + 新規 tests 全 PASS 確認 (実績: 230 / 230 PASS)
- [x] 6.2 `npm run lint` PASS 確認 (実績: 既存と同じ 9 errors / 35 warnings、本 change で増えていない)
- [x] 6.3 `npm run build` PASS 確認 (型チェック含む、static pages 14/14 generated)
- [x] 6.4 `openspec validate lp-foundation` PASS 確認
- [x] 6.5 verification-guide.md に各 Scenario の「テスト実装完了」「ロジック実装完了」を `[x]` でマーク

## 7. Commit

- [x] 7.1 適切な粒度でコミット (docs / scripts / migration / claude-md / openspec)
- [x] 7.2 各コミットメッセージに Co-Authored-By 行を含める
- [x] 7.3 コミットハッシュを記録
