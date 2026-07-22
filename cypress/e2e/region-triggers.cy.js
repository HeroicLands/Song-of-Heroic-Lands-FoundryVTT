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
 * Scene-region & environment event triggers (#593). Proven end to end in a real
 * Foundry:
 *
 * - A **"SoHL Event Trigger"** RegionBehavior (`trigger`) can be created on a
 *   scene region (the subtype is registered via `documentTypes` + CONFIG), and
 *   when a curated region event reaches it, it offers the authored action to the
 *   entering token's actor as an owner-gated `[Perform]` reminder — no character
 *   is acted on without a click.
 * - A `sceneDarknessChange` trigger fires from `SohlHookBridge` on a real
 *   `scene.update({ environment.darknessLevel })`, offering a subscribed action.
 *
 * Region geometry detection needs the canvas (unavailable headless), so the region
 * event is driven through the behavior's own `_handleRegionEvent` — the exact seam
 * Foundry calls — rather than by moving a token. That exercises everything SoHL
 * owns (registration, the schema, the GM-gated forward, the consent offer).
 */

describe("Scene-region & environment triggers (#593)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("registers the SoHL Event Trigger RegionBehavior subtype", () => {
        cy.foundry((win) => ({
            registered: Object.keys(
                win.CONFIG.RegionBehavior.dataModels,
            ).includes("trigger"),
            inExpiry: Object.keys(win.CONFIG.ActiveEffect.expiryEvents).filter(
                (k) => k.startsWith("region") || k === "sceneDarknessChange",
            ),
        })).should((r) => {
            expect(r.registered, "trigger data model registered").to.be.true;
            expect(r.inExpiry).to.include.members([
                "regionTokenEnter",
                "regionTokenExit",
                "sceneDarknessChange",
            ]);
        });
    });

    it("a region enter offers the authored action to the entering token's actor", () => {
        cy.importActor().then((actor) => {
            cy.createScene().then((scene) => {
                cy.foundry(async (win) => {
                    const s = win.game.scenes.get(scene.id);
                    const a = win.game.actors.get(actor.id);
                    // A synthetic entering token carrying the real actor — the
                    // bridge reads only `token.uuid` and `token.actor.uuid`, so
                    // no canvas-placed token is needed (avoids headless canvas
                    // draw errors; region geometry is Foundry's concern, not the
                    // bridge's).
                    const tok = { uuid: `${s.uuid}.Token.synthetic`, actor: a };

                    // A GM drops a SoHL Event Trigger on a region — proving the
                    // `trigger` subtype is a real, createable RegionBehavior…
                    const [region] = await s.createEmbeddedDocuments(
                        "Region",
                        win.structuredClone([
                            {
                                name: "Crypt",
                                shapes: [
                                    {
                                        type: "rectangle",
                                        x: 1000,
                                        y: 1000,
                                        width: 400,
                                        height: 400,
                                    },
                                ],
                            },
                        ]),
                    );
                    const [behavior] = await region.createEmbeddedDocuments(
                        "RegionBehavior",
                        win.structuredClone([
                            {
                                name: "Trigger",
                                type: "trigger",
                                system: {
                                    events: ["tokenEnter"],
                                    actionName: "fearCheck",
                                },
                            },
                        ]),
                    );

                    const before = win.game.messages.size;
                    // Drive the exact seam Foundry calls on a token entering.
                    await behavior.system._handleRegionEvent({
                        name: "tokenEnter",
                        data: { token: tok },
                        region,
                        user: win.game.user,
                    });

                    const msg = win.game.messages.contents.at(-1);
                    const div = win.document.createElement("div");
                    div.innerHTML = msg?.content ?? "";
                    const btn = div.querySelector(
                        'button.action-card-button[data-action="fearCheck"]',
                    );
                    return {
                        behaviorType: behavior?.type,
                        behaviorEvents: [...(behavior?.system.events ?? [])],
                        cardsPosted: win.game.messages.size - before,
                        hasPerformButton: !!btn,
                        handlerUuid: btn?.dataset.handlerUuid,
                        actorUuid: tok.actor?.uuid,
                    };
                }).should((r) => {
                    expect(
                        r.behaviorType,
                        "the trigger subtype created (not dropped to base)",
                    ).to.eq("trigger");
                    expect(r.behaviorEvents).to.include("tokenEnter");
                    expect(
                        r.cardsPosted,
                        "a [Perform] reminder was offered",
                    ).to.be.gte(1);
                    expect(r.hasPerformButton).to.be.true;
                    // Addressed to the entering token's actor (its owner performs).
                    expect(r.handlerUuid).to.eq(r.actorUuid);
                });
            });
        });
    });

    it("a real darkness change offers a subscribed action (sceneDarknessChange)", () => {
        cy.importActor().then((actor) => {
            cy.createScene().then((scene) => {
                cy.foundry(async (win) => {
                    const a = win.game.actors.get(actor.id);
                    const s = win.game.scenes.get(scene.id);

                    // A character subscribes an action to darkness falling.
                    win.sohl.events.subscribe({
                        uuid: a.uuid,
                        actionName: "darkCheck",
                        triggerName: "sceneDarknessChange",
                    });

                    const before = win.game.messages.size;
                    // A genuine scene update — drives SohlHookBridge's
                    // updateScene. Re-realm the payload into the game window.
                    await s.update(
                        win.structuredClone({
                            environment: { darknessLevel: 0.9 },
                        }),
                    );
                    // updateScene handlers are async; let the offer settle.
                    await new Promise((res) => win.setTimeout(res, 50));

                    const msg = win.game.messages.contents.at(-1);
                    const div = win.document.createElement("div");
                    div.innerHTML = msg?.content ?? "";
                    const btn = div.querySelector(
                        'button.action-card-button[data-action="darkCheck"]',
                    );
                    // Clean up the subscription so it can't leak to later specs.
                    win.sohl.events.unsubscribe(a.uuid, "darkCheck");
                    return {
                        cardsPosted: win.game.messages.size - before,
                        hasPerformButton: !!btn,
                        handlerUuid: btn?.dataset.handlerUuid,
                        actorUuid: a.uuid,
                    };
                }).should((r) => {
                    expect(
                        r.cardsPosted,
                        "a [Perform] reminder was offered",
                    ).to.be.gte(1);
                    expect(r.hasPerformButton).to.be.true;
                    expect(r.handlerUuid).to.eq(r.actorUuid);
                });
            });
        });
    });
});
