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

import type { SohlAction } from "@src/domain/action/SohlAction";
import type { BodyLocation } from "@src/domain/body/BodyLocation";
import type { LineageLogic } from "@src/document/item/logic/LineageLogic";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import {
    ACTION_SUBTYPE,
    defineType,
    ImpactAspect,
    INJURY_LEVELS,
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
 * An instance of harm to a character.
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
    /**
     * Trauma severity level (M1=1, S2=2, S3=3, G4=4, G5=5), as a
     * {@link ValueModifier}, seeded from {@link TraumaData.levelBase}.
     */
    level!: ValueModifier;
    /**
     * How quickly the wound heals, as a {@link ValueModifier}, seeded from
     * {@link TraumaData.healingRateBase}.
     */
    healingRate!: ValueModifier;
    /**
     * The {@link BodyLocation} on the actor's Lineage that this trauma
     * affects, resolved from {@link TraumaData.bodyLocationCode}. When the
     * code is blank — or no matching location exists on the lineage — this
     * is `undefined`, indicating the trauma affects the whole body rather
     * than a specific location. Recomputed in {@link evaluate}.
     */
    bodyLocation: BodyLocation | undefined;

    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlItemBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "treatmenttest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.treatmenttest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-caduceus",
                executor: "treatmentTest",
                visible: "item.system.subType === 'physical'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "healingtest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.healingtest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-healing",
                executor: "healingTest",
                visible: "item.system.subType === 'physical'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
        ];
    }

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

/**
 * Persisted data model for a {@link TraumaLogic | Trauma} item.
 *
 * @typeParam TLogic - The logic class bound to this data.
 * @remarks The shape of `system` on a `trauma` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "trauma"`. The backing DataModel implements this interface.
 */
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

/**
 * The shock states a character can be in, ordered by increasing severity.
 */
export const {
    /** Map of shock-state keys to their numeric severity values. */
    kind: SHOCK,
    /** Array of valid shock-state numeric values. */
    values: Shock,
    /** Type guard testing whether a value is a valid shock state. */
    isValue: isShock,
} = defineType("SOHL.Trauma.SHOCK", {
    /** No shock — the character is unaffected. */
    NONE: 0,
    /** Stunned — briefly impaired. */
    STUNNED: 1,
    /** Incapacitated — unable to act. */
    INCAPACITATED: 2,
    /** Unconscious. */
    UNCONCIOUS: 3,
    /** Killed. */
    KILLED: 4,
});
/** Union of valid shock-state values. */
export type Shock = (typeof SHOCK)[keyof typeof SHOCK];

/**
 * Default wound-state values applied to an untreated trauma: an elevated
 * healing rate (`hr`), exposure to infection (`infect`), and the bleeding /
 * impairment / new-injury baselines.
 */
export const UNTREATED = {
    /** Healing rate for an untreated wound. */
    hr: 4,
    /** Whether an untreated wound is exposed to infection. */
    infect: true,
    /** Whether an untreated wound is bleeding by default. */
    bleed: false,
    /** Whether an untreated wound is impairing by default. */
    impair: false,
    /** New-injury baseline for an untreated wound (`-1` = none). */
    newInj: -1,
} as const;

/**
 * Re-exported from `constants.ts` for back-compat with existing import
 * sites. The canonical definition lives in constants so the Foundry-free
 * domain layer (e.g. injury resolution) can consume it without importing
 * this Foundry-coupled module.
 */
export { INJURY_LEVELS };
