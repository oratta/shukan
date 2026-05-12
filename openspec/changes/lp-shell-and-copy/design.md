# Design: lp-shell-and-copy

## Context

change-A で routing 基盤が整い、`src/app/marketing/page.tsx` は Hero プレースホルダ + CTA + フッターの最低限を持っている。本 change で product-concept.md からコピーを抽出し、実コンテンツを差し込む。ただし最終レイアウト/ビジュアル/セクション構成は codex+gpt-image-2 に委譲するため、本 change が作るものは「codex への入力資料 + v0 公開可能なシンプル LP」。

## Goals

- 「なりたい自分から科学が習慣を導く」というコアメッセージを ja で言語化し、Hero / Problem→Solution / CTA / Footer で構成する
- コピーを `src/app/marketing/copy.ts` に一元化し、後続の codex+gpt-image-2 / 翻訳作業の単一ソースにする
- DESIGN.md のセマンティックカラーを使い、ブランド一貫性を保つ
- Vitest で「要素の存在」「CTA リンク先」を構造テストする

## Non-Goals

- 凝ったセクション構成（FAQ, Comparison Table, Testimonials 等）
- アニメーション・モーション
- A/B テスト分岐
- 英語コピー
- OGP / SEO メタタグ（change-C 範囲）

## Decisions

### D1: コピーは copy.ts に集約、コンポーネント内で文字列リテラルを書かない
- **判断**: `src/app/marketing/copy.ts` を新設し、`tagline`, `heroSubcopy`, `problemText`, `solutionText`, `ctaLabel`, `footerCredit` をエクスポート。`page.tsx` は import して JSX に流し込む
- **代替案 A**: 直接 page.tsx に文字列を書く
- **却下理由**: codex+gpt-image-2 への入力資料として参照しやすい単一ソースが必要。将来の英語化や翻訳ライブラリ移行も視野

### D2: コピー出典は product-concept.md からの直接引用 + 軽い要約
- **判断**: product-concept.md の「コアコンセプト」「他の習慣アプリとの決定的な違い」セクションから抜粋・要約。自前のキャッチコピーは作らず、既に練られたブランド文言を尊重
- **代替案 A**: コピーライティングを新規発案
- **却下理由**: plan.md D5 で「product-concept.md を1次ソース」と決定済み。Voice & Tone も既存ブランドガイドに準拠

### D3: CTA リンク先は環境変数 `NEXT_PUBLIC_APP_URL` 経由
- **判断**: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://s-mitch.com'}/login` で CTA href を組み立てる
- **代替案 A**: `/login` への相対パス
- **却下理由**: www host から発火するため、`/login` はそのままだと `www.s-mitch.com/login` になり、apex のログインフローと分離される。明示的に apex の login へ向ける必要がある

### D4: テストは React Testing Library + Vitest で構造アサーション
- **判断**: `src/__tests__/marketing-page.test.tsx` で `render(<MarketingPage />)` し、`screen.getByText` / `screen.getByRole('link', { name: ... })` で要素を assert
- **代替案 A**: E2E（Playwright）テスト
- **却下理由**: 構造テストはユニットで十分。E2E はブラウザ検証で longrun-browser-verifier が担当

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `copy.ts` のキーを後で変更すると Vitest テストが落ちる | キーは最小限に絞り、`tagline` / `heroSubcopy` / `problemText` / `solutionText` / `ctaLabel` / `footerCredit` で固定 |
| Hero プレースホルダがダサく見える | 本 change は v0 公開を妨げない最低品質を目指す。本格ビジュアルは codex+gpt-image-2 |
| Server Component と Client Component の混在 | `page.tsx` は基本 Server Component（i18n 不要、状態なし）。CTA も次の遷移先が外部 URL なので `<a href>` で十分 |
| copy.ts が型不在 | TypeScript const として export し型推論で利用、後で英語版を追加するとき `Record<Locale, ...>` 型へ拡張可能 |

## Migration Plan

- なし

## Open Questions

- なし（コピー出典 product-concept.md で確定）

## Builder Decisions（実装時に確定）

### D5: テストは tree-walking helper で実装（RTL 追加せず）

- **判断**: tasks 1.2「必要に応じて RTL を追加」に対し追加せず、`middleware.test.ts` S8 と同じ手で書いた tree walker で構造アサーション
- **代替案 A**: `@testing-library/react` + jsdom 環境
- **却下理由**: vitest 環境が `node` で、jsdom 導入は他テスト 7 ファイルへの副作用リスク。sync Server Component の構造（h1/footer/href/text）assert には walker で十分。YAGNI

### D6: 主要 CTA は素の `<a>`（Next `<Link>` ではなく）

- **判断**: `<a href="https://s-mitch.com/login">{ctaLabel}</a>` を 1 つだけ配置
- **代替案 A**: `next/link` の `<Link>` を使う
- **却下理由**: 遷移先が別 origin（apex `s-mitch.com`）でクライアントナビゲーション最適化が効かない。素の anchor のほうが prefetch 等の副作用がなく、middleware test とも整合

### D7: accessible label は可視テキスト経由（aria-label を上書きしない）

- **判断**: CTA の accessible name は `<a>` 内の可視テキスト `ctaLabel` で成立させ、`aria-label` は付けない
- **代替案 A**: `aria-label={ctaLabel}` を冗長に付与
- **却下理由**: 可視テキストと aria-label が同一なら冗長。WAI-ARIA Authoring Practices 的にも冗長指定は推奨されない

