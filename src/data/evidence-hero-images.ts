// エビデンス記事のヒーロー画像（Unsplash）。Discover カード（discover/page.tsx）と
// ホームのデイリー習慣カード背景（F15）で共有する単一ソース。キーは articleId。
//
// 画像を持たない記事は undefined を返し、呼び出し側でフォールバックする
// （Discover はグラデーション、ホームカードは背景なしの通常表示）。

export const EVIDENCE_HERO_IMAGES: Record<string, string> = {
  quit_smoking: 'https://images.unsplash.com/photo-1554548405-74d68637f897?w=400&h=200&fit=crop&q=80',
  quit_alcohol: 'https://images.unsplash.com/photo-1535683577427-740aaac4ec25?w=400&h=200&fit=crop&q=80',
  quit_porn: 'https://images.unsplash.com/photo-1573511860302-28c524319d2a?w=400&h=200&fit=crop&q=80',
  no_youtube: 'https://plus.unsplash.com/premium_photo-1661313613228-88dab4e3d22e?w=400&h=200&fit=crop&q=80',
  daily_cardio: 'https://plus.unsplash.com/premium_photo-1663127773019-2d977286d60a?w=400&h=200&fit=crop&q=80',
  daily_strength: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=400&h=200&fit=crop&q=80',
  morning_planning: 'https://plus.unsplash.com/premium_photo-1706028469800-7c719a733e10?w=400&h=200&fit=crop&q=80',
  quit_sugar: 'https://images.unsplash.com/photo-1668141077204-4cb8d28c6f1d?w=400&h=200&fit=crop&q=80',
  quit_junk_food: 'https://images.unsplash.com/photo-1564362411991-472954b39f56?w=400&h=200&fit=crop&q=80',
  quit_social_media: 'https://images.unsplash.com/photo-1675352161865-27816c76141a?w=400&h=200&fit=crop&q=80',
  no_screens_before_bed: 'https://images.unsplash.com/photo-1636101630293-ca3c1518717f?w=400&h=200&fit=crop&q=80',
  no_impulse_buying: 'https://images.unsplash.com/photo-1758525226490-c1553d9f3ad3?w=400&h=200&fit=crop&q=80',
  daily_walking: 'https://images.unsplash.com/photo-1759683730011-c72b69bf7f81?w=400&h=200&fit=crop&q=80',
  daily_stretching: 'https://images.unsplash.com/photo-1758599880489-403f7ae405f3?w=400&h=200&fit=crop&q=80',
  daily_yoga: 'https://images.unsplash.com/photo-1758599879559-efc4a3fb4243?w=400&h=200&fit=crop&q=80',
  cold_shower: 'https://images.unsplash.com/photo-1566969208336-b1af5efae927?w=400&h=200&fit=crop&q=80',
  daily_meditation: 'https://images.unsplash.com/photo-1577344718665-3e7c0c1ecf6b?w=400&h=200&fit=crop&q=80',
  daily_journaling: 'https://images.unsplash.com/photo-1704966029445-82c499aff85e?w=400&h=200&fit=crop&q=80',
  gratitude_practice: 'https://images.unsplash.com/photo-1712229462026-190941c6b083?w=400&h=200&fit=crop&q=80',
  sleep_7hours: 'https://images.unsplash.com/photo-1594296220371-a34da13ff6d4?w=400&h=200&fit=crop&q=80',
  wake_early: 'https://images.unsplash.com/photo-1763037415656-93716b1721f5?w=400&h=200&fit=crop&q=80',
  drink_water: 'https://images.unsplash.com/photo-1760627317288-8cc2b44efb2d?w=400&h=200&fit=crop&q=80',
  eat_vegetables: 'https://images.unsplash.com/photo-1758721218560-aec50748d450?w=400&h=200&fit=crop&q=80',
  intermittent_fasting: 'https://images.unsplash.com/photo-1744194699438-1fca92810d11?w=400&h=200&fit=crop&q=80',
  home_cooking: 'https://images.unsplash.com/photo-1758522489348-6e33d0e14669?w=400&h=200&fit=crop&q=80',
  daily_reading: 'https://images.unsplash.com/photo-1623771702313-39dc4f71d275?w=400&h=200&fit=crop&q=80',
  deep_work: 'https://images.unsplash.com/photo-1633250999791-3134c302139b?w=400&h=200&fit=crop&q=80',
  learn_language: 'https://images.unsplash.com/photo-1673515336416-a859f5b02afa?w=400&h=200&fit=crop&q=80',
  daily_saving: 'https://images.unsplash.com/photo-1561837581-abd854e0ee22?w=400&h=200&fit=crop&q=80',
  time_in_nature: 'https://images.unsplash.com/photo-1620802470382-5799c79143ab?w=400&h=200&fit=crop&q=80',
  morning_tidying: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=200&fit=crop&q=80',
  daily_habit_review: 'https://images.unsplash.com/photo-1643706755543-2d1f7adff211?w=400&h=200&fit=crop&q=80',
  schedule_adherence: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=200&fit=crop&q=80',
  pomodoro_technique: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=200&fit=crop&q=80',
  movement_breaks: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=200&fit=crop&q=80',
};

/** articleId からヒーロー画像URLを引く。未登録は undefined。 */
export function getEvidenceHeroImage(articleId: string): string | undefined {
  return EVIDENCE_HERO_IMAGES[articleId];
}
