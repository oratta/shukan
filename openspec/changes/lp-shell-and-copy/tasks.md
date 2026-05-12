# Tasks: lp-shell-and-copy

## 1. テスト先行（RED）

- [ ] 1.1 `src/__tests__/marketing-page.test.tsx`（または同等）を新規作成
  - Scenario: Hero section is visible（`Switch your path.` heading + ja subcopy with "なりたい自分" "科学"）
  - Scenario: Problem and Solution texts coexist
  - Scenario: Primary CTA href points to login
  - Scenario: Footer links resolve to legal pages（/privacy, /terms, Genetta Inc）
  - Scenario: copy.ts exports core strings
- [ ] 1.2 必要に応じて `@testing-library/react` を devDependency に追加（既に入っている可能性あり、要確認）
- [ ] 1.3 `npm run test:run` で対象シナリオが RED であることを確認

## 2. 最小実装（GREEN）

- [ ] 2.1 `src/app/marketing/copy.ts` を新規作成し、以下をエクスポート:
  - `tagline = 'Switch your path.'`
  - `heroSubcopy`（ja、product-concept.md の核を1〜2文に圧縮、「なりたい自分」「科学」を含む）
  - `problemText`（ja、既存習慣アプリの「これで意味あるの？」の不安）
  - `solutionText`（ja、Smitch のエビデンスベースアプローチ）
  - `ctaLabel = 'アプリを始める'`
  - `footerCredit = '© Genetta Inc.'`
- [ ] 2.2 `src/app/marketing/page.tsx` を更新し、`copy.ts` から import した文字列で Hero / Problem→Solution / CTA / Footer を構成。DESIGN.md のセマンティッククラスのみ使用
- [ ] 2.3 `src/app/marketing/layout.tsx` を更新し、最低限のメタデータ（タイトル `Smitch — Switch your path.` 等）と html lang="ja" のみ設定（OGP / Twitter Card は change-C で **追加**する。本 change では設定しない）
- [ ] 2.4 CTA の href は `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://s-mitch.com'}/login`
- [ ] 2.5 `npm run test:run` で全シナリオ GREEN

## 3. 品質確認（REFACTOR + 検証）

- [ ] 3.1 `npm run lint` エラーゼロ
- [ ] 3.2 `npm run build` 成功
- [ ] 3.3 既存テストおよび change-A テストが全 PASS
- [ ] 3.4 `src/app/marketing/**/*.{ts,tsx}` 内の hex 色リテラル grep（`#[0-9A-Fa-f]{3,8}`）が `0` 件であることを確認。Smitch ロゴは `<Image src="/smitch-logo.svg" />` 経由で参照し、inline SVG を貼らない
- [ ] 3.5 verification-guide.md の該当 Scenario `[x]` マーク
