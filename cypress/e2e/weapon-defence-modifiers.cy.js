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
 * A shipped weapon's authored block and counterstrike modifiers reach its
 * strike mode in a running client.
 *
 * The unit suite checks the authored frontmatter against the schema and the
 * reader; only a live client proves the whole chain — note, compiled pack,
 * Foundry document validation, and the logic rebuild — keeps the value. A key
 * the schema does not declare is dropped at document construction, so a wrong
 * spelling arrives here as a zero rather than an error.
 */

/** A weapon whose modes block worse than they strike, and by how much. */
const PENALISED = { shortcode: "haxe", name: "Handaxe", block: -10, counterstrike: -10 };
/** A weapon whose modes take no defence penalty at all. */
const UNPENALISED = { shortcode: "brdswd", name: "Broadsword" };

describe("weapon defence modifiers", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("carries the authored block and counterstrike modifiers into the compendium document", () => {
        cy.getFromCompendium("sohl.items", "weapongear", PENALISED.shortcode).should((weapon) => {
            const modes = weapon.system.strikeModes.filter((sm) => sm.type === "melee");
            expect(modes.length, "melee modes").to.be.greaterThan(0);
            for (const mode of modes) {
                expect(mode.defense.block.modifier, `${mode.shortcode} block`).to.equal(
                    PENALISED.block,
                );
                expect(
                    mode.defense.counterstrike.modifier,
                    `${mode.shortcode} counterstrike`,
                ).to.equal(PENALISED.counterstrike);
            }
        });
    });

    it("seeds the modifier onto the strike mode as a named delta", () => {
        cy.importActor().as("actor");
        cy.then(function () {
            cy.ensureSkillML(this.actor, "melee", 60);
            cy.getFromCompendium("sohl.items", "weapongear", PENALISED.shortcode).then((weapon) =>
                cy.dropOnActor(this.actor, weapon),
            );
            cy.prepare(this.actor);
        });
        cy.then(function () {
            cy.foundry((win) => {
                const actor = win.game.actors.get(this.actor.id);
                const weapon = actor.items.find(
                    (i) => i.type === "weapongear" && i.system.shortcode === PENALISED.shortcode,
                );
                const mode = weapon.logic.strikeModes.find((sm) => sm.isMelee);
                return {
                    blkDelta: mode.defense.block.get("BlkMod")?.numValue ?? null,
                    ctrDelta: mode.defense.counterstrike.get("CtrMod")?.numValue ?? null,
                    // The defence lands at the governing mastery level plus the
                    // weapon's own penalty, which is what the defender rolls.
                    blkEffective: mode.defense.block.effective,
                    ctrEffective: mode.defense.counterstrike.effective,
                };
            }).should((r) => {
                expect(r.blkDelta).to.equal(PENALISED.block);
                expect(r.ctrDelta).to.equal(PENALISED.counterstrike);
                expect(r.blkEffective).to.equal(60 + PENALISED.block);
                expect(r.ctrEffective).to.equal(60 + PENALISED.counterstrike);
            });
        });
    });

    it("leaves a weapon with no authored penalty at its governing mastery level", () => {
        // The contrast that makes the case above mean something: two weapons in
        // the same hand defend differently because their modes say so.
        cy.importActor().as("actor");
        cy.then(function () {
            cy.ensureSkillML(this.actor, "melee", 60);
            cy.getFromCompendium("sohl.items", "weapongear", UNPENALISED.shortcode).then((weapon) =>
                cy.dropOnActor(this.actor, weapon),
            );
            cy.prepare(this.actor);
        });
        cy.then(function () {
            cy.foundry((win) => {
                const actor = win.game.actors.get(this.actor.id);
                const weapon = actor.items.find(
                    (i) => i.type === "weapongear" && i.system.shortcode === UNPENALISED.shortcode,
                );
                const mode = weapon.logic.strikeModes.find((sm) => sm.isMelee);
                return {
                    blkDelta: mode.defense.block.get("BlkMod")?.numValue ?? null,
                    blkEffective: mode.defense.block.effective,
                };
            }).should((r) => {
                expect(r.blkDelta).to.equal(null);
                expect(r.blkEffective).to.equal(60);
            });
        });
    });
});
