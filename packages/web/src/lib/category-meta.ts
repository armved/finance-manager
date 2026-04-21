import type { ElementType } from "react";
import {
  Car,
  GraduationCap,
  HeartPulse,
  Home,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Tv2,
  Utensils,
  Zap,
} from "lucide-react";

// 10 hand-picked accent colors for categories.
// Spread across the hue wheel so categories are always distinguishable.
// Future: each category stores its own color in the backend; these are the defaults.
export const CATEGORY_PALETTE = [
  "#FF6B6B", // Coral      ~0°
  "#FF9F43", // Tangerine  ~30°
  "#FFC048", // Amber      ~45°
  "#AADC30", // Lime       ~78°
  "#2ECC71", // Emerald    ~141°
  "#26D0CE", // Teal       ~178°
  "#54A0FF", // Sky        ~214°
  "#7B7BED", // Iris       ~240°
  "#C56BED", // Amethyst   ~282°
  "#FF6BAE", // Rose       ~333°
] as const;

export type CategoryColor = (typeof CATEGORY_PALETTE)[number];

export interface CategoryMeta {
  icon: ElementType;
  color: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  Housing:         { icon: Home,          color: CATEGORY_PALETTE[0] },
  "Food & Drink":  { icon: Utensils,      color: CATEGORY_PALETTE[1] },
  Shopping:        { icon: ShoppingBag,   color: CATEGORY_PALETTE[2] },
  Groceries:       { icon: ShoppingCart,  color: CATEGORY_PALETTE[3] },
  Transport:       { icon: Car,           color: CATEGORY_PALETTE[4] },
  Utilities:       { icon: Zap,           color: CATEGORY_PALETTE[5] },
  Education:       { icon: GraduationCap, color: CATEGORY_PALETTE[6] },
  Insurance:       { icon: Shield,        color: CATEGORY_PALETTE[7] },
  Healthcare:      { icon: HeartPulse,    color: CATEGORY_PALETTE[8] },
  Entertainment:   { icon: Tv2,           color: CATEGORY_PALETTE[9] },
  Income:          { icon: ShoppingBag,   color: CATEGORY_PALETTE[4] },
};

const FALLBACK_META: CategoryMeta = {
  icon: ShoppingBag,
  color: "#6B7280",
};

export function getCategoryMeta(label: string): CategoryMeta {
  return CATEGORY_META[label] ?? FALLBACK_META;
}
