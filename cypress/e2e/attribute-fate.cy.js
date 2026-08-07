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
 * Fate on **attribute** tests (#1106).
 *
 * The rules allow a Fate Point on _any_ skill or attribute test, but
 * `availableFate` existed only on skills, so an attribute's test card never
 * offered the Fate button and `AttributeLogic.fateMasteryLevel` was never
 * assigned. These specs drive the live client to prove the attribute side is
 * armed:
 *
 * - an attribute resolves the actor's eligible Fate Mysteries;
 * - its `fateMasteryLevel` is seeded (and carries the Aura bonus);
 * - a real success test on the attribute is `canFate`;
 * - the Aura attribute itself can never be fated.
 */

describe("Fate on attribute tests (#1106)", () => {
    before(() =>
        cy.login().then(() => {
            cy.cleanupWorld();
            // Fate rules must be enabled for a fateMasteryLevel to arm.
            cy.foundry((win) =>
                win.game.settings.set("sohl", "optionFate", "everyone"),
            );
        }),
    );

    afterEach(() => cy.cleanupWorld());

    /** Give the imported actor a general Fate Point with two charges. */
    function withGeneralFatePoint(actor) {
        return cy.createItemOn(actor, "mystery", {
            name: "Lucky Star",
            system: {
                subType: "fate",
                assocSkillCode: null,
                levelBase: null,
                charges: { value: 2, max: 3 },
            },
        });
    }

    it("resolves eligible Fate Points and arms the fate mastery level", () => {
        cy.importActor().then((actor) => {
            withGeneralFatePoint(actor).then(() => {
                cy.prepare(actor);
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    // Basic Folk carries the standard attribute set.
                    const str = a.items.find(
                        (i) =>
                            i.type === "attribute" &&
                            i.system.shortcode === "str",
                    );
                    if (!str) return { found: false };
                    return {
                        found: true,
                        points: str.logic.availableFate.length,
                        armed: !str.logic.fateMasteryLevel.disabled,
                        base: str.logic.fateMasteryLevel.base,
                        // The Aura bonus is half the Aura attribute's mastery
                        // level, so an armed fate ML exceeds its base of 50.
                        effective: str.logic.fateMasteryLevel.effective,
                    };
                }).should((r) => {
                    expect(r.found, "str attribute present").to.be.true;
                    expect(r.points, "eligible Fate Points").to.eq(1);
                    expect(r.armed, "fate mastery level armed").to.be.true;
                    expect(r.base, "fate mastery level base").to.eq(50);
                    expect(
                        r.effective,
                        "Aura bonus folded into the fate mastery level",
                    ).to.be.greaterThan(50);
                });
            });
        });
    });

    it("makes an attribute's success test offer Fate", () => {
        cy.importActor().then((actor) => {
            withGeneralFatePoint(actor).then(() => {
                cy.prepare(actor);
                cy.foundry(async (win) => {
                    const a = win.game.actors.get(actor.id);
                    const str = a.items.find(
                        (i) =>
                            i.type === "attribute" &&
                            i.system.shortcode === "str",
                    );
                    const SimpleRoll = win.sohl.entity.roll.SimpleRoll;
                    const CTX = win.sohl.entity.action.SohlActionContext;

                    // A plain non-critical roll; the card must carry the Fate
                    // button, which is gated on `canFate`.
                    SimpleRoll.forceValues(34);
                    const result = await str.logic.successTest(
                        new CTX({
                            speaker: a.getSpeaker(),
                            type: "attribute-fate-gate",
                            title: "STR",
                            skipDialog: true,
                            noChat: true,
                        }),
                    );
                    SimpleRoll.clearForced();
                    return { canFate: result?.canFate ?? null };
                }).should((r) => {
                    expect(r.canFate, "attribute test offers Fate").to.be.true;
                });
            });
        });
    });

    it("never offers Fate on the Aura attribute's own test", () => {
        cy.importActor().then((actor) => {
            withGeneralFatePoint(actor).then(() => {
                cy.prepare(actor);
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    const aur = a.items.find(
                        (i) =>
                            i.type === "attribute" &&
                            i.system.shortcode === "aur",
                    );
                    if (!aur) return { found: false };
                    return {
                        found: true,
                        disabled: aur.logic.fateMasteryLevel.disabled,
                    };
                }).should((r) => {
                    expect(r.found, "aur attribute present").to.be.true;
                    expect(r.disabled, "Aura cannot be fated").to.eq(
                        "SOHL.MasteryLevel.AuraBasedNoFate",
                    );
                });
            });
        });
    });
});
