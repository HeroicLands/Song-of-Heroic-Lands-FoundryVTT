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

/**
 * The three kinds of {@link sohl.entity.tour} step, and the pure gate model
 * that decides whether a gated step's **Next** button should be enabled.
 *
 * This module is Foundry-free: a {@link TourGate} predicate receives a
 * {@link TourGateContext} that the Foundry-coupled `SohlTour` reads from the
 * live sheet (a control's value, a snapshot of document/DOM state) — the gate
 * itself only *decides*. That split is what lets the gating logic be unit-tested
 * without a running Foundry (see `tests/domain/tour/`).
 */

/**
 * The kinds of tour step.
 *
 * - `free` — advances on **Next** regardless of what the user typed or chose.
 * - `value-gate` — **Next** stays disabled until a target control holds the
 *   required value.
 * - `state-gate` — **Next** stays disabled until a predicate over document/DOM
 *   **state** passes (an item equipped, strike modes now present, …).
 */
export const TOUR_STEP_KIND = {
    FREE: "free",
    VALUE_GATE: "value-gate",
    STATE_GATE: "state-gate",
} as const;

/** A tour step kind — one of {@link TOUR_STEP_KIND}. */
export type TourStepKind = (typeof TOUR_STEP_KIND)[keyof typeof TOUR_STEP_KIND];

/** The kinds that carry a gate — everything except a free step. */
export type TourGateKind =
    | typeof TOUR_STEP_KIND.VALUE_GATE
    | typeof TOUR_STEP_KIND.STATE_GATE;

/**
 * The evidence a gate predicate decides over. The Foundry-coupled `SohlTour`
 * fills exactly one field before each evaluation:
 * - `value` for a value gate (the current value of the watched control), and
 * - `state` for a state gate (a caller-defined snapshot of document/DOM state).
 */
export interface TourGateContext {
    /** For a value gate: the current value of the watched control. */
    value?: unknown;
    /** For a state gate: a snapshot of the document/DOM state to inspect. */
    state?: unknown;
}

/** A pure predicate deciding whether a gate is satisfied, given its context. */
export type TourGatePredicate = (ctx: TourGateContext) => boolean;

/**
 * A gate attached to a value- or state-gated tour step. It pairs a
 * {@link TourGateKind} with a pure {@link TourGatePredicate}; {@link evaluate}
 * runs the predicate defensively so a gate can never leak a non-boolean or a
 * thrown error into the Next-enable decision.
 */
export class TourGate {
    /** Whether this gate reads a control value or a state snapshot. */
    readonly kind: TourGateKind;

    /** The pure predicate that decides satisfaction. */
    readonly predicate: TourGatePredicate;

    /**
     * Construct a gate from its kind and predicate.
     * @param kind - Whether this gate reads a control value or a state snapshot.
     * @param predicate - The pure predicate that decides satisfaction.
     */
    constructor(kind: TourGateKind, predicate: TourGatePredicate) {
        this.kind = kind;
        this.predicate = predicate;
    }

    /**
     * Decide whether the gate is satisfied for the given context.
     *
     * The result is coerced to a strict boolean, and a throwing predicate is
     * treated as **not satisfied** — a gate fails *closed* so a buggy predicate
     * keeps **Next** disabled rather than letting the user slip past.
     *
     * @param ctx - The evidence read from the live sheet (value or state).
     * @returns `true` only when the predicate cleanly returns `true`.
     */
    evaluate(ctx: TourGateContext): boolean {
        try {
            return this.predicate(ctx) === true;
        } catch {
            return false;
        }
    }

    /**
     * Build a value gate from a predicate over `ctx.value`.
     * @param predicate - Decides satisfaction from the control's value.
     * @returns A value gate wrapping `predicate`.
     */
    static value(predicate: TourGatePredicate): TourGate {
        return new TourGate(TOUR_STEP_KIND.VALUE_GATE, predicate);
    }

    /**
     * Build a state gate from a predicate over `ctx.state`.
     * @param predicate - Decides satisfaction from a state snapshot.
     * @returns A state gate wrapping `predicate`.
     */
    static state(predicate: TourGatePredicate): TourGate {
        return new TourGate(TOUR_STEP_KIND.STATE_GATE, predicate);
    }
}

/**
 * Ready-made predicates for the common **value-gate** cases, each reading
 * `ctx.value` (the current value of the step's watched control). Compose your
 * own for anything more specific — a predicate is just
 * `(ctx: TourGateContext) => boolean`.
 */
export const gateValue = {
    /**
     * Satisfied when the control value strictly equals `expected`.
     * @param expected - The required value.
     * @returns A predicate over `ctx.value`.
     */
    equals:
        (expected: unknown): TourGatePredicate =>
        (ctx) =>
            ctx.value === expected,

    /**
     * Satisfied when the control value is one of `values`.
     * @param values - The accepted values.
     * @returns A predicate over `ctx.value`.
     */
    oneOf:
        (values: readonly unknown[]): TourGatePredicate =>
        (ctx) =>
            values.includes(ctx.value),

    /**
     * Satisfied when the (string) control value matches `pattern`. The global
     * flag is stripped so repeated evaluations are not affected by the shared
     * `RegExp.lastIndex`.
     * @param pattern - The pattern to test the value against.
     * @returns A predicate over `ctx.value`.
     */
    matches:
        (pattern: RegExp): TourGatePredicate =>
        (ctx) => {
            if (typeof ctx.value !== "string") return false;
            const re = new RegExp(
                pattern.source,
                pattern.flags.replace("g", ""),
            );
            return re.test(ctx.value);
        },

    /**
     * Satisfied when the control value is not null/undefined/blank/whitespace.
     * @returns A predicate over `ctx.value`.
     */
    nonEmpty: (): TourGatePredicate => (ctx) =>
        ctx.value != null && String(ctx.value).trim() !== "",

    /**
     * Satisfied when the control value is JS-truthy.
     * @returns A predicate over `ctx.value`.
     */
    truthy: (): TourGatePredicate => (ctx) => Boolean(ctx.value),
};
