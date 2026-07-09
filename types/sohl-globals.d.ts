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

import type { SohlSystem } from "@src/core/logic/SohlSystem";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
// Document classes
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlCombat } from "@src/document/combat/foundry/SohlCombat";
import type { SohlCombatant } from "@src/document/combatant/foundry/SohlCombatant";
import type { SohlActiveEffect } from "@src/document/effect/foundry/SohlActiveEffect";
// Actor data models
import type { BeingDataModel } from "@src/document/actor/foundry/BeingDataModel";
import type { AssemblyDataModel } from "@src/document/actor/foundry/AssemblyDataModel";
import type { CohortDataModel } from "@src/document/actor/foundry/CohortDataModel";
import type { StructureDataModel } from "@src/document/actor/foundry/StructureDataModel";
import type { VehicleDataModel } from "@src/document/actor/foundry/VehicleDataModel";
// Item data models
import type { AttributeDataModel } from "@src/document/item/foundry/AttributeDataModel";
import type { LineageDataModel } from "@src/document/item/foundry/LineageDataModel";
import type { AffiliationDataModel } from "@src/document/item/foundry/AffiliationDataModel";
import type { AfflictionDataModel } from "@src/document/item/foundry/AfflictionDataModel";
import type { ArmorGearDataModel } from "@src/document/item/foundry/ArmorGearDataModel";
import type { ConcoctionGearDataModel } from "@src/document/item/foundry/ConcoctionGearDataModel";
import type { ContainerGearDataModel } from "@src/document/item/foundry/ContainerGearDataModel";
import type { TraumaDataModel } from "@src/document/item/foundry/TraumaDataModel";
import type { MiscGearDataModel } from "@src/document/item/foundry/MiscGearDataModel";
import type { MysteryDataModel } from "@src/document/item/foundry/MysteryDataModel";
import type { MysticalAbilityDataModel } from "@src/document/item/foundry/MysticalAbilityDataModel";
import type { ProjectileGearDataModel } from "@src/document/item/foundry/ProjectileGearDataModel";
import type { SkillDataModel } from "@src/document/item/foundry/SkillDataModel";
import type { TraitDataModel } from "@src/document/item/foundry/TraitDataModel";
import type { WeaponGearDataModel } from "@src/document/item/foundry/WeaponGearDataModel";
// Combat / combatant / effect data models
import type { SohlCombatDataModel } from "@src/document/combat/foundry/SohlCombat";
import type { SohlCombatantDataModel } from "@src/document/combatant/foundry/SohlCombatant";
import type { SohlActiveEffectDataModel } from "@src/document/effect/foundry/SohlActiveEffectDataModel";

// ✅ Custom utility types
declare global {
    // Common types
    type PlainObject = Record<string, any>;
    type UnknownObject = object;
    type EmptyObject = Record<string, never>;
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
    type Mixin<M, T extends Constructor = Constructor> = (
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
                "defaultBiome.topography": string;
                "defaultBiome.surfaceCover": string;
                "defaultBiome.hydrology": string;
            };
        };
        RegionDocument: {
            sohl: {
                "biome.topography": string;
                "biome.surfaceCover": string;
                "biome.hydrology": string;
            };
        };
    }

    interface SettingConfig {
        "sohl.systemMigrationVersion": string;
        "sohl.logLevel": string;
        "sohl.showWelcomeDialog": boolean;
        "sohl.combatAudio": boolean;
        "sohl.recordTrauma": string;
        "sohl.healingSeconds": number;
        "sohl.optionProjectileTracking": boolean;
        "sohl.useZoneDie": boolean;
        "sohl.optionFate": string;
        "sohl.optionGearDamage": boolean;
        "sohl.biomeSpeedFactors": number[];
        "sohl.trekDistanceUnit": string;
        "sohl.tacticalDistanceUnit": string;
        "sohl.logThreshold": string;
        "sohl.activeCalendar": string;
        "sohl.importedCalendars": Record<string, any>;
        "sohl.domains": Record<string, any>;
        "sohl.expressionHelpers": Record<string, any>;
        "sohl.expressionHelpersPath": string;
    }

    interface DocumentClassConfig {
        Actor: typeof SohlActor;
        Item: typeof SohlItem;
        Combat: typeof SohlCombat;
        Combatant: typeof SohlCombatant;
        ActiveEffect: typeof SohlActiveEffect;
    }

    interface ConfiguredActor<SubType extends Actor.SubType> {
        document: SohlActor;
    }

    interface ConfiguredItem<SubType extends Item.SubType> {
        document: SohlItem;
    }

    interface ConfiguredCombat<SubType extends Combat.SubType> {
        document: SohlCombat;
    }

    interface ConfiguredCombatant<SubType extends Combatant.SubType> {
        document: SohlCombatant<SubType>;
    }

    interface ConfiguredActiveEffect<SubType extends ActiveEffect.SubType> {
        document: SohlActiveEffect;
    }

    interface DataModelConfig {
        // Generics pinned to `any` to break the DataModel -> Logic -> Data ->
        // system -> DataModelConfig instantiation cycle (see the Item note below).
        Actor: {
            being: Constructor<BeingDataModel<any, any>>;
            assembly: Constructor<AssemblyDataModel<any, any>>;
            cohort: Constructor<CohortDataModel<any, any>>;
            structure: Constructor<StructureDataModel<any, any>>;
            vehicle: Constructor<VehicleDataModel<any, any>>;
        };
        // Generics are pinned to `any` here: the concrete DataModel classes
        // carry self-referential `TLogic` defaults (DataModel -> Logic -> Data
        // -> system -> DataModelConfig), which sends fvtt-types into infinite
        // instantiation when it derives per-subtype `system` types. Pinning to
        // `<any, any>` breaks that cycle; per-subtype `system` is typed loosely
        // (as it already was while this file was broken).
        Item: {
            attribute: Constructor<AttributeDataModel<any, any>>;
            lineage: Constructor<LineageDataModel<any, any>>;
            affiliation: Constructor<AffiliationDataModel<any, any>>;
            affliction: Constructor<AfflictionDataModel<any, any>>;
            armorgear: Constructor<ArmorGearDataModel<any, any>>;
            concoctiongear: Constructor<ConcoctionGearDataModel<any, any>>;
            containergear: Constructor<ContainerGearDataModel<any, any>>;
            trauma: Constructor<TraumaDataModel<any, any>>;
            miscgear: Constructor<MiscGearDataModel<any, any>>;
            mystery: Constructor<MysteryDataModel<any, any>>;
            mysticalability: Constructor<MysticalAbilityDataModel<any, any>>;
            projectilegear: Constructor<ProjectileGearDataModel<any, any>>;
            skill: Constructor<SkillDataModel<any, any>>;
            trait: Constructor<TraitDataModel<any, any>>;
            weapongear: Constructor<WeaponGearDataModel<any, any>>;
        };
        Combat: {
            sohlcombatdata: typeof SohlCombatDataModel;
        };
        Combatant: {
            sohlcombatantdata: typeof SohlCombatantDataModel;
        };
        ActiveEffect: {
            sohleffectdata: typeof SohlActiveEffectDataModel;
        };
    }
}

export {};
