import {
  BookOpen,
  Brain,
  CandyOff,
  ChefHat,
  CigaretteOff,
  Dumbbell,
  Flower2,
  GlassWater,
  Hamburger,
  HandHeart,
  HeartPulse,
  MessageCircleHeart,
  Moon,
  PenLine,
  PersonStanding,
  PhoneOff,
  PiggyBank,
  Salad,
  ShoppingCart,
  Smile,
  Soup,
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
  dumbbell: Dumbbell,
  "flower-2": Flower2,
  "glass-water": GlassWater,
  hamburger: Hamburger,
  "hand-heart": HandHeart,
  "heart-pulse": HeartPulse,
  "message-circle-heart": MessageCircleHeart,
  moon: Moon,
  "pen-line": PenLine,
  "person-standing": PersonStanding,
  "phone-off": PhoneOff,
  "piggy-bank": PiggyBank,
  salad: Salad,
  "shopping-cart": ShoppingCart,
  smile: Smile,
  soup: Soup,
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
