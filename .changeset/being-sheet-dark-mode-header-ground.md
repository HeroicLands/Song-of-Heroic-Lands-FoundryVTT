---
"sohl": patch
---

**Being sheet: fix dark-mode header/ground theming (#810)**

Three Manuscript theme-token regressions surfaced in dark mode (and, for two of
them, in light mode), fixed together:

- **The parchment ground now follows the theme.** `.window-content` (and the macro
  hotbar) painted a fixed light `parchment.jpg`, so in dark mode the token-colored
  surfaces (header band, portrait, editor) darkened while the ground stayed bright —
  dark panels floating on a light page. The single texture is now painted over the
  `--sohl-color-bg-sheet` token with `background-blend-mode: multiply`: light mode is
  unchanged (the near-white token leaves the texture as-is), and dark mode multiplies
  it down to a dark, subtly-grained vellum that darkens in lockstep with the palette.
- **The header name is legible in light mode.** As an `<h1>`, `.sheet-header__name`
  inherited Foundry's `--color-text-light-primary` — which `.sohl` remaps to
  `--sohl-color-text-inverse` (cream in light mode) — leaving the character name
  near-white and unreadable on the light vellum band. It is now pinned to
  `--sohl-color-text-primary`, so it reads dark in light and cream in dark like the
  rest of the sheet.
- **The rich-text editor toolbar follows the theme.** Foundry paints the ProseMirror
  menu bar with its fixed dark `--menu-background` (`--color-cool-4`, a plum
  near-black), so it stayed dark in both themes and clashed on the light vellum. The
  bar's background and its button icons now point at SoHL tokens
  (`--sohl-color-bg-stamp` / `--sohl-color-text-primary`), so the toolbar re-themes
  with the palette. This is shared by every ProseMirror editor, so each Item sheet's
  Description tab is retinted too.
