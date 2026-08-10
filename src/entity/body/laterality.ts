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
 * **Body laterality and side dominance** (#1253) — which side of a body a part
 * is on, which side a being favors, and whether a given grip is the off hand.
 *
 * This is the single home for the dominance question. It comes up wherever a
 * favored side makes a difference — the off-hand impact reduction is only the
 * first caller — so the rule is defined once here rather than restated at each
 * site.
 *
 * **A being's dominant side is read from its characteristics**, not from a flag
 * on a limb:
 *
 * - Left Dominance alone → the left side is dominant.
 * - Right Dominance alone → the right side is dominant.
 * - **Both, or neither → no dominant side.** An ambidextrous being has no off
 *   hand, and so never suffers an off-hand penalty.
 *
 * **A part's side is derived from its shortcode**, which is guaranteed present
 * and stable, rather than from its display name (which is prose, and
 * localizable). A part is lateral when its shortcode begins with `l` or `r`
 * **and the mirrored shortcode also exists on that body** — `larmpart` is left
 * because `rarmpart` is there beside it. Requiring the twin is what keeps the
 * prefix from misreading a central organ: a lone `liverpart` has no `riverpart`,
 * so it correctly has no side.
 */

import type { BodyPart } from "@src/entity/body/BodyPart";
import { BODY_SIDE, type BodySide } from "@src/utils/constants";

/** Shortcode of the Left Dominance characteristic. */
export const LEFT_DOMINANCE_CODE = "ldmnc";

/** Shortcode of the Right Dominance characteristic. */
export const RIGHT_DOMINANCE_CODE = "rdmnc";

/**
 * The shortcode of a part's mirror twin — `larmpart` ↔ `rarmpart`.
 *
 * @param shortcode - The part shortcode to mirror.
 * @returns The mirrored shortcode, or `undefined` when the code carries no
 *   side prefix at all.
 */
export function mirrorShortcode(shortcode: string): string | undefined {
    const prefix = shortcode[0];
    if (prefix === "l") return `r${shortcode.slice(1)}`;
    if (prefix === "r") return `l${shortcode.slice(1)}`;
    return undefined;
}

/**
 * Which side of the body a part is on.
 *
 * @param part - The body part to place.
 * @returns The part's side, or `undefined` when it is central or unpaired.
 */
export function bodyPartSide(part: BodyPart): BodySide | undefined {
    const twin = mirrorShortcode(part.shortcode);
    if (!twin) return undefined;
    // Only a part with its mirror present on the same body is lateral.
    const paired = part.structure.parts.some((p) => p.shortcode === twin);
    if (!paired) return undefined;
    return part.shortcode[0] === "l" ? BODY_SIDE.LEFT : BODY_SIDE.RIGHT;
}

/**
 * A being's dominant side, from whether it carries each dominance
 * characteristic.
 *
 * @param hasLeftDominance - Whether Left Dominance is present.
 * @param hasRightDominance - Whether Right Dominance is present.
 * @returns The favored side, or `undefined` when the being has none — carrying
 *   both characteristics or neither.
 */
export function dominantSideFrom(
    hasLeftDominance: boolean,
    hasRightDominance: boolean,
): BodySide | undefined {
    if (hasLeftDominance === hasRightDominance) return undefined;
    return hasLeftDominance ? BODY_SIDE.LEFT : BODY_SIDE.RIGHT;
}

/**
 * Whether a grip is an **off-hand** one: every limb holding the item is on the
 * being's non-dominant side.
 *
 * A two-handed grip that includes the dominant limb is not off-hand, and a
 * being with no dominant side never grips off-hand at all.
 *
 * @param heldBy - The body parts gripping the item; empty for an unheld item or
 *   an intrinsic combat technique.
 * @param dominant - The being's dominant side, if it has one.
 * @returns `true` when the grip earns the off-hand penalty.
 */
export function isOffHandGrip(
    heldBy: BodyPart[],
    dominant: BodySide | undefined,
): boolean {
    if (!dominant || !heldBy.length) return false;
    const sides = heldBy.map(bodyPartSide).filter(Boolean);
    // Something must actually be on the far side, and nothing on the near one.
    return sides.length > 0 && sides.every((side) => side !== dominant);
}
