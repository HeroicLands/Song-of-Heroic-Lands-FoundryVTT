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
 * The responder's half of an opposed test, end-to-end (#1164).
 *
 * `opposed-tiebreak.cy.js` hands `opposedTestResume` a contest whose target side
 * has **already rolled**, so it only ever exercises the reuse path. This spec
 * covers the state the Respond button actually starts from: a contest as phase 1
 * leaves it — source rolled, target side still the unrolled placeholder the
 * `OpposedTestResult` constructor builds. That is the path that used to roll the
 * defender against an **empty** mastery-level modifier, because the old guard
 * (`if (!opposedTestResult.targetTestResult)`) could never be true.
 *
 * The two skills are given deliberately different mastery levels, so which
 * modifier the target's die was measured against is unambiguous from the result.
 *
 * The contest carries no target token: resolving one would build a
 * token-addressed `SohlSpeaker`, which throws "Canvas is not initialized"
 * headless. The token carry-over is covered by the unit suite.
 */

/** A skill with an explicit mastery level, on its own imported Being. */
function makeContestant(name, shortcode, masteryLevelBase) {
    return cy.importActor().then((actor) =>
        cy
            .createItemOn(actor, "skill", {
                name,
                system: {
                    shortcode,
                    subType: "craft",
                    masteryLevelBase,
                    skillBaseFormula: "sb(attr.str, attr.dex)",
                },
            })
            .then((skill) => {
                cy.prepare(actor);
                return cy.wrap({ actorId: actor.id, skillId: skill.id });
            }),
    );
}

describe("Opposed test — the responder rolls its own mastery level (#1164)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));

    afterEach(() => {
        cy.foundry((win) => {
            win.sohl.entity.roll.SimpleRoll.clearForced();
            return null;
        });
        cy.cleanupWorld();
    });

    it("measures the target's die against the responding skill, not an empty modifier", () => {
        makeContestant("Resp Stealth", "rst", 50).then((src) => {
            makeContestant("Resp Awareness", "raw", 90).then((tgt) => {
                cy.foundry(async (win) => {
                    const { SimpleRoll } = win.sohl.entity.roll;
                    const CTX = win.sohl.entity.action.SohlActionContext;
                    const { OpposedTestResult } = win.sohl.entity.result;
                    const srcActor = win.game.actors.get(src.actorId);
                    const tgtActor = win.game.actors.get(tgt.actorId);
                    const srcSkill = srcActor.items.get(src.skillId);
                    const tgtSkill = tgtActor.items.get(tgt.skillId);

                    // Objects handed to the action pipeline are merged into, so
                    // build them in the game realm.
                    const inRealm = (props) => win.Object.assign(new win.Object(), props);

                    // Phase 1: only the source rolls.
                    SimpleRoll.forceValues(44);
                    const source = await srcSkill.logic.masteryLevel.successTest(
                        new CTX({
                            type: "successTest",
                            speaker: srcActor.getSpeaker(),
                            skipDialog: true,
                            noChat: true,
                            scope: inRealm({}),
                        }),
                    );

                    // The contest exactly as phase 1 leaves it: no target result,
                    // so the constructor supplies the unrolled placeholder.
                    const opposed = new OpposedTestResult(
                        inRealm({
                            sourceTestResult: source,
                            targetToken: inRealm({ uuid: "" }),
                        }),
                        inRealm({ parent: srcSkill.logic }),
                    );
                    const placeholderEml = opposed.targetTestResult.masteryLevelModifier.effective;

                    // Phase 2: the responder answers with ITS skill (ML 90).
                    // 70 ≤ 90 passes; against the empty placeholder it could only
                    // fail, and against the source's 50 it would also fail.
                    SimpleRoll.forceValues(70);
                    const settled = await tgtSkill.logic.masteryLevel.opposedTestResume(
                        new CTX({
                            type: "opposedTestResume",
                            speaker: tgtActor.getSpeaker(),
                            skipDialog: true,
                            noChat: true,
                            scope: inRealm({ priorTestResult: opposed }),
                        }),
                    );

                    const target = opposed.targetTestResult;
                    return {
                        settled: !!settled,
                        placeholderEml,
                        sourceEml: source.masteryLevelModifier.constrainedEffective,
                        targetEml: target.masteryLevelModifier.constrainedEffective,
                        targetRoll: target.roll.total,
                        targetSuccess: target.isSuccess,
                        targetItemName: target.item?.name,
                        sourceRoll: source.roll.total,
                        forcedLeft: SimpleRoll.forcedRemaining,
                    };
                }).then((r) => {
                    expect(r.settled, "contest settled").to.be.true;

                    // The placeholder really is empty — the thing the old code
                    // rolled against.
                    expect(r.placeholderEml, "placeholder is empty").to.eq(0);

                    expect(r.sourceEml, "source ML").to.eq(50);
                    expect(r.targetEml, "target rolled against ITS OWN ML").to.eq(90);
                    expect(r.targetItemName, "target result names its skill").to.eq(
                        "Resp Awareness",
                    );

                    expect(r.targetRoll, "responder's forced die").to.eq(70);
                    expect(r.targetSuccess, "70 ≤ 90 passes").to.be.true;

                    // The source side is untouched, and exactly one die was drawn
                    // for the responder.
                    expect(r.sourceRoll, "source die untouched").to.eq(44);
                    expect(r.forcedLeft, "queue drained by one die").to.eq(0);
                });
            });
        });
    });

    it("honors the situational modifier the responder entered", () => {
        makeContestant("Sit Stealth", "sst", 50).then((src) => {
            makeContestant("Sit Awareness", "saw", 90).then((tgt) => {
                cy.foundry(async (win) => {
                    const { SimpleRoll } = win.sohl.entity.roll;
                    const CTX = win.sohl.entity.action.SohlActionContext;
                    const { OpposedTestResult } = win.sohl.entity.result;
                    const srcActor = win.game.actors.get(src.actorId);
                    const tgtActor = win.game.actors.get(tgt.actorId);
                    const srcSkill = srcActor.items.get(src.skillId);
                    const tgtSkill = tgtActor.items.get(tgt.skillId);
                    const inRealm = (props) => win.Object.assign(new win.Object(), props);

                    SimpleRoll.forceValues(44);
                    const source = await srcSkill.logic.masteryLevel.successTest(
                        new CTX({
                            type: "successTest",
                            speaker: srcActor.getSpeaker(),
                            skipDialog: true,
                            noChat: true,
                            scope: inRealm({}),
                        }),
                    );
                    const opposed = new OpposedTestResult(
                        inRealm({
                            sourceTestResult: source,
                            targetToken: inRealm({ uuid: "" }),
                        }),
                        inRealm({ parent: srcSkill.logic }),
                    );

                    // −30 drops the responder's target to 60; the same die now
                    // fails. The old code discarded this input entirely.
                    SimpleRoll.forceValues(70);
                    await tgtSkill.logic.masteryLevel.opposedTestResume(
                        new CTX({
                            type: "opposedTestResume",
                            speaker: tgtActor.getSpeaker(),
                            skipDialog: true,
                            noChat: true,
                            scope: inRealm({
                                priorTestResult: opposed,
                                situationalModifier: -30,
                            }),
                        }),
                    );

                    const target = opposed.targetTestResult;
                    return {
                        targetEml: target.masteryLevelModifier.constrainedEffective,
                        targetRoll: target.roll.total,
                        targetSuccess: target.isSuccess,
                    };
                }).then((r) => {
                    expect(r.targetEml, "90 − 30").to.eq(60);
                    expect(r.targetRoll, "same forced die").to.eq(70);
                    expect(r.targetSuccess, "70 > 60 now fails").to.be.false;
                });
            });
        });
    });
});
