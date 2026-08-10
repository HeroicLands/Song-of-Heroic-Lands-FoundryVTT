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
 * Folding the wielder's Strength into their strike modes' impact (#1253).
 *
 * The rule itself is Foundry-free and lives in
 * {@link sohl.entity.strikemode.applyStrengthImpact}; this module is the thin
 * document-layer wiring that gathers what the rule needs — the wielder's
 * Strength, their dominant side, and which limbs grip the weapon — and is
 * called by both carriers of strike modes: a weapon
 * ({@link sohl.document.item.logic.WeaponGearLogic}) and a combat-technique
 * skill ({@link sohl.document.item.logic.SkillLogic}).
 *
 * It runs in the **finalize** phase, not evaluate: it reads the wielder's
 * Strength attribute across documents, and attribute scores are only settled
 * once every sibling item has evaluated — the same cross-item read the
 * governing mastery-level wiring makes.
 */

import type { BodyPart } from "@src/entity/body/BodyPart";
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import {
    applyStrengthImpact,
    isThrownStrikeMode,
} from "@src/entity/strikemode/strengthImpact";
import { isOffHandGrip } from "@src/entity/body/laterality";
import { ATTRIBUTE_CODE, ITEM_KIND, type BodySide } from "@src/utils/constants";

/** The subset of an item's logic this wiring reads. */
interface StrikeModeCarrier {
    /** The strike modes to modify. */
    strikeModes: StrikeModeBase[];
    /** The wielder's logic, when the item is owned. */
    actorLogic?: unknown;
    /** Limbs gripping the item; absent for an intrinsic combat technique. */
    heldBy?: BodyPart[];
}

/**
 * Fold the wielder's Strength Impact Modifier into each of an item's strike
 * modes, along with the off-hand and thrown reductions where they apply.
 *
 * A no-op when the item is unowned or its wielder has no Strength attribute —
 * a Being always has one, but a Structure or Vehicle does not, and guessing a
 * score for them would silently weaken every strike mode they carry.
 *
 * @param logic - The weapon or combat-technique logic whose strike modes are
 *   modified, in place.
 */
export function applyWielderStrengthImpact(logic: StrikeModeCarrier): void {
    const actorLogic = logic.actorLogic as
        | {
              getItemLogic?: (
                  code: string,
                  kind: string,
              ) => { score?: { effective: number } } | undefined;
              dominantSide?: BodySide;
          }
        | undefined;
    if (!actorLogic?.getItemLogic) return;

    const strength = actorLogic.getItemLogic(
        ATTRIBUTE_CODE.STRENGTH,
        ITEM_KIND.ATTRIBUTE,
    )?.score?.effective;
    if (strength == null) return;

    // An intrinsic technique is gripped by nothing, so it is never off-hand:
    // a being punches with whichever hand suits, and the data names no limb.
    const offHand = isOffHandGrip(logic.heldBy ?? [], actorLogic.dominantSide);

    for (const sm of logic.strikeModes) {
        applyStrengthImpact(sm, {
            strength,
            offHand,
            thrown: isThrownStrikeMode(sm),
        });
    }
}
