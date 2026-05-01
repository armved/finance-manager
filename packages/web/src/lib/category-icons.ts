import {
  Apple,
  Banknote,
  Bone,
  BookOpen,
  Briefcase,
  Bus,
  Cake,
  Car,
  Coffee,
  CreditCard,
  Droplets,
  Dumbbell,
  FileText,
  Film,
  Gift,
  GraduationCap,
  Heart,
  HeartHandshake,
  HeartPulse,
  Home,
  Key,
  Laptop,
  Layers,
  MapPin,
  Music,
  Package,
  Palette,
  PawPrint,
  Phone,
  Pill,
  Plane,
  Shield,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Stethoscope,
  Ticket,
  Train,
  TrendingUp,
  Tv2,
  User,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface CategoryIconDef {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const CATEGORY_ICONS: CategoryIconDef[] = [
  // Home & Housing
  { id: "home", label: "Home", icon: Home },
  { id: "key", label: "Rent", icon: Key },
  { id: "zap", label: "Utilities", icon: Zap },
  { id: "wrench", label: "Maintenance", icon: Wrench },
  // Food & Dining
  { id: "utensils", label: "Dining", icon: Utensils },
  { id: "coffee", label: "Coffee", icon: Coffee },
  { id: "apple", label: "Groceries", icon: Apple },
  { id: "cake", label: "Bakery", icon: Cake },
  // Shopping
  { id: "shopping-cart", label: "Shopping", icon: ShoppingCart },
  { id: "shopping-bag", label: "Shopping Bag", icon: ShoppingBag },
  { id: "shirt", label: "Clothing", icon: Shirt },
  { id: "smartphone", label: "Electronics", icon: Smartphone },
  { id: "sparkles", label: "Beauty", icon: Sparkles },
  // Transport
  { id: "car", label: "Car", icon: Car },
  { id: "bus", label: "Bus", icon: Bus },
  { id: "train", label: "Train", icon: Train },
  { id: "plane", label: "Travel", icon: Plane },
  { id: "map-pin", label: "Local Transit", icon: MapPin },
  // Subscriptions & Tech
  { id: "tv-2", label: "TV / Media", icon: Tv2 },
  { id: "laptop", label: "Software", icon: Laptop },
  { id: "wifi", label: "Internet", icon: Wifi },
  { id: "credit-card", label: "Membership", icon: CreditCard },
  // Wellness
  { id: "heart-pulse", label: "Health", icon: HeartPulse },
  { id: "stethoscope", label: "Medical", icon: Stethoscope },
  { id: "droplets", label: "Personal Care", icon: Droplets },
  { id: "dumbbell", label: "Fitness", icon: Dumbbell },
  { id: "pill", label: "Pharmacy", icon: Pill },
  // Leisure
  { id: "film", label: "Movies", icon: Film },
  { id: "music", label: "Music", icon: Music },
  { id: "palette", label: "Hobbies", icon: Palette },
  { id: "ticket", label: "Events", icon: Ticket },
  // Finance
  { id: "banknote", label: "Cash", icon: Banknote },
  { id: "file-text", label: "Taxes", icon: FileText },
  { id: "trending-up", label: "Income", icon: TrendingUp },
  { id: "wallet", label: "Wallet", icon: Wallet },
  // Gifts & Social
  { id: "gift", label: "Gifts", icon: Gift },
  { id: "heart", label: "Family", icon: Heart },
  { id: "heart-handshake", label: "Charity", icon: HeartHandshake },
  { id: "user", label: "Person", icon: User },
  // Pets
  { id: "paw-print", label: "Pets", icon: PawPrint },
  { id: "bone", label: "Pet Food", icon: Bone },
  // Misc
  { id: "layers", label: "Miscellaneous", icon: Layers },
  { id: "package", label: "Packages", icon: Package },
  // Other
  { id: "book-open", label: "Books", icon: BookOpen },
  { id: "graduation-cap", label: "Education", icon: GraduationCap },
  { id: "shield", label: "Insurance", icon: Shield },
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
