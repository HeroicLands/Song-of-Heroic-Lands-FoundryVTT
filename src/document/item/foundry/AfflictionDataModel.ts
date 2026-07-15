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

import { SohlItemDataModel } from "@src/document/item/foundry/SohlItemDataModel";
import {
    worldTimeDateField,
    phaseFields,
    recurringPhaseFields,
} from "@src/document/item/foundry/temporal-fields";
import {
    AfflictionLogic,
    AfflictionData,
} from "@src/document/item/logic/AfflictionLogic";
import {
    AFFLICTION_TRANSMISSION,
    AfflictionHealRate,
    AfflictionSubType,
    AfflictionSubTypes,
    AfflictionTransmission,
    AfflictionTransmissionChoices,
    ITEM_KIND,
    AfflictionSubTypeChoices,
} from "@src/utils/constants";
const { StringField, BooleanField, NumberField } = foundry.data.fields;

/**
 * Builds the data schema for the Affliction item, extending the base item
 * schema with affliction-specific fields (subtype, contagion, healing rate,
 * transmission, etc.).
 * @returns The Foundry data schema for the affliction.
 */
function defineAfflictionSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            choices: AfflictionSubTypeChoices,
            required: true,
        }),
        category: new StringField({ initial: "" }),
        isDormant: new BooleanField({ initial: false }),
        contractDate: worldTimeDateField(),
        treatmentDate: worldTimeDateField(),
        ...phaseFields("onset"),
        ...recurringPhaseFields("healingCheck"),
        ...phaseFields("resolution"),
        diagnosisBonusBase: new NumberField({
            integer: true,
            initial: 0,
        }),
        levelBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        healingRateBase: new NumberField({
            integer: true,
            initial: AfflictionHealRate.NONE,
            min: AfflictionHealRate.NONE,
        }),
        contagionIndexBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        transmission: new StringField({
            initial: AFFLICTION_TRANSMISSION.NONE,
            required: true,
            choices: AfflictionTransmissionChoices,
        }),
    };
}

type AfflictionDataSchema = ReturnType<typeof defineAfflictionSchema>;

/** @internal */
export class AfflictionDataModel<
    TSchema extends foundry.data.fields.DataSchema = AfflictionDataSchema,
    TLogic extends AfflictionLogic<AfflictionData> =
        AfflictionLogic<AfflictionData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements AfflictionData<TLogic>
{
    /** @inheritDoc */
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Affliction",
        "SOHL.Item",
    ];
    /** @inheritDoc */
    static override readonly kind = ITEM_KIND.AFFLICTION;
    subType!: AfflictionSubType;
    category!: string;
    isDormant!: boolean;
    contractDate!: number | null;
    treatmentDate!: number | null;
    onsetDurationFormula!: string;
    onsetDurationBase!: number | null;
    onsetDate!: number | null;
    healingCheckDurationFormula!: string;
    healingCheckDurationBase!: number | null;
    lastHealingCheckDate!: number | null;
    resolutionDurationFormula!: string;
    resolutionDurationBase!: number | null;
    resolutionDate!: number | null;
    diagnosisBonusBase!: number;
    levelBase!: number;
    healingRateBase!: number;
    contagionIndexBase!: number;
    transmission!: AfflictionTransmission;

    /**
     * Returns the Foundry data schema for the affliction item.
     * @returns The affliction data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineAfflictionSchema();
    }

    /**
     * Seed the contract anchor and incubation duration when an Affliction is
     * created: `contractDate` is set to the current world time and
     * `onsetDurationBase` is seeded from a numeric read of the (per-disease)
     * `onsetDurationFormula`. The phase events are armed by
     * {@link AfflictionLogic.finalize} on the following preparation; the onset
     * transition rolls the resolution and healing-check intervals in turn.
     *
     * @param data - The pending creation data.
     * @param options - The create operation options.
     * @param user - The requesting user.
     * @returns `false` to veto creation, otherwise `undefined`.
     */
    protected override async _preCreate(
        data: PlainObject,
        options: PlainObject,
        user: User,
    ): Promise<boolean | void> {
        const allowed = await super._preCreate(
            data as any,
            options as any,
            user as any,
        );
        if (allowed === false) return false;

        this.updateSource({
            contractDate: game.time.worldTime,
            onsetDurationBase: Number(this.onsetDurationFormula) || 0,
        } as any);
        return undefined;
    }
}
