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

/**
 * Icon rendering. SoHL draws its icons from two families: Font Awesome (the
 * Free subset, so no Pro kit is required) and the bundled game-icons.net
 * webfont exposed as `ginf-*` classes.
 *
 * A wrong class name, a missing font, or a cascade clash all fail the same
 * silent way — the glyph renders as nothing (or tofu) while the DOM still looks
 * correct — so this spec asserts the *resolved* `::before` of each icon rather
 * than the class string. In particular a `ginf-*` element must resolve to the
 * "game-icons.net" family: combining it with `fa-solid` lets Font Awesome's
 * `content: var(--fa)` win by cascade order and blanks the glyph.
 *
 * It also captures screenshots of the sheets, tab strip, and context menus for
 * visual review, since a glyph that resolves is not necessarily the *right*
 * glyph.
 */

/** Read the resolved ::before of an element, in the game window's realm. */
function beforeOf(win, el) {
    const cs = win.getComputedStyle(el, "::before");
    return {
        content: cs.content,
        family: cs.fontFamily,
        cls: el.className,
    };
}

/**
 * FA class tokens that only style an icon (they never carry a glyph of their
 * own), plus Foundry's own `window-icon` placeholder. An element bearing only
 * these is not an icon and has nothing to resolve.
 */
const FA_UTILITY =
    /^fa-(solid|regular|light|thin|duotone|sharp|brands|classic|fw|lg|xl|xs|sm|2xs|2xl|\d+x|spin|pulse|border|beat|fade|shake|bounce|flip|inverse|stack|ul|li|width-\w+|rotate-\w+)$/;

/** Does this element actually name an icon (not just style tokens)? */
function namesAnIcon(cls) {
    return String(cls)
        .split(/\s+/)
        .some((t) => t.startsWith("ginf-") || (t.startsWith("fa-") && !FA_UTILITY.test(t)));
}

/** Every icon glyph must resolve to a real, non-empty ::before. */
function assertGlyphsRender(win, root, label) {
    const nodes = [...root.querySelectorAll('i[class*="ginf-"], i[class*="fa-"]')];
    const broken = [];
    for (const el of nodes) {
        const { content, family, cls } = beforeOf(win, el);
        // Skip style-only elements and anything not actually rendered.
        if (!namesAnIcon(cls)) continue;
        if (el.offsetParent === null && win.getComputedStyle(el).display === "none") continue;
        const isGinf = /(^|\s)ginf-/.test(cls);
        // An unresolved glyph is "none" / "normal" / empty.
        const empty = !content || content === "none" || content === "normal" || content === '""';
        if (empty) broken.push(`${label}: EMPTY glyph on "${cls}"`);
        if (isGinf) {
            if (!/game-icons/.test(family))
                broken.push(`${label}: "${cls}" resolved to ${family}, not game-icons.net`);
            if (/\bfa-(solid|regular|duotone)\b|\bfas\b|\bfar\b/.test(cls))
                broken.push(`${label}: "${cls}" mixes an FA style prefix with ginf-`);
        }
    }
    return broken;
}

describe("icon rendering — Font Awesome Free + game-icons webfont", () => {
    const problems = [];

    before(() => cy.login().then(() => cy.cleanupWorld()));
    // Each test opens a sheet; leaving prior sheets open makes `section.tab[...]`
    // match a stale sheet and silently drives the wrong window.
    beforeEach(() => cy.closeAllSheets());
    after(() => {
        cy.cleanupWorld();
        cy.then(() => {
            if (problems.length) throw new Error(problems.join("\n"));
        });
    });

    it("renders the game-icons webfont at all (font is loaded and mapped)", () => {
        cy.foundry((win) => {
            const probe = win.document.createElement("i");
            probe.className = "ginf-crossed-swords";
            win.document.body.appendChild(probe);
            const cs = win.getComputedStyle(probe, "::before");
            const out = { content: cs.content, family: cs.fontFamily };
            probe.remove();
            return out;
        }).then((r) => {
            expect(r.family, "ginf- resolves to the game-icons family").to.match(/game-icons/);
            expect(r.content, "ginf-crossed-swords has a glyph").to.not.be.oneOf([
                "none",
                "normal",
                "",
                '""',
            ]);
        });
    });

    it("renders every Being-sheet tab icon, and screenshots each tab", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);

            // The tab strip carries ginf-skills, ginf-broadsword and
            // ginf-sparkles alongside FA icons — capture it on its own. Scope to
            // the sheet: a bare `nav.tabs` also matches Foundry's sidebar.
            cy.get(".application")
                .filter(":visible")
                .find("nav.tabs, .sheet-tabs")
                .first()
                .screenshot("01-being-tab-strip");

            const tabs = ["profile", "skills", "combat", "trauma", "mysteries", "gear", "actions"];
            tabs.forEach((tab, i) => {
                cy.switchTab(tab, "primary");
                // switchTab resolves before the DOM swaps; wait for the target
                // tab to actually be active or the screenshot shows the old one.
                cy.get(`section.tab[data-tab="${tab}"]`).should("have.class", "active");
                cy.screenshot(`02-being-tab-${String(i + 1).padStart(2, "0")}-${tab}`);
            });

            cy.foundry((win) => {
                const root = win.document.querySelector(".sohl.actor, .application");
                return root ? assertGlyphsRender(win, root, "being-sheet") : [];
            }).then((b) => problems.push(...b));
        });
    });

    it("renders skill action icons in the context menu, and screenshots it", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.switchTab("skills", "primary");

            cy.get('section.tab[data-tab="skills"] .item-contextmenu').first().click();

            cy.get("#context-menu").should("be.visible");
            cy.screenshot("03-skill-context-menu");
            cy.get("#context-menu").screenshot("04-skill-context-menu-closeup");

            cy.foundry((win) => {
                const menu = win.document.querySelector("#context-menu");
                return menu ? assertGlyphsRender(win, menu, "skill-context-menu") : [];
            }).then((b) => problems.push(...b));

            cy.get("body").type("{esc}");
        });
    });

    it("renders combat + trauma action icons in their context menus", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "affliction", { name: "Icon Affliction" });
            cy.createItemOn(actor, "trauma", { name: "Icon Trauma" });
            cy.openSheet(actor);

            // Combat: attackTest (ginf-broadsword) + opposedTestStart
            // (fa-arrows-to-dot) hang off combat entries.
            cy.switchTab("combat", "primary");
            cy.get('section.tab[data-tab="combat"]').should("have.class", "active");
            cy.get("body").then(($b) => {
                const sel = 'section.tab[data-tab="combat"] .item-contextmenu';
                if ($b.find(sel).length) {
                    // The row's ⋮ is revealed on hover, so force the click.
                    cy.get(sel).first().click({ force: true });
                    cy.get("#context-menu").should("be.visible");
                    cy.screenshot("08-combat-context-menu");
                    cy.foundry((win) => {
                        const m = win.document.querySelector("#context-menu");
                        return m ? assertGlyphsRender(win, m, "combat-menu") : [];
                    }).then((b) => problems.push(...b));
                    cy.get("body").type("{esc}");
                }
            });

            // Trauma: courseCheck (ginf-heart-beats); afflictions carry
            // contractTest (fa-virus), fatigueTest (fa-face-tired) and
            // fearTest (ginf-screaming).
            cy.switchTab("trauma", "primary");
            cy.get('section.tab[data-tab="trauma"]').should("have.class", "active");
            cy.screenshot("09-being-trauma-populated");
            cy.get("body").then(($b) => {
                const sel = 'section.tab[data-tab="trauma"] .item-contextmenu';
                const n = $b.find(sel).length;
                for (let k = 0; k < Math.min(n, 2); k++) {
                    cy.get(sel).eq(k).click({ force: true });
                    cy.get("#context-menu").should("be.visible");
                    cy.screenshot(`10-trauma-context-menu-${k + 1}`);
                    cy.foundry((win) => {
                        const m = win.document.querySelector("#context-menu");
                        return m ? assertGlyphsRender(win, m, "trauma-menu") : [];
                    }).then((b) => problems.push(...b));
                    cy.get("body").type("{esc}");
                }
            });
        });
    });

    it("renders gear + container icons, and screenshots the gear tab", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "containergear", { name: "Backpack" });
            cy.createItemOn(actor, "concoctiongear", {
                name: "Healing Draught",
            });
            cy.createItemOn(actor, "projectilegear", { name: "Arrows" });
            cy.openSheet(actor);
            cy.switchTab("gear", "primary");
            cy.get('section.tab[data-tab="gear"]').should("have.class", "active");
            cy.screenshot("05-being-gear-with-items");

            cy.get('section.tab[data-tab="gear"] .item-contextmenu').first().click();
            cy.get("#context-menu").should("be.visible");
            cy.screenshot("06-gear-context-menu");
            cy.get("body").type("{esc}");
        });
    });

    /**
     * Every icon that replaced a Font Awesome **Pro** glyph, rendered together
     * for review. Several of these (the vehicle actor icon, the ActiveEffect
     * typeIcon, the region-trigger icon) have no convenient in-sheet surface, so
     * this board is the only place they can be eyeballed side by side.
     */
    it("renders a reference board of every replaced icon", () => {
        const REPLACED = [
            ["fa-sword", "ginf-broadsword", "weapongear · attackTest · Combat tab"],
            ["fa-swords", "ginf-crossed-swords", "Combat doc · startAutomatedAttack"],
            ["fa-bow-arrow", "ginf-bow-arrow", "projectilegear · missile tests"],
            ["fa-aura", "ginf-aura", "ActiveEffect typeIcon"],
            ["fa-sparkles", "ginf-sparkles", "mystery · Mysteries tab"],
            ["fa-wagon-covered", "ginf-old-wagon", "vehicle actor"],
            ["fa-head-side-gear", "ginf-skills", "skill · Skills tab"],
            ["fa-ball-pile", "ginf-stockpiles", "miscgear"],
            ["fa-sack", "ginf-chest", "containergear"],
            ["fa-sack", "ginf-knapsack", "toggleCarried"],
            ["fa-wave-pulse", "ginf-heart-beats", "courseCheck"],
            ["fa-face-scream", "ginf-screaming", "fearTest"],
            ["fa-face-eyes-xmarks", "ginf-knockout", "shockTest"],
            ["fa-bullseye-arrow", "fa-solid fa-bullseye", "successTest · calcImpact"],
            ["fa-arrow-down-…-to-center", "fa-solid fa-arrows-to-dot", "opposedTestStart"],
            ["fa-message-lines", "fa-solid fa-message", "outputDescription"],
            ["fa-diamond-exclamation", "fa-solid fa-triangle-exclamation", "region trigger"],
            ["fa-file-plus", "fa-solid fa-file-circle-plus", "Add … buttons"],
            ["fa-face-downcast-sweat", "fa-solid fa-face-tired", "fatigueTest"],
            ["fa-face-vomit", "fa-solid fa-virus", "contractTest · contractDisease"],
            ["fa-face-nauseated", "fa-solid fa-disease", "affliction type"],
            ["fa-stars", "fa-solid fa-ranking-star", "successValueTest"],
            ["fa-flask-round-potion", "fa-solid fa-bottle-droplet", "concoctiongear"],
        ];
        cy.foundry((win) => {
            const rows = REPLACED;
            win.document.getElementById("__iconboard")?.remove();
            const box = win.document.createElement("div");
            box.id = "__iconboard";
            box.style.cssText = [
                "position:fixed",
                "inset:0",
                "z-index:100000",
                "background:#efe9d8",
                "color:#1d1a14",
                "font:14px/1.4 system-ui,sans-serif",
                "padding:24px 28px",
                "overflow:auto",
                "display:grid",
                "grid-template-columns:repeat(2,1fr)",
                "gap:10px 28px",
                "align-content:start",
            ].join(";");
            const title = win.document.createElement("div");
            title.style.cssText =
                "grid-column:1/-1;font-size:19px;font-weight:700;margin-bottom:6px";
            title.textContent = "SoHL — Font Awesome Pro replacements (FA Free + game-icons)";
            box.appendChild(title);
            for (const [was, now, use] of rows) {
                const r = win.document.createElement("div");
                r.style.cssText =
                    "display:grid;grid-template-columns:34px 1fr;gap:12px;align-items:center;padding:5px 8px;background:#e6dfca;border-radius:5px";
                const i = win.document.createElement("i");
                i.className = now;
                i.style.cssText = "font-size:24px;text-align:center";
                const t = win.document.createElement("div");
                t.innerHTML =
                    `<div style="font-weight:600">${now}</div>` +
                    `<div style="opacity:.72;font-size:12px">was <s>${was}</s> — ${use}</div>`;
                r.append(i, t);
                box.appendChild(r);
            }
            win.document.body.appendChild(box);
            return rows.length;
        }).should("eq", REPLACED.length);

        cy.screenshot("00-icon-reference-board");

        cy.foundry((win) => {
            const b = win.document.getElementById("__iconboard");
            const out = assertGlyphsRender(win, b, "icon-board");
            b.remove();
            return out;
        }).then((b) => problems.push(...b));
    });

    it("renders item-type icons on their own sheets", () => {
        const kinds = [
            "skill",
            "concoctiongear",
            "projectilegear",
            "affliction",
            "trauma",
            "mystery",
        ];
        kinds.forEach((kind, i) => {
            cy.createWorldItem(kind, { name: `Icon ${kind}` }).then((item) => {
                cy.openSheet(item);
                cy.screenshot(`07-item-sheet-${String(i + 1).padStart(2, "0")}-${kind}`);
                cy.foundry((win) => {
                    const root = win.document.querySelector(".application.sheet");
                    return root ? assertGlyphsRender(win, root, `item-${kind}`) : [];
                }).then((b) => problems.push(...b));
                cy.closeAllSheets();
            });
        });
    });
});
