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

import { entity } from "@src/entity/registry";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import type { TraumaData } from "@src/document/item/logic/TraumaLogic";
import {
    ACTION_SUBTYPE,
    AFFLICTION_SUBTYPE,
    AFFLICTION_TRANSMISSION,
    AfflictionSubType,
    AfflictionTransmission,
    defineType,
    FATIGUE_CATEGORY,
    FatigueCategoryLabels,
    FEAR_LEVEL,
    FearLevelLabels,
    isFatigueCategory,
    isFearLevel,
    isMoraleLevel,
    isPrivationCategory,
    MORALE_LEVEL,
    MoraleLevelLabels,
    PRIVATION_CATEGORY,
    PrivationCategoryLabels,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import {
    SohlItemBaseLogic,
    type SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";
import { SohlAction } from "@src/entity/action/SohlAction";

const FEAR_LABEL_BY_LEVEL: Record<number, string> = Object.fromEntries(
    Object.entries(FEAR_LEVEL).map(([k, v]) => [
        v as number,
        FearLevelLabels[k as keyof typeof FearLevelLabels],
    ]),
);

const MORALE_LABEL_BY_LEVEL: Record<number, string> = Object.fromEntries(
    Object.entries(MORALE_LEVEL).map(([k, v]) => [
        v as number,
        MoraleLevelLabels[k as keyof typeof MoraleLevelLabels],
    ]),
);

const FATIGUE_LABEL_BY_CATEGORY: Record<string, string> = Object.fromEntries(
    Object.entries(FATIGUE_CATEGORY).map(([k, v]) => [
        v as string,
        FatigueCategoryLabels[k as keyof typeof FatigueCategoryLabels],
    ]),
);

const PRIVATION_LABEL_BY_CATEGORY: Record<string, string> = Object.fromEntries(
    Object.entries(PRIVATION_CATEGORY).map(([k, v]) => [
        v as string,
        PrivationCategoryLabels[k as keyof typeof PrivationCategoryLabels],
    ]),
);

/**
 * An ongoing condition affecting a character.
 *
 * Afflictions represent diseases, poisons, curses, madness, and other
 * persistent conditions that impair a character over time. Each affliction
 * tracks:
 *
 * - **level** — Severity of the affliction, as a {@link ValueModifier}
 * - **healingRate** — Rate of natural recovery (−1 indicates no natural healing)
 * - **contagionIndex** — Risk of transmission to others
 * - **transmission** — Mode of spread (contact, airborne, ingestion, etc.)
 * - **isDormant** — Whether the affliction is currently inactive
 * - **isTreated** — Whether medical treatment has been applied
 *
 * Afflictions support a full medical workflow through intrinsic actions:
 * diagnosis, treatment, healing, course progression (worsening/improving),
 * fatigue effects, morale/fear impacts, and contagion transmission.
 *
 * Afflictions are categorized by {@link AfflictionData.subType | subType}
 * (Disease, Poison, Madness, etc.) and are typically attached to Beings
 * or Cohorts.
 *
 * @typeParam TData - The Affliction data interface.
 */
export class AfflictionLogic<
    TData extends AfflictionData = AfflictionData,
> extends SohlItemBaseLogic<TData> {
    /** Whether the affliction is currently inactive (but possibly still contagious). */
    isDormant!: boolean;
    /** Whether medical treatment has been applied. */
    isTreated!: boolean;
    /**
     * Bonus to treatment tests earned from a successful diagnosis, as a
     * {@link ValueModifier}, seeded from {@link AfflictionData.diagnosisBonusBase}.
     */
    diagnosisBonus!: ValueModifier;
    /**
     * Effective severity of the affliction, as a {@link ValueModifier}, seeded
     * from {@link AfflictionData.levelBase}.
     */
    level!: ValueModifier;
    /**
     * Rate of natural recovery, as a {@link ValueModifier}, seeded from
     * {@link AfflictionData.healingRateBase}. A base of `-1` disables the
     * modifier, indicating the affliction does not heal naturally.
     */
    healingRate!: ValueModifier;
    /**
     * Risk of transmitting this affliction to others, as a {@link ValueModifier},
     * seeded from {@link AfflictionData.contagionIndexBase}.
     */
    contagionIndex!: ValueModifier;
    /**
     * Mode by which this affliction spreads, copied from
     * {@link AfflictionData.transmission}; defaults to
     * {@link AFFLICTION_TRANSMISSION | NONE}.
     */
    transmission!: AfflictionTransmission;

    /**
     * Localized qualitative label for the current effective level.
     *
     * For `FEAR` and `MORALE` subtypes the level (0–5) maps to a named
     * severity (Brave, Steady, Afraid/Withdrawing, Terrified/Routed,
     * Catatonic). Other subtypes return the numeric level as a string.
     */
    get levelLabel(): string {
        const lvl = Math.max(0, Math.round(this.level.effective));
        if (this.data.subType === AFFLICTION_SUBTYPE.FEAR && isFearLevel(lvl)) {
            return sohl.i18n.localize(FEAR_LABEL_BY_LEVEL[lvl]);
        }
        if (
            this.data.subType === AFFLICTION_SUBTYPE.MORALE &&
            isMoraleLevel(lvl)
        ) {
            return sohl.i18n.localize(MORALE_LABEL_BY_LEVEL[lvl]);
        }
        return String(lvl);
    }

    /**
     * Localized qualitative label for the current sub-category.
     *
     * For `FATIGUE` and `PRIVATION` subtypes the `category` field is
     * expected to be one of {@link FATIGUE_CATEGORY} or
     * {@link PRIVATION_CATEGORY} respectively. Other subtypes return the
     * raw category string (or an empty string if unset).
     */
    get categoryLabel(): string {
        const cat = this.data.category;
        if (!cat) return "";
        if (
            this.data.subType === AFFLICTION_SUBTYPE.FATIGUE &&
            isFatigueCategory(cat)
        ) {
            return sohl.i18n.localize(FATIGUE_LABEL_BY_CATEGORY[cat]);
        }
        if (
            this.data.subType === AFFLICTION_SUBTYPE.PRIVATION &&
            isPrivationCategory(cat)
        ) {
            return sohl.i18n.localize(PRIVATION_LABEL_BY_CATEGORY[cat]);
        }
        return cat;
    }

    /**
     * Whether this affliction can currently be transmitted to another actor.
     *
     * @remarks Not yet implemented; always returns `true`.
     */
    get canTransmit(): boolean {
        // TODO(#67) - Implement Affliction canTransmit
        return true;
    }

    /**
     * Whether an actor can currently contract this affliction.
     *
     * @remarks Not yet implemented; always returns `true`.
     */
    get canContract(): boolean {
        // TODO(#67) - Implement Affliction canContract
        return true;
    }

    /**
     * Whether this affliction has a progressive course (i.e. can worsen or
     * improve over time via course tests).
     *
     * @remarks Not yet implemented; always returns `true`.
     */
    get hasCourse(): boolean {
        // TODO(#67) - Implement Affliction hasCourse
        return true;
    }

    /**
     * Whether this affliction can currently be treated.
     *
     * @remarks Not yet implemented; always returns `true`.
     */
    get canTreat(): boolean {
        // TODO(#67) - Implement Affliction canTreat
        return true;
    }

    /**
     * Whether this affliction can currently be healed.
     *
     * @remarks Not yet implemented; always returns `true`.
     */
    get canHeal(): boolean {
        // TODO(#67) - Implement Affliction canHeal
        return true;
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Attempt to transmit this affliction from its bearer to another actor.
     *
     * @param context - The action context for the transmission.
     * @remarks Not yet implemented; currently only logs a warning.
     */
    async transmit(context: SohlActionContext): Promise<void> {
        const {
            type = `affliction-${this.name}-transmit`,
            title = `${this.label} Transmit`,
        } = context;
        // TODO(#68) - Affliction Transmit
        sohl.log.warn("Affliction Transmit Not Implemented");
    }

    /**
     * Roll the test that determines whether an exposed actor contracts this
     * affliction.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @throws Always — not yet implemented.
     */
    async contractTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-contract-test`,
            title = `${this.label} Contract Test`,
        } = context;

        // TODO(#68) - Affliction Contract Test
        throw new Error("Affliction Contract Test Not Implemented");
    }

    /**
     * Roll the test that advances the affliction's course, determining whether
     * it worsens, holds, or improves over a time interval.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @throws Always — not yet implemented.
     */
    async courseTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-course-test`,
            title = `${this.label} Course Test`,
        } = context;

        // TODO(#68) - Affliction Course Test
        throw new Error("Affliction Course Test Not Implemented");
    }

    /**
     * Roll the diagnosis test, which (on success) identifies the affliction and
     * grants a {@link diagnosisBonus} toward subsequent treatment.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @throws Always — not yet implemented.
     */
    async diagnosisTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-diagnosis-test`,
            title = `${this.label} Diagnosis Test`,
        } = context;

        // TODO(#68) - Affliction Diagnosis Test
        throw new Error("Affliction Diagnosis Test Not Implemented");
    }

    /**
     * Roll the treatment test, applying medical care to the affliction (and
     * marking it {@link isTreated} on success).
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @throws Always — not yet implemented.
     */
    async treatmentTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-treatment-test`,
            title = `${this.label} Treatment Test`,
        } = context;

        // TODO(#68) - Affliction Treatment Test
        throw new Error("Affliction Treatment Test Not Implemented");
    }

    /**
     * Roll the healing test, which resolves natural recovery from the affliction
     * over a time interval.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @throws Always — not yet implemented.
     */
    async healingTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-healing-test`,
            title = `${this.label} Healing Test`,
        } = context;

        // TODO(#68) - Affliction Healing Test
        throw new Error("Affliction Healing Test Not Implemented");
    }

    /**
     * Roll the fatigue test for a fatigue-subtype affliction.
     *
     * Intrinsic-action executor for the `fatiguetest` action.
     *
     * @param _context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; warns and returns `null`.
     */
    async fatigueTest(
        _context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        // TODO(#68) - Affliction Fatigue Test
        sohl.log.uiWarn("Affliction Fatigue Test is not yet implemented.");
        return null;
    }

    /**
     * Roll the morale test for a morale-subtype affliction.
     *
     * Intrinsic-action executor for the `moraletest` action.
     *
     * @param _context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; warns and returns `null`.
     */
    async moraleTest(
        _context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        // TODO(#68) - Affliction Morale Test
        sohl.log.uiWarn("Affliction Morale Test is not yet implemented.");
        return null;
    }

    /**
     * Roll the fear test for a fear-subtype affliction.
     *
     * Intrinsic-action executor for the `feartest` action.
     *
     * @param _context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; warns and returns `null`.
     */
    async fearTest(
        _context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        // TODO(#68) - Affliction Fear Test
        sohl.log.uiWarn("Affliction Fear Test is not yet implemented.");
        return null;
    }

    /**
     * Define and return all intrinsic actions for this logic type.
     * @returns A map of action shortcodes to their definitions
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlItemBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "transmitaffliction",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.transmitaffliction.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-drowning",
                executor: "transmit",
                visible: "item.logic.canTransmit",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "contractafflictiontest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.contractafflictiontest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-vomiting",
                executor: "contractTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "coursetest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.coursetest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-heart-beats",
                executor: "courseTest",
                // FIXME(#65): original gated on actor's endurance and item.system.isDormant;
                // reduced to "true" pending a proper implementation.
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "fatiguetest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.fatigetest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-sleepy",
                executor: "fatigueTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "moraletest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.moraletest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-rally-the-troops",
                executor: "moraleTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "feartest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.fearTest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-terror",
                executor: "fearTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "treatmenttest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.treatmentTest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-caduceus",
                executor: "treatmentTest",
                // FIXME(#65): original gated on actor's "pysn" skill and item.system.isBleeding;
                // reduced to "true" pending a proper implementation.
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "diagnosistest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.DIAGNOSISTEST",
                iconFAClass: "sohl-stethoscope",
                executor: "diagnosisTest",
                visible: "defined(item) && !item.system.isTreated",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "healingtest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.HEALINGTEST",
                iconFAClass: "sohl-healing",
                executor: "healingTest",
                // FIXME(#65): original gated on actor's endurance and item.system.isBleeding;
                // reduced to "true" pending a proper implementation.
                visible: "true",
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
        this.isDormant = false;
        this.isTreated = false;
        this.diagnosisBonus = new entity.ValueModifier(this);
        this.level = new entity.ValueModifier(this);
        this.healingRate = new entity.ValueModifier(this);
        this.contagionIndex = new entity.ValueModifier(this);
        this.transmission = AFFLICTION_TRANSMISSION.NONE;

        this.healingRate = new entity.ValueModifier(this);
        if (this.data.healingRateBase === -1) {
            this.healingRate.disabled = "No Healing Rate";
        } else {
            this.healingRate.base = this.data.healingRateBase;
        }
        this.contagionIndex = new entity.ValueModifier(
            { baseValue: this.data.contagionIndexBase },
            { parent: this },
        );
        this.level = new entity.ValueModifier(
            { baseValue: this.data.levelBase },
            { parent: this },
        );
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

/**
 * Persisted data model for an {@link AfflictionLogic | Affliction} item.
 *
 * @typeParam TLogic - The logic class bound to this data.
 * @remarks The shape of `system` on a `affliction` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "affliction"`. The backing DataModel implements this interface.
 */
export interface AfflictionData<
    TLogic extends AfflictionLogic<AfflictionData> = AfflictionLogic<any>,
> extends SohlItemData<TLogic> {
    /** Affliction category (Disease, Poison, Fatigue, etc.) */
    subType: AfflictionSubType;
    /** Additional sub-categorization within the affliction type */
    category: string;
    /** Whether the affliction is inactive but potentially contagious */
    isDormant: boolean;
    /** Whether medical treatment has been applied */
    isTreated: boolean;
    /** Modifier to treatment tests from successful diagnosis */
    diagnosisBonusBase: number;
    /** Severity of the affliction */
    levelBase: number;
    /** Rate of natural recovery; -1 means no natural healing */
    healingRateBase: number;
    /** Risk of transmitting this affliction to others */
    contagionIndexBase: number;
    /** How this affliction spreads (Contact, Airborne, etc.) */
    transmission: AfflictionTransmission;
}
