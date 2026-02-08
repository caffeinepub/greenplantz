# Specification

## Summary
**Goal:** Fix Platform Admin access so specified principals are recognized as admins, and ensure the platform-admin allowlist persists across canister upgrades.

**Planned changes:**
- Bootstrap the specified Internet Identity principals into the platform-admin allowlist during canister initialization and after upgrades (post-upgrade).
- Persist AccessControl / platform-admin allowlist state across upgrades so existing admin grants/revocations are not lost.
- Add a safe, conditional Motoko migration (if required by the persistence change) to preserve existing app data and initialize any new stable fields without trapping.

**User-visible outcome:** The specified principals can access the Team/Admin portal as Platform Admins (redirecting to `/admin/nurseries` instead of showing Access Denied), and admin access remains intact after redeployments/upgrades.
