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
 * **Which limb performs a combat technique**, and whether the body has one to
 * spare.
 *
 * A weapon's strike mode is gated on the weapon being held: its `minParts`
 * against the limbs gripping it. A combat technique carries no weapon, so
 * nothing gated it, and a character could grab, punch or raise a forearm with
 * both hands full of poleaxe. This module answers both halves of that in one
 * pass: **which limbs perform the technique**, and **the reason it cannot be
 * performed** when none of them is available.
 *
 * ## Which limbs are candidates
 *
 * The technique's own `impairedByRoles` names the kind of limb it uses — the
 * same data the limb-block hit redirect already reads to decide which limb was
 * raised. Deriving from it keeps one answer to "which limb does this" rather
 * than a second list that can disagree with the first.
 *
 * ## A hand is wanted only by a technique a hand performs
 *
 * A {@link sohl.utils.BODY_ROLE | MANIPULATOR} technique is performed by
 * gripping: a grab closes a hand, a punch makes a fist, a limb block interposes
 * a forearm. So a manipulator technique needs a manipulator that **can grip**
 * (`canHoldItemBase`) and has **nothing in it**. Every other role is performed
 * by a limb that holds nothing in the first place — a press drives with the
 * torso, a kick with a leg, a bite with the jaw — so what the hands are holding
 * has no bearing on it, and a character presses perfectly well with a dagger in
 * each fist.
 *
 * This is also what settles the question for creatures. The role is not the
 * discriminator: a wolf's head carries MANIPULATOR because its bite is how it
 * takes hold of things, and nearly every being in the bestiary has a
 * manipulator part of some kind. What separates them is whether that part can
 * grip — a hand, a paw with a thumb, a tentacle — and only a handful can. A
 * wolf's jaws are a manipulator and are not a hand, so it has no limb a grab,
 * a punch or a limb block could be performed with, and the technique says so
 * rather than being offered.
 *
 * ## Which of several limbs performs it
 *
 * Candidates are ordered **dominant side first**, so a character grabs with
 * their strong hand while it is free and with the other when it is not. The
 * order is deterministic rather than drawn, because the answer carries a rules
 * consequence — an off-side technique is performed at a penalty — and a rule
 * that changed on re-preparation would be unreadable.
 *
 * ## Being held is not being broken
 *
 * An **immobilized** limb is excluded: it keeps its grip and keeps its
 * strength, but it cannot be moved, so it cannot perform anything. An
 * **unusable** limb is excluded by the same test, since being out of action
 * implies being immobilized.
 */

import type { BodyPart } from "@src/entity/body/BodyPart";
import type { BodyStructure } from "@src/entity/body/BodyStructure";
import { bodyPartSide } from "@src/entity/body/laterality";
import { BODY_ROLE, type BodySide } from "@src/utils/constants";

/**
 * The body carries no limb this technique could ever be performed with — the
 * role is absent, or (for a manipulator technique) no limb of that role can
 * grip.
 */
export const NO_SUCH_LIMB = "SOHL.StrikeMode.NoSuchLimb";

/**
 * Every limb that could perform this technique is holding something or out of
 * action, and the technique needs one with nothing in it.
 */
export const NO_FREE_LIMB = "SOHL.StrikeMode.NoFreeLimb";

/** Every limb that could perform this technique is out of action or held fast. */
export const NO_USABLE_LIMB = "SOHL.StrikeMode.NoUsableLimb";

/** What {@link resolvePerformingLimbs} needs to answer for a technique. */
export interface PerformingLimbOptions {
    /** The body performing the technique. */
    structure: BodyStructure;
    /** The body-part roles the technique is performed with (`impairedByRoles`). */
    roles: readonly string[];
    /** How many limbs the technique occupies — the strike mode's `minParts`. */
    minParts: number;
    /** The being's dominant side, when it has one. */
    dominantSide?: BodySide;
}

/** Which limbs perform a technique, and why they cannot. */
export interface PerformingLimbs {
    /**
     * The limbs the technique is performed with, dominant side first and as
     * many as it occupies. Empty when it cannot be performed.
     */
    limbs: BodyPart[];
    /**
     * The limb that performs the technique — the first of {@link limbs}, and
     * the one an off-side penalty is judged against. `undefined` when the
     * technique cannot be performed.
     */
    performingLimb?: BodyPart;
    /** Whether the technique needs a limb with nothing in it. */
    needsFreeLimb: boolean;
    /**
     * The localization key naming why the technique cannot be performed — one of
     * {@link NO_SUCH_LIMB}, {@link NO_FREE_LIMB} or {@link NO_USABLE_LIMB} —
     * and `""` when it can.
     */
    disabledReason: string;
}

/**
 * Order limbs with the being's dominant side first, each group keeping the
 * body's own part order so the answer is stable.
 *
 * @param parts - The candidate limbs.
 * @param dominant - The being's dominant side, if it has one.
 * @returns The limbs, dominant side first.
 */
function dominantFirst(parts: BodyPart[], dominant: BodySide | undefined): BodyPart[] {
    if (!dominant) return parts;
    const near = parts.filter((p) => bodyPartSide(p) === dominant);
    return [...near, ...parts.filter((p) => !near.includes(p))];
}

/**
 * Resolve which limbs perform a combat technique, and the reason it cannot be
 * performed when the body has none to spare.
 *
 * @param options - The body, the roles the technique uses, how many limbs it
 *   occupies, and the being's dominant side.
 * @returns The performing limbs and the disabled reason (`""` when available).
 */
export function resolvePerformingLimbs(options: PerformingLimbOptions): PerformingLimbs {
    const { structure, roles, dominantSide } = options;
    // A technique occupies at least one limb however its mode is authored: a
    // `minParts` of 0 would otherwise make every technique available on a body
    // with no limbs at all.
    const needed = Math.max(1, Math.floor(options.minParts) || 0);
    const needsFreeLimb = roles.includes(BODY_ROLE.MANIPULATOR);

    const parts: BodyPart[] = [];
    for (const role of roles) {
        for (const part of structure.getPartsByRole(role)) {
            if (!parts.includes(part)) parts.push(part);
        }
    }
    const unavailable = (disabledReason: string): PerformingLimbs => ({
        limbs: [],
        performingLimb: undefined,
        needsFreeLimb,
        disabledReason,
    });
    if (parts.length === 0) return unavailable(NO_SUCH_LIMB);

    let candidates: BodyPart[];
    let shortfallReason: string;
    if (needsFreeLimb) {
        // A limb that cannot grip is not a hand, however the role reads.
        const gripping = parts.filter((p) => p.canHoldItemBase);
        if (gripping.length === 0) return unavailable(NO_SUCH_LIMB);
        candidates = gripping.filter(
            (p) => p.canHoldItem && p.heldItemId == null && !p.immobilized,
        );
        shortfallReason = NO_FREE_LIMB;
    } else {
        candidates = parts.filter((p) => !p.immobilized);
        shortfallReason = NO_USABLE_LIMB;
    }
    if (candidates.length < needed) return unavailable(shortfallReason);

    const limbs = dominantFirst(candidates, dominantSide).slice(0, needed);
    return {
        limbs,
        performingLimb: limbs[0],
        needsFreeLimb,
        disabledReason: "",
    };
}
