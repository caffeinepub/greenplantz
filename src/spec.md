# Specification

## Summary
**Goal:** Add a full nursery onboarding flow, support URL-based product photos across storefront and portals, and enhance team admin nursery management (including nursery removal) using Internet Identity.

**Planned changes:**
- Update `/portal/nursery` to show a “Sign Up / Register Nursery” form for signed-in users without a nursery membership, create a garden center via `createGardenCenter(name, location)`, and redirect to `/nursery/dashboard` on success.
- Extend backend Product model and APIs to store and return `imageUrls : [Text]` across product queries, and accept/persist `imageUrls` in `addProduct`/`updateProduct` (defaulting to an empty list when not provided).
- Enhance Nursery Dashboard “Add Product” UI to accept multiple image URL inputs (optional), preview thumbnails, and send URLs to the backend.
- Update Product Details page to render a responsive photo gallery (primary image + selectable thumbnails) when `imageUrls` exist, with a graceful fallback when absent.
- Update storefront product cards to show `imageUrls[0]` when available, otherwise keep placeholder behavior.
- Update `/portal/team` to present an explicit Internet Identity sign-in screen; route authenticated platform admins to `/admin/nurseries` and show non-admins an English permissions message.
- Enhance admin nursery management UI to show each nursery’s products (via `getProductsForGardenCenter`) with key fields and a photo thumbnail when available, including an English empty state for no products.
- Add an admin-only backend method to remove/disable a garden center and ensure its products no longer appear in public active product catalog queries.
- Add “Remove Nursery” controls in the admin UI with confirmation, admin-only visibility, and list refresh after completion.

**User-visible outcome:** Nursery vendors can register a nursery and add products with photo URLs; shoppers see product photos on cards and product detail galleries; team admins can sign in via Internet Identity, review nurseries and their products (with thumbnails), and remove nurseries so their products disappear from the public catalog.
