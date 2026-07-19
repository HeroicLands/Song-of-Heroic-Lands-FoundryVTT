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
 * Logic-class registration (#82).
 *
 * A variant module subclasses a base Logic class (exposed at
 * `sohl.itemLogicClasses` / `sohl.actorLogicClasses`) and registers the override
 * via `sohl.registerItemLogic` / `sohl.registerActorLogic`. The read path
 * (`SohlDataModel.create`) is already registry-driven, so every document of that
 * kind built afterward uses the registered class — no construction-site changes.
 *
 * Each test restores the original class so the shared world is left untouched.
 */
describe("logic-class registration", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    it("exposes base Logic classes for every actor and item kind", () => {
        cy.foundry((win) => {
            const s = win.sohl;
            return {
                actorKinds: Object.keys(s.actorLogicClasses),
                itemKinds: Object.keys(s.itemLogicClasses),
                skillIsFn: typeof s.itemLogicClasses.skill === "function",
                beingIsFn: typeof s.actorLogicClasses.being === "function",
            };
        }).should((r) => {
            expect(r.actorKinds, "actor kinds").to.include.members([
                "being",
                "cohort",
                "structure",
                "vehicle",
            ]);
            expect(r.itemKinds, "item kinds").to.include("skill");
            expect(r.skillIsFn).to.be.true;
            expect(r.beingIsFn).to.be.true;
        });
    });

    it("registerItemLogic overrides the Logic class used by newly-created items", () => {
        cy.createActor("being", { name: "Reg Being" }).then((actor) => {
            cy.foundry(async (win) => {
                const s = win.sohl;
                const orig = s.itemLogicClasses.skill;
                // Subclass the live base class in the game realm.
                class TaggedSkill extends orig {
                    get isRegisteredOverride() {
                        return true;
                    }
                }
                s.registerItemLogic("skill", TaggedSkill);
                try {
                    const a = win.game.actors.get(actor.id);
                    const [skill] = await a.createEmbeddedDocuments("Item", [
                        win.JSON.parse(
                            JSON.stringify({
                                name: "Reg Skill",
                                type: "skill",
                            }),
                        ),
                    ]);
                    // `.logic` is lazily built here, while the override is live.
                    return {
                        exposedName: orig?.name,
                        isSubclass: skill.logic instanceof TaggedSkill,
                        marker: skill.logic.isRegisteredOverride === true,
                    };
                } finally {
                    s.registerItemLogic("skill", orig); // restore
                }
            }).should((r) => {
                expect(r.exposedName, "base skill logic exposed").to.be.a(
                    "string",
                );
                expect(r.isSubclass, "new skill uses the registered subclass")
                    .to.be.true;
                expect(r.marker, "subclass member present on the logic").to.be
                    .true;
            });
        });
    });

    it("restores cleanly — after restore, new items use the base class again", () => {
        cy.createActor("being", { name: "Restore Being" }).then((actor) => {
            cy.foundry(async (win) => {
                const s = win.sohl;
                const orig = s.itemLogicClasses.skill;
                class TmpSkill extends orig {}
                s.registerItemLogic("skill", TmpSkill);
                s.registerItemLogic("skill", orig); // immediately restore
                const a = win.game.actors.get(actor.id);
                const [skill] = await a.createEmbeddedDocuments("Item", [
                    win.JSON.parse(
                        JSON.stringify({ name: "Base Skill", type: "skill" }),
                    ),
                ]);
                return {
                    isTmp: skill.logic instanceof TmpSkill,
                    current: s.itemLogicClasses.skill === orig,
                };
            }).should((r) => {
                expect(r.isTmp, "override no longer applies").to.be.false;
                expect(r.current, "map restored to base class").to.be.true;
            });
        });
    });
});
