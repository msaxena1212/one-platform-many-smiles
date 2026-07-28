# Release Notes - 2026-07-28

## Summary

- Standardized status casing across migration scripts so enum values remain internally consistent.
- Updated documentation comments to reflect the normalized status naming.
- Preserved the existing API/storage key `pending_landlord_signature`; no breaking changes were introduced.

## Validation Notes

- Production build completed successfully with `npm run build`.
- The production output still contains the exact UI label `Pending Landlord Signature`.
- `npm test` is not currently available because the project does not define a `test` script.
- `npx tsc --noEmit` is now documented in CI, but it currently fails on pre-existing TypeScript issues outside this release-note change set.
