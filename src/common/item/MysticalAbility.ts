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
import type { ValueModifier } from "@common/modifier/ValueModifier";
import type { DomainLogic } from "@common/item/Domain";
import type { SkillLogic } from "@common/item/Skill";
import {
    MasteryLevelLogic,
    MasteryLevelDataModel,
    MasteryLevelData,
} from "@common/item/MasteryLevel";
import { SohlItem, SohlItemSheetBase } from "@common/item/SohlItem";
import {
    ITEM_KIND,
    ITEM_METADATA,
    MysticalAbilitySubType,
    MysticalAbilitySubTypes,
} from "@utils/constants";
const { SchemaField, NumberField, StringField, BooleanField } =
    foundry.data.fields;

/**
 * Logic for the **Mystical Ability** item type — an actively invoked
 * supernatural power.
 *
 * Mystical Abilities represent spells, rites, invocations, and other powers
 * that a character actively uses. Unlike {@link MysteryLogic | Mysteries}
 * (which are often passive), mystical abilities must be deliberately activated
 * and their success is typically determined by a skill test.
 *
 * Each ability is linked to an **associated skill** (via shortcode) that
 * governs its activation test, and to a {@link DomainLogic | Domain} that
 * determines its mystical tradition. Abilities track a **level** (power),
 * **charges** (uses remaining), and inherit mastery level progression from
 * {@link MasteryLevelLogic}.
 *
 * Supported subtypes:
 * - Shamanic Rite: Perform a shamanic rite on target(s)
 * - Spirit Action: Spirit world interaction (Roaming, Sensing, Communing, etc.)
 * - Spirit Power: Channel spirit power (Ancestor, Totem, or Energy)
 * - Benediction: Bestow a blessing
 * - Divine Devotion: Request blessing or miracle from a deity
 * - Divine Incantation: Cast divine spells
 * - Arcane Incantation: Cast arcane spells
 * - Arcane Talent: Intrinsic spell-like arcane powers
 * - Spirit Talent: Intrinsic spell-like spirit powers
 * - Alchemy: Create alchemical elixirs or perform alchemical actions
 * - Divination: Foretell the future
 *
 * @typeParam TData - The MysticalAbility data interface.
 */
export class MysticalAbilityLogic<
        TData extends MysticalAbilityData = MysticalAbilityData,
    >
    extends MasteryLevelLogic<TData>
    implements MysticalAbilityLogic<TData>
{
    assocSkill?: SkillLogic;
    domain?: DomainLogic;
    level!: ValueModifier;
    charges!: {
        value: ValueModifier;
        max: ValueModifier;
    };

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    initialize(): void {
        super.initialize();
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
    evaluate(): void {
        super.evaluate();

        if (!this.actor) return;
        const allItemTypes = this.actor.allItemTypes;

        this.domain = allItemTypes.domain.find(
            (it: SohlItem) => it.system.shortcode === this.data.domainCode,
        )?.logic as DomainLogic;

        this.assocSkill = allItemTypes.skill.find(
            (it: SohlItem) => it.system.shortcode === this.data.assocSkillCode,
        )?.logic as SkillLogic;
    }

    /** @inheritdoc */
    finalize(): void {
        super.finalize();
    }
}

export interface MysticalAbilityData<
    TLogic extends
        MysticalAbilityLogic<MysticalAbilityData> = MysticalAbilityLogic<any>,
> extends MasteryLevelData<TLogic> {
    /** Ability type (Incantation, Rite, Talent, etc.) */
    subType: MysticalAbilitySubType;
    /** Shortcode of the skill used to activate this ability */
    assocSkillCode?: string;
    /** Whether this ability's mastery level can be improved */
    isImprovable: boolean;
    /** Shortcode of the mystical domain this ability belongs to */
    domainCode?: string;
    /** Power level of this ability */
    levelBase: number;
    /** Usage tracking: current charges and maximum */
    charges: {
        value: number;
        max: number | null;
    };
}

function defineMysticalAbilityDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...MasteryLevelDataModel.defineSchema(),
        subType: new StringField({
            choices: MysticalAbilitySubTypes,
            required: true,
        }),
        assocSkillCode: new StringField({
            blank: false,
            nullable: true,
        }),
        isImprovable: new BooleanField({ initial: false }),
        domainCode: new StringField({
            blank: false,
            nullable: true,
        }),
        levelBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        charges: new SchemaField({
            // Note: if value is null, then there are infinite charges remaining
            value: new NumberField({
                integer: true,
                nullable: true,
                initial: 0,
                min: 0,
            }),
            // Note: if max is 0, then there is no maximum, if max is null,
            // then the mystical ability does not use charges
            max: new NumberField({
                integer: true,
                nullable: true,
                initial: null,
                min: 0,
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
            MysticalAbilityLogic<MysticalAbilityData> = MysticalAbilityLogic<MysticalAbilityData>,
    >
    extends MasteryLevelDataModel<TSchema, TLogic>
    implements MysticalAbilityData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.MysticalAbility", "SOHL.MasteryLevel", "SOHL.Item"];
    static override readonly kind = ITEM_KIND.MYSTICALABILITY;
    subType!: MysticalAbilitySubType;
    assocSkillCode?: string;
    isImprovable!: boolean;
    domainCode?: string;
    levelBase!: number;
    charges!: {
        value: number;
        max: number | null;
    };

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMysticalAbilityDataSchema();
    }
}

export class MysticalAbilitySheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }
}
