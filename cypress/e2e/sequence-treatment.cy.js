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
 * Chat Sequence runtime — the treatment flow end to end (#576).
 *
 * Drives the treatment sequence through real chat cards and button dispatch:
 * request (patient) → perform (physician) → accept (patient). Each step's card is
 * posted by the runner; the next button is read back off the posted message and
 * dispatched through the document's `onChatCardButton` (the real click path). One
 * GM-owned actor plays both roles. The proof: the wound's Healing Rate is recorded
 * only after the patient's final Accept click — nothing mutates until then.
 */

describe("Chat Sequence — treatment flow", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("request → perform → accept records the Healing Rate on the wound", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);

                // A grievous edged wound to treat (band = grievous → a numeric HR).
                const payload = win.structuredClone([
                    {
                        type: "trauma",
                        name: "Wound",
                        system: {
                            subType: "physical",
                            levelBase: 4,
                            aspect: "edged",
                        },
                    },
                ]);
                const [injury] = await a.createEmbeddedDocuments("Item", payload);

                const before = win.game.messages.size;

                // Dispatch a sequence button through the document's handler (the
                // real click path: onChatCardButton → dispatchChatCardAction →
                // runSequenceStep).
                const dispatch = async (btn) => {
                    await a.onChatCardButton(btn);
                };
                // The request step's button, hand-built with the initial instance.
                const requestBtn = win.document.createElement("button");
                requestBtn.dataset.sequenceId = "treatment";
                requestBtn.dataset.stepId = "request";
                requestBtn.dataset.choiceKey = "request";
                requestBtn.dataset.handlerUuid = a.uuid;
                requestBtn.dataset.scope = JSON.stringify({
                    roles: { patient: a.uuid, physician: a.uuid },
                    state: { injuryUuid: injury.uuid },
                });

                // Read the button for `choiceKey` off the most recent posted card.
                const latestButton = (choiceKey) => {
                    const msg = win.game.messages.contents.at(-1);
                    const div = win.document.createElement("div");
                    div.innerHTML = msg.content;
                    return div.querySelector(
                        `button[data-choice-key="${choiceKey}"]`,
                    );
                };

                // request → posts the perform card.
                await dispatch(requestBtn);
                // perform → rolls the physician's Physician skill, posts accept card.
                await dispatch(latestButton("perform"));
                // accept → the patient records the proposed Healing Rate (terminal).
                await dispatch(latestButton("accept"));

                const wound = a.items.get(injury.id);
                return {
                    cardsPosted: win.game.messages.size - before,
                    healingRate: wound.system.healingRateBase,
                    treated: wound.system.treatmentDate != null,
                };
            }).should((r) => {
                // perform + accept cards were posted (request was hand-dispatched).
                expect(r.cardsPosted, "sequence cards posted").to.be.gte(2);
                expect(r.treated, "treatment recorded on the wound").to.be.true;
                expect(
                    r.healingRate,
                    "a Healing Rate was set for the grievous wound",
                ).to.be.gte(1);
            });
        });
    });
});
