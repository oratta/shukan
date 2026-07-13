// エビデンス記事のヒーロー画像アクセサ。
//
// 単一ソースは各記事TSファイルの `heroImage`（src/data/impact-articles/*.ts の
// LifeImpactArticle.heroImage）。このモジュールはそこから用途別のサイズ付きURLと
// フォールバックグラデーションを導出するだけの薄い層で、画像データ自体は持たない。
// 記事を追加するときにこのファイルを編集する必要はない（記事TSに heroImage を書けばよい）。
//
// 画像を持たない記事は undefined を返し、呼び出し側でフォールバックする
// （Discover / エビデンスシートはグラデーション、ホームカードは背景なしの通常表示）。

import { getArticle, isValidArticleId, VALID_ARTICLE_IDS } from './impact-articles';

interface HeroSize {
  w: number;
  h: number;
}

/** Discover カード・ホームのコラージュ背景で使う既定サイズ。 */
export const HERO_SIZE_CARD: HeroSize = { w: 400, h: 200 };
/** エビデンスシートのヘッダーで使う大サイズ。 */
export const HERO_SIZE_SHEET: HeroSize = { w: 800, h: 400 };

function sizedUrl(base: string, size: HeroSize): string {
  return `${base}?w=${size.w}&h=${size.h}&fit=crop&q=80`;
}

/** articleId からヒーロー画像URLを引く（既定は Discover カードサイズ）。未登録/画像なしは undefined。 */
export function getEvidenceHeroImage(
  articleId: string,
  size: HeroSize = HERO_SIZE_CARD
): string | undefined {
  if (!isValidArticleId(articleId)) return undefined;
  const hero = getArticle(articleId)?.heroImage;
  return hero ? sizedUrl(hero.url, size) : undefined;
}

/** articleId からフォールバック用グラデーションを引く。未登録/画像なし記事は undefined。 */
export function getEvidenceHeroGradient(articleId: string): string | undefined {
  if (!isValidArticleId(articleId)) return undefined;
  return getArticle(articleId)?.heroImage?.gradient;
}

/**
 * 後方互換の派生マップ（id -> Discover カードサイズのURL）。記事データから導出し、
 * 画像を持つ記事のみを含む。既存の呼び出し側（discover/page.tsx）とテストのために維持する。
 */
export const EVIDENCE_HERO_IMAGES: Record<string, string> = Object.fromEntries(
  VALID_ARTICLE_IDS.flatMap((id) => {
    const url = getEvidenceHeroImage(id);
    return url ? ([[id, url]] as const) : [];
  })
);
