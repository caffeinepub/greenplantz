# Specification

## Summary
**Goal:** Allow existing platform admins to grant/revoke platform admin access by Internet Identity Principal, and make it easy for users to copy their own Principal ID for allowlisting.

**Planned changes:**
- Show the currently authenticated Internet Identity Principal ID (English label) on `/portal/team` in a readable/copyable format.
- Show the currently authenticated Internet Identity Principal ID on the admin access-denied screen (English label) when a signed-in user is not a platform admin.
- Add admin-only backend APIs to add/remove platform admin Principals, with persistent storage across upgrades.
- Add a platform-admin-only UI screen to manage platform admins by Principal ID (add/remove with confirmation) wired to the new backend APIs.

**User-visible outcome:** Users can see and copy their Principal ID from the Team Portal and access-denied screens, and platform admins can add/remove platform admin access for specific Principal IDs via a dedicated admin UI.
