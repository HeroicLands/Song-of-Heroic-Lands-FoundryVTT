import type { SohlSystem, SohlBase, SohlBaseConstructor } from "@common";
import type {
    SohlMap,
    SohlClassRegistry,
    SohlLogger,
    SohlLocalize,
    SohlMersenneTwister,
} from "@utils/helpers";
import type { SohlTokenDocument } from "@common/document/SohlTokenDocument";
import type { SohlActiveEffect } from "@common/effect/SohlActiveEffect";
import type { SohlActor } from "@common/actor/SohlActor";
import type { Entity } from "@common/actor/Entity";
import type { Assembly } from "@common/actor/Assembly";
import type { SohlCombatant } from "@common/combat/SohlCombatant";
import type { SohlCombatantData } from "@common/combatant/SohlCombatantData";
import type { SohlItem } from "@common/item/SohlItem";
import type { AffiliationLogic } from "@common/item/Affiliation";
import type { AfflictionLogic } from "@common/item/Affliction";
import type { ArmorGear } from "@common/item/ArmorGear";
import type { BodyLocationLogic } from "@common/item/BodyLocation";
import type { BodyPartLogic } from "@common/item/BodyPart";
import type { BodyZone } from "@common/item/BodyZone";
import type { CombatTechniqueStrikeMode } from "@common/item/CombatTechniqueStrikeMode";
import type { ConcoctionGearLogic } from "@common/item/ConcoctionGear";
import type { ContainerGearLogic } from "@common/item/ContainerGear";
import type { DomainLogic } from "@common/item/Domain";
import type { InjuryLogic } from "@common/item/Injury";
import type { MeleeWeaponStrikeModeLogic } from "@common/item/MeleeWeaponStrikeMode";
import type { MiscGearLogic } from "@common/item/MiscGear";
import type { MissileWeaponStrikeModeLogic } from "@common/item/MissileWeaponStrikeMode";
import type { MysteryLogic } from "@common/item/Mystery";
import type { MysticalAbilityLogic } from "@common/item/MysticalAbility";
import type { MysticalDeviceLogic } from "@common/item/MysticalDevice";
import type { PhilosophyLogic } from "@common/item/Philosophy";
import type { ProjectileGearLogic } from "@common/item/ProjectileGear";
import type { ProtectionLogic } from "@common/item/Protection";
import type { SkillLogic } from "@common/item/Skill";
import type { TraitLogic } from "@common/item/Trait";
import type { WeaponGearLogic } from "@common/item/WeaponGear";

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
    interface SystemNameConfig {
        name: "sohl";
    }

    interface SystemConfig {}

    interface FlagConfig {
        Item: {
            sohl: Record<string, unknown>;
        };
    }

    interface SettingConfig {
        "sohl.systemMigrationVersion": string;
        "sohl.variant": string;
        "sohl.logLevel": string;
        "sohl.showWelcomeDialog": boolean;
        "sohl.showAssemblies": boolean;
        "sohl.combatAudio": boolean;
        "sohl.recordTrauma": string;
        "sohl.healingSeconds": number;
        "sohl.optionProjectileTracking": boolean;
        "sohl.optionFate": string;
        "sohl.optionGearDamage": boolean;
        "sohl.biomeSpeedFactors": number[];
        "sohl.logThreshold": string;
    }

    interface DocumentClassConfig {
        Actor: typeof SohlActor;
        Item: typeof SohlItem;
        Combatant: typeof SohlCombatant;
        ActiveEffect: typeof SohlActiveEffect;
    }

    interface ConfiguredActor<SubType extends Actor.SubType> {
        Actor: SohlActor<SohlActorLogic, any, SubType>;
    }

    interface ConfiguredItem<SubType extends Item.SubType> {
        Item: SohlItem<SohlItemLogic, any, SubType>;
    }

    interface ConfiguredCombatant<SubType extends Combatant.SubType> {
        Combatant: SohlCombatant<SubType>;
    }

    interface ConfiguredActiveEffect<SubType extends ActiveEffect.SubType> {
        Effect: SohlActiveEffect<SubType>;
    }

    interface DataModelConfig {
        Actor: {
            entity: typeof Entity.DataModel;
            assembly: typeof Assembly.DataModel;
        };
        Item: {
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
        Combatant: {
            combatantdata: typeof SohlCombatantData.DataModel;
        };
        ActiveEffect: {
            sohleffectdata: typeof SohlEffectData.DataModel;
        };
    }
}

export {};
