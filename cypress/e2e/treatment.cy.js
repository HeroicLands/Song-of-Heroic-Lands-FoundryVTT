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
 * Action-card treatment flow, end to end.
 *
 * The three self-sufficient actions, driven through real posted cards: the
 * patient invokes **Request Treatment** on the wound
 * (`TraumaLogic.requestTreatment`), which posts an *open* Perform card; whoever
 * clicks it responds with their own `game.user.character` (the action self-gates
 * on the Physician skill) and posts a **Treatment Result** card whose Accept
 * button is targeted to the injury (owned by the patient); the patient's Accept
 * runs `TraumaLogic.treatInjury`, recording the Healing Rate. One GM-owned actor
 * plays both parts here. The proof: the wound's Healing Rate is recorded only
 * after the final Accept — nothing mutates until then. Each button carries
 * `data-skip-dialog`, so the card path runs the same action a human could run by
 * hand (which would open a dialog instead).
 */

describe("Action cards — treatment flow", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("Request Treatment → open Perform (@self) → Accept records the Healing Rate", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);

                // A grievous edged wound (band grievous → a numeric HR), plus a
                // Physician skill so the responder passes the self-gate.
                const items = win.structuredClone([
                    {
                        type: "trauma",
                        name: "Wound",
                        system: {
                            subType: "physical",
                            levelBase: 4,
                            aspect: "edged",
                        },
                    },
                    {
                        type: "skill",
                        name: "Physician",
                        system: { shortcode: "pysn", masteryLevelBase: 50 },
                    },
                ]);
                const created = await a.createEmbeddedDocuments("Item", items);
                const injury = created.find((i) => i.type === "trauma");
                await win.game.actors.get(actor.id).sheet?.render?.(false);

                // Whoever clicks the open Perform button responds with their
                // default character — here, this actor.
                await win.game.user.update(
                    win.structuredClone({ character: a.id }),
                );

                const before = win.game.messages.size;

                // Resolve a button's handler (a `@self` button → the user's
                // character; a uuid → that document) and dispatch it — the real
                // click path (onChatCardButton → dispatchChatCardAction, which
                // reads data-skip-dialog and runs the pre-filled action).
                const dispatch = async (btn) => {
                    const uuid = btn.dataset.handlerUuid;
                    const doc =
                        uuid === "@self" ?
                            win.game.user.character
                        :   win.fromUuidSync(uuid);
                    await doc.onChatCardButton(btn);
                };
                const latestButton = (action) => {
                    const msg = win.game.messages.contents.at(-1);
                    const div = win.document.createElement("div");
                    div.innerHTML = msg.content;
                    return div.querySelector(
                        `button.action-card-button[data-action="${action}"]`,
                    );
                };

                // Trigger: the patient invokes Request Treatment on the wound →
                // posts the open Perform card.
                await win.fromUuidSync(injury.uuid).logic.requestTreatment({});
                // Perform (open @self) → rolls the responder's Physician skill,
                // posts the Treatment Result card with an Accept button.
                await dispatch(latestButton("performTreatmentTest"));
                // Accept (targeted to the injury) → treatInjury records the HR.
                await dispatch(latestButton("treatInjury"));

                const wound = a.items.get(injury.id);
                return {
                    cardsPosted: win.game.messages.size - before,
                    healingRate: wound.system.healingRateBase,
                    treated: wound.system.treatmentDate != null,
                };
            }).should((r) => {
                // Perform-result + (the request) cards were posted.
                expect(r.cardsPosted, "treatment cards posted").to.be.gte(2);
                expect(r.treated, "treatment recorded on the wound").to.be.true;
                expect(
                    r.healingRate,
                    "a Healing Rate was set for the grievous wound",
                ).to.be.gte(1);
            });
        });
    });
});
