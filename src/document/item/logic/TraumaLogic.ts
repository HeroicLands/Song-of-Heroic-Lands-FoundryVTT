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
import type { SohlAction } from "@src/entity/action/SohlAction";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import type { BodyLocation } from "@src/entity/body/BodyLocation";
import type { CorpusLogic } from "@src/document/item/logic/CorpusLogic";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
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
    type SohlItemData,
} from "@src/document/item/logic/SohlItemBaseLogic";

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
     * The {@link BodyLocation} on the actor's Corpus that this trauma
     * affects, resolved from {@link TraumaData.bodyLocationCode}. When the
     * code is blank — or no matching location exists on the corpus — this
     * is `undefined`, indicating the trauma affects the whole body rather
     * than a specific location. Recomputed in {@link evaluate}.
     */
    bodyLocation: BodyLocation | undefined;

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Roll the treatment test, applying medical care to this trauma.
     *
     * Intrinsic-action executor for the `treatmenttest` action.
     *
     * @param _context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; warns and returns `null`.
     */
    async treatmentTest(
        _context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        sohl.log.uiWarn("Trauma Treatment Test is not yet implemented.");
        return null;
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
                iconFAClass: "sohl-caduceus",
                executor: "treatmentTest",
                visible: "itemLogic.data.subType === 'physical'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "healingtest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.healingtest.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-healing",
                executor: "healingTest",
                visible: "itemLogic.data.subType === 'physical'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "healingCheck",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.healingCheck.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-healing",
                executor: "healingCheck",
                visible: "itemLogic.data.subType === 'physical'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "bloodLossAdvanceCheck",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Trauma.Action.bloodLossAdvanceCheck.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-blood",
                executor: "bloodLossAdvanceCheck",
                visible: "itemLogic.data.isBleeding",
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
                this.data.lastHealingCheckDate +
                    this.healingCheckDurationBase.effective,
            );
        } else {
            sohl.events.unsubscribe(uuid, "healingCheck");
        }

        // Blood-loss advance — recurring while the wound bleeds.
        if (
            this.data.isBleeding &&
            this.data.lastBloodLossAdvanceDate != null
        ) {
            sohl.events.scheduleAt(
                uuid,
                "trauma::bloodLossAdvanceRoll",
                this.data.lastBloodLossAdvanceDate +
                    this.bloodLossAdvanceDurationBase.effective,
            );
        } else {
            sohl.events.unsubscribe(uuid, "trauma::bloodLossAdvanceRoll");
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
     * @remarks The healing **effect** — rolling the recovery test and applying it
     *   to the wound level — is not yet implemented; see issue #486.
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
     * Intrinsic-action executor that arms the recurring blood-loss advance for a
     * bleeding wound.
     *
     * Advances the blood-loss anchor to now, rolls the next interval from
     * {@link TraumaData.bloodLossAdvanceDurationFormula}, and schedules the
     * `trauma::bloodLossAdvanceRoll` occurrence.
     *
     * @param _context - The action context (its `scope` is the trigger context).
     * @returns A promise that resolves once the anchor is persisted.
     * @remarks The blood-loss **effect** — the advance roll and its consequences —
     *   is not yet implemented; see issue #487.
     */
    async bloodLossAdvanceCheck(_context: SohlActionContext): Promise<void> {
        const now = fvttWorldTime();
        const rolled = this.rollDuration(
            this.data.bloodLossAdvanceDurationFormula,
        );
        this.bloodLossAdvanceDurationBase.setBase(rolled);
        sohl.events.scheduleAt(
            this.item.uuid,
            "trauma::bloodLossAdvanceRoll",
            now + this.bloodLossAdvanceDurationBase.effective,
        );
        await this.item.update({
            "system.lastBloodLossAdvanceDate": now,
            "system.bloodLossAdvanceDurationBase": rolled,
        } as PlainObject);
    }

    /**
     * Look up the {@link BodyLocation} referenced by `bodyLocationCode`
     * on the actor's Corpus. Returns `undefined` when the code is blank,
     * the trauma is not attached to an actor, the actor has no Corpus,
     * or no location with that shortcode exists.
     *
     * @returns The matching body location, or `undefined` when none applies.
     */
    private resolveBodyLocation(): BodyLocation | undefined {
        const code = this.data.bodyLocationCode;
        if (!code) return undefined;
        const corpusLogic = this.actorLogic?.logicTypes[ITEM_KIND.CORPUS][0];
        return corpusLogic?.structure
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
    /** Whether the wound is actively bleeding */
    isBleeding: boolean;
    /**
     * Shortcode of the body location on the actor's Corpus where this
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
