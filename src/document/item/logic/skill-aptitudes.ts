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

import { SKILL_APTITUDE_SUBTYPE_PREFIX } from "@src/utils/constants";

/**
 * A **skill-aptitude map**: an innate leaning toward or away from a class of
 * skills, as authored on an item.
 *
 * Each key is a **selector** — a bare skill `shortcode` naming one skill, or
 * `subType:<value>` naming every skill of that subtype — and each value is a
 * mastery-level modifier in the usual ±5 steps. A `0` entry is meaningful and
 * must be authored where it applies: it is not "no opinion" but "this class of
 * skill is untouched", which beats any negative when maps merge.
 *
 * The canonical carrier is a birthsign, whose six elements each expand to the
 * subtype selectors that element claims plus the shortcodes of its own skills.
 * Nothing about the map is birthsign-specific, though — any item asserting an
 * innate aptitude may carry one.
 */
export type SkillAptitudes = Record<string, number>;

/**
 * Build the aptitude selector for a skill subtype.
 *
 * @param subType - The skill subtype value (e.g. `nature`).
 * @returns The prefixed selector key (e.g. `subType:nature`).
 */
export function subTypeAptitudeKey(subType: string): string {
    return `${SKILL_APTITUDE_SUBTYPE_PREFIX}${subType}`;
}

/**
 * Merge one item's aptitudes into an accumulator, **keeping the greater value
 * per selector**.
 *
 * Aptitudes never sum. Where two sources speak to the same selector the greater
 * wins, so a character under several influences is as apt as the most favourable
 * of them and no more — which is exactly what makes a two-sign birth a cusp
 * rather than a doubling. The rule is monotonic by design: each further source
 * can only raise a selector, never lower it.
 *
 * Non-numeric and `NaN` values are skipped rather than merged, so malformed
 * authored data cannot poison the accumulator with a value that would propagate
 * through every later comparison.
 *
 * @param accumulator - The running merged map, mutated in place.
 * @param aptitudes - One item's aptitudes; absent or empty is a no-op.
 * @returns The same accumulator, so calls can chain.
 */
export function mergeSkillAptitudes(
    accumulator: Map<string, number>,
    aptitudes: SkillAptitudes | undefined,
): Map<string, number> {
    if (!aptitudes) return accumulator;
    for (const [selector, value] of Object.entries(aptitudes)) {
        if (typeof value !== "number" || Number.isNaN(value)) continue;
        const current = accumulator.get(selector);
        if (current === undefined || value > current) {
            accumulator.set(selector, value);
        }
    }
    return accumulator;
}

/**
 * The aptitude modifier that applies to one skill: the **greater** of its
 * shortcode match and its subtype match.
 *
 * A skill can be named twice — once by shortcode and once through its subtype —
 * and the two need not agree (a birthsign favours one element by subtype while
 * claiming a differently-elemented skill by name). The same rule that merges
 * sources resolves the overlap: the better of the two applies, never their sum.
 *
 * @param aptitudes - The actor's merged aptitude map; absent yields no modifier.
 * @param shortcode - The skill's shortcode.
 * @param subType - The skill's subtype.
 * @returns The modifier, or `undefined` when neither selector matched. A matched
 *   `0` is returned as `0` — distinct from no match, though both leave the
 *   skill's mastery level unchanged.
 */
export function skillAptitudeFor(
    aptitudes: Map<string, number> | undefined,
    shortcode: string | undefined,
    subType: string | undefined,
): number | undefined {
    if (!aptitudes?.size) return undefined;
    const byShortcode = shortcode ? aptitudes.get(shortcode) : undefined;
    const bySubType =
        subType ? aptitudes.get(subTypeAptitudeKey(subType)) : undefined;
    if (byShortcode === undefined) return bySubType;
    if (bySubType === undefined) return byShortcode;
    return Math.max(byShortcode, bySubType);
}
