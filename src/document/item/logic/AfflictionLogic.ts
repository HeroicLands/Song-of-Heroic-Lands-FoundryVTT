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
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { fvttWorldTime } from "@src/core/FoundryHelpers";
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
    ATTRIBUTE_CODE,
    defineType,
    FATIGUE_CATEGORY,
    FatigueCategoryLabels,
    FEAR_LEVEL,
    FearLevelLabels,
    isFatigueCategory,
    isFearLevel,
    isMoraleLevel,
    isPrivationCategory,
    ITEM_KIND,
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
 * - **level** — Severity of the affliction, as a {@link sohl.entity.modifier.ValueModifier}
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
    /**
     * Whether medical treatment has been applied. Derived: true when a
     * {@link AfflictionData.treatmentDate | treatmentDate} is set.
     */
    get isTreated(): boolean {
        return this.data.treatmentDate != null;
    }
    /**
     * Bonus to treatment tests earned from a successful diagnosis, as a
     * {@link sohl.entity.modifier.ValueModifier}, seeded from {@link AfflictionData.diagnosisBonusBase}.
     */
    diagnosisBonus!: ValueModifier;
    /**
     * Effective severity of the affliction, as a {@link sohl.entity.modifier.ValueModifier}, seeded
     * from {@link AfflictionData.levelBase}.
     */
    level!: ValueModifier;
    /**
     * Rate of natural recovery, as a {@link sohl.entity.modifier.ValueModifier}, seeded from
     * {@link AfflictionData.healingRateBase}. A base of `-1` disables the
     * modifier, indicating the affliction does not heal naturally.
     */
    healingRate!: ValueModifier;
    /**
     * Risk of transmitting this affliction to others, as a {@link sohl.entity.modifier.ValueModifier},
     * seeded from {@link AfflictionData.contagionIndexBase}.
     */
    contagionIndex!: ValueModifier;
    /**
     * Effective seconds of incubation (contract → onset), as a
     * {@link sohl.entity.modifier.ValueModifier}, seeded from
     * {@link AfflictionData.onsetDurationBase}.
     */
    onsetDurationBase!: ValueModifier;
    /**
     * Effective seconds between course/recovery checks, as a
     * {@link sohl.entity.modifier.ValueModifier}, seeded from
     * {@link AfflictionData.healingCheckDurationBase}.
     */
    healingCheckDurationBase!: ValueModifier;
    /**
     * Effective seconds from onset to resolution, as a
     * {@link sohl.entity.modifier.ValueModifier}, seeded from
     * {@link AfflictionData.resolutionDurationBase}.
     */
    resolutionDurationBase!: ValueModifier;
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
        // `level` is a ValueModifier seeded in initialize(); guard against it
        // being unset (a not-yet-initialized affliction, e.g. freshly dropped
        // and read by the sheet before its lifecycle runs) so this getter can
        // never throw and brick the whole sheet render (#511).
        const lvl = Math.max(0, Math.round(this.level?.effective ?? 0));
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
        return true;
    }

    /**
     * Whether an actor can currently contract this affliction.
     *
     * @remarks Not yet implemented; always returns `true`.
     */
    get canContract(): boolean {
        return true;
    }

    /**
     * Whether the bearer has a usable Endurance attribute — i.e. one is present
     * on the actor and its mastery level is not disabled.
     *
     * Endurance drives the course- and healing-test rolls, so those actions are
     * only offered when it is available. Mirrors the pre-port
     * `getTraitByAbbrev("end")` + `!$masteryLevel.disabled` gate.
     */
    private get hasUsableEndurance(): boolean {
        const endurance = this.actorLogic?.getItemLogic(
            ATTRIBUTE_CODE.ENDURANCE,
            ITEM_KIND.ATTRIBUTE,
        );
        return !!endurance && !endurance.masteryLevel.disabled;
    }

    /**
     * Whether this affliction has a progressive course (i.e. can worsen or
     * improve over time via course tests).
     *
     * True only while the affliction is active (not {@link AfflictionData.isDormant | dormant})
     * and the bearer has a usable Endurance attribute — the gate the pre-port
     * course test enforced.
     */
    get hasCourse(): boolean {
        return !this.data.isDormant && this.hasUsableEndurance;
    }

    /**
     * Whether this affliction can currently be treated.
     *
     * True until treatment has been applied (i.e. while {@link isTreated} is
     * false — derived from {@link AfflictionData.treatmentDate}) — the gate the
     * pre-port treatment test enforced. Afflictions have no bleeding concept
     * (that lives on Trauma), so treatment is not gated on any bleeding state.
     */
    get canTreat(): boolean {
        return !this.isTreated;
    }

    /**
     * Whether this affliction can currently be healed.
     *
     * True only when the affliction heals naturally (its {@link healingRate} is
     * not disabled) and the bearer has a usable Endurance attribute — the gate
     * the pre-port healing test enforced.
     */
    get canHeal(): boolean {
        // `healingRate` is seeded in initialize(); guard against reading it on a
        // not-yet-initialized affliction so this getter can't throw (#511 class).
        return !this.healingRate?.disabled && this.hasUsableEndurance;
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
                iconFAClass: "fa-solid fa-head-side-cough",
                executor: "transmit",
                visible: "itemLogic.canTransmit",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "contractafflictiontest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.contractafflictiontest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-face-vomit",
                executor: "contractTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "coursetest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.coursetest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-heart-pulse",
                executor: "courseTest",
                visible: "defined(itemLogic) && itemLogic.hasCourse",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "fatiguetest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.fatigetest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-face-downcast-sweat",
                executor: "fatigueTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "moraletest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.moraletest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-shield-heart",
                executor: "moraleTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "feartest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.fearTest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "far fa-face-scream",
                executor: "fearTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "treatmenttest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.treatmentTest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-staff-snake",
                executor: "treatmentTest",
                visible: "defined(itemLogic) && itemLogic.canTreat",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "diagnosistest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.DIAGNOSISTEST",
                iconFAClass: "fa-solid fa-stethoscope",
                executor: "diagnosisTest",
                visible: "defined(itemLogic) && !itemLogic.isTreated",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "healingtest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.HEALINGTEST",
                iconFAClass: "fa-solid fa-heart-pulse",
                executor: "healingTest",
                visible: "defined(itemLogic) && itemLogic.canHeal",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "onsetCheck",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.onsetCheck.title",
                iconFAClass: "fa-solid fa-hourglass",
                executor: "onsetCheck",
                visible: "false",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "healingCheck",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.healingCheck.title",
                iconFAClass: "fa-solid fa-heart-pulse",
                executor: "healingCheck",
                visible: "false",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "resolutionCheck",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.resolutionCheck.title",
                iconFAClass: "fa-solid fa-skull",
                executor: "resolutionCheck",
                visible: "false",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
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
        this.onsetDurationBase = new entity.ValueModifier(
            {},
            { parent: this },
        ).setBase(this.data.onsetDurationBase ?? 0);
        this.healingCheckDurationBase = new entity.ValueModifier(
            {},
            { parent: this },
        ).setBase(this.data.healingCheckDurationBase ?? 0);
        this.resolutionDurationBase = new entity.ValueModifier(
            {},
            { parent: this },
        ).setBase(this.data.resolutionDurationBase ?? 0);
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /**
     * Arm the affliction's phase events from its persisted anchors, by phase:
     *
     * - **Incubating** (`onsetDate == null`): schedule the `onsetCheck`
     *   transition at `contractDate + onset interval`.
     * - **Symptomatic** (`onsetDate` set, `resolutionDate == null`): schedule the
     *   `resolutionCheck` transition at `onsetDate + resolution interval`, and —
     *   while the affliction persists — the recurring `healingCheck`.
     * - **Resolved** (`resolutionDate` set): unsubscribe all.
     */
    override finalize(): void {
        super.finalize();
        const uuid = this.item?.uuid;
        if (!uuid) return;

        const arm = (kind: string, at: number | null | undefined): void => {
            if (at == null) sohl.events.unsubscribe(uuid, kind);
            else sohl.events.scheduleAt(uuid, kind, at);
        };

        if (this.data.resolutionDate != null) {
            arm("onsetCheck", null);
            arm("resolutionCheck", null);
            arm("healingCheck", null);
            return;
        }

        if (this.data.onsetDate == null) {
            // Incubating: only the onset transition is pending.
            arm(
                "onsetCheck",
                this.data.contractDate == null ?
                    null
                :   this.data.contractDate + this.onsetDurationBase.effective,
            );
            arm("resolutionCheck", null);
            arm("healingCheck", null);
            return;
        }

        // Symptomatic: resolution pending; recovery checks recur while active.
        arm("onsetCheck", null);
        arm(
            "resolutionCheck",
            this.data.onsetDate + this.resolutionDurationBase.effective,
        );
        arm(
            "healingCheck",
            this.level.effective > 0 && this.data.lastHealingCheckDate != null ?
                this.data.lastHealingCheckDate +
                    this.healingCheckDurationBase.effective
            :   null,
        );
    }

    /**
     * Roll a duration formula to a number of seconds. Falls back to a plain
     * numeric parse, or `0` when neither yields a finite number.
     *
     * @param formula - The duration formula (dice expression or bare seconds).
     * @returns The rolled duration in seconds.
     */
    private rollDuration(formula: string): number {
        if (!formula) return 0;
        try {
            const rolled = SimpleRoll.fromFormula(formula, this).roll();
            if (Number.isFinite(rolled)) return rolled;
        } catch {
            // fall through to a numeric parse
        }
        const n = Number(formula);
        return Number.isFinite(n) ? n : 0;
    }

    /**
     * Intrinsic-action executor for the `onsetCheck` transition (incubation →
     * symptomatic). Crystallizes `onsetDate`, seeds the recovery-check anchor,
     * and rolls the resolution and healing-check intervals; {@link finalize}
     * then arms the resolution and recurring healing-check events.
     *
     * @param _context - The action context (its `scope` is the trigger context).
     * @returns A promise that resolves once the phase transition is persisted.
     * @remarks The onset **effect** (applying symptoms) is not yet implemented;
     *   see issue #488.
     */
    async onsetCheck(_context: SohlActionContext): Promise<void> {
        const now = fvttWorldTime();
        const resolution = this.rollDuration(
            this.data.resolutionDurationFormula,
        );
        const healing = this.rollDuration(
            this.data.healingCheckDurationFormula,
        );
        this.resolutionDurationBase.setBase(resolution);
        this.healingCheckDurationBase.setBase(healing);
        await this.item.update({
            "system.onsetDate": now,
            "system.lastHealingCheckDate": now,
            "system.resolutionDurationBase": resolution,
            "system.healingCheckDurationBase": healing,
        } as PlainObject);
    }

    /**
     * Intrinsic-action executor for the recurring `healingCheck` (course /
     * recovery) event. Advances the anchor to now, rolls the next interval, and
     * schedules the next occurrence — reusable from the event or manually.
     *
     * @param _context - The action context (its `scope` is the trigger context).
     * @returns A promise that resolves once the anchor is persisted.
     * @remarks The recovery/course **effect** (the check roll and its result) is
     *   not yet implemented; see issue #489.
     */
    async healingCheck(_context: SohlActionContext): Promise<void> {
        const now = fvttWorldTime();
        const rolled = this.rollDuration(this.data.healingCheckDurationFormula);
        this.healingCheckDurationBase.setBase(rolled);
        sohl.events.scheduleAt(
            this.item.uuid,
            "healingCheck",
            now + this.healingCheckDurationBase.effective,
        );
        await this.item.update({
            "system.lastHealingCheckDate": now,
            "system.healingCheckDurationBase": rolled,
        } as PlainObject);
    }

    /**
     * Intrinsic-action executor for the `resolutionCheck` transition
     * (symptomatic → resolved). Crystallizes `resolutionDate`; {@link finalize}
     * then unsubscribes the affliction's remaining events.
     *
     * @param _context - The action context (its `scope` is the trigger context).
     * @returns A promise that resolves once the resolution is persisted.
     * @remarks The resolution **effect** (death / disability / cure) is not yet
     *   implemented; see issue #490.
     */
    async resolutionCheck(_context: SohlActionContext): Promise<void> {
        await this.item.update({
            "system.resolutionDate": fvttWorldTime(),
        } as PlainObject);
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
    /** World-time (seconds) at which the affliction was contracted. */
    contractDate: number | null;
    /**
     * World-time (seconds) at which medical treatment was applied, or `null`
     * if untreated. `isTreated` is derived from this on the logic.
     */
    treatmentDate: number | null;
    /** Formula rolled to seed the incubation (contract → onset) interval. */
    onsetDurationFormula: string;
    /** Rolled seconds of incubation; `null` until rolled. */
    onsetDurationBase: number | null;
    /** World-time at which symptoms began (onset crystallized); `null` while incubating. */
    onsetDate: number | null;
    /** Formula rolled to seed the recurring course/recovery-check interval. */
    healingCheckDurationFormula: string;
    /** Rolled seconds between course/recovery checks; `null` until rolled. */
    healingCheckDurationBase: number | null;
    /** World-time of the last applied course/recovery check (the recurrence anchor). */
    lastHealingCheckDate: number | null;
    /** Formula rolled to seed the onset → resolution interval. */
    resolutionDurationFormula: string;
    /** Rolled seconds from onset to resolution; `null` until rolled. */
    resolutionDurationBase: number | null;
    /** World-time at which the affliction resolved (death/disability/cure); `null` until resolved. */
    resolutionDate: number | null;
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
