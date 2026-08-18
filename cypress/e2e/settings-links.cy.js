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
        // The Credits entry is a button, not an anchor — it opens a sheet in
        // the client rather than a browser tab (#1517).
        credits: (() => {
            const b = section.querySelector(
                'button[data-action="sohlOpenCredits"]',
            );
            if (!b) return null;
            const row = [...section.querySelectorAll("a, button")];
            return {
                label: b.textContent.trim(),
                type: b.getAttribute("type"),
                href: b.getAttribute("href"),
                // Position within the whole entry row, anchors included.
                index: row.indexOf(b),
                lastInRow: row.indexOf(b) === row.length - 1,
            };
        })(),
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
            // One unversioned tree of API documentation is published, for
            // the newest release (#1452), and it is served as part of /sohl/
            // (#1470) — so the manifest carries a plain address with no
            // version, no /latest, and nothing composed onto it.
            expect(flags.apiDocsUrl).to.eq(
                "https://www.heroiclands.org/sohl/api/",
            );
            expect(flags.knowledgeBaseUrl).to.eq(
                "https://www.heroiclands.org/sohl/kb/",
            );
            s.links.forEach((l) => {
                expect(l.target).to.eq("_blank");
                expect(l.rel).to.contain("noopener");
            });
        });
    });

    it("shows Credits as a button after the external links", () => {
        cy.foundry(readGameSystemSection).should((s) => {
            expect(s.credits, "credits entry").to.not.be.null;
            expect(s.credits.label).to.eq("Credits");
            expect(s.credits.type).to.eq("button");
            // Not a navigation — it opens a compendium journal in-client.
            expect(s.credits.href).to.be.null;
            expect(s.credits.lastInRow, "sits after Discord").to.be.true;
        });
    });

    it("opens the Credits journal when the button is clicked", () => {
        cy.foundry((win) => {
            const el = win.ui.settings.element;
            el.querySelector('button[data-action="sohlOpenCredits"]').click();
            return win.game.system.flags.sohl.creditsUuid;
        }).as("creditsUuid");

        // The sheet resolves and renders asynchronously — poll, don't assert
        // once (cy.foundry().should() would not retry).
        cy.get("@creditsUuid").then((uuid) => {
            cy.window().should((win) => {
                const open = [
                    ...win.foundry.applications.instances.values(),
                ].filter((a) => a.rendered && a.document?.uuid === uuid);
                expect(open, "credits journal sheet open").to.have.length(1);
            });
        });

        // Leave the client clean for the following tests.
        cy.foundry((win) => {
            for (const a of [...win.foundry.applications.instances.values()]) {
                if (a.rendered && a.document?.documentName === "JournalEntry")
                    a.close();
            }
            return null;
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
