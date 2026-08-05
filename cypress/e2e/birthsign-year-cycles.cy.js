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
 * Birthsign astrology — arbitrary & concurrent year cycles (#1036). A
 * world-authored tradition combining a solar date window with a 12-year cycle and
 * a 3-year cycle derives, for a being with a birth date, per-skill `BSMod`
 * modifiers that fold the solar sign together with each cycle's year-resolved
 * position — all through the same variadic `merge` pipeline, with `year` in the
 * expression context.
 */
describe("birthsign astrology — concurrent year cycles (#1036)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));

    afterEach(() => {
        cy.cleanupWorld();
        // Drop the world-registered test tradition between tests.
        cy.foundry((win) => {
            win.sohl.astrologyRegistry.unregister("cyctest");
            return true;
        });
    });

    // Solar "sol" sign spans the whole year (→ sun:15). A 12-year "animal" cycle
    // (position i → an<i>:i+1) and a 3-year "element" cycle (fire/water/air →
    // hot/wet/dry:5), both anchored at epochYear 0.
    const TRADITION = {
        shortcode: "cyctest",
        label: "Cycle Test",
        signs: [
            {
                shortcode: "sol",
                start: { month: 1, day: 1 },
                end: { month: 12, day: 30 },
                cuspDays: 0,
                skillModifiers: { sun: 15 },
            },
        ],
        cycles: [
            {
                shortcode: "animal",
                label: "Animal",
                cycleLength: 12,
                epochYear: 0,
                positions: Array.from({ length: 12 }, (_, i) => ({
                    shortcode: `a${i}`,
                    label: `A${i}`,
                    skillModifiers: { [`an${i}`]: i + 1 },
                })),
            },
            {
                shortcode: "element",
                label: "Element",
                cycleLength: 3,
                epochYear: 0,
                positions: [
                    { shortcode: "fire", skillModifiers: { hot: 5 } },
                    { shortcode: "water", skillModifiers: { wet: 5 } },
                    { shortcode: "air", skillModifiers: { dry: 5 } },
                ],
            },
        ],
    };

    const COMBINED_EXPR =
        "merge(astrologySettings(tradition, date), " +
        'astrologyYearSettings(tradition, year), "max")';

    // A birth date on day 16 of some year; year 705 in the Turning Wheel.
    const BIRTHDATE = (705 * 360 + 15) * 86400;

    /** Register the multi-cycle tradition and compute the birth year's positions. */
    function registerTradition() {
        return cy.foundry((win) => {
            const result = win.sohl.astrologyRegistry.register(
                win.structuredClone(TRADITION),
                "world",
            );
            const year =
                win.game.time.calendar.timeToComponents(BIRTHDATE).year;
            return {
                installed: result.installed,
                year,
                animalIdx: ((year % 12) + 12) % 12,
                elementIdx: ((year % 3) + 3) % 3,
            };
        });
    }

    /** Create a being with the birthsign affiliation + a skill, then prepare. */
    function beingWithSkill(skill) {
        cy.createActor("being", { system: { birthDate: BIRTHDATE } }).as(
            "being",
        );
        cy.then(function () {
            cy.createItemOn(this.being, "affiliation", {
                name: "Cycle Test",
                system: {
                    society: "cyctest",
                    astrologicalExpression: COMBINED_EXPR,
                },
            });
            cy.createItemOn(this.being, "skill", {
                name: skill.name,
                system: {
                    shortcode: skill.shortcode,
                    subType: skill.subType,
                    skillBaseFormula: "5",
                    masteryLevelBase: 40,
                },
            });
            cy.prepare(this.being);
        });
    }

    it("folds a solar window and two year cycles into astrologyModifiers", () => {
        registerTradition().then((r) => {
            expect(r.installed).to.deep.eq(["cyctest"]);
            cy.createActor("being", {
                system: { birthDate: BIRTHDATE },
            }).then((being) => {
                cy.createItemOn(being, "affiliation", {
                    name: "Cycle Test",
                    system: {
                        society: "cyctest",
                        astrologicalExpression: COMBINED_EXPR,
                    },
                });
                cy.prepare(being);
                cy.foundry((win) => {
                    const actor = win.game.actors.get(being.id ?? being);
                    return actor.logic.astrologyModifiers;
                }).then((mods) => {
                    // solar sun:15, animal an<idx>:idx+1, element <pos>:5.
                    const expected = {
                        sun: 15,
                        [`an${r.animalIdx}`]: r.animalIdx + 1,
                    };
                    const elementKey = ["hot", "wet", "dry"][r.elementIdx];
                    expected[elementKey] = 5;
                    expect(mods).to.deep.eq(expected);
                });
            });
        });
    });

    it("applies a cyclic BSMod delta to a matching skill", () => {
        registerTradition().then((r) => {
            const shortcode = `an${r.animalIdx}`;
            const bonus = r.animalIdx + 1;
            beingWithSkill({ name: "Cyclic", shortcode, subType: "lore" });
            cy.get("@being").then((being) => {
                cy.foundry((win) => {
                    const actor = win.game.actors.get(being.id ?? being);
                    const s = actor.itemTypes.skill.find(
                        (i) => i.system.shortcode === shortcode,
                    );
                    const ml = s.logic.masteryLevel;
                    return {
                        effective: ml.effective,
                        bsMod:
                            ml.deltas.find((d) => d.abbrev === "BSMod")
                                ?.value ?? null,
                    };
                }).then((res) => {
                    expect(String(res.bsMod)).to.eq(String(bonus));
                    expect(res.effective).to.eq(40 + bonus);
                });
            });
        });
    });
});
