# Specification

## Summary
**Goal:** Update the SiteHeader logo to use the newly provided header logo image and ensure it fits responsively within the header.

**Planned changes:**
- Add the newly provided header logo source image as a static asset under `frontend/public/assets/generated/`.
- Generate a transparent PNG derived from that source at exactly 112px height (aspect ratio preserved) with a cache-busting filename under `frontend/public/assets/generated/`.
- Update only the SiteHeader logo `<img>` (inside the home Link) in `frontend/src/components/layout/SiteHeader.tsx` to reference the new cache-busted 112px-tall asset, adjusting only that `<img>`’s sizing classes if needed to prevent overflow in the `h-16` header.

**User-visible outcome:** The header displays the new logo (not broken), and it stays fully visible and undistorted across mobile/tablet/desktop without overflowing the header.
