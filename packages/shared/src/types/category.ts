import type { CategoryType } from "./common";

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  type: CategoryType;
  sortOrder: number;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  children: Category[];
}
