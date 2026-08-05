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
 * The Foundry-free astrology model: the data shapes for an **astrological
 * tradition** (a set of birthsigns keyed by an Affiliation's `society`) and the
 * pure functions that derive a being's birthsign(s) — and their per-skill
 * modifiers — from a birth date.
 *
 * Nothing here reads a world setting or the calendar directly; the Foundry
 * boundary resolves both to plain data (the registry object and an
 * {@link AstrologyDate}) and hands them in, so this module is fully
 * unit-testable. See the {@link https://kb.heroiclands.org/dev/concepts/expressions/ | Expressions}
 * concept doc for how the astrology SafeExpression helpers consume it.
 */

/** A calendar month/day pair (both 1-based) authoring a sign's date window. */
export interface MonthDay {
    /** The 1-based month. */
    month: number;
    /** The 1-based day within the month. */
    day: number;
}

/**
 * A single **birthsign** definition within a tradition: its identity, the date
 * window it governs, its cusp width, and the skill modifiers it confers.
 */
export interface AstrologySign {
    /** The sign's shortcode (its stable, lowercased identity within a tradition). */
    shortcode: string;
    /** The human-readable sign name (a display label; may be a localization key). */
    label: string;
    /** Inclusive start of the sign's date window. */
    start: MonthDay;
    /** Inclusive end of the sign's date window. */
    end: MonthDay;
    /**
     * Days on either side of a window boundary treated as a **cusp** — a birth
     * within `cuspDays` of an adjacent sign's boundary falls under *both* signs.
     * `0` disables cusps for this sign.
     */
    cuspDays: number;
    /**
     * The modifiers this sign confers, keyed by a **skill shortcode** or the
     * wildcard **`"subtype:<skillSubType>"`**; values are signed numbers. A
     * specific skill-shortcode key overrides a matching `subtype:` key at
     * consumption (see the consumer in `SkillLogic`).
     */
    skillModifiers: Record<string, number>;
}

/**
 * A single **position** within an {@link AstrologyCycle} — the cyclic counterpart
 * of an {@link AstrologySign}. A cycle of length _N_ has up to _N_ positions; a
 * birth year selects exactly one (its offset from the cycle's epoch, modulo _N_).
 */
export interface AstrologyCyclePosition {
    /** The position's shortcode (its stable identity within the cycle). */
    shortcode: string;
    /** The human-readable position name (a display label; may be a localization key). */
    label: string;
    /**
     * The modifiers this position confers, keyed exactly as an
     * {@link AstrologySign.skillModifiers} map (skill shortcode or
     * `"subtype:<skillSubType>"`); values are signed numbers.
     */
    skillModifiers: Record<string, number>;
}

/**
 * A **year-keyed cycle** within a tradition — an independent, repeating sequence
 * of {@link AstrologyCyclePosition}s of arbitrary length (a 12-year animal cycle,
 * a 28-year element cycle, a 60-year sexagenary cycle, …). A tradition may
 * declare any number of cycles; each contributes one position's modifiers for a
 * given birth **year**, combined with the solar {@link AstrologySign}s through
 * the same `merge` pipeline. A cycle is orthogonal to the date windows: it keys
 * off the year, they key off the day-of-year.
 */
export interface AstrologyCycle {
    /** The cycle's shortcode (its stable identity within a tradition). */
    shortcode: string;
    /** The human-readable cycle name (a display label; may be a localization key). */
    label: string;
    /**
     * The number of years in one full turn of the cycle; positions repeat every
     * `cycleLength` years. Must be a positive integer.
     */
    cycleLength: number;
    /**
     * The calendar year that sits at cycle **position 0** — the cycle's anchor.
     * A birth year's position is `(year - epochYear) mod cycleLength`. Defaults
     * to `0` when omitted.
     */
    epochYear: number;
    /**
     * The positions comprising the cycle, in order — element index `i` is cycle
     * **position `i`**. Usually `cycleLength` entries; a shorter array leaves the
     * unauthored positions empty (a year landing on one contributes nothing).
     */
    positions: AstrologyCyclePosition[];
}

/**
 * A named **astrological tradition** — a set of solar {@link AstrologySign} date
 * windows and/or any number of year-keyed {@link AstrologyCycle}s. Keyed in the
 * registry by the `society` of a birthsign Affiliation, so an affiliation names
 * the tradition to interpret its member's birth date through.
 */
export interface AstrologyTradition {
    /** The tradition's registry key (equal to an Affiliation `society`). */
    key: string;
    /** The human-readable tradition name (a display label; may be a localization key). */
    label: string;
    /** The signs comprising the tradition, in authored order. */
    signs: AstrologySign[];
    /**
     * The year-keyed {@link AstrologyCycle}s the tradition declares, in authored
     * order — independent of, and combinable with, the solar {@link signs}.
     * Absent/empty for a purely solar tradition.
     */
    cycles?: AstrologyCycle[];
    /**
     * Provenance: a shipped `builtin`, a `module`-registered tradition, or a
     * `world`-authored/overridden one (their resolution order in the registry).
     */
    source?: "builtin" | "module" | "world";
}

/** The whole traditions registry: tradition key → {@link AstrologyTradition}. */
export type AstrologyTraditions = Record<string, AstrologyTradition>;

/**
 * A birth date resolved for astrology: the calendar month/day plus the active
 * calendar's month lengths, so day-of-year arithmetic (and thus cusp distances)
 * is calendar-agnostic and computed without touching Foundry. The Foundry
 * boundary builds this from `game.time.calendar` components; a unit test builds
 * it as a plain object.
 */
export interface AstrologyDate {
    /** The 1-based birth month. */
    month: number;
    /** The 1-based birth day within the month. */
    day: number;
    /** Days in each month, index `0` = month 1. Its sum is the days in the year. */
    monthLengths: number[];
    /**
     * The calendar year of the birth date (the raw year, `0` = the calendar's
     * `yearZero`). Present since #1036 so year-keyed {@link AstrologyCycle}s can
     * resolve their position; absent (`undefined`) for a purely solar derivation.
     */
    year?: number;
}

/**
 * The 1-based day-of-year for a month/day against the given month lengths.
 * A day beyond a month's length still accumulates linearly (callers pass valid
 * calendar dates); month `1`, day `1` is day-of-year `1`.
 * @param md - The month/day pair.
 * @param monthLengths - Days per month, index `0` = month 1.
 * @returns The 1-based day-of-year.
 */
export function dayOfYear(md: MonthDay, monthLengths: number[]): number {
    let doy = md.day;
    for (let m = 0; m < md.month - 1 && m < monthLengths.length; m++) {
        doy += monthLengths[m];
    }
    return doy;
}

/**
 * The total number of days in a year for the given month lengths.
 * @param monthLengths - Days per month, index `0` = month 1.
 * @returns The sum of all month lengths.
 */
export function daysInYear(monthLengths: number[]): number {
    return monthLengths.reduce((sum, n) => sum + n, 0);
}

/**
 * Reduce a (possibly out-of-range) day number to `1..yearLen`, treating the
 * year as circular — so a boundary padded past year-end (or before day 1) wraps.
 * @param day - The (possibly out-of-range) day-of-year.
 * @param yearLen - The number of days in the year.
 * @returns The equivalent day in `1..yearLen`.
 */
function wrapDay(day: number, yearLen: number): number {
    const m = (((day - 1) % yearLen) + yearLen) % yearLen;
    return m + 1;
}

/**
 * Whether `d` falls within the inclusive circular range `[a, b]` on a year of
 * `yearLen` days. When `a > b` the range wraps across year-end.
 * @param d - The day-of-year to test (already in `1..yearLen`).
 * @param a - The (wrapped) range start.
 * @param b - The (wrapped) range end.
 * @param yearLen - The number of days in the year.
 * @returns `true` when `d` is inside the (possibly wrapping) range.
 */
function inCircularRange(
    d: number,
    a: number,
    b: number,
    yearLen: number,
): boolean {
    const lo = wrapDay(a, yearLen);
    const hi = wrapDay(b, yearLen);
    return lo <= hi ? d >= lo && d <= hi : d >= lo || d <= hi;
}

/**
 * The sign(s) governing a birth date within a tradition — **one** on an
 * ordinary day, **two** on a cusp (a birth within a sign's `cuspDays` of an
 * adjacent sign's boundary falls under both). A sign governs `date` when the
 * date lies inside its window **padded by `cuspDays` on each side**, so signs
 * whose padded windows overlap near a shared boundary both match.
 *
 * The tradition's own {@link AstrologyDate.monthLengths} convert both the date
 * and each sign's month/day window into day-of-year, so the comparison is
 * calendar-agnostic. Returned in the tradition's authored sign order.
 * @param tradition - The tradition to interpret the date through.
 * @param date - The resolved birth date (month/day + month lengths).
 * @returns The matching signs (0 if none cover the date, 1 typical, 2 on a cusp).
 */
export function signsForDate(
    tradition: AstrologyTradition,
    date: AstrologyDate,
): AstrologySign[] {
    const yearLen = daysInYear(date.monthLengths);
    if (yearLen <= 0) return [];
    const d = dayOfYear(date, date.monthLengths);
    return tradition.signs.filter((sign) => {
        const start = dayOfYear(sign.start, date.monthLengths);
        const end = dayOfYear(sign.end, date.monthLengths);
        const pad = Math.max(0, sign.cuspDays ?? 0);
        return inCircularRange(d, start - pad, end + pad, yearLen);
    });
}

/**
 * Fold several **modifier dicts** into one, **per key**, applying `combine` to
 * the **present values only** for each key (a key only one dict supplies keeps
 * that value — it is never combined against an implicit `0`). This is the
 * cross-affiliation combination rule: a being with two birthsign affiliations
 * touching the same skill combines them per-key (default: algebraic max), and
 * it matches the in-expression `merge` helper (in `ExpressionHelperRegistry`)
 * for the single-affiliation case. Non-numeric values are coerced with `Number`.
 * @param dicts - The modifier dicts to fold.
 * @param combine - Reduces the present values for a key to its folded value.
 * @returns The folded dict (empty when no dicts have keys).
 */
export function combineModifierDicts(
    dicts: Record<string, number>[],
    combine: (values: number[]) => number,
): Record<string, number> {
    const perKey = new Map<string, number[]>();
    for (const dict of dicts) {
        if (!dict || typeof dict !== "object") continue;
        for (const [k, v] of Object.entries(dict)) {
            if (v === undefined || v === null) continue;
            const bucket = perKey.get(k);
            if (bucket) bucket.push(Number(v));
            else perKey.set(k, [Number(v)]);
        }
    }
    const out: Record<string, number> = {};
    for (const [k, values] of perKey) out[k] = combine(values);
    return out;
}

/**
 * Look up a sign by shortcode within a tradition (case-insensitively).
 * @param tradition - The tradition to search.
 * @param shortcode - The sign shortcode to find.
 * @returns The matching sign, or `undefined` when absent.
 */
export function signByShortcode(
    tradition: AstrologyTradition,
    shortcode: string,
): AstrologySign | undefined {
    const needle = String(shortcode).toLowerCase();
    return tradition.signs.find((s) => s.shortcode.toLowerCase() === needle);
}

/**
 * The 0-based **position index** a birth year occupies within a cycle — its
 * offset from the cycle's `epochYear`, reduced modulo `cycleLength` (so years
 * before the epoch wrap into range).
 * @param cycle - The cycle to resolve against.
 * @param year - The birth year (raw calendar year).
 * @returns The position index in `0..cycleLength-1`, or `-1` when `cycleLength`
 *   is not a positive number.
 */
export function positionIndexForYear(
    cycle: AstrologyCycle,
    year: number,
): number {
    const len = Math.trunc(cycle.cycleLength);
    if (!(len > 0)) return -1;
    const offset = Math.trunc(year) - Math.trunc(cycle.epochYear ?? 0);
    return ((offset % len) + len) % len;
}

/**
 * The {@link AstrologyCyclePosition} governing a birth year within a cycle.
 * @param cycle - The cycle to resolve against.
 * @param year - The birth year (raw calendar year).
 * @returns The governing position, or `undefined` when the resolved index has no
 *   authored position (a sparse cycle whose `positions` is shorter than
 *   `cycleLength`) or `cycleLength` is invalid.
 */
export function positionForYear(
    cycle: AstrologyCycle,
    year: number,
): AstrologyCyclePosition | undefined {
    const idx = positionIndexForYear(cycle, year);
    if (idx < 0 || idx >= cycle.positions.length) return undefined;
    return cycle.positions[idx];
}

/**
 * The cycle positions governing a birth year across **every** cycle a tradition
 * declares — one per cycle that resolves, in the tradition's authored cycle
 * order. The cyclic counterpart of {@link signsForDate}, and the year-keyed input
 * to the `merge` pipeline: its positions' `skillModifiers` fold alongside the
 * solar signs' into the same `BSMod` result.
 * @param tradition - The tradition whose cycles to resolve.
 * @param year - The birth year (raw calendar year).
 * @returns One governing position per resolving cycle (empty when the tradition
 *   declares no cycles, or none resolve for the year).
 */
export function positionsForYear(
    tradition: AstrologyTradition,
    year: number,
): AstrologyCyclePosition[] {
    const out: AstrologyCyclePosition[] = [];
    for (const cycle of tradition.cycles ?? []) {
        const pos = positionForYear(cycle, year);
        if (pos) out.push(pos);
    }
    return out;
}

/**
 * The per-month day counts for a specific year — the leap-aware month lengths
 * that make day-of-year (and thus a near-boundary cusp) exact on calendars whose
 * month lengths vary by year. In a leap year each month contributes its
 * `leapDays` (falling back to `days` when a month declares none); in a common
 * year, its `days`. For a fixed-length calendar (no `leapDays`, or not a leap
 * year) this is just the base month lengths.
 * @param months - The calendar's months, each with base `days` and optional
 *   `leapDays`, in order.
 * @param isLeapYear - Whether the birth year is a leap year in the calendar.
 * @returns The day count for each month, index `0` = month 1.
 */
export function monthLengthsForYear(
    months: { days: number; leapDays?: number | null }[],
    isLeapYear: boolean,
): number[] {
    return months.map((m) =>
        isLeapYear ? (m.leapDays ?? m.days ?? 0) : (m.days ?? 0),
    );
}
