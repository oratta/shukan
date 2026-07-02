import {
  BookOpen,
  Brain,
  CandyOff,
  ChefHat,
  CigaretteOff,
  Flower2,
  HandHeart,
  HeartPulse,
  Moon,
  PersonStanding,
  PhoneOff,
  PiggyBank,
  ShoppingCart,
  Smile,
  Sunrise,
  Target,
  TreePine,
  TrendingUp,
  UtensilsCrossed,
  WineOff,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// KPI カタログ / 習慣プリセットの icon 名（lucide ケバブケース）→ コンポーネントの対応表。
// dynamic import を使わず、使う分だけ明示的に束ねる（ビルド安全・YAGNI）。
const ICON_MAP: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  brain: Brain,
  "candy-off": CandyOff,
  "chef-hat": ChefHat,
  "cigarette-off": CigaretteOff,
  "flower-2": Flower2,
  "hand-heart": HandHeart,
  "heart-pulse": HeartPulse,
  moon: Moon,
  "person-standing": PersonStanding,
  "phone-off": PhoneOff,
  "piggy-bank": PiggyBank,
  "shopping-cart": ShoppingCart,
  smile: Smile,
  sunrise: Sunrise,
  target: Target,
  "tree-pine": TreePine,
  "trending-up": TrendingUp,
  "utensils-crossed": UtensilsCrossed,
  "wine-off": WineOff,
};

export function KpiIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name] ?? Sparkles;
  return <Icon className={className} aria-hidden />;
}
