/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { makeCombatantLogic } from "@tests/mocks/logicHarness";
import { CombatantLogic } from "@src/document/combatant/CombatantLogic";

describe("CombatantLogic", () => {
    describe("automated combat resumes (defender side)", () => {
        let warn: any;
        beforeEach(() => {
            warn = vi.spyOn(sohl.log, "uiWarn");
        });
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("each resume warns and aborts when scope has no attackResultJson", async () => {
            const logic = makeCombatantLogic();
            const ctx = { scope: {} } as any;
            await logic.automatedBlockResume(ctx);
            await logic.automatedDodgeResume(ctx);
            await logic.automatedCounterstrikeResume(ctx);
            await logic.automatedIgnoreResume(ctx);
            expect(warn).toHaveBeenCalledTimes(4);
            for (const call of warn.mock.calls) {
                expect(call[0]).toMatch(/no attack result to resolve/);
            }
        });

        it("automatedBlockResume warns when no strike mode can block", async () => {
            const logic = makeCombatantLogic();
            await logic.automatedBlockResume({
                scope: { attackResultJson: {} },
            } as any);
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(/no strike mode able to block/),
            );
        });

        it("automatedDodgeResume warns when the combatant has no Dodge skill", async () => {
            const logic = makeCombatantLogic();
            await logic.automatedDodgeResume({
                scope: { attackResultJson: {} },
            } as any);
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(/no Dodge skill/),
            );
        });

        it("automatedCounterstrikeResume warns when attacker/defender tokens are unavailable", async () => {
            const logic = makeCombatantLogic();
            await logic.automatedCounterstrikeResume({
                scope: { attackResultJson: {} },
                token: null,
            } as any);
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(/attacker's and defender's tokens/),
            );
        });
    });

    describe("intrinsic actions", () => {
        it("declares the four automated-combat defense resumes", () => {
            const shortcodes = CombatantLogic.defineIntrinsicActions().map(
                (a) => a.shortcode,
            );
            expect(shortcodes).toEqual(
                expect.arrayContaining([
                    "automatedBlockResume",
                    "automatedDodgeResume",
                    "automatedCounterstrikeResume",
                    "automatedIgnoreResume",
                ]),
            );
        });
    });
});
