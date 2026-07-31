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
 * The **Output Description to Chat** intrinsic item action (#849), end to end in
 * a real Foundry. Every item kind carries it; running it posts the item's
 * description — via the previously orphaned `item-desc-card.hbs` — to the chat
 * log. It is informational (no follow-up buttons), so nothing to pre-answer.
 *
 * The card assembly and enrichment are unit covered
 * (`tests/item/SohlItemBaseLogic.test.ts`); this spec proves the runtime wiring:
 * the action exists on a real item and posts a real chat message carrying the
 * item's name, description, and owning-actor id.
 */

describe("Output Description to Chat action (#849)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("is defined on an embedded item and posts a description card", () => {
        cy.createActor("being", { name: "desc-owner" }).then((actor) => {
            cy.createItemOn(actor, "weapongear", { name: "Broadsword" }).then(
                (item) => {
                    // Give the item a description + notes to render.
                    cy.foundry((win) =>
                        win.game.actors
                            .get(actor.id)
                            .items.get(item.id)
                            .update(
                                win.structuredClone({
                                    "system.docHtml":
                                        "<p>A trusty broadsword.</p>",
                                    "system.notes": "Guild-forged",
                                }),
                            ),
                    );

                    cy.hasAction(item, "outputDescription").should("be.true");

                    cy.foundry(async (win) => {
                        const it = win.game.actors
                            .get(actor.id)
                            .items.get(item.id);
                        const before = win.game.messages.size;
                        await it.logic.outputDescription(
                            it.logic._getContext(),
                        );
                        const msg = [...win.game.messages].at(-1);
                        return {
                            added: win.game.messages.size - before,
                            content: msg?.content ?? "",
                            actorId: actor.id,
                        };
                    }).should((r) => {
                        expect(r.added, "a chat message was posted").to.eq(1);
                        expect(r.content).to.contain("Broadsword");
                        expect(r.content).to.contain("A trusty broadsword.");
                        expect(r.content).to.contain("Guild-forged");
                        expect(r.content).to.contain(
                            `data-actor-id="${r.actorId}"`,
                        );
                    });
                },
            );
        });
    });
});
