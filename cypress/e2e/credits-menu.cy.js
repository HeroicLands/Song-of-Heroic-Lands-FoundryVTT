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
 * The "Credits" settings menu (issue #1517) — the second of the two entry
 * points, and the one every SoHL module reuses on its own settings tab.
 *
 * Proves what only a live client can: that the menu registers under the
 * system's tab, renders as its **first** entry (which depends purely on
 * registration order in `registerSystemSettings`), and opens the Credits
 * JournalEntry rather than a window of its own.
 */

/** The registered menu key — `<namespace>.<key>`, as core stores it. */
const MENU_KEY = "sohl.creditsMenu";

/** Close any open JournalEntry sheet, so a test leaves the client clean. */
function closeJournals(win) {
    for (const app of [...win.foundry.applications.instances.values()]) {
        if (app.rendered && app.document?.documentName === "JournalEntry")
            app.close();
    }
    return null;
}

describe("credits — settings menu", () => {
    before(() => cy.login());

    afterEach(() => {
        cy.foundry((win) => {
            closeJournals(win);
            win.game.settings.sheet.close();
            return null;
        });
    });

    it("registers a non-restricted menu so players can read the credits too", () => {
        cy.foundry((win) => {
            const menu = win.game.settings.menus.get(MENU_KEY);
            return menu ?
                    {
                        namespace: menu.namespace,
                        restricted: !!menu.restricted,
                        hasType: typeof menu.type === "function",
                        icon: menu.icon,
                    }
                :   null;
        }).should((menu) => {
            expect(menu, "credits menu registered").to.not.be.null;
            expect(menu.namespace).to.eq("sohl");
            // Credits exist to be read; a restricted menu would hide the
            // button from every non-GM in the world.
            expect(menu.restricted, "GM-only").to.be.false;
            expect(menu.hasType, "menu app class").to.be.true;
            expect(menu.icon).to.be.a("string").and.not.be.empty;
        });
    });

    it("is registered before the system's other menus, so it renders first", () => {
        // Core pushes a package's menus into its tab in `game.settings.menus`
        // insertion order, ahead of the plain settings — so this ordering IS
        // the button's position on the tab.
        cy.foundry((win) =>
            [...win.game.settings.menus.keys()].filter((k) =>
                k.startsWith("sohl."),
            ),
        ).should((keys) => {
            expect(keys[0], "first SoHL menu").to.eq(MENU_KEY);
        });
    });

    it("renders as the first control on the Song of Heroic Lands tab", () => {
        cy.foundry((win) => win.game.settings.sheet.render({ force: true }));

        cy.window().should((win) => {
            const el = win.game.settings.sheet.element;
            expect(el?.querySelector(`[data-key="${MENU_KEY}"]`), "button").to
                .exist;
        });

        cy.foundry((win) => {
            const el = win.game.settings.sheet.element;
            const tab = el.querySelector('section.tab[data-tab="system"]');
            const button = tab?.querySelector(`[data-key="${MENU_KEY}"]`);
            const groups = [...(tab?.querySelectorAll(".form-group") ?? [])];
            return {
                inSystemTab: !!button,
                label: button?.textContent?.trim(),
                firstGroupIsCredits:
                    groups.length > 0 &&
                    groups[0].contains(button ?? document.createElement("i")),
                rowLabel: groups[0]?.querySelector("label")?.textContent.trim(),
            };
        }).should((r) => {
            expect(r.inSystemTab, "credits button on the system tab").to.be
                .true;
            expect(r.label).to.eq("View Credits");
            expect(r.firstGroupIsCredits, "first form-group").to.be.true;
            expect(r.rowLabel).to.eq("Credits & Attributions");
        });
    });

    it("opens the Credits journal instead of rendering a window of its own", () => {
        cy.foundry((win) => win.game.settings.sheet.render({ force: true }));
        cy.window().should((win) => {
            const el = win.game.settings.sheet.element;
            expect(el?.querySelector(`[data-key="${MENU_KEY}"]`)).to.exist;
        });

        cy.foundry((win) => {
            win.game.settings.sheet.element
                .querySelector(`[data-key="${MENU_KEY}"]`)
                .click();
            return win.game.system.flags.sohl.creditsUuid;
        }).as("uuid");

        cy.get("@uuid").then((uuid) => {
            cy.window().should((win) => {
                const apps = [...win.foundry.applications.instances.values()];
                const journal = apps.filter(
                    (a) => a.rendered && a.document?.uuid === uuid,
                );
                expect(journal, "credits journal open").to.have.length(1);
                // The menu app itself must never appear on screen.
                expect(
                    apps.filter(
                        (a) => a.rendered && a.id === "sohl-credits-menu",
                    ),
                    "menu shim window",
                ).to.have.length(0);
            });
        });
    });

    it("opens an entry with the credits pages, from the system's own pack", () => {
        cy.foundry(async (win) => {
            const uuid = win.game.system.flags.sohl.creditsUuid;
            const entry = await win.fromUuid(uuid);
            return {
                uuid,
                name: entry?.name,
                pack: entry?.pack,
                pages: [...(entry?.pages ?? [])].map((p) => p.name),
            };
        }).should((e) => {
            expect(e.uuid).to.match(
                /^Compendium\.sohl\.journals\.JournalEntry\./,
            );
            expect(e.name).to.eq("Credits & Attributions");
            expect(e.pack).to.eq("sohl.journals");
            // The attribution the licenses actually require must be in there.
            expect(e.pages).to.include("Third-Party Artwork");
            expect(e.pages).to.include("Licenses");
            expect(e.pages).to.include("Trademarks & Service Marks");
        });
    });
});
