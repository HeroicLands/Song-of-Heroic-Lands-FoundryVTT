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

import { SohlSystem } from "@src/core/SohlSystem";
import { LgndCombatModifier } from "@src/modifier/LgndCombatModifier";
import { LgndImpactModifier } from "@src/modifier/LgndImpactModifier";
import { LgndSuccessTestResult } from "@src/result/LgndSuccessTestResult";
import { LgndOpposedTestResult } from "@src/result/LgndOpposedTestResult";
import { LgndCombatResult } from "@src/result/LgndCombatResult";
import {
    ACTOR_KIND,
    ActorKinds,
    defineType,
    ITEM_KIND,
    ItemKinds,
} from "@src/utils/constants";
import {
    SohlActorLogic,
    SohlActorSheetBase,
} from "@src/actor/foundry/SohlActor";
import { SohlItemLogic, SohlItemSheetBase } from "@src/item/foundry/SohlItem";
import { LgndBeingLogic, LgndBeingSheet } from "@src/actor/logic/LgndBeing";
import { AssemblyLogic } from "@src/actor/logic/AssemblyLogic";
import { AssemblySheet } from "@src/actor/foundry/AssemblySheet";
import { CohortLogic } from "@src/actor/logic/CohortLogic";
import { CohortSheet } from "@src/actor/foundry/CohortSheet";
import { StructureLogic } from "@src/actor/logic/StructureLogic";
import { StructureSheet } from "@src/actor/foundry/StructureSheet";
import { VehicleLogic } from "@src/actor/logic/VehicleLogic";
import { VehicleSheet } from "@src/actor/foundry/VehicleSheet";
import {
    LgndWeaponGearLogic,
    LgndWeaponGearSheet,
} from "@src/item/logic/LgndWeaponGear";
import { TraitLogic } from "@src/item/logic/TraitLogic";
import { TraitSheet } from "@src/item/foundry/TraitSheet";
import { ActionLogic } from "@src/item/logic/ActionLogic";
import { ActionSheet } from "@src/item/foundry/ActionSheet";
import { LgndSkillLogic, LgndSkillSheet } from "@src/item/logic/LgndSkill";
import { AffiliationLogic } from "@src/item/logic/AffiliationLogic";
import { AffiliationSheet } from "@src/item/foundry/AffiliationSheet";
import { DispositionLogic } from "@src/item/logic/DispositionLogic";
import { DispositionSheet } from "@src/item/foundry/DispositionSheet";
import {
    LgndProtectionLogic,
    LgndProtectionSheet,
} from "@src/item/logic/LgndProtection";
import { AfflictionLogic } from "@src/item/logic/AfflictionLogic";
import { AfflictionSheet } from "@src/item/foundry/AfflictionSheet";
import {
    LgndArmorGearLogic,
    LgndArmorGearSheet,
} from "@src/item/logic/LgndArmorGear";
import {
    LgndBodyLocationLogic,
    LgndBodyLocationSheet,
} from "@src/item/logic/LgndBodyLocation";
import {
    LgndBodyPartLogic,
    LgndBodyPartSheet,
} from "@src/item/logic/LgndBodyPart";
import {
    LgndBodyZoneLogic,
    LgndBodyZoneSheet,
} from "@src/item/logic/LgndBodyZone";
import {
    LgndCombatTechniqueStrikeModeLogic,
    LgndCombatTechniqueStrikeModeSheet,
} from "@src/item/logic/LgndCombatTechniqueStrikeMode";
import {
    LgndContainerGearLogic,
    LgndContainerGearSheet,
} from "@src/item/logic/LgndContainerGear";
import {
    LgndConcoctionGearLogic,
    LgndConcoctionGearSheet,
} from "@src/item/logic/LgndConcoctionGear";
import { DomainLogic } from "@src/item/logic/DomainLogic";
import { DomainSheet } from "@src/item/foundry/DomainSheet";
import { LgndInjuryLogic, LgndInjurySheet } from "@src/item/logic/LgndInjury";
import {
    LgndMeleeWeaponStrikeModeLogic,
    LgndMeleeWeaponStrikeModeSheet,
} from "@src/item/logic/LgndMeleeWeaponStrikeMode";
import {
    LgndMiscGearLogic,
    LgndMiscGearSheet,
} from "@src/item/logic/LgndMiscGear";
import {
    LgndMissileWeaponStrikeModeLogic,
    LgndMissileWeaponStrikeModeSheet,
} from "@src/item/logic/LgndMissileWeaponStrikeMode";
import { MovementProfileLogic } from "@src/item/logic/MovementProfileLogic";
import { MovementProfileSheet } from "@src/item/foundry/MovementProfileSheet";
import {
    LgndMysteryLogic,
    LgndMysterySheet,
} from "@src/item/logic/LgndMystery";
import {
    LgndMysticalAbilityLogic,
    LgndMysticalAbilitySheet,
} from "@src/item/logic/LgndMysticalAbility";
import {
    LgndMysticalDeviceLogic,
    LgndMysticalDeviceSheet,
} from "@src/item/logic/LgndMysticalDevice";
import { PhilosophyLogic } from "@src/item/logic/PhilosophyLogic";
import { PhilosophySheet } from "@src/item/foundry/PhilosophySheet";
import {
    LgndProjectileGearLogic,
    LgndProjectileGearSheet,
} from "@src/item/logic/LgndProjectileGear";
import { SohlActiveEffectSheet } from "@src/effect/SohlActiveEffect";

export const {
    kind: LGND_ACTOR_LOGIC,
    values: CommonActorLogic,
    isValue: isCommonActorLogic,
    labels: CommonActorLogicLabels,
} = defineType("SOHL.Actor.Logic", {
    [ACTOR_KIND.BEING]: LgndBeingLogic,
    [ACTOR_KIND.ASSEMBLY]: AssemblyLogic,
    [ACTOR_KIND.COHORT]: CohortLogic,
    [ACTOR_KIND.STRUCTURE]: StructureLogic,
    [ACTOR_KIND.VEHICLE]: VehicleLogic,
} as StrictObject<Constructor<SohlActorLogic<any>>>);

export const {
    kind: LGND_ACTOR_SHEETS,
    values: CommonActorSheets,
    isValue: isCommonActorSheet,
    labels: CommonActorSheetLabels,
} = defineType("SOHL.Actor.Sheet", {
    [ACTOR_KIND.BEING]: LgndBeingSheet,
    [ACTOR_KIND.ASSEMBLY]: AssemblySheet,
    [ACTOR_KIND.COHORT]: CohortSheet,
    [ACTOR_KIND.STRUCTURE]: StructureSheet,
    [ACTOR_KIND.VEHICLE]: VehicleSheet,
} as StrictObject<Constructor<SohlActorSheetBase>>);

export const {
    kind: LGND_ITEM_LOGIC,
    values: CommonItemLogic,
    isValue: isCommonItemLogic,
    labels: CommonItemLogicLabels,
} = defineType("TYPES.Item", {
    [ITEM_KIND.ACTION]: ActionLogic,
    [ITEM_KIND.AFFILIATION]: AffiliationLogic,
    [ITEM_KIND.DISPOSITION]: DispositionLogic,
    [ITEM_KIND.AFFLICTION]: AfflictionLogic,
    [ITEM_KIND.ARMORGEAR]: LgndArmorGearLogic,
    [ITEM_KIND.BODYLOCATION]: LgndBodyLocationLogic,
    [ITEM_KIND.BODYPART]: LgndBodyPartLogic,
    [ITEM_KIND.BODYZONE]: LgndBodyZoneLogic,
    [ITEM_KIND.COMBATTECHNIQUESTRIKEMODE]: LgndCombatTechniqueStrikeModeLogic,
    [ITEM_KIND.CONCOCTIONGEAR]: LgndConcoctionGearLogic,
    [ITEM_KIND.CONTAINERGEAR]: LgndContainerGearLogic,
    [ITEM_KIND.DOMAIN]: DomainLogic,
    [ITEM_KIND.INJURY]: LgndInjuryLogic,
    [ITEM_KIND.MELEEWEAPONSTRIKEMODE]: LgndMeleeWeaponStrikeModeLogic,
    [ITEM_KIND.MISCGEAR]: LgndMiscGearLogic,
    [ITEM_KIND.MISSILEWEAPONSTRIKEMODE]: LgndMissileWeaponStrikeModeLogic,
    [ITEM_KIND.MOVEMENTPROFILE]: MovementProfileLogic,
    [ITEM_KIND.MYSTERY]: LgndMysteryLogic,
    [ITEM_KIND.MYSTICALABILITY]: LgndMysticalAbilityLogic,
    [ITEM_KIND.MYSTICALDEVICE]: LgndMysticalDeviceLogic,
    [ITEM_KIND.PHILOSOPHY]: PhilosophyLogic,
    [ITEM_KIND.PROJECTILEGEAR]: LgndProjectileGearLogic,
    [ITEM_KIND.PROTECTION]: LgndProtectionLogic,
    [ITEM_KIND.SKILL]: LgndSkillLogic,
    [ITEM_KIND.TRAIT]: TraitLogic,
    [ITEM_KIND.WEAPONGEAR]: LgndWeaponGearLogic,
} as StrictObject<Constructor<SohlItemLogic<any>>>);

export const {
    kind: LGND_ITEM_SHEETS,
    values: CommonItemSheets,
    isValue: isCommonItemSheet,
    labels: CommonItemSheetLabels,
} = defineType("SOHL.Item.Sheet", {
    [ITEM_KIND.ACTION]: ActionSheet,
    [ITEM_KIND.AFFILIATION]: AffiliationSheet,
    [ITEM_KIND.DISPOSITION]: DispositionSheet,
    [ITEM_KIND.AFFLICTION]: AfflictionSheet,
    [ITEM_KIND.ARMORGEAR]: LgndArmorGearSheet,
    [ITEM_KIND.BODYLOCATION]: LgndBodyLocationSheet,
    [ITEM_KIND.BODYPART]: LgndBodyPartSheet,
    [ITEM_KIND.BODYZONE]: LgndBodyZoneSheet,
    [ITEM_KIND.COMBATTECHNIQUESTRIKEMODE]: LgndCombatTechniqueStrikeModeSheet,
    [ITEM_KIND.CONCOCTIONGEAR]: LgndConcoctionGearSheet,
    [ITEM_KIND.CONTAINERGEAR]: LgndContainerGearSheet,
    [ITEM_KIND.DOMAIN]: DomainSheet,
    [ITEM_KIND.INJURY]: LgndInjurySheet,
    [ITEM_KIND.MELEEWEAPONSTRIKEMODE]: LgndMeleeWeaponStrikeModeSheet,
    [ITEM_KIND.MISCGEAR]: LgndMiscGearSheet,
    [ITEM_KIND.MISSILEWEAPONSTRIKEMODE]: LgndMissileWeaponStrikeModeSheet,
    [ITEM_KIND.MOVEMENTPROFILE]: MovementProfileSheet,
    [ITEM_KIND.MYSTERY]: LgndMysterySheet,
    [ITEM_KIND.MYSTICALABILITY]: LgndMysticalAbilitySheet,
    [ITEM_KIND.MYSTICALDEVICE]: LgndMysticalDeviceSheet,
    [ITEM_KIND.PHILOSOPHY]: PhilosophySheet,
    [ITEM_KIND.PROJECTILEGEAR]: LgndProjectileGearSheet,
    [ITEM_KIND.PROTECTION]: LgndProtectionSheet,
    [ITEM_KIND.SKILL]: LgndSkillSheet,
    [ITEM_KIND.TRAIT]: TraitSheet,
    [ITEM_KIND.WEAPONGEAR]: LgndWeaponGearSheet,
} as StrictObject<Constructor<SohlItemSheetBase>>);

export class LegendarySystem extends SohlSystem {
    static override get CONFIG(): SohlSystem.Config {
        return foundry.utils.mergeObject(
            SohlSystem.CONFIG,
            {
                Actor: {
                    documentSheets: ActorKinds.map((kind) => {
                        return {
                            cls: LGND_ACTOR_SHEETS[kind],
                            types: [kind],
                        };
                    }),
                },
                Item: {
                    documentSheets: ItemKinds.map((kind) => {
                        return { cls: LGND_ITEM_SHEETS[kind], types: [kind] };
                    }),
                },
                CombatModifier: LgndCombatModifier,
                ImpactModifier: LgndImpactModifier,
                SuccessTestResult: LgndSuccessTestResult,
                OpposedTestResult: LgndOpposedTestResult,
                CombatResult: LgndCombatResult,
            },
            { inplace: false },
        ) as unknown as SohlSystem.Config;
    }

    static override readonly ID: string = "legendary";
    static override readonly TITLE: string = "Legendary";
    static override readonly INIT_MESSAGE: string = ` _                               _
| |                             | |
| |     ___  __ _  ___ _ __   __| | __ _ _ __ _   _
| |    / _ \\/ _\` |/ _ \\ '_ \\ / _\` |/ _\` | '__| | | |
| |___|  __/ (_| |  __/ | | | (_| | (_| | |  | |_| |
\\_____/\\___|\\__, |\\___|_| |_|\\__,_|\\__,_|_|   \\__, |
             __/ |                             __/ |
            |___/                             |___/
===========================================================`;

    private static _instance: LegendarySystem | null = null;

    static getInstance(): LegendarySystem {
        if (!this._instance) {
            this._instance = new LegendarySystem();
        }
        return this._instance;
    }

    override setupSheets(): void {
        ActorKinds.forEach((kind) => {
            foundry.applications.apps.DocumentSheetConfig.registerSheet(
                CONFIG.Actor.documentClass,
                "sohl",
                LGND_ACTOR_SHEETS[kind] as any,
                {
                    types: [kind],
                    makeDefault: true,
                },
            );
        });
        ItemKinds.forEach((kind) => {
            foundry.applications.apps.DocumentSheetConfig.registerSheet(
                CONFIG.Item.documentClass,
                "sohl",
                LGND_ITEM_SHEETS[kind] as any,
                {
                    types: [kind],
                    makeDefault: true,
                },
            );
        });
        foundry.applications.apps.DocumentSheetConfig.registerSheet(
            CONFIG.ActiveEffect.documentClass,
            "sohl",
            SohlActiveEffectSheet,
            {
                makeDefault: true,
            },
        );
    }
}
