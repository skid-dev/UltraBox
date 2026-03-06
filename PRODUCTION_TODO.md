# UltraBox production readiness checklist

This checklist is tailored to the current codebase and focuses on the high-impact work needed before publishing to the Chrome Web Store.

## 1) Permissions, privacy, and security (critical)

- [ ] **Reduce host permissions**: replace `<all_urls>` with explicit SchoolBox and Box of Books domains where possible.
- [ ] **Narrow extension permissions** to only what is required for each feature and document why each one is needed.
- [ ] **Limit web-accessible resources** match patterns away from `<all_urls>` and scope them to required domains.
- [ ] **Add a user-facing Privacy Policy** that clearly explains what is stored (`settings`, feed items, recents) and where.
- [ ] **Add data retention controls** for recents/feed cache (max age, max entries, clear controls).
- [ ] **Add threat-model checks** for RSS and page-scraped content before rendering.

## 2) Identity and release metadata (critical)

- [ ] **Unify extension branding and naming** across manifest, package metadata, and README.
- [ ] **Adopt semantic versioning** and automate version bumps for each release.
- [ ] **Add complete Chrome Web Store listing assets**: icons, screenshots, promo art, short/long descriptions.
- [ ] **Set publisher metadata** (`author`, support URL, homepage, issue tracker) in package/repo docs.

## 3) Reliability and robustness

- [ ] **Harden initialization defaults** so all feature flags are always initialized.
- [ ] **Add runtime schema validation** for settings read from storage and migration logic for older versions.
- [ ] **Protect against malformed/empty settings inputs** (invalid URLs, blank domains, malformed RSS).
- [ ] **Improve background event filtering** to avoid unnecessary work on every tab update.
- [ ] **Implement retry/backoff and stale-data handling** for feed fetch failures.
- [ ] **Add graceful error UI states** in popup/content modules (empty, offline, failed indexing).

## 4) Performance and UX quality

- [ ] **Add feature-level loading indicators** for launcher, feed sync, and textbook indexing.
- [ ] **Debounce expensive operations** triggered by input or tab events.
- [ ] **Add telemetry hooks (privacy-preserving, opt-in)** for feature health and failures.
- [ ] **Establish UX polish pass**: accessibility contrast, keyboard navigation, and reduced-motion support.
- [ ] **Promote dark theme from beta** only after complete coverage and regression checks.

## 5) Engineering quality gates

- [ ] **Add linting and formatting checks in CI** (ESLint + Prettier check mode).
- [ ] **Add TypeScript strictness improvements** and reduce broad `any` usage.
- [ ] **Add unit tests** for URL/domain extraction, feed parsing, and storage helpers.
- [ ] **Add integration/e2e tests** for popup settings save/load and content injection behavior.
- [ ] **Add pull-request quality gates** (test pass, build pass, lint pass).
- [ ] **Add release checklist** with manual QA smoke tests across target domains.

## 6) Product features to add before production launch

- [ ] **Auto-detect RSS feed URL** for supported SchoolBox deployments (with manual override fallback).
- [ ] **Recents module UX** in popup: view/search/clear recents and period grouping controls.
- [ ] **Per-feature toggles with dependency hints** (show why a feature is disabled/misconfigured).
- [ ] **Import/export settings** for easier setup across devices.
- [ ] **First-run onboarding** to guide domain + RSS setup and verify connectivity.
- [ ] **In-extension diagnostics page** that surfaces current settings, permissions, and last sync result.

## 7) Documentation and support

- [ ] **Expand README** with architecture overview (background/content/popup responsibilities).
- [ ] **Add CONTRIBUTING.md** with setup, scripts, coding conventions, and testing expectations.
- [ ] **Add SECURITY.md** with disclosure/contact process.
- [ ] **Add CHANGELOG.md** and keep it updated per release.
- [ ] **Add support workflow** (issue templates, bug report fields, reproduction checklist).

## Suggested implementation order

1. Permissions/privacy + metadata.
2. Settings validation/migration + runtime robustness.
3. CI quality gates + tests.
4. Missing production features (RSS auto-detect, recents UX, onboarding).
5. Final Web Store packaging, screenshots, and release QA.
