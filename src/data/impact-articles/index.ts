import { quitSmoking } from './quit-smoking';
import { quitPorn } from './quit-porn';
import type { LifeImpactArticle, ArticleId } from '@/types/impact';

const impactArticles: Map<ArticleId, LifeImpactArticle> = new Map([
  ['quit_smoking', quitSmoking],
  ['quit_porn', quitPorn],
]);

export function getArticle(id: ArticleId): LifeImpactArticle | undefined {
  return impactArticles.get(id);
}

export function getArticleList(): { id: ArticleId; name: string }[] {
  return Array.from(impactArticles.entries()).map(([id, article]) => ({
    id,
    name: article.habitName,
  }));
}
