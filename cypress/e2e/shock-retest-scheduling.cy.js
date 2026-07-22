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
 * Shock Re-Test scheduling (#569), end to end in a real Foundry. Entering a
 * shock state OFFERS (never auto-arms) the Re-Test reminder on the state's
 * cadence — an event-driven `turnEnd` schedule for Incapacitated, a +10-minute
 * time schedule for Unconscious (#622). When due, the queue posts an owner-gated
 * `[Perform]` card addressed to the being; performing it clears the reminder.
 * Nothing runs on its own.
 *
 * The offer is pre-answered here (`skipDialog + scope.schedule`) so the headless
 * run doesn't hang on the consent dialog; the interactive dialog itself is unit
 * covered (`tests/item/offer-schedule.test.ts`).
 */

describe("Shock Re-Test scheduling", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    const ACCEPT = { skipDialog: true, scope: { schedule: true } };

    function shockReTestButton(win, msg) {
        const div = win.document.createElement("div");
        div.innerHTML = msg?.content ?? "";
        return div.querySelector(
            'button.action-card-button[data-action="shockReTest"]',
        );
    }

    it("Incapacitated → a turnEnd schedule that offers a [Perform] card each turn", () => {
        cy.createActor("being", { name: "incap" }).then((actor) => {
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);

                // Enter Incapacitated, then OFFER the Re-Test (pre-answered yes).
                await a.logic.setShockState(2); // INCAPACITATED
                await a.logic.offerShockReTest(win.structuredClone(ACCEPT));

                // Persisted as an event-driven turnEnd schedule (#622 seam).
                const entry = a.system.scheduledActions.find(
                    (e) => e.actionName === "shockReTest",
                );
                const armed = win.sohl.events.isScheduled(
                    a.uuid,
                    "shockReTest",
                );

                // A world-time tick must NOT fire it (bound to turnEnd).
                const beforeTime = win.game.messages.size;
                await win.sohl.events.fire({
                    name: "updateWorldTime",
                    worldTime: 9_000_000,
                });
                const cardsOnTime = win.game.messages.size - beforeTime;

                // Each turnEnd offers a [Perform] card owned by the being.
                const beforeTurn = win.game.messages.size;
                await win.sohl.events.fire({ name: "turnEnd" });
                const btn = shockReTestButton(
                    win,
                    win.game.messages.contents.at(-1),
                );
                // ...and again the next turn (event triggers don't dedupe).
                await win.sohl.events.fire({ name: "turnEnd" });

                return {
                    triggerName: entry?.triggerName,
                    armed,
                    cardsOnTime,
                    cardsOverTwoTurns: win.game.messages.size - beforeTurn,
                    handlerUuid: btn?.dataset.handlerUuid,
                    actorUuid: a.uuid,
                };
            }).should((r) => {
                expect(r.triggerName, "persisted as a turnEnd schedule").to.eq(
                    "turnEnd",
                );
                expect(r.armed, "armed as a subscription").to.be.true;
                expect(
                    r.cardsOnTime,
                    "a world-time tick does not fire it",
                ).to.eq(0);
                expect(
                    r.cardsOverTwoTurns,
                    "a [Perform] card each turn",
                ).to.be.gte(2);
                expect(r.handlerUuid, "owner-gated to the being").to.eq(
                    r.actorUuid,
                );
            });
        });
    });

    it("Unconscious → a +10-minute schedule that offers a [Perform] card when due", () => {
        cy.createActor("being", { name: "out" }).then((actor) => {
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);
                const now = win.game.time.worldTime;

                await a.logic.setShockState(3); // UNCONSCIOUS
                await a.logic.offerShockReTest(win.structuredClone(ACCEPT));

                const entry = a.system.scheduledActions.find(
                    (e) => e.actionName === "shockReTest",
                );
                const nextFire = win.sohl.events.nextFireTime(
                    a.uuid,
                    "shockReTest",
                );

                // Not yet due (before +10 min): no card.
                const beforeEarly = win.game.messages.size;
                await win.sohl.events.fire({
                    name: "updateWorldTime",
                    worldTime: now + 60,
                });
                const cardsEarly = win.game.messages.size - beforeEarly;

                // Ten minutes on: due → a [Perform] card owned by the being.
                const beforeDue = win.game.messages.size;
                await win.sohl.events.fire({
                    name: "updateWorldTime",
                    worldTime: now + 600,
                });
                const btn = shockReTestButton(
                    win,
                    win.game.messages.contents.at(-1),
                );

                return {
                    triggerName: entry?.triggerName || "",
                    interval: entry?.interval,
                    nextFireOffset: nextFire - now,
                    cardsEarly,
                    cardsWhenDue: win.game.messages.size - beforeDue,
                    handlerUuid: btn?.dataset.handlerUuid,
                    actorUuid: a.uuid,
                };
            }).should((r) => {
                expect(r.triggerName, "a time schedule, no trigger").to.eq("");
                expect(r.interval, "ten minutes").to.eq(600);
                expect(r.nextFireOffset, "due at +10 min").to.eq(600);
                expect(r.cardsEarly, "not offered before it is due").to.eq(0);
                expect(r.cardsWhenDue, "offered when due").to.be.gte(1);
                expect(r.handlerUuid, "owner-gated to the being").to.eq(
                    r.actorUuid,
                );
            });
        });
    });

    it("recovering (no ordinary shock) clears the reminder", () => {
        cy.createActor("being", { name: "recovers" }).then((actor) => {
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);

                await a.logic.setShockState(2); // INCAPACITATED
                await a.logic.offerShockReTest(win.structuredClone(ACCEPT));
                const armedWhileShocked = win.sohl.events.isScheduled(
                    a.uuid,
                    "shockReTest",
                );

                // Recover fully, then reconcile: the reminder must be cleared.
                await a.logic.setShockState(0); // NONE
                await a.logic.offerShockReTest(win.structuredClone(ACCEPT));

                const stillArmed = win.sohl.events.isScheduled(
                    a.uuid,
                    "shockReTest",
                );
                const stillPersisted = (a.system.scheduledActions || []).some(
                    (e) => e.actionName === "shockReTest",
                );
                return { armedWhileShocked, stillArmed, stillPersisted };
            }).should((r) => {
                expect(r.armedWhileShocked, "armed while Incapacitated").to.be
                    .true;
                expect(r.stillArmed, "unarmed once recovered").to.be.false;
                expect(r.stillPersisted, "and cleared from the store").to.be
                    .false;
            });
        });
    });
});
