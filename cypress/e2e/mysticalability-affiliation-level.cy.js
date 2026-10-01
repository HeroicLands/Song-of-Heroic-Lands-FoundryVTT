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
 * A mystical ability's affiliation-level requirement, on a live sheet.
 *
 * The unit suite covers the derivation. What a running client adds is the two
 * things it cannot see: that a change to the body's standing re-derives the
 * requirement through the real preparation cycle, and that the shortfall is
 * marked on the Mysteries tab while the ability stays rollable.
 */

/** The affiliation the incantation is credentialed by. */
const BODY = { shortcode: "lyahvi", name: "Lyahvi Convocation" };
/** A level-3 arcane incantation, so grade 3 is what the body teaches it at. */
const SPELL = { shortcode: "sunbeam", name: "Sunbeam", level: 3 };

/** Read the ability's derived requirement off the live logic. */
function requirement(win, actorId, abilityId) {
    const ability = win.game.actors.get(actorId).items.get(abilityId).logic;
    return {
        required: ability.requiredAffiliationLevel ?? null,
        shortfall: ability.affiliationShortfall,
        meets: ability.meetsAffiliationRequirement,
        held: ability.affiliation?.level.effective ?? null,
        // An unmet requirement governs what may be taught, so it must leave the
        // ability usable.
        disabled: ability.isDisabled,
        eml: ability.masteryLevel.effective,
    };
}

describe("mystical ability affiliation level", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    /** A being holding the body at `level` and the incantation that names it. */
    function arcanist(level) {
        cy.createActor("being", { name: "Arcanist" }).as("actor");
        cy.then(function () {
            cy.createItemOn(this.actor, "affiliation", {
                name: BODY.name,
                system: {
                    shortcode: BODY.shortcode,
                    subType: "arcanetradition",
                    level,
                },
            }).as("body");
            cy.createItemOn(this.actor, "mysticalability", {
                name: SPELL.name,
                system: {
                    shortcode: SPELL.shortcode,
                    subType: "arcaneincantation",
                    levelBase: SPELL.level,
                    masteryLevelBase: 60,
                    assocAffiliationCode: BODY.shortcode,
                },
            }).as("spell");
            cy.prepare(this.actor);
        });
    }

    it("asks the incantation's level of the body that teaches it", () => {
        arcanist(SPELL.level);
        cy.then(function () {
            cy.foundry((win) => requirement(win, this.actor.id, this.spell.id)).should((r) => {
                expect(r.required).to.equal(SPELL.level);
                expect(r.held).to.equal(SPELL.level);
                expect(r.shortfall).to.equal(0);
                expect(r.meets).to.be.true;
            });
        });
    });

    it("reports the shortfall of a lay member, and blocks nothing", () => {
        arcanist(0);
        cy.then(function () {
            cy.foundry((win) => requirement(win, this.actor.id, this.spell.id)).should((r) => {
                expect(r.required).to.equal(SPELL.level);
                expect(r.held).to.equal(0);
                expect(r.shortfall).to.equal(SPELL.level);
                expect(r.meets).to.be.false;
                expect(r.disabled, "still invokable").to.be.false;
                // Level x 2 casting penalty only; the shortfall costs nothing.
                expect(r.eml).to.equal(60 - SPELL.level * 2);
            });
        });
    });

    it("crosses the threshold when the body's level moves", () => {
        arcanist(1);
        cy.then(function () {
            const actorId = this.actor.id;
            const spellId = this.spell.id;
            const bodyId = this.body.id;
            cy.foundry((win) => requirement(win, actorId, spellId)).should((r) => {
                expect(r.shortfall).to.equal(2);
            });
            // Advancement in the body, through the real preparation cycle. An
            // Active Effect written against `mod:logic.level` lands on the same
            // modifier, which is why the requirement is derived on read.
            cy.foundry(async (win) => {
                const affiliation = win.game.actors.get(actorId).items.get(bodyId);
                await affiliation.update(win.JSON.parse(win.JSON.stringify({ "system.level": 3 })));
                return null;
            });
            cy.prepare(this.actor);
            cy.foundry((win) => requirement(win, actorId, spellId)).should((r) => {
                expect(r.held).to.equal(3);
                expect(r.shortfall).to.equal(0);
                expect(r.meets).to.be.true;
            });
        });
    });

    it("marks the shortfall on the Mysteries tab and leaves the row rollable", () => {
        arcanist(0);
        cy.then(function () {
            cy.openSheet(this.actor);
            cy.switchTab("mysteries", "primary");
            const row = `.ledger__row[data-item-id="${this.spell.id}"]`;
            cy.get(row).find("i.fa-triangle-exclamation").should("exist");
            cy.get(row).find(".ledger__cell--rollable").should("exist");
        });
    });

    it("marks nothing when the standing covers the incantation", () => {
        arcanist(SPELL.level);
        cy.then(function () {
            cy.openSheet(this.actor);
            cy.switchTab("mysteries", "primary");
            cy.get(`.ledger__row[data-item-id="${this.spell.id}"]`)
                .find("i.fa-triangle-exclamation")
                .should("not.exist");
        });
    });
});
