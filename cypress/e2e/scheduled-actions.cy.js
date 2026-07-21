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
 * Generic scheduled actions (#588), end to end in a real Foundry:
 * `sohl.schedule` persists to the document's `system.scheduledActions` **and**
 * arms the queue; the `ready` re-arm hook reconstructs the schedule from that
 * persisted state (the reload path); and when due the queue offers a `[Perform]`
 * reminder addressed to the document — nothing runs on its own.
 */

describe("Generic scheduled actions", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("sohl.schedule persists + arms; ready re-arms; due → a [Perform] reminder", () => {
        cy.createActor("being", { name: "world" }).then((actor) => {
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);

                // Schedule a recurring action on the actor (world-host style).
                await win.sohl.schedule(a, "someCheck", 100, { v: 1 });

                // Persist half: it's in system.scheduledActions on the document.
                const persisted = a.system.scheduledActions.find(
                    (e) => e.actionName === "someCheck",
                );
                // Arm half: it's live in the queue.
                const armedBySchedule = win.sohl.events.isScheduled(
                    a.uuid,
                    "someCheck",
                );

                // Simulate a reload's load-side re-arm from persisted state.
                win.sohl.events.unsubscribe(a.uuid, "someCheck");
                win.Hooks.callAll("ready");
                const reArmed = win.sohl.events.isScheduled(
                    a.uuid,
                    "someCheck",
                );

                // Due → the queue offers a [Perform] reminder (never performs).
                const before = win.game.messages.size;
                await win.sohl.events.fire({
                    name: "updateWorldTime",
                    worldTime: 1_000_000,
                });
                const msg = win.game.messages.contents.at(-1);
                const div = win.document.createElement("div");
                div.innerHTML = msg?.content ?? "";
                const btn = div.querySelector(
                    'button.action-card-button[data-action="someCheck"]',
                );

                return {
                    persisted,
                    armedBySchedule,
                    reArmed,
                    cardsPosted: win.game.messages.size - before,
                    handlerUuid: btn?.dataset.handlerUuid,
                    actorUuid: a.uuid,
                };
            }).should((r) => {
                expect(
                    r.persisted,
                    "persisted to system.scheduledActions",
                ).to.include({ actionName: "someCheck", interval: 100 });
                expect(r.armedBySchedule, "armed by sohl.schedule").to.be.true;
                expect(r.reArmed, "re-armed by the ready hook").to.be.true;
                expect(r.cardsPosted, "a reminder was offered").to.be.gte(1);
                expect(r.handlerUuid, "addressed to the document").to.eq(
                    r.actorUuid,
                );
            });
        });
    });
});
