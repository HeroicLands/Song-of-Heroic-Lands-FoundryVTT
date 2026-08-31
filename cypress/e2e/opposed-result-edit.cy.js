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
 * GM re-edit of a settled opposed contest, end-to-end (#1082). The pencil in the
 * Opposed Action Result card's header used to emit an **empty** `data-action`
 * (`testType.action` off a plain string) and no `data-scope`, so clicking it
 * reached no handler at all.
 *
 * This drives the live client (the seeded user is a GM):
 *
 * - a real, posted result card carries a pencil that dispatches
 *   `opposedResultEdit`, addressed to the source actor, with the whole contest
 *   in `data-scope`;
 * - that `data-scope` revives through the real chat-card dispatch seam into a
 *   live `OpposedTestResult` with both sides intact;
 * - a live `opposedResultEdit` re-derives **both** sides against their frozen
 *   dice (no forced value is consumed — the proof neither side re-rolled) and
 *   reposts the result card.
 *
 * The contest is built directly from two real success tests rather than through
 * `opposedTestStart`/`opposedTestResume`, which need a canvas target and a
 * responder dialog no one can click headless. Both dice are forced
 * (`SimpleRoll.forceValues`) to deterministic, **non-critical** outcomes, and
 * the edit runs with `skipDialog` so its two per-side dialogs are bypassed —
 * an unanswered dialog would hang the spec.
 *
 * Card posting is fire-and-forget (`void speaker.toChat(...)`), so every
 * assertion about a posted card polls via `cy.window().should(...)`; a single
 * `cy.foundry` read resolves once and would race the create.
 */

const RESULT_CARD = "systems/sohl/templates/chat/opposed-result-card.hbs";

/**
 * The edit pencil from the most recent chat message that carries one, parsed
 * out of the message's own stored content in the game realm. `null` until the
 * card has actually been created.
 */
function findPencil(win) {
    const content = win.game.messages.contents
        .map((m) => m.content ?? "")
        .reverse()
        .find((c) => c.includes("edit-action"));
    if (!content) return null;
    const el = win.document.createElement("div");
    el.innerHTML = content;
    return el.querySelector("a.edit-action");
}

/**
 * Build a settled contest in the game realm from two real skill success tests on
 * `actor` and post the Opposed Action Result card. Source rolls 34 (pass vs.
 * 50); target rolls 80 (miss vs. 50), so the source wins. The live result is
 * stashed on `win.__opposed` for later steps.
 */
function buildSettledContest(win, actorId, srcSkillId, tgtSkillId) {
    const SimpleRoll = win.sohl.entity.roll.SimpleRoll;
    const a = win.game.actors.get(actorId);
    const src = a.items.get(srcSkillId);
    const tgt = a.items.get(tgtSkillId);

    // Two forced, non-critical dice — one per side, consumed in order.
    SimpleRoll.forceValues(34, 80);
    return src.logic
        .executeAction("successTest", { skipDialog: true, scope: {} })
        .then((sourceTestResult) =>
            tgt.logic
                .executeAction("successTest", { skipDialog: true, scope: {} })
                .then((targetTestResult) => {
                    const opposed = new win.sohl.entity.result.OpposedTestResult(
                        { sourceTestResult, targetTestResult },
                        { parent: src.logic },
                    );
                    win.__opposed = opposed;
                    return opposed
                        .toChat({
                            template: RESULT_CARD,
                            title: "Opposed Action Result",
                        })
                        .then(() => null);
                }),
        );
}

/** Import a Being and give it the two skills the contest rolls. */
function withContestActor(fn) {
    cy.importActor().then((actor) => {
        cy.createItemOn(actor, "skill", {
            name: "Contest Stealth",
            system: {
                shortcode: "cst",
                subType: "craft",
                masteryLevelBase: 50,
                skillBaseFormula: "sb(attr.str, attr.dex)",
            },
        }).then((srcSkill) => {
            cy.createItemOn(actor, "skill", {
                name: "Contest Awareness",
                system: {
                    shortcode: "caw",
                    subType: "craft",
                    masteryLevelBase: 50,
                    skillBaseFormula: "sb(attr.str, attr.dex)",
                },
            }).then((tgtSkill) => {
                cy.prepare(actor);
                fn(actor, srcSkill, tgtSkill);
            });
        });
    });
}

/** Build the contest and wait for its result card to actually exist. */
function postContest(actor, srcSkill, tgtSkill) {
    cy.foundry((win) => buildSettledContest(win, actor.id, srcSkill.id, tgtSkill.id));
    cy.window().should((win) => {
        expect(findPencil(win), "result card posted with a pencil").to.not.be.null;
    });
}

describe("GM opposed-result edit — the result card's pencil (#1082)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));

    afterEach(() => {
        cy.foundry((win) => {
            win.sohl.entity.roll.SimpleRoll.clearForced();
            delete win.__opposed;
            return null;
        });
        cy.cleanupWorld();
    });

    it("renders a live pencil: opposedResultEdit, source actor, contest in scope", () => {
        withContestActor((actor, srcSkill, tgtSkill) => {
            postContest(actor, srcSkill, tgtSkill);
            cy.foundry((win) => {
                const pencil = findPencil(win);
                return {
                    action: pencil.dataset.action ?? null,
                    handler: pencil.dataset.actionHandlerUuid ?? null,
                    scopeLen: (pencil.dataset.scope ?? "").length,
                    actorUuid: win.game.actors.get(actor.id).uuid,
                };
            }).then((r) => {
                expect(r.action, "pencil dispatches a real action").to.eq("opposedResultEdit");
                expect(r.handler, "addressed to the source actor").to.eq(r.actorUuid);
                expect(r.scopeLen, "carries the contest").to.be.greaterThan(0);
            });
        });
    });

    it("the pencil's data-scope revives into a live contest through the dispatch seam", () => {
        withContestActor((actor, srcSkill, tgtSkill) => {
            postContest(actor, srcSkill, tgtSkill);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                const pencil = findPencil(win);
                const scope = win.sohl.utils.buildActionScope(pencil.dataset, a.logic);
                const revived = scope.opposedTestResult;
                return {
                    isContest: revived instanceof win.sohl.entity.result.OpposedTestResult,
                    sourceRoll: revived?.sourceTestResult?.roll?.total,
                    targetRoll: revived?.targetTestResult?.roll?.total,
                    // The document handler the click path calls must exist.
                    hasEditHandler: typeof a.onChatCardEditAction === "function",
                    hasExecutor: typeof a.logic.opposedResultEdit === "function",
                };
            }).then((r) => {
                expect(r.isContest, "revived as an OpposedTestResult").to.be.true;
                expect(r.sourceRoll, "source die survives the wire").to.eq(34);
                expect(r.targetRoll, "target die survives the wire").to.eq(80);
                expect(r.hasEditHandler, "SohlActor.onChatCardEditAction").to.be.true;
                expect(r.hasExecutor, "actor logic executor").to.be.true;
            });
        });
    });

    it("re-derives both sides on their frozen dice and reposts the result card", () => {
        withContestActor((actor, srcSkill, tgtSkill) => {
            postContest(actor, srcSkill, tgtSkill);
            cy.foundry(async (win) => {
                const a = win.game.actors.get(actor.id);
                const opposed = win.__opposed;
                const SimpleRoll = win.sohl.entity.roll.SimpleRoll;
                const CTX = win.sohl.entity.action.SohlActionContext;

                const before = {
                    sourceWins: opposed.sourceWins,
                    targetWins: opposed.targetWins,
                    sourceRoll: opposed.sourceTestResult.roll.total,
                    targetRoll: opposed.targetTestResult.roll.total,
                    // Queue drained by the two originals: a re-roll below would
                    // have to invent a die.
                    forced: SimpleRoll.forcedRemaining,
                };
                win.__msgsBefore = win.game.messages.size;

                // Source target → 5 (34 > 5, now fails); target → 90 (80 ≤ 90,
                // now passes). The contest reverses, with no new dice.
                await a.logic.opposedResultEdit(
                    new CTX({
                        type: "opposedResultEdit",
                        speaker: a.getSpeaker(),
                        skipDialog: true,
                        scope: {
                            opposedTestResult: opposed,
                            source: { situationalModifier: -45 },
                            target: { situationalModifier: 40 },
                        },
                    }),
                );

                return {
                    before,
                    afterSourceWins: opposed.sourceWins,
                    afterTargetWins: opposed.targetWins,
                    afterSourceRoll: opposed.sourceTestResult.roll.total,
                    afterTargetRoll: opposed.targetTestResult.roll.total,
                    forcedAfter: SimpleRoll.forcedRemaining,
                };
            }).then((r) => {
                expect(r.before.sourceWins, "source won originally").to.be.true;
                expect(r.before.forced, "forced queue drained").to.eq(0);

                expect(r.afterSourceRoll, "source die frozen").to.eq(r.before.sourceRoll);
                expect(r.afterTargetRoll, "target die frozen").to.eq(r.before.targetRoll);
                expect(r.forcedAfter, "no die drawn by the edit").to.eq(0);

                expect(r.afterSourceWins, "source now loses").to.be.false;
                expect(r.afterTargetWins, "target now wins").to.be.true;
            });
            // The corrected card is posted fire-and-forget — poll for it.
            cy.window().should((win) => {
                expect(win.game.messages.size, "a corrected card was reposted").to.be.greaterThan(
                    win.__msgsBefore,
                );
            });
        });
    });
});
