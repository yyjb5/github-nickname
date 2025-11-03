# GitHub User Notes — Tampermonkey userscript

This repository provides a small Tampermonkey userscript (TypeScript + esbuild) that helps GitHub organization and team maintainers attach local "remark" names to GitHub users. Use it to show readable aliases next to usernames across common GitHub pages (org members, teams, PRs, comments, settings/access, etc.).

Key features

- Show per-user remarks (badges) next to GitHub user links.
- Inline edit on page and a management panel for viewing/modifying all notes.
- CSV import / export for bulk operations.
- Simple multilingual UI (English / 中文) with a language selector.
- Stores notes locally in browser `localStorage` (no server required).

How it helps

If your org uses numeric IDs or people display names that are hard to read, this script lets maintainers attach friendly names (remarks) that are visible only to each browser. It's ideal for small teams who want consistent display names across PRs, member lists and settings pages.

Installation (for end users)

1. Install Tampermonkey in your browser.
2. Download the built userscript `dist/tampermonkey-userscript.user.js` from this repository (or install from a hosted raw URL / Release asset).
3. Open the script in Tampermonkey and enable it. It will run on GitHub pages matched by the metadata.

Quick usage

- Click the floating "Notes" button (bottom-right) to open the management panel.
- Add or edit a user's remark inline by clicking the badge next to a username on any supported page.
- Use the management panel to import/export CSV, add entries manually, delete entries, and switch language.

Developer / contributor notes

- Source files:

  - `src/metadata.user.js` — Tampermonkey metadata (edit @match/@name/@version before publishing).
  - `src/main.ts` — TypeScript source (userscript logic, DOM selectors, UI, i18n).
  - `scripts/build.mjs` — esbuild bundler that injects metadata and emits files under `dist/`.

- Build locally:

  ```pwsh
  pnpm install
  pnpm run build
  ```

- After building `dist/tampermonkey-userscript.user.js` you can load that file into Tampermonkey or publish it as a release asset.

Notes about storage and privacy

- Notes are stored locally in the browser's `localStorage` under the key `github_user_notes` and the selected language under `github_user_notes_lang`.
- This script does not transmit data to any server.

Extending

- Add or refine selectors in `src/main.ts` if GitHub DOM changes.
- Add more languages by extending the `I18N` map and the language selector.

If you'd like, I can help add CI steps to automatically build and attach `dist/` as a GitHub Release asset.
