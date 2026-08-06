/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Opposed test outcomes end-to-end (#1081, #1160), driven through the real
 * resolution phase in the live client: two settled success tests are contested,
 * `opposedTestResume` evaluates the contest, and the result card is read out of
 * the chat log.
 *
 * Both sides are forced to the same success level, so every case here is a tie:
 *
 * - left alone, the contest reports a tie — never "Both Fail!" (#1081);
 * - asked to **Break Ties**, it is settled on the higher d100 and reports the
 *   winner, one Victory Star, and which rule decided it (#1160).
 *
 * **Why this starts at phase 2.** Phase 1 (`opposedTestStart` on the source
 * token) is token-addressed, and a token-addressed `SohlSpeaker` refuses to
 * resolve without an initialized canvas — which the headless browser never
 * provides (`canvas.ready` stays false even after `scene.view()`; see the
 * token-rendering guard in `cy.login`). So the contest is assembled here exactly
 * as phase 1 leaves it — two evaluated success tests in one `OpposedTestResult`,
 * carrying the initiator's Break Ties answer — and handed to the same
 * `opposedTestResume` the Respond button calls. Everything the two issues are
 * about (tie vs. mutual failure, the tie-break rule, the card's wording) lives in
 * that phase.
 *
 * Dice are forced (`SimpleRoll.forceValues`) one test at a time, so each side's
 * d100 is deterministic, and both tests run with `skipDialog` — an unanswered
 * pre-roll dialog would hang a headless run.
 */

/** Both sides roll under 55 → Marginal Success each → a tied contest. */
const SKILL_SYSTEM = {
    subType: "craft",
    masteryLevelBase: 55,
    skillBaseFormula: "sb(attr.str, attr.dex)",
};

/** The posted opposed **result** card — the one carrying the Results grid. */
function opposedCard(win) {
    return (
        win.game.messages.contents
            .map((m) => m.content ?? "")
            .find((c) => c.includes('<h4 class="subtitle">Results</h4>')) ?? ""
    );
}

describe("Opposed test — ties and tie-breaks (#1081, #1160)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));

    afterEach(() => {
        cy.foundry((win) => {
            win.sohl.entity.roll.SimpleRoll.clearForced();
            return null;
        });
        cy.cleanupWorld();
    });

    /**
     * Contest two skills whose rolls are forced, and settle it. `breakTies` is
     * what the initiator's pre-roll dialog would have answered.
     */
    function runContest({ breakTies, sourceRoll, targetRoll }) {
        cy.importActor().as("attacker");
        cy.importActor().as("defender");

        cy.then(function () {
            cy.createItemOn(this.attacker, "skill", {
                name: "Stealth",
                system: { ...SKILL_SYSTEM, shortcode: "stealth" },
            }).as("srcSkill");
            cy.createItemOn(this.defender, "skill", {
                name: "Awareness",
                system: { ...SKILL_SYSTEM, shortcode: "aware" },
            }).as("tgtSkill");
        });

        cy.then(function () {
            cy.prepare(this.attacker);
            cy.prepare(this.defender);
        });

        return cy.then(function () {
            const ids = {
                srcActorId: this.attacker.id,
                tgtActorId: this.defender.id,
                srcSkillId: this.srcSkill.id,
                tgtSkillId: this.tgtSkill.id,
            };
            return cy.foundry(async (win) => {
                const { SimpleRoll } = win.sohl.entity.roll;
                const CTX = win.sohl.entity.action.SohlActionContext;
                const { OpposedTestResult } = win.sohl.entity.result;
                const srcActor = win.game.actors.get(ids.srcActorId);
                const tgtActor = win.game.actors.get(ids.tgtActorId);
                const srcSkill = srcActor.items.get(ids.srcSkillId);
                const tgtSkill = tgtActor.items.get(ids.tgtSkillId);

                // Objects handed to the action pipeline are merged into, so build
                // them in the game realm — a cross-realm literal is not an Object
                // to `mergeObject`.
                const inRealm = (props) =>
                    win.Object.assign(new win.Object(), props);

                const rollTest = async (skill, actor, dieValue) => {
                    SimpleRoll.forceValues(dieValue);
                    return skill.logic.masteryLevel.successTest(
                        new CTX({
                            type: "successTest",
                            speaker: actor.getSpeaker(),
                            skipDialog: true,
                            noChat: true,
                            scope: inRealm({}),
                        }),
                    );
                };

                // Each side rolls, exactly as the two phases of a contest do.
                const source = await rollTest(srcSkill, srcActor, sourceRoll);
                const target = await rollTest(tgtSkill, tgtActor, targetRoll);
                if (!source || !target) return { rolled: false };

                // The contest as phase 1 leaves it, carrying the dialog's answer.
                const opposed = new OpposedTestResult(
                    inRealm({
                        sourceTestResult: source,
                        targetTestResult: target,
                        breakTies,
                    }),
                    inRealm({ parent: srcSkill.logic }),
                );

                win.__msgBefore = win.game.messages.size;

                // Phase 2 — the Respond button's handler settles the contest.
                const settled =
                    await tgtSkill.logic.masteryLevel.opposedTestResume(
                        new CTX({
                            type: "opposedTestResume",
                            speaker: tgtActor.getSpeaker(),
                            skipDialog: true,
                            scope: inRealm({ priorTestResult: opposed }),
                        }),
                    );

                return {
                    rolled: true,
                    settled: !!settled,
                    sourceLevel: source.successLevel,
                    targetLevel: target.successLevel,
                    isTied: opposed.isTied,
                    isTieBroken: opposed.isTieBroken,
                    bothFail: opposed.bothFail,
                    sourceWins: opposed.sourceWins,
                    targetWins: opposed.targetWins,
                    victoryStars: opposed.victoryStars,
                    tieBreakReason: opposed.tieBreakReason,
                };
            });
        });
    }

    it("reports a tie as a tie, never as a mutual failure (#1081)", () => {
        runContest({ breakTies: false, sourceRoll: 44, targetRoll: 12 }).then(
            (r) => {
                expect(r.rolled, "both sides rolled").to.be.true;
                expect(r.settled, "contest settled").to.be.true;
                expect(r.sourceLevel, "both at Marginal Success").to.eq(
                    r.targetLevel,
                );
                expect(r.isTied, "same success level").to.be.true;
                expect(r.bothFail, "both succeeded — not a mutual failure").to
                    .be.false;
                expect(r.isTieBroken, "tie left standing").to.be.false;
                expect(r.sourceWins).to.be.false;
                expect(r.targetWins).to.be.false;
                expect(r.victoryStars, "a tie is worth no stars").to.eq(0);
            },
        );

        // Every card posts fire-and-forget, so neither arrival order nor "the
        // last message" is guaranteed — poll the whole log for the opposed card.
        cy.window().should((win) => {
            const card = opposedCard(win);
            expect(card, "opposed result card posted").to.not.eq("");
            expect(card).to.contain("Tie — No Winner!");
            expect(card).to.not.contain("Both Fail!");
        });
    });

    it("settles a tie on the higher roll when asked, and says so (#1160)", () => {
        runContest({ breakTies: true, sourceRoll: 44, targetRoll: 12 }).then(
            (r) => {
                expect(r.isTied, "still a tie on success level").to.be.true;
                expect(r.isTieBroken, "but settled").to.be.true;
                expect(r.sourceWins, "higher d100 takes it").to.be.true;
                expect(r.targetWins).to.be.false;
                expect(r.victoryStars, "a broken tie is one star").to.eq(1);
                expect(r.tieBreakReason).to.eq("roll");
            },
        );

        cy.window().should((win) => {
            const card = opposedCard(win);
            expect(card, "opposed result card posted").to.not.eq("");
            expect(card).to.contain("Wins!");
            expect(card).to.contain("Victory Stars: ★");
            expect(card).to.contain("Tie broken on the higher roll");
            expect(card).to.not.contain("Tie — No Winner!");
        });
    });
});
