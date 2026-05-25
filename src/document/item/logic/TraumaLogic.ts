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

import type { SohlActionData } from "@src/domain/action/SohlAction";
import type { BodyLocation } from "@src/domain/body/BodyLocation";
import type { LineageLogic } from "@src/document/item/logic/LineageLogic";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import {
    ACTION_SUBTYPE,
    defineType,
    ImpactAspect,
    ITEM_KIND,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    TraumaSubType,
} from "@src/utils/constants";
import {
    SohlItemBaseLogic,
    SohlItemData,
} from "@src/document/item/foundry/SohlItem";

/**
 * Logic for the **Trauma** item type — an instance of harm to a character.
 *
 * Trauma represents wounds and damage sustained by a character. The
 * {@link TraumaData.subType | subType} discriminates the trauma's nature:
 * `physical` (the original injury concept — bodily harm tied to a
 * {@link TraumaData.bodyLocationCode | body location}), `mental`,
 * `spiritual`, or `shadow`.
 *
 * Each trauma tracks:
 *
 * - **subType** — Category of harm (physical | mental | spiritual | shadow)
 * - **injuryLevel** — Severity on a graduated scale: M1 (Minor), S2–S3
 *   (Serious), G4–G5 (Grievous), with higher levels causing greater
 *   impairment and risk of death
 * - **healingRate** — How quickly the wound heals (influenced by treatment)
 * - **aspect** — The type of damage that caused the trauma (Blunt, Pierce,
 *   Cut, Heat, Cold), which affects treatment and healing
 * - **isTreated** — Whether the trauma has received medical treatment
 *   (untreated wounds heal slower and risk infection)
 * - **isBleeding** — Whether the wound is actively bleeding
 *
 * Trauma contributes to the character's overall {@link BeingLogic.shockState | shock state}
 * and (for physical subtype) interacts with the anatomy model (body
 * roles, body parts, body locations) to determine hit location effects.
 *
 * Trauma supports treatment and healing test actions.
 *
 * @typeParam TData - The Trauma data interface.
 */
export class TraumaLogic<
    TData extends TraumaData = TraumaData,
> extends SohlItemBaseLogic<TData> {
    /** Trauma severity level (M1=1, S2=2, S3=3, G4=4, G5=5). */
    level!: ValueModifier;
    /** Healing rate — how quickly the wound heals. */
    healingRate!: ValueModifier;
    /**
     * The {@link BodyLocation} on the actor's Lineage that this trauma
     * affects, resolved from {@link TraumaData.bodyLocationCode}. When the
     * code is blank — or no matching location exists on the lineage — this
     * is `undefined`, indicating the trauma affects the whole body rather
     * than a specific location. Recomputed in {@link evaluate}.
     */
    bodyLocation: BodyLocation | undefined;

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.level = new ValueModifier({}, { parent: this }).setBase(
            this.data.levelBase,
        );
        this.healingRate = new ValueModifier({}, { parent: this }).setBase(
            this.data.healingRateBase,
        );
        this.bodyLocation = undefined;
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        this.bodyLocation = this.resolveBodyLocation();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }

    /**
     * Look up the {@link BodyLocation} referenced by `bodyLocationCode`
     * on the actor's Lineage. Returns `undefined` when the code is blank,
     * the trauma is not attached to an actor, the actor has no Lineage,
     * or no location with that shortcode exists.
     */
    private resolveBodyLocation(): BodyLocation | undefined {
        const code = this.data.bodyLocationCode;
        if (!code) return undefined;
        const lineageItem = (this.actor?.itemTypes as any)?.[
            ITEM_KIND.LINEAGE
        ]?.[0];
        if (!lineageItem) return undefined;
        const lineageLogic = lineageItem.logic as LineageLogic | undefined;
        return lineageLogic?.bodyStructure
            ?.getAllLocations()
            .find((loc) => loc.shortcode === code);
    }
}

export interface TraumaData<
    TLogic extends TraumaLogic<TraumaData> = TraumaLogic<any>,
> extends SohlItemData<TLogic> {
    /** Category of harm: physical, mental, spiritual, or shadow */
    subType: TraumaSubType;
    /** Severity on a graduated scale: M1, S2-S3, G4-G5 */
    levelBase: number;
    /** Base rate of wound healing per time period */
    healingRateBase: number;
    /** Type of damage: Blunt, Edged, Piercing, or Fire */
    aspect: ImpactAspect;
    /** Whether the trauma has received medical treatment */
    isTreated: boolean;
    /** Whether the wound is actively bleeding */
    isBleeding: boolean;
    /**
     * Shortcode of the body location on the actor's Lineage where this
     * trauma occurred. Empty string means the trauma is not tied to a
     * specific location (affects the whole body).
     */
    bodyLocationCode: string;
}

export const {
    kind: SHOCK,
    values: Shock,
    isValue: isShock,
} = defineType("SOHL.Trauma.SHOCK", {
    NONE: 0,
    STUNNED: 1,
    INCAPACITATED: 2,
    UNCONCIOUS: 3,
    KILLED: 4,
});
export type Shock = (typeof SHOCK)[keyof typeof SHOCK];

export const UNTREATED = {
    hr: 4,
    infect: true,
    bleed: false,
    impair: false,
    newInj: -1,
} as const;

export const INJURY_LEVELS = ["NA", "M1", "S2", "S3", "G4", "G5"];

export const {
    kind: INTRINSIC_ACTION,
    values: IntrinsicActions,
    isValue: isIntrinsicAction,
    labels: IntrinsicActionLabels,
} = defineType("SOHL.Trauma.INTRINSIC_ACTION", {
    TREATMENTTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Trauma.INTRINSIC_ACTION.treatmenttest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-staff-snake",
        executor: "treatmentTest",
        visible: "item.system.subType === 'physical'",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    HEALINGTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Trauma.INTRINSIC_ACTION.healingtest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-heart-pulse",
        executor: "healingTest",
        visible: "item.system.subType === 'physical'",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
} as StrictObject<Partial<SohlActionData>>);
export type IntrinsicAction =
    (typeof INTRINSIC_ACTION)[keyof typeof INTRINSIC_ACTION];
