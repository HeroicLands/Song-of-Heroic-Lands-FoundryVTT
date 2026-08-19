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
 * Region **containment** is geometry, not rendering, so it resolves with no
 * canvas: a plain `token.update({x, y})` moves a linked token into an authored
 * polygon and Foundry delivers `tokenEnter` to the behavior. Only *drawing* the
 * region needs the viewport. So the region event is driven the way a player
 * causes it — by moving a token — rather than by calling `_handleRegionEvent`.
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

                    // A linked token placed well outside the region…
                    const td = await a.getTokenDocument(
                        win.structuredClone({
                            x: 100,
                            y: 100,
                            actorLink: true,
                        }),
                        { parent: s },
                    );
                    const obj = td.toObject();
                    obj.actorLink = true;
                    const [token] = await td.constructor.createDocuments(
                        [obj],
                        {
                            parent: s,
                        },
                    );

                    const outside = region.tokens.size;
                    const before = win.game.messages.size;
                    // …and moved in. Containment resolves canvas-free, so this
                    // is the real seam a player crosses, not a simulated one.
                    // `animate: false` keeps the movement animation off the
                    // PIXI ticker, which headless reaches into a viewport that
                    // never finishes initializing (see map-notes.cy.js).
                    await token.update(
                        win.structuredClone({ x: 1100, y: 1100 }),
                        { animate: false },
                    );
                    await new Promise((res) => win.setTimeout(res, 200));

                    const msg = win.game.messages.contents.at(-1);
                    const div = win.document.createElement("div");
                    div.innerHTML = msg?.content ?? "";
                    const btn = div.querySelector(
                        'button.action-card-button[data-action="fearCheck"]',
                    );
                    const result = {
                        behaviorType: behavior?.type,
                        behaviorEvents: [...(behavior?.system.events ?? [])],
                        outside,
                        inside: region.tokens.size,
                        cardsPosted: win.game.messages.size - before,
                        hasPerformButton: !!btn,
                        handlerUuid: btn?.dataset.handlerUuid,
                        actorUuid: a.uuid,
                    };
                    await token.delete();
                    return result;
                }).should((r) => {
                    expect(
                        r.behaviorType,
                        "the trigger subtype created (not dropped to base)",
                    ).to.eq("trigger");
                    expect(r.behaviorEvents).to.include("tokenEnter");
                    expect(r.outside, "started outside the region").to.eq(0);
                    expect(r.inside, "and ended inside it").to.eq(1);
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
