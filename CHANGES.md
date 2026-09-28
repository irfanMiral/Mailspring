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
- **GPU flags on the Linux launcher** — `Mailspring.desktop.in`'s `Exec` lines
  now pass `--ignore-gpu-blocklist --enable-gpu-rasterization
  --enable-zero-copy`. Chromium's built-in GPU blocklist disables
  acceleration on some driver/kernel combinations even when the underlying
  hardware and Mesa driver work fine (verified locally against an Intel HD
  5600/Broadwell iGPU with working direct rendering).

## Known limitation: Linux tray context menu / click-to-restore

On at least KDE Plasma (X11), the tray icon appears but right-click (context
menu) and left-click (restore window) do nothing. This is **not** a bug in
this fork or introduced by any change here — verified by introspecting the
D-Bus object Electron registers for the tray:

```
$ gdbus introspect --dest org.freedesktop.StatusNotifierItem-<pid>-1 --object-path / --recurse
node /StatusNotifierItem { };        # no org.kde.StatusNotifierItem interface
node /org/chromium/DbusMenu { };     # no dbusmenu interface either
```

The item registers with the watcher and the icon renders, but Electron never
populates the D-Bus interfaces the host needs to call `Activate` (click) or
`ContextMenu`/read the `Menu` property (right-click) — both silently fail
with nothing to call. This matches upstream
[electron/electron#54181](https://github.com/electron/electron/issues/54181)
("hollow StatusNotifierItem"), caused by a Chromium D-Bus multiplexer
refactor. Confirmed present, with identical hollow introspection output,
across Electron 42, 43.6.0, this fork's pinned 44.3.0, and the latest stable
44.4.5 as of testing — there is currently no released Electron version that
fixes it. No workaround is available at the application level; this will
need to be revisited once upstream Electron/Chromium fixes it.

## Maintenance

This fork is periodically rebased onto upstream `master` to pick up new
features and bug fixes, then the changes above are reapplied. If you're
maintaining your own downstream copy, `git fetch upstream && git rebase
upstream/master` (with `upstream` pointing at `Foundry376/Mailspring`) is the
intended workflow — the change set above is small enough that conflicts are
usually limited to `config.json`, `error-logger.js`, and
`autoupdate-manager.ts`.
