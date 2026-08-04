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
 * Mysteries & Mystical Abilities — the `useMystery` and `successTest` actions.
 *
 * `MysteryLogic` registers a `useMystery` intrinsic action (GREEN: it is present
 * on the item's logic), but its executor is not yet wired (RED against #72 Use
 * Mystery).
 *
 * A Mystical Ability is *invoked* by rolling a Success Test against its mastery
 * level (EML) — the same seam a skill uses — not a bespoke "perform" that
 * adjudicates the effect (#74): the system rolls, the player reads the rulebook
 * and applies the result. `MysticalAbilityLogic` therefore registers a
 * `successTest` intrinsic action (replacing the retired `perform` stub), and the
 * Mysteries-tab EML cell is rollable.
 */

describe("mysteries", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // GREEN: a mystery item registers the `useMystery` intrinsic action.
    it("a mystery item registers the useMystery intrinsic action", () => {
        cy.createActor("being", { name: "mystic" }).then((actor) => {
            cy.createItemOn(actor, "mystery", { name: "Second Sight" }).then(
                (item) => {
                    cy.foundry((win) => {
                        const it = win.game.actors
                            .get(actor.id)
                            .items.get(item.id);
                        return {
                            type: it?.type,
                            hasUseMystery:
                                !!it?.logic?.actions?.get("useMystery"),
                        };
                    }).should((r) => {
                        expect(r.type, "mystery item").to.eq("mystery");
                        expect(r.hasUseMystery, "useMystery action registered")
                            .to.be.true;
                    });
                },
            );
        });
    });

    // GREEN (#74): a mystical ability registers a visible `successTest` action —
    // the same shortcode a skill uses — and no longer carries the retired
    // `perform` stub.
    it("a mystical ability registers successTest, not the retired perform stub (#74)", () => {
        cy.createActor("being", { name: "mystic" }).then((actor) => {
            cy.createItemOn(actor, "mysticalability", {
                name: "Fox Totem",
                system: { masteryLevelBase: 40 },
            }).then((item) => {
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    const it = a.items.get(item.id);
                    const action = it?.logic?.actions?.get("successTest");
                    // The trigger row carries the item's id, as the rendered
                    // ledger row does (data-item-id on .item).
                    const el = {
                        closest: (sel) =>
                            sel === "[data-item-id]" ?
                                { dataset: { itemId: it.id } }
                            : sel === "[data-actor-id]" ?
                                { dataset: { actorId: a.id } }
                            :   null,
                    };
                    return {
                        type: it?.type,
                        hasSuccessTest: !!action,
                        visible: !!action && action.visible(el),
                        hasPerform: !!it?.logic?.actions?.get("perform"),
                    };
                }).should((r) => {
                    expect(r.type, "mysticalability item").to.eq(
                        "mysticalability",
                    );
                    expect(r.hasSuccessTest, "successTest action registered").to
                        .be.true;
                    expect(r.visible, "successTest is visible").to.be.true;
                    expect(r.hasPerform, "perform stub removed").to.be.false;
                });
            });
        });
    });

    // GREEN (#74): invoking the ability runs a real success test against its
    // mastery level, exactly like a skill's EML roll.
    it("a mystical ability rolls a success test against its EML (#74)", () => {
        cy.createActor("being", { name: "mystic" }).then((actor) => {
            cy.createItemOn(actor, "mysticalability", {
                name: "Fox Totem",
                system: { masteryLevelBase: 40 },
            }).then((item) => {
                // prepare() resolves the actor's speaker (owner) so the success
                // test is allowed to roll — see the ownership guard in
                // SuccessTestResult.evaluate.
                cy.prepare(actor);
                cy.foundry((win) => {
                    const it = win.game.actors.get(actor.id).items.get(item.id);
                    return it.logic
                        .executeAction("successTest", {
                            skipDialog: true,
                            scope: {},
                        })
                        .then((res) => ({
                            ml: it.logic.masteryLevel.effective,
                            ctorName: res?.constructor?.name ?? null,
                            hasResult: !!res,
                        }));
                }).should((s) => {
                    expect(s.ml, "mastery level seeded from base").to.eq(40);
                    expect(s.hasResult, "successTest produced a result").to.be
                        .true;
                    expect(s.ctorName, "result is a SuccessTestResult").to.eq(
                        "SuccessTestResult",
                    );
                });
            });
        });
    });

    // GREEN (#74): the Mysteries-tab EML cell is rollable — it carries the
    // successTest action and the rollable affordance, mirroring the Skills tab.
    it("renders the Mystical Abilities EML cell as a rollable successTest (#74)", () => {
        cy.createActor("being", { name: "mystic" }).then((actor) => {
            cy.createItemOn(actor, "mysticalability", {
                name: "Fox Totem",
                system: { masteryLevelBase: 40 },
            }).then(() => {
                cy.openSheet(actor);
                cy.switchTab("mysteries", "primary");
                cy.get(
                    'section.tab[data-tab="mysteries"] .mysticalabilities-list ' +
                        '.ledger__cell--rollable[data-action="successTest"]',
                )
                    .first()
                    .should(($el) => {
                        expect($el).to.have.attr("data-tooltip");
                        expect($el).to.have.attr(
                            "data-tooltip-direction",
                            "UP",
                        );
                    });
            });
        });
    });

    // GREEN (#1012): a Mystical Ability can name a faction/Affiliation it draws
    // its standing from; the logic resolves it on the same actor and the
    // Mysteries-tab shows its name in the Affiliation column (after Skill).
    it("resolves and shows the associated Affiliation's name in the Mysteries tab (#1012)", () => {
        cy.createActor("being", { name: "mystic" }).then((actor) => {
            cy.createItemOn(actor, "affiliation", {
                name: "Church of Larani",
                system: { shortcode: "larani", level: 3 },
            });
            cy.createItemOn(actor, "mysticalability", {
                name: "Fire Bolt",
                system: {
                    subType: "arcaneincantation",
                    masteryLevelBase: 40,
                    assocAffiliationCode: "larani",
                },
            }).then((item) => {
                // The logic resolves the affiliation on the same actor.
                cy.prepare(actor);
                cy.foundry((win) => {
                    const it = win.game.actors.get(actor.id).items.get(item.id);
                    return it.logic.assocAffiliation?.name ?? null;
                }).should("eq", "Church of Larani");

                cy.openSheet(actor);
                cy.switchTab("mysteries", "primary");
                const tab = 'section.tab[data-tab="mysteries"] ';
                // The Affiliation column header renders…
                cy.get(tab + ".mysticalabilities-list .ledger__head").contains(
                    "Affiliation",
                );
                // …and the ability row shows the affiliation name.
                cy.get(tab + ".mysticalabilities-list .ledger__row").contains(
                    "Church of Larani",
                );
            });
        });
    });

    // RED — blocked by #72 (Use Mystery action): the useMystery executor is not
    // yet implemented. Un-skip and assert the produced effect / chat card once wired.
    it.skip("useMystery performs the mystery's effect (#72)", () => {});
});
