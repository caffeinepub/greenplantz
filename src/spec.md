# Specification

## Summary
**Goal:** Ensure Team/Admin portal access remains reliable by persisting the backend platform-admin allowlist across canister upgrades and by bootstrapping initial platform-admin principals on deploy/upgrade.

**Planned changes:**
- Update `backend/main.mo` to store the platform-admin allowlist/authorization state in stable state and restore it correctly after upgrades so `isPlatformAdmin()` / `getCallerRole()` do not reset.
- Add backend initialization and post-upgrade bootstrapping so the specified Internet Identity principals are always included in the platform-admin allowlist without requiring any manual UI/API call.
- If a stable-state schema change is required, add a safe conditional Motoko migration (in `backend/migration.mo` only if needed) that preserves existing canister data and initializes any new authorization fields without trapping.

**User-visible outcome:** Admins keep access to the Team/Admin portal after upgrades, and the specified principals are recognized as platform admins immediately on fresh deploys and after upgrades without any manual recovery step.
