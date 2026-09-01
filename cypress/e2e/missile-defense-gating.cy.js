/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { toRealm } from "../support/resolve";

/**
 * Block and counterstrike on a missile-only weapon (#1137). A missile strike
 * mode carries no block or counterstrike modifier, so those actions could never
 * do anything — they must not be offered, and a request that reaches the
 * executor anyway must say so on screen instead of failing silently.
 */

/** A missile strike-mode payload (a bow's shot). */
function missileMode(name = "Shoot") {
    return {
        shortcode: "shoot",
        type: "missile",
        name,
        assocSkillCode: "bow",
        minParts: 2,
        projectileType: "arrow",
        maxVolleyMult: 1,
        baseRangeBase: 50,
        drawBase: 10,
        attack: { spread: 0, modifier: 0 },
        impactBase: { numDice: 1, die: 6, modifier: 0, aspect: "piercing" },
        traits: {},
    };
}

/** A melee strike-mode payload (a spear's thrust). */
function meleeMode(name = "Thrust") {
    return {
        shortcode: "thrust",
        type: "melee",
        name,
        assocSkillCode: "melee",
        minParts: 1,
        lengthBase: 6,
        attack: { spread: 0, modifier: 0 },
        impactBase: { numDice: 1, die: 6, modifier: 0, aspect: "piercing" },
        traits: {},
        defense: {
            block: { disabled: false, modifier: 0, successLevelMod: 0 },
            counterstrike: { disabled: false, modifier: 0, successLevelMod: 0 },
        },
    };
}

/** The element a context-menu visibility predicate resolves its logic from. */
function rowElement(itemId, actorId) {
    return {
        closest: (selector) => {
            if (selector === "[data-item-id]") return { dataset: { itemId } };
            if (selector === "[data-actor-id]") return { dataset: { actorId } };
            return null;
        },
    };
}

describe("missile-only weapons don't offer block/counterstrike (#1137)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("hides block and counterstrike on a held missile-only weapon", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "weapongear", {
                name: "Test Bow",
                system: { strikeModes: [missileMode()] },
            }).then((weapon) => {
                cy.holdItem(weapon);
                cy.prepare(actor);

                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    const w = a.items.get(weapon.id);
                    const el = rowElement(w.id, a.id);
                    const vis = (name) => w.logic.actions.get(name).visible(el);
                    return {
                        held: w.logic.heldBy.length,
                        hasMelee: w.logic.hasMeleeStrikeMode,
                        attack: vis("attackTest"),
                        block: vis("blockTest"),
                        counterstrike: vis("counterstrikeTest"),
                    };
                }).should((r) => {
                    expect(r.held, "weapon is held").to.be.greaterThan(0);
                    expect(r.hasMelee, "no melee mode").to.be.false;
                    expect(r.attack, "attack still offered").to.be.true;
                    expect(r.block, "block hidden").to.be.false;
                    expect(r.counterstrike, "counterstrike hidden").to.be.false;
                });
            });
        });
    });

    it("offers them again once the weapon gains a melee mode", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "weapongear", {
                name: "Test Spear",
                system: { strikeModes: [missileMode("Throw")] },
            }).then((weapon) => {
                cy.holdItem(weapon);
                cy.prepare(actor);

                // A mixed weapon (throws and thrusts) keeps both actions — the
                // gate is "has a melee mode", not "is melee-only".
                cy.foundry((win) => {
                    const w = win.game.actors.get(actor.id).items.get(weapon.id);
                    return w
                        .update(
                            toRealm(win, {
                                "system.strikeModes": [missileMode("Throw"), meleeMode()],
                            }),
                        )
                        .then(() => null);
                });
                cy.prepare(actor);

                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    const w = a.items.get(weapon.id);
                    const el = rowElement(w.id, a.id);
                    return {
                        hasMelee: w.logic.hasMeleeStrikeMode,
                        block: w.logic.actions.get("blockTest").visible(el),
                        counterstrike: w.logic.actions.get("counterstrikeTest").visible(el),
                    };
                }).should((r) => {
                    expect(r.hasMelee, "melee mode present").to.be.true;
                    expect(r.block, "block offered").to.be.true;
                    expect(r.counterstrike, "counterstrike offered").to.be.true;
                });
            });
        });
    });

    it("warns on screen when a block is invoked on a missile mode anyway", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "weapongear", {
                name: "Test Sling",
                system: { strikeModes: [missileMode("Sling")] },
            }).then((weapon) => {
                cy.holdItem(weapon);
                cy.prepare(actor);

                // Capture UI notifications, then invoke the executor directly —
                // the route a macro or chat-card button still takes.
                cy.foundry(async (win) => {
                    win.__sohlWarns = [];
                    const notifications = win.ui.notifications;
                    const original = notifications.warn.bind(notifications);
                    notifications.warn = (msg, ...rest) => {
                        win.__sohlWarns.push(String(msg));
                        return original(msg, ...rest);
                    };
                    const w = win.game.actors.get(actor.id).items.get(weapon.id);
                    const result = await w.logic.executeAction("blockTest", {
                        skipDialog: true,
                    });
                    notifications.warn = original;
                    return {
                        result,
                        warns: win.__sohlWarns,
                    };
                }).should((r) => {
                    expect(r.result, "the test does not run").to.not.be.ok;
                    expect(r.warns.join(" "), "warns on screen").to.match(/cannot perform/i);
                });
            });
        });
    });
});
