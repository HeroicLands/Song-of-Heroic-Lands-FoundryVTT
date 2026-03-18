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
} from "@src/document/actor/foundry/SohlActor";
import {
    SohlItemLogic,
    SohlItemSheetBase,
} from "@src/document/item/foundry/SohlItem";
import {
    LgndBeingLogic,
    LgndBeingSheet,
} from "@src/document/actor/logic/LgndBeing";
import { AssemblyLogic } from "@src/document/actor/logic/AssemblyLogic";
import { AssemblySheet } from "@src/document/actor/foundry/AssemblySheet";
import { CohortLogic } from "@src/document/actor/logic/CohortLogic";
import { CohortSheet } from "@src/document/actor/foundry/CohortSheet";
import { StructureLogic } from "@src/document/actor/logic/StructureLogic";
import { StructureSheet } from "@src/document/actor/foundry/StructureSheet";
import { VehicleLogic } from "@src/document/actor/logic/VehicleLogic";
import { VehicleSheet } from "@src/document/actor/foundry/VehicleSheet";
import {
    LgndWeaponGearLogic,
    LgndWeaponGearSheet,
} from "@src/document/item/logic/LgndWeaponGear";
import { TraitLogic } from "@src/document/item/logic/TraitLogic";
import { TraitSheet } from "@src/document/item/foundry/TraitSheet";
import { ActionLogic } from "@src/document/item/logic/ActionLogic";
import { ActionSheet } from "@src/document/item/foundry/ActionSheet";
import {
    LgndSkillLogic,
    LgndSkillSheet,
} from "@src/document/item/logic/LgndSkill";
import { AffiliationLogic } from "@src/document/item/logic/AffiliationLogic";
import { AffiliationSheet } from "@src/document/item/foundry/AffiliationSheet";
import { DispositionLogic } from "@src/document/item/logic/DispositionLogic";
import { DispositionSheet } from "@src/document/item/foundry/DispositionSheet";
import {
    LgndProtectionLogic,
    LgndProtectionSheet,
} from "@src/document/item/logic/LgndProtection";
import { AfflictionLogic } from "@src/document/item/logic/AfflictionLogic";
import { AfflictionSheet } from "@src/document/item/foundry/AfflictionSheet";
import {
    LgndArmorGearLogic,
    LgndArmorGearSheet,
} from "@src/document/item/logic/LgndArmorGear";
import {
    LgndBodyLocationLogic,
    LgndBodyLocationSheet,
} from "@src/document/item/logic/LgndBodyLocation";
import {
    LgndBodyPartLogic,
    LgndBodyPartSheet,
} from "@src/document/item/logic/LgndBodyPart";
import {
    LgndBodyZoneLogic,
    LgndBodyZoneSheet,
} from "@src/document/item/logic/LgndBodyZone";
import {
    LgndCombatTechniqueStrikeModeLogic,
    LgndCombatTechniqueStrikeModeSheet,
} from "@src/document/item/logic/LgndCombatTechniqueStrikeMode";
import {
    LgndContainerGearLogic,
    LgndContainerGearSheet,
} from "@src/document/item/logic/LgndContainerGear";
import {
    LgndConcoctionGearLogic,
    LgndConcoctionGearSheet,
} from "@src/document/item/logic/LgndConcoctionGear";
import { DomainLogic } from "@src/document/item/logic/DomainLogic";
import { DomainSheet } from "@src/document/item/foundry/DomainSheet";
import {
    LgndInjuryLogic,
    LgndInjurySheet,
} from "@src/document/item/logic/LgndInjury";
import {
    LgndMeleeWeaponStrikeModeLogic,
    LgndMeleeWeaponStrikeModeSheet,
} from "@src/document/item/logic/LgndMeleeWeaponStrikeMode";
import {
    LgndMiscGearLogic,
    LgndMiscGearSheet,
} from "@src/document/item/logic/LgndMiscGear";
import {
    LgndMissileWeaponStrikeModeLogic,
    LgndMissileWeaponStrikeModeSheet,
} from "@src/document/item/logic/LgndMissileWeaponStrikeMode";
import { MovementProfileLogic } from "@src/document/item/logic/MovementProfileLogic";
import { MovementProfileSheet } from "@src/document/item/foundry/MovementProfileSheet";
import {
    LgndMysteryLogic,
    LgndMysterySheet,
} from "@src/document/item/logic/LgndMystery";
import {
    LgndMysticalAbilityLogic,
    LgndMysticalAbilitySheet,
} from "@src/document/item/logic/LgndMysticalAbility";
import {
    LgndMysticalDeviceLogic,
    LgndMysticalDeviceSheet,
} from "@src/document/item/logic/LgndMysticalDevice";
import { PhilosophyLogic } from "@src/document/item/logic/PhilosophyLogic";
import { PhilosophySheet } from "@src/document/item/foundry/PhilosophySheet";
import {
    LgndProjectileGearLogic,
    LgndProjectileGearSheet,
} from "@src/document/item/logic/LgndProjectileGear";
import { SohlActiveEffectSheet } from "@src/document/effect/SohlActiveEffect";

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
