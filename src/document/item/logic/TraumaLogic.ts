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
    fvttGetSetting,
    fvttCreateEmbeddedItems,
    dialog,
} from "@src/core/FoundryHelpers";
import { toFilePath } from "@src/utils/helpers";
import { inflictWeaknessFatigue } from "@src/document/item/logic/fatigue";
import {
    psycheRecoveryOutcome,
    auralShockRecoveryOutcome,
    inflictPsycheStress,
    PSYCHE_PERMANENCE,
    PSYCHE_RECOVERY_INTERVAL_FORMULA,
    AURAL_SHOCK_RECOVERY_INTERVAL_FORMULA,
} from "@src/document/item/logic/psyche";
import {
    TREATMENT_HEAL,
    injuryBand,
    requiredTreatment,
    treatmentHealingRate,
    treatmentCausesBleeder,
    isBleederFromHealingRate,
    isPermanentImpairmentEligible,
    type InjuryBand,
    type TreatmentCode,
} from "@src/entity/body/injury-treatment";
import { permanentImpairmentFor } from "@src/entity/body/impairment";
// `action-card` and `chat-card-dispatch` are pure, Foundry-free modules (they
// touch Foundry only through the `FoundryHelpers` shims); the path-based
// boundary rule can't tell them apart from the Foundry-coupled files under
// `document/chat/`, so allow these two.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { postActionCard } from "@src/document/chat/action-card";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { SELF_HANDLER } from "@src/document/chat/chat-card-dispatch";
import {
    SHOCK_STATE,
    shockCourseHrDelta,
} from "@src/document/actor/logic/shock";
import {
    pallRecoveryOutcome,
    PALL_RECOVERY_INTERVAL_FORMULA,
} from "@src/document/actor/logic/pall";
import { elapsedCheckpoints } from "@src/entity/event/scheduling";
import { armScheduledActions } from "@src/entity/event/scheduled-actions";
import { offerSchedule } from "@src/document/item/logic/offer-schedule";
import type { SohlAction } from "@src/entity/action/SohlAction";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import type { BodyLocation } from "@src/entity/body/BodyLocation";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import {
    ACTION_SUBTYPE,
    ATTRIBUTE_CODE,
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    defineType,
    FATIGUE_CATEGORY,
    FatigueCategoryLabels,
    FEAR_LEVEL,
    FearLevelLabels,
    IMPACT_ASPECT,
    ImpactAspect,
    INJURY_LEVELS,
    isFatigueCategory,
    isFearLevel,
    isMoraleLevel,
    ITEM_KIND,
    MARGINAL_SUCCESS,
    MORALE_LEVEL,
    MoraleLevelLabels,
    SKILL_CODE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    TRAUMA_SUBTYPE,
    TraumaSubType,
} from "@src/utils/constants";
import {
    SohlItemBaseLogic,
    type SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";
import { rollTimedTest } from "@src/document/item/logic/timed-test";

/** Seconds in a day — for converting healing world-time spans to days (#554). */
const SECONDS_PER_DAY = 86400;

// Level/category → localization-key maps, derived once from the enums so
// levelLabel/categoryLabel are simple lookups.
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

/**
 * An instance of harm to a character.
 *
 * Trauma represents wounds and damage sustained by a character. The
 * {@link TraumaData.subType | subType} discriminates the trauma's nature:
 * `injury` (bodily harm tied to a
 * {@link TraumaData.bodyLocationCode | body location}), or a mind/spirit/body
 * condition — `fear`, `morale`, `pall`, `psycond` (psychological condition),
 * `auralshock`, `fatigue`, `infection`, `shock`, or `coma`.
 *
 * Each trauma tracks:
 *
 * - **subType** — Category of harm (injury | fear | morale | pall | psycond |
 *   auralshock | fatigue | infection | shock | coma)
 * - **injuryLevel** — Severity on a graduated scale: M1 (Minor), S2–S3
 *   (Serious), G4–G5 (Grievous), with higher levels causing greater
 *   impairment and risk of death
 * - **healingRate** — How quickly the wound heals (influenced by treatment)
 * - **aspect** — The type of damage that caused the trauma (Blunt, Pierce,
 *   Cut, Heat, Cold), which affects treatment and healing
 * - **isTreated** — Whether the trauma has received medical treatment
 *   (untreated wounds heal slower and risk infection)
 *
 * Trauma contributes to the character's overall shock state
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
     * {@link sohl.entity.modifier.ValueModifier}, seeded from {@link TraumaData.levelBase}.
     */
    level!: ValueModifier;
    /**
     * How quickly the wound heals, as a {@link sohl.entity.modifier.ValueModifier}, seeded from
     * {@link TraumaData.healingRateBase}.
     */
    healingRate!: ValueModifier;
    /**
     * Effective seconds between healing checks, as a
     * {@link sohl.entity.modifier.ValueModifier}, seeded from
     * {@link TraumaData.healingCheckDurationBase}.
     */
    healingCheckDurationBase!: ValueModifier;
    /**
     * Effective seconds between blood-loss advances, as a
     * {@link sohl.entity.modifier.ValueModifier}, seeded from
     * {@link TraumaData.bloodLossAdvanceDurationBase}.
     */
    bloodLossAdvanceDurationBase!: ValueModifier;
    /**
     * Effective seconds between Extended Shock / Coma course checks, as a
     * {@link sohl.entity.modifier.ValueModifier}, seeded from
     * {@link TraumaData.courseDurationBase}.
     */
    courseDurationBase!: ValueModifier;
    /**
     * The {@link BodyLocation} on the being's body that this trauma
     * affects, resolved from {@link TraumaData.bodyLocationCode}. When the
     * code is blank — or no matching location exists in the body — this
     * is `undefined`, indicating the trauma affects the whole body rather
     * than a specific location. Recomputed in {@link evaluate}.
     */
    bodyLocation: BodyLocation | undefined;

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Intrinsic-action executor for `requestTreatment` — the injured character's
     * **Request Treatment** context-menu action. It posts an
     * {@link sohl.document.chat.buildActionCard | action card} bearing an open
     * *Perform Treatment Test* button ({@link sohl.document.chat.SELF_HANDLER}):
     * any player whose default character has the Physician skill may answer, and
     * the button pre-fills that physician's
     * {@link sohl.document.actor.logic.BeingLogic.performTreatmentTest} with this
     * wound's uuid. Nothing is rolled or recorded here — the card just invites a
     * physician; state lives in the posted card, so it may be ignored, answered
     * later, or superseded.
     *
     * @param _context - The action context (unused).
     * @returns A promise that resolves once the request card is posted.
     */
    async requestTreatment(_context: SohlActionContext): Promise<void> {
        if (this.data.subType !== TRAUMA_SUBTYPE.INJURY) {
            sohl.log.uiWarn(
                sohl.i18n.localize("SOHL.Trauma.Treatment.NotAnInjury"),
            );
            return;
        }
        if (!injuryBand(this.data.levelBase)) {
            sohl.log.uiWarn(
                sohl.i18n.localize("SOHL.Trauma.Treatment.AlreadyHealed"),
            );
            return;
        }
        const uuid = this.item?.uuid;
        if (!uuid) return;
        await postActionCard(this.speaker, {
            template: "systems/sohl/templates/chat/treatment-request-card.hbs",
            data: {
                patientName: (this.actorLogic as { name?: string })?.name ?? "",
                woundName: this.item?.name ?? "",
                aspect: this.data.aspect,
                severity: this.data.levelBase,
            },
            buttons: {
                action: "performTreatmentTest",
                handlerUuid: SELF_HANDLER,
                scope: { injuryUuid: uuid },
                label: sohl.i18n.localize(
                    "SOHL.Being.Action.performTreatmentTest",
                ),
                iconFAClass: "fa-solid fa-staff-snake",
            },
        });
    }

    /**
     * Record a treated Healing Rate on this wound — the **Treat Injury** action.
     * Self-sufficient: run from the wound's context menu it opens a dialog for the
     * Healing Rate; invoked from a physician's *Treatment Result* Accept button it
     * reads `scope.healingRate` with `skipDialog`, so the patient records the
     * physician's proposed rate with one click. A `HEAL` sentinel (only reachable
     * from a card) heals the wound outright.
     *
     * @param context - The action context; `scope.healingRate` supplies the rate
     *   when present (card path), else the dialog gathers it.
     * @returns The recorded Healing Rate, or `undefined` when none was supplied /
     *   the dialog was cancelled.
     */
    async treatInjury(
        context: SohlActionContext,
    ): Promise<{ healingRate: number | typeof TREATMENT_HEAL } | undefined> {
        let hr = (
            context.scope as {
                healingRate?: number | typeof TREATMENT_HEAL;
            }
        )?.healingRate;

        // Run by hand (no card to pre-fill it): gather the Healing Rate.
        if (hr == null && !context.skipDialog) {
            const form = (await dialog({
                title: `${this.item?.name ?? ""}: ${sohl.i18n.localize("SOHL.Trauma.Action.treatInjury.title")}`,
                template: toFilePath(
                    "systems/sohl/templates/dialog/treat-injury-dialog.hbs",
                ),
                data: { healingRate: this.data.healingRateBase ?? 0 },
                callback: (data: PlainObject) => data,
                rejectClose: false,
            })) as { healingRate?: unknown } | null;
            if (!form) return undefined;
            const n = Number(form.healingRate);
            if (Number.isNaN(n)) return undefined;
            hr = n;
        }
        if (hr == null) return undefined;

        const now = fvttWorldTime();
        if (hr === TREATMENT_HEAL) {
            await this.item.update({
                "system.levelBase": 0,
                "system.treatmentDate": now,
            } as PlainObject);
            return { healingRate: hr };
        }
        await this.item.update({
            "system.healingRateBase": hr,
            "system.treatmentDate": now,
        } as PlainObject);
        return { healingRate: hr };
    }

    /**
     * Roll the **Physician Treatment Test** (#553), establishing this injury's
     * Healing Rate and its special effects.
     *
     * Intrinsic-action executor for the `treatmenttest` action. The wound's
     * aspect and severity band select the required treatment action and its
     * difficulty modifier ({@link requiredTreatment}); the owning being's
     * Physician skill is rolled headlessly at that modifier; and the result maps,
     * with the severity band, to the injury's
     * {@link TraumaData.healingRateBase | Healing Rate}
     * ({@link treatmentHealingRate}). A `HEAL` result heals the wound outright. The
     * resulting Healing Rate (with the aspect and any surgical mishap) then
     * determines the special injury effects — a bleeder (which arms the
     * blood-loss timer) and permanent-impairment eligibility.
     *
     * With no owning being able to roll (a headless/GM context, until the
     * interactive physician card of #547 exists), the treatment auto-resolves as
     * though the Physician roll were a **Critical Failure** — the rule that "an
     * untreated wound is resolved as though its treatment roll were a Critical
     * Failure."
     *
     * @param context - The action context for the test; forwarded to the
     *   blood-loss schedule offer when a treatment leaves the wound bleeding.
     * @returns The success test result, or `null` for a non-injury/healed trauma
     *   or a headless critical-failure resolution.
     */
    async treatmentTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        if (this.data.subType !== TRAUMA_SUBTYPE.INJURY) {
            sohl.log.uiWarn(
                sohl.i18n.localize("SOHL.Trauma.Treatment.NotAnInjury"),
            );
            return null;
        }
        const band = injuryBand(this.data.levelBase);
        if (!band) {
            sohl.log.uiWarn(
                sohl.i18n.localize("SOHL.Trauma.Treatment.AlreadyHealed"),
            );
            return null;
        }

        const req = requiredTreatment(this.data.aspect, band);
        const physicianMl =
            (
                this.actorLogic?.getItemLogic(
                    SKILL_CODE.PHYSICIAN,
                    ITEM_KIND.SKILL,
                ) as any
            )?.masteryLevel?.effective ?? 0;
        const result = await rollTimedTest(this, physicianMl, {
            type: "trauma-treatmenttest",
            title: sohl.i18n.localize("SOHL.Trauma.Action.treatmenttest.title"),
            situationalModifier: req?.modifier ?? 0,
        });
        if (result === undefined) return null; // cancelled

        // `false` — the speaker is not owned, so the GM cannot roll: resolve the
        // untreated wound as though the Physician roll were a Critical Failure.
        const sl =
            result === false ? CRITICAL_FAILURE : result.normSuccessLevel;
        await this.applyTreatmentResult(sl, band, req?.code, context);
        return result === false ? null : result;
    }

    /**
     * Persist the outcome of a Treatment Test: the Healing Rate (or immediate
     * heal), the treatment date, any resulting bleeder (arming the blood-loss
     * timer), and permanent-impairment eligibility.
     *
     * @param normSuccessLevel - The Physician-test result (CF −1 … CS 2).
     * @param band - The wound's severity band.
     * @param code - The required treatment action (used to detect a surgical
     *   bleeder mishap), or `undefined` when the aspect has no table entry.
     * @param context - The treatment action's context, forwarded to the
     *   blood-loss schedule offer when the wound is left bleeding.
     * @returns A promise that resolves once the outcome is persisted.
     */
    private async applyTreatmentResult(
        normSuccessLevel: number,
        band: InjuryBand,
        code: TreatmentCode | undefined,
        context: SohlActionContext,
    ): Promise<void> {
        const now = fvttWorldTime();
        const hr = treatmentHealingRate(normSuccessLevel, band);
        const update: PlainObject = { "system.treatmentDate": now };

        if (hr === TREATMENT_HEAL) {
            // A HEAL result heals the wound immediately (Injury Level 0).
            update["system.levelBase"] = 0;
            await this.item.update(update);
            return;
        }

        update["system.healingRateBase"] = hr;

        // A poorly-treated wound (a failed Treatment Test) is exposed to infection
        // (#557); a marginal/critical success clears the risk.
        update["system.infectable"] = normSuccessLevel < MARGINAL_SUCCESS;

        // Special injury effects. A surgical mishap (EXT/SUR on a failure) or a
        // grievous blunt/edged/piercing wound left at HR 2–3 becomes a bleeder;
        // arm the blood-loss timer if it is not already bleeding.
        const bleeder =
            treatmentCausesBleeder(code, normSuccessLevel) ||
            isBleederFromHealingRate(this.data.aspect, band, hr);
        let bleederInterval: number | undefined;
        if (bleeder && !this.isBleeding) {
            const formula = String(
                fvttGetSetting("sohl", "bloodLossAdvanceDurationFormula") ?? "",
            );
            bleederInterval = Number(formula) || 0;
            update["system.bloodLossAdvanceDurationFormula"] = formula;
            update["system.bloodLossAdvanceDurationBase"] = bleederInterval;
        }

        if (isPermanentImpairmentEligible(this.data.aspect, band, hr)) {
            update["system.permanentImpairmentEligible"] = true;
        }

        await this.item.update(update);

        // A treatment that leaves the wound bleeding OFFERS to track the
        // blood-loss advance (issue #579 — nothing auto-schedules); the physician
        // is present, so it prompts (honoring the action's skipDialog).
        if (bleederInterval != null) {
            await offerSchedule(
                context,
                this.item,
                "bloodLossAdvanceCheck",
                bleederInterval,
            );
        }
    }

    /**
     * Roll the healing test, resolving natural recovery from this trauma.
     *
     * Intrinsic-action executor for the `healingtest` action.
     *
     * @param _context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; warns and returns `null`.
     */
    async healingTest(
        _context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        sohl.log.uiWarn("Trauma Healing Test is not yet implemented.");
        return null;
    }

    /**
     * Roll one headless recovery test against the being's **Will** — no fatigue or
     * impairment penalties apply (Psychological Condition rules). Returns the
     * normalized success level, or `null` if the roll was refused.
     *
     * @param type - The test-type id (for chat/telemetry).
     * @param title - The localized test title.
     * @returns The normalized success level, or `null`.
     */
    private async rollWillTest(
        type: string,
        title: string,
    ): Promise<number | null> {
        const willMl =
            (
                this.actorLogic?.getItemLogic(
                    ATTRIBUTE_CODE.WILL,
                    ITEM_KIND.ATTRIBUTE,
                ) as { masteryLevel?: { effective?: number } } | undefined
            )?.masteryLevel?.effective ?? 0;
        const result = await rollTimedTest(this, willMl, {
            noChat: true,
            type,
            title,
        });
        return result ? result.normSuccessLevel : null;
    }

    /**
     * Intrinsic-action executor for the **Psyche Stress Recovery Test** (#560) —
     * the recurring recovery of a `psycond`-subtype psychological condition.
     *
     * At each elapsed checkpoint (every d6 days; a manual invocation runs one) the
     * victim rolls a headless Will test (fatigue does not apply). `MS`/`CS` recover
     * **−1/−2 PSY**; a `CF` is a **Grievous Stress** — an indefinite condition
     * becomes **permanent**, or a permanent one gains **+1 PSY**
     * ({@link sohl.document.item.logic.psycheRecoveryOutcome}). An indefinite
     * condition **goes away** when its PSY reaches 0. Otherwise the next check is
     * **offered** (issue #579) rather than auto-re-armed.
     *
     * @param context - The action context; `scope.schedule` decides whether the
     *   next occurrence is scheduled.
     * @returns A promise that resolves once the outcome and schedule are persisted.
     */
    async psycheRecovery(context: SohlActionContext): Promise<void> {
        const uuid = this.item?.uuid;
        if (
            !uuid ||
            this.data.subType !== TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION
        ) {
            return;
        }
        const now = fvttWorldTime();
        const entry = this.data.scheduledActions?.find(
            (e) => e.actionName === "psycheRecovery",
        );
        const interval =
            entry?.interval ??
            this.rollDuration(PSYCHE_RECOVERY_INTERVAL_FORMULA);
        const anchor = entry?.anchor ?? now;
        const checkpoints =
            entry && interval > 0 ?
                elapsedCheckpoints(anchor, now, interval)
            :   [now];

        let psy = this.data.levelBase;
        let permanent = this.data.category === PSYCHE_PERMANENCE.PERMANENT;
        for (let i = 0; i < checkpoints.length && (psy > 0 || permanent); i++) {
            const sl = await this.rollWillTest(
                "trauma-psyche-recovery",
                sohl.i18n.localize("SOHL.Trauma.Action.psycheRecovery.title"),
            );
            if (sl == null) break;
            const out = psycheRecoveryOutcome(sl);
            if (out.grievous) {
                if (permanent) psy += 1;
                else permanent = true;
            } else {
                psy = Math.max(0, psy + out.psyDelta);
            }
        }

        // An indefinite condition recovers (goes away) when its PSY reaches 0.
        if (!permanent && psy <= 0) {
            await sohl.unschedule(this.item, "psycheRecovery");
            await this.item.delete();
            return;
        }
        await this.item.update({
            "system.levelBase": Math.max(0, psy),
            "system.category":
                permanent ?
                    PSYCHE_PERMANENCE.PERMANENT
                :   PSYCHE_PERMANENCE.INDEFINITE,
        } as PlainObject);
        await offerSchedule(
            context,
            this.item,
            "psycheRecovery",
            this.rollDuration(PSYCHE_RECOVERY_INTERVAL_FORMULA),
        );
    }

    /**
     * Intrinsic-action executor for the **Aural Shock recovery test** (#560) — the
     * daily recovery of an `auralshock`-subtype trauma.
     *
     * At each elapsed checkpoint (once per day; a manual invocation runs one) the
     * victim rolls a headless Will test (fatigue and impairment do not apply).
     * `MS`/`CS` recover **−1/−2 AS**; a `CF` grants **+1 PSY**
     * ({@link sohl.document.item.logic.auralShockRecoveryOutcome}). The victim
     * recovers when AS reaches 0. Otherwise the next check is **offered** (issue
     * #579).
     *
     * @param context - The action context; `scope.schedule` decides scheduling.
     * @returns A promise that resolves once the outcome and schedule are persisted.
     */
    async auralShockRecovery(context: SohlActionContext): Promise<void> {
        const uuid = this.item?.uuid;
        if (!uuid || this.data.subType !== TRAUMA_SUBTYPE.AURALSHOCK) return;
        const now = fvttWorldTime();
        const entry = this.data.scheduledActions?.find(
            (e) => e.actionName === "auralShockRecovery",
        );
        const interval =
            entry?.interval ??
            this.rollDuration(AURAL_SHOCK_RECOVERY_INTERVAL_FORMULA);
        const anchor = entry?.anchor ?? now;
        const checkpoints =
            entry && interval > 0 ?
                elapsedCheckpoints(anchor, now, interval)
            :   [now];

        let as = this.data.levelBase;
        let psyGained = 0;
        for (let i = 0; i < checkpoints.length && as > 0; i++) {
            const sl = await this.rollWillTest(
                "trauma-auralshock-recovery",
                sohl.i18n.localize(
                    "SOHL.Trauma.Action.auralShockRecovery.title",
                ),
            );
            if (sl == null) break;
            const out = auralShockRecoveryOutcome(sl);
            as = Math.max(0, as + out.asDelta);
            psyGained += out.psyGain;
        }
        if (psyGained > 0) {
            await inflictPsycheStress(
                this.actorLogic,
                psyGained,
                sohl.i18n.localize("SOHL.Trauma.AuralShock"),
            );
        }

        if (as <= 0) {
            await sohl.unschedule(this.item, "auralShockRecovery");
            await this.item.delete();
            return;
        }
        await this.item.update({
            "system.levelBase": as,
        } as PlainObject);
        await offerSchedule(
            context,
            this.item,
            "auralShockRecovery",
            this.rollDuration(AURAL_SHOCK_RECOVERY_INTERVAL_FORMULA),
        );
    }

    /**
     * Intrinsic-action executor for **Pall recovery** (#561) — the recurring
     * recovery of a `pall`-subtype Pall Cloud, made every d6 days.
     *
     * At each elapsed checkpoint (a manual invocation runs one) the victim rolls a
     * headless Will test ({@link sohl.document.actor.logic.pallRecoveryOutcome}):
     * `MS`/`CS` recover **−1/−2 PSL** (the Pall is expelled at 0); `MF` renders the
     * victim **Unconscious** (no PSL change); `CF` forces the victim to **Face the
     * Pall** — an owner-accepted choice offered as an action card (never imposed).
     * Otherwise the next check is **offered** (issue #579).
     *
     * @param context - The action context; `scope.schedule` decides scheduling.
     * @returns A promise that resolves once the outcome and schedule are persisted.
     */
    async pallRecovery(context: SohlActionContext): Promise<void> {
        const uuid = this.item?.uuid;
        if (!uuid || this.data.subType !== TRAUMA_SUBTYPE.PALL) return;
        const now = fvttWorldTime();
        const entry = this.data.scheduledActions?.find(
            (e) => e.actionName === "pallRecovery",
        );
        const interval =
            entry?.interval ??
            this.rollDuration(PALL_RECOVERY_INTERVAL_FORMULA);
        const anchor = entry?.anchor ?? now;
        const checkpoints =
            entry && interval > 0 ?
                elapsedCheckpoints(anchor, now, interval)
            :   [now];

        let psl = this.data.levelBase;
        let faced = false;
        let unconscious = false;
        for (let i = 0; i < checkpoints.length && psl > 0 && !faced; i++) {
            const sl = await this.rollWillTest(
                "trauma-pall-recovery",
                sohl.i18n.localize("SOHL.Trauma.Action.pallRecovery.title"),
            );
            if (sl == null) break;
            const out = pallRecoveryOutcome(sl);
            if (out.kind === "face") {
                faced = true;
            } else if (out.kind === "unconscious") {
                unconscious = true;
            } else {
                psl = Math.max(0, psl + out.pslDelta);
            }
        }

        // A Marginal Failure knocks the victim unconscious until PSL reach 0.
        if (unconscious) {
            await (this.actorLogic as any)?.setShockState?.(
                SHOCK_STATE.UNCONSCIOUS,
            );
        }
        // A Critical Failure forces the victim to Face the Pall — offered, never
        // imposed (the choice is always the victim's).
        if (faced) await this.offerFacePall();

        // The Pall is expelled when PSL reach 0 (the permanent psyche trait
        // remains; its permanence conversion is a follow-up).
        if (psl <= 0) {
            await sohl.unschedule(this.item, "pallRecovery");
            await this.item.delete();
            return;
        }
        await this.item.update({
            "system.levelBase": psl,
        } as PlainObject);
        await offerSchedule(
            context,
            this.item,
            "pallRecovery",
            this.rollDuration(PALL_RECOVERY_INTERVAL_FORMULA),
        );
    }

    /**
     * Post the **Face the Pall** offer — an informational choice card presenting
     * the three fates (Embrace / Vacate / Accept True Death). The choice is always
     * the victim's, so this only surfaces the decision; it does not apply it.
     *
     * @returns A promise that resolves once the card is posted.
     */
    private async offerFacePall(): Promise<void> {
        await postActionCard(this.speaker, {
            template: "systems/sohl/templates/chat/face-pall-card.hbs",
            data: {
                actorName: (this.actorLogic as { name?: string })?.name ?? "",
            },
        });
    }

    /**
     * Define and return all intrinsic actions for trauma logic, adding the
     * treatment and healing test actions to those inherited from the base logic.
     * @returns The intrinsic action definitions.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlItemBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "requestTreatment",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.requestTreatment.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-hand",
                executor: "requestTreatment",
                visible: "itemLogic.data.subType === 'physical'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "treatInjury",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.treatInjury.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-staff-snake",
                executor: "treatInjury",
                visible: "itemLogic.data.subType === 'physical'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "treatmenttest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.treatmenttest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-staff-snake",
                executor: "treatmentTest",
                visible: "itemLogic.data.subType === 'physical'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "healingtest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.healingtest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-heart-pulse",
                executor: "healingTest",
                visible: "itemLogic.data.subType === 'physical'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "healingCheck",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.healingCheck.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-heart-pulse",
                executor: "healingCheck",
                recordsLastRun: true,
                visible: "itemLogic.data.subType === 'physical'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "bloodLossAdvanceCheck",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.bloodLossAdvanceCheck.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-droplet",
                executor: "bloodLossAdvanceCheck",
                recordsLastRun: true,
                visible: "itemLogic.isBleeding",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "courseCheck",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.courseCheck.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-wave-pulse",
                executor: "courseCheck",
                recordsLastRun: true,
                visible:
                    "itemLogic.data.subType === 'shock' || itemLogic.data.subType === 'coma' || itemLogic.data.subType === 'infection'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "psycheRecovery",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.psycheRecovery.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-brain",
                executor: "psycheRecovery",
                recordsLastRun: true,
                visible: "itemLogic.data.subType === 'psycond'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "auralShockRecovery",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.auralShockRecovery.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-wand-sparkles",
                executor: "auralShockRecovery",
                recordsLastRun: true,
                visible: "itemLogic.data.subType === 'auralshock'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "pallRecovery",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.pallRecovery.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-skull",
                executor: "pallRecovery",
                recordsLastRun: true,
                visible: "itemLogic.data.subType === 'pall'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
        ];
    }

    /**
     * Whether the trauma has received medical treatment. Derived: true when a
     * {@link TraumaData.treatmentDate | treatmentDate} is set.
     */
    get isTreated(): boolean {
        return this.data.treatmentDate != null;
    }

    /**
     * Whether the wound is actively bleeding. Derived (#482): true when the
     * blood-loss advance timer is armed — i.e. `bloodLossAdvanceDurationBase`
     * is set. A non-bleeding wound leaves that field `null`.
     */
    get isBleeding(): boolean {
        return this.data.bloodLossAdvanceDurationBase != null;
    }

    /**
     * Localized qualitative label for the current effective level.
     *
     * For `FEAR` and `MORALE` subtypes the level (0–5) maps to a named severity
     * (Brave, Steady, Afraid/Withdrawing, Terrified/Routed, Catatonic). Other
     * subtypes return the numeric level as a string.
     */
    get levelLabel(): string {
        // `level` is a ValueModifier seeded in initialize(); guard against it
        // being unset (a not-yet-initialized trauma, e.g. freshly dropped and
        // read by the sheet before its lifecycle runs) so this getter can never
        // throw and brick the whole sheet render (#511).
        const lvl = Math.max(0, Math.round(this.level?.effective ?? 0));
        if (this.data.subType === TRAUMA_SUBTYPE.FEAR && isFearLevel(lvl)) {
            return sohl.i18n.localize(FEAR_LABEL_BY_LEVEL[lvl]);
        }
        if (this.data.subType === TRAUMA_SUBTYPE.MORALE && isMoraleLevel(lvl)) {
            return sohl.i18n.localize(MORALE_LABEL_BY_LEVEL[lvl]);
        }
        return String(lvl);
    }

    /**
     * Localized qualitative label for the current sub-category.
     *
     * For the `FATIGUE` subtype the {@link TraumaData.category | category} field
     * is expected to be one of `FATIGUE_CATEGORY`.
     * Other subtypes return the raw category string (or an empty string if
     * unset).
     */
    get categoryLabel(): string {
        const cat = this.data.category;
        if (!cat) return "";
        if (
            this.data.subType === TRAUMA_SUBTYPE.FATIGUE &&
            isFatigueCategory(cat)
        ) {
            return sohl.i18n.localize(FATIGUE_LABEL_BY_CATEGORY[cat]);
        }
        return cat;
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.level = new entity.ValueModifier(this).setBase(
            this.data.levelBase,
        );
        this.healingRate = new entity.ValueModifier(
            {},
            { parent: this },
        ).setBase(this.data.healingRateBase ?? 0);
        this.healingCheckDurationBase = new entity.ValueModifier(
            {},
            { parent: this },
        ).setBase(this.data.healingCheckDurationBase ?? 0);
        this.bloodLossAdvanceDurationBase = new entity.ValueModifier(
            {},
            { parent: this },
        ).setBase(this.data.bloodLossAdvanceDurationBase ?? 0);
        this.courseDurationBase = new entity.ValueModifier(
            {},
            { parent: this },
        ).setBase(this.data.courseDurationBase ?? 0);
        this.bodyLocation = undefined;
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        this.bodyLocation = this.resolveBodyLocation();
    }

    /**
     * Re-arm this trauma's persisted schedules into the event queue on every
     * preparation, on every client (issue #588 generic store; #579 consent). The
     * recurrence anchor and interval now live in `system.scheduledActions` (the
     * retired bespoke `last*Date` anchors are gone); a reschedule `update()`
     * replicates, every client re-preps, and this generic re-arm restores the
     * queue — the active GM's included, which alone fires. The executors add,
     * offer to re-add, or clear those entries; `finalize()` never invents a
     * schedule of its own.
     */
    override finalize(): void {
        super.finalize();
        const uuid = this.item?.uuid;
        if (!uuid) return;
        armScheduledActions(uuid, this.data.scheduledActions, sohl.events);
    }

    /** Whether this trauma is an Extended Shock or Coma lasting-shock record. */
    private get isShockOrComa(): boolean {
        return (
            this.data.subType === TRAUMA_SUBTYPE.SHOCK ||
            this.data.subType === TRAUMA_SUBTYPE.COMA
        );
    }

    /**
     * Whether this trauma recovers through a **Course Test** — an Extended Shock,
     * Coma, or Infection lasting condition (#556/#557).
     */
    private get isCourseTrauma(): boolean {
        return (
            this.isShockOrComa || this.data.subType === TRAUMA_SUBTYPE.INFECTION
        );
    }

    /**
     * Roll a duration formula to a number of seconds. Falls back to a plain
     * numeric parse (the default settings are bare second counts), or `0` when
     * neither yields a finite number.
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
     * Intrinsic-action executor for the recurring `healingCheck` event.
     *
     * Catches up the Injury Healing Test over every elapsed interval, rolls the
     * next interval from {@link TraumaData.healingCheckDurationFormula}, then
     * **offers** the next `healingCheck` occurrence (issue #579) — it no longer
     * auto-re-arms. Registered as an action so the same routine serves the
     * `[Perform]` reminder, the timed event, and a manual invocation.
     *
     * @param context - The action context; `scope.schedule` (or the offer
     *   dialog) decides whether the next occurrence is scheduled.
     * @returns A promise that resolves once the outcome and schedule are persisted.
     * @remarks For an `injury`-subtype trauma this applies the **Injury Healing
     *   Test** (#486) at each elapsed checkpoint, in sequence: a headless test of
     *   `Healing Base × Healing Rate` reduces the Injury Level by 1 on a marginal
     *   success and 2 on a critical success (a marginal failure does nothing; a
     *   critical failure does no healing — infection-on-CF is completed by #557).
     *   No test is made while the injury is untreated, already healed (level 0),
     *   or while any active infection halts the patient's healing. Other trauma
     *   subtypes recover by their own rules. The recurrence anchor and interval
     *   are read from the persisted `system.scheduledActions` entry (the queue
     *   does not cascade — see the Event Queue contract). A wound that heals to
     *   level 0 ends the recurrence (`sohl.unschedule`); otherwise the next check
     *   is offered. An eligible injury (see
     *   {@link TraumaData.permanentImpairmentEligible}) that heals to level 0 this
     *   pass leaves a **permanent impairment** on its body part, scaled by its
     *   total time to heal (#554).
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

        // Catch up over every elapsed interval in `(anchor, now]` in one pass —
        // the queue does not cascade (see the Event Queue contract).
        const checkpoints =
            interval > 0 ? elapsedCheckpoints(anchor, now, interval) : [];
        const lastProcessed = checkpoints.at(-1) ?? now;

        // Injury Healing Test at each elapsed checkpoint, in sequence (each roll
        // reduces the level the next one sees). Only injuries heal this way, and
        // only once treated and while not halted by an active infection.
        let level = this.data.levelBase;
        let contractInfection = false;
        if (this.data.subType === TRAUMA_SUBTYPE.INJURY && this.isTreated) {
            for (
                let i = 0;
                i < checkpoints.length && level > 0 && !this.healingHalted;
                i++
            ) {
                const sl = await this.rollHealingTest();
                if (sl == null) break; // roll refused (e.g. speaker not owned)
                if (sl >= CRITICAL_SUCCESS) level = Math.max(0, level - 2);
                else if (sl >= MARGINAL_SUCCESS) level = Math.max(0, level - 1);
                else if (sl <= CRITICAL_FAILURE && this.data.infectable) {
                    // CF on an infectable wound contracts an infection (#557),
                    // which then halts further healing — stop the catch-up here.
                    contractInfection = true;
                    break;
                }
                // MF (0): no healing.
            }
        }

        const nextInterval = this.rollDuration(
            this.data.healingCheckDurationFormula,
        );
        this.healingCheckDurationBase.setBase(nextInterval);
        await this.item.update({
            "system.levelBase": level,
            "system.healingCheckDurationBase": nextInterval,
        } as PlainObject);

        // An eligible injury that just healed to level 0 leaves a permanent
        // impairment scaled by how long it took to heal (#554).
        if (
            this.data.subType === TRAUMA_SUBTYPE.INJURY &&
            this.data.permanentImpairmentEligible &&
            this.data.levelBase > 0 &&
            level === 0 &&
            this.data.contractDate != null
        ) {
            const days =
                (lastProcessed - this.data.contractDate) / SECONDS_PER_DAY;
            const magnitude = permanentImpairmentFor(days);
            if (magnitude < 0) {
                await (this.actorLogic as any)?.applyPermanentImpairment?.(
                    this.data.bodyLocationCode,
                    magnitude,
                );
            }
        }

        // A Critical-Failure healing test on an infectable wound contracts an
        // infection (#557) — recorded separately, starting one Healing Rate step
        // above this wound.
        if (contractInfection) await this.contractInfection(context);

        // A healed wound (level 0) ends its recurrence; otherwise offer the next
        // healing check (default No) rather than auto-re-arming (issue #579).
        if (level <= 0) await sohl.unschedule(this.item, "healingCheck");
        else
            await offerSchedule(
                context,
                this.item,
                "healingCheck",
                nextInterval,
            );
    }

    /**
     * Contract an **infection** (#557) from this wound: create a separate
     * `infection`-subtype trauma starting at a Healing Rate one step above this
     * injury's (Injury Level "X", aspect "Inf"). While any infection is active it
     * halts all Injury Healing Tests (see {@link healingHalted}).
     *
     * @param context - The healing-check context, forwarded to the new
     *   infection's course-check schedule offer (issue #579).
     * @returns A promise that resolves once the infection trauma is created.
     */
    private async contractInfection(context: SohlActionContext): Promise<void> {
        if (!this.actorLogic) return;
        const hr = Math.round(this.healingRate?.effective ?? 0) + 1;
        const created = await fvttCreateEmbeddedItems(this.actorLogic, [
            {
                type: ITEM_KIND.TRAUMA,
                name: sohl.i18n.localize("SOHL.Trauma.Infection"),
                system: {
                    subType: TRAUMA_SUBTYPE.INFECTION,
                    levelBase: 0,
                    healingRateBase: hr,
                    aspect: IMPACT_ASPECT.BLUNT,
                    bodyLocationCode: this.data.bodyLocationCode,
                },
            },
        ]);
        // Offer the new infection's recovery Course Test rather than auto-arming
        // it (issue #579); forwards the healing-check context's skipDialog.
        const infection = created?.[0];
        if (!infection) return;
        const interval = Number(infection.system?.courseDurationBase) || 0;
        await offerSchedule(context, infection, "courseCheck", interval);
    }

    /**
     * Whether the patient's injury healing is currently **halted** — true while
     * the owning actor carries any active `infection`-subtype trauma (an active
     * infection stops all Injury Healing Tests until every infection is defeated).
     */
    get healingHalted(): boolean {
        const traumas = (this.actorLogic?.logicTypes?.[ITEM_KIND.TRAUMA] ??
            []) as TraumaLogic[];
        // An infection has Injury Level "X" (0), so its *activity* is measured by
        // its Healing Rate: it is unhealed while HR is below 6 (#557).
        return traumas.some(
            (t) =>
                t.data.subType === TRAUMA_SUBTYPE.INFECTION &&
                (t.healingRate?.effective ?? 0) < 6,
        );
    }

    /**
     * Roll one headless **Injury Healing Test** — `Healing Base × Healing Rate`
     * (Healing Base from the owning being, Healing Rate from this trauma) — and
     * return the normalized success level (−1/0/1/2), or `null` if the roll was
     * refused (e.g. the speaker is not owned).
     *
     * @returns The normalized success level, or `null`.
     */
    private async rollHealingTest(): Promise<number | null> {
        const healingBase =
            (this.actorLogic as any)?.healingBase?.effective ?? 0;
        const eml = healingBase * (this.healingRate?.effective ?? 0);
        const result = await rollTimedTest(this, eml, {
            noChat: true,
            type: "trauma-healingtest",
            title: sohl.i18n.localize("SOHL.Trauma.Action.healingtest.title"),
        });
        return result ? result.normSuccessLevel : null;
    }

    /**
     * Intrinsic-action executor for the recurring blood-loss advance of a
     * bleeding wound.
     *
     * Catches up the Blood Loss Advance Test over every elapsed interval, rolls
     * the next interval from {@link TraumaData.bloodLossAdvanceDurationFormula},
     * then **offers** the next `bloodLossAdvanceCheck` occurrence (issue #579)
     * rather than auto-re-arming.
     *
     * @param context - The action context; `scope.schedule` (or the offer
     *   dialog) decides whether the next occurrence is scheduled.
     * @returns A promise that resolves once the outcome and schedule are persisted.
     * @remarks Applies the **Blood Loss Advance Test** (#487) at each elapsed
     *   checkpoint. With no physician accepting the Blood Stoppage request, the
     *   advance auto-resolves as though a Blood Stoppage Test had been a critical
     *   failure — the bleeding continues (the interactive physician Accept card is
     *   #547). Each test rolls against the victim's Strength Mastery Level, accrues
     *   Blood Loss Points (CF +3, MF +2, MS +1, CS 0), advances the being's shock
     *   state one step per BLP, and inflicts 5 Fatigue Levels of weakness (anemia)
     *   per BLP. The recurrence anchor and interval are read from the persisted
     *   `system.scheduledActions` entry; a wound that has stopped bleeding ends
     *   the recurrence.
     */
    async bloodLossAdvanceCheck(context: SohlActionContext): Promise<void> {
        const uuid = this.item?.uuid;
        if (!uuid) return;
        const now = fvttWorldTime();
        const entry = this.data.scheduledActions?.find(
            (e) => e.actionName === "bloodLossAdvanceCheck",
        );
        const interval =
            entry?.interval ?? this.bloodLossAdvanceDurationBase.effective;
        const anchor = entry?.anchor ?? now;
        const checkpoints =
            interval > 0 ? elapsedCheckpoints(anchor, now, interval) : [];

        // Apply one Blood Loss Advance Test per elapsed checkpoint, in sequence.
        for (let i = 0; i < checkpoints.length && this.isBleeding; i++) {
            await this.applyBloodLossAdvance();
        }

        const nextInterval = this.rollDuration(
            this.data.bloodLossAdvanceDurationFormula,
        );
        this.bloodLossAdvanceDurationBase.setBase(nextInterval);
        await this.item.update({
            "system.bloodLossAdvanceDurationBase": nextInterval,
        } as PlainObject);

        // A wound that has stopped bleeding ends its recurrence; otherwise offer
        // the next blood-loss advance rather than auto-re-arming (issue #579).
        if (!this.isBleeding) {
            await sohl.unschedule(this.item, "bloodLossAdvanceCheck");
        } else {
            await offerSchedule(
                context,
                this.item,
                "bloodLossAdvanceCheck",
                nextInterval,
            );
        }
    }

    /**
     * Resolve one Blood Loss Advance Test (#487): the auto-resolve fallback
     * (bleeding continues), a headless roll against the victim's Strength Mastery
     * Level, and its consequences — shock-state advance and anemia fatigue.
     *
     * @returns A promise that resolves once the consequences are applied.
     */
    private async applyBloodLossAdvance(): Promise<void> {
        const actorLogic = this.actorLogic;
        if (!actorLogic) return;
        const strMl =
            (actorLogic.getItemLogic("str", ITEM_KIND.ATTRIBUTE) as any)
                ?.masteryLevel?.effective ?? 0;
        const result = await rollTimedTest(this, strMl, {
            noChat: true,
            type: "trauma-bloodloss",
            title: sohl.i18n.localize(
                "SOHL.Trauma.Action.bloodLossAdvanceCheck.title",
            ),
        });
        if (!result) return;
        // Blood Loss Points by success level: CF (−1) +3, MF (0) +2, MS (1) +1,
        // CS (2) 0. That is `2 − normSuccessLevel`, clamped to [0, 3].
        const blp = Math.max(0, Math.min(3, 2 - result.normSuccessLevel));
        if (blp <= 0) return;
        // Each BLP advances the shock state one step toward Dead...
        await (actorLogic as any).advanceShockState?.(blp);
        // ...and inflicts 5 Fatigue Levels of weakness (anemia) per BLP.
        await this.inflictAnemiaFatigue(blp * 5);
    }

    /**
     * Inflict `levels` Fatigue Levels of **weakness** fatigue (the anemia of
     * ongoing blood loss) as a new fatigue-subtype trauma on the owning actor.
     *
     * @param levels - The Fatigue Levels to inflict.
     * @returns A promise that resolves once the fatigue trauma is created.
     */
    private async inflictAnemiaFatigue(levels: number): Promise<void> {
        await inflictWeaknessFatigue(
            this.actorLogic,
            levels,
            sohl.i18n.localize("SOHL.Trauma.Anemia"),
        );
    }

    /**
     * Intrinsic-action executor for the recurring **Extended Shock / Coma Course
     * Test** (#556).
     *
     * At each elapsed checkpoint the victim rolls a headless course test —
     * `Healing Base × Healing Rate` (fatigue applies) — that adjusts the
     * lasting-shock Healing Rate (CF −2 / MF −1 / MS +1 / CS +2). If the Healing
     * Rate falls to **0 or below** the victim **dies** (shock state Dead); if it
     * rises to **6 or above** the victim **recovers** — a Coma additionally
     * inflicts weariness fatigue equal to the days spent in the coma, and the
     * being's shock state is cleared (a victim who still has a Coma stays
     * Unconscious). Otherwise the next course check is **offered** (issue #579)
     * rather than auto-re-armed.
     *
     * @param context - The action context; `scope.schedule` (or the offer
     *   dialog) decides whether the next occurrence is scheduled.
     * @returns A promise that resolves once the course outcome is persisted.
     */
    async courseCheck(context: SohlActionContext): Promise<void> {
        const uuid = this.item?.uuid;
        if (!uuid || !this.isCourseTrauma) return;
        const isInfection = this.data.subType === TRAUMA_SUBTYPE.INFECTION;
        const now = fvttWorldTime();
        const entry = this.data.scheduledActions?.find(
            (e) => e.actionName === "courseCheck",
        );
        const interval = entry?.interval ?? this.courseDurationBase.effective;
        const anchor = entry?.anchor ?? now;
        const checkpoints =
            interval > 0 ? elapsedCheckpoints(anchor, now, interval) : [];
        const lastProcessed = checkpoints.at(-1) ?? now;

        // Course Test at each elapsed checkpoint, in sequence (each adjusts the
        // Healing Rate the next one sees), until it ends the course (HR out of
        // the [1, 5] band) or the checkpoints run out. An infection never kills —
        // its Healing Rate floors at 1 rather than dropping to death.
        let hr = this.data.healingRateBase ?? 0;
        for (let i = 0; i < checkpoints.length && hr >= 1 && hr <= 5; i++) {
            const sl = await this.rollShockCourseTest(hr);
            if (sl == null) break; // roll refused
            hr += shockCourseHrDelta(sl);
            if (isInfection) hr = Math.max(1, hr);
        }

        const nextInterval = this.rollDuration(this.data.courseDurationFormula);
        this.courseDurationBase.setBase(nextInterval);

        // A still-active infection saps the body by its Healing-Rate band (#557).
        if (isInfection && hr < 6) await this.inflictInfectionWeakness(hr);

        if (hr <= 0) {
            // Death (Extended Shock / Coma only) — the victim dies on the spot.
            await (this.actorLogic as any)?.setShockState?.(SHOCK_STATE.DEAD);
            await this.item.update({
                "system.healingRateBase": 0,
                "system.courseDurationBase": nextInterval,
            } as PlainObject);
            await sohl.unschedule(this.item, "courseCheck");
            return;
        }

        if (hr >= 6) {
            // Recovery — Extended Shock / Coma clear the shock state (and a Coma
            // adds weariness fatigue); an Infection is simply healed, which lets
            // normal injury healing resume (see healingHalted).
            if (!isInfection) await this.resolveShockRecovery(lastProcessed);
            await this.item.update({
                "system.healingRateBase": hr,
                "system.courseDurationBase": nextInterval,
            } as PlainObject);
            await sohl.unschedule(this.item, "courseCheck");
            return;
        }

        // Course still running (HR 1–5): offer the next check rather than
        // auto-re-arming (issue #579).
        await this.item.update({
            "system.healingRateBase": hr,
            "system.courseDurationBase": nextInterval,
        } as PlainObject);
        await offerSchedule(context, this.item, "courseCheck", nextInterval);
    }

    /**
     * Inflict an infection's **weakness fatigue** by its current Healing Rate
     * band (#557): Healing Rate 1–2 → 10 Fatigue Levels, 3–4 → 5, 5+ → none.
     *
     * @param hr - The infection's current Healing Rate.
     * @returns A promise that resolves once any fatigue is inflicted.
     */
    private async inflictInfectionWeakness(hr: number): Promise<void> {
        const levels =
            hr <= 2 ? 10
            : hr <= 4 ? 5
            : 0;
        if (levels <= 0) return;
        await inflictWeaknessFatigue(
            this.actorLogic,
            levels,
            sohl.i18n.localize("SOHL.Trauma.Infection"),
        );
    }

    /**
     * Roll one headless **Extended Shock / Coma Course Test** — `Healing Base ×
     * Healing Rate`, with the being's fatigue penalty applied — and return the
     * normalized success level (−1/0/1/2), or `null` if the roll was refused.
     *
     * @param hr - The lasting-shock trauma's current Healing Rate.
     * @returns The normalized success level, or `null`.
     */
    private async rollShockCourseTest(hr: number): Promise<number | null> {
        const actorLogic = this.actorLogic as any;
        const healingBase = actorLogic?.healingBase?.effective ?? 0;
        const fatigue = actorLogic?.fatiguePenalty?.effective ?? 0;
        const result = await rollTimedTest(
            this,
            healingBase * Math.max(0, hr),
            {
                noChat: true,
                type: `trauma-${this.data.subType}-course`,
                title: sohl.i18n.localize(
                    "SOHL.Trauma.Action.courseCheck.title",
                ),
                situationalModifier: -fatigue,
            },
        );
        return result ? result.normSuccessLevel : null;
    }

    /**
     * Apply the recovery from an Extended Shock / Coma trauma: a Coma inflicts
     * weariness fatigue equal to the days spent in it, and the being's shock
     * state is cleared to `None` — unless another active Coma remains, in which
     * case the being stays Unconscious.
     *
     * @param recoveredAt - The world-time at which recovery occurred.
     * @returns A promise that resolves once the recovery is applied.
     */
    private async resolveShockRecovery(recoveredAt: number): Promise<void> {
        if (
            this.data.subType === TRAUMA_SUBTYPE.COMA &&
            this.data.contractDate != null
        ) {
            const days = Math.max(
                0,
                Math.round(
                    (recoveredAt - this.data.contractDate) / SECONDS_PER_DAY,
                ),
            );
            await inflictWeaknessFatigue(
                this.actorLogic,
                days,
                sohl.i18n.localize("SOHL.Trauma.ComaWeariness"),
            );
        }
        const target =
            this.hasOtherActiveComa() ?
                SHOCK_STATE.UNCONSCIOUS
            :   SHOCK_STATE.NONE;
        await (this.actorLogic as any)?.setShockState?.(target);
    }

    /**
     * Whether the owning being carries another active `coma`-subtype trauma
     * (Healing Rate 1–5) besides this one — a victim leaving Extended Shock while
     * still comatose stays Unconscious.
     *
     * @returns `true` when another active Coma remains.
     */
    private hasOtherActiveComa(): boolean {
        const traumas = (this.actorLogic?.logicTypes?.[ITEM_KIND.TRAUMA] ??
            []) as TraumaLogic[];
        return traumas.some((t) => {
            if (t === this || t.data.subType !== TRAUMA_SUBTYPE.COMA) {
                return false;
            }
            const hr = t.healingRate?.effective ?? 0;
            return hr >= 1 && hr <= 5;
        });
    }

    /**
     * Look up the {@link BodyLocation} referenced by `bodyLocationCode`
     * on the being's body. Returns `undefined` when the code is blank,
     * the trauma is not attached to an actor, the being is incorporeal
     * (no body structure), or no location with that shortcode exists.
     *
     * @returns The matching body location, or `undefined` when none applies.
     */
    private resolveBodyLocation(): BodyLocation | undefined {
        const code = this.data.bodyLocationCode;
        if (!code) return undefined;
        return getActorBody(this.actorLogic)
            ?.structure?.getAllLocations()
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
    /**
     * The trauma's nature — an injury, or a mind/spirit/body condition
     * (fear, morale, pall, psychological-condition, aural-shock, fatigue,
     * infection, shock, coma).
     */
    subType: TraumaSubType;
    /**
     * Sub-category within a subtype — e.g. a `fatigue` trauma's category is a
     * `FATIGUE_CATEGORY` (windedness / weariness /
     * weakness). Empty for subtypes with no sub-category.
     */
    category: string;
    /** Severity on a graduated scale: M1, S2-S3, G4-G5 */
    levelBase: number;
    /** Base rate of wound healing per time period; `null` until established. */
    healingRateBase: number | null;
    /** Type of damage: Blunt, Edged, Piercing, or Fire */
    aspect: ImpactAspect;
    /** World-time (seconds) at which the injury was contracted. */
    contractDate: number | null;
    /**
     * World-time (seconds) at which medical treatment was applied, or `null`
     * if untreated. `isTreated` is derived from this on the logic.
     */
    treatmentDate: number | null;
    /** Formula rolled to seed the healing-check interval. */
    healingCheckDurationFormula: string;
    /** Rolled seconds between healing checks; `null` until rolled. */
    healingCheckDurationBase: number | null;
    /** Formula rolled to seed the blood-loss-advance interval. */
    bloodLossAdvanceDurationFormula: string;
    /** Rolled seconds between blood-loss advances; `null` until rolled. */
    bloodLossAdvanceDurationBase: number | null;
    /** Formula rolled to seed the Extended Shock / Coma course-check interval. */
    courseDurationFormula: string;
    /** Rolled seconds between course checks; `null` until rolled. */
    courseDurationBase: number | null;
    /**
     * Whether this injury is eligible for **permanent impairment** should it
     * heal slowly. Set by the Treatment Test (#553) from the wound's aspect,
     * severity, and resulting Healing Rate; the impairment magnitude itself is
     * applied by the Impairment system (#554). Always `false` for non-injury
     * traumas.
     */
    permanentImpairmentEligible: boolean;
    /**
     * Whether this injury is exposed to **infection** — set by the Treatment Test
     * for a poorly-treated wound (#553). A Critical-Failure Injury Healing Test on
     * an infectable wound contracts an infection (#557).
     */
    infectable: boolean;
    /**
     * Shortcode of the body location on the being's body where this
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
    /** New-injury baseline for an untreated wound (`null` = none). */
    newInj: null,
} as const;

/**
 * Re-exported from `constants.ts` for back-compat with existing import
 * sites. The canonical definition lives in constants so the Foundry-free
 * domain layer (e.g. injury resolution) can consume it without importing
 * this Foundry-coupled module.
 */
export { INJURY_LEVELS };
