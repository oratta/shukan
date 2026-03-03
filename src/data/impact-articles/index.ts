import { quitSmoking } from './quit-smoking';
import { quitPorn } from './quit-porn';
import { quitAlcohol } from './quit-alcohol';
import { noYoutube } from './no-youtube';
import { morningPlanning } from './morning-planning';
import { dailyCardio } from './daily-cardio';
import { dailyStrength } from './daily-strength';
import type { LifeImpactArticle, ArticleId } from '@/types/impact';

const impactArticles: Map<ArticleId, LifeImpactArticle> = new Map([
  ['quit_smoking', quitSmoking],
  ['quit_porn', quitPorn],
  ['quit_alcohol', quitAlcohol],
  ['no_youtube', noYoutube],
  ['morning_planning', morningPlanning],
  ['daily_cardio', dailyCardio],
  ['daily_strength', dailyStrength],
]);

export function getArticle(id: ArticleId): LifeImpactArticle | undefined {
  return impactArticles.get(id);
}

export function getArticleList(): {
  id: ArticleId;
  name: string;
  defaultHabitType: 'positive' | 'quit';
  defaultIcon: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  calculationParams: LifeImpactArticle['calculationParams'];
}[] {
  return Array.from(impactArticles.entries()).map(([id, article]) => ({
    id,
    name: article.habitName,
    defaultHabitType: article.defaultHabitType,
    defaultIcon: article.defaultIcon,
    confidenceLevel: article.confidenceLevel,
    calculationParams: article.calculationParams,
  }));
}
