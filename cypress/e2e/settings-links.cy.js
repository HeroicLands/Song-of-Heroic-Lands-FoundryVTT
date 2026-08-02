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
 * The branded "Game System" section injected into the Game Settings sidebar
 * tab by the `renderSettings` hook (issue #915). Unit tests cover the pure
 * builder + template HTML; this proves the hook injects the branded section
 * into the live tab, sources its links from `system.json` `flags.sohl`, removes
 * Foundry's native system row, and survives re-render without duplicating.
 */

const EXPECTED_LABELS = [
    "Main Site",
    "Knowledgebase",
    "API Docs",
    "Issues",
    "Discord",
];

/** Read back the injected branded section from the live Settings sidebar tab. */
function readGameSystemSection(win) {
    const settings = win.ui.settings;
    const el = settings?.element;
    const section = el?.querySelector("[data-sohl-links]");
    if (!section) return null;
    const anchors = [...section.querySelectorAll("a")];
    return {
        count: el.querySelectorAll("[data-sohl-links]").length,
        classes: section.getAttribute("class"),
        title: section.querySelector("h4.divider")?.textContent?.trim(),
        emblemSrc: section
            .querySelector("img.sohl-game-system__emblem")
            ?.getAttribute("src"),
        version: section
            .querySelector(".sohl-game-system__version")
            ?.textContent?.trim(),
        links: anchors.map((a) => ({
            label: a.textContent.trim(),
            href: a.getAttribute("href"),
            target: a.getAttribute("target"),
            rel: a.getAttribute("rel"),
        })),
        // Foundry's native system-info row (title + version) should be gone.
        nativeSystemRow: !!el.querySelector("section.info .system"),
    };
}

describe("settings sidebar — branded Game System section", () => {
    before(() => cy.login());

    beforeEach(() => {
        cy.foundry((win) => win.ui.settings.render({ force: true }));
        // The section is injected asynchronously by the render hook — wait for it.
        cy.window().should((win) => {
            const el = win.ui.settings.element;
            expect(el?.querySelector("[data-sohl-links]"), "section").to.exist;
        });
    });

    it("injects the branded section with emblem, version, and inline links", () => {
        cy.foundry((win) => {
            const s = readGameSystemSection(win);
            const flags = win.game.system.flags.sohl;
            return { s, flags, version: win.game.system.version };
        }).should(({ s, flags, version }) => {
            expect(s.title).to.eq("Song of Heroic Lands");
            expect(s.classes).to.contain("sohl-game-system");
            // Branding: the coiled-dragon emblem and the running version.
            expect(s.emblemSrc).to.contain(
                "assets/icons/brand/sohl-dragon.svg",
            );
            expect(s.version).to.eq(version);
            // Inline links (plain anchors, not full-width buttons).
            expect(s.links.map((l) => l.label)).to.deep.eq(EXPECTED_LABELS);
            expect(s.links.map((l) => l.href)).to.deep.eq([
                flags.mainSiteUrl,
                flags.knowledgeBaseUrl,
                flags.apiDocsUrl,
                flags.issuesUrl,
                flags.discordInviteUrl,
            ]);
            // API link targets this exact version's docs, not /latest.
            expect(flags.apiDocsUrl).to.eq(
                `https://api.heroiclands.org/v${version}`,
            );
            s.links.forEach((l) => {
                expect(l.target).to.eq("_blank");
                expect(l.rel).to.contain("noopener");
            });
        });
    });

    it("removes Foundry's redundant native system row", () => {
        cy.foundry(readGameSystemSection).should((s) => {
            expect(s.nativeSystemRow, "native system row present").to.be.false;
        });
    });

    it("injects exactly one section even across re-renders", () => {
        cy.foundry((win) => win.ui.settings.render({ force: true }));
        cy.window().should((win) => {
            const s = readGameSystemSection(win);
            expect(s, "section present after re-render").to.not.be.null;
            expect(s.count, "single section").to.eq(1);
        });
    });
});
