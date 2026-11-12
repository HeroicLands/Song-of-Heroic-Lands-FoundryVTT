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
 * Gear equip / hold → combat-tab display.
 *
 * Covers the three inventory-state toggles and their downstream effects:
 * - carry state (the `toggleCarried` gear action)
 * - worn state (the armor-only `toggleWorn` action → `system.isWorn`) and its
 *   armor-protection gate
 * - hold state (assigned via a body-part write — `cy.holdItem` / `cy.releaseItem`,
 *   a Combat-tab concern, not a gear action) and the combat-tab strike-mode gate
 *
 * The hold roundtrip depends on the whole-array `parts` write. (The
 * `set*`/`holdItem`/`releaseItem` gear actions
 * were retired: carry became a single toggle, worn moved to the armor-scoped
 * `toggleWorn` action / `isWorn` field, and hold is a Combat-tab operation.)
 *
 * Test-setting weapongear cannot be embedded here: every weapon note
 * still stores `strikeModes.defense` in the old flat schema, which throws in
 * `MeleeStrikeMode` during `prepareData()`. Hold / combat-tab tests
 * therefore use an inline weapon with the correct nested defense schema. The
 * armor-gating test uses inline armor keyed to a body-location shortcode for a
 * controlled input; the compendium-armor path is now exercised too (the covered
 * locations are addressed by shortcode, not by name).
 */

// Descriptor for the test setting's Mail Shirt armorgear (carry & equip
// toggles), resolved by `system.shortcode`.
const MAIL_SHIRT_REF = { shortcode: "mshirt", type: "armorgear" };

/** Minimal weapongear with the correct nested defense schema. */
const INLINE_WEAPON = {
    name: "Test Sword",
    system: {
        strikeModes: [
            {
                shortcode: "strike",
                type: "melee",
                name: "Strike",
                assocSkillCode: "melee",
                minParts: 1,
                attack: { spread: 0, modifier: 0 },
                impactBase: {
                    numDice: 1,
                    die: 6,
                    modifier: 0,
                    aspect: "blunt",
                },
                traits: {},
                lengthBase: 3,
                defense: {
                    block: { disabled: false, modifier: 0, successLevelMod: 0 },
                    counterstrike: {
                        disabled: false,
                        modifier: 0,
                        successLevelMod: 0,
                    },
                },
            },
        ],
    },
};

/** Inline armor covering the thorax by shortcode — a controlled aggregation input. */
const INLINE_ARMOR = {
    name: "Test Cuirass",
    system: {
        material: "Steel",
        protectionBase: { blunt: 4, edged: 8, piercing: 5, fire: 0 },
        locations: { flexible: [], rigid: ["thrxloc"] },
    },
};

/** The thorax location's aggregated edged armor protection for `actor`. */
function thoraxEdgedProtection(win, actorId) {
    const a = win.game.actors.get(actorId);
    const thrx = a.logic.body.structure.getAllLocations().find((l) => l.shortcode === "thrxloc");
    return thrx.armorProtection.edged;
}

/**
 * Set an armor's `isWorn` flag to a specific value directly — a deterministic
 * input for the aggregation-gate test (the `toggleWorn` action only flips it).
 * Worn state is armor-scoped (`system.isWorn`).
 */
function setWorn(win, actorId, itemId, value) {
    return win.game.actors
        .get(actorId)
        .items.get(itemId)
        .update(win.JSON.parse(JSON.stringify({ "system.isWorn": value })))
        .then(() => true);
}

describe("gear equip / hold → combat-tab display", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    beforeEach(() => cy.closeAllSheets());
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    // ------------------------------------------------------------------ carry state

    it("toggleCarried flips isCarried", () => {
        cy.createActor("being", { name: "Carry Being" }).then((actor) => {
            cy.fixtureItem(MAIL_SHIRT_REF.type, MAIL_SHIRT_REF.shortcode)
                .then((item) => cy.dropOnActor(actor, item))
                .then((armor) => {
                    // Default: isCarried = true
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(armor.id).system.isCarried;
                    }).should("be.true");

                    cy.runAction(armor, "toggleCarried");
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(armor.id).system.isCarried;
                    }).should("be.false");

                    cy.runAction(armor, "toggleCarried");
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(armor.id).system.isCarried;
                    }).should("be.true");
                });
        });
    });

    // ------------------------------------------------------------------ worn state

    it("toggleWorn flips isWorn on armor", () => {
        cy.createActor("being", { name: "Worn Being" }).then((actor) => {
            cy.fixtureItem(MAIL_SHIRT_REF.type, MAIL_SHIRT_REF.shortcode)
                .then((item) => cy.dropOnActor(actor, item))
                .then((armor) => {
                    // Armor defaults to not worn.
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(armor.id).system.isWorn;
                    }).should("be.false");

                    cy.runAction(armor, "toggleWorn");
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(armor.id).system.isWorn;
                    }).should("be.true");

                    cy.runAction(armor, "toggleWorn");
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(armor.id).system.isWorn;
                    }).should("be.false");
                });
        });
    });

    it("armor protection aggregates only while worn", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "armorgear", INLINE_ARMOR).then((armor) => {
                // Not equipped by default → no protection on the thorax.
                cy.prepare(actor);
                cy.foundry((win) => thoraxEdgedProtection(win, actor.id)).should("eq", 0);

                // Equipping folds the armor's edged protection onto the thorax.
                cy.foundry((win) => setWorn(win, actor.id, armor.id, true));
                cy.prepare(actor);
                cy.foundry((win) => thoraxEdgedProtection(win, actor.id)).should("eq", 8);

                // Unequipping removes it again.
                cy.foundry((win) => setWorn(win, actor.id, armor.id, false));
                cy.prepare(actor);
                cy.foundry((win) => thoraxEdgedProtection(win, actor.id)).should("eq", 0);
            });
        });
    });

    // ------------------------------------------------------------------ hold state

    it("holdItem makes heldBy.length > 0; releaseItem clears it", () => {
        // Basic Folk has a body with Right Arm / Left Arm (canHoldItem).
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "weapongear", INLINE_WEAPON).then((weapon) => {
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    return a.items.get(weapon.id).logic.heldBy.length;
                }).should("eq", 0);

                cy.holdItem(weapon);
                cy.prepare(actor);
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    return a.items.get(weapon.id).logic.heldBy.length;
                }).should("be.greaterThan", 0);

                cy.releaseItem(weapon);
                cy.prepare(actor);
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    return a.items.get(weapon.id).logic.heldBy.length;
                }).should("eq", 0);
            });
        });
    });

    // ------------------------------------------------------------------ combat tab

    it("combat tab shows a weapon's [data-sm-id] strike-mode rows only after holdItem", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "weapongear", INLINE_WEAPON).then((weapon) => {
                // Scope to THIS weapon's rows. Basic Folk owns unarmed
                // combat techniques (punch, kick, bite, …) whose natural
                // strike modes are intrinsic — they render with nothing
                // held, so an unscoped `[data-sm-id]` never reaches zero.
                // Each row carries its source item's id.
                const rows = `section.tab[data-tab="combat"] [data-sm-id][data-item-id="${weapon.id}"]`;

                // Not held: filterHeldWeapons excludes it, so no rows render.
                cy.openSheet(actor);
                cy.switchTab("combat", "primary");
                cy.get(rows).should("not.exist");
                cy.closeAllSheets();

                // Held: the weapon's strike mode appears on the combat tab.
                cy.holdItem(weapon);
                cy.prepare(actor);
                cy.openSheet(actor);
                cy.switchTab("combat", "primary");
                cy.get(rows).should("exist");
            });
        });
    });

    it("equipped compendium Mail Shirt aggregates protection onto covered locations", () => {
        cy.importActor().then((actor) => {
            cy.fixtureItem(MAIL_SHIRT_REF.type, MAIL_SHIRT_REF.shortcode)
                .then((item) => cy.dropOnActor(actor, item))
                .then((armor) => {
                    cy.foundry((win) => setWorn(win, actor.id, armor.id, true));
                    cy.prepare(actor);
                    cy.foundry((win) => thoraxEdgedProtection(win, actor.id)).should(
                        "be.greaterThan",
                        0,
                    );
                });
        });
    });
});
