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

import type { ValueModifier } from "@src/common/modifier/ValueModifier";
import type { SohlActionContext } from "@src/common/SohlActionContext";
import type { SuccessTestResult } from "@src/common/result/SuccessTestResult";
import type { InjuryData } from "@src/common/item/logic/InjuryLogic";
import {
    ACTION_SUBTYPE,
    AFFLICTION_TRANSMISSION,
    AfflictionHealRate,
    AfflictionSubType,
    AfflictionTransmission,
    defineType,
    getContextItem,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import {
    SohlItemBaseLogic,
    SohlItemData,
} from "@src/common/item/foundry/SohlItem";
import { serializeFn } from "@src/utils/helpers";
import { ActionData } from "@src/common/item/logic/ActionLogic";

/**
 * Logic for the **Affliction** item type — an ongoing condition affecting
 * a character.
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
    isDormant!: boolean;
    isTreated!: boolean;
    diagnosisBonus!: ValueModifier;
    level!: ValueModifier;
    healingRate!: ValueModifier;
    contagionIndex!: ValueModifier;
    transmission!: AfflictionTransmission;

    get canTransmit(): boolean {
        // TODO - Implement Affliction canTransmit
        return true;
    }

    get canContract(): boolean {
        // TODO - Implement Affliction canContract
        return true;
    }

    get hasCourse(): boolean {
        // TODO - Implement Affliction hasCourse
        return true;
    }

    get canTreat(): boolean {
        // TODO - Implement Affliction canTreat
        return true;
    }

    get canHeal(): boolean {
        // TODO - Implement Affliction canHeal
        return true;
    }

    async transmit(context: SohlActionContext): Promise<void> {
        const {
            type = `affliction-${(this.item as any)?.name}-transmit`,
            title = `${this.label} Transmit`,
        } = context;
        // TODO - Affliction Transmit
        sohl.log.warn("Affliction Transmit Not Implemented");
    }

    async contractTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-contract-test`,
            title = `${this.label} Contract Test`,
        } = context;

        // TODO - Affliction Contract Test
        throw new Error("Affliction Contract Test Not Implemented");
    }

    async courseTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-course-test`,
            title = `${this.label} Course Test`,
        } = context;

        // TODO - Affliction Course Test
        throw new Error("Affliction Course Test Not Implemented");
    }

    async diagnosisTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-diagnosis-test`,
            title = `${this.label} Diagnosis Test`,
        } = context;

        // TODO - Affliction Diagnosis Test
        throw new Error("Affliction Diagnosis Test Not Implemented");
    }

    async treatmentTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-treatment-test`,
            title = `${this.label} Treatment Test`,
        } = context;

        // TODO - Affliction Treatment Test
        throw new Error("Affliction Treatment Test Not Implemented");
    }

    async healingTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-healing-test`,
            title = `${this.label} Healing Test`,
        } = context;

        // TODO - Affliction Healing Test
        throw new Error("Affliction Healing Test Not Implemented");
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.isDormant = false;
        this.isTreated = false;
        this.diagnosisBonus = new sohl.modifier.Value({}, { parent: this });
        this.level = new sohl.modifier.Value({}, { parent: this });
        this.healingRate = new sohl.modifier.Value({}, { parent: this });
        this.contagionIndex = new sohl.modifier.Value({}, { parent: this });
        this.transmission = AFFLICTION_TRANSMISSION.NONE;

        this.healingRate = new sohl.modifier.Value(this);
        if (this.data.healingRateBase === -1) {
            this.healingRate.disabled = "No Healing Rate";
        } else {
            this.healingRate.base = this.data.healingRateBase;
        }
        this.contagionIndex = new sohl.modifier.Value(this, {
            base: this.data.contagionIndexBase,
        });
        this.level = new sohl.modifier.Value(this, {
            base: this.data.levelBase,
        });
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

/**
 * The intrinsic actions available to Affliction items.
 * This structure should correspond to the methods on the
 * Affliction class that can be invoked as intrinsic actions.
 */
export const {
    kind: AFFLICTION_INTRINSIC_ACTION,
    values: AfflictionIntrinsicActions,
    isValue: isAfflictionIntrinsicAction,
    labels: AfflictionIntrinsicActionLabels,
} = defineType("SOHL.Affliction.INTRINSIC_ACTION", {
    TRANSMITAFFLICTION: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.transmitaffliction.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-head-side-cough",
        executor: "transmitAffliction",
        visible: serializeFn((header: HTMLElement) => {
            const item = getContextItem(header);
            return (item?.logic as AfflictionLogic).canTransmit;
        }),
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    CONTRACTAFFLICTIONTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.contractafflictiontest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-virus",
        executor: "contractAfflictionTest",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    COURSETTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.coursetest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-heart-pulse",
        executor: "courseTest",
        visible: serializeFn((header: HTMLElement) => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     SohlContextMenu._getContextItem(header),
            // );
            // if (item?.system.isDormant) return false;
            // const endurance = item?.actor?.getTraitByAbbrev("end");
            // return endurance && !endurance.system.$masteryLevel.disabled;
        }),
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    FATIGUETEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.fatigetest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-face-downcast-sweat",
        executor: "fatigueTest",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    MORALETEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.moraletest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "far fa-people-group",
        executor: "moraleTest",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    FEARTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.fearTest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "far fa-face-scream",
        executor: "fearTest",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    TREATMENTTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.treatmentTest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-staff-snake",
        executor: "treatmentTest",
        visible: serializeFn((header: HTMLElement) => {
            void header;
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     SohlContextMenu._getContextItem(header),
            // );
            // if (item?.system.isBleeding) return false;
            // const physician = item?.actor?.getSkillByAbbrev("pysn");
            // return physician && !physician.system.$masteryLevel.disabled;
        }),
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    DIAGNOSISTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.DIAGNOSISTEST",
        iconFAClass: "fas fa-stethoscope",
        executor: "diagnosisTest",
        visible: serializeFn((header: HTMLElement) => {
            const item = getContextItem(header);
            return !!item && !(item.system as InjuryData).isTreated;
        }),
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    HEALINGTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.HEALINGTEST",
        iconFAClass: "fas fa-heart-pulse",
        executor: "healingTest",
        visible: serializeFn((header: HTMLElement) => {
            // FIXME: This is a temporary fix to allow opposed tests to be
            // started from the item header. It should be replaced with a
            // proper implementation that allows opposed tests to be started
            // from any item in the context menu.
            return true;
            // const item = cast<BaseItem>(
            //     SohlContextMenu._getContextItem(header),
            // );
            // if (item?.system.isBleeding) return false;
            // const endurance = item?.actor?.getTraitByAbbrev("end");
            // return endurance && !endurance.system.$masteryLevel.disabled;
        }),
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
} as StrictObject<Partial<ActionData>>);
