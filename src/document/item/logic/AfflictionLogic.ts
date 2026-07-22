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

import { entity } from "@src/entity/registry";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import {
    fvttWorldTime,
    fvttExecuteMacro,
    fvttCreateEmbeddedItems,
    fvttFindItemByShortcode,
} from "@src/core/FoundryHelpers";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import { elapsedCheckpoints } from "@src/entity/event/scheduling";
import { armScheduledActions } from "@src/entity/event/scheduled-actions";
import { offerSchedule } from "@src/document/item/logic/offer-schedule";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import type { TraumaData } from "@src/document/item/logic/TraumaLogic";
import {
    ACTION_SUBTYPE,
    AFFLICTION_OUTCOME,
    AFFLICTION_TRANSMISSION,
    AfflictionOutcome,
    AfflictionSubType,
    AfflictionTransmission,
    ATTRIBUTE_CODE,
    defineType,
    ITEM_KIND,
    MARGINAL_SUCCESS,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import { rollTimedTest } from "@src/document/item/logic/timed-test";
import { inflictWeaknessFatigue } from "@src/document/item/logic/fatigue";
import { SHOCK_STATE } from "@src/document/actor/logic/shock";
import {
    SohlItemBaseLogic,
    type SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";
import { SohlAction } from "@src/entity/action/SohlAction";

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
     * {@link AfflictionData.healingRateBase}. An unset (`null`) base disables the
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
     * Localized qualitative label for the current effective level — the numeric
     * level as a string.
     *
     * @remarks The named-severity subtypes (fear, morale) are now
     * {@link sohl.document.item.logic.TraumaLogic | traumas}; on afflictions
     * (disease, poison/toxin, other) the level has no named severity.
     */
    get levelLabel(): string {
        // `level` is a ValueModifier seeded in initialize(); guard against it
        // being unset (a not-yet-initialized affliction, e.g. freshly dropped
        // and read by the sheet before its lifecycle runs) so this getter can
        // never throw and brick the whole sheet render (#511).
        const lvl = Math.max(0, Math.round(this.level?.effective ?? 0));
        return String(lvl);
    }

    /**
     * Localized qualitative label for the current sub-category — the raw
     * `category` string (empty when unset).
     *
     * @remarks The categorized subtypes (fatigue) are now
     * {@link sohl.document.item.logic.TraumaLogic | traumas}; on afflictions the
     * category carries no named sub-category.
     */
    get categoryLabel(): string {
        return this.data.category || "";
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
                recordsLastRun: true,
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
        this.contagionIndex = new entity.ValueModifier(this);
        this.transmission = AFFLICTION_TRANSMISSION.NONE;

        this.healingRate = new entity.ValueModifier(this);
        if (this.data.healingRateBase == null) {
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
     * Re-arm the affliction's persisted schedules into the event queue on every
     * preparation, on every client (issue #588 generic store; #579 consent). The
     * phase machine's arming now lives in the executors: `onsetCheck` schedules
     * the resolution and recurring healing-check events at onset and clears
     * itself; `resolutionCheck` clears the rest at resolution; the recurring
     * `healingCheck` *offers* its own reschedule. `finalize()` therefore only
     * restores whatever `system.scheduledActions` currently holds — a reschedule
     * `update()` replicates, every client re-preps, and this generic re-arm
     * restores the queue (the active GM's included, which alone fires).
     */
    override finalize(): void {
        super.finalize();
        const uuid = this.item?.uuid;
        if (!uuid) return;
        armScheduledActions(uuid, this.data.scheduledActions, sohl.events);
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
     * symptomatic). Crystallizes `onsetDate`, rolls the resolution and
     * healing-check intervals, and schedules the next-phase events — the
     * one-shot `resolutionCheck` and the recurring `healingCheck` — then clears
     * the spent `onsetCheck` schedule.
     *
     * @param _context - The action context (its `scope` is the trigger context).
     * @returns A promise that resolves once the phase transition is persisted.
     * @remarks The onset **effect** marks the affliction symptomatic (crystallizes
     *   `onsetDate`) and starts its course/resolution cycle; the symptoms
     *   themselves are role-played, out of VTT scope (#488). Scheduling the next
     *   phase is the direct consequence of this human-performed transition (issue
     *   #579 gates the *firing* via the `[Perform]` reminder, not the phase
     *   progression itself). An optional author
     *   {@link AfflictionData.onsetMacroUuid | onset Macro} then runs and may
     *   schedule further events.
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
            "system.resolutionDurationBase": resolution,
            "system.healingCheckDurationBase": healing,
        } as PlainObject);

        // Advance the schedule: the one-shot resolution and the recurring healing
        // check arm now (anchored at onset); the spent onset check is cleared.
        await sohl.schedule(this.item, "resolutionCheck", resolution);
        await sohl.schedule(this.item, "healingCheck", healing);
        await sohl.unschedule(this.item, "onsetCheck");

        // Optional author hook run once at onset. A Macro reference (never
        // source); it may schedule further events. Runs after onset is persisted
        // so the macro sees the symptomatic affliction.
        if (this.data.onsetMacroUuid) {
            await fvttExecuteMacro(this.data.onsetMacroUuid, {
                affliction: this,
                actor: this.actorLogic,
            });
        }
    }

    /**
     * Intrinsic-action executor for the recurring `healingCheck` (course /
     * recovery) event. Catches up the Course Test over every elapsed interval,
     * rolls the next interval, then **offers** the next occurrence (issue #579) —
     * reusable from the `[Perform]` reminder, the timed event, or manually.
     *
     * @param context - The action context; `scope.schedule` (or the offer
     *   dialog) decides whether the next occurrence is scheduled.
     * @returns A promise that resolves once the outcome and schedule are persisted.
     * @remarks Applies the **Course Test** (#489) at each elapsed checkpoint (only
     *   for a naturally-healing affliction). Each is a headless test of
     *   `Healing Base × Healing Rate` that changes the affliction's Healing Rate
     *   (CF −2, MF −1, MS +1, CS +2); the resulting HR then drives the host's
     *   **Reaction**: HR 6+ the affliction is defeated (course stops), HR 5 / 4
     *   inflict 5 / 10 weakness fatigue, and HR 3 / 2 / 1 / &lt;1 impose Stunned /
     *   Incapacitated / Unconscious / Dead shock (never improving an already-worse
     *   shock state). The recurrence anchor and interval are read from the
     *   persisted `system.scheduledActions` entry; a **defeated** affliction (HR
     *   6+) ends the recurrence, otherwise the next check is **offered** (issue
     *   #579) rather than auto-re-armed.
     */
    async healingCheck(context: SohlActionContext): Promise<void> {
        const uuid = this.item?.uuid;
        if (!uuid) return;
        const now = fvttWorldTime();
        const entry = this.data.scheduledActions?.find(
            (e) => e.actionName === "healingCheck",
        );
        const interval =
            entry?.interval ?? this.healingCheckDurationBase.effective;
        const anchor = entry?.anchor ?? now;
        const checkpoints =
            interval > 0 ? elapsedCheckpoints(anchor, now, interval) : [];

        // Course Test at each elapsed checkpoint, in sequence (each adjusts the
        // Healing Rate the next one sees). Only a naturally-healing affliction
        // fights its course; it stops once defeated (HR 6+).
        let hr = this.data.healingRateBase ?? 0;
        if (this.canHeal) {
            for (let i = 0; i < checkpoints.length && hr < 6; i++) {
                const sl = await this.rollCourseTest(hr);
                if (sl == null) break; // roll refused
                // Change to Healing Rate: CF −2, MF −1, MS +1, CS +2.
                hr += sl < MARGINAL_SUCCESS ? sl - 1 : sl;
                await this.applyReaction(hr);
            }
        }

        const nextInterval = this.rollDuration(
            this.data.healingCheckDurationFormula,
        );
        this.healingCheckDurationBase.setBase(nextInterval);
        await this.item.update({
            "system.healingRateBase": hr,
            "system.healingCheckDurationBase": nextInterval,
        } as PlainObject);

        // A defeated affliction (HR 6+) ends its recurring course; otherwise offer
        // the next course check rather than auto-re-arming (issue #579).
        if (hr >= 6) await sohl.unschedule(this.item, "healingCheck");
        else
            await offerSchedule(
                context,
                this.item,
                "healingCheck",
                nextInterval,
            );
    }

    /**
     * Roll one headless **Course Test** — `Healing Base × Healing Rate` (Healing
     * Base from the owning being, Healing Rate the affliction's current `hr`) —
     * and return the normalized success level (−1/0/1/2), or `null` if the roll
     * was refused.
     *
     * @param hr - The affliction's current Healing Rate.
     * @returns The normalized success level, or `null`.
     */
    private async rollCourseTest(hr: number): Promise<number | null> {
        const healingBase =
            (this.actorLogic as any)?.healingBase?.effective ?? 0;
        const result = await rollTimedTest(
            this,
            healingBase * Math.max(0, hr),
            {
                noChat: true,
                type: "affliction-coursetest",
                title: sohl.i18n.localize(
                    "SOHL.Affliction.Action.healingCheck.title",
                ),
            },
        );
        return result ? result.normSuccessLevel : null;
    }

    /**
     * Apply the host's **Reaction** to the affliction's current Healing Rate
     * `hr`: HR 6+ is defeat (no reaction — the course loop stops); HR 5 / 4
     * inflict 5 / 10 weakness fatigue; HR 3 / 2 / 1 / &lt;1 impose Stunned /
     * Incapacitated / Unconscious / Dead shock, worsening the being's shock state
     * to at least that level (never improving it).
     *
     * @param hr - The affliction's current Healing Rate.
     * @returns A promise that resolves once the reaction is applied.
     */
    private async applyReaction(hr: number): Promise<void> {
        if (hr >= 6) return; // defeated
        if (hr === 5 || hr === 4) {
            await inflictWeaknessFatigue(
                this.actorLogic,
                hr === 5 ? 5 : 10,
                this.name,
            );
            return;
        }
        const being = this.actorLogic as any;
        const level =
            hr === 3 ? SHOCK_STATE.STUNNED
            : hr === 2 ? SHOCK_STATE.INCAPACITATED
            : hr === 1 ? SHOCK_STATE.UNCONSCIOUS
            : SHOCK_STATE.DEAD;
        await being?.setShockState?.(Math.max(being?.shockState ?? 0, level));
    }

    /**
     * Intrinsic-action executor for the `resolutionCheck` transition
     * (symptomatic → resolved). Crystallizes `resolutionDate` and clears the
     * affliction's remaining schedules (the recurring healing check and this
     * one-shot resolution) — resolution is terminal.
     *
     * @param _context - The action context (its `scope` is the trigger context).
     * @returns A promise that resolves once the resolution is persisted.
     * @remarks Crystallizes `resolutionDate` and, when the affliction was **not**
     *   defeated (Healing Rate below 6), applies its authored **outcome** (#490):
     *   `DEATH` sets the being's shock state to Dead; `CURED` sets Healing Rate to
     *   6. Either combines with an optional `outcomeTrauma`
     *   {@link sohl.entity.expr.SafeExpression} whose result — a trauma shortcode
     *   or array of them — is contracted as new trauma(s) (searched world-first,
     *   then compendiums).
     */
    async resolutionCheck(_context: SohlActionContext): Promise<void> {
        await this.item.update({
            "system.resolutionDate": fvttWorldTime(),
        } as PlainObject);
        // Resolution is terminal — clear the recurring healing check and this
        // one-shot resolution schedule.
        await sohl.unschedule(this.item, "healingCheck");
        await sohl.unschedule(this.item, "resolutionCheck");
        // The outcome applies only if the affliction reached resolution without
        // being defeated (HR 6+).
        if ((this.data.healingRateBase ?? 0) >= 6) return;
        await this.applyOutcome();
    }

    /**
     * Apply the affliction's authored outcome and optional outcome trauma(s).
     * @returns A promise that resolves once the outcome is applied.
     */
    private async applyOutcome(): Promise<void> {
        if (this.data.outcome === AFFLICTION_OUTCOME.DEATH) {
            await (this.actorLogic as any)?.setShockState?.(SHOCK_STATE.DEAD);
        } else if (this.data.outcome === AFFLICTION_OUTCOME.CURED) {
            await this.item.update({
                "system.healingRateBase": 6,
            } as PlainObject);
        }
        if (this.data.outcomeTrauma) {
            await this.contractOutcomeTraumas();
        }
    }

    /**
     * Evaluate the `outcomeTrauma` SafeExpression to a shortcode (or array of
     * shortcodes), resolve each to a trauma template (world items first, then
     * compendiums), and create the matches on the host.
     * @returns A promise that resolves once any outcome traumas are created.
     */
    private async contractOutcomeTraumas(): Promise<void> {
        const value = new SafeExpression(
            { source: this.data.outcomeTrauma },
            { parent: this },
        ).evaluate({});
        const shortcodes = (Array.isArray(value) ? value : [value])
            .map((v) => String(v))
            .filter(Boolean);
        const created: PlainObject[] = [];
        for (const code of shortcodes) {
            const data = await fvttFindItemByShortcode(code);
            if (data) created.push(data);
            else
                sohl.log.warn(
                    `Affliction outcomeTrauma: no item found with shortcode "${code}"`,
                );
        }
        if (created.length) {
            await fvttCreateEmbeddedItems(this.actorLogic, created);
        }
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
    /**
     * UUID of an optional author Macro run when the affliction becomes
     * symptomatic at onset (a reference, never source). May schedule further
     * events. Blank means no onset macro.
     */
    onsetMacroUuid: string;
    /**
     * The authored outcome applied at resolution when the affliction was not
     * defeated — an `AFFLICTION_OUTCOME` value (`DEATH` or `CURED`).
     */
    outcome: AfflictionOutcome;
    /**
     * Optional {@link sohl.entity.expr.SafeExpression} source evaluating to a
     * trauma shortcode — or an array of shortcodes — the host contracts as part
     * of the outcome. Blank means none; combines with {@link outcome}.
     */
    outcomeTrauma: string;
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
    /** Rate of natural recovery; `null` means no natural healing */
    healingRateBase: number | null;
    /** Risk of transmitting this affliction to others */
    contagionIndexBase: number;
    /** How this affliction spreads (Contact, Airborne, etc.) */
    transmission: AfflictionTransmission;
}
