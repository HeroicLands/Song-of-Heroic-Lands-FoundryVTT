---
"sohl": patch
---

**Fix dark-mode visibility: editor text, context menus, and black SVG icons**

In dark mode several surfaces were unreadable. The Manuscript palette is
light-first with a dark token swap, and a few surfaces didn't consume the
adaptive tokens:

- **ProseMirror editor content** never set its own color, so typed text fell
  through to Foundry's editor default (dark) and vanished on the dark sheet. It
  now pins to `--sohl-color-text-primary`, following the theme like everything
  else (the toolbar was already themed).
- **Context menus** forced `text-inverse`, which is light in light mode but flips
  to near-black in dark mode — dark text on a dark menu. The menu now paints its
  own adaptive surface (background + foreground from SoHL tokens), legible in
  both themes.
- **Black-on-transparent icon SVGs** (the portrait and, critically, the Foundry
  compendium/directory thumbnails, which SoHL's scoped CSS cannot reach)
  disappeared on dark backgrounds. Icon SVGs are now themed at build time: a
  `<style>` carrying a `prefers-color-scheme` fill swap (ink → cream) is injected
  as the assets stage, so the adaptivity travels inside the file and reaches the
  compendium `<img>` thumbnails. Source SVGs stay black-on-transparent, so the
  knowledgebase and website are unaffected; only black / default-black shapes are
  recolored, and files with inline `fill` styles are left untouched.

Closes #893
