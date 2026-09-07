# Fork Changes

This file tracks the changes this fork carries on top of upstream
[Foundry376/Mailspring](https://github.com/Foundry376/Mailspring). Everything
else in the history comes straight from upstream and is not duplicated here —
see upstream's own release notes for that.

The original set of changes below was authored by
[1RandomDev](https://github.com/1RandomDev) in
[1RandomDev/Mailspring](https://github.com/1RandomDev/Mailspring). That fork
stopped tracking upstream in November 2024. This repository rebases the same
changes onto current upstream releases and keeps maintaining them.

## Changes carried forward

- **Configurable API server** — `serverUrls` in `app/dot-mailspring/config.json`
  lets Mailspring point at a self-hosted backend (e.g.
  [1RandomDev/mailspring-api](https://github.com/1RandomDev/mailspring-api))
  instead of `getmailspring.com`. Originally added across several commits;
  see [Configuring the API server](README.md#configuring-the-api-server) in
  the README.
- **Telemetry disabled** — Sentry/crash reporting is disabled in
  `app/src/error-logger.js`.
- **Auto-updater disabled** — `app/src/browser/autoupdate-manager.ts` no-ops
  `setupAutoUpdater()`, since this fork isn't distributed through Mailspring's
  update channel.

## Fork-specific changes

- **RPM packaging fix for RPM 6 / Fedora 44+** — newer `rpmbuild` always runs
  `%install` inside an implicit `%{name}-%{version}-build` directory, even
  without a `%prep` section, and re-creates that directory from scratch
  before `%install` runs. The spec previously relied on files being present
  in the working directory (via a separate copy step in `script/mkrpm`); it
  now references `Mailspring.desktop` and `mailspring.metainfo.xml` by
  absolute path instead. The build also disables the `check-rpaths` QA check,
  since the prebuilt `mailsync.bin` binary ships with build-machine RPATHs
  that this check otherwise flags as fatal.

## Maintenance

This fork is periodically rebased onto upstream `master` to pick up new
features and bug fixes, then the changes above are reapplied. If you're
maintaining your own downstream copy, `git fetch upstream && git rebase
upstream/master` (with `upstream` pointing at `Foundry376/Mailspring`) is the
intended workflow — the change set above is small enough that conflicts are
usually limited to `config.json`, `error-logger.js`, and
`autoupdate-manager.ts`.
