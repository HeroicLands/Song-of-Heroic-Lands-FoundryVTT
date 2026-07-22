/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
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
    durationFields,
} from "@src/document/item/foundry/temporal-fields";
import {
    AfflictionLogic,
    AfflictionData,
} from "@src/document/item/logic/AfflictionLogic";
import {
    AFFLICTION_OUTCOME,
    AFFLICTION_TRANSMISSION,
    AfflictionOutcome,
    AfflictionOutcomeChoices,
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
        levelBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        healingRateBase: new NumberField({
            integer: true,
            required: false,
            nullable: true,
            initial: null,
            min: 0,
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
        diagnosisBonusBase: new NumberField({
            integer: true,
            initial: 0,
        }),
        contractDate: worldTimeDateField(),
        treatmentDate: worldTimeDateField(),
        // Optional author hook: a Macro (by UUID) run when the affliction becomes
        // symptomatic at onset. A reference, never source — see the security
        // model. May schedule further events. Blank means no onset macro.
        onsetMacroUuid: new StringField({ initial: "" }),
        // The authored outcome applied at resolution if the affliction was not
        // defeated (#490): DEATH or CURED (defaults to the benign CURED).
        outcome: new StringField({
            initial: AFFLICTION_OUTCOME.CURED,
            choices: AfflictionOutcomeChoices,
        }),
        // Optional SafeExpression source evaluating to a trauma shortcode — or an
        // array of them — the host contracts as part of the outcome. Blank means
        // none. Combines with `outcome`.
        outcomeTrauma: new StringField({ initial: "" }),
        ...phaseFields("onset"),
        ...durationFields("healingCheck"),
        ...phaseFields("resolution"),
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
    onsetMacroUuid!: string;
    outcome!: AfflictionOutcome;
    outcomeTrauma!: string;
    onsetDurationFormula!: string;
    onsetDurationBase!: number | null;
    onsetDate!: number | null;
    healingCheckDurationFormula!: string;
    healingCheckDurationBase!: number | null;
    resolutionDurationFormula!: string;
    resolutionDurationBase!: number | null;
    resolutionDate!: number | null;
    diagnosisBonusBase!: number;
    levelBase!: number;
    healingRateBase!: number | null;
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
     * Seed only the contract anchor and incubation-duration config when an
     * Affliction is created — **not** a schedule: `contractDate` is set to the
     * current world time and `onsetDurationBase` is seeded from a numeric read of
     * the (per-disease) `onsetDurationFormula` (the offer's default cadence). The
     * `onsetCheck` is **offered**, not auto-armed — `BeingLogic.contractDisease`
     * calls the shared schedule offer after creating the affliction (issue #579,
     * the last creation-time auto-schedule removed). A disease created by a raw
     * drag (bypassing `contractDisease`) therefore does not auto-onset, matching
     * how direct trauma creation bypasses its offer. The onset *transition*, when
     * performed, still crystallizes `onsetDate` and auto-schedules the resolution
     * and recurring healing-check events (a consequence of the human-performed
     * step); the recurring healing check then *offers* its reschedule.
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

        const now = game.time.worldTime;
        const onsetInterval = Number(this.onsetDurationFormula) || 0;
        this.updateSource({
            contractDate: now,
            onsetDurationBase: onsetInterval,
        } as any);
        return undefined;
    }
}
