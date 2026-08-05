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

import type {
    AstrologySign,
    AstrologyCycle,
    AstrologyCyclePosition,
    AstrologyTradition,
    AstrologyTraditions,
    MonthDay,
} from "./AstrologyTradition";

/** An entry skipped during validation, with a human-readable reason. */
export interface SkippedEntry {
    /** The key path of the skipped entry (e.g. `"arc"` or `"arc.signs[2]"`). */
    key: string;
    /** Why it was skipped. */
    reason: string;
}

/** The outcome of validating a raw traditions object. */
export interface ValidateTraditionsResult {
    /** The traditions that validated, keyed by tradition key (`source: "world"`). */
    traditions: AstrologyTraditions;
    /** Entries skipped as invalid, each with a reason (never throws on bad data). */
    skipped: SkippedEntry[];
}

/**
 * Coerce to a finite number, or `undefined` when not numeric.
 * @param value - The value to coerce.
 * @returns The finite number, or `undefined`.
 */
function num(value: unknown): number | undefined {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
}

/**
 * Validate a `{ month, day }` pair.
 * @param value - The candidate month/day object.
 * @returns The validated pair, or `undefined` when malformed.
 */
function monthDay(value: unknown): MonthDay | undefined {
    if (!value || typeof value !== "object") return undefined;
    const month = num((value as MonthDay).month);
    const day = num((value as MonthDay).day);
    if (month === undefined || day === undefined) return undefined;
    return { month, day };
}

/**
 * Validate a `skillModifiers` map into `{ [key]: number }` (bad values dropped).
 * @param value - The candidate modifiers map.
 * @returns A map of key → finite number (empty when absent/invalid).
 */
function skillModifiers(value: unknown): Record<string, number> {
    const out: Record<string, number> = {};
    if (!value || typeof value !== "object") return out;
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        const n = num(v);
        if (n !== undefined) out[k] = n;
    }
    return out;
}

/**
 * Validate one raw sign; returns the clean sign or a reason string on failure.
 * @param raw - The raw sign object.
 * @returns The validated sign, or an error-reason string.
 */
function validateSign(raw: unknown): AstrologySign | string {
    if (!raw || typeof raw !== "object") return "sign is not an object";
    const r = raw as Partial<AstrologySign>;
    if (typeof r.shortcode !== "string" || !r.shortcode.trim()) {
        return "sign is missing a string shortcode";
    }
    const start = monthDay(r.start);
    const end = monthDay(r.end);
    if (!start) return `sign "${r.shortcode}" has an invalid start month/day`;
    if (!end) return `sign "${r.shortcode}" has an invalid end month/day`;
    return {
        shortcode: r.shortcode,
        label: typeof r.label === "string" ? r.label : r.shortcode,
        start,
        end,
        cuspDays: Math.max(0, num(r.cuspDays) ?? 0),
        skillModifiers: skillModifiers(r.skillModifiers),
    };
}

/**
 * Validate one raw cycle position; returns the clean position or a reason string.
 * @param raw - The raw position object.
 * @returns The validated position, or an error-reason string.
 */
function validateCyclePosition(raw: unknown): AstrologyCyclePosition | string {
    if (!raw || typeof raw !== "object") return "position is not an object";
    const r = raw as Partial<AstrologyCyclePosition>;
    if (typeof r.shortcode !== "string" || !r.shortcode.trim()) {
        return "position is missing a string shortcode";
    }
    return {
        shortcode: r.shortcode,
        label: typeof r.label === "string" ? r.label : r.shortcode,
        skillModifiers: skillModifiers(r.skillModifiers),
    };
}

/** A raw cycle object as authored (before validation). */
interface RawCycle {
    /** The cycle's stable shortcode. */
    shortcode?: unknown;
    /** The display label (may be a localization key). */
    label?: unknown;
    /** The number of years per full turn of the cycle. */
    cycleLength?: unknown;
    /** The year at cycle position 0. */
    epochYear?: unknown;
    /** The raw positions comprising the cycle. */
    positions?: unknown;
}

/**
 * Validate one raw {@link AstrologyCycle}. Appends a reason to `skipped` (under
 * `<key>.cycles[<index>]`, and per-position under `.positions[<i>]`) and returns
 * `undefined` on failure rather than throwing. A cycle needs a string
 * `shortcode`, a positive-integer `cycleLength`, and at least one valid position;
 * positions may be sparse (fewer than `cycleLength`). `epochYear` defaults to `0`.
 * @param raw - The raw cycle object.
 * @param traditionKey - The owning tradition's key (for skip-key paths).
 * @param index - The cycle's index within the tradition.
 * @param skipped - The skip-list to append reasons to.
 * @returns The validated cycle, or `undefined` when it is dropped.
 */
function validateCycle(
    raw: unknown,
    traditionKey: string,
    index: number,
    skipped: SkippedEntry[],
): AstrologyCycle | undefined {
    const cycleKey = `${traditionKey}.cycles[${index}]`;
    if (!raw || typeof raw !== "object") {
        skipped.push({ key: cycleKey, reason: "cycle is not an object" });
        return undefined;
    }
    const r = raw as RawCycle;
    if (typeof r.shortcode !== "string" || !r.shortcode.trim()) {
        skipped.push({
            key: cycleKey,
            reason: "cycle is missing a string shortcode",
        });
        return undefined;
    }
    const cycleLength = num(r.cycleLength);
    if (
        cycleLength === undefined ||
        cycleLength <= 0 ||
        !Number.isInteger(cycleLength)
    ) {
        skipped.push({
            key: cycleKey,
            reason: "cycle has a non-positive-integer cycleLength",
        });
        return undefined;
    }
    if (!Array.isArray(r.positions)) {
        skipped.push({ key: cycleKey, reason: "cycle has no positions array" });
        return undefined;
    }
    const positions: AstrologyCyclePosition[] = [];
    r.positions.forEach((rawPos, i) => {
        const result = validateCyclePosition(rawPos);
        if (typeof result === "string") {
            skipped.push({
                key: `${cycleKey}.positions[${i}]`,
                reason: result,
            });
        } else {
            positions.push(result);
        }
    });
    if (!positions.length) {
        skipped.push({ key: cycleKey, reason: "cycle has no valid positions" });
        return undefined;
    }
    return {
        shortcode: r.shortcode,
        label: typeof r.label === "string" ? r.label : r.shortcode,
        cycleLength,
        epochYear: num(r.epochYear) ?? 0,
        positions,
    };
}

/** A raw tradition object as authored: self-describing via its own `shortcode`. */
interface RawTradition {
    /** The tradition's stable key, carried on the object itself. */
    shortcode?: unknown;
    /** The display label (may be a localization key). */
    label?: unknown;
    /** The raw signs comprising the tradition. */
    signs?: unknown;
    /** The raw year cycles comprising the tradition. */
    cycles?: unknown;
}

/**
 * Validate one **self-describing** raw tradition — an object carrying its own
 * `shortcode` (its stable key), a `label`, and a `signs` array — into a clean
 * {@link AstrologyTradition}. Appends a reason to `skipped` (under the tradition's
 * `shortcode`, or `fallbackKey` before one is known) and returns `undefined` on
 * any failure rather than throwing. Signs are validated individually: a malformed
 * sign is skipped by index while the rest are kept, and a tradition with no valid
 * signs is dropped.
 * @param raw - The raw tradition object.
 * @param fallbackKey - The key to record a skip under before the `shortcode` is read.
 * @param source - Provenance to stamp on the accepted tradition.
 * @param skipped - The skip-list to append reasons to.
 * @returns The validated tradition, or `undefined` when it is dropped.
 */
function validateTradition(
    raw: unknown,
    fallbackKey: string,
    source: NonNullable<AstrologyTradition["source"]>,
    skipped: SkippedEntry[],
): AstrologyTradition | undefined {
    if (!raw || typeof raw !== "object") {
        skipped.push({
            key: fallbackKey,
            reason: "tradition is not an object",
        });
        return undefined;
    }
    const v = raw as RawTradition;
    if (typeof v.shortcode !== "string" || !v.shortcode.trim()) {
        skipped.push({
            key: fallbackKey,
            reason: "tradition is missing a string shortcode",
        });
        return undefined;
    }
    const key = v.shortcode;
    const signs: AstrologySign[] = [];
    if (Array.isArray(v.signs)) {
        v.signs.forEach((rawSign, i) => {
            const result = validateSign(rawSign);
            if (typeof result === "string") {
                skipped.push({ key: `${key}.signs[${i}]`, reason: result });
            } else {
                signs.push(result);
            }
        });
    }
    const cycles: AstrologyCycle[] = [];
    if (Array.isArray(v.cycles)) {
        v.cycles.forEach((rawCycle, i) => {
            const result = validateCycle(rawCycle, key, i, skipped);
            if (result) cycles.push(result);
        });
    }
    // A tradition contributes birthsigns through solar signs and/or year cycles;
    // one with neither valid signs nor valid cycles has nothing to derive.
    if (!signs.length && !cycles.length) {
        skipped.push({
            key,
            reason: "tradition has no valid signs or cycles",
        });
        return undefined;
    }
    return {
        key,
        label: typeof v.label === "string" ? v.label : key,
        signs,
        ...(cycles.length ? { cycles } : {}),
        source,
    };
}

/**
 * Validate raw, parsed astrology-tradition data (the shipped built-in data file,
 * a module's tradition JSON, or a GM-imported file) into a clean
 * {@link AstrologyTraditions} map, collecting a reason for every entry it skips
 * rather than throwing — so one bad tradition or sign never blocks the rest. Each
 * accepted tradition is keyed by its own `shortcode` and tagged with `source`;
 * each sign is normalized (defaulted `label`/`cuspDays`, numeric-coerced modifiers).
 *
 * Each tradition is **self-describing** — it carries its own `shortcode`, `label`,
 * and `signs` (the shipped `astrokyklos.json` shape). `raw` may be a **single**
 * such tradition object or an **array** of them; either way the result is keyed by
 * each tradition's `shortcode`.
 * @param raw - The parsed tradition data (a single self-describing tradition, or an array).
 * @param source - Provenance to stamp on each accepted tradition (default `"world"`).
 * @returns The validated traditions and the list of skipped entries.
 */
export function validateTraditions(
    raw: unknown,
    source: NonNullable<AstrologyTradition["source"]> = "world",
): ValidateTraditionsResult {
    const traditions: AstrologyTraditions = {};
    const skipped: SkippedEntry[] = [];
    const add = (tradition: AstrologyTradition | undefined): void => {
        if (tradition) traditions[tradition.key] = tradition;
    };

    if (Array.isArray(raw)) {
        raw.forEach((entry, i) => {
            add(validateTradition(entry, `[${i}]`, source, skipped));
        });
        return { traditions, skipped };
    }
    if (!raw || typeof raw !== "object") {
        return { traditions, skipped };
    }
    add(validateTradition(raw, "tradition", source, skipped));
    return { traditions, skipped };
}
