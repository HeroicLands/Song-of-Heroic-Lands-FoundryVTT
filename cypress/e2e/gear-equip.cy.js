/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
 * - carry state (`setCarried` / `setNotCarried`)
 * - equip state (`setEquipped` / `setNotEquipped`) and its armor-protection gate
 * - hold state (`holdItem` / `releaseItem`) and the combat-tab strike-mode gate
 *
 * The equip/hold write paths landed in #179; the display + aggregation gating in
 * #180; the hold roundtrip depends on the parts-array fix in #247.
 *
 * Compendium weapongear cannot be embedded here: every weapon in `sohl.items`
 * still stores `strikeModes.defense` in the old flat schema, which throws in
 * `MeleeStrikeMode` during `prepareData()` (#246). Hold / combat-tab tests
 * therefore use an inline weapon with the correct nested defense schema.
 * Likewise, compendium armor stores covered locations as names rather than
 * shortcodes (#249), so the armor-gating test uses inline armor keyed to a real
 * body-location shortcode; the compendium path is a RED skip below.
 */

// sohl.items compendium IDs
const MAIL_SHIRT_ID = "0S3xT8nBEex8PZJC"; // armorgear (carry & equip toggles)

/** Minimal weapongear with the correct nested defense schema (avoids #246). */
const INLINE_WEAPON = {
    name: "Test Sword",
    system: {
        strikeModes: {
            strike: {
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
        },
    },
};

/** Inline armor covering the thorax by shortcode (avoids the #249 data gap). */
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
    const lineage = a.items.find((i) => i.type === "lineage");
    const thrx = lineage.logic.bodyStructure
        .getAllLocations()
        .find((l) => l.shortcode === "thrxloc");
    return thrx.armorProtection.edged;
}

describe("gear equip / hold → combat-tab display", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    beforeEach(() => cy.closeAllSheets());
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    // ------------------------------------------------------------------ carry state

    it("setNotCarried sets isCarried false; setCarried restores it", () => {
        cy.createActor("being", { name: "Carry Being" }).then((actor) => {
            cy.importItem("sohl.items", MAIL_SHIRT_ID, { actor }).then(
                (armor) => {
                    // Default: isCarried = true
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(armor.id).system.isCarried;
                    }).should("be.true");

                    cy.runAction(armor, "setNotCarried");
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(armor.id).system.isCarried;
                    }).should("be.false");

                    cy.runAction(armor, "setCarried");
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(armor.id).system.isCarried;
                    }).should("be.true");
                },
            );
        });
    });

    // ------------------------------------------------------------------ equip state

    it("setEquipped sets isEquipped true; setNotEquipped clears it", () => {
        cy.createActor("being", { name: "Equip Being" }).then((actor) => {
            cy.importItem("sohl.items", MAIL_SHIRT_ID, { actor }).then(
                (armor) => {
                    // Default: isEquipped = false
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(armor.id).system.isEquipped;
                    }).should("be.false");

                    cy.runAction(armor, "setEquipped");
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(armor.id).system.isEquipped;
                    }).should("be.true");

                    cy.runAction(armor, "setNotEquipped");
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(armor.id).system.isEquipped;
                    }).should("be.false");
                },
            );
        });
    });

    it("armor protection aggregates only while equipped (#180 gate)", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "armorgear", INLINE_ARMOR).then((armor) => {
                // Not equipped by default → no protection on the thorax.
                cy.prepare(actor);
                cy.foundry((win) =>
                    thoraxEdgedProtection(win, actor.id),
                ).should("eq", 0);

                // Equipping folds the armor's edged protection onto the thorax.
                cy.runAction(armor, "setEquipped");
                cy.prepare(actor);
                cy.foundry((win) =>
                    thoraxEdgedProtection(win, actor.id),
                ).should("eq", 8);

                // Unequipping removes it again.
                cy.runAction(armor, "setNotEquipped");
                cy.prepare(actor);
                cy.foundry((win) =>
                    thoraxEdgedProtection(win, actor.id),
                ).should("eq", 0);
            });
        });
    });

    // ------------------------------------------------------------------ hold state

    it("holdItem makes heldBy.length > 0; releaseItem clears it", () => {
        // Basic Folk has a lineage with Right Arm / Left Arm (canHoldItem).
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "weapongear", INLINE_WEAPON).then(
                (weapon) => {
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(weapon.id).logic.heldBy.length;
                    }).should("eq", 0);

                    cy.runAction(weapon, "holdItem");
                    cy.prepare(actor);
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(weapon.id).logic.heldBy.length;
                    }).should("be.greaterThan", 0);

                    cy.runAction(weapon, "releaseItem");
                    cy.prepare(actor);
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(weapon.id).logic.heldBy.length;
                    }).should("eq", 0);
                },
            );
        });
    });

    // ------------------------------------------------------------------ combat tab

    it("combat tab shows [data-sm-id] strike-mode rows only after holdItem", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "weapongear", INLINE_WEAPON).then(
                (weapon) => {
                    // Not held: filterHeldWeapons excludes it, so no rows render.
                    cy.openSheet(actor);
                    cy.switchTab("combat", "primary");
                    cy.get(
                        'section.tab[data-tab="combat"] [data-sm-id]',
                    ).should("not.exist");
                    cy.closeAllSheets();

                    // Held: the weapon's strike mode appears on the combat tab.
                    cy.runAction(weapon, "holdItem");
                    cy.prepare(actor);
                    cy.openSheet(actor);
                    cy.switchTab("combat", "primary");
                    cy.get(
                        'section.tab[data-tab="combat"] [data-sm-id]',
                    ).should("exist");
                },
            );
        });
    });

    // ------------------------------------------------------------------ RED

    it.skip("equipped compendium Mail Shirt aggregates protection onto covered locations", () => {
        // RED — blocked by #249: compendium ArmorGear stores locations.rigid as
        // display names ("Thorax") while aggregateArmor matches body-location
        // shortcodes ("thrxloc"), so worn compendium armor aggregates zero
        // protection. Once the compendium data is migrated to shortcodes this
        // becomes GREEN as written.
        cy.importActor().then((actor) => {
            cy.importItem("sohl.items", MAIL_SHIRT_ID, { actor }).then(
                (armor) => {
                    cy.runAction(armor, "setEquipped");
                    cy.prepare(actor);
                    cy.foundry((win) =>
                        thoraxEdgedProtection(win, actor.id),
                    ).should("be.greaterThan", 0);
                },
            );
        });
    });
});
