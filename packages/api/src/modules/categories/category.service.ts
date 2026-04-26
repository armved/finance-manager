import type { Database } from "../../db";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "@finance-manager/shared";
import * as repo from "./category.repository";

function badRequest(message: string): Error {
  return Object.assign(new Error(message), { statusCode: 400 });
}

export async function listCategories(
  type: "income" | "expense" | undefined,
  db: Database,
): Promise<Category[]> {
  return repo.findAll(type, db);
}

export async function getCategory(id: string, db: Database): Promise<Category | null> {
  return repo.findById(id, db);
}

export async function createCategory(
  data: CreateCategoryInput,
  db: Database,
): Promise<Category> {
  if (data.parentId) {
    const parent = await repo.findById(data.parentId, db);
    if (!parent) throw badRequest("Parent category not found");
    if (parent.type !== data.type) {
      throw badRequest(
        `Parent category type "${parent.type}" does not match new category type "${data.type}"`,
      );
    }
  }
  return repo.create(data, db);
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryInput,
  db: Database,
): Promise<Category | null> {
  const existing = await repo.findById(id, db);
  if (!existing) return null;
  if (existing.isDefault && data.type && data.type !== existing.type) {
    throw badRequest("Cannot change the type of a default category");
  }
  return repo.update(id, data, db);
}

export async function deleteCategory(
  id: string,
  reassignToCategoryId: string | undefined,
  db: Database,
): Promise<boolean> {
  const existing = await repo.findById(id, db);
  if (!existing) return false;

  if (existing.isDefault) {
    throw badRequest("Default categories cannot be deleted");
  }

  if (await repo.hasChildren(id, db)) {
    throw badRequest(
      "Cannot delete a category that has subcategories. Delete or move them first.",
    );
  }

  let targetId: string;
  if (reassignToCategoryId) {
    if (reassignToCategoryId === id) {
      throw badRequest("Cannot reassign transactions to the category being deleted");
    }
    const target = await repo.findById(reassignToCategoryId, db);
    if (!target) throw badRequest("Reassign target category not found");
    if (target.type !== existing.type) {
      throw badRequest(
        `Reassign target type "${target.type}" does not match deleted category type "${existing.type}"`,
      );
    }
    targetId = reassignToCategoryId;
  } else {
    const defaultCat = await repo.findDefault(existing.type, db);
    if (!defaultCat) throw new Error(`No default category found for type "${existing.type}"`);
    targetId = defaultCat.id;
  }

  return repo.reassignAndDelete(id, targetId, db);
}
