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

import type { SohlLogic } from "@src/core/logic/SohlLogic";
import {
    ImpactAspects,
    STRIKE_MODE_TYPE,
    StrikeModeTypes,
    type ImpactAspect,
    type StrikeModeType,
} from "@src/utils/constants";
import { CombatModifier } from "@src/entity/modifier/CombatModifier";
import { ImpactModifier } from "@src/entity/modifier/ImpactModifier";
import { ValueModifier } from "../modifier/ValueModifier";
import {
    fvttActiveCombatantForActor,
    fvttLogicFromUuid,
    fvttLogicFromUuidSync,
} from "@src/core/FoundryHelpers";
import { WeaponGearLogic } from "@src/document/item/logic/WeaponGearLogic";
import { CombatTechniqueLogic } from "@src/document/item/logic/CombatTechniqueLogic";
import { AutomatedCombat } from "@src/document/combatant/logic/SohlCombatantLogic";
import { SohlActionContext } from "../action/SohlActionContext";
import { SohlEntity } from "../SohlEntity";

/**
 * Base class for all strike modes — a specific way a weapon or combat
 * technique can be used in combat.
 *
 * A single weapon can have multiple strike modes (e.g., a broadsword has
 * "Cut", "Thrust", and "Pommel" melee modes; a throwing axe has a melee
 * "Chop" mode and a missile "Throw" mode).
 *
 * Strike modes carry the modifiers and test methods needed for combat
 * resolution: attack rolls, impact calculation, and (for melee) defense
 * rolls.
 *
 * **Lifecycle:** Rebuilt from persisted schema data on every preparation
 * cycle. Modifiers may be mutated during the lifecycle (e.g., injury
 * penalties, weapon quality bonuses), but mutations are not persisted.
 */
export abstract class StrikeModeBase extends SohlEntity {
    /** Stable identifier of this strike mode within its parent's `strikeModes` map. */
    id: string;
    /** The strike mode type discriminator: "melee" or "missile". */
    type: StrikeModeType;
    /** Descriptive name of this mode (e.g., "Cut", "Thrust", "Shoot"). */
    name: string;
    /** Minimum body parts needed to wield the weapon in this mode. */
    minParts: number;
    /** Shortcode of the associated skill (resolved to SkillLogic at runtime). */
    assocSkillCode: string;
    /** How precisely this mode can target a specific body part. */
    spread: ValueModifier;
    /** Attack roll mastery level modifier. */
    attack: CombatModifier;
    /** Impact (damage) modifier with dice and aspect. */
    impact: ImpactModifier;
    /** Miscellaneous traits/flags for this strike mode. */
    traits: PlainObject;

    /**
     * Rebuilds a strike mode from its persisted schema data, synthesizing the
     * modifier objects used during combat resolution.
     *
     * Derives {@link spread} from {@link StrikeModeBase.Data.attack | data.attack.spread},
     * {@link attack} from `data.attack.modifier` (seeded as an `"AtkMod"` delta),
     * and {@link impact} from {@link StrikeModeBase.Data.impactBase | data.impactBase}
     * (dice count, die size, flat modifier, and aspect). The {@link attack}
     * modifier is disabled when `data.attack.disabled` or the `noAttack` trait
     * is set.
     *
     * @param data - Persisted strike-mode fields (see {@link StrikeModeBase.Data}).
     * @param parentLogic - The owning Logic instance, used as the modifiers' parent.
     * @param id - This strike mode's key within the parent's `strikeModes` map.
     */
    constructor(data: StrikeModeBase.Data, parentLogic: SohlLogic, id: string) {
        super(data, { parent: parentLogic });
        this.type = data.type;
        this.name = data.name;
        this.minParts = data.minParts;
        this.assocSkillCode = data.assocSkillCode;
        this.spread = new ValueModifier({}, { parent: parentLogic }).setBase(
            data.attack.spread ?? 0,
        );
        this.attack = new CombatModifier({}, { parent: parentLogic });
        if (data.attack.modifier) {
            this.attack.add("Attack Modifier", "AtkMod", data.attack.modifier);
        }
        if (data.attack.disabled || data.traits?.noAttack) {
            this.attack.disabledReason =
                "This strike mode cannot be used for attacking.";
        }
        this.impact = new ImpactModifier(
            {
                roll: {
                    numDice: data.impactBase.numDice,
                    dieFaces: data.impactBase.die,
                    modifier: data.impactBase.modifier,
                    rolls: [],
                } as any,
                aspect: data.impactBase.aspect,
            },
            { parent: parentLogic },
        );
        this.traits = { ...(data.traits ?? {}) };
        this.id = id;
    }

    /**
     * The dot-notation path prefix for Foundry `update()` calls targeting
     * this strike mode's persisted fields, e.g.
     * `"system.strikeModes.hJc8S26awwY0ahZj"`.
     */
    get updatePath(): string {
        return `system.strikeModes.${this.id}`;
    }

    /** Whether this is a melee strike mode. */
    get isMelee(): boolean {
        return this.type === STRIKE_MODE_TYPE.MELEE;
    }

    /** Whether this is a missile strike mode. */
    get isMissile(): boolean {
        return this.type === STRIKE_MODE_TYPE.MISSILE;
    }

    /**
     * The full label of this strike mode, including its parent logic's name.
     * @returns A string like `"Broadsword Cut"` or `"Throwing Axe Throw"`.
     */
    get fullLabel(): string {
        return `${this.parent.name} ${this.name}`;
    }

    /**
     * A pointer to this strike mode within its parent logic (weapon or
     * combattechnique).
     * @returns A serializable object referring to this strike mode
     */
    get pointerData(): StrikeModeBase.PointerData {
        return {
            itemUuid: this.parent.uuid,
            smId: this.id,
        };
    }

    /**
     * Creates a strike mode instance from pointer data.
     * @param data - The pointer data referring to a strike mode.
     * @returns The referred-to strike mode, or `undefined` if the pointer is invalid.
     */
    static fromPointerData(
        data: StrikeModeBase.PointerData,
    ): Optional<StrikeModeBase> {
        const itemLogic: SohlLogic | undefined = fvttLogicFromUuidSync(
            data.itemUuid,
        );
        if (!itemLogic) return undefined;
        switch (itemLogic.kind) {
            case "weapon":
                return (itemLogic as WeaponGearLogic).strikeModes.find(
                    (sm) => sm.id === data.smId,
                );
            case "combattechnique":
                return (itemLogic as CombatTechniqueLogic).strikeMode;
            default:
                console.warn(
                    `Expected WeaponGear or CombatTechnique; instead got kind ${itemLogic.kind} with UUID ${data.itemUuid}.`,
                );
                return undefined;
        }
    }

    /**
     * The base SchemaField definitions shared by all strike-mode types.
     * Subclasses should call this and merge in their type-specific fields
     * to produce a SchemaField suitable for use in a TypedSchemaField.
     * @returns The shared data-schema field definitions for strike modes.
     */
    static baseSchemaFields(): foundry.data.fields.DataSchema {
        // Lazy access: foundry globals exist only when Foundry-side code
        // calls this; the module itself must load without them.
        const {
            NumberField,
            StringField,
            SchemaField,
            ObjectField,
            BooleanField,
        } = foundry.data.fields;
        return {
            type: new StringField({
                required: true,
                blank: false,
                choices: StrikeModeTypes,
            }),
            name: new StringField({ required: true, blank: false }),
            minParts: new NumberField({
                integer: true,
                min: 1,
                initial: 1,
            }),
            assocSkillCode: new StringField({ blank: false }),
            attack: new SchemaField({
                disabled: new BooleanField({ initial: false }),
                spread: new NumberField({
                    integer: false,
                    min: 0,
                    initial: 0,
                }),
                modifier: new NumberField({ integer: true, initial: 0 }),
            }),
            impactBase: new SchemaField({
                numDice: new NumberField({
                    integer: true,
                    min: 0,
                    initial: 1,
                }),
                die: new NumberField({
                    integer: true,
                    min: 2,
                    nullable: true,
                    initial: null,
                }),
                modifier: new NumberField({ integer: true, initial: 0 }),
                aspect: new StringField({
                    blank: false,
                    choices: ImpactAspects,
                }),
            }),
            traits: new ObjectField({ initial: {} }),
        };
    }

    /**
     * Compares this strike mode to another for sorting purposes.
     * @param other The strike mode to compare to.
     * @returns A negative number if this comes before other, positive if
     * after, or 0 if equal.
     */
    compareTo(other: StrikeModeBase): number {
        if (this.parent.uuid !== other.parent.uuid) {
            return this.parent.uuid.localeCompare(other.parent.uuid);
        }
        if (this.id !== other.id) {
            return this.id.localeCompare(other.id);
        }
        return 0;
    }

    /**
     * Begin automated combat with this weapon. Delegates into the attacker's
     * {@link CombatantLogic.automatedCombatStart} action — the single combat-start
     * entry point — passing this weapon's `logicUuid` (and any `smId` already in
     * scope) so only this weapon's in-range strike modes are offered.
     *
     * @param context - The action context driving the automated combat start.
     * @returns The result of the combatant's `automatedCombatStart` action, or undefined if the actor is not in the active combat.
     */
    async automatedCombatStart(
        context: SohlActionContext<Partial<AutomatedCombat.AttackContextScope>>,
    ): Promise<unknown> {
        const combatantLogic = fvttActiveCombatantForActor(this.parent.actor);
        if (!combatantLogic) {
            sohl.log.uiWarn(
                `${this.name} cannot start automated combat: its actor is not in the active combat.`,
            );
            return;
        }
        (context.scope ??=
            {} as Partial<AutomatedCombat.AttackContextScope>).mode =
            this.pointerData;
        return combatantLogic.executeAction("automatedCombatStart", context);
    }
}

export namespace StrikeModeBase {
    /** A pointer to a strike mode within an enclosing item (weapon or combat technique). */
    export interface PointerData {
        /** Id of the owning item (weapon or combat technique). */
        itemUuid: string;
        /** The strike mode Id. */
        smId: string;
    }

    /** Common persisted fields shared by all strike mode types. */
    export interface Data extends SohlEntity.Data {
        /** Discriminator selecting the concrete strike-mode type ("melee" or "missile"). */
        type: StrikeModeType;
        /** Display name of the mode (e.g., "Cut", "Thrust", "Shoot"). */
        name: string;
        /** Minimum body parts (limbs) required to wield the weapon in this mode. */
        minParts: number;
        /** Shortcode of the skill governing this mode, resolved to a SkillLogic at runtime. */
        assocSkillCode: string;
        /** Attack-roll configuration for this mode. */
        attack: {
            /** When `true`, the mode cannot be used to attack. */
            disabled?: boolean;
            /**
             * Hit-location scatter for the attack. Melee-only in practice, but
             * declared on the base Data so schema validation accepts it.
             */
            spread?: number;
            /** Flat attack mastery-level modifier seeded as the `"AtkMod"` delta. */
            modifier?: number;
        };
        /** Base impact (damage) definition before runtime modifiers. */
        impactBase: {
            /** Number of impact dice contributed by the mode itself. */
            numDice: number;
            /**
             * Die size. `null` when the strike mode contributes no dice of
             * its own (e.g., a bow whose impact dice come from the
             * projectile). Otherwise an integer ≥ 2.
             */
            die: number | null;
            /** Flat amount added to the rolled impact total. */
            modifier: number;
            /** Damage aspect (e.g., blunt, edged, piercing) this mode inflicts. */
            aspect: ImpactAspect;
        };
        /** Arbitrary trait/flag bag (e.g., `noAttack`, `noBlock`). */
        traits: PlainObject;
    }
}
