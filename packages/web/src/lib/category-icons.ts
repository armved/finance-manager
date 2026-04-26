import {
  Apple,
  Banknote,
  BookOpen,
  Briefcase,
  Bus,
  Car,
  Coffee,
  CreditCard,
  Droplets,
  Dumbbell,
  Film,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Music,
  Package,
  Phone,
  Pill,
  Plane,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Stethoscope,
  Train,
  TrendingUp,
  Tv2,
  Utensils,
  Wallet,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface CategoryIconDef {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const CATEGORY_ICONS: CategoryIconDef[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "utensils", label: "Dining", icon: Utensils },
  { id: "coffee", label: "Coffee", icon: Coffee },
  { id: "shopping-cart", label: "Shopping", icon: ShoppingCart },
  { id: "shopping-bag", label: "Shopping Bag", icon: ShoppingBag },
  { id: "apple", label: "Groceries", icon: Apple },
  { id: "car", label: "Car", icon: Car },
  { id: "bus", label: "Bus", icon: Bus },
  { id: "train", label: "Train", icon: Train },
  { id: "plane", label: "Travel", icon: Plane },
  { id: "zap", label: "Utilities", icon: Zap },
  { id: "droplets", label: "Water", icon: Droplets },
  { id: "wifi", label: "Internet", icon: Wifi },
  { id: "graduation-cap", label: "Education", icon: GraduationCap },
  { id: "book-open", label: "Books", icon: BookOpen },
  { id: "shield", label: "Insurance", icon: Shield },
  { id: "heart-pulse", label: "Health", icon: HeartPulse },
  { id: "stethoscope", label: "Medical", icon: Stethoscope },
  { id: "pill", label: "Pharmacy", icon: Pill },
  { id: "tv-2", label: "TV", icon: Tv2 },
  { id: "film", label: "Movies", icon: Film },
  { id: "music", label: "Music", icon: Music },
  { id: "dumbbell", label: "Gym", icon: Dumbbell },
  { id: "trending-up", label: "Income", icon: TrendingUp },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "banknote", label: "Cash", icon: Banknote },
  { id: "credit-card", label: "Card", icon: CreditCard },
  { id: "gift", label: "Gifts", icon: Gift },
  { id: "package", label: "Packages", icon: Package },
  { id: "briefcase", label: "Work", icon: Briefcase },
  { id: "phone", label: "Phone", icon: Phone },
];

export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICONS.map(({ id, icon }) => [id, icon]),
);

export function getIconComponent(
  iconId: string | null | undefined,
): LucideIcon | undefined {
  if (!iconId) return undefined;
  return ICON_MAP[iconId];
}
