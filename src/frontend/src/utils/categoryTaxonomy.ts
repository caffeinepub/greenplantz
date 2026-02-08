import type { Category, CategoryWithSubcategories, CategoryId } from '../backend';

export interface FlattenedCategory {
  category: Category;
  depth: number;
  indentLabel: string;
  isLeaf: boolean;
}

/**
 * Flatten the hierarchical taxonomy into a list with depth information
 */
export function flattenTaxonomy(
  taxonomy: CategoryWithSubcategories[],
  depth: number = 0
): FlattenedCategory[] {
  const result: FlattenedCategory[] = [];

  for (const node of taxonomy) {
    const indent = '  '.repeat(depth);
    const isLeaf = node.subcategories.length === 0;

    result.push({
      category: node.category,
      depth,
      indentLabel: `${indent}${node.category.name}`,
      isLeaf,
    });

    if (node.subcategories.length > 0) {
      result.push(...flattenTaxonomy(node.subcategories, depth + 1));
    }
  }

  return result;
}

/**
 * Get all descendant category IDs for a given category
 */
export function getDescendantCategoryIds(
  categoryId: CategoryId,
  taxonomy: CategoryWithSubcategories[]
): CategoryId[] {
  const descendants: CategoryId[] = [categoryId];

  function traverse(nodes: CategoryWithSubcategories[]) {
    for (const node of nodes) {
      if (node.category.id === categoryId) {
        collectDescendants(node.subcategories);
        return;
      }
      traverse(node.subcategories);
    }
  }

  function collectDescendants(nodes: CategoryWithSubcategories[]) {
    for (const node of nodes) {
      descendants.push(node.category.id);
      collectDescendants(node.subcategories);
    }
  }

  traverse(taxonomy);
  return descendants;
}

/**
 * Get only leaf categories (categories without subcategories) for product assignment
 */
export function getLeafCategories(taxonomy: CategoryWithSubcategories[]): FlattenedCategory[] {
  const flattened = flattenTaxonomy(taxonomy);
  return flattened.filter((item) => item.isLeaf);
}

/**
 * Get top-level categories (root categories without parents)
 */
export function getTopLevelCategories(taxonomy: CategoryWithSubcategories[]): Category[] {
  return taxonomy.map((node) => node.category);
}

/**
 * Find a category node by ID in the taxonomy tree
 */
export function findCategoryNode(
  categoryId: CategoryId,
  taxonomy: CategoryWithSubcategories[]
): CategoryWithSubcategories | null {
  for (const node of taxonomy) {
    if (node.category.id === categoryId) {
      return node;
    }
    const found = findCategoryNode(categoryId, node.subcategories);
    if (found) return found;
  }
  return null;
}

/**
 * Check if a category is a leaf (has no subcategories)
 */
export function isLeafCategory(
  categoryId: CategoryId,
  taxonomy: CategoryWithSubcategories[]
): boolean {
  const node = findCategoryNode(categoryId, taxonomy);
  return node ? node.subcategories.length === 0 : false;
}
