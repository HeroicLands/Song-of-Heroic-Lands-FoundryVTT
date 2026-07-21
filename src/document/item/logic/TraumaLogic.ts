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
import { fvttWorldTime, fvttGetSetting } from "@src/core/FoundryHelpers";
import { inflictWeaknessFatigue } from "@src/document/item/logic/fatigue";
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
import { deriveNext, elapsedCheckpoints } from "@src/entity/event/scheduling";
import type { SohlAction } from "@src/entity/action/SohlAction";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import type { BodyLocation } from "@src/entity/body/BodyLocation";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import {
    ACTION_SUBTYPE,
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    defineType,
    FATIGUE_CATEGORY,
    FatigueCategoryLabels,
    FEAR_LEVEL,
    FearLevelLabels,
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
     * @param _context - The action context for the test.
     * @returns The success test result, or `null` for a non-injury/healed trauma
     *   or a headless critical-failure resolution.
     */
    async treatmentTest(
        _context: SohlActionContext,
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
        await this.applyTreatmentResult(sl, band, req?.code);
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
     * @returns A promise that resolves once the outcome is persisted.
     */
    private async applyTreatmentResult(
        normSuccessLevel: number,
        band: InjuryBand,
        code: TreatmentCode | undefined,
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

        // Special injury effects. A surgical mishap (EXT/SUR on a failure) or a
        // grievous blunt/edged/piercing wound left at HR 2–3 becomes a bleeder;
        // arm the blood-loss timer if it is not already bleeding.
        const bleeder =
            treatmentCausesBleeder(code, normSuccessLevel) ||
            isBleederFromHealingRate(this.data.aspect, band, hr);
        if (bleeder && !this.isBleeding) {
            const formula = String(
                fvttGetSetting("sohl", "bloodLossAdvanceDurationFormula") ?? "",
            );
            update["system.bloodLossAdvanceDurationFormula"] = formula;
            update["system.bloodLossAdvanceDurationBase"] =
                Number(formula) || 0;
            update["system.lastBloodLossAdvanceDate"] = now;
        }

        if (isPermanentImpairmentEligible(this.data.aspect, band, hr)) {
            update["system.permanentImpairmentEligible"] = true;
        }

        await this.item.update(update);
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
     * Define and return all intrinsic actions for trauma logic, adding the
     * treatment and healing test actions to those inherited from the base logic.
     * @returns The intrinsic action definitions.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlItemBaseLogic.defineIntrinsicActions(),
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
                visible: "itemLogic.isBleeding",
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
        const uuid = this.item?.uuid;
        if (!uuid) return;

        // Healing check — recurring while the wound persists. Scheduled from the
        // persisted anchor (never the live clock); see the Event Queue contract.
        if (
            this.level.effective > 0 &&
            this.data.lastHealingCheckDate != null
        ) {
            sohl.events.scheduleAt(
                uuid,
                "healingCheck",
                deriveNext(
                    this.data.lastHealingCheckDate,
                    this.healingCheckDurationBase.effective,
                ),
            );
        } else {
            sohl.events.unsubscribe(uuid, "healingCheck");
        }

        // Blood-loss advance — recurring while the wound bleeds (derived: a
        // bleeder is one with an armed blood-loss timer, #482).
        if (this.isBleeding && this.data.lastBloodLossAdvanceDate != null) {
            sohl.events.scheduleAt(
                uuid,
                "bloodLossAdvanceCheck",
                deriveNext(
                    this.data.lastBloodLossAdvanceDate,
                    this.bloodLossAdvanceDurationBase.effective,
                ),
            );
        } else {
            sohl.events.unsubscribe(uuid, "bloodLossAdvanceCheck");
        }
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
     * Advances the healing-check anchor to now, rolls the next interval from
     * {@link TraumaData.healingCheckDurationFormula}, and schedules the next
     * `healingCheck` occurrence. Registered as an action so the same routine
     * serves the timed event and a manual invocation.
     *
     * @param _context - The action context (its `scope` is the trigger context).
     * @returns A promise that resolves once the anchor is persisted.
     * @remarks For an `injury`-subtype trauma this applies the **Injury Healing
     *   Test** (#486) at each elapsed checkpoint, in sequence: a headless test of
     *   `Healing Base × Healing Rate` reduces the Injury Level by 1 on a marginal
     *   success and 2 on a critical success (a marginal failure does nothing; a
     *   critical failure does no healing — infection-on-CF is completed by #557).
     *   No test is made while the injury is untreated, already healed (level 0),
     *   or while any active infection halts the patient's healing. Other trauma
     *   subtypes recover by their own rules and only re-arm here. In all cases
     *   the recurrence anchor is advanced over every elapsed interval and re-armed
     *   via {@link deriveNext} (the queue does not cascade — see the Event Queue
     *   contract).
     */
    async healingCheck(_context: SohlActionContext): Promise<void> {
        const uuid = this.item?.uuid;
        if (!uuid) return;
        const now = fvttWorldTime();
        const interval = this.healingCheckDurationBase.effective;
        const anchor = this.data.lastHealingCheckDate ?? now;

        // Catch up the recurrence anchor over every elapsed interval in
        // `(anchor, now]` in one pass — the queue does not cascade (see the
        // Event Queue contract).
        const checkpoints =
            interval > 0 ? elapsedCheckpoints(anchor, now, interval) : [];
        const lastProcessed = checkpoints.at(-1) ?? now;

        // Injury Healing Test at each elapsed checkpoint, in sequence (each roll
        // reduces the level the next one sees). Only injuries heal this way, and
        // only once treated and while not halted by an active infection.
        let level = this.data.levelBase;
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
                // MF (0): no healing. CF (−1): no healing; infection is #557.
            }
        }

        const nextInterval = this.rollDuration(
            this.data.healingCheckDurationFormula,
        );
        this.healingCheckDurationBase.setBase(nextInterval);
        sohl.events.scheduleAt(
            uuid,
            "healingCheck",
            deriveNext(lastProcessed, nextInterval),
        );
        await this.item.update({
            "system.levelBase": level,
            "system.lastHealingCheckDate": lastProcessed,
            "system.healingCheckDurationBase": nextInterval,
        } as PlainObject);
    }

    /**
     * Whether the patient's injury healing is currently **halted** — true while
     * the owning actor carries any active `infection`-subtype trauma (an active
     * infection stops all Injury Healing Tests until every infection is defeated).
     */
    get healingHalted(): boolean {
        const traumas = (this.actorLogic?.logicTypes?.[ITEM_KIND.TRAUMA] ??
            []) as TraumaLogic[];
        return traumas.some(
            (t) =>
                t.data.subType === TRAUMA_SUBTYPE.INFECTION &&
                (t.level?.effective ?? 0) > 0,
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
     * Intrinsic-action executor that arms the recurring blood-loss advance for a
     * bleeding wound.
     *
     * Advances the blood-loss anchor to now, rolls the next interval from
     * {@link TraumaData.bloodLossAdvanceDurationFormula}, and schedules the
     * `bloodLossAdvanceCheck` occurrence.
     *
     * @param _context - The action context (its `scope` is the trigger context).
     * @returns A promise that resolves once the anchor is persisted.
     * @remarks Applies the **Blood Loss Advance Test** (#487) at each elapsed
     *   checkpoint. With no physician accepting the Blood Stoppage request, the
     *   advance auto-resolves as though a Blood Stoppage Test had been a critical
     *   failure — the bleeding continues (the interactive physician Accept card is
     *   #547). Each test rolls against the victim's Strength Mastery Level, accrues
     *   Blood Loss Points (CF +3, MF +2, MS +1, CS 0), advances the being's shock
     *   state one step per BLP, and inflicts 5 Fatigue Levels of weakness (anemia)
     *   per BLP. The anchor is advanced over every elapsed interval and re-armed.
     */
    async bloodLossAdvanceCheck(_context: SohlActionContext): Promise<void> {
        const uuid = this.item?.uuid;
        if (!uuid) return;
        const now = fvttWorldTime();
        const interval = this.bloodLossAdvanceDurationBase.effective;
        const anchor = this.data.lastBloodLossAdvanceDate ?? now;
        const checkpoints =
            interval > 0 ? elapsedCheckpoints(anchor, now, interval) : [];
        const lastProcessed = checkpoints.at(-1) ?? now;

        // Apply one Blood Loss Advance Test per elapsed checkpoint, in sequence.
        for (let i = 0; i < checkpoints.length && this.isBleeding; i++) {
            await this.applyBloodLossAdvance();
        }

        const nextInterval = this.rollDuration(
            this.data.bloodLossAdvanceDurationFormula,
        );
        this.bloodLossAdvanceDurationBase.setBase(nextInterval);
        sohl.events.scheduleAt(
            uuid,
            "bloodLossAdvanceCheck",
            deriveNext(lastProcessed, nextInterval),
        );
        await this.item.update({
            "system.lastBloodLossAdvanceDate": lastProcessed,
            "system.bloodLossAdvanceDurationBase": nextInterval,
        } as PlainObject);
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
    /** World-time of the last applied healing check (the recurrence anchor). */
    lastHealingCheckDate: number | null;
    /** Formula rolled to seed the blood-loss-advance interval. */
    bloodLossAdvanceDurationFormula: string;
    /** Rolled seconds between blood-loss advances; `null` until rolled. */
    bloodLossAdvanceDurationBase: number | null;
    /** World-time of the last applied blood-loss advance (the recurrence anchor). */
    lastBloodLossAdvanceDate: number | null;
    /**
     * Whether this injury is eligible for **permanent impairment** should it
     * heal slowly. Set by the Treatment Test (#553) from the wound's aspect,
     * severity, and resulting Healing Rate; the impairment magnitude itself is
     * applied by the Impairment system (#554). Always `false` for non-injury
     * traumas.
     */
    permanentImpairmentEligible: boolean;
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
