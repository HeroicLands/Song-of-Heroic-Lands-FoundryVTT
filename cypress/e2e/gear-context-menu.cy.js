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
 * Gear-row ⋮ context menu bindings (#1132).
 *
 * A context-menu predicate resolves its `itemLogic` / `actorLogic` bindings by
 * walking up from the clicked row to the nearest `[data-item-id]` /
 * `[data-actor-id]` ancestor. **No sheet emitted `data-actor-id`**, so the item
 * lookup — which went through the resolved actor — always came up empty and
 * `itemLogic` was permanently `undefined`. Every action whose `visible` or
 * `trigger` names `itemLogic` therefore vanished from every sheet row menu:
 * armour's Toggle Worn, a weapon's Attack / Block / Counterstrike, a combat
 * technique's Improve with SDR. Only the four `GearLogic.CARRIED_GATE_EXEMPT`
 * entries (whose triggers name nothing) survived.
 *
 * These specs assert the **rendered** menu, not a synthetic row object: they
 * click the real ⋮ on a real gear row in the open sheet and read the entries
 * Foundry actually painted. A synthetic `closest()` stub — as
 * `context-menu-condition.cy.js` uses to exercise the predicates themselves —
 * cannot catch this, because it supplies the very marker the sheet was missing.
 */

import { toRealm } from "../support/resolve";

/** A weapon with a melee strike mode, so Block / Counterstrike apply. */
function meleeWeapon(name = "Arming Sword") {
    return {
        name,
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
                        aspect: "edged",
                    },
                    traits: {},
                    lengthBase: 3,
                    defense: {
                        block: {
                            disabled: false,
                            modifier: 0,
                            successLevelMod: 0,
                        },
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
}

describe("gear-row context menu bindings (#1132)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    // The known logger recursion (#267) turns a stray uiWarn into a stack
    // overflow; don't let an unrelated background warning fail these.
    Cypress.on("uncaught:exception", () => false);

    /**
     * Click the ⋮ control on a gear row of the open sheet and yield the labels
     * Foundry rendered into the menu.
     */
    function rowMenuLabels(actorId, itemId) {
        cy.foundry((win) => {
            const el = win.game.actors
                .get(actorId)
                .sheet.element.querySelector(`[data-item-id="${itemId}"] .item-contextmenu`);
            expect(el, `⋮ control on row ${itemId}`).to.exist;
            el.click();
            return null;
        });
        // The menu renders asynchronously — poll through cy.window(), which
        // retries, rather than cy.foundry().should(), which does not.
        cy.window().should((win) => {
            const menu = win.document.querySelector("#context-menu");
            expect(menu, "context menu opened").to.not.be.null;
            expect(
                menu.querySelectorAll(".context-item").length,
                "menu has entries",
            ).to.be.greaterThan(0);
        });
        return cy
            .window()
            .then((win) =>
                [
                    ...win.document
                        .querySelector("#context-menu")
                        .querySelectorAll(".context-item"),
                ].map((e) => e.textContent.trim()),
            );
    }

    /** Open the actor's Gear tab, ready for a row menu. */
    function openGearTab(actor) {
        cy.prepare(actor);
        cy.openSheet(actor);
        cy.switchTab("gear");
        cy.wait(400);
    }

    it("marks the sheet root with data-actor-id so row menus can bind", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const root = a.sheet.element;
                const row = root.querySelector("[data-item-id]");
                return {
                    rootActorId: root.dataset.actorId ?? null,
                    // The binding the predicates actually perform.
                    resolvedFromRow: row?.closest("[data-actor-id]")?.dataset.actorId ?? null,
                    expected: a.id,
                };
            }).should((s) => {
                expect(s.rootActorId, "sheet root data-actor-id").to.eq(s.expected);
                expect(s.resolvedFromRow, "a row resolves its actor by the documented walk").to.eq(
                    s.expected,
                );
            });
        });
    });

    it("lists Toggle Worn on a carried armour's row menu", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "armorgear", { name: "Mail Hauberk" }).then((armor) => {
                // Gear is created carried; assert that rather than assume it.
                cy.foundry(
                    (win) => win.game.actors.get(actor.id).items.get(armor.id).system.isCarried,
                ).should("be.true");

                openGearTab(actor);
                rowMenuLabels(actor.id, armor.id).should((labels) => {
                    expect(labels, "carried armour menu").to.include("Toggle Worn");
                    // The un-gated entries were never the problem; they
                    // pin the menu as genuinely rendered.
                    expect(labels).to.include("Toggle Carried");
                });
            });
        });
    });

    it("omits Toggle Worn from an uncarried armour's row menu", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "armorgear", { name: "Mail Hauberk" }).then((armor) => {
                cy.foundry((win) =>
                    win.game.actors
                        .get(actor.id)
                        .items.get(armor.id)
                        // The payload must be built in the game window's
                        // JS realm — a literal from the Cypress bundle is
                        // rejected ("must be constructed with a DataModel
                        // or Object").
                        .update(toRealm(win, { "system.isCarried": false })),
                );
                cy.foundry(
                    (win) => win.game.actors.get(actor.id).items.get(armor.id).system.isCarried,
                ).should("be.false");

                openGearTab(actor);
                rowMenuLabels(actor.id, armor.id).should((labels) => {
                    // The carried gate is real, not an artefact of the
                    // binding being broken for everything.
                    expect(labels, "uncarried armour menu").to.not.include("Toggle Worn");
                    expect(labels).to.include("Toggle Carried");
                });
            });
        });
    });

    it("lists Attack, Block, and Counterstrike on a held carried weapon's row menu", () => {
        cy.importActor().then((actor) => {
            cy.createItemOn(actor, "weapongear", meleeWeapon()).then((weapon) => {
                // Attack needs the weapon held; Block/Counterstrike also
                // need a melee strike mode (both `visible` predicates name
                // itemLogic, which is what #1132 could not resolve).
                cy.holdItem(weapon);
                cy.foundry((win) => {
                    const w = win.game.actors.get(actor.id).items.get(weapon.id);
                    return {
                        held: w.logic.heldBy.length,
                        carried: w.system.isCarried,
                        melee: w.logic.hasMeleeStrikeMode,
                    };
                }).should((s) => {
                    expect(s.held, "weapon is held").to.be.greaterThan(0);
                    expect(s.carried, "weapon is carried").to.be.true;
                    expect(s.melee, "weapon has a melee strike mode").to.be.true;
                });

                openGearTab(actor);
                rowMenuLabels(actor.id, weapon.id).should((labels) => {
                    expect(labels, "weapon menu").to.include("Attack");
                    expect(labels, "weapon menu").to.include("Block");
                    expect(labels, "weapon menu").to.include("Counterstrike");
                });
            });
        });
    });
});
