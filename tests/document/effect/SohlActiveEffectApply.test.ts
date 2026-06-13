/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { SohlActiveEffect } from "@src/document/effect/foundry/SohlActiveEffect";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { ITEM_KIND } from "@src/utils/constants";

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

    describe("sm: keys (strike-mode targeting)", () => {
        const makeWeapon = (modes: any[]) => ({
            type: ITEM_KIND.WEAPONGEAR,
            uuid: "W",
            logic: { strikeModes: modes },
        });

        it("is a no-op on non-WeaponGear targets", () => {
            const target = {
                type: "skill",
                uuid: "S",
                logic: { strikeModes: [] },
            };
            expect(() =>
                call(target, fakeChange("sm:attack", "1")),
            ).not.toThrow();
        });

        it("with empty predicate, applies to every strike mode", () => {
            const sm1 = { type: "melee", attack: 5 };
            const sm2 = { type: "missile", attack: 3 };
            const target = makeWeapon([sm1, sm2]);
            call(target, fakeChange("sm:attack", "7"));
            expect(sm1.attack).toBe("7");
            expect(sm2.attack).toBe("7");
        });

        it("with predicate, applies only to matching strike modes", () => {
            const sm1 = { type: "melee", attack: 5 };
            const sm2 = { type: "missile", attack: 3 };
            const target = makeWeapon([sm1, sm2]);
            call(
                target,
                fakeChange("sm:attack", "7", "add", {
                    strikeModePredicate: 'sm.type === "melee"',
                }),
            );
            expect(sm1.attack).toBe("7");
            expect(sm2.attack).toBe(3); // unchanged
        });

        it("a predicate that throws on one sm skips that sm only", () => {
            const sm1 = { type: "melee", attack: 5 };
            const sm2 = { attack: 3 }; // no .type → sm.type.foo throws
            const target = makeWeapon([sm2, sm1]);
            call(
                target,
                fakeChange("sm:attack", "9", "add", {
                    strikeModePredicate: 'sm.type === "melee"',
                }),
            );
            expect(sm1.attack).toBe("9");
            expect(sm2.attack).toBe(3); // unchanged (predicate false / undefined)
        });
    });

    describe("mod:sm: keys (modifier deltas on strike modes)", () => {
        const makeWeapon = (modes: any[]) => ({
            type: ITEM_KIND.WEAPONGEAR,
            uuid: "W",
            logic: { strikeModes: modes },
        });

        it("composes: predicate filters, delta pushed into each surviving sm's VM", () => {
            const sm1 = { type: "melee", attack: newVM(5) };
            const sm2 = { type: "missile", attack: newVM(3) };
            const target = makeWeapon([sm1, sm2]);
            call(
                target,
                fakeChange("mod:sm:attack", "2", "add", {
                    strikeModePredicate: 'sm.type === "melee"',
                }),
            );
            expect(sm1.attack.effective).toBe(7); // 5 + 2
            expect(sm2.attack.effective).toBe(3); // unchanged
        });

        it("skips strike modes whose path doesn't resolve to a VM", () => {
            const sm1 = { type: "melee", attack: 99 }; // not a VM
            const sm2 = { type: "missile", attack: newVM(3) };
            const target = makeWeapon([sm1, sm2]);
            expect(() =>
                call(target, fakeChange("mod:sm:attack", "2")),
            ).not.toThrow();
            expect(sm1.attack).toBe(99); // unchanged
            expect(sm2.attack.effective).toBe(5);
        });
    });
});
