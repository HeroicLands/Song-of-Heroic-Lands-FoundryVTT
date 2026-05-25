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

import { GroupStance } from "@src/utils/constants";
import {
    getGroupStancesForGroup,
    allyGroups as allyGroupsLogic,
    enemyGroups as enemyGroupsLogic,
    withGroupStanceSet,
    withGroupRemoved,
} from "./combat-logic";

export class SohlCombat<
    SubType extends Combat.SubType = Combat.SubType,
> extends Combat<SubType> {
    getGroupStances(group: string): StrictObject<GroupStance> {
        const combatData = this.system as SohlCombatDataModel;
        return getGroupStancesForGroup(combatData.groupStances, group);
    }

    async setGroupStance(
        group: string,
        targetGroup: string,
        stance: GroupStance,
    ) {
        const combatData = this.system as SohlCombatDataModel;
        const groupStances = withGroupStanceSet(
            combatData.groupStances,
            group,
            targetGroup,
            stance,
        );
        return await this.update({ system: { groupStances } } as Combat.UpdateData);
    }

    async removeGroup(group: string): Promise<void> {
        const combatData = this.system as SohlCombatDataModel;
        const groupStances = withGroupRemoved(combatData.groupStances, group);
        await this.update({ system: { groupStances } } as Combat.UpdateData);
    }

    allyGroups(group: string): string[] {
        const combatData = this.system as SohlCombatDataModel;
        return allyGroupsLogic(combatData.groupStances, group);
    }

    enemyGroups(group: string): string[] {
        const combatData = this.system as SohlCombatDataModel;
        return enemyGroupsLogic(combatData.groupStances, group);
    }
}

function defineSohlCombatDataSchema(): foundry.data.fields.DataSchema {
    return {
        groupStances: new foundry.data.fields.ObjectField({
            required: false,
            default: {},
        }),
    };
}

type SohlCombatDataSchema = ReturnType<typeof defineSohlCombatDataSchema>;

export class SohlCombatDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlCombatDataSchema,
> extends foundry.abstract.TypeDataModel<TSchema, SohlCombat> {
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Combat"];
    static readonly kind = "sohlcombatdata";

    groupStances!: StrictObject<StrictObject<GroupStance>>;
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineSohlCombatDataSchema();
    }
}
