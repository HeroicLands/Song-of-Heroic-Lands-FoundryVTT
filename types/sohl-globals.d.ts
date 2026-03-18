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

import type { SohlSystem } from "@src/common";
import type { GroupStance } from "@src/utils/constants";
import type {
    SohlMap,
    SohlLogger,
    SohlLocalize,
    SohlMersenneTwister,
} from "@src/utils/helpers";
import type { SohlTokenDocument } from "@src/common/document/SohlTokenDocument";
import type { SohlActiveEffect } from "@src/common/effect/SohlActiveEffect";
import type { SohlActor } from "@src/common/actor/SohlActor";
import type {
    SohlCombat,
    CombatDataModel,
} from "@src/common/combat/SohlCombat";
import type { Being } from "@src/common/actor/Being";
import type { Assembly } from "@src/common/actor/Assembly";
import type { SohlCombatant } from "@src/common/combat/SohlCombatant";
import type { SohlCombatantData } from "@src/common/combatant/SohlCombatantData";
import type { SohlItem } from "@src/common/item/SohlItem";
import type { AffiliationLogic } from "@src/common/item/Affiliation";
import type { AfflictionLogic } from "@src/common/item/Affliction";
import type { ArmorGear } from "@src/common/item/ArmorGear";
import type { BodyLocationLogic } from "@src/common/item/BodyLocation";
import type { BodyPartLogic } from "@src/common/item/BodyPart";
import type { BodyZone } from "@src/common/item/BodyZone";
import type { CombatTechniqueStrikeMode } from "@src/common/item/CombatTechniqueStrikeMode";
import type { ConcoctionGearLogic } from "@src/common/item/ConcoctionGear";
import type { ContainerGearLogic } from "@src/common/item/ContainerGear";
import type { DomainLogic } from "@src/common/item/Domain";
import type { InjuryLogic } from "@src/common/item/Injury";
import type { MeleeWeaponStrikeModeLogic } from "@src/common/item/MeleeWeaponStrikeMode";
import type { MiscGearLogic } from "@src/common/item/MiscGear";
import type { MissileWeaponStrikeModeLogic } from "@src/common/item/MissileWeaponStrikeMode";
import type { MysteryLogic } from "@src/common/item/Mystery";
import type { MysticalAbilityLogic } from "@src/common/item/MysticalAbility";
import type { MysticalDeviceLogic } from "@src/common/item/MysticalDevice";
import type { PhilosophyLogic } from "@src/common/item/Philosophy";
import type { ProjectileGearLogic } from "@src/common/item/ProjectileGear";
import type { ProtectionLogic } from "@src/common/item/Protection";
import type { SkillLogic } from "@src/common/item/Skill";
import type { TraitLogic } from "@src/common/item/Trait";
import type { WeaponGearLogic } from "@src/common/item/WeaponGear";
import type { SohlLogic } from "@src/common/core/SohlLogic";
import type { SohlActionContext } from "@src/common/core/SohlActionContext";

// ✅ Custom utility types
declare global {
    // Common types
    type PlainObject = Record<string, any>;
    type UnknownObject = Record<string, unknown>;
    type EmptyObject = Record<string, never>;
    type AnyObject = object;
    type StrictObject<T> = Record<string, T>;
    type AnyFunction = (...args: any[]) => any;
    type AsyncFunction<Args extends any[] = any[], Return = any> = (
        ...args: Args
    ) => Promise<Return>;
    type MaybePromise<T> = T | Promise<T>;
    type WithStatics<T extends abstract new (...args: any) => any, S> = T & S;

    /** May be missing or intentionally cleared */
    type Maybe<T> = T | null | undefined;

    /** Recursively makes all properties optional */
    type DeepPartial<T> =
        T extends object ?
            T extends (
                | any[]
                | ((...args: any[]) => any)
                | (new (...args: any[]) => any)
            ) ?
                T
            :   { [K in keyof T]?: DeepPartial<T[K]> }
        :   T;

    /** Optional field */
    type Optional<T> = T | undefined;
    type OptArray<T> = T[] | undefined;

    /** A constructed object (non-plain) */
    type ConstructedObject = object & {
        constructor: {
            name: Exclude<string, "Object">;
        };
    };

    type Func<Return = any, Args extends any[] = any[]> = (
        ...args: Args
    ) => Return;
    type Constructor<
        TInstance extends object = object,
        P extends any[] = any[],
    > = new (...args: P) => TInstance;
    type AbstractConstructor<
        TInstance extends object = object,
        P extends any[] = any[],
    > = abstract new (...args: P) => TInstance;
    type AnyConstructor<
        TInstance extends object = object,
        P extends any[] = any[],
    > = Constructor<TInstance, P> | AbstractConstructor<TInstance, P>;
    type ConstructorOrFunction = Constructor | AnyFunction;
    type Mixin<M, T extends Constructor = AnyConstructor> = (
        Base: T,
    ) => new (...args: ConstructorParameters<T>) => InstanceType<T> & M;

    // ✅ JSON-safe types
    type JsonValue =
        | string
        | number
        | boolean
        | null
        | { [key: string]: JsonValue }
        | JsonValue[];

    // ✅ Base Logic Compatibility
    type LogicCompatibleDataModel = {
        parent: {
            update: (data: any) => unknown;
        };
    };

    type SohlDocument = SohlActor | SohlItem | SohlActiveEffect | SohlCombatant;

    type DocumentId = string & { __brand: "DocId" };

    type BaseLogicOptions<TDataModel> = {
        parent?: TDataModel;
    };

    // SoHL Calendar structure
    interface WorldDate {
        era: "TR" | "BT";
        year: number; // always positive (1, 2, 3, ...)
        month: number; // 1–12
        day: number; // 1–30
        dayOfYear: number; // 1–360
        weekday: number; // 1–10 (or 0–9 if you prefer; I’ll use 0-based in code and convert)
        moonPhase: {
            dayInCycle: number; // 0–29, where 0 = full moon
            isFull: boolean;
        };
        // Optional: time of day in world units
        timeOfDay?: {
            seconds: number;
            hours: number;
            minutes: number;
            secondsRemainder: number;
        };
    }

    // ✅ Global system accessor
    var sohl: SohlSystem;
}

declare module "fvtt-types/configuration" {
    namespace Hooks {
        interface HookConfig {
            "SOHL.postFinalize": (
                item: SohlItem,
                context?: SohlActionContext,
            ) => void;
        }
    }

    interface SystemNameConfig {
        name: "sohl";
    }

    interface SystemConfig {}

    interface FlagConfig {
        Item: {
            sohl: Record<string, unknown>;
        };
        Scene: {
            sohl: {
                "defaultBiome.terrain": string;
                "defaultBiome.vegetation": string;
                "defaultBiome.slope": string;
                "defaultBiome.hydrology": string;
            };
        };
        RegionDocument: {
            sohl: {
                "biome.terrain": string;
                "biome.vegetation": string;
                "biome.slope": string;
                "biome.hydrology": string;
            };
        };
    }

    interface SettingConfig {
        "sohl.systemMigrationVersion": string;
        "sohl.variant": string;
        "sohl.logLevel": string;
        "sohl.showWelcomeDialog": boolean;
        "sohl.combatAudio": boolean;
        "sohl.recordTrauma": string;
        "sohl.healingSeconds": number;
        "sohl.optionProjectileTracking": boolean;
        "sohl.optionFate": string;
        "sohl.optionGearDamage": boolean;
        "sohl.biomeSpeedFactors": number[];
        "sohl.trekDistanceUnit": string;
        "sohl.tacticalDistanceUnit": string;
        "sohl.logThreshold": string;
        "sohl.activeCalendar": string;
        "sohl.importedCalendars": Record<string, any>;
    }

    interface DocumentClassConfig {
        Actor: typeof SohlActor;
        Item: typeof SohlItem;
        Combat: typeof SohlCombat;
        Combatant: typeof SohlCombatant;
        ActiveEffect: typeof SohlActiveEffect;
    }

    interface ConfiguredActor<SubType extends Actor.SubType> {
        document: SohlActor<SohlActorLogic, any, SubType>;
    }

    interface ConfiguredItem<SubType extends Item.SubType> {
        document: SohlItem<SohlItemLogic, any, SubType>;
    }

    interface ConfiguredCombat<SubType extends Combat.SubType> {
        document: SohlCombat;
    }

    interface ConfiguredCombatant<SubType extends Combatant.SubType> {
        document: SohlCombatant<SubType>;
    }

    interface ConfiguredActiveEffect<SubType extends ActiveEffect.SubType> {
        document: SohlActiveEffect<SubType>;
    }

    interface DataModelConfig {
        Actor: {
            being: typeof Being.DataModel;
            assembly: typeof Assembly.DataModel;
            cohort: typeof Cohort.DataModel;
            structure: typeof Structure.DataModel;
            vehicle: typeof Vehicle.DataModel;
        };
        Item: {
            action: typeof ActionLogic.DataModel;
            affiliation: typeof AffiliationLogic.DataModel;
            affliction: typeof AfflictionLogic.DataModel;
            armorgear: typeof ArmorGear.DataModel;
            bodylocation: typeof BodyLocationLogic.DataModel;
            bodypart: typeof BodyPartLogic.DataModel;
            bodyzone: typeof BodyZone.DataModel;
            combattechniquestrikemode: typeof CombatTechniqueStrikeMode.DataModel;
            concoctiongear: typeof ConcoctionGearLogic.DataModel;
            containergear: typeof ContainerGearLogic.DataModel;
            domain: typeof DomainLogic.DataModel;
            injury: typeof InjuryLogic.DataModel;
            meleeweaponstrikemode: typeof MeleeWeaponStrikeModeLogic.DataModel;
            miscgear: typeof MiscGearLogic.DataModel;
            missileweaponstrikemode: typeof MissileWeaponStrikeModeLogic.DataModel;
            mystery: typeof MysteryLogic.DataModel;
            mysticalability: typeof MysticalAbilityLogic.DataModel;
            mysticaldevice: typeof MysticalDeviceLogic.DataModel;
            philosophy: typeof PhilosophyLogic.DataModel;
            projectilegear: typeof ProjectileGearLogic.DataModel;
            protection: typeof ProtectionLogic.DataModel;
            skill: typeof SkillLogic.DataModel;
            trait: typeof TraitLogic.DataModel;
            weapongear: typeof WeaponGearLogic.DataModel;
        };
        Combat: {
            sohlcombatdata: typeof SohlCombatDataModel;
        };
        Combatant: {
            sohlcombatantdata: typeof SohlCombatantDataModel;
        };
        ActiveEffect: {
            sohleffectdata: typeof SohlEffectData.DataModel;
        };
    }
}

export {};
