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

import { describe, it, expect, vi, afterEach } from "vitest";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { BRAND, VALUE_DELTA_INFO } from "@src/utils/constants";

/**
 * The **responder's** half of an opposed test (#1164) — phase 2, the Respond
 * button's handler.
 *
 * `MasteryLevelModifier.opposedTestResume` is called on the mastery level of the
 * skill or attribute the defender picked, so that modifier is what the target's
 * d100 must be measured against. It used to branch on
 * `if (!opposedTestResult.targetTestResult)` — a condition the `OpposedTestResult`
 * constructor makes permanently false, since it always materializes a
 * placeholder target side. Every Respond therefore fell into the "GM is
 * modifying" branch, which reused that placeholder (carrying an **empty**
 * modifier) and drove it with the *source's* mastery level.
 *
 * The discriminator is now "has the target side actually rolled?", and both
 * paths run against `this` — the responder's own modifier.
 */

afterEach(() => {
    vi.restoreAllMocks();
    SimpleRoll.clearForced();
});

/** An owned speaker so `evaluate()` is never refused for permissions. */
const ownedSpeaker = {
    isOwner: true,
    name: "Speaker",
    toJSON: () => ({ name: "Speaker" }),
} as any;

/** A minimal item logic to own a modifier/result. */
function parentFor(name: string): any {
    return {
        id: `itm-${name}`,
        name,
        label: name,
        uuid: `Item.${name}`,
        actor: { uuid: `Actor.${name}` },
        data: { kind: "skill" },
        item: { logic: { availableFate: [] } },
        speaker: ownedSpeaker,
        [BRAND.SohlLogic]: true,
    };
}

/** A mastery-level modifier of `base`, owned by a parent named `name`. */
function makeML(name: string, base: number): MasteryLevelModifier {
    return new MasteryLevelModifier({ baseValue: base } as any, {
        parent: parentFor(name),
    });
}

/** An evaluated success test on a frozen die (never re-rolled). */
async function rolled(
    ml: MasteryLevelModifier,
    total: number,
    title: string,
): Promise<SuccessTestResult> {
    const parent = (ml as any).parent;
    const r = new SuccessTestResult(
        {
            masteryLevelModifier: ml,
            roll: new SimpleRoll(
                {
                    numDice: 1,
                    dieFaces: 100,
                    modifier: 0,
                    rolls: [total],
                } as any,
                { parent },
            ),
            title,
        } as any,
        { parent, chatSpeaker: ownedSpeaker },
    );
    await r.evaluate();
    return r;
}

/**
 * The context the Respond button's dispatch builds. `SohlActionContext` rebuilds
 * anything that is not already a `SohlSpeaker`, and a bare one resolves to
 * `isOwner === false` (no token, no actor) — which `evaluate()` refuses to roll
 * for. Stub ownership on the instance so the responder's test can resolve.
 */
function resumeCtx(
    opposed: OpposedTestResult,
    scope: Record<string, unknown> = {},
): SohlActionContext {
    const speaker = new SohlSpeaker({ alias: "Bandit" });
    Object.defineProperty(speaker, "isOwner", { get: () => true });
    return new SohlActionContext({
        type: "opposedTestResume",
        speaker,
        skipDialog: true,
        noChat: true,
        scope: { priorTestResult: opposed, ...scope },
    } as any);
}

/**
 * The defender's token, as `fvttLogicFromUuidSync` resolves it from a uuid.
 * Deliberately **id-less**: a result with no `chatSpeaker` builds one from its
 * token id, and `SohlSpeaker` throws "Canvas is not initialized" outside a live
 * client. These tests are about the token carrying over, not the speaker.
 */
const TARGET_TOKEN = {
    name: "Bandit",
    uuid: "Scene.s1.Token.t2",
} as any;

/**
 * A contest as **phase 1 leaves it**: the source has rolled; the target side is
 * the unrolled placeholder the constructor builds from the target token.
 */
async function pendingContest(): Promise<{
    opposed: OpposedTestResult;
    sourceML: MasteryLevelModifier;
}> {
    // The placeholder resolves its token through the shim, exactly as a live
    // client does — so the carry-over below is a real assertion, not a
    // comparison of two `undefined`s.
    vi.spyOn(FoundryHelpersMock, "fvttLogicFromUuidSync").mockReturnValue(
        TARGET_TOKEN,
    );
    const sourceML = makeML("Stealth", 50);
    const source = await rolled(sourceML, 40, "Stealth Test");
    const opposed = new OpposedTestResult(
        {
            sourceTestResult: source,
            // No targetTestResult — exactly what `opposedTestStart` does; the
            // constructor fills in an unrolled placeholder.
            targetToken: { uuid: "Scene.s1.Token.t2" } as any,
        } as any,
        { parent: (sourceML as any).parent },
    );
    return { opposed, sourceML };
}

describe("MasteryLevelModifier.opposedTestResume — the responder rolls its own modifier (#1164)", () => {
    it("rolls the target against the RESPONDER's mastery level, not an empty one", async () => {
        const { opposed } = await pendingContest();
        const responderML = makeML("Awareness", 75);

        // 60 ≤ 75 → the responder passes on its own ML. Against the placeholder's
        // empty modifier (base 0) the same die could only fail.
        SimpleRoll.forceValues(60);
        await responderML.opposedTestResume(resumeCtx(opposed));

        expect(opposed.targetTestResult.masteryLevelModifier.effective).toBe(
            75,
        );
        expect(opposed.targetTestResult.roll.total).toBe(60);
        expect(opposed.targetTestResult.isSuccess).toBe(true);
    });

    it("keeps the placeholder's target token, so the card can name the defender", async () => {
        const { opposed } = await pendingContest();
        expect(opposed.targetTestResult.token?.name).toBe("Bandit");
        const responderML = makeML("Awareness", 75);

        SimpleRoll.forceValues(60);
        await responderML.opposedTestResume(resumeCtx(opposed));

        // The fresh responder result must carry the token the contest targeted —
        // the result card reads the defender's name off it.
        expect(opposed.targetTestResult.token?.name).toBe("Bandit");
        expect(opposed.targetTestResult.token?.uuid).toBe(TARGET_TOKEN.uuid);
    });

    it("parents the target result to the responder's item, so the card names its skill", async () => {
        const { opposed } = await pendingContest();
        const responderML = makeML("Awareness", 75);

        SimpleRoll.forceValues(60);
        await responderML.opposedTestResume(resumeCtx(opposed));

        expect(opposed.targetTestResult.item?.name).toBe("Awareness");
    });

    it("honors the situational modifier the responder chose in the Respond dialog", async () => {
        const { opposed } = await pendingContest();
        const responderML = makeML("Awareness", 75);

        SimpleRoll.forceValues(60);
        await responderML.opposedTestResume(
            resumeCtx(opposed, { situationalModifier: -30 }),
        );

        const mod = opposed.targetTestResult.masteryLevelModifier;
        expect(mod.get(VALUE_DELTA_INFO.PLAYER)?.numValue).toBe(-30);
        expect(mod.effective).toBe(45);
        // 60 > 45 → the same die now fails.
        expect(opposed.targetTestResult.isSuccess).toBe(false);
    });

    it("leaves the source side alone — it is never re-rolled or reassigned", async () => {
        const { opposed, sourceML } = await pendingContest();
        const source = opposed.sourceTestResult;
        const responderML = makeML("Awareness", 75);

        SimpleRoll.forceValues(60);
        await responderML.opposedTestResume(resumeCtx(opposed));

        expect(opposed.sourceTestResult).toBe(source);
        expect(opposed.sourceTestResult.roll.total).toBe(40);
        expect(opposed.sourceTestResult.masteryLevelModifier).toBe(sourceML);
        // The responder's side is a different result object entirely.
        expect(opposed.targetTestResult).not.toBe(source);
    });

    it("consumes exactly one die — the responder's — and never the source's", async () => {
        const { opposed } = await pendingContest();
        const responderML = makeML("Awareness", 75);

        SimpleRoll.forceValues(60, 11);
        await responderML.opposedTestResume(resumeCtx(opposed));

        // One value drawn (the responder's d100); the spare is untouched.
        expect(SimpleRoll.forcedRemaining).toBe(1);
    });

    describe("an already-rolled target side (a settled contest resumed again)", () => {
        it("reuses it without re-rolling", async () => {
            const sourceML = makeML("Stealth", 50);
            const source = await rolled(sourceML, 40, "Stealth Test");
            const targetML = makeML("Awareness", 75);
            const target = await rolled(targetML, 12, "Awareness Test");
            const opposed = new OpposedTestResult(
                {
                    sourceTestResult: source,
                    targetTestResult: target,
                } as any,
                { parent: (sourceML as any).parent },
            );

            // Nothing forced: a re-roll would have to draw a random die.
            await targetML.opposedTestResume(resumeCtx(opposed));

            expect(opposed.targetTestResult.roll.total).toBe(12);
            expect(opposed.targetTestResult).toBe(target);
        });
    });
});
