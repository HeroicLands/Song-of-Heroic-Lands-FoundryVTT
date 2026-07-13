/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { makeCombatantLogic, makeMockActor } from "@tests/mocks/logicHarness";
import {
    SohlCombatantLogic,
    attackerBlockingStatus,
    targetInvalidStatus,
    turnStartCombatantUpdate,
} from "@src/document/combatant/logic/SohlCombatantLogic";
import { STATUS_EFFECT } from "@src/utils/constants";
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

    describe("computedMove (moveFactor scaling, #252)", () => {
        /** A combatant whose being's corpus reports the given feet-per-round. */
        function combatantWithMove(feetPerRound: number) {
            return makeCombatantLogic({
                actor: {
                    name: "Runner",
                    logic: {
                        corpus: { feetPerRound: { effective: feetPerRound } },
                    },
                },
            });
        }

        it("scales the corpus feetPerRound by the situational moveFactor", () => {
            const logic = combatantWithMove(50);
            logic.data.moveFactor = 2;
            expect(logic.computedMove()).toBe(100);
        });

        it("returns the unscaled move when moveFactor is the default 1", () => {
            const logic = combatantWithMove(50);
            expect(logic.data.moveFactor).toBe(1);
            expect(logic.computedMove()).toBe(50);
        });

        it("is null when the actor has no corpus (non-being)", () => {
            const logic = makeCombatantLogic({
                actor: { name: "Cart", logic: {} },
            });
            expect(logic.computedMove()).toBeNull();
        });
    });

    describe("turnStartCombatantUpdate (pure)", () => {
        it("records the position under system.startLocation (#386), not initialLocation", () => {
            const update = turnStartCombatantUpdate({ x: 120, y: 340 }, 5);
            expect(update.system.startLocation).toEqual({
                x: 120,
                y: 340,
                elevation: 5,
            });
            // The field the updateCombat hook must write is `startLocation`
            // (the one spacesMovedThisTurn reads) — never `initialLocation`.
            expect(update.system).not.toHaveProperty("initialLocation");
            expect(update.system.didAction).toBe(false);
        });
    });

    describe("attackerBlockingStatus / targetInvalidStatus (pure)", () => {
        it("attacker: null when unimpaired", () => {
            expect(attackerBlockingStatus([], false)).toBeNull();
            expect(attackerBlockingStatus(["stunned"], false)).toBeNull();
        });

        it("attacker: returns the blocking status when present", () => {
            expect(
                attackerBlockingStatus([STATUS_EFFECT.INCAPACITATED], false),
            ).toBe(STATUS_EFFECT.INCAPACITATED);
        });

        it("attacker: folds Foundry DEFEATED in as vanquished", () => {
            expect(attackerBlockingStatus([], true)).toBe(
                STATUS_EFFECT.VANQUISHED,
            );
        });

        it("target: invalid when dead or vanquished/defeated, else null", () => {
            expect(targetInvalidStatus([], false)).toBeNull();
            expect(
                targetInvalidStatus([STATUS_EFFECT.INCAPACITATED], false),
            ).toBeNull(); // incapacitated is still a valid target
            expect(targetInvalidStatus([STATUS_EFFECT.DEAD], false)).toBe(
                STATUS_EFFECT.DEAD,
            );
            expect(targetInvalidStatus([], true)).toBe(
                STATUS_EFFECT.VANQUISHED,
            );
        });
    });

    describe("startAutomatedAttack invariants", () => {
        let warn: any;
        beforeEach(() => {
            warn = vi.spyOn(sohl.log, "uiWarn");
        });
        afterEach(() => vi.restoreAllMocks());

        /** A minimal target token-logic stand-in. */
        const target = () => ({
            name: "Foe",
            actorLogic: { actor: { id: "foe" } },
        });
        /** Spy the target's combatant resolution to a combatant with `data`. */
        const stubTargetCombatant = (data: any) =>
            vi
                .spyOn(FoundryHelpers, "fvttActiveCombatantForActor")
                .mockReturnValue(data ? ({ data } as any) : undefined);

        it("refuses (warns, no roll) when there is no target", async () => {
            const logic = makeCombatantLogic();
            await expect(
                logic.startAutomatedAttack({} as any),
            ).resolves.toBeUndefined();
            expect(warn).toHaveBeenCalled();
        });

        it("refuses when the attacker is defeated", async () => {
            const logic = makeCombatantLogic();
            logic.data.isDefeated = true;
            await expect(
                logic.startAutomatedAttack({ target: target() } as any),
            ).resolves.toBeUndefined();
            expect(warn).toHaveBeenCalled();
        });

        it("refuses when the attacker has a blocking status", async () => {
            const logic = makeCombatantLogic();
            logic.data.statuses = new Set([STATUS_EFFECT.INCAPACITATED]);
            await expect(
                logic.startAutomatedAttack({ target: target() } as any),
            ).resolves.toBeUndefined();
            expect(warn).toHaveBeenCalledWith(
                expect.stringContaining(STATUS_EFFECT.INCAPACITATED),
            );
        });

        it("refuses when the target is not a combatant in the current combat", async () => {
            const logic = makeCombatantLogic();
            stubTargetCombatant(null); // not resolvable to a combatant
            await expect(
                logic.startAutomatedAttack({ target: target() } as any),
            ).resolves.toBeUndefined();
            expect(warn).toHaveBeenCalledWith(
                expect.stringContaining("not a combatant"),
            );
        });

        it("refuses when the target is dead", async () => {
            const logic = makeCombatantLogic();
            stubTargetCombatant({
                statuses: new Set([STATUS_EFFECT.DEAD]),
                isDefeated: false,
            });
            await expect(
                logic.startAutomatedAttack({ target: target() } as any),
            ).resolves.toBeUndefined();
            expect(warn).toHaveBeenCalledWith(expect.stringContaining("dead"));
        });

        it("refuses when the target is defeated (surrendered/vanquished)", async () => {
            const logic = makeCombatantLogic();
            stubTargetCombatant({
                statuses: new Set<string>(),
                isDefeated: true,
            });
            await expect(
                logic.startAutomatedAttack({ target: target() } as any),
            ).resolves.toBeUndefined();
            expect(warn).toHaveBeenCalledWith(
                expect.stringContaining(STATUS_EFFECT.VANQUISHED),
            );
        });
    });
});
