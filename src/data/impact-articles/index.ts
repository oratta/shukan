import { quitSmoking } from './quit-smoking';
import { quitPorn } from './quit-porn';
import { quitAlcohol } from './quit-alcohol';
import { quitSugar } from './quit-sugar';
import { quitJunkFood } from './quit-junk-food';
import { quitSocialMedia } from './quit-social-media';
import { noYoutube } from './no-youtube';
import { noScreensBeforeBed } from './no-screens-before-bed';
import { noImpulseBuying } from './no-impulse-buying';
import { morningPlanning } from './morning-planning';
import { dailyCardio } from './daily-cardio';
import { dailyStrength } from './daily-strength';
import { dailyWalking } from './daily-walking';
import { dailyStretching } from './daily-stretching';
import { dailyYoga } from './daily-yoga';
import { dailyMeditation } from './daily-meditation';
import { dailyJournaling } from './daily-journaling';
import { dailyReading } from './daily-reading';
import { dailySaving } from './daily-saving';
import { coldShower } from './cold-shower';
import { sleep7hours } from './sleep-7hours';
import { wakeEarly } from './wake-early';
import { gratitudePractice } from './gratitude-practice';
import { drinkWater } from './drink-water';
import { eatVegetables } from './eat-vegetables';
import { intermittentFasting } from './intermittent-fasting';
import { homeCooking } from './home-cooking';
import { deepWork } from './deep-work';
import { learnLanguage } from './learn-language';
import { timeInNature } from './time-in-nature';
import type { LifeImpactArticle, ArticleId } from '@/types/impact';

const impactArticles: Map<ArticleId, LifeImpactArticle> = new Map([
  // Quit habits
  ['quit_smoking', quitSmoking],
  ['quit_porn', quitPorn],
  ['quit_alcohol', quitAlcohol],
  ['quit_sugar', quitSugar],
  ['quit_junk_food', quitJunkFood],
  ['quit_social_media', quitSocialMedia],
  ['no_youtube', noYoutube],
  ['no_screens_before_bed', noScreensBeforeBed],
  ['no_impulse_buying', noImpulseBuying],
  // Positive habits - Exercise
  ['daily_cardio', dailyCardio],
  ['daily_strength', dailyStrength],
  ['daily_walking', dailyWalking],
  ['daily_stretching', dailyStretching],
  ['daily_yoga', dailyYoga],
  ['cold_shower', coldShower],
  // Positive habits - Mental wellness
  ['daily_meditation', dailyMeditation],
  ['daily_journaling', dailyJournaling],
  ['gratitude_practice', gratitudePractice],
  // Positive habits - Sleep
  ['sleep_7hours', sleep7hours],
  ['wake_early', wakeEarly],
  // Positive habits - Nutrition
  ['drink_water', drinkWater],
  ['eat_vegetables', eatVegetables],
  ['intermittent_fasting', intermittentFasting],
  ['home_cooking', homeCooking],
  // Positive habits - Productivity
  ['morning_planning', morningPlanning],
  ['daily_reading', dailyReading],
  ['deep_work', deepWork],
  ['learn_language', learnLanguage],
  // Positive habits - Financial & Other
  ['daily_saving', dailySaving],
  ['time_in_nature', timeInNature],
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
