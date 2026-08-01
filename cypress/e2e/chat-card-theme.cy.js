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
 * Chat cards blend into Foundry's always-light chat log (#903).
 *
 * Foundry pins the chat log to light in both modes — every message is painted on
 * a fixed-light `/ui/parchment.jpg` and the message frame is not ours to theme.
 * Earlier fixes (#896/#899) themed only the card interior, so in dark mode a dark
 * vellum card floated inside Foundry's light-grey frame. The blend-in fix
 * light-locks the `.chat-card` tokens and drops its own ground, so the card is a
 * good neighbor in the grey log: stable in both modes.
 *
 * We assert the resolved ground + ink DO NOT flip when the theme toggles (the old
 * bug made them flip), and confirm appearance by screenshot review.
 */

// `--sohl-color-text-primary` LIGHT: #211d16 — the fixed ink, both modes.
const LIGHT_INK = "rgb(33, 29, 22)";

// Post a real success-test card; resolve once the ChatMessage document exists
// (fast — under cy.foundry's 4s budget). The DOM render is awaited separately
// with cy.get's retry.
function postCard(win, actorId, skillId) {
    return (async () => {
        const a = win.game.actors.get(actorId);
        const s = a.items.get(skillId);
        const result = await s.logic.executeAction("successTest", {
            skipDialog: true,
            scope: {},
        });
        await result.toChat();
        for (let i = 0; i < 50; i++) {
            if (
                win.game.messages.contents.some((m) =>
                    m.content.includes("chat-card"),
                )
            )
                return true;
            await new Promise((r) => win.setTimeout(r, 40));
        }
        return false;
    })();
}

function cardStyle(win) {
    const el = win.document.querySelector(".chat-card");
    const cs = win.getComputedStyle(el);
    return { color: cs.color, image: cs.backgroundImage };
}

describe("chat cards blend into the light chat log (#903)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.cleanupWorld();
        cy.foundry((win) => {
            win.document.documentElement.removeAttribute("data-theme");
            return null;
        });
    });

    it("card ground + ink stay fixed-light when the theme toggles", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sword",
                system: { shortcode: "swo", masteryLevelBase: 50 },
            }).then((skill) => {
                cy.prepare(actor);
                cy.foundry((win) => postCard(win, actor.id, skill.id)).should(
                    "be.true",
                );
                // Wait for the log to render the card (Cypress retries).
                cy.get(".chat-card", { timeout: 15000 }).should("exist");

                // Dark theme: the card must NOT go dark — ink stays the light ink
                // and the card paints no parchment image of its own (it inherits
                // Foundry's light message ground).
                cy.foundry((win) => {
                    win.document.documentElement.setAttribute(
                        "data-theme",
                        "dark",
                    );
                    return cardStyle(win);
                }).then((s) => {
                    expect(s.color, "dark-theme card ink stays light").to.eq(
                        LIGHT_INK,
                    );
                    expect(
                        s.image,
                        "card paints no ground image of its own",
                    ).to.eq("none");
                });

                // Light theme: identical — proves stability, not just darkness.
                cy.foundry((win) => {
                    win.document.documentElement.setAttribute(
                        "data-theme",
                        "light",
                    );
                    return cardStyle(win);
                }).then((s) => {
                    expect(s.color, "light-theme card ink").to.eq(LIGHT_INK);
                    expect(s.image, "no ground image").to.eq("none");
                });

                // Visual confirmation in dark mode (the mode that was broken):
                // open the chat sidebar and capture the card in its frame.
                cy.foundry((win) => {
                    win.document.documentElement.setAttribute(
                        "data-theme",
                        "dark",
                    );
                    win.ui.sidebar.expand?.();
                    win.ui.sidebar.changeTab?.("chat", "primary");
                    return null;
                });
                // Capture the message wrapper so the card is shown INSIDE
                // Foundry's light-grey frame — the relationship this bug is about.
                cy.get(".chat-message", { timeout: 10000 })
                    .filter(":has(.chat-card)")
                    .first()
                    .scrollIntoView()
                    .screenshot("chat-card-blend-dark");
            });
        });
    });
});
