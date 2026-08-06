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
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { BRAND } from "@src/utils/constants";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const REQUEST = "systems/sohl/templates/chat/opposed-request-card.hbs";
const RESULT = "systems/sohl/templates/chat/opposed-result-card.hbs";
const TEST_DIALOG = "systems/sohl/templates/dialog/standard-test-dialog.hbs";

afterEach(() => vi.restoreAllMocks());

/** Owned speaker so a result can evaluate/post without ownership refusal. */
const speaker = {
    isOwner: true,
    name: "GM",
    toJSON: () => ({ name: "GM" }),
} as any;

function parentFor(name: string): any {
    return {
        id: `itm-${name}`,
        name,
        label: name,
        uuid: `Item.${name}`,
        actor: { uuid: `Actor.${name}` },
        data: { kind: "skill" },
        item: { logic: { availableFate: [] } },
        [BRAND.SohlLogic]: true,
    };
}

/**
 * A result whose supplied die yields a deterministic outcome. `normSuccessLevel`
 * derives from the evaluated roll (not a raw level), so crit digits + the die
 * total pin a Critical Success / Critical Failure.
 */
async function makeResult(
    name: string,
    opts: { rollTotal: number; critSuccess?: number[]; critFailure?: number[] },
): Promise<SuccessTestResult> {
    const parent = parentFor(name);
    const mlMod = new MasteryLevelModifier(
        {
            baseValue: 55,
            critSuccessDigits: opts.critSuccess ?? [],
            critFailureDigits: opts.critFailure ?? [],
        } as any,
        { parent },
    );
    const roll = new SimpleRoll(
        {
            numDice: 1,
            dieFaces: 100,
            modifier: 0,
            rolls: [opts.rollTotal],
        } as any,
        { parent },
    );
    const r = new SuccessTestResult(
        { masteryLevelModifier: mlMod, roll, title: `${name} Test` } as any,
        { parent, chatSpeaker: speaker },
    );
    await r.evaluate();
    return r;
}

/** An opposed test where the source (CS) beats the target (CF) by 3 degrees. */
async function makeOpposed(): Promise<OpposedTestResult> {
    // 30 ≤ 55 and ends in 0 → Critical Success.
    const source = await makeResult("Aldric", {
        rollTotal: 30,
        critSuccess: [0],
    });
    // 95 > 55 and ends in 5 → Critical Failure.
    const target = await makeResult("Bandit", {
        rollTotal: 95,
        critFailure: [5],
    });
    return new OpposedTestResult(
        { sourceTestResult: source, targetTestResult: target } as any,
        { parent: parentFor("Aldric") },
    );
}

/** An opposed test where both sides reach the same success level. */
async function makeTied(
    opts: { critical?: boolean; sourceRoll?: number; targetRoll?: number } = {},
) {
    const digits = opts.critical ? [0] : [];
    // Both roll ≤ 55 → success; ending in 0 is critical only when 0 is a crit
    // digit. Differing rolls settle a tie-break deterministically.
    const source = await makeResult("Aldric", {
        rollTotal: opts.sourceRoll ?? 30,
        critSuccess: digits,
    });
    const target = await makeResult("Bandit", {
        rollTotal: opts.targetRoll ?? 30,
        critSuccess: digits,
    });
    return new OpposedTestResult(
        { sourceTestResult: source, targetTestResult: target } as any,
        { parent: parentFor("Aldric") },
    );
}

/** An opposed test where neither side succeeded. */
async function makeBothFail() {
    // 95 > 55 → failure on both sides, with no crit digits configured.
    const source = await makeResult("Aldric", { rollTotal: 95 });
    const target = await makeResult("Bandit", { rollTotal: 95 });
    return new OpposedTestResult(
        { sourceTestResult: source, targetTestResult: target } as any,
        { parent: parentFor("Aldric") },
    );
}

describe("OpposedTestResult.toChat builds shaped opposed-card data (#845)", () => {
    it("delegates the opposed-request template (not overridden to standard-test)", async () => {
        const spy = vi
            .spyOn(SuccessTestResult.prototype, "toChat")
            .mockResolvedValue(undefined);
        await (await makeOpposed()).toChat();
        const msg = spy.mock.calls[0][0] as any;
        expect(msg.template).toBe(REQUEST);
    });

    it("honors a caller-supplied result template and title", async () => {
        const spy = vi
            .spyOn(SuccessTestResult.prototype, "toChat")
            .mockResolvedValue(undefined);
        await (
            await makeOpposed()
        ).toChat({ template: RESULT, title: "Opposed Result" });
        const msg = spy.mock.calls[0][0] as any;
        expect(msg.template).toBe(RESULT);
        expect(msg.title).toBe("Opposed Result");
    });

    it("provides plain shaped source/target results and the Respond button", async () => {
        const spy = vi
            .spyOn(SuccessTestResult.prototype, "toChat")
            .mockResolvedValue(undefined);
        await (await makeOpposed()).toChat();
        const msg = spy.mock.calls[0][0] as any;

        // Shaped, not live: mlMod display fields present as plain data.
        expect(msg.sourceTestResult.title).toBe("Aldric Test");
        expect(typeof msg.sourceTestResult.mlMod.chatHtml).toBe("string");
        expect(msg.targetTestResult.title).toBe("Bandit Test");
        expect(msg.sourceTestResult).not.toBeInstanceOf(SuccessTestResult);

        expect(msg.sourceWins).toBe(true);
        expect(msg.targetWins).toBe(false);
        // Victory Stars CS(2) − CF(−1) = 3, all the tester's → three filled.
        expect(msg.vsStars).toEqual([true, true, true]);

        expect(msg.opposedTests[0].action).toBe("opposedTestResume");
        expect(msg.scopeData).toBeTruthy();
    });
});

describe("the pre-roll dialog offers Break Ties only for an opposed test (#1160)", () => {
    const base = {
        mlMod: { effective: 55, successLevelMod: 0, chatHtml: "" },
        situationalModifier: 0,
        rollMode: "roll",
        rollModes: { roll: "Public Roll" },
    };

    it("renders the checkbox, unchecked, when the contest asks", () => {
        const html = renderTemplateReal(TEST_DIALOG, {
            ...base,
            askBreakTies: true,
            breakTies: false,
        });
        expect(html).toContain('name="breakTies"');
        expect(html).toContain("Break Ties");
        expect(html).not.toContain('checkbox" name="breakTies" checked');
    });

    it("pre-checks it when the contest already broke ties", () => {
        const html = renderTemplateReal(TEST_DIALOG, {
            ...base,
            askBreakTies: true,
            breakTies: true,
        });
        expect(html).toMatch(/name="breakTies"\s+checked/);
    });

    it("omits it from an ordinary success test", () => {
        const html = renderTemplateReal(TEST_DIALOG, base);
        expect(html).not.toContain('name="breakTies"');
        expect(html).not.toContain("Break Ties");
    });
});

describe("SuccessTestResult.toChat honors a caller-supplied template (#845)", () => {
    it("renders the caller's template instead of the standard test card", async () => {
        let usedTemplate = "";
        const spk = {
            isOwner: true,
            name: "GM",
            toJSON: () => ({ name: "GM" }),
            toChat: (tpl: unknown) => {
                usedTemplate = String(tpl);
                return Promise.resolve(undefined);
            },
        } as any;
        vi.spyOn(FoundryHelpersMock, "fvttToFoundryRoll").mockResolvedValue(
            {} as any,
        );
        const parent = parentFor("Src");
        const result = new SuccessTestResult(
            {
                masteryLevelModifier: new MasteryLevelModifier(
                    { baseValue: 50 } as any,
                    { parent },
                ),
                roll: new SimpleRoll(
                    {
                        numDice: 1,
                        dieFaces: 100,
                        modifier: 0,
                        rolls: [30],
                    } as any,
                    { parent },
                ),
            } as any,
            { parent, chatSpeaker: spk },
        );
        await result.evaluate();
        await result.toChat({ template: RESULT });
        expect(usedTemplate).toBe(RESULT);
    });
});

describe("OpposedTestResult.toChat distinguishes a tie from a mutual failure (#1081)", () => {
    /** Capture the card data for a given opposed result. */
    async function dataFor(opposed: OpposedTestResult) {
        const spy = vi
            .spyOn(SuccessTestResult.prototype, "toChat")
            .mockResolvedValue(undefined);
        await opposed.toChat();
        return spy.mock.calls[0][0] as any;
    }

    it("flags a tie as tied, not both-fail", async () => {
        const msg = await dataFor(await makeTied());
        expect(msg.sourceWins).toBe(false);
        expect(msg.targetWins).toBe(false);
        expect(msg.isTied).toBe(true);
        expect(msg.bothFail).toBe(false);
        // A tie is worth zero victory degrees.
        expect(msg.vsStars).toEqual([]);
    });

    it("flags two Critical Successes as a tie", async () => {
        const msg = await dataFor(await makeTied({ critical: true }));
        expect(msg.isTied).toBe(true);
        expect(msg.bothFail).toBe(false);
    });

    it("flags a mutual failure as both-fail, not tied", async () => {
        const msg = await dataFor(await makeBothFail());
        expect(msg.isTied).toBe(false);
        expect(msg.bothFail).toBe(true);
    });

    it("flags a decisive contest as neither tied nor both-fail", async () => {
        const msg = await dataFor(await makeOpposed());
        expect(msg.isTied).toBe(false);
        expect(msg.bothFail).toBe(false);
    });
});

describe("opposed cards render the shaped data (#845)", () => {
    /** Build the card data OpposedTestResult.toChat produces, via a spy capture. */
    async function cardData(opposed?: OpposedTestResult) {
        let captured: any;
        vi.spyOn(SuccessTestResult.prototype, "toChat").mockImplementation(
            function (this: any, data: any) {
                // Mirror what the real SuccessTestResult.toChat exposes that the
                // opposed cards read from the source (actor uuid).
                captured = { ...data, actor: { uuid: "Actor.Aldric" } };
                return Promise.resolve(undefined);
            } as any,
        );
        await (opposed ?? (await makeOpposed())).toChat();
        return captured;
    }

    it("request card shows the Respond button addressed to the target token", async () => {
        const data = await cardData();
        const html = renderTemplateReal(REQUEST, data);
        expect(html).toContain('data-action="opposedTestResume"');
        expect(html).toContain("Aldric Test"); // source performs a … test
    });

    it("result card shows both results, the winner, and the Victory Stars", async () => {
        const data = await cardData();
        const html = renderTemplateReal(RESULT, {
            ...data,
            title: "Opposed Result",
        });
        expect(html).toContain("Aldric Test");
        expect(html).toContain("Bandit Test");
        expect(html).toMatch(/Aldric[\s\S]*?Wins!/);
        expect(html).toContain("Victory Stars:");
        expect(html.match(/fa-solid fa-star/g) ?? []).toHaveLength(3);
    });

    it("result card reports a tie as a tie, not as Both Fail (#1081)", async () => {
        const data = await cardData(await makeTied());
        const html = renderTemplateReal(RESULT, {
            ...data,
            title: "Opposed Result",
        });
        expect(html).not.toContain("Both Fail!");
        expect(html).not.toContain("Wins!");
        expect(html).toContain("Tie");
    });

    it("result card reports two Critical Successes as a tie (#1081)", async () => {
        const data = await cardData(await makeTied({ critical: true }));
        const html = renderTemplateReal(RESULT, {
            ...data,
            title: "Opposed Result",
        });
        expect(html).not.toContain("Both Fail!");
        expect(html).toContain("Tie");
    });

    it("result card still reports a mutual failure as Both Fail (#1081)", async () => {
        const data = await cardData(await makeBothFail());
        const html = renderTemplateReal(RESULT, {
            ...data,
            title: "Opposed Result",
        });
        expect(html).toContain("Both Fail!");
        expect(html).not.toContain("Tie");
    });

    it("result card labels the margin Victory Stars (#1160)", async () => {
        const data = await cardData();
        const html = renderTemplateReal(RESULT, {
            ...data,
            title: "Opposed Result",
        });
        expect(html).toContain("Victory Stars:");
        expect(html).not.toContain("Success Stars");
    });

    it("result card reports a broken tie with the winner and the deciding rule (#1160)", async () => {
        // Differing rolls under the same mastery level tie at Marginal Success,
        // so the higher d100 settles it — no roll-off, no RNG.
        const opposed = await makeTied({ sourceRoll: 44, targetRoll: 12 });
        (opposed as any).breakTies = true;
        await opposed.evaluate();
        const data = await cardData(opposed);
        const html = renderTemplateReal(RESULT, {
            ...data,
            title: "Opposed Result",
        });
        expect(html).toMatch(/Aldric[\s\S]*?Wins!/);
        expect(html).toContain("Victory Stars:");
        // One star, and it is the tester's — filled, not hollow.
        expect(html.match(/fa-solid fa-star/g) ?? []).toHaveLength(1);
        expect(html).not.toContain("fa-regular fa-star");
        expect(html).toContain("Tie broken on");
        expect(html).not.toContain("Tie — No Winner!");
    });

    it("result card no longer references the removed combatResult section", async () => {
        const data = await cardData();
        const html = renderTemplateReal(RESULT, {
            ...data,
            title: "Opposed Result",
        });
        expect(html).not.toContain("Tactical Advantages");
    });
});
