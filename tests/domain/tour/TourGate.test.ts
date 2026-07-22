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

import { describe, it, expect } from "vitest";
import { TOUR_STEP_KIND, TourGate, gateValue } from "@src/entity/tour/TourGate";
import {
    isNextEnabled,
    canAdvance,
    stepKind,
    type SohlTourStepConfig,
} from "@src/entity/tour/TourStep";

/** Minimal step factory for the gating decision tests. */
function step(overrides: Partial<SohlTourStepConfig> = {}): SohlTourStepConfig {
    return {
        id: "s",
        title: "T",
        content: "C",
        ...overrides,
    };
}

describe("TourGate — evaluation", () => {
    it("a value gate carries the VALUE_GATE kind", () => {
        const gate = TourGate.value(gateValue.equals("x"));
        expect(gate.kind).toBe(TOUR_STEP_KIND.VALUE_GATE);
    });

    it("a state gate carries the STATE_GATE kind", () => {
        const gate = TourGate.state((ctx) => Boolean(ctx.state));
        expect(gate.kind).toBe(TOUR_STEP_KIND.STATE_GATE);
    });

    it("evaluate returns the predicate's boolean result", () => {
        const gate = TourGate.value(gateValue.equals("Broadsword"));
        expect(gate.evaluate({ value: "Broadsword" })).toBe(true);
        expect(gate.evaluate({ value: "Dagger" })).toBe(false);
    });

    it("coerces a truthy non-boolean predicate result to true/false", () => {
        // A predicate that returns a truthy object must not leak that object.
        const gate = TourGate.value(() => ({}) as unknown as boolean);
        expect(gate.evaluate({})).toBe(false);
    });

    it("fails closed when the predicate throws (Next stays disabled)", () => {
        const gate = TourGate.state(() => {
            throw new Error("boom");
        });
        expect(gate.evaluate({ state: 1 })).toBe(false);
    });
});

describe("gateValue predicate helpers", () => {
    it("equals matches strict equality", () => {
        const p = gateValue.equals(42);
        expect(p({ value: 42 })).toBe(true);
        expect(p({ value: "42" })).toBe(false);
    });

    it("oneOf matches membership", () => {
        const p = gateValue.oneOf(["a", "b"]);
        expect(p({ value: "b" })).toBe(true);
        expect(p({ value: "c" })).toBe(false);
    });

    it("matches tests a string against a pattern, ignoring the global flag", () => {
        const p = gateValue.matches(/^Basic Folk/g);
        expect(p({ value: "Basic Folk (Human)" })).toBe(true);
        // A second call must not be affected by RegExp lastIndex statefulness.
        expect(p({ value: "Basic Folk (Human)" })).toBe(true);
        expect(p({ value: "Dwarf" })).toBe(false);
        expect(p({ value: 123 })).toBe(false);
    });

    it("nonEmpty rejects blank, whitespace, null and undefined", () => {
        const p = gateValue.nonEmpty();
        expect(p({ value: "Aldric" })).toBe(true);
        expect(p({ value: "   " })).toBe(false);
        expect(p({ value: "" })).toBe(false);
        expect(p({ value: undefined })).toBe(false);
        expect(p({ value: null })).toBe(false);
    });

    it("truthy reflects JS truthiness of the value", () => {
        const p = gateValue.truthy();
        expect(p({ value: 1 })).toBe(true);
        expect(p({ value: 0 })).toBe(false);
    });
});

describe("step kind resolution", () => {
    it("defaults to FREE when neither kind nor gate is set", () => {
        expect(stepKind(step())).toBe(TOUR_STEP_KIND.FREE);
    });

    it("infers the kind from an attached gate", () => {
        expect(stepKind(step({ gate: TourGate.state(() => true) }))).toBe(
            TOUR_STEP_KIND.STATE_GATE,
        );
    });

    it("prefers an explicit kind over the inferred one", () => {
        expect(
            stepKind(
                step({
                    kind: TOUR_STEP_KIND.FREE,
                    gate: TourGate.value(() => true),
                }),
            ),
        ).toBe(TOUR_STEP_KIND.FREE);
    });
});

describe("isNextEnabled / canAdvance — the disable-Next decision", () => {
    it("a free step always enables Next regardless of context", () => {
        const s = step();
        expect(isNextEnabled(s, {})).toBe(true);
        expect(isNextEnabled(s, { value: "anything" })).toBe(true);
        expect(canAdvance(s, {})).toBe(true);
    });

    it("a value-gated step disables Next until the control holds the value", () => {
        const s = step({
            gate: TourGate.value(gateValue.equals("Broadsword")),
        });
        expect(isNextEnabled(s, { value: "Dagger" })).toBe(false);
        expect(isNextEnabled(s, { value: "Broadsword" })).toBe(true);
    });

    it("a state-gated step disables Next until the state predicate passes", () => {
        const s = step({
            gate: TourGate.state(
                (ctx) => (ctx.state as any)?.equipped === true,
            ),
        });
        expect(isNextEnabled(s, { state: { equipped: false } })).toBe(false);
        expect(isNextEnabled(s, { state: { equipped: true } })).toBe(true);
    });

    it("canAdvance mirrors isNextEnabled", () => {
        const s = step({ gate: TourGate.value(gateValue.truthy()) });
        expect(canAdvance(s, { value: "" })).toBe(
            isNextEnabled(s, { value: "" }),
        );
        expect(canAdvance(s, { value: "x" })).toBe(
            isNextEnabled(s, { value: "x" }),
        );
    });

    it("a step declared gated but missing its gate does not block (misconfig is lenient)", () => {
        const s = step({ kind: TOUR_STEP_KIND.VALUE_GATE });
        expect(isNextEnabled(s, {})).toBe(true);
    });
});
