# Specification

## Summary
**Goal:** Add a hierarchical product category taxonomy and use it for catalog filtering and nursery product categorization.

**Planned changes:**
- Implement a backend Category model that supports parent/child relationships and can be returned to the frontend as a tree (no hardcoded category names in UI).
- Seed the full category taxonomy with these exact labels: Plants, Indoor Plants, Outdoor Plants, Seeds, Pots, Ceramic Pots, Plastic Pots, Fiber Pots, Fertilizers; and assign at least one seeded product to a leaf category.
- Update the catalog page filtering UI to filter by parent categories and subcategories (including Pots subcategories) and ensure filtering works alongside search.
- Update the nursery “Add Product” flow to allow selecting a category/subcategory from the taxonomy and submit the selected categoryId to the backend.

**User-visible outcome:** Users can browse and filter the shop catalog by the new category/subcategory structure, and nursery team members can assign a category when adding products so they appear under the correct filters.
