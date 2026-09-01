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
    fvttCreateEmbeddedEffects,
    fvttFindItemByShortcode,
    dialog,
} from "@src/core/FoundryHelpers";
import { toFilePath, toHTMLString } from "@src/utils/helpers";
// `postActionCard` builds a card's data and `SELF_HANDLER` is a plain string
// sentinel — neither touches a Foundry global at module scope, but the import
// boundary rule can't tell them apart from the Foundry-coupled files under
// `document/chat/`, so allow these two.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { postActionCard } from "@src/document/chat/action-card";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { SELF_HANDLER } from "@src/document/chat/chat-card-dispatch";
import {
    COURSE_DEFEATED_HR,
    courseHrDelta,
    courseOutcomeFor,
    type CourseOutcome,
} from "@src/document/item/logic/affliction-course";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import { expressionScopes } from "@src/entity/expr/ExpressionScopeRegistry";
import { armScheduledActions, scheduledFireAt } from "@src/entity/event/scheduled-actions";
import { offerSchedule } from "@src/document/item/logic/offer-schedule";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { UNTREATED, type TraumaData } from "@src/document/item/logic/TraumaLogic";
import {
    ACTION_SUBTYPE,
    AFFLICTION_EFFECT_KEY,
    AFFLICTION_OUTCOME,
    AFFLICTION_TRANSMISSION,
    AfflictionOutcome,
    AfflictionOutcomeChoices,
    isAfflictionOutcome,
    AfflictionSubType,
    AfflictionTransmission,
    ATTRIBUTE_CODE,
    defineType,
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    FATIGUE_CATEGORY,
    MARGINAL_SUCCESS,
    ITEM_KIND,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    TRAUMA_SUBTYPE,
} from "@src/utils/constants";
import { rollTimedTest } from "@src/document/item/logic/timed-test";
import { SHOCK_STATE, shockStateLabelKey } from "@src/document/actor/logic/shock";
import { SohlItemBaseLogic, type SohlItemData } from "@src/document/item/logic/SohlItemBaseLogic";
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
     * The target value of the affliction's **Course Test**, as a
     * {@link sohl.entity.modifier.ValueModifier}. Its base is
     * `Healing Rate × Healing Base`; Active Effects keyed
     * {@link AFFLICTION_EFFECT_KEY | COURSE} (`mod:logic.course`) modify it — a
     * treatment Course Bonus is exactly such an effect.
     */
    course!: ValueModifier;
    /**
     * The target value of the affliction's **healing test**, as a
     * {@link sohl.entity.modifier.ValueModifier}. Its base is
     * `Healing Rate × Healing Base`; Active Effects keyed
     * {@link AFFLICTION_EFFECT_KEY | HEALING} (`mod:logic.healing`) modify it.
     */
    healing!: ValueModifier;
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
     * The effective seconds of a duration modifier, guarded so a not-yet-
     * initialized affliction (freshly dropped, read by the sheet before its
     * lifecycle runs — the #511 class) reads the persisted base rather than
     * throwing on an unset `ValueModifier`.
     *
     * @param modifier - The seeded duration modifier (may be unset).
     * @param base - The persisted base seconds to fall back to.
     * @returns The effective seconds.
     */
    private durationSeconds(modifier: ValueModifier | undefined, base: number | null): number {
        return modifier?.effective ?? base ?? 0;
    }

    /**
     * Estimated world time (seconds) at which incubation completes and the
     * affliction becomes symptomatic — `contractDate + onsetDurationBase` — for
     * **display only** (never persisted). `undefined` when the affliction has no
     * contract anchor. Once onset actually occurs the crystallized
     * {@link AfflictionData.onsetDate} is the authoritative fact; this remains the
     * projection from the contract anchor.
     */
    get estOnsetDate(): number | undefined {
        const contract = this.data.contractDate;
        if (contract == null) return undefined;
        return contract + this.durationSeconds(this.onsetDurationBase, this.data.onsetDurationBase);
    }

    /**
     * Estimated world time (seconds) at which the affliction resolves —
     * `(onsetDate ?? contractDate) + resolutionDurationBase` — for **display
     * only** (never persisted). Anchors on {@link AfflictionData.onsetDate | onset}
     * once symptomatic, else the contract anchor while incubating; `undefined`
     * when neither anchor is set.
     */
    get estResolutionDate(): number | undefined {
        const anchor = this.data.onsetDate ?? this.data.contractDate;
        if (anchor == null) return undefined;
        return (
            anchor +
            this.durationSeconds(this.resolutionDurationBase, this.data.resolutionDurationBase)
        );
    }

    /**
     * World time (seconds) of the affliction's next course/recovery check, for
     * **display only** (never persisted). Queue-first: the live
     * `system.scheduledActions` entry for the armed `healingCheck`
     * (`anchor + interval`) when present — so an accepted reschedule is reflected
     * — otherwise the arithmetic projection
     * `(onsetDate ?? contractDate) + healingCheckDurationBase`. `undefined` when
     * there is no armed check and no anchored interval to project from.
     */
    get nextHealTest(): number | undefined {
        const entry = this.data.scheduledActions?.find((e) => e.actionName === "courseCheck");
        if (entry) return scheduledFireAt(entry);
        const anchor = this.data.onsetDate ?? this.data.contractDate;
        if (anchor == null) return undefined;
        const interval = this.durationSeconds(
            this.healingCheckDurationBase,
            this.data.healingCheckDurationBase,
        );
        return interval > 0 ? anchor + interval : undefined;
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
     * Post a **treatment request** for this affliction (#1183) — the patient's
     * half of the treatment exchange.
     *
     * Unlike an injury, treatment for an affliction is mostly ineffectual: the
     * body either fights the affliction off or it does not. A request can still
     * be posted, and it names the affliction so a physician knows what they are
     * being asked to treat. The card carries an open button inviting anyone with
     * the Physician skill to make a **Treatment Success Value test**; nothing is
     * applied until its result is accepted through {@link treatAffliction}.
     *
     * @param _context - The action context (unused; the request takes no input).
     * @returns A promise that resolves once the request card is posted.
     */
    async requestTreatment(_context: SohlActionContext): Promise<void> {
        const uuid = this.item?.uuid;
        if (!uuid) return;
        await postActionCard(this.speaker, {
            template: "systems/sohl/templates/chat/affliction-treatment-request-card.hbs",
            data: {
                patientName: (this.actorLogic as { name?: string })?.name ?? "",
                afflictionName: this.item?.name ?? "",
                subType: this.data.subType,
                level: this.data.levelBase,
            },
            buttons: {
                action: "performAfflictionTreatment",
                handlerUuid: SELF_HANDLER,
                scope: { afflictionUuid: uuid },
                label: sohl.i18n.localize("SOHL.Being.Action.performAfflictionTreatment"),
                iconFAClass: "fa-solid fa-staff-snake",
            },
        });
    }

    /**
     * Record treatment of this affliction (#1183) — the patient's half of the
     * treatment exchange, and the counterpart to {@link requestTreatment}.
     *
     * Opens a dialog confirming the **treatment date** and a **Course Bonus**.
     * The bonus defaults to the Value Diamonds of the physician's Treatment
     * Success Value test when the action was reached from that card's Accept
     * button (`scope.valueDiamonds`), and to `0` when run by hand. A Course Bonus
     * above zero is persisted as an Active Effect on this affliction, keyed
     * {@link AFFLICTION_EFFECT_KEY | COURSE}, so it raises the target of every
     * subsequent {@link courseTest}.
     *
     * @param context - The action context; `scope.valueDiamonds` seeds the Course
     *   Bonus and `skipDialog` accepts the seeded values without confirmation.
     * @returns The recorded treatment date and Course Bonus, or `undefined` when
     *   the dialog was dismissed.
     */
    async treatAffliction(
        context: SohlActionContext,
    ): Promise<{ treatmentDate: number; courseBonus: number } | undefined> {
        const scope = context.scope as
            { valueDiamonds?: unknown; courseBonus?: unknown } | undefined;
        const seeded = Number(scope?.courseBonus ?? scope?.valueDiamonds ?? 0);
        let courseBonus = Number.isFinite(seeded) ? Math.trunc(seeded) : 0;

        if (!context.skipDialog) {
            const form = (await dialog({
                title: `${this.item?.name ?? ""}: ${sohl.i18n.localize(
                    "SOHL.Affliction.Action.treatAffliction.title",
                )}`,
                template: toFilePath("systems/sohl/templates/dialog/treat-affliction-dialog.hbs"),
                data: {
                    afflictionName: this.item?.name ?? "",
                    courseBonus,
                },
                callback: (formData: PlainObject) => ({
                    courseBonus: parseInt(String(formData.courseBonus), 10) || 0,
                }),
                rejectClose: false,
            })) as { courseBonus: number } | null;
            if (!form) return undefined; // dismissed
            courseBonus = form.courseBonus;
        }

        const treatmentDate = fvttWorldTime();
        await this.item.update({
            "system.treatmentDate": treatmentDate,
        } as PlainObject);

        // A positive Course Bonus becomes a standing modifier on the course
        // target, not a one-off adjustment — so it applies to every subsequent
        // Course Test for as long as the treatment holds.
        if (courseBonus > 0) {
            await fvttCreateEmbeddedEffects(this.item, [
                {
                    name: sohl.i18n.localize("SOHL.Affliction.Effect.courseBonus"),
                    changes: [
                        {
                            key: AFFLICTION_EFFECT_KEY.COURSE,
                            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                            value: String(courseBonus),
                            priority: null,
                        },
                    ],
                },
            ]);
        }
        return { treatmentDate, courseBonus };
    }

    /**
     * Define and return all intrinsic actions for this logic type.
     * @returns A map of action shortcodes to their definitions
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlItemBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "requestTreatment",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.requestTreatment.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-hand",
                executor: "requestTreatment",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "treatAffliction",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.treatAffliction.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-staff-snake",
                executor: "treatAffliction",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "healingTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.healingTest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-heart-pulse",
                executor: "healingTest",
                recordsLastRun: true,
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "healingCheck",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.healingCheck.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-bed-pulse",
                executor: "healingCheck",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "courseTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.courseTest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "ginf-heart-beats",
                executor: "courseTest",
                recordsLastRun: true,
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "courseCheck",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.courseCheck.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "ginf-heart-beats",
                executor: "courseCheck",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "setOnset",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.setOnset.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-hourglass-start",
                executor: "setOnset",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "setResolution",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Affliction.Action.setResolution.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-skull",
                executor: "setResolution",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
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
        this.level = new entity.ValueModifier(this);
        this.contagionIndex = new entity.ValueModifier(this);
        this.transmission = AFFLICTION_TRANSMISSION.NONE;

        this.healingRate = new entity.ValueModifier(this);
        if (this.data.healingRateBase == null) {
            this.healingRate.disabled = "SOHL.Affliction.NoHealingRate";
        } else {
            this.healingRate.base = this.data.healingRateBase;
        }
        this.contagionIndex = new entity.ValueModifier(
            { baseValue: this.data.contagionIndexBase },
            { parent: this },
        );
        this.level = new entity.ValueModifier({ baseValue: this.data.levelBase }, { parent: this });
        this.onsetDurationBase = new entity.ValueModifier({}, { parent: this }).setBase(
            this.data.onsetDurationBase ?? 0,
        );
        this.healingCheckDurationBase = new entity.ValueModifier({}, { parent: this }).setBase(
            this.data.healingCheckDurationBase ?? 0,
        );
        this.resolutionDurationBase = new entity.ValueModifier({}, { parent: this }).setBase(
            this.data.resolutionDurationBase ?? 0,
        );
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

        // The course/healing targets are `Healing Rate × Healing Base`, and the
        // being's Healing Base is only seeded in its own `evaluate()` — so these
        // build here, in `finalize`, where the actor's value has settled. Building
        // them in `initialize` would read 0 and silently disable every course test.
        const healingBase = Math.max(
            0,
            (this.actorLogic as { healingBase?: { effective?: number } } | null)?.healingBase
                ?.effective ?? 0,
        );
        const hr = Math.max(0, this.data.healingRateBase ?? 0);
        const target = healingBase * hr;
        this.course = new entity.ValueModifier({}, { parent: this }).setBase(target);

        // An **untreated** affliction has no target to roll against — a state,
        // not a target of zero — so the modifier is DISABLED rather than seeded,
        // exactly as a wound's is. Being disabled is itself the trigger for the
        // auto-Critical-Failure in `healingTest`, so anything that disables
        // healing gets that outcome for free (#1146/#1148/#1181). The Healing
        // Test stays offered either way; it simply cannot succeed.
        this.healing = new entity.ValueModifier({}, { parent: this });
        if (!this.isTreated) {
            this.healing.disabled = "SOHL.Affliction.Untreated";
        } else {
            this.healing.setBase(target);
        }

        const uuid = this.item?.uuid;
        if (!uuid) return;
        armScheduledActions(uuid, this.data.scheduledActions, sohl.events, this);
    }

    /**
     * Roll a duration formula to a number of seconds. Falls back to a plain
     * numeric parse, or `0` when neither yields a finite number.
     *
     * @param formula - The duration formula (dice expression or bare seconds).
     * @returns The rolled duration in seconds.
     */
    private rollDuration(formula: string | null): number {
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
        const uuid = this.item?.uuid;
        if (!uuid) return;
        await postActionCard(this.speaker, {
            template: "systems/sohl/templates/chat/onset-check-card.hbs",
            data: {
                patientName: (this.actorLogic as { name?: string })?.name ?? "",
                afflictionName: this.item?.name ?? "",
                subType: this.data.subType,
            },
            buttons: {
                action: "setOnset",
                handlerUuid: uuid,
                scope: {},
                label: sohl.i18n.localize("SOHL.Affliction.Action.setOnset.title"),
                iconFAClass: "fa-solid fa-hourglass-start",
            },
        });
    }

    /**
     * Intrinsic-action executor for **Set Onset** — the action half of the onset
     * phase, paired with {@link onsetCheck}.
     *
     * Asks whether to mark the affliction symptomatic as of now, and on yes
     * crystallizes {@link AfflictionData.onsetDate}. The per-affliction interval
     * formulas are rolled at the same time so the sheet's projected resolution and
     * next-check dates read correctly, and the authored onset Macro (if any) runs
     * once the onset is persisted.
     *
     * Onset is what sets the affliction running, so it finishes by **offering**
     * the two events that carry it from here — the recurring
     * {@link courseCheck} and the one-shot {@link resolutionCheck}. They are
     * offered, never armed: pressing Set Onset consents to the affliction being
     * symptomatic, not to a schedule (issue #579).
     *
     * @param context - The action context; `skipDialog` sets the onset without
     *   confirming, and `scope.schedule` pre-answers the two schedule offers.
     * @returns The onset date, or `undefined` when the dialog was declined.
     */
    async setOnset(context: SohlActionContext): Promise<{ onsetDate: number } | undefined> {
        if (!context.skipDialog) {
            const confirmed = await dialog({
                title: sohl.i18n.localize("SOHL.Affliction.Action.setOnset.title"),
                content: toHTMLString(`<p>{{prompt}}</p>`),
                data: {
                    prompt: sohl.i18n.format("SOHL.Affliction.Action.setOnset.prompt", {
                        name: this.item?.name ?? "",
                    }),
                },
                buttons: [
                    {
                        action: "yes",
                        label: sohl.i18n.localize("SOHL.Common.yes"),
                        icon: "fa-solid fa-check",
                        default: true,
                    },
                    {
                        action: "no",
                        label: sohl.i18n.localize("SOHL.Common.no"),
                    },
                ],
                callback: (_formData: unknown, action: string) => action === "yes",
                rejectClose: false,
            });
            if (confirmed !== true) return undefined;
        }

        const now = fvttWorldTime();
        const resolution = this.rollDuration(this.data.resolutionDurationFormula);
        const healing = this.rollDuration(this.data.healingCheckDurationFormula);
        this.resolutionDurationBase.setBase(resolution);
        this.healingCheckDurationBase.setBase(healing);
        await this.item.update({
            "system.onsetDate": now,
            "system.resolutionDurationBase": resolution,
            "system.healingCheckDurationBase": healing,
        } as PlainObject);

        // The spent onset check is cleared.
        await sohl.unschedule(this.item, "onsetCheck");

        // Onset is what starts the affliction running, so this is the moment to
        // ask about the two events that carry it the rest of the way — but they
        // are *offered*, not armed: pressing Set Onset consents to the affliction
        // being symptomatic, not to a schedule (issue #579). The two offers carry
        // distinct titles so a player answering them back-to-back can tell which
        // is which.
        await offerSchedule(context, this.item, "courseCheck", healing);
        await offerSchedule(context, this.item, "resolutionCheck", resolution);

        // Optional author hook run once at onset. A Macro reference (never
        // source); it may schedule further events of its own. Runs after onset is
        // persisted so the macro sees the symptomatic affliction.
        if (this.data.onsetMacroUuid) {
            await fvttExecuteMacro(this.data.onsetMacroUuid, {
                affliction: this,
                actor: this.actorLogic,
            });
        }
        return { onsetDate: now };
    }

    /**
     * Intrinsic-action executor for the recurring `healingCheck` — the `*Check`
     * half of the affliction's natural-recovery cycle, and the exact counterpart
     * of the wound's (see {@link sohl.document.item.logic.TraumaLogic}).
     *
     * A `*Check` **offers, and does nothing else**: it posts a card whose button
     * invites the affliction's controller to perform one {@link healingTest}. No
     * roll is made and nothing is written, so it imposes nothing and needs no
     * ownership gate — anyone may initiate one.
     *
     * @param _context - The action context (unused; the check takes no input).
     * @returns A promise that resolves once the check card is posted.
     */
    async healingCheck(_context: SohlActionContext): Promise<void> {
        const uuid = this.item?.uuid;
        if (!uuid) return;
        await postActionCard(this.speaker, {
            template: "systems/sohl/templates/chat/course-check-card.hbs",
            data: {
                patientName: (this.actorLogic as { name?: string })?.name ?? "",
                afflictionName: this.item?.name ?? "",
                healingRate: this.data.healingRateBase ?? 0,
                target: this.healing?.effective ?? 0,
            },
            buttons: {
                action: "healingTest",
                handlerUuid: uuid,
                scope: {},
                label: sohl.i18n.localize("SOHL.Affliction.Action.healingTest.title"),
                iconFAClass: "fa-solid fa-heart-pulse",
            },
        });
    }

    /**
     * Intrinsic-action executor for the affliction's **Healing Test** — the
     * `*Test` half of natural recovery, and the same test the wound makes.
     *
     * Rolls one standard success test against {@link healing} (Healing Rate ×
     * Healing Base, plus whatever Active Effects have modified it). A marginal
     * success reduces the affliction's Level by 1 and a critical success by 2; a
     * failure makes no progress. An affliction reduced to Level 0 has run its
     * course, so its recurrence ends.
     *
     * Exactly one test runs per invocation — there is no catch-up over missed
     * intervals — and the next check is **offered**, never auto-armed.
     *
     * @param context - The action context; `skipDialog` accepts the seeded values.
     * @returns The resulting Level, or `undefined` when the test was cancelled.
     */
    async healingTest(context: SohlActionContext): Promise<{ level: number } | undefined> {
        const mlMod = new entity.MasteryLevelModifier(
            {
                type: "affliction-healing-test",
                title: sohl.i18n.localize("SOHL.Affliction.Action.healingTest.title"),
            },
            { parent: this },
        );
        mlMod.setBase(this.healing?.effective ?? 0);

        // Nothing to roll against: an affliction with no Healing Rate resolves
        // as a Critical Failure with no die cast (#1146/#1148). Hand the test a
        // pre-seeded d100 showing the `00` face — it exceeds every target and its
        // last digit is a critical-failure digit, so the outcome is a Critical
        // Failure whatever the Healing Base, and the card still shows a roll.
        if (this.healing?.disabled) {
            const scope = (context.scope ?? {}) as Record<string, unknown>;
            scope.roll = new SimpleRoll(
                {
                    numDice: 1,
                    dieFaces: 100,
                    modifier: 0,
                    rolls: [UNTREATED.roll],
                },
                { parent: this },
            );
            (context as { scope?: unknown }).scope = scope;
        }

        const result = await mlMod.successTest(context);
        if (result === undefined) return undefined; // dialog dismissed
        const sl = result ? result.normSuccessLevel : CRITICAL_FAILURE;

        let level = this.data.levelBase ?? 0;
        if (sl >= CRITICAL_SUCCESS) level = Math.max(0, level - 2);
        else if (sl >= MARGINAL_SUCCESS) level = Math.max(0, level - 1);

        await this.item.update({ "system.levelBase": level } as PlainObject);

        const nextInterval = this.rollDuration(this.data.healingCheckDurationFormula);
        if (level <= 0) await sohl.unschedule(this.item, "healingCheck");
        else await offerSchedule(context, this.item, "healingCheck", nextInterval);
        return { level };
    }

    /**
     * Intrinsic-action executor for the recurring `courseCheck` — the `*Check`
     * half of the course cycle (#1183).
     *
     * A `*Check` **offers, and does nothing else**: it posts a card whose button
     * invites the affliction's controller to perform one {@link courseTest}. No
     * roll is made, no Healing Rate changes, and nothing is written. Because it
     * imposes nothing it carries no ownership gate — anyone may initiate one.
     *
     * @param _context - The action context (unused; the check takes no input).
     * @returns A promise that resolves once the check card is posted.
     */
    async courseCheck(_context: SohlActionContext): Promise<void> {
        const uuid = this.item?.uuid;
        if (!uuid) return;
        await postActionCard(this.speaker, {
            template: "systems/sohl/templates/chat/course-check-card.hbs",
            data: {
                patientName: (this.actorLogic as { name?: string })?.name ?? "",
                afflictionName: this.item?.name ?? "",
                healingRate: this.data.healingRateBase ?? 0,
                target: this.course?.effective ?? 0,
            },
            buttons: {
                action: "courseTest",
                handlerUuid: uuid,
                scope: {},
                label: sohl.i18n.localize("SOHL.Affliction.Action.courseTest.title"),
                iconFAClass: "ginf-heart-beats",
            },
        });
    }

    /**
     * Intrinsic-action executor for the **Course Test** (#1183) — the `*Test`
     * half of the course cycle, and the action that actually advances an
     * affliction.
     *
     * Rolls one standard success test against {@link course} (Healing Rate ×
     * Healing Base, plus whatever Active Effects have modified it — a treatment
     * Course Bonus among them). The result moves the affliction's Healing Rate by
     * {@link sohl.document.item.logic.courseHrDelta | CF −2 / MF −1 / MS +1 /
     * CS +2}, and the resulting rate determines the host's reaction via
     * {@link sohl.document.item.logic.courseOutcomeFor}.
     *
     * The reaction is **never applied silently**: a confirmation dialog offers it
     * first, and the outcome card reports both the result and whether it was
     * applied to the character sheet. Exactly one test runs per invocation — there
     * is no catch-up over missed intervals.
     *
     * @param context - The action context; `skipDialog` accepts the reaction
     *   without confirming.
     * @returns The resulting Healing Rate and whether the reaction was applied,
     *   or `undefined` when the test was cancelled.
     */
    async courseTest(
        context: SohlActionContext,
    ): Promise<{ healingRate: number; applied: boolean } | undefined> {
        const mlMod = new entity.MasteryLevelModifier(
            {
                type: "affliction-course-test",
                title: sohl.i18n.localize("SOHL.Affliction.Action.courseTest.title"),
            },
            { parent: this },
        );
        mlMod.setBase(this.course?.effective ?? 0);

        const result = await mlMod.successTest(context);
        if (result === undefined) return undefined; // dialog dismissed
        const sl = result ? result.normSuccessLevel : CRITICAL_FAILURE;

        const hr = (this.data.healingRateBase ?? 0) + courseHrDelta(sl);
        const outcome = courseOutcomeFor(hr);

        // Confirm before touching the character sheet — the roll is the system's
        // job, the consequence is the player's call.
        let applied = true;
        if (!context.skipDialog) {
            applied =
                (await dialog({
                    title: sohl.i18n.localize("SOHL.Affliction.Action.courseTest.applyTitle"),
                    content: toHTMLString(`<p>{{prompt}}</p>`),
                    data: {
                        prompt: sohl.i18n.format("SOHL.Affliction.Action.courseTest.applyPrompt", {
                            name: this.item?.name ?? "",
                            hr,
                        }),
                    },
                    buttons: [
                        {
                            action: "yes",
                            label: sohl.i18n.localize("SOHL.Common.yes"),
                            icon: "fa-solid fa-check",
                            default: true,
                        },
                        {
                            action: "no",
                            label: sohl.i18n.localize("SOHL.Common.no"),
                        },
                    ],
                    callback: (_formData: unknown, action: string) => action === "yes",
                    rejectClose: false,
                })) === true;
        }

        if (applied) await this.applyCourseOutcome(hr, outcome);

        await postActionCard(this.speaker, {
            template: "systems/sohl/templates/chat/course-result-card.hbs",
            data: {
                patientName: (this.actorLogic as { name?: string })?.name ?? "",
                afflictionName: this.item?.name ?? "",
                healingRate: hr,
                defeated: outcome.defeated,
                fatigueLevels: outcome.fatigueLevels,
                shockLabel: outcome.shockState ? shockStateLabelKey(outcome.shockState) : "",
                applied,
            },
        });
        return { healingRate: hr, applied };
    }

    /**
     * Persist the outcome of a {@link courseTest} — the Healing Rate and the
     * host's reaction to it.
     *
     * A **defeated** affliction (Healing Rate 6+) resolves on the spot: the
     * resolution date is stamped, the outcome recorded as
     * {@link AFFLICTION_OUTCOME | CURED}, its remaining schedules cleared, and any
     * Weakness Fatigue this affliction inflicted is removed. Otherwise the host
     * takes the reaction's Weakness Fatigue (updating the existing entry for this
     * affliction rather than stacking a second one) and its shock state, which
     * only ever worsens.
     *
     * @param hr - The Healing Rate resulting from the Course Test.
     * @param outcome - The reaction described by {@link courseOutcomeFor}.
     * @returns A promise that resolves once the outcome is persisted.
     */
    private async applyCourseOutcome(hr: number, outcome: CourseOutcome): Promise<void> {
        if (outcome.defeated) {
            await this.item.update({
                "system.healingRateBase": hr,
                "system.resolutionDate": fvttWorldTime(),
                "system.outcome": AFFLICTION_OUTCOME.CURED,
            } as PlainObject);
            await sohl.unschedule(this.item, "courseCheck");
            await sohl.unschedule(this.item, "resolutionCheck");
            await this.clearAfflictionFatigue();
            return;
        }

        await this.item.update({
            "system.healingRateBase": hr,
        } as PlainObject);

        if (outcome.fatigueLevels > 0) {
            await this.setAfflictionFatigue(outcome.fatigueLevels);
        }
        if (outcome.shockState) {
            const being = this.actorLogic as any;
            await being?.setShockState?.(Math.max(being?.shockState ?? 0, outcome.shockState));
        }
    }

    /**
     * The Weakness Fatigue this affliction has inflicted on its host, identified
     * by carrying the **same name and shortcode** as the affliction.
     *
     * @returns The matching fatigue trauma logics (normally at most one).
     */
    private afflictionFatigue(): { data: TraumaData; item: any }[] {
        const items = (this.actorLogic as any)?.items;
        if (!items) return [];
        const matches: { data: TraumaData; item: any }[] = [];
        for (const item of items.values() as Iterable<any>) {
            const logic = item?.logic;
            const data = logic?.data as TraumaData | undefined;
            if (!data) continue;
            if (
                data.kind === ITEM_KIND.TRAUMA &&
                data.subType === TRAUMA_SUBTYPE.FATIGUE &&
                data.category === FATIGUE_CATEGORY.WEAKNESS &&
                item.name === this.item?.name &&
                data.shortcode === this.data.shortcode
            ) {
                matches.push({ data, item });
            }
        }
        return matches;
    }

    /**
     * Set this affliction's Weakness Fatigue on the host to `levels`, updating the
     * existing entry rather than creating a second one.
     *
     * @param levels - The Weakness Fatigue level to record.
     * @returns A promise that resolves once the fatigue is recorded.
     */
    private async setAfflictionFatigue(levels: number): Promise<void> {
        const existing = this.afflictionFatigue();
        if (existing.length) {
            for (const { item } of existing) {
                await item.update({ "system.levelBase": levels });
            }
            return;
        }
        await fvttCreateEmbeddedItems(this.actorLogic, [
            {
                type: ITEM_KIND.TRAUMA,
                name: this.item?.name ?? "",
                system: {
                    subType: TRAUMA_SUBTYPE.FATIGUE,
                    category: FATIGUE_CATEGORY.WEAKNESS,
                    shortcode: this.data.shortcode,
                    levelBase: levels,
                },
            },
        ]);
    }

    /**
     * Delete every Weakness Fatigue this affliction inflicted — the host has
     * beaten it, so the weakness it caused goes with it.
     *
     * @returns A promise that resolves once the fatigue is removed.
     */
    private async clearAfflictionFatigue(): Promise<void> {
        for (const { item } of this.afflictionFatigue()) {
            await item.delete?.();
        }
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
        const uuid = this.item?.uuid;
        if (!uuid) return;
        await postActionCard(this.speaker, {
            template: "systems/sohl/templates/chat/resolution-check-card.hbs",
            data: {
                patientName: (this.actorLogic as { name?: string })?.name ?? "",
                afflictionName: this.item?.name ?? "",
                healingRate: this.data.healingRateBase ?? 0,
            },
            buttons: {
                action: "setResolution",
                handlerUuid: uuid,
                scope: {},
                label: sohl.i18n.localize("SOHL.Affliction.Action.setResolution.title"),
                iconFAClass: "fa-solid fa-skull",
            },
        });
    }

    /**
     * Intrinsic-action executor for **Set Resolution** — the action half of the
     * resolution phase, paired with {@link resolutionCheck}.
     *
     * Asks which {@link AFFLICTION_OUTCOME | outcome} the affliction resolves to
     * (defaulting to the authored one), and on OK records that outcome with
     * {@link AfflictionData.resolutionDate} set to now. Resolution is terminal, so
     * the affliction's remaining schedules are cleared, and the chosen outcome is
     * applied — death, or a cure that takes the Healing Rate to 6 — along with any
     * authored `outcomeTrauma`.
     *
     * An affliction already **defeated** (Healing Rate 6 or better) has beaten its
     * course on its own; its resolution is recorded but no outcome is inflicted.
     *
     * @param context - The action context; `scope.outcome` pre-selects the outcome
     *   and `skipDialog` accepts it without asking.
     * @returns The recorded outcome and date, or `undefined` when the dialog was
     *   dismissed.
     */
    async setResolution(
        context: SohlActionContext,
    ): Promise<{ outcome: AfflictionOutcome; resolutionDate: number } | undefined> {
        const seeded = (context.scope as { outcome?: unknown } | undefined)?.outcome;
        let outcome: AfflictionOutcome = isAfflictionOutcome(seeded) ? seeded : this.data.outcome;

        if (!context.skipDialog) {
            const form = (await dialog({
                title: sohl.i18n.localize("SOHL.Affliction.Action.setResolution.title"),
                template: toFilePath("systems/sohl/templates/dialog/set-resolution-dialog.hbs"),
                data: {
                    afflictionName: this.item?.name ?? "",
                    outcome,
                    outcomeChoices: AfflictionOutcomeChoices,
                },
                callback: (formData: PlainObject) => ({
                    outcome: String(formData.outcome ?? ""),
                }),
                rejectClose: false,
            })) as { outcome: string } | null;
            if (!form) return undefined; // dismissed
            if (isAfflictionOutcome(form.outcome)) outcome = form.outcome;
        }

        const resolutionDate = fvttWorldTime();
        await this.item.update({
            "system.outcome": outcome,
            "system.resolutionDate": resolutionDate,
        } as PlainObject);

        // Resolution is terminal — clear the recurring course/healing checks and
        // this one-shot resolution schedule.
        await sohl.unschedule(this.item, "courseCheck");
        await sohl.unschedule(this.item, "healingCheck");
        await sohl.unschedule(this.item, "resolutionCheck");

        // An affliction that already beat its course takes no outcome.
        if ((this.data.healingRateBase ?? 0) >= COURSE_DEFEATED_HR) {
            return { outcome, resolutionDate };
        }
        await this.applyOutcome();
        return { outcome, resolutionDate };
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
        const scope = expressionScopes.require("affliction.outcomeTrauma");
        const value = new SafeExpression(
            { source: this.data.outcomeTrauma ?? undefined },
            { parent: this, scope },
        ).evaluate(scope.bind({}));
        const shortcodes = (Array.isArray(value) ? value : [value])
            .map((v) => String(v))
            .filter(Boolean);
        const created: PlainObject[] = [];
        for (const code of shortcodes) {
            const data = await fvttFindItemByShortcode(code);
            if (data) created.push(data);
            else sohl.log.warn(`Affliction outcomeTrauma: no item found with shortcode "${code}"`);
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
    category: string | null;
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
    onsetMacroUuid: string | null;
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
    outcomeTrauma: string | null;
    /** Formula rolled to seed the incubation (contract → onset) interval. */
    onsetDurationFormula: string | null;
    /** Rolled seconds of incubation; `null` until rolled. */
    onsetDurationBase: number | null;
    /** World-time at which symptoms began (onset crystallized); `null` while incubating. */
    onsetDate: number | null;
    /** Formula rolled to seed the recurring course/recovery-check interval. */
    healingCheckDurationFormula: string | null;
    /** Rolled seconds between course/recovery checks; `null` until rolled. */
    healingCheckDurationBase: number | null;
    /** Formula rolled to seed the onset → resolution interval. */
    resolutionDurationFormula: string | null;
    /** Rolled seconds from onset to resolution; `null` until rolled. */
    resolutionDurationBase: number | null;
    /** World-time at which the affliction resolved (death/disability/cure); `null` until resolved. */
    resolutionDate: number | null;
    /**
     * A {@link sohl.entity.roll.SimpleRoll} formula giving the number of **days**
     * between contracting the affliction and the start of onset, rolled by the
     * receiving actor's Contagion Test. `null` means no incubation.
     */
    onsetFormula: string | null;
    /** Severity of the affliction */
    levelBase: number;
    /** Rate of natural recovery; `null` means no natural healing */
    healingRateBase: number | null;
    /** Risk of transmitting this affliction to others */
    contagionIndexBase: number;
    /** How this affliction spreads (Contact, Airborne, etc.) */
    transmission: AfflictionTransmission;
}
