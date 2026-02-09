# Specification

## Summary
**Goal:** Replace the GreenPlantz brand logo across the site (header, footer, favicon) with the uploaded `image-9.png`, using cache-busted static assets.

**Planned changes:**
- Add the original uploaded `image-9.png` to `frontend/public/assets/generated/`.
- Create a cache-busted, header-optimized transparent PNG logo derived from `image-9.png` at exactly 112px height (preserve aspect ratio; avoid distortion; avoid extra padding unless needed to prevent clipping).
- Update `frontend/src/components/layout/SiteHeader.tsx` and `frontend/src/components/layout/SiteFooter.tsx` to use the new derived logo asset path.
- Generate new cache-busted favicon assets (16x16 PNG, 32x32 PNG, and `.ico`) derived from `image-9.png` under `frontend/public/assets/generated/`, and update `frontend/index.html` to reference them.
- Search the frontend for remaining references to the previous logo asset(s) under `/assets/generated/` and update them to the new cache-busted logo so the new logo is used everywhere.

**User-visible outcome:** The new uploaded logo appears in the site header and footer, and the browser tab favicon updates to match it after a hard refresh.
