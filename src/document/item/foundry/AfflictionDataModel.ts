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
import { SafeExpressionField } from "@src/core/foundry/SafeExpressionField";
import {
    worldTimeDateField,
    durationBaseField,
    durationFormulaField,
} from "@src/document/item/foundry/temporal-fields";
import { AfflictionLogic, AfflictionData } from "@src/document/item/logic/AfflictionLogic";
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
        category: new StringField({
            nullable: true,
            blank: false,
            initial: null,
        }),
        isDormant: new BooleanField({ initial: false }),
        levelBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        healingRateBase: new NumberField({
            integer: true,
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
            choices: AfflictionTransmissionChoices,
        }),
        // A SimpleRoll formula giving the number of **days** between contracting
        // the affliction and the start of onset. Rolled by the Contagion Test on
        // the receiving actor (#1183). Unset (`null`) means no incubation.
        onsetFormula: new StringField({
            nullable: true,
            blank: false,
            initial: null,
        }),
        contractDate: worldTimeDateField(),
        treatmentDate: worldTimeDateField(),
        // Optional author hook: a Macro (by UUID) run when the affliction becomes
        // symptomatic at onset. A reference, never source — see the security
        // model. May schedule further events. Blank means no onset macro.
        onsetMacroUuid: new StringField({
            nullable: true,
            blank: false,
            initial: null,
        }),
        // The authored outcome applied at resolution if the affliction was not
        // defeated (#490): DEATH or CURED (defaults to the benign CURED).
        outcome: new StringField({
            initial: AFFLICTION_OUTCOME.CURED,
            choices: AfflictionOutcomeChoices,
        }),
        // Optional SafeExpression source evaluating to a trauma shortcode — or an
        // array of them — the host contracts as part of the outcome. Blank means
        // none. Combines with `outcome`. A SafeExpressionField so the sheet offers
        // the code editor; its defaults are nullable / non-blank / `initial: null`.
        outcomeTrauma: new SafeExpressionField({
            scope: "affliction.outcomeTrauma",
        }),
        // The timed phases, written out rather than generated from a name.
        // `phaseFields("onset")` built its keys with a template literal, so the
        // field names existed only once the argument was applied — and the
        // schema is now read from this source as data by `package-build
        // schema`, which does not evaluate arguments. Generated, these eight
        // fields were simply absent from the published schema, and content
        // authoring `system.onsetDate` would have been told no DataModel
        // declares it.
        //
        // The helpers below still carry the field *definitions*; only the names
        // are spelled here, where they can be read.
        onsetDurationFormula: durationFormulaField(),
        onsetDurationBase: durationBaseField(),
        onsetDate: worldTimeDateField(),
        healingCheckDurationFormula: durationFormulaField(),
        healingCheckDurationBase: durationBaseField(),
        resolutionDurationFormula: durationFormulaField(),
        resolutionDurationBase: durationBaseField(),
        resolutionDate: worldTimeDateField(),
    };
}

type AfflictionDataSchema = ReturnType<typeof defineAfflictionSchema>;

/** @internal */
export class AfflictionDataModel<
    TSchema extends foundry.data.fields.DataSchema = AfflictionDataSchema,
    TLogic extends AfflictionLogic<AfflictionData> = AfflictionLogic<AfflictionData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements AfflictionData<TLogic>
{
    /** @inheritDoc */
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Affliction", "SOHL.Item"];
    /** @inheritDoc */
    static override readonly kind = ITEM_KIND.AFFLICTION;
    subType!: AfflictionSubType;
    category!: string | null;
    isDormant!: boolean;
    contractDate!: number | null;
    treatmentDate!: number | null;
    onsetMacroUuid!: string | null;
    outcome!: AfflictionOutcome;
    outcomeTrauma!: string | null;
    onsetDurationFormula!: string | null;
    onsetDurationBase!: number | null;
    onsetDate!: number | null;
    healingCheckDurationFormula!: string | null;
    healingCheckDurationBase!: number | null;
    resolutionDurationFormula!: string | null;
    resolutionDurationBase!: number | null;
    resolutionDate!: number | null;
    onsetFormula!: string | null;
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
     * `onsetCheck` is **offered**, not auto-armed — `BeingLogic.contagionTest`
     * calls the shared schedule offer after creating the affliction (issue #579,
     * the last creation-time auto-schedule removed). A disease created by a raw
     * drag (bypassing `contagionTest`) therefore does not auto-onset, matching
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
        const allowed = await super._preCreate(data as any, options as any, user as any);
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
