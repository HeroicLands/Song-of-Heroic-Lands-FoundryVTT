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
 * Combat-technique-as-skill contract (epic #322).
 *
 * A `combattechnique` skill carries an embedded strike mode whose
 * Attack/Block/Counterstrike derive from the skill's own mastery level. This
 * spec exercises the Foundry-boundary behavior that the pure unit tests
 * (`tests/item/Skill.test.ts`) cannot:
 *
 * - **#325** — creating a `combattechnique` skill with no strike mode seeds a
 *   default melee one (via `SkillDataModel._preCreate`), so the item is
 *   immediately valid; other subtypes keep a null strike mode.
 * - **#323** — a persisted strike mode round-trips Foundry's schema and its
 *   Atk/Blk/CX reflect the governing mastery level.
 */
describe("combattechnique skill", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("seeds a default melee strike mode on create when none is supplied", () => {
        cy.createActor("being", { name: "CT Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Karate",
                system: { subType: "combattechnique", masteryLevelBase: 30 },
            }).then((skill) => {
                cy.foundry((win) => {
                    const sk = win.fromUuidSync(skill.uuid);
                    return {
                        smType: sk.system.strikeMode?.type,
                        smName: sk.system.strikeMode?.name,
                        logicBuilt: sk.logic.strikeModes.length,
                    };
                }).should((r) => {
                    expect(r.smType).to.equal("melee");
                    expect(r.smName).to.equal("Karate"); // named after the skill
                    expect(r.logicBuilt).to.equal(1);
                });
            });
        });
    });

    it("leaves a non-technique skill's strike mode null", () => {
        cy.createActor("being", { name: "Plain Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Rhetoric",
                system: { subType: "social", masteryLevelBase: 30 },
            }).then((skill) => {
                cy.foundry((win) => {
                    const sk = win.fromUuidSync(skill.uuid);
                    return {
                        sm: sk.system.strikeMode,
                        logicBuilt: sk.logic.strikeModes.length,
                    };
                }).should((r) => {
                    expect(r.sm).to.equal(null);
                    expect(r.logicBuilt).to.equal(0);
                });
            });
        });
    });

    it("derives the strike mode's Atk/Blk/CX from the skill's mastery level", () => {
        cy.createActor("being", { name: "Fighter" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Brawling",
                system: {
                    subType: "combattechnique",
                    masteryLevelBase: 40,
                    strikeMode: {
                        type: "melee",
                        name: "Punch",
                        lengthBase: 1,
                        attack: { modifier: 5 },
                        impactBase: {
                            numDice: 1,
                            die: 6,
                            modifier: 0,
                            aspect: "blunt",
                        },
                        defense: {
                            block: { modifier: 3 },
                            counterstrike: { modifier: -2 },
                        },
                    },
                },
            }).then((skill) => {
                cy.prepare(actor);
                cy.foundry((win) => {
                    const sm = win.fromUuidSync(skill.uuid).logic.strikeMode;
                    return {
                        atk: sm.attack.effective, // 40 ML + 5
                        blk: sm.defense.block.effective, // 40 + 3
                        cx: sm.defense.counterstrike.effective, // 40 - 2
                    };
                }).should((r) => {
                    expect(r.atk).to.equal(45);
                    expect(r.blk).to.equal(43);
                    expect(r.cx).to.equal(38);
                });
            });
        });
    });

    // RED — blocked by #797 (regressed by the epic #782 Manuscript redesign):
    // the redesigned Skills tab hides empty subtype groups
    // (`{{#if group.skills.length}}`, the present-only pattern used across every
    // redesigned Being tab), so the always-present empty Combat Technique
    // section + its seeded create control (#714) no longer renders for a being
    // with no combat techniques. A being can still create one via the tab's
    // global "Add Skill" footer (subtype picker). Un-skip when #797 restores the
    // affordance (or delete if #714 is formally retired).
    it.skip("shows a Combat Technique section with a create control on the Skills tab even when empty (#714)", () => {
        cy.createActor("being", { name: "Empty Being" }).then((actor) => {
            cy.openSheet(actor);
            cy.switchTab("skills", "primary");
            cy.wait(300);
            // The section is always present (no combat techniques yet), and its
            // header offers the "+ Add" control seeded with the subtype.
            cy.get('section.tab[data-tab="skills"]')
                .find(".skills-list .list__header")
                .contains(".list__name", "Combat Technique")
                .should("exist");
            cy.get('section.tab[data-tab="skills"]')
                .find(
                    '.item-create[data-type="skill"][data-sub-type="combattechnique"]',
                )
                .should("exist");
        });
    });

    it("shows the Strike Modes tab + editor only for the technique subtype (#324, #663)", () => {
        cy.createActor("being", { name: "Sheet Being" }).then((actor) => {
            const tabSel = '[data-tab="strikemodes"]';
            // combattechnique → Strike Modes tab present with the seeded mode as a
            // row; opening its editor reflects the mode's name/type.
            cy.createItemOn(actor, "skill", {
                name: "Judo",
                system: { subType: "combattechnique", masteryLevelBase: 30 },
            }).then((ct) => {
                cy.foundry((win) =>
                    Cypress.Promise.resolve(
                        win.fromUuidSync(ct.uuid).sheet.render(true),
                    ).then(() => null),
                );
                cy.wait(400);
                cy.foundry((win) => {
                    const el = win.fromUuidSync(ct.uuid).sheet.element;
                    return {
                        hasTab: !!el.querySelector(tabSel),
                        rowName: el
                            .querySelector(".strikemodes__row .name h4")
                            ?.textContent?.trim(),
                    };
                }).should((r) => {
                    expect(r.hasTab).to.be.true;
                    expect(r.rowName).to.equal("Judo");
                });
                // Open the editor on the single mode and check it binds the name.
                cy.foundry((win) => {
                    const item = win.fromUuidSync(ct.uuid);
                    win.sohl.document.item.foundry.openStrikeModeEditor(
                        item,
                        "single",
                    );
                    return null;
                });
                cy.wait(300);
                cy.window().should((win) => {
                    const inst = win.foundry.applications.instances;
                    const editor = Array.from(inst.values()).find(
                        (a) =>
                            a.id?.startsWith("strike-mode-config-") &&
                            a.rendered,
                    );
                    expect(
                        editor?.element.querySelector('input[name="name"]')
                            ?.value,
                    ).to.eq("Judo");
                });
            });
            // social → no Strike Modes tab
            cy.createItemOn(actor, "skill", {
                name: "Oratory",
                system: { subType: "social", masteryLevelBase: 30 },
            }).then((soc) => {
                cy.foundry((win) =>
                    Cypress.Promise.resolve(
                        win.fromUuidSync(soc.uuid).sheet.render(true),
                    ).then(() => null),
                );
                cy.wait(400);
                cy.foundry(
                    (win) =>
                        !!win
                            .fromUuidSync(soc.uuid)
                            .sheet.element.querySelector(tabSel),
                ).should("be.false");
            });
        });
    });
});
