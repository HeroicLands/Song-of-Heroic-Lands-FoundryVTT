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
 * Being print / export (#795). The window-header print control renders a
 * dedicated, static, all-sections character record from the same view-models
 * the interactive sheet uses, into a new browser window, and opens that
 * window's print dialog. Setup imports Basic Folk so every section has content.
 *
 * `window.open` and `print()` are stubbed in the click test so the run neither
 * spawns a real popup nor blocks on a native print dialog.
 */
describe("being print / export (#795)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    beforeEach(() => cy.closeAllSheets());
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    it("wires the fa-print header control and renders a full static record", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.foundry(async (win) => {
                const sheet = win.game.actors.get(actor.id).sheet;
                const controls = sheet._getHeaderControls();
                const doc = await sheet._renderPrintDocument();
                return {
                    hasControl: controls.some(
                        (c) => c.action === "printSheet" && /fa-print/.test(c.icon),
                    ),
                    doc,
                };
            }).then(({ hasControl, doc }) => {
                expect(hasControl, "fa-print header control present").to.be.true;

                // A full, self-contained print document.
                expect(doc).to.include("<!doctype html>");
                expect(doc).to.include("being-print");
                expect(doc).to.include("Character Record");
                expect(doc).to.include(actor.name);

                // Assets referenced by absolute URL; light theme forced.
                expect(doc).to.match(/href="https?:\/\/[^"]+\/systems\/sohl\/css\/sohl\.css"/);
                expect(doc).to.include('data-theme="light"');

                // Every section's content is present (Basic Folk populates all).
                expect(doc).to.include("Attributes");
                expect(doc).to.include("Movement");
                expect(doc).to.include("Body Structure");

                // Static record — none of the interactive sheet's chrome.
                expect(doc).to.not.include("data-action");
                expect(doc).to.not.include("<prose-mirror");
                expect(doc).to.not.include("<select");
                expect(doc).to.not.include("<input");
            });
        });
    });

    it("opens a print window and auto-fires its print dialog on click", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.foundry(async (win) => {
                win.__print = { html: null, called: false };
                // Stub the detached window so nothing pops or blocks.
                win.open = () => ({
                    document: {
                        open() {},
                        close() {},
                        write(html) {
                            win.__print.html = html;
                        },
                        readyState: "complete",
                        fonts: { ready: Promise.resolve() },
                    },
                    focus() {},
                    print() {
                        win.__print.called = true;
                    },
                    addEventListener() {},
                });

                const sheet = win.game.actors.get(actor.id).sheet;
                // Dispatch exactly as the header-control click does — through the
                // merged action handler ApplicationV2 stores on options.actions.
                await sheet.options.actions.printSheet.call(
                    sheet,
                    new win.MouseEvent("click"),
                    win.document.createElement("button"),
                );
                // Let the fonts-ready microtask that gates print() settle.
                await new Promise((r) => win.setTimeout(r, 40));
                return win.__print;
            }).then((print) => {
                expect(print.html, "print document written to the new window").to.include(
                    "being-print",
                );
                expect(print.called, "the window's print() was invoked").to.be.true;
            });
        });
    });
});
