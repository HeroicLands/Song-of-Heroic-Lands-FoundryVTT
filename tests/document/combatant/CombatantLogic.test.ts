/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { makeCombatantLogic, makeMockActor } from "@tests/mocks/logicHarness";
import { SohlCombatantLogic } from "@src/document/combatant/logic/SohlCombatantLogic";
import * as FoundryHelpers from "@src/core/FoundryHelpers";

describe("CombatantLogic", () => {
    describe("automated combat resumes (defender side)", () => {
        let warn: any;
        beforeEach(() => {
            warn = vi.spyOn(sohl.log, "uiWarn");
        });
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("only counterstrike warns when scope has no attackResult; block/dodge/ignore return silently", async () => {
            const logic = makeCombatantLogic();
            const ctx = { scope: {} } as any;
            // block/dodge/ignore return silently (undefined, no warn) when
            // attackResult is missing; only counterstrike warns.
            await expect(
                logic.automatedBlockResume(ctx),
            ).resolves.toBeUndefined();
            await expect(
                logic.automatedDodgeResume(ctx),
            ).resolves.toBeUndefined();
            await expect(
                logic.automatedIgnoreResume(ctx),
            ).resolves.toBeUndefined();
            await expect(
                logic.automatedCounterstrikeResume(ctx),
            ).resolves.toBeUndefined();
            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(/requires an attack result in scope/),
            );
        });

        it("automatedBlockResume warns when no strike mode can block", async () => {
            const logic = makeCombatantLogic();
            await logic.automatedBlockResume({
                scope: { attackResult: {} },
            } as any);
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(/no strike mode able to block/),
            );
        });

        it("automatedDodgeResume warns when the combatant has no Dodge skill", async () => {
            const logic = makeCombatantLogic();
            await logic.automatedDodgeResume({
                scope: { attackResult: {} },
            } as any);
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(/no Dodge skill/),
            );
        });

        it("automatedCounterstrikeResume warns when no target combatant is available", async () => {
            const logic = makeCombatantLogic();
            // attackResult present passes the first guard; with no target the
            // next guard fires.
            await logic.automatedCounterstrikeResume({
                scope: { attackResult: {} },
                target: null,
            } as any);
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(
                    /automated attack requires a target combatant/,
                ),
            );
        });
    });

    describe("intrinsic actions", () => {
        it("declares the combat-start, move-to-group, and four defense-resume actions", () => {
            const shortcodes = SohlCombatantLogic.defineIntrinsicActions().map(
                (a) => a.shortcode,
            );
            expect(shortcodes).toEqual(
                expect.arrayContaining([
                    "automatedCombatStart",
                    "moveToGroup",
                    "automatedBlockResume",
                    "automatedDodgeResume",
                    "automatedCounterstrikeResume",
                    "automatedIgnoreResume",
                ]),
            );
        });

        it("gates moveToGroup on isGM and surfaces it as a non-hidden action", () => {
            const move = SohlCombatantLogic.defineIntrinsicActions().find(
                (a) => a.shortcode === "moveToGroup",
            );
            expect(move?.visible).toBe("isGM");
            expect(move?.group).not.toBe("hidden");
        });
    });

    describe("moveToGroup", () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("delegates to the fvttPromptMoveCombatantToGroup shim with this combatant", async () => {
            const spy = vi
                .spyOn(FoundryHelpers, "fvttPromptMoveCombatantToGroup")
                .mockResolvedValue(undefined);
            const logic = makeCombatantLogic();
            await logic.moveToGroup({ scope: {} } as any);
            expect(spy).toHaveBeenCalledWith(logic.combatant);
        });
    });

    describe("getContextOptions (combatant tracker dispatch)", () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("dispatches with the combatant's own actor speaker when the element has no data-actor-id", () => {
            const logic = makeCombatantLogic();
            const entries = logic.getContextOptions();
            const entry = entries.find(
                (e: any) => e.id === "SOHL.Being.ACTION.automatedCombatStart",
            );
            expect(entry).toBeTruthy();

            const action = logic.actions.get("automatedCombatStart");
            const exec = vi
                .spyOn(action, "execute")
                .mockResolvedValue(undefined);

            // An element with no [data-actor-id]/[data-item-id] ancestor.
            const el = { closest: () => null } as unknown as HTMLElement;
            entry.callback(el);

            expect(exec).toHaveBeenCalledTimes(1);
            const ctx = exec.mock.calls[0][0] as any;
            expect(ctx.speaker).toBeTruthy();
        });
    });
});
