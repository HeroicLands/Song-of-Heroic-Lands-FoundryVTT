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
    durationFields,
} from "@src/document/item/foundry/temporal-fields";
import { TraumaLogic, TraumaData } from "@src/document/item/logic/TraumaLogic";
import {
    IMPACT_ASPECT,
    ImpactAspect,
    ImpactAspects,
    ITEM_KIND,
    TRAUMA_SUBTYPE,
    TraumaSubType,
    TraumaSubTypes,
    TraumaSubTypeChoices,
    ImpactAspectChoices,
} from "@src/utils/constants";
const { NumberField, BooleanField, StringField } = foundry.data.fields;

/**
 * Builds the data schema for the Trauma item, extending the base item schema
 * with trauma-specific fields (subtype, level, healing rate, impact aspect,
 * treatment/bleeding state, and body location).
 * @returns The Foundry data schema for the trauma.
 */
function defineTraumaDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            initial: TRAUMA_SUBTYPE.INJURY,
            choices: TraumaSubTypeChoices,
        }),
        // Sub-category within a subtype — e.g. a FATIGUE trauma's category is a
        // FATIGUE_CATEGORY (windedness / weariness / weakness). Empty for
        // subtypes that have no sub-category. A blank sentinel, not nullable:
        // "no category" is a valid state, not a distinct unset one.
        category: new StringField({ initial: "" }),
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
        aspect: new StringField({
            initial: IMPACT_ASPECT.BLUNT,
            choices: ImpactAspectChoices,
        }),
        contractDate: worldTimeDateField(),
        treatmentDate: worldTimeDateField(),
        ...durationFields("healingCheck"),
        ...durationFields("bloodLossAdvance"),
        // Extended Shock / Coma recovery Course Test (#556): its own recurring
        // cadence (Extended Shock every 4 hours; Coma every d10 days).
        ...durationFields("course"),
        // Whether this injury, once treated, is eligible for permanent
        // impairment if it heals slowly (#553 sets it; #554 applies the
        // magnitude). A blank sentinel (`false`), not nullable: "not eligible"
        // is the valid default, not a distinct unset state.
        permanentImpairmentEligible: new BooleanField({ initial: false }),
        // Whether this injury is exposed to infection — a poorly-treated wound
        // (#553 sets it). A Critical-Failure Injury Healing Test on an infectable
        // wound contracts an infection (#557).
        infectable: new BooleanField({ initial: false }),
        bodyLocationCode: new StringField({ initial: "", required: true }),
    };
}

type TraumaDataSchema = ReturnType<typeof defineTraumaDataSchema>;

/** @internal */
export class TraumaDataModel<
    TSchema extends foundry.data.fields.DataSchema = TraumaDataSchema,
    TLogic extends TraumaLogic<TraumaData> = TraumaLogic<TraumaData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements TraumaData<TLogic>
{
    /** @inheritDoc */
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Trauma",
        "SOHL.Item",
    ];
    /** @inheritDoc */
    static override readonly kind = ITEM_KIND.TRAUMA;
    subType!: TraumaSubType;
    category!: string;
    levelBase!: number;
    healingRateBase!: number | null;
    aspect!: ImpactAspect;
    contractDate!: number | null;
    treatmentDate!: number | null;
    healingCheckDurationFormula!: string;
    healingCheckDurationBase!: number | null;
    bloodLossAdvanceDurationFormula!: string;
    bloodLossAdvanceDurationBase!: number | null;
    courseDurationFormula!: string;
    courseDurationBase!: number | null;
    permanentImpairmentEligible!: boolean;
    infectable!: boolean;
    bodyLocationCode!: string;

    /**
     * Returns the Foundry data schema for the trauma item.
     * @returns The trauma data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineTraumaDataSchema();
    }

    /**
     * Seed the contract anchor, interval formulas, and the initial
     * {@link https://kb.heroiclands.org/dev/reference/event-queue/ | scheduled
     * actions} when a Trauma is created. `contractDate` is set to the current
     * world time; the interval formulas are taken from the corresponding world
     * settings and their duration bases from a numeric read of the formula (the
     * defaults are bare second counts). The recurring checks are seeded as
     * `system.scheduledActions` entries anchored at the current world time — the
     * generic store (issue #588) replaces the retired bespoke `last*Date` anchors
     * — so {@link TraumaLogic.finalize} arms them on the following preparation
     * (a `0` interval fires the first check immediately, at which point the
     * executor rolls the real interval). Creation still auto-arms the first
     * occurrence; the *reschedule* of later occurrences is offered, not automatic
     * (issue #579).
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
        const healFormula = String(
            game.settings.get("sohl", "healingCheckDurationFormula") ?? "",
        );
        const bloodFormula = String(
            game.settings.get("sohl", "bloodLossAdvanceDurationFormula") ?? "",
        );
        const healInterval = Number(healFormula) || 0;
        // NO recurring check is auto-armed at creation (issue #579 — nothing
        // auto-schedules): the creating flow OFFERS each one — the injury flow
        // offers `healingCheck` / `bloodLossAdvanceCheck` (`createTraumaFromInjury`),
        // treatment offers blood-loss, and the shock/infection flows offer
        // `courseCheck`. Only the config (formula/base — the offer's default
        // cadence) is seeded here; a caller-supplied `scheduledActions` is left
        // untouched.
        const seed: PlainObject = {
            contractDate: now,
            healingCheckDurationFormula: healFormula,
            healingCheckDurationBase: healInterval,
        };
        // A bleeder arrives with a non-null bloodLossAdvanceDurationBase
        // (a placeholder set at injury resolution, #482); seed its real interval.
        if (this.bloodLossAdvanceDurationBase != null) {
            seed.bloodLossAdvanceDurationFormula = bloodFormula;
            seed.bloodLossAdvanceDurationBase = Number(bloodFormula) || 0;
        }

        // Recovery Course Test cadence (#556/#557) — seeded for the lasting-
        // condition subtypes when the caller has not supplied it. Extended Shock
        // runs every 4 hours, a Coma every d10 days, and an Infection on the
        // standard healing-check period.
        if (
            (this.subType === TRAUMA_SUBTYPE.SHOCK ||
                this.subType === TRAUMA_SUBTYPE.COMA ||
                this.subType === TRAUMA_SUBTYPE.INFECTION) &&
            data.courseDurationFormula == null
        ) {
            const courseFormula =
                this.subType === TRAUMA_SUBTYPE.COMA ? "1d10 * 86400"
                : this.subType === TRAUMA_SUBTYPE.INFECTION ? healFormula
                : "14400";
            seed.courseDurationFormula = courseFormula;
            seed.courseDurationBase = Number(courseFormula) || 0;
        }

        this.updateSource(seed as any);
        return undefined;
    }
}
