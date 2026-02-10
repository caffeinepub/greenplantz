# Specification

## Summary
**Goal:** Show all monetary amounts across the app in Indian Rupees (INR) using the ₹ symbol instead of $.

**Planned changes:**
- Update all storefront and portal price displays (product cards, product details, cart, checkout, customer orders, and admin/nursery price views) to format currency as INR (₹).
- Add a shared frontend money-formatting utility and refactor existing components/pages to use it instead of manual currency string interpolation.

**User-visible outcome:** Every price throughout the app is consistently displayed in Indian Rupees (₹) with two decimal places, and no UI shows the $ symbol.
