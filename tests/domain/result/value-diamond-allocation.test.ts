/* SPDX-License-Identifier: GPL-3.0-or-later */
import { afterEach, describe, expect, it, vi } from "vitest";
import * as boundary from "@src/core/FoundryHelpers";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { getStandardSuccessValueTable } from "@src/entity/modifier/MasteryLevelModifier";
import { offerValueDiamondAllocation } from "@src/entity/result/valueDiamondAllocation";
import { BRAND } from "@src/utils/constants";

function fixture(earned = 3) {
    const parent = {
        name: "Crafter",
        label: "Crafter",
        data: { kind: "skill" },
        actor: { isOwner: true, uuid: "Actor.crafter" },
        item: { logic: { availableFate: [] } },
        [BRAND.SohlLogic]: true,
    } as any;
    const speaker = new SohlSpeaker({ user: "crafter" });
    const roll = new SimpleRoll({ numDice: 1, dieFaces: 100, rolls: [23] }, { parent });
    const result = new SuccessTestResult(
        {
            isSuccessValue: true,
            resultDescTable: getStandardSuccessValueTable(),
            targetValueFunc: () => earned + 4,
            roll,
        },
        { parent, chatSpeaker: speaker },
    );
    vi.spyOn(boundary, "fvttCurrentUser").mockReturnValue({ id: "crafter" } as any);
    const chat = vi.spyOn(speaker, "toChat").mockResolvedValue(undefined);
    const dialog = vi
        .spyOn(boundary, "dialog")
        .mockResolvedValue({ data: { qualifiers: 1, time: 2 } } as any);
    return { result, parent, dialog, chat, roll };
}
afterEach(() => {
    vi.restoreAllMocks();
    SimpleRoll.clearForced();
});

describe("Value Diamond allocation", () => {
    it("offers zero defaults and applies only the player's post-roll split", async () => {
        const f = fixture();
        SimpleRoll.forceValues(4, 9);
        const original = f.roll.toJSON();
        const allocation = await offerValueDiamondAllocation(f.result, {
            qualifier: { targetNumber: 5, effectLadder: ["none", "fine", "better", "best"] },
        });
        expect(allocation).toMatchObject({
            qualifiers: 1,
            timeDiamonds: 2,
            timeReductionPercent: 20,
            unspent: 0,
            qualifierResult: { rolls: [4], successCount: 1, result: "fine" },
        });
        expect(f.dialog.mock.calls[0]![0]!.data).toMatchObject({
            qualifiers: 0,
            time: 0,
            earned: 3,
        });
        expect(f.roll.toJSON()).toEqual(original);
        expect(SimpleRoll.forcedRemaining).toBe(1);
        expect(f.chat).toHaveBeenCalledTimes(1);
    });
    it("does not allocate or roll on cancel", async () => {
        const f = fixture();
        f.dialog.mockResolvedValue(null);
        SimpleRoll.forceValues(4);
        expect(await offerValueDiamondAllocation(f.result)).toBeUndefined();
        expect(f.chat).not.toHaveBeenCalled();
        expect(SimpleRoll.forcedRemaining).toBe(1);
    });
    it.each([
        { qualifiers: 4, time: 0 },
        { qualifiers: 0, time: 4 },
        { qualifiers: -1, time: 0 },
        { qualifiers: 1.5, time: 0 },
    ])("rejects invalid/overspent split %j", async (split) => {
        const f = fixture();
        f.dialog.mockResolvedValue({ data: split } as any);
        expect(await offerValueDiamondAllocation(f.result)).toBeUndefined();
        expect(f.chat).not.toHaveBeenCalled();
    });
    it("allows leaving diamonds unspent without automatically rolling", async () => {
        const f = fixture();
        f.dialog.mockResolvedValue({ data: { qualifiers: 0, time: 0 } } as any);
        SimpleRoll.forceValues(8);
        expect(await offerValueDiamondAllocation(f.result)).toMatchObject({
            qualifiers: 0,
            timeDiamonds: 0,
            timeReductionPercent: 0,
            unspent: 3,
        });
        expect(SimpleRoll.forcedRemaining).toBe(1);
    });
    it("refuses an unowned source or another recorded controller", async () => {
        const f = fixture();
        f.parent.actor.isOwner = false;
        expect(await offerValueDiamondAllocation(f.result)).toBeUndefined();
        expect(f.dialog).not.toHaveBeenCalled();
    });
    it("refuses when source ownership changes during the offer", async () => {
        const f = fixture();
        f.dialog.mockImplementation(async () => {
            f.parent.actor.isOwner = false;
            return { data: { qualifiers: 1, time: 0 } } as any;
        });
        expect(await offerValueDiamondAllocation(f.result)).toBeUndefined();
        expect(f.chat).not.toHaveBeenCalled();
    });
    it("validates the qualifier ladder before offering or consuming dice", async () => {
        const f = fixture();
        SimpleRoll.forceValues(1);
        await expect(
            offerValueDiamondAllocation(f.result, {
                qualifier: { targetNumber: 5, effectLadder: [] },
            }),
        ).rejects.toThrow();
        expect(SimpleRoll.forcedRemaining).toBe(1);
        expect(f.dialog).not.toHaveBeenCalled();
    });
    it("returns an accepted spending receipt on repeat without another dialog or qualifier roll", async () => {
        const f = fixture();
        SimpleRoll.forceValues(4, 9);
        const options = {
            qualifier: { targetNumber: 5, effectLadder: ["none", "fine", "better", "best"] },
        };
        const chosen = await offerValueDiamondAllocation(f.result, options);
        chosen!.qualifiers = 99;
        chosen!.qualifierResult!.rolls[0] = 10;
        const repeated = await offerValueDiamondAllocation(f.result, options);
        expect(repeated).toMatchObject({ qualifiers: 1, qualifierResult: { rolls: [4] } });
        expect(f.dialog).toHaveBeenCalledTimes(1);
        expect(f.chat).toHaveBeenCalledTimes(1);
        expect(SimpleRoll.forcedRemaining).toBe(1);
    });
    it("permits a cancelled or zero-spend offer to be tried later", async () => {
        const f = fixture();
        f.dialog
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ data: { qualifiers: 0, time: 0 } } as any)
            .mockResolvedValueOnce({ data: { qualifiers: 1, time: 0 } } as any);
        expect(await offerValueDiamondAllocation(f.result)).toBeUndefined();
        expect(await offerValueDiamondAllocation(f.result)).toMatchObject({ unspent: 3 });
        expect(await offerValueDiamondAllocation(f.result)).toMatchObject({
            qualifiers: 1,
            unspent: 2,
        });
        expect(f.dialog).toHaveBeenCalledTimes(3);
    });
    it.each([
        "cancel",
        { action: "cancel" },
        { action: "cancel", data: { qualifiers: 1, time: 2 } },
    ])(
        "accepts the native dialog cancellation boundary %j without allocation or dice",
        async (response) => {
            const f = fixture();
            f.dialog.mockResolvedValue(response as any);
            SimpleRoll.forceValues(4);
            expect(await offerValueDiamondAllocation(f.result)).toBeUndefined();
            expect(f.chat).not.toHaveBeenCalled();
            expect(SimpleRoll.forcedRemaining).toBe(1);
        },
    );
});
