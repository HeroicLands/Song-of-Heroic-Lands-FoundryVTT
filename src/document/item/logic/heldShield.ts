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
 * Folding a held shield's Shield Mod into its wielder's defences.
 *
 * The rule itself is Foundry-free and lives in
 * {@link sohl.entity.strikemode.applyShieldDefenseBonus}; this module is the
 * document-layer wiring that finds the shields a wielder actually has in hand
 * and hands the bonus to each beneficiary the rule names — every Block, the
 * wielder's Dodge, and a Press.
 *
 * It runs in the **finalize** phase: the bonus is a *cross-item* read, since the
 * shield granting it is a different document from the weapon blocking with it,
 * and a sibling item's grip is only settled once every item has evaluated. That
 * is the same phase and the same kind of read as the governing mastery level and
 * the wielder's Strength Impact Modifier.
 */

import { applyShieldDefenseBonus, bestShieldMod } from "@src/entity/strikemode/shieldDefense";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import type { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import type { CombatModifier } from "@src/entity/modifier/CombatModifier";
import { ITEM_KIND, SKILL_CODE } from "@src/utils/constants";

/** Shortcode of the Press combat technique, whose attack a shield assists. */
export const PRESS_TECHNIQUE_CODE = "press";

/** The subset of an owning actor's logic this wiring reads. */
interface ShieldBearer {
    /** Item logics grouped by kind; absent on an actor kind with no items. */
    logicTypes?: Record<string, unknown[]>;
}

/** The subset of an item's logic this wiring reads. */
interface ShieldBeneficiary {
    /** The strike modes to adjust. */
    strikeModes: StrikeModeBase[];
    /** The wielder's logic, when the item is owned. */
    actorLogic?: unknown;
    /** This item's persisted data, read for the shortcode that names Dodge or Press. */
    data?: { shortcode?: string };
    /** A skill's own mastery level, which is what a Dodge defence rolls. */
    masteryLevel?: CombatModifier;
}

/**
 * The best Shield Mod among the shields a wielder is **holding**.
 *
 * A stowed or slung shield grants nothing, so a weapon contributes only while
 * at least one limb grips it.
 *
 * @param actorLogic - The wielder's logic, or `undefined` for an unowned item.
 * @returns The highest held Shield Mod, or `0` when none is in hand.
 */
export function heldShieldMod(actorLogic: unknown): number {
    const logicTypes = (actorLogic as ShieldBearer | undefined)?.logicTypes;
    const weapons = logicTypes?.[ITEM_KIND.WEAPONGEAR];
    if (!weapons) return 0;
    const held: StrikeModeBase[] = [];
    for (const weapon of weapons as Array<{
        heldBy?: unknown[];
        strikeModes?: StrikeModeBase[];
    }>) {
        if (!weapon.heldBy?.length) continue;
        held.push(...(weapon.strikeModes ?? []));
    }
    return bestShieldMod(held);
}

/**
 * Fold the wielder's best held Shield Mod into an item's defences.
 *
 * Applies to every melee strike mode's **Block** — a shield on one arm assists a
 * block made with the sword in the other — and, where the item is the wielder's
 * **Dodge** skill or the **Press** technique, to the roll that defence or
 * manoeuvre makes.
 *
 * A no-op when the item is unowned or the wielder holds no shield, and safe to
 * run again in a repeated lifecycle phase: each contribution is restated rather
 * than stacked.
 *
 * @param logic - The weapon or skill logic whose rolls are adjusted, in place.
 */
export function applyHeldShieldDefense(logic: ShieldBeneficiary): void {
    if (!logic.actorLogic) return;
    const value = heldShieldMod(logic.actorLogic);

    // Every block benefits, whatever is in the blocking hand.
    for (const sm of logic.strikeModes) {
        if (sm instanceof MeleeStrikeMode) applyShieldDefenseBonus(sm.defense.block, value);
    }

    const shortcode = logic.data?.shortcode;
    // Dodge is the wielder's own skill and belongs to no weapon, so the bonus
    // reaches it through the mastery level a dodge defence rolls.
    if (shortcode === SKILL_CODE.DODGE && logic.masteryLevel) {
        applyShieldDefenseBonus(logic.masteryLevel, value);
    }
    // A Press is a manoeuvre, not a strike, so the bonus lands on its attack.
    if (shortcode === PRESS_TECHNIQUE_CODE) {
        for (const sm of logic.strikeModes) applyShieldDefenseBonus(sm.attack, value);
    }
}
