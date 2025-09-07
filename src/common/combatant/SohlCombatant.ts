/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ClientDocumentExtendedMixin } from "@utils/helpers";

const FLAG_ALLIES = "allyIds";
const FLAG_INIT_ALLIES = "initAllyIds";
const FLAG_THREATENED = "threatenedIds";

export class SohlCombatant extends ClientDocumentExtendedMixin(
    Combatant,
    {} as InstanceType<typeof foundry.documents.BaseCombatant>,
) {
    declare getFlag: (scope: string, key: string) => any;
    declare setFlag: (scope: string, key: string, value: any) => Promise<this>;

    /**
     * Pre-create hook for the combatant setting initial values.
     * @remark
     * The initial values include:
     * - flags.sohl.allyIds: An array of combatants which are considered allies of this combatant.
     * - flags.sohl.initAllyIds: An array of combatants which are the initial allies of this combatant. Write-once only.
     * - flags.sohl.threatenedIds: An array of combatants that are currently threatened by this combatant. The rules
     *                             determining whether an opponent is threatened are specific to each variation. This is
     *                             useful for various combat mechanics, such as determining if a combatant is outnumbered or
     *                             can be attacked in melee.
     *
     * @param createData data used to create the combatant
     * @param options options for the creation process
     * @param user the user creating the combatant
     * @returns a promise that resolves to a boolean indicating if the creation is allowed
     */
    async _preCreate(
        createData: PlainObject,
        options: PlainObject,
        user: User,
    ): Promise<boolean | void> {
        let allowed: boolean | void = await super._preCreate(
            createData,
            options,
            user,
        );
        if (allowed === false) return false;
        this.updateSource({
            flags: {
                sohl: {
                    [FLAG_ALLIES]: [],
                    [FLAG_INIT_ALLIES]: null,
                    [FLAG_THREATENED]: [],
                },
            },
        });
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
    _getInitiativeFormula() {
        return String(this.actor?.logic.initiative || 0);
    }

    get allyIds(): string[] {
        const result = this.getFlag("sohl", FLAG_ALLIES) || [];
        if (!Array.isArray(result)) return [];
        return result.map((id: any) => String(id));
    }

    get initAllyIds(): string[] | null {
        const result = this.getFlag("sohl", FLAG_INIT_ALLIES) || [];
        if (!Array.isArray(result)) return null;
        return result.map((id: any) => String(id));
    }

    get threatenedIds(): string[] {
        const result = this.getFlag("sohl", FLAG_THREATENED) || [];
        if (!Array.isArray(result)) return [];
        return result.map((id: any) => {
            const stringId = String(id);
            const combatant = (game as any).combat?.combatants.get(stringId);
            if (combatant && !combatant.isDefeated) {
                return combatant;
            }
            return null;
        });
    }

    get threatened(): SohlCombatant[] {
        if (!this.token || this.isDefeated) return [];
        const threatenedList = this.threatenedIds;
        return threatenedList
            .map((id: string) => {
                const combatant = (game as any).combat?.combatants.get(id);
                if (combatant) {
                    return combatant;
                }
                return null;
            })
            .filter(Boolean) as SohlCombatant[];
    }

    async addThreatened(...combatants: SohlCombatant[]) {
        const threatenedIds = this.threatenedIds;
        let allyIds = this.allyIds;
        for (const combatant of combatants) {
            if (!combatant || combatant.isDefeated) continue;
            if (!threatenedIds.includes(combatant.id || "")) {
                threatenedIds.push(combatant.id || "");
            }
            // Remove the threatened combatant from the ally list if it is present,
            // because a threatened combatant cannot be an ally.
            if (allyIds.includes(combatant.id || "")) {
                allyIds = allyIds.filter((id) => id !== combatant.id);
            }
        }
        await this.setFlag("sohl", FLAG_THREATENED, threatenedIds);
        await this.setFlag("sohl", FLAG_ALLIES, allyIds);
    }

    async removeThreatened(combatant: SohlCombatant) {
        if (!combatant) return;
        const threatenedIds = this.threatenedIds;
        if (threatenedIds.includes(combatant.id || "")) {
            const newThreatenedIds = threatenedIds.filter(
                (id) => id !== combatant.id,
            );
            await this.setFlag("sohl", FLAG_THREATENED, newThreatenedIds);
        }
    }

    get threatenedBy(): SohlCombatant[] {
        return (game as any).combat?.combatants.reduce(
            (acc: SohlCombatant[], combatant: SohlCombatant) => {
                if (combatant.threatenedIds.includes(this.id || "")) {
                    acc.push(combatant);
                }
                return acc;
            },
            [],
        );
    }

    get allies(): SohlCombatant[] {
        if (!this.token || this.isDefeated) return [];
        const allyList = this.allyIds;
        return allyList
            .map((id: string) => {
                const combatant = (game as any).combat?.combatants.get(id);
                if (combatant) {
                    return combatant;
                }
                return null;
            })
            .filter(Boolean) as SohlCombatant[];
    }

    async addAlly(...combatants: SohlCombatant[]) {
        const allyIds = this.allyIds;
        for (const combatant of combatants) {
            if (combatant.isDefeated) continue;
            if (!allyIds.includes(combatant.id || "")) {
                allyIds.push(combatant.id || "");
            }
        }
        await this.setFlag("sohl", FLAG_ALLIES, allyIds);
        if (!this.initAllyIds) {
            // If the initial ally list is empty, then set it
            await this.setFlag("sohl", FLAG_INIT_ALLIES, allyIds);
        }
    }

    async removeAlly(combatant: SohlCombatant) {
        if (!combatant) return;
        const allyIds = this.allyIds;
        if (allyIds.includes(combatant.id || "")) {
            const newAllyIds = allyIds.filter((id) => id !== combatant.id);
            await this.setFlag("sohl", FLAG_INIT_ALLIES, newAllyIds);
        }
    }
}
