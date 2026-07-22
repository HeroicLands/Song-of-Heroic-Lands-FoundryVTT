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

    it("a scene-bound schedule (#590) fires only while its scene is active", () => {
        cy.createScene({ name: "vale" }).then((vale) => {
            cy.createScene({ name: "hideout" }).then((hideout) => {
                cy.createActor("being", { name: "host" }).then((host) => {
                    cy.foundry(async (win) => {
                        const valeDoc = win.game.scenes.get(vale.id);
                        const hideoutDoc = win.game.scenes.get(hideout.id);
                        const a = win.game.actors.get(host.id);

                        const countCards = () => {
                            let n = 0;
                            for (const m of win.game.messages.contents) {
                                const div = win.document.createElement("div");
                                div.innerHTML = m.content ?? "";
                                n += div.querySelectorAll(
                                    'button.action-card-button[data-action="checkForBandits"]',
                                ).length;
                            }
                            return n;
                        };

                        // The party is in the vale; the check is bound to the
                        // hideout. Re-realm every payload handed to Foundry (a
                        // Cypress-realm literal makes mergeObject throw).
                        await valeDoc.update(
                            win.structuredClone({ active: true }),
                        );
                        await win.sohl.schedule(
                            a,
                            "checkForBandits",
                            100,
                            win.structuredClone({}),
                            hideoutDoc.uuid,
                        );

                        // Comes due while away → gated: no reminder, but still armed.
                        // (The queue's scene gate reads game.scenes.active, so an
                        // explicit awaited fire deterministically exercises it; the
                        // updateScene *flush* hook is covered by unit tests.)
                        await win.sohl.events.fire({
                            name: "updateWorldTime",
                            worldTime: 1_000_000,
                        });
                        const cardsWhileAway = countCards();
                        const stillArmed = win.sohl.events.isScheduled(
                            a.uuid,
                            "checkForBandits",
                        );

                        // Party arrives: the hideout becomes the active scene.
                        await valeDoc.update(
                            win.structuredClone({ active: false }),
                        );
                        await hideoutDoc.update(
                            win.structuredClone({ active: true }),
                        );
                        const activeUuid = win.game.scenes.active?.uuid;
                        await win.sohl.events.fire({
                            name: "updateWorldTime",
                            worldTime: 1_000_000,
                        });
                        const cardsOnArrival = countCards();

                        return {
                            cardsWhileAway,
                            stillArmed,
                            activeUuid,
                            hideoutUuid: hideoutDoc.uuid,
                            cardsOnArrival,
                        };
                    }).should((r) => {
                        expect(
                            r.cardsWhileAway,
                            "gated while its scene is inactive",
                        ).to.eq(0);
                        expect(r.stillArmed, "not consumed while gated").to.be
                            .true;
                        expect(
                            r.activeUuid,
                            "hideout is now the active scene",
                        ).to.eq(r.hideoutUuid);
                        expect(
                            r.cardsOnArrival,
                            "surfaces the instant the scene activates",
                        ).to.be.gte(1);
                    });
                });
            });
        });
    });

    it("sohl.addScriptAction binds a Macro as a runnable, schedulable SCRIPT action (#588 §7)", () => {
        cy.foundry(async (win) => {
            const clone = (o) => win.JSON.parse(JSON.stringify(o));

            // The world host (an Actor → has the execution surface for free).
            const world = await win.sohl.worldHost();

            // GM-authored homebrew: an ordinary script Macro (a reference,
            // never inline code on the document).
            const macro = await win.Macro.create(
                clone({
                    name: "e2e-bandit-macro",
                    type: "script",
                    command: "return 'patrol';",
                }),
            );

            // The clean programmatic attach — no knowledge of the actionDefs
            // shape, just { name, executor }.
            const def = await win.sohl.addScriptAction(world, {
                name: "checkForBandits",
                executor: macro.uuid,
            });

            // Persisted as a SCRIPT def whose shortcode == name (the identity
            // sohl.schedule and the [Perform] reminder key on); title defaults
            // to name.
            const persisted = world.system.actionDefs.find(
                (d) => d.shortcode === "checkForBandits",
            );

            // Idempotent: re-attaching the same name replaces, never dupes.
            const macro2 = await win.Macro.create(
                clone({
                    name: "e2e-bandit-macro-2",
                    type: "script",
                    command: "return 'ambush';",
                }),
            );
            await win.sohl.addScriptAction(world, {
                name: "checkForBandits",
                executor: macro2.uuid,
            });
            const dupes = world.system.actionDefs.filter(
                (d) => d.shortcode === "checkForBandits",
            );

            // The action is built into the host's logic and runs its Macro.
            world.reset?.();
            world.prepareData?.();
            const action = world.logic.actions.get("checkForBandits");
            const ran =
                action ?
                    await action.execute(world.logic._getContext())
                :   undefined;

            // End to end: schedule it, and when due a [Perform] reminder
            // addressed to the host is offered (nothing runs on its own).
            await win.sohl.schedule(world, "checkForBandits", 100, clone({}));
            const before = win.game.messages.size;
            await win.sohl.events.fire({
                name: "updateWorldTime",
                worldTime: 1_000_000,
            });
            const msg = win.game.messages.contents.at(-1);
            const div = win.document.createElement("div");
            div.innerHTML = msg?.content ?? "";
            const btn = div.querySelector(
                'button.action-card-button[data-action="checkForBandits"]',
            );

            const result = {
                returnedDef: def?.shortcode,
                persistedSubType: persisted?.subType,
                persistedTitle: persisted?.title,
                dupeCount: dupes.length,
                dupeExecutor: dupes[0]?.executor,
                macro2Uuid: macro2.uuid,
                hasAction: !!action,
                ran,
                cardsPosted: win.game.messages.size - before,
                handlerUuid: btn?.dataset.handlerUuid,
                worldUuid: world.uuid,
            };

            await macro.delete();
            await macro2.delete();
            await world.delete();
            return result;
        }).should((r) => {
            expect(r.returnedDef, "returns the persisted def").to.eq(
                "checkForBandits",
            );
            expect(r.persistedSubType, "attached as a SCRIPT action").to.eq(
                "script",
            );
            expect(r.persistedTitle, "title defaults to name").to.eq(
                "checkForBandits",
            );
            expect(r.dupeCount, "idempotent — one entry per name").to.eq(1);
            expect(r.dupeExecutor, "re-attach replaces the executor").to.eq(
                r.macro2Uuid,
            );
            expect(r.hasAction, "built into logic.actions").to.be.true;
            expect(r.ran, "runs the bound Macro").to.eq("ambush");
            expect(r.cardsPosted, "due → a [Perform] reminder").to.be.gte(1);
            expect(r.handlerUuid, "reminder addressed to the host").to.eq(
                r.worldUuid,
            );
        });
    });

    it("sohl.worldHost() find-or-creates a hidden _sohlworld singleton", () => {
        cy.foundry(async (win) => {
            const w1 = await win.sohl.worldHost();
            const w2 = await win.sohl.worldHost(); // singleton: same actor
            const result = {
                shortcode: w1?.system?.shortcode,
                ownershipDefault: w1?.ownership?.default,
                singleton: !!w1 && !!w2 && w1.id === w2.id,
            };
            await w1?.delete(); // not tagged by the run — clean up explicitly
            return result;
        }).should((r) => {
            expect(r.shortcode, "reserved shortcode").to.eq("_sohlworld");
            expect(r.ownershipDefault, "invisible to players (NONE)").to.eq(0);
            expect(r.singleton, "find-or-create returns the same actor").to.be
                .true;
        });
    });
});
