/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { toRealm } from "../support/resolve";

const NAME = "Journal Image Layout Test";
const IMAGE = "systems/sohl/assets/icons/game-icons/cathelineau/dread.svg";

describe("note images in a Foundry journal", () => {
    before(() => cy.login());

    after(() => {
        cy.foundry(async (win) => {
            const entry = win.game.journal.find((journal) => journal.name === NAME);
            if (entry) {
                await entry.sheet.close();
                await entry.delete();
            }
            return null;
        });
    });

    it("sizes a floated image and returns it to the text flow in a narrow journal", () => {
        cy.foundry(async (win) => {
            const entry = await win.JournalEntry.create(
                toRealm(win, {
                    name: NAME,
                    pages: [
                        {
                            name: "Figures",
                            type: "text",
                            text: {
                                format: 1,
                                content:
                                    `<figure class="note-image note-image-size-medium note-image-float-top-left">` +
                                    `<img src="${IMAGE}" alt="A figure"><figcaption>A figure</figcaption></figure>` +
                                    `<p>Text wraps beside the image.</p>`,
                            },
                        },
                    ],
                }),
            );
            await entry.sheet.render(true);
            return null;
        });

        cy.window().should((win) => {
            expect(win.document.querySelector(".journal-entry-page .note-image"), "journal image")
                .to.exist;
        });

        const styleAtWidth = (width) =>
            cy.foundry((win) => {
                const prose = win.document.querySelector(
                    ".journal-entry-page .journal-page-content:has(.note-image)",
                );
                prose.style.width = `${width}px`;
                const figure = prose.querySelector(".note-image");
                const style = win.getComputedStyle(figure);
                return {
                    float: style.float,
                    figureWidth: figure.getBoundingClientRect().width,
                    imageWidth: figure.querySelector("img").getBoundingClientRect().width,
                    caption: figure.querySelector("figcaption")?.textContent,
                };
            });

        styleAtWidth(700).should((value) => {
            expect(value.float).to.eq("left");
            expect(value.figureWidth).to.be.closeTo(128, 1);
            expect(value.imageWidth).to.be.closeTo(128, 1);
            expect(value.caption).to.eq("A figure");
        });

        styleAtWidth(320).should((value) => {
            expect(value.float).to.eq("none");
            expect(value.figureWidth).to.be.closeTo(320, 1);
            expect(value.imageWidth).to.be.closeTo(128, 1);
        });
    });
});
