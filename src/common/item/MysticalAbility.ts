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

import type { SohlEventContext } from "@common/event/SohlEventContext";
import type { ValueModifier } from "@common/modifier/ValueModifier";
import { MasteryLevel, MasteryLevelDataModel } from "@common/item/MasteryLevel";
import { SohlItem, SohlItemSheetBase } from "@common/item/SohlItem";
import {
    ITEM_KIND,
    MysticalAbilitySubType,
    MysticalAbilitySubTypes,
} from "@utils/constants";
const { SchemaField, NumberField, StringField, BooleanField } =
    foundry.data.fields;

/**
 * The MysticalAbility class represents a mystical ability associated with an
 * entity, either a character or an object. These powers generally must
 * be activated, and often the results or success of the powers are
 * determined at least partially randomly.
 *
 * The following ability subtypes are supported:
 *   Shamanic Rite: Perform a shamanic rite on target(s)
 *   Spirit Action: Perform a spirit action (Roaming, Sensing, Communing, Immersion, Conflict, etc.)
 *   Spirit Power: Perform a spirit power (Ancestor, Totem, or Energy)
 *   Benediction: Bestow blessing
 *   Divine Devotion: Request blessing or miracle
 *   Divine Incantation: Divine spells
 *   Arcane Incantation: Arcane spells
 *   Arcane Talent: Intrinsic spell-like arcane powers
 *   Spirit Talent: Intrinsic spell-like spirit powers
 *   Alchemy: Create alchemical elixirs or perform actions
 *   Divination: Foretelling the future
 */
export class MysticalAbility<
        TData extends MysticalAbility.Data = MysticalAbility.Data,
    >
    extends MasteryLevel<TData>
    implements MysticalAbility.Logic<TData>
{
    assocSkill?: SohlItem;
    domain?: SohlItem;
    level!: ValueModifier;
    charges!: {
        value: ValueModifier;
        max: ValueModifier;
    };

    /** @inheritdoc */
    initialize(context: SohlEventContext): void {
        super.initialize(context);
        if (this.data.assocSkill) {
            this.assocSkill = this.actor?.allItems.find(
                (it) =>
                    it.type === ITEM_KIND.SKILL &&
                    it.name === this.data.assocSkill,
            );
        }
        this.charges = {
            value: sohl.CONFIG.ValueModifier({}, { parent: this }).setBase(
                this.data.charges.value,
            ),
            max: sohl.CONFIG.ValueModifier({}, { parent: this }).setBase(
                this.data.charges.max,
            ),
        };

        this.level = sohl.CONFIG.ValueModifier({}, { parent: this }).setBase(
            this.data.levelBase,
        );
    }

    /** @inheritdoc */
    evaluate(context: SohlEventContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace MysticalAbility {
    export const Kind = ITEM_KIND.MYSTICALABILITY;

    export interface Logic<
        TData extends MysticalAbility.Data = MysticalAbility.Data,
    > extends MasteryLevel.Logic<TData> {
        assocSkill?: SohlItem;
        domain?: SohlItem;
        level: ValueModifier;
        charges: {
            value: ValueModifier;
            max: ValueModifier;
        };
    }

    export interface Data<
        TLogic extends MysticalAbility.Logic<Data> = MysticalAbility.Logic<any>,
    > extends MasteryLevel.Data<TLogic> {
        subType: MysticalAbilitySubType;
        assocSkill: string;
        isImprovable: boolean;
        domain: {
            philosophy: string;
            name: string;
        };
        levelBase: number;
        charges: {
            value: number;
            max: number;
        };
    }
}

function defineMysticalAbilityDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...MasteryLevelDataModel.defineSchema(),
        subType: new StringField({
            choices: MysticalAbilitySubTypes,
            required: true,
        }),
        assocSkill: new StringField(),
        isImprovable: new BooleanField({ initial: false }),
        domain: new SchemaField({
            philosophy: new StringField(),
            name: new StringField(),
        }),
        levelBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        charges: new SchemaField({
            // Note: if value is -1, then there are infinite charges remaining
            value: new NumberField({
                integer: true,
                initial: -1,
                min: -1,
            }),
            // Note: if max is 0, then there is no maximum
            max: new NumberField({
                integer: true,
                initial: -1,
                min: -1,
            }),
        }),
    };
}

type MysticalAbilityDataSchema = ReturnType<
    typeof defineMysticalAbilityDataSchema
>;

export class MysticalAbilityDataModel<
        TSchema extends
            foundry.data.fields.DataSchema = MysticalAbilityDataSchema,
        TLogic extends
            MysticalAbility.Logic<MysticalAbility.Data> = MysticalAbility.Logic<MysticalAbility.Data>,
    >
    extends MasteryLevelDataModel<TSchema, TLogic>
    implements MysticalAbility.Data<TLogic>
{
    static readonly LOCALIZATION_PREFIXES = ["MysticalAbility"];
    static override readonly kind = MysticalAbility.Kind;
    subType!: MysticalAbilitySubType;
    assocSkill!: string;
    isImprovable!: boolean;
    domain!: {
        philosophy: string;
        name: string;
    };
    levelBase!: number;
    charges!: {
        value: number;
        max: number;
    };

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMysticalAbilityDataSchema();
    }
}

export class MysticalAbilitySheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/mysticalability.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
