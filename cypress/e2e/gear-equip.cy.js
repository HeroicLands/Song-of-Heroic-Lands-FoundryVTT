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
 * Tests the carry-state toggle (`setCarried` / `setNotCarried` intrinsic
 * actions) and the combat-tab strike-mode display for embedded weapongear.
 * Display is NOT gated by equip/hold today — strike modes appear regardless
 * of whether the weapon is held or equipped.
 *
 * RED skips mark two gaps tracked in #179 and #180.
 */

// sohl.items compendium IDs
const MAIL_SHIRT_ID = "0S3xT8nBEex8PZJC"; // armorgear
const DAGGER_ID = "9ijT9drcTK805O5F"; // weapongear — melee impale strike mode

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

                    // Drop it
                    cy.runAction(armor, "setNotCarried");
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(armor.id).system.isCarried;
                    }).should("be.false");

                    // Pick it back up
                    cy.runAction(armor, "setCarried");
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        return a.items.get(armor.id).system.isCarried;
                    }).should("be.true");
                },
            );
        });
    });

    // ------------------------------------------------------------------ RED

    it.skip("combat tab shows weapongear strike modes when weapon is held", () => {
        // RED — blocked by #179: filterHeldWeapons (BeingSheet.ts:720) only
        // includes weapons where weaponLogic.heldBy.length > 0. A freshly
        // imported weapon is never held, so [data-sm-id] rows never render.
        // Once #179 adds a hold/ready action, drive it and then assert:
        //   cy.get('section.tab[data-tab="combat"] [data-sm-id]').should("exist")
    });

    it.skip("equip armor — sets isEquipped true via intrinsic action", () => {
        // RED — blocked by #179: no writer for system.isEquipped exists.
        // GearLogic.ts:139-142 writes isCarried but GearLogic.ts:166 writes
        // isEquipped; however no equip action shortcode is wired up on armor.
        // Once #179 adds the action, drive it via cy.runAction(armor, "equip")
        // and assert system.isEquipped === true.
    });

    it.skip("hold weapon in a hand — heldBy.length > 0", () => {
        // RED — blocked by #179: bodyPart.heldItemId is only read
        // (BodyPart.ts:97), never written; no hold/ready action exists.
        // Once #179 adds hold/ready, drive it and assert
        // weaponLogic.heldBy.length > 0 (GearLogic.ts:85-95).
    });

    it.skip("unequipped armor contributes no protection", () => {
        // RED — blocked by #180: aggregateArmorProtection (BeingLogic.ts:697-719)
        // ignores isEquipped — all armor counts regardless. A test would assert
        // that protection is 0 when armor is not equipped. Fails today.
    });
});
