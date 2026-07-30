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
 * Foundry-free view-model helpers for the Being **print / export** view.
 *
 * The print view is the *second presentation* of the same data layer that
 * {@link BeingSheet} renders interactively: it reuses the section view-models in
 * {@link being-sheet-view} and adds the derivations a static, paginated
 * character record needs — the letterhead's health/status/injury summary lines
 * and the plain-text charge/level formatters that replace the interactive tab's
 * icon-and-tooltip cells. Pure — no Foundry dependency — so it is unit-tested in
 * Node like the rest of the view layer.
 */

import type { BodyPartStatus } from "@src/entity/body/impairment";
import type {
    StatusPill,
    BodyPartLozenge,
} from "@src/document/actor/logic/being-sheet-view";

/** The em dash the print view uses for a disabled / not-applicable value. */
export const PRINT_EM_DASH = "—";

/** The infinity glyph the print view uses for an unbounded charge pool. */
export const PRINT_INFINITY = "∞";

/**
 * Plain-text labels for a body part's impairment status, used in the
 * letterhead's injury summary (the interactive header encodes these as lozenge
 * colors, which do not survive grayscale print — print-safe rule).
 */
export const BODY_PART_STATUS_PRINT_LABEL: Record<BodyPartStatus, string> = {
    none: "healthy",
    minor: "minor",
    major: "major",
    unusable: "unusable",
};

/**
 * Compose the letterhead health line — the qualitative band and the percentage,
 * e.g. `"Wounded · 62%"`. When the being exposes no band label (an incorporeal
 * or health-less being), only the percentage is shown.
 *
 * @param band - The qualitative health-band label, or empty/`undefined`.
 * @param pct - The integer health percentage.
 * @returns The composed health line.
 */
export function formatPrintHealthLine(
    band: string | undefined,
    pct: number,
): string {
    return band ? `${band} · ${pct}%` : `${pct}%`;
}

/**
 * Summarize the being's lit status pills as a comma-joined, localized list for
 * the letterhead (the interactive header shows them as a pill strip). Only
 * active pills are included, in their display order; the result is empty when
 * none are lit.
 *
 * @param pills - The full status-pill roster (see {@link buildStatusPills}).
 * @param localize - Resolves a pill's `label` localization key to display text.
 * @returns The comma-joined active-status labels, or `""` when none are active.
 */
export function summarizeActiveStatuses(
    pills: readonly StatusPill[],
    localize: (key: string) => string,
): string {
    return pills
        .filter((p) => p.active)
        .map((p) => localize(p.label))
        .join(", ");
}

/**
 * Summarize the being's injured body parts as a comma-joined list of
 * `"<part> (<status>)"` for the letterhead, skipping uninjured (`none`) parts.
 * This is the print-safe replacement for the header's color-coded body lozenges,
 * which are meaningless in grayscale print.
 *
 * @param lozenges - The body-part lozenges (see {@link buildBodyPartLozenges}).
 * @param statusLabel - Resolves an impairment status to its display label.
 * @returns The comma-joined injured-part summary, or `""` when all are healthy.
 */
export function summarizeInjuredParts(
    lozenges: readonly BodyPartLozenge[],
    statusLabel: (status: BodyPartStatus) => string,
): string {
    return lozenges
        .filter((l) => l.status !== "none")
        .map((l) => `${l.name} (${statusLabel(l.status)})`)
        .join(", ");
}

/** The charge-pool fields the print charge formatter inspects. */
export interface PrintChargesInput {
    /** Whether the current-charges value is disabled (⇒ unlimited uses). */
    valueDisabled: boolean;
    /** Whether the maximum-charges value is disabled (⇒ no charge pool). */
    maxDisabled: boolean;
    /** The current charge count. */
    value: number;
    /** The maximum charge count (`0` ⇒ unbounded pool). */
    max: number;
}

/**
 * Format a mystery / mystical-ability charge pool as static text, mirroring the
 * interactive sheet's rules with print-safe glyphs, first match
 * wins:
 *
 * - max disabled → em dash (no charge pool);
 * - value disabled → infinity (unlimited uses);
 * - max `0` → `"<value>/∞"` (tracked but unbounded);
 * - otherwise → `"<value>/<max>"`.
 *
 * @param input - The charge-pool state.
 * @returns The formatted charge display string.
 */
export function formatPrintChargesDisplay(input: PrintChargesInput): string {
    if (input.maxDisabled) return PRINT_EM_DASH;
    if (input.valueDisabled) return PRINT_INFINITY;
    if (input.max === 0) return `${input.value}/${PRINT_INFINITY}`;
    return `${input.value}/${input.max}`;
}

/**
 * Format a mystery / mystical-ability level as static text: an em dash when the
 * level is disabled (no base level), otherwise the value — optionally signed
 * (mysteries display a signed level; abilities a plain one).
 *
 * @param disabled - Whether the level is disabled.
 * @param value - The effective level value.
 * @param options - Formatting options.
 * @param options.signed - When `true`, prefix non-negative values with `+`.
 * @returns The formatted level string.
 */
export function formatPrintLevel(
    disabled: boolean,
    value: number,
    options: { signed?: boolean } = {},
): string {
    if (disabled) return PRINT_EM_DASH;
    if (options.signed && value >= 0) return `+${value}`;
    return `${value}`;
}
