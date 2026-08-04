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

/** Coerce to a finite number, or `undefined` when not numeric. */
function num(value: unknown): number | undefined {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
}

/** Validate a `{ month, day }` pair; returns `undefined` when malformed. */
function monthDay(value: unknown): MonthDay | undefined {
    if (!value || typeof value !== "object") return undefined;
    const month = num((value as MonthDay).month);
    const day = num((value as MonthDay).day);
    if (month === undefined || day === undefined) return undefined;
    return { month, day };
}

/** Validate a `skillModifiers` map into `{ [key]: number }` (bad values dropped). */
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
 * Validate a raw, parsed traditions object (e.g. from a GM-imported JSON file or
 * the persisted world setting) into a clean {@link AstrologyTraditions} map,
 * collecting a reason for every entry it skips rather than throwing — so one bad
 * tradition or sign never blocks the rest. Each accepted tradition is tagged
 * `source: "world"` and keyed by its object key; each sign is normalized
 * (defaulted `label`/`cuspDays`, numeric-coerced modifiers).
 * @param raw - The parsed object mapping tradition key → tradition.
 * @returns The validated traditions and the list of skipped entries.
 */
export function validateTraditions(raw: unknown): ValidateTraditionsResult {
    const traditions: AstrologyTraditions = {};
    const skipped: SkippedEntry[] = [];
    if (!raw || typeof raw !== "object") {
        return { traditions, skipped };
    }
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
        if (!value || typeof value !== "object") {
            skipped.push({ key, reason: "tradition is not an object" });
            continue;
        }
        const v = value as Partial<AstrologyTradition>;
        if (!Array.isArray(v.signs)) {
            skipped.push({ key, reason: "tradition has no signs array" });
            continue;
        }
        const signs: AstrologySign[] = [];
        v.signs.forEach((rawSign, i) => {
            const result = validateSign(rawSign);
            if (typeof result === "string") {
                skipped.push({ key: `${key}.signs[${i}]`, reason: result });
            } else {
                signs.push(result);
            }
        });
        if (!signs.length) {
            skipped.push({ key, reason: "tradition has no valid signs" });
            continue;
        }
        traditions[key] = {
            key,
            label: typeof v.label === "string" ? v.label : key,
            signs,
            source: "world",
        };
    }
    return { traditions, skipped };
}
