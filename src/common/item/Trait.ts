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

import type { SohlActionContext } from "@common/SohlActionContext";
import { SohlItem, SohlItemSheetBase } from "@common/item/SohlItem";
import {
    MasteryLevelLogic,
    MasteryLevelDataModel,
    MasteryLevelData,
} from "@common/item/MasteryLevel";
import {
    ITEM_KIND,
    ITEM_METADATA,
    TRAIT_INTENSITY,
    TRAIT_SUBTYPE,
    TraitIntensities,
    TraitIntensity,
    TraitSubType,
    TraitSubTypes,
} from "@utils/constants";
const {
    ArrayField,
    ObjectField,
    SchemaField,
    NumberField,
    StringField,
    BooleanField,
} = foundry.data.fields;

/**
 * Logic for the **Trait** item type — an innate characteristic, advantage,
 * or drawback.
 *
 * Traits represent intrinsic properties of a character that are not learned
 * through training: physical attributes (Strength, Stamina, Dexterity),
 * mental attributes (Intelligence, Aura, Will), physical features (Height,
 * Frame), and special qualities (Flaws, Virtues).
 *
 * Each trait has:
 * - A {@link TraitData.subType | subType} categorizing it (Physique, Endurance,
 *   Aura, etc.)
 * - An {@link TraitData.intensity | intensity} level (Trait, Flaw, or Virtue)
 * - Either a **numeric value** (with mastery level progression) or a
 *   **text value** for descriptive traits
 * - Optional {@link TraitData.valueDesc | value descriptions} mapping numeric
 *   ranges to labels (e.g., "Weak", "Average", "Strong")
 * - An optional **max** cap on the trait's value
 *
 * Traits are foundational to the SoHL system: they form the skill base
 * formulas for skills, contribute to derived values like health and
 * encumbrance, and serve as prerequisites for abilities and actions.
 *
 * Inherits mastery level progression from {@link MasteryLevelLogic}.
 *
 * @typeParam TData - The Trait data interface.
 */
export class TraitLogic<
    TData extends TraitData = TraitData,
> extends MasteryLevelLogic<TData> {
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface TraitData<
    TLogic extends TraitLogic<TraitData> = TraitLogic<any>,
> extends MasteryLevelData<TLogic> {
    /** Trait category (Physique, Personality, Transcendent) */
    subType: TraitSubType;
    /** Descriptive value for non-numeric traits */
    textValue: string;
    /** Optional upper limit for this trait's value, or null for no limit */
    max: number | null;
    /** Whether this trait uses numeric rather than text values */
    isNumeric: boolean;
    /** Intensity level: Trait, Impulse, Disorder, or Attribute */
    intensity: TraitIntensity;
    /** Labels mapping numeric value ranges to descriptive names */
    valueDesc: {
        label: string;
        maxValue: number;
    }[];
    /** Predefined selection options for this trait */
    choices: StrictObject<string>;
}

function defineTraitSchema(): foundry.data.fields.DataSchema {
    return {
        ...MasteryLevelDataModel.defineSchema(),
        subType: new StringField({
            initial: TRAIT_SUBTYPE.PHYSIQUE,
            required: true,
            choices: TraitSubTypes,
        }),
        textValue: new StringField(),
        max: new NumberField({
            integer: true,
            nullable: true,
            initial: null,
        }),
        isNumeric: new BooleanField({ initial: false }),
        intensity: new StringField({
            initial: TRAIT_INTENSITY.TRAIT,
            required: true,
            choices: TraitIntensities,
        }),
        valueDesc: new ArrayField(
            new SchemaField({
                label: new StringField({
                    blank: false,
                    required: true,
                }),
                maxValue: new NumberField({
                    integer: true,
                    required: true,
                    initial: 0,
                }),
            }),
        ),
        choices: new ObjectField(),
    };
}

type TraitSchema = ReturnType<typeof defineTraitSchema>;

export class TraitDataModel<
        TSchema extends foundry.data.fields.DataSchema = TraitSchema,
        TLogic extends TraitLogic<TraitData> = TraitLogic<TraitData>,
    >
    extends MasteryLevelDataModel<TSchema, TLogic>
    implements TraitData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Trait", "SOHL.MasteryLevel", "SOHL.Item"];
    static override readonly kind = ITEM_KIND.TRAIT;
    subType!: TraitSubType;
    textValue!: string;
    max!: number | null;
    isNumeric!: boolean;
    intensity!: TraitIntensity;
    valueDesc!: {
        label: string;
        maxValue: number;
    }[];
    choices!: StrictObject<string>;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineTraitSchema();
    }
}

export class TraitSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        await super._preparePropertiesContext(context, options);
        const system = this.document.system as any;
        return Object.assign(context, {
            skillBaseFormula: system.skillBaseFormula,
            masteryLevelBase: system.masteryLevelBase,
            improveFlag: system.improveFlag,
            subType: system.subType,
            textValue: system.textValue,
            max: system.max,
            isNumeric: system.isNumeric,
            intensity: system.intensity,
            valueDesc: system.valueDesc,
            choices: system.choices,
        });
    }
}
