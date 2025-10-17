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
import type { Affiliation } from "@common/item/Affiliation";
import type { Affliction } from "@common/item/Affliction";
import type { ArmorGear } from "@common/item/ArmorGear";
import type { BodyLocation } from "@common/item/BodyLocation";
import type { BodyPart } from "@common/item/BodyPart";
import type { BodyZone } from "@common/item/BodyZone";
import type { CombatTechniqueStrikeMode } from "@common/item/CombatTechniqueStrikeMode";
import type { ConcoctionGear } from "@common/item/ConcoctionGear";
import type { ContainerGear } from "@common/item/ContainerGear";
import type { Domain } from "@common/item/Domain";
import type { Injury } from "@common/item/Injury";
import type { MeleeWeaponStrikeMode } from "@common/item/MeleeWeaponStrikeMode";
import type { MiscGear } from "@common/item/MiscGear";
import type { MissileWeaponStrikeMode } from "@common/item/MissileWeaponStrikeMode";
import type { Mystery } from "@common/item/Mystery";
import type { MysticalAbility } from "@common/item/MysticalAbility";
import type { MysticalDevice } from "@common/item/MysticalDevice";
import type { Philosophy } from "@common/item/Philosophy";
import type { ProjectileGear } from "@common/item/ProjectileGear";
import type { Protection } from "@common/item/Protection";
import type { Skill } from "@common/item/Skill";
import type { Trait } from "@common/item/Trait";
import type { WeaponGear } from "@common/item/WeaponGear";

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
        "sohl.logThreshold": string;
    }

    interface DocumentClassConfig {
        Actor: typeof SohlActor;
        Item: typeof SohlItem;
        Combatant: typeof SohlCombatant;
        ActiveEffect: typeof SohlActiveEffect;
    }

    interface ConfiguredActor<SubType extends Actor.SubType> {
        Actor: SohlActor<SohlActor.Logic, any, SubType>;
    }

    interface ConfiguredItem<SubType extends Item.SubType> {
        Item: SohlItem<SohlItem.Logic, any, SubType>;
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
            affiliation: typeof Affiliation.DataModel;
            affliction: typeof Affliction.DataModel;
            armorgear: typeof ArmorGear.DataModel;
            bodylocation: typeof BodyLocation.DataModel;
            bodypart: typeof BodyPart.DataModel;
            bodyzone: typeof BodyZone.DataModel;
            combattechniquestrikemode: typeof CombatTechniqueStrikeMode.DataModel;
            concoctiongear: typeof ConcoctionGear.DataModel;
            containergear: typeof ContainerGear.DataModel;
            domain: typeof Domain.DataModel;
            injury: typeof Injury.DataModel;
            meleeweaponstrikemode: typeof MeleeWeaponStrikeMode.DataModel;
            miscgear: typeof MiscGear.DataModel;
            missileweaponstrikemode: typeof MissileWeaponStrikeMode.DataModel;
            mystery: typeof Mystery.DataModel;
            mysticalability: typeof MysticalAbility.DataModel;
            mysticaldevice: typeof MysticalDevice.DataModel;
            philosophy: typeof Philosophy.DataModel;
            projectilegear: typeof ProjectileGear.DataModel;
            protection: typeof Protection.DataModel;
            skill: typeof Skill.DataModel;
            trait: typeof Trait.DataModel;
            weapongear: typeof WeaponGear.DataModel;
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
