// 10 hand-picked accent colors for categories.
// Spread across the hue wheel so categories are always distinguishable.
// Future: each category stores its own color in the backend; these are the defaults.
import {ShoppingBag} from "lucide-react";

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

export const DEFAULT_EXPENSE_CATEGORY = {
    icon: ShoppingBag,
    iconId: "shopping-bag",
    color: "#6B7280",
}
