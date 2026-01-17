/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SohlActor } from "@common/actor/SohlActor";
import type { SkillLogic } from "@common/item/Skill";
import type { SohlItem } from "@common/item/SohlItem";

export class SohlCombatant<
    SubType extends Combatant.SubType = Combatant.SubType,
> extends Combatant<SubType> {
    get actor(): SohlActor | null {
        return this.actor as SohlActor | null;
    }

    /**
     * The default dice formula which should be used for initiative for this combatant.
     * @remark
     * The SOHL system uses a different approach to initiative than the default Foundry VTT system.
     * Initiative is determined by the character's initiative skill, not a random die roll.
     * So, the roll object returned by this method will always evaluate to the actor's initiative skill,
     * a single number, rather than a dice formula.
     *
     * @returns The initiative formula to use for this combatant.
     */
    override _getInitiativeFormula(): string {
        if (this.actor) {
            const init = this.actor.allItemTypes.skill.find(
                (s) => (s.system as any).abbrev === "init",
            ) as unknown as SohlItem<SkillLogic>;
            if (init) {
                return String(init.logic.masteryLevel.effective);
            }
        }
        return "0";
    }
}
