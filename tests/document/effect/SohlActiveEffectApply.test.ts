/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { SohlActiveEffect } from "@src/document/effect/foundry/SohlActiveEffect";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { ACTIVE_EFFECT_SCOPE } from "@src/utils/constants";

const parent = { _kind: "parent" } as any;

function newVM(base?: number): ValueModifier {
    const vm = new ValueModifier({}, { parent });
    if (base !== undefined) vm.setBase(base);
    return vm;
}

function fakeChange(
    key: string,
    value: unknown,
    type = "add",
    extra: Record<string, unknown> = {},
): any {
    return {
        key,
        type,
        value,
        phase: "initial",
        priority: 0,
        effect: { name: "Test Effect" },
        ...extra,
    };
}

function call(targetDoc: any, change: any): unknown {
    return (SohlActiveEffect as any)._applyChangeUnguided(
        targetDoc,
        change,
        {},
        {},
    );
}

describe("SohlActiveEffect._applyChangeUnguided", () => {
    describe("non-SoHL keys", () => {
        it("falls through to super for standard system.* keys", () => {
            const target = { system: { foo: 0 } };
            // ActiveEffect mock's _applyChangeUnguided returns undefined; we
            // verify the SoHL override delegates by spying on it.
            const spy = vi.spyOn(
                (globalThis as any).ActiveEffect,
                "_applyChangeUnguided",
            );
            call(target, fakeChange("system.foo", 1));
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe("mod: keys (modifier deltas)", () => {
        it("pushes a delta onto the ValueModifier at the path", () => {
            const vm = newVM(10);
            const target = { uuid: "X", logic: { score: vm } };
            call(target, fakeChange("mod:logic.score", "3"));
            expect(vm.deltas).toHaveLength(1);
            expect(vm.deltas[0].value).toBe("3");
            expect(vm.effective).toBe(13);
        });

        it("multiplies via change.type 'multiply'", () => {
            const vm = newVM(10);
            const target = { uuid: "X", logic: { score: vm } };
            call(target, fakeChange("mod:logic.score", "2", "multiply"));
            expect(vm.effective).toBe(20);
        });

        it("overrides via change.type 'override'", () => {
            const vm = newVM(10);
            const target = { uuid: "X", logic: { score: vm } };
            call(target, fakeChange("mod:logic.score", "42", "override"));
            expect(vm.effective).toBe(42);
        });

        it("warns when the path does not resolve to a ValueModifier", () => {
            const target = { uuid: "X", logic: { plainField: 5 } };
            // Should not throw
            expect(() =>
                call(target, fakeChange("mod:logic.plainField", "3")),
            ).not.toThrow();
            expect(target.logic.plainField).toBe(5);
        });

        it("warns when the path resolves to undefined", () => {
            const target = { uuid: "X", logic: {} };
            expect(() =>
                call(target, fakeChange("mod:logic.missing", "3")),
            ).not.toThrow();
        });
    });

    describe("strike-mode scope (mod:<path> on matched strike modes)", () => {
        // The effect supplies the matched strike modes; scope routing keys off
        // `change.effect.system.scope`. (matchingStrikeModes' own predicate
        // logic is covered in SohlActiveEffectTargets.test.ts.)
        const makeEffect = (scope: string, matched: any[]) => ({
            name: "Test Effect",
            system: { scope },
            matchingStrikeModes: () => matched,
        });
        const smChange = (key: string, value: unknown, effect: any) =>
            fakeChange(key, value, "add", { effect });

        it("pushes a delta onto each matched strike mode's VM at mod:<path>", () => {
            const sm1 = { attack: newVM(5) };
            const sm2 = { attack: newVM(3) };
            const effect = makeEffect(ACTIVE_EFFECT_SCOPE.MELEE_STRIKE_MODE, [
                sm1,
                sm2,
            ]);
            call({ uuid: "W" }, smChange("mod:attack", "2", effect));
            expect(sm1.attack.effective).toBe(7); // 5 + 2
            expect(sm2.attack.effective).toBe(5); // 3 + 2
        });

        it("resolves nested paths (mod:defense.block)", () => {
            const sm = { defense: { block: newVM(4) } };
            const effect = makeEffect(ACTIVE_EFFECT_SCOPE.MELEE_STRIKE_MODE, [
                sm,
            ]);
            call({ uuid: "W" }, smChange("mod:defense.block", "3", effect));
            expect(sm.defense.block.effective).toBe(7);
        });

        it("warns (no throw) when a path doesn't resolve to a ValueModifier", () => {
            const sm = { attack: 99 }; // not a VM
            const effect = makeEffect(ACTIVE_EFFECT_SCOPE.MISSILE_STRIKE_MODE, [
                sm,
            ]);
            expect(() =>
                call({ uuid: "W" }, smChange("mod:attack", "2", effect)),
            ).not.toThrow();
            expect(sm.attack).toBe(99); // unchanged
        });

        it("is a no-op for a non-mod: key", () => {
            const sm = { attack: newVM(5) };
            const effect = makeEffect(ACTIVE_EFFECT_SCOPE.MELEE_STRIKE_MODE, [
                sm,
            ]);
            call({ uuid: "W" }, smChange("attack", "2", effect));
            expect(sm.attack.effective).toBe(5); // unchanged
        });
    });
});
