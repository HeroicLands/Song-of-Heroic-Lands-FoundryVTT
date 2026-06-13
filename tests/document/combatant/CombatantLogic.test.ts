/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { makeCombatantLogic, makeMockActor } from "@tests/mocks/logicHarness";
import { CombatantLogic } from "@src/document/combatant/logic/CombatantLogic";
import * as AutomatedCombat from "@src/document/actor/logic/automated-combat";
import * as FoundryHelpers from "@src/core/FoundryHelpers";

describe("CombatantLogic", () => {
    describe("automatedCombatStart (attacker side)", () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("combatant-scoped (no logicUuid) delegates to startAutomatedAttackFromCombatant with this combatant", async () => {
            const spy = vi
                .spyOn(AutomatedCombat, "startAutomatedAttackFromCombatant")
                .mockResolvedValue(undefined);
            const logic = makeCombatantLogic();
            const ctx = { scope: {} } as any;
            await logic.automatedCombatStart(ctx);
            expect(spy).toHaveBeenCalledWith(logic, ctx);
        });

        it("item-logic-scoped resolves the source logic by uuid and delegates to startAutomatedAttackFromItem", async () => {
            const spy = vi
                .spyOn(AutomatedCombat, "startAutomatedAttackFromItem")
                .mockResolvedValue(undefined);
            const actor = makeMockActor();
            const sword = { uuid: "Item.sword1", name: "Sword" };
            actor.itemTypes = {
                weapongear: [{ id: "sword1", name: "Sword", logic: sword }],
            };
            const logic = makeCombatantLogic({ actor });
            const ctx = { scope: { logicUuid: "Item.sword1" } } as any;
            await logic.automatedCombatStart(ctx);
            expect(spy).toHaveBeenCalledWith(sword, "Sword", ctx);
        });

        it("item-logic-scoped warns when no item matches the logicUuid", async () => {
            const warn = vi.spyOn(sohl.log, "uiWarn");
            const logic = makeCombatantLogic();
            const ctx = { scope: { logicUuid: "Item.missing" } } as any;
            await logic.automatedCombatStart(ctx);
            expect(warn).toHaveBeenCalledWith(
                expect.stringMatching(/no item matching the requested attack/),
            );
        });
    });

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
        it("declares the combat-start, move-to-group, and four defense-resume actions", () => {
            const shortcodes = CombatantLogic.defineIntrinsicActions().map(
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
            const move = CombatantLogic.defineIntrinsicActions().find(
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
