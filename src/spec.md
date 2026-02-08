# Specification

## Summary
**Goal:** Allowlist an additional Internet Identity Principal ID as a Platform Admin so they can access admin-only portal screens.

**Planned changes:**
- Add Principal ID `7sopg-rkdvi-vg7tv-4foks-ejhyr-rotwu-wcdxm-kkij6-zwzel-qownx-aae` to the backend platform-admin allowlist in `backend/main.mo`.
- Ensure existing platform-admin allowlist entries remain unchanged.

**User-visible outcome:** After deployment, signing in with the specified Principal ID is recognized as a Platform Admin (`isPlatformAdmin = true`), allowing access to Team/Admin portal pages guarded by platform-admin checks.
