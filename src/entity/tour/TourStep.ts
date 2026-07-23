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

import type { TourDrive } from "./TourDrive";
import {
    TOUR_STEP_KIND,
    TourGate,
    type TourGateContext,
    type TourStepKind,
} from "./TourGate";

/**
 * The pure step-configuration shape and the Foundry-free "should Next be
 * enabled?" decision. `SohlTour` (the Foundry-coupled subclass) reads the live
 * sheet to build a {@link TourGateContext}, then defers the decision to
 * {@link isNextEnabled} here.
 */

/**
 * Scene-setting navigation a step performs *before* it is shown. Only
 * navigation is ever automated — never the user's meaningful choices — per the
 * PRIME DIRECTIVE (assist, don't play the game).
 */
export interface SohlTourNav {
    /** UUID of the Actor/Item whose sheet to open and await before the step. */
    uuid?: string;
    /** `data-tab` id to switch to before the step's selector is resolved. */
    tab?: string;
    /** The tab's group (`data-group`); defaults to the sheet's primary group. */
    group?: string;
}

/**
 * The Foundry `TourStep` data fields SoHL reuses verbatim. Kept as a local
 * interface (rather than importing Foundry types) so this module stays
 * Foundry-free and passes the logic-layer purity harness.
 */
export interface TourStepBase {
    /** Machine-friendly id, unique within the tour. */
    id: string;
    /** Tooltip header (localization key or literal). */
    title: string;
    /** Raw HTML body (localization key or literal), split on newlines. */
    content: string;
    /** CSS selector of the element to highlight; centered if omitted. */
    selector?: string;
    /** Preferred tooltip direction relative to the target. */
    tooltipDirection?: string;
    /** Whether the step is GM-only. */
    restricted?: boolean;
}

/**
 * A SoHL tour step: a Foundry {@link TourStepBase} plus the gating and
 * navigation the framework adds.
 */
export interface SohlTourStepConfig extends TourStepBase {
    /**
     * The step kind. Optional: when omitted it is inferred from {@link gate}
     * ({@link stepKind}), defaulting to a free step.
     */
    kind?: TourStepKind;
    /**
     * The gate whose predicate must pass before **Next** is enabled. Required
     * for a value- or state-gated step; absent for a free step.
     */
    gate?: TourGate;
    /**
     * For a value gate: the selector (scoped to the open sheet) of the control
     * whose value feeds the gate. Defaults to {@link TourStepBase.selector}.
     */
    control?: string;
    /** Scene-setting navigation performed before the step. */
    nav?: SohlTourNav;
    /**
     * Drive actions this step *performs* before it is shown, run in order and
     * each awaited (see {@link sohl.entity.tour.runDrive}). Only a railroaded/driven tour uses
     * these; a coach-and-wait step never does. Executed by `SohlTour` before its
     * {@link nav} navigation, so navigation can target documents a drive created.
     */
    drive?: TourDrive[];
}

/**
 * Resolve a step's effective kind: an explicit {@link SohlTourStepConfig.kind}
 * wins; otherwise it is inferred from an attached {@link SohlTourStepConfig.gate}
 * ({@link TourGate.kind}); otherwise the step is {@link TOUR_STEP_KIND.FREE}.
 *
 * @param step - The step configuration.
 * @returns The step's effective kind.
 */
export function stepKind(step: SohlTourStepConfig): TourStepKind {
    return step.kind ?? step.gate?.kind ?? TOUR_STEP_KIND.FREE;
}

/**
 * The core disable-Next decision, Foundry-free and unit-tested.
 *
 * A **free** step always enables Next. A **gated** step enables Next only when
 * its gate is satisfied for the supplied context. A step declared gated but
 * missing its gate is treated leniently (enabled) so a misconfiguration never
 * traps the user mid-tour.
 *
 * @param step - The step configuration.
 * @param ctx - The context read from the live sheet (value or state).
 * @returns Whether **Next** should be enabled for this step.
 */
export function isNextEnabled(
    step: SohlTourStepConfig,
    ctx: TourGateContext = {},
): boolean {
    if (stepKind(step) === TOUR_STEP_KIND.FREE) return true;
    return step.gate ? step.gate.evaluate(ctx) : true;
}

/**
 * Whether the tour may advance past `step` given `ctx`. Advancement and the
 * Next-enable decision are the same rule; this is the intent-revealing alias
 * used by the stepping code.
 *
 * @param step - The step configuration.
 * @param ctx - The context read from the live sheet (value or state).
 * @returns Whether the tour may advance past this step.
 */
export function canAdvance(
    step: SohlTourStepConfig,
    ctx: TourGateContext = {},
): boolean {
    return isNextEnabled(step, ctx);
}
