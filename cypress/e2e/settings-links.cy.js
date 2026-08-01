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
 * The "Song of Heroic Lands" links section injected into the Game Settings
 * sidebar tab by the `renderSettings` hook. Unit tests cover the pure link
 * table + template HTML; this proves the hook actually injects the section into
 * the live settings tab and that it survives re-render without duplicating.
 */

const EXPECTED = [
    { label: "Main Site", href: "https://www.heroiclands.org/" },
    { label: "Knowledgebase", href: "https://kb.heroiclands.org/" },
    { label: "API Documentation", href: "https://api.heroiclands.org/latest" },
];

/** Read back the injected links section from the live Settings sidebar tab. */
function readLinksSection(win) {
    const settings = win.ui.settings;
    const section = settings?.element?.querySelector("[data-sohl-links]");
    if (!section) return null;
    const anchors = [...section.querySelectorAll("a.button")];
    return {
        count: settings.element.querySelectorAll("[data-sohl-links]").length,
        classes: section.getAttribute("class"),
        title: section.querySelector("h4.divider")?.textContent?.trim(),
        links: anchors.map((a) => ({
            label: a.textContent.trim(),
            href: a.getAttribute("href"),
            target: a.getAttribute("target"),
            rel: a.getAttribute("rel"),
        })),
    };
}

describe("settings sidebar — Song of Heroic Lands links", () => {
    before(() => cy.login());

    beforeEach(() => {
        cy.foundry((win) => win.ui.settings.render({ force: true }));
        // The section is injected asynchronously by the render hook — wait for it.
        cy.window().should((win) => {
            const el = win.ui.settings.element;
            expect(el?.querySelector("[data-sohl-links]"), "links section").to
                .exist;
        });
    });

    it("injects a native-styled section with the three project links", () => {
        cy.foundry(readLinksSection).should((s) => {
            expect(s.title).to.eq("Song of Heroic Lands");
            // Reuses core's Documentation-block classes → native styling.
            expect(s.classes).to.contain("documentation");
            expect(s.classes).to.contain("flexcol");
            expect(s.links.map((l) => l.label)).to.deep.eq(
                EXPECTED.map((e) => e.label),
            );
            expect(s.links.map((l) => l.href)).to.deep.eq(
                EXPECTED.map((e) => e.href),
            );
            s.links.forEach((l) => {
                expect(l.target).to.eq("_blank");
                expect(l.rel).to.contain("noopener");
            });
        });
    });

    it("injects exactly one section even across re-renders", () => {
        cy.foundry((win) => win.ui.settings.render({ force: true }));
        cy.window().should((win) => {
            const s = readLinksSection(win);
            expect(s, "section present after re-render").to.not.be.null;
            expect(s.count, "single section").to.eq(1);
        });
    });
});
