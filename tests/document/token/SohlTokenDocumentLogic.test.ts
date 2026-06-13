/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { makeTokenLogic, makeMockActor } from "@tests/mocks/logicHarness";
import { SohlTokenDocumentLogic } from "@src/document/token/logic/SohlTokenDocumentLogic";
import * as helpers from "@src/utils/helpers";

/**
 * Attach a skill/attribute opposed-test item stub to a mock actor so the token
 * logic's `opposedItemLogics()` (which reads `actorLogic.allLogics`) finds it.
 */
function withOpposedItem(
    actor: any,
    kind: "skill" | "attribute",
    stub: {
        uuid: string;
        name: string;
        opposedTestStart?: any;
        opposedTestResume?: any;
        constrainedEffective?: number;
        disabled?: string;
    },
): any {
    const logic = {
        uuid: stub.uuid,
        name: stub.name,
        masteryLevel: {
            disabled: stub.disabled ?? "",
            constrainedEffective: stub.constrainedEffective ?? 50,
            opposedTestStart: stub.opposedTestStart,
            opposedTestResume: stub.opposedTestResume,
        },
    };
    actor.itemTypes = {
        ...(actor.itemTypes ?? {}),
        [kind]: [
            ...((actor.itemTypes?.[kind] as any[]) ?? []),
            { id: stub.uuid, name: stub.name, logic },
        ],
    };
    return logic;
}

describe("SohlTokenDocumentLogic", () => {
    let warn: any;
    beforeEach(() => {
        warn = vi.spyOn(sohl.log, "uiWarn");
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("opposedTestStart (source side)", () => {
        it("resolves the source item logic by logicUuid and delegates to its masteryLevel.opposedTestStart", async () => {
            const opposedTestStart = vi.fn().mockResolvedValue("RESULT");
            const actor = makeMockActor();
            withOpposedItem(actor, "skill", {
                uuid: "Item.stealth1",
                name: "Stealth",
                opposedTestStart,
            });
            const tokenLogic = makeTokenLogic({ actor });
            const ctx = { scope: { logicUuid: "Item.stealth1" } } as any;

            const result = await tokenLogic.opposedTestStart(ctx);

            expect(opposedTestStart).toHaveBeenCalledWith(ctx);
            expect(result).toBe("RESULT");
        });

        it("warns and returns null when no skill/attribute matches the logicUuid", async () => {
            const tokenLogic = makeTokenLogic();
            const ctx = { scope: { logicUuid: "Item.missing" } } as any;

            const result = await tokenLogic.opposedTestStart(ctx);

            expect(result).toBeNull();
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(/no skill or attribute matching/),
            );
        });
    });

    describe("opposedTestResume (responder side)", () => {
        it("warns and returns null when scope carries no opposedTestResultJson", async () => {
            const tokenLogic = makeTokenLogic();
            const result = await tokenLogic.opposedTestResume({
                scope: {},
            } as any);

            expect(result).toBeNull();
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(/no opposed test to resolve/),
            );
        });

        it("warns and returns null when the responder has no usable skill or attribute", async () => {
            const tokenLogic = makeTokenLogic();
            const result = await tokenLogic.opposedTestResume({
                scope: { opposedTestResultJson: "{}" },
                skipDialog: true,
            } as any);

            expect(result).toBeNull();
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(/no usable skill or attribute/),
            );
        });

        it("reconstructs the prior result, selects the responding item, and delegates with priorTestResult in scope", async () => {
            const opposedTestResume = vi.fn().mockResolvedValue("RESOLVED");
            const actor = makeMockActor();
            withOpposedItem(actor, "skill", {
                uuid: "Item.dodge1",
                name: "Dodge",
                opposedTestResume,
            });
            const tokenLogic = makeTokenLogic({ actor });

            const prior = { id: "prior-opposed" };
            const fromJSON = vi
                .spyOn(helpers, "instanceFromJSON")
                .mockReturnValue(prior as any);

            const ctx = {
                skipDialog: true,
                scope: {
                    opposedTestResultJson: "{}",
                    responderLogicUuid: "Item.dodge1",
                },
                clone() {
                    return { scope: {} };
                },
            } as any;

            const result = await tokenLogic.opposedTestResume(ctx);

            expect(fromJSON).toHaveBeenCalledWith("{}", expect.anything());
            expect(opposedTestResume).toHaveBeenCalledTimes(1);
            const passedCtx = opposedTestResume.mock.calls[0][0];
            expect(passedCtx.scope.priorTestResult).toBe(prior);
            expect(result).toBe("RESOLVED");
        });
    });

    describe("intrinsic actions", () => {
        it("declares the opposed-test start and resume actions", () => {
            const shortcodes =
                SohlTokenDocumentLogic.defineIntrinsicActions().map(
                    (a) => a.shortcode,
                );
            expect(shortcodes).toEqual(
                expect.arrayContaining([
                    "opposedTestStart",
                    "opposedTestResume",
                ]),
            );
        });
    });
});
