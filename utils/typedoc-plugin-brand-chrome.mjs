/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { JSX } from "typedoc";

/**
 * TypeDoc plugin: wrap the API site in the shared Heroic Lands brand chrome.
 *
 * api.heroiclands.org, www.heroiclands.org, and kb.heroiclands.org are meant to
 * read as one property. www and the KB share `HeroicLands/heroiclands-hugo-theme`;
 * this plugin brings the generated API docs into the same look without a bespoke
 * TypeDoc theme, by injecting the theme's masthead, footer, palette, and fonts
 * through the renderer's page hooks:
 *
 * - `head.end` — the shared web fonts (Cinzel / Lora / JetBrains Mono) and a
 *   scoped stylesheet. Rather than importing www's full `style.css` (which would
 *   collide with TypeDoc's own element rules), it (a) overrides TypeDoc's
 *   `--{light,dark}-color-*` **source** variables with the brand palette so the
 *   generated content recolors through TypeDoc's own cascade in either theme, and
 *   (b) carries only the `.site-header` / `.site-footer` component rules copied
 *   from the theme.
 * - `body.begin` — the static masthead (logo + nav), with **absolute** www URLs so
 *   cross-domain navigation works, mirroring the KB's cross-domain nav.
 * - `body.end` — the static footer and the mobile nav-toggle script.
 *
 * The nav mirrors the theme's `menu.main`; keep it in sync when the theme menu
 * changes. Not invoked directly — loaded by TypeDoc via the `plugin` array in
 * typedoc-html.json.
 *
 * @param {import("typedoc").Application} app
 */
export function load(app) {
    const raw = (html) => JSX.createElement(JSX.Raw, { html });

    app.renderer.hooks.on("head.end", () => raw(HEAD_HTML));
    app.renderer.hooks.on("body.begin", () => raw(HEADER_HTML));
    app.renderer.hooks.on("body.end", () =>
        raw(FOOTER_HTML + NAV_TOGGLE_SCRIPT),
    );
}

const WWW = "https://www.heroiclands.org";
const CDN = "https://cdn.heroiclands.org";

/** Fonts + the scoped brand stylesheet, injected at the end of `<head>`. */
const HEAD_HTML = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap" rel="stylesheet">
<style id="hl-brand-chrome">
:root {
  /* Brand palette (shared with the Hugo theme). */
  --hl-bg:            #0f1923;
  --hl-bg-deeper:     #0a1219;
  --hl-bg-card:       #15202d;
  --hl-surface:       #1c2b3a;
  --hl-border:        #2a3d52;
  --hl-border-light:  #354d66;
  --hl-text:          #c8d6e0;
  --hl-text-muted:    #7e96aa;
  --hl-accent:        #3b8eea;
  --hl-accent-hover:  #5aa3f0;
  --hl-gold:          #c9a84c;
  --hl-font-display:  'Cinzel', 'Georgia', serif;
  --hl-font-body:     'Lora', 'Georgia', serif;
  --hl-font-mono:     'JetBrains Mono', monospace;

  /* Recolor TypeDoc through its own cascade: override the source variables for
     BOTH themes so the brand look holds regardless of the light/dark toggle. */
  --light-color-scheme: dark;
  --dark-color-scheme: dark;
  --light-color-background: var(--hl-bg);
  --dark-color-background: var(--hl-bg);
  --light-color-background-secondary: var(--hl-bg-card);
  --dark-color-background-secondary: var(--hl-bg-card);
  --light-color-background-navbar: var(--hl-bg-deeper);
  --dark-color-background-navbar: var(--hl-bg-deeper);
  --light-color-text: var(--hl-text);
  --dark-color-text: var(--hl-text);
  --light-color-text-aside: var(--hl-text-muted);
  --dark-color-text-aside: var(--hl-text-muted);
  --light-color-link: var(--hl-accent);
  --dark-color-link: var(--hl-accent);
  --light-color-accent: var(--hl-border);
  --dark-color-accent: var(--hl-border);
  --light-color-active-menu-item: var(--hl-surface);
  --dark-color-active-menu-item: var(--hl-surface);
  --light-color-icon-background: var(--hl-bg-card);
  --dark-color-icon-background: var(--hl-bg-card);
  --light-color-focus-outline: var(--hl-accent);
  --dark-color-focus-outline: var(--hl-accent);
}

/* Brand typography over TypeDoc's content. */
body { font-family: var(--hl-font-body); }
h1, h2, h3, h4,
.tsd-page-title h1,
.tsd-typography h1, .tsd-typography h2, .tsd-typography h3, .tsd-typography h4 {
  font-family: var(--hl-font-display);
  letter-spacing: 0.01em;
}
code, pre, kbd, .tsd-signature, .tsd-signatures { font-family: var(--hl-font-mono); }

/* ---- Masthead (from the shared theme, brand-scoped) ---- */
.site-header {
  border-bottom: 1px solid var(--hl-border);
  background: var(--hl-bg-deeper);
}
.site-header .header-inner {
  margin: 0 auto;
  padding: 1.25rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.site-header .site-title { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
.site-header .site-logo { width: 44px; height: 44px; border-radius: 50%; }
.site-header .title-main {
  font-family: var(--hl-font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--hl-text);
  letter-spacing: 0.02em;
}
.site-header .site-nav { display: flex; gap: 2rem; align-items: center; }
.site-header .nav-link {
  font-family: var(--hl-font-display);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--hl-text-muted);
  letter-spacing: 0.02em;
  padding: 0.25rem 0;
  border-bottom: 2px solid transparent;
  text-decoration: none;
  transition: color 0.2s, border-color 0.2s;
}
.site-header .nav-link:hover, .site-header .nav-link.active {
  color: var(--hl-text);
  border-bottom-color: var(--hl-accent);
}
.site-header .nav-dropdown { position: relative; }
.site-header .dropdown-arrow { margin-left: 0.3rem; transition: transform 0.2s; }
.site-header .nav-dropdown:hover .dropdown-arrow { transform: rotate(180deg); }
.site-header .dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 220px;
  background: var(--hl-bg-deeper);
  border: 1px solid var(--hl-border);
  border-radius: 4px;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
.site-header .nav-dropdown:hover .dropdown-menu { display: block; }
/* Bridge the margin-top gap between the trigger and the menu so the pointer
   stays within .nav-dropdown while travelling to it (otherwise :hover drops in
   the gap and the menu closes before an item can be clicked). */
.site-header .dropdown-menu::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  height: 0.5rem;
}
.site-header .dropdown-item {
  display: block;
  padding: 0.5rem 1.25rem;
  font-family: var(--hl-font-display);
  font-size: 0.95rem;
  color: var(--hl-text-muted);
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
}
.site-header .dropdown-item:hover { color: var(--hl-text); background: var(--hl-surface); }
.site-header .nav-toggle {
  display: none;
  background: none; border: none; cursor: pointer;
  padding: 0.5rem; flex-direction: column; gap: 5px;
}
.site-header .nav-toggle span {
  display: block; width: 24px; height: 2px;
  background: var(--hl-text-muted);
  transition: transform 0.3s, opacity 0.3s;
}
.site-header .nav-toggle.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.site-header .nav-toggle.open span:nth-child(2) { opacity: 0; }
.site-header .nav-toggle.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ---- Footer (from the shared theme, brand-scoped) ---- */
.site-footer {
  border-top: 1px solid var(--hl-border-light);
  background: var(--hl-bg-deeper);
}
.site-footer .footer-inner {
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.25rem;
}
.site-footer .footer-text { color: var(--hl-text-muted); font-size: 0.92rem; line-height: 1.5; }
.site-footer .footer-text a { color: var(--hl-text); }
.site-footer .footer-text a:hover { color: var(--hl-accent); }
.site-footer .footer-links { display: flex; gap: 1.5rem; align-items: center; }
.site-footer .footer-links a {
  color: var(--hl-text-muted);
  font-size: 0.95rem;
  display: flex; align-items: center; gap: 0.5rem;
}
.site-footer .footer-links a:hover { color: var(--hl-accent); }
.site-footer .cc-badge { height: 1.75rem; }

@media (max-width: 768px) {
  .site-header .nav-toggle { display: flex; }
  .site-header .site-nav {
    display: none;
    position: absolute; top: 100%; left: 0; right: 0;
    background: var(--hl-bg-deeper);
    border-bottom: 1px solid var(--hl-border);
    flex-direction: column;
    padding: 1rem 2rem; gap: 0.5rem;
    z-index: 100;
  }
  .site-header .site-nav.open { display: flex; }
  .site-header .header-inner { position: relative; }
  .site-header .dropdown-menu { position: static; border: none; box-shadow: none; padding-left: 1rem; margin-top: 0; }
  .site-header .nav-dropdown:hover .dropdown-menu { display: none; }
  .site-header .site-nav.open .nav-dropdown .dropdown-menu { display: block; }
  .site-footer .footer-inner { flex-direction: column; text-align: center; }
}
</style>`;

/** The masthead. Nav mirrors the theme's `menu.main` (absolute www URLs). */
const HEADER_HTML = `
<header class="site-header">
  <div class="header-inner">
    <a href="${WWW}/" class="site-title">
      <img src="${CDN}/images/sohl-icon-white.webp" alt="Heroic Lands" class="site-logo">
      <span class="title-main">Heroic Lands</span>
    </a>
    <nav class="site-nav">
      <a href="${WWW}/" class="nav-link">Home</a>
      <a href="${WWW}/thalorna/world/thalorna/" class="nav-link">Thalorna</a>
      <a href="${WWW}/blog/" class="nav-link">Blog</a>
      <div class="nav-dropdown">
        <a href="${WWW}/projects/" class="nav-link active">
          Projects
          <svg class="dropdown-arrow" width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M1 1l4 4 4-4"/></svg>
        </a>
        <div class="dropdown-menu">
          <a href="${WWW}/projects/sohl/" class="dropdown-item">Song of Heroic Lands</a>
          <a href="${WWW}/projects/hm3/" class="dropdown-item">HârnMaster 3</a>
          <a href="${WWW}/projects/modules/" class="dropdown-item">Modules</a>
          <a href="https://api.heroiclands.org/" class="dropdown-item">API Documentation</a>
          <a href="https://kb.heroiclands.org/" class="dropdown-item">KnowledgeBase</a>
        </div>
      </div>
      <a href="${WWW}/license/" class="nav-link">License</a>
    </nav>
    <button class="nav-toggle" aria-label="Toggle navigation">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>`;

const FOOTER_HTML = `
<footer class="site-footer">
  <div class="footer-inner">
    <p class="footer-text">
      &copy; 2020&ndash;${new Date().getFullYear()} Tom Rodriguez. Content under The World of Thalorna and Song of Heroic Lands is licensed under
      <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>; all other content is &copy; Tom Rodriguez, all rights reserved. See
      <a href="${WWW}/license/">License</a>.
    </p>
    <div class="footer-links">
      <a href="https://creativecommons.org/licenses/by-sa/4.0/">
        <img src="https://licensebuttons.net/l/by-sa/4.0/88x31.png" alt="CC BY-SA 4.0" class="cc-badge">
      </a>
      <a href="https://discord.gg/EwMfkNd3az">Discord</a>
    </div>
  </div>
</footer>`;

const NAV_TOGGLE_SCRIPT = `
<script>
document.querySelector('.site-header .nav-toggle')?.addEventListener('click', function () {
  document.querySelector('.site-header .site-nav')?.classList.toggle('open');
  this.classList.toggle('open');
});
</script>`;
