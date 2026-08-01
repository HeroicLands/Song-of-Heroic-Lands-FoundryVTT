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
    afterEach(() => {
        // A leftover forced die value would leak into the next spec's roll.
        cy.foundry((win) => {
            win.sohl.entity.roll.SimpleRoll.clearForced();
            return null;
        });
        cy.cleanupWorld();
    });

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
                            subType: "injury",
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

    it("the Treatment Result card shows the infection / impairment / bleeder warnings a botched treatment causes (#846)", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);
                const items = win.structuredClone([
                    {
                        type: "trauma",
                        name: "Wound",
                        system: {
                            subType: "injury",
                            levelBase: 4, // grievous
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
                await win.game.user.update(
                    win.structuredClone({ character: a.id }),
                );

                // Force a critical failure: a d100 total of 100 is > ML 50
                // (failure) and ends in 0 (critical). A grievous edged wound left
                // at HR 2 is then infectable, impairment-eligible, and a bleeder —
                // all three warnings must render on the Treatment Result card.
                win.sohl.entity.roll.SimpleRoll.forceValues(100);

                await win.fromUuidSync(injury.uuid).logic.requestTreatment({});

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

                // Perform → posts the Treatment Result card; capture its HTML.
                await dispatch(latestButton("performTreatmentTest"));
                return win.game.messages.contents.at(-1).content;
            }).should((html) => {
                expect(html, "infection warning").to.contain("Infection risk");
                expect(html, "impairment warning").to.contain(
                    "Permanent impairment risk",
                );
                expect(html, "bleeder warning").to.contain(
                    "Treatment results in a bleeder",
                );
            });
        });
    });
});
