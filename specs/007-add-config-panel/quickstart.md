# Quickstart: Configuration Panel

## Manual Verification

1. Start the frontend development server.
2. Open the map with no stored callsign.
3. Verify the configuration panel appears instead of the old callsign prompt.
4. Close the panel and verify the bottom-left cog button can reopen it.
5. Enter a valid 4-digit MGRS value and save.
6. Reopen the panel, enter a valid 6-digit MGRS value, and save.
7. Reopen the panel, enter an invalid MGRS value, and verify saving is blocked with a clear error.
8. Select one band and verify visible WSPR paths are limited to that band.
9. Select multiple bands and verify visible WSPR paths include any selected band and exclude others.
10. Select Mixed for bands and verify all WSPR paths are visible again.
11. Select one or more modes other than WSPR and verify current WSPR paths are not hidden by mode choice.
12. Check desktop and mobile-sized viewports to verify the cog button, panel, save action, and close action remain usable.

## Automated Verification

Run the frontend quality gates from `frontend/`:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run test:e2e
npm run build
```

Backend checks are not required for this feature unless implementation changes backend files.
