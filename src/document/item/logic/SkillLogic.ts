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

import type { MysteryLogic } from "./MysteryLogic";
import type { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import type { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import {
    ACTION_SUBTYPE,
    ITEM_KIND,
    MYSTERY_SUBTYPE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    VALUE_DELTA_ID,
    VALUE_DELTA_INFO,
    type SkillSubType,
} from "@src/utils/constants";
import { FilePath, toFilePath } from "@src/utils/helpers";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import type { SohlItem } from "../foundry/SohlItem";
import { SohlItemBaseLogic, type SohlItemData } from "./SohlItemBaseLogic";
import {
    fvttGetSetting,
    fvttIsCurrentUserGM,
    fvttActiveTokenLogicForActor,
} from "@src/core/FoundryHelpers";
import { AttributeLogic } from "./AttributeLogic";
import { SohlAction } from "@src/entity/action/SohlAction";

/** Returns the fate-test description table with labels/descriptions resolved from i18n. */
export function getFateDescTable(): SuccessTestResult.LimitedDescription[] {
    const loc = (key: string) => sohl.i18n.localize(key);
    return [
        {
            maxValue: -1,
            label: loc("SOHL.Skill.FateDesc.loseFateNoEffect.label"),
            description: loc(
                "SOHL.Skill.FateDesc.loseFateNoEffect.description",
            ),
            lastDigits: [],
            success: false,
            result: 0,
        },
        {
            maxValue: 0,
            label: loc("SOHL.Skill.FateDesc.noLossNoEffect.label"),
            description: loc("SOHL.Skill.FateDesc.noLossNoEffect.description"),
            lastDigits: [],
            success: false,
            result: 0,
        },
        {
            maxValue: 1,
            label: loc("SOHL.Skill.FateDesc.success.label"),
            description: loc("SOHL.Skill.FateDesc.success.description"),
            lastDigits: [],
            success: true,
            result: 0,
        },
        {
            maxValue: 999,
            label: loc("SOHL.Skill.FateDesc.critSuccess.label"),
            description: loc("SOHL.Skill.FateDesc.critSuccess.description"),
            lastDigits: [],
            success: true,
            result: 0,
        },
    ];
}

/**
 * A trained capability with a mastery level.
 *
 * Skills represent learned abilities that characters use to accomplish tasks:
 * combat techniques, social interactions, crafting, perception, and more.
 * Each skill has a **skill base formula** (typically derived from one or more
 * traits like Strength, Dexterity, or Aura) and a **mastery level** representing
 * training and experience.
 *
 * Skills are categorized by {@link SkillData.subType | subType} (e.g., combat,
 * social, physical) and may be associated with a **weapon group** or a
 * **mystery**. A skill can also reference a **base skill** from which
 * it derives or shares advancement.
 *
 * Skills are the primary mechanism for resolving actions in SoHL. When a
 * character attempts a task, the relevant skill's mastery level is tested
 * against a target number, with modifiers from traits, gear, conditions,
 * and situational factors.
 *
 * Mastery level progression, fate integration, and SDR improvement are built
 * on {@link MasteryLevelModifier}.
 *
 * @typeParam TData - The Skill data interface.
 */
export class SkillLogic<
    TData extends SkillData = SkillData,
> extends SohlItemBaseLogic<TData> {
    /**
     * The parent (base) skill this skill specializes, resolved during
     * {@link evaluate} from {@link SkillData.parentSkillCode}, or `null` if
     * this skill has no parent.
     */
    parentSkill!: SkillLogic | null;

    /**
     * The number of mastery-level boosts applied to this skill. Each boost
     * raises the base mastery level by an amount that diminishes at higher
     * levels (see `calcMasteryBoost`).
     */
    boosts!: number;

    /**
     * The computed skill base value, derived by {@link calcSkillBase} from
     * {@link SkillData.skillBaseFormula} and resolved against the actor's
     * attributes and birthsign mysteries.
     */
    skillBase!: number;

    /**
     * The mastery level as a {@link MasteryLevelModifier}, seeded from
     * {@link SkillData.masteryLevelBase}.
     */
    masteryLevel!: MasteryLevelModifier;

    /**
     * The fate mastery level as a {@link MasteryLevelModifier}, used to resolve
     * {@link fateTest | fate tests}. Seeded from the actor's Aura attribute and
     * the `optionFate` setting; disabled when fate does not apply.
     */
    fateMasteryLevel!: MasteryLevelModifier;

    /**
     * Performs a fate test for this skill, consuming a charge from an
     * applicable Fate mystery on success.
     *
     * @param context - The action context (speaker, scope) for the test.
     * @returns Resolves once the test and any charge consumption complete. No-op
     *   when {@link fateMasteryLevel} is disabled or no charged fate item is found.
     */
    async fateTest(context: SohlActionContext): Promise<void> {
        if (this.fateMasteryLevel.disabled) return;

        //TODO(#71): Need to figure out which fate items to consume here
        const fateItem = this.availableFate.find(
            (it) =>
                (it.logic as unknown as MysteryLogic).charges.value.effective >
                0,
        );
        if (!fateItem) return;

        const fateContext = new SohlActionContext({
            speaker: context.speaker,
            type: `${this.data.kind}-${this.name}-fate-test`,
            title: sohl.i18n.format("SOHL.MasteryLevel.fateTest.title", {
                label: this.label,
            }),
            scope: {
                situationalModifier: 0,
                targetValueFunc: (successLevel: number) => successLevel,
                successStarTable: getFateDescTable(),
            },
        });

        const result = await this.fateMasteryLevel.successTest(fateContext);

        if (result && result.isSuccess) {
            const updateData: PlainObject = {};
            updateData["system.charges.value"] = Math.max(
                (fateItem.system.charges?.value ?? 0) - 1,
                0,
            );
            fateItem.update(updateData);
        }
    }

    /**
     * Recalculates the mastery level base using the roll formula stored in
     * `flags.sohl.rollFormula`. The formula is a standard Foundry VTT roll
     * expression where the variable `sb` is replaced with the skill base
     * value (always 0 for traits).
     *
     * If no roll formula flag is set, this method does nothing.
     */
    async recalculate(): Promise<void> {
        const rollFormula = this.data.getFlag("sohl", "rollFormula") as
            | string
            | undefined;
        if (!rollFormula) return;

        const sb = this._skillBaseForRoll;
        const resolved = rollFormula.replace(/\bsb\b/gi, String(sb));
        const roll = SimpleRoll.fromFormula(resolved, this);
        roll.roll();

        const updateData: PlainObject = {
            "system.masteryLevelBase": roll.total,
        };
        await this.data.update(updateData);
    }

    /**
     * The skill base value to substitute for `sb` in a roll formula.
     * Override in subclasses to provide a different value (e.g., traits
     * always return 0).
     */
    protected get _skillBaseForRoll(): number {
        return this.skillBase ?? 0;
    }

    /**
     * The magic modifier applied to this skill's fate mastery level. The base
     * implementation returns 0; subclasses may override to contribute a bonus.
     */
    get magicMod(): number {
        return 0;
    }

    /**
     * Searches through all of the Fate mysteries on the actor, gathering any that
     * are applicable to this skill, and returns them.
     *
     * @returns An array of Mystery fate items that apply to this skill.
     */
    get availableFate(): SohlItem[] {
        let result: SohlItem[] = [];
        // TODO(#71): Implement this properly
        // if (!this.masteryLevel.disabled && this.actor) {
        //     this.actor.allItems.forEach((it: SohlItem) => {
        //         if (it.type === ITEM_KIND.MYSTERY) {
        //             const itData: Mystery.Data =
        //                 it.system as unknown as Mystery.Data;
        //             if (itData.subType === MYSTERY_SUBTYPE.FATE) {
        //                 result.push(...itData.logic.applicableFate(this));
        //             }
        //         }
        //     });
        // }
        return result;
    }

    /**
     * Whether the skill may be improved: true when the current user is a GM or
     * owns the item and the mastery level is not disabled.
     */
    get canImprove() {
        return (
            (fvttIsCurrentUserGM() || this.data.isOwner) &&
            !this.masteryLevel.disabled
        );
    }

    /**
     * Whether the skill's base formula is valid — i.e. it references at least
     * two attributes (the minimum for a skill base average).
     */
    get valid() {
        return skillBaseAttrShortcodes(this.data.skillBaseFormula).length >= 2;
    }

    /** The amount by which {@link improveWithSDR} raises the base mastery level on success. */
    get sdrIncr() {
        return 1;
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Performs a success test against this skill's mastery level.
     *
     * Intrinsic-action executor for the `successTest` action; delegates to
     * {@link MasteryLevelModifier.successTest}.
     *
     * @param context - The action context (speaker, scope) for the test.
     * @returns The test result, `null` if cancelled, or `false` on error.
     */
    async successTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | undefined | false> {
        return this.masteryLevel.successTest(context);
    }

    /**
     * Begins an opposed test backed by this skill's mastery level.
     *
     * Intrinsic-action executor for the `opposedTestStart` action. Opposed tests
     * are token-based: this delegates into the actor's token logic
     * {@link SohlTokenDocumentLogic.opposedTestStart}, passing this skill's
     * `logicUuid` as the source — exactly as the weapon/technique combat actions
     * delegate into the combatant.
     *
     * @param context - The action context (speaker, scope) for the test.
     * @returns The opposed test result, or `null` if cancelled or unavailable.
     */
    async opposedTestStart(
        context: SohlActionContext,
    ): Promise<OpposedTestResult | null> {
        const tokenLogic = fvttActiveTokenLogicForActor(this.actor);
        if (!tokenLogic) {
            sohl.log.uiWarn(
                `${this.name} cannot start an opposed test: its actor has no token on the canvas.`,
            );
            return null;
        }
        (context.scope as PlainObject).logicUuid = this.uuid;
        return tokenLogic.opposedTestStart(context);
    }

    /**
     * Flags this skill for improvement via a Skill Development Roll.
     *
     * Intrinsic-action executor for the `setImproveFlag` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the item update completes.
     */
    async setImproveFlag(_context: SohlActionContext): Promise<void> {
        const updateData: PlainObject = { "system.improveFlag": true };
        await this.data.update(updateData);
    }

    /**
     * Clears this skill's improvement flag.
     *
     * Intrinsic-action executor for the `unsetImproveFlag` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the item update completes.
     */
    async unsetImproveFlag(_context: SohlActionContext): Promise<void> {
        const updateData: PlainObject = { "system.improveFlag": false };
        await this.data.update(updateData);
    }

    /**
     * Attempts to improve the skill via a Skill Development Roll (SDR): rolls
     * `1d100 + skillBase` against the current base mastery level, and on a
     * success raises {@link SkillData.masteryLevelBase} by {@link sdrIncr}. The
     * outcome is posted to chat regardless.
     *
     * @param context - The action context whose speaker receives the chat card.
     * @returns Resolves once the roll is evaluated and the chat card is posted.
     */
    async improveWithSDR(context: SohlActionContext): Promise<void> {
        const updateData: PlainObject = { "system.improveFlag": false };
        const roll = SimpleRoll.fromFormula(`1d100+${this.skillBase}`, this);
        roll.roll();
        const isSuccess = roll.total > this.masteryLevel.base;

        if (isSuccess) {
            updateData["system.masteryLevelBase"] =
                this.data.masteryLevelBase + this.sdrIncr;
        }
        const chatTemplate: FilePath = toFilePath(
            "systems/sohl/templates/chat/standard-test-card.hbs",
        );
        const chatTemplateData = {
            type: `${this.data.kind}-${this.name}-improve-sdr`,
            title: sohl.i18n.format("SOHL.MasteryLevel.improveSDR.title", {
                label: this.label,
            }),
            effTarget: this.masteryLevel.base,
            isSuccess: isSuccess,
            rollValue: roll.total,
            rollResult: roll.result,
            showResult: true,
            resultText:
                isSuccess ?
                    sohl.i18n.format(
                        "SOHL.MasteryLevel.improveSDR.increase.title",
                        {
                            label: this.label,
                        },
                    )
                :   sohl.i18n.format(
                        "SOHL.MasteryLevel.improveSDR.noIncrease.title",
                        {
                            label: this.label,
                        },
                    ),
            resultDesc:
                isSuccess ?
                    //TODO(#70): "{label} increased by {incr} to {final}"
                    sohl.i18n.format(
                        "SOHL.MasteryLevel.improveSDR.increase.desc",
                        {
                            label: this.label,
                            incr: this.sdrIncr,
                            final: this.masteryLevel.base + this.sdrIncr,
                        },
                    )
                :   sohl.i18n.format(
                        "SOHL.MasteryLevel.improveSDR.noIncrease.desc",
                        {
                            label: this.label,
                            incr: this.sdrIncr,
                            final: this.masteryLevel.base + this.sdrIncr,
                        },
                    ),
            description:
                isSuccess ?
                    sohl.i18n.format("SOHL.TestResult.SUCCESS")
                :   sohl.i18n.format("SOHL.TestResult.FAILURE"),
            notes: "",
            sdrIncr: this.sdrIncr,
        };

        context.speaker.toChat(chatTemplate, chatTemplateData);
    }

    /**
     * Define and return all intrinsic actions for skill logic.
     *
     * @returns The intrinsic action definitions, including those inherited from the base logic.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlItemBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "successTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.successTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-bullseye-arrow",
                executor: "successTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "setImproveFlag",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.setImproveFlag",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-round-star-filled",
                executor: "setImproveFlag",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "unsetImproveFlag",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.unsetImproveFlag",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-round-star-unfilled",
                executor: "unsetImproveFlag",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "improveWithSDR",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.improveWithSDR",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-round-star-filled",
                executor: "improveWithSDR",
                visible:
                    "item.system.canImprove && !item.system.data.improveFlag",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "opposedTestStart",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.opposedTestStart",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-confrontation",
                executor: "opposedTestStart",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
        ];
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.parentSkill = null;
        this.boosts = 0;
        this.masteryLevel = new MasteryLevelModifier(
            {},
            { parent: this },
        ).setBase(this.data.masteryLevelBase);
        this.fateMasteryLevel = new MasteryLevelModifier(
            {
                testDescTable: getFateDescTable(),
                type: `${this.data.kind}-${this.name}-fate-test`,
                title: `${this.label} Fate Test`,
            },
            { parent: this },
        );

        // Calculate Fate Mastery Level
        const actorLogic = this.actorLogic;
        if (actorLogic) {
            const fateSetting = fvttGetSetting("sohl", "optionFate");

            const auraLogic = actorLogic.getItemLogic(
                "aur",
                ITEM_KIND.ATTRIBUTE,
            );
            if (auraLogic && !auraLogic.masteryLevel.disabled) {
                if (
                    fateSetting === "everyone" ||
                    (fateSetting === "pconly" && actorLogic.hasPlayerOwner)
                ) {
                    this.fateMasteryLevel.setBase(50);
                    this.fateMasteryLevel.add(
                        VALUE_DELTA_INFO.FATEBNS,
                        Math.trunc(auraLogic.masteryLevel.effective / 2),
                    );
                } else {
                    this.fateMasteryLevel.disabled =
                        "SOHL.MasteryLevel.FateDisabled";
                }
            } else {
                this.fateMasteryLevel.disabled =
                    "SOHL.MasteryLevel.FateNotSupported";
            }
        }

        // Calculate Skill Base
        this.skillBase = calcSkillBase(
            this.data.skillBaseFormula,
            this.actorLogic,
        );
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        if (this.data.parentSkillCode) {
            // If this skill references a parent skill, find it and link it here so we can pull in its properties as needed
            const parentLogic = this.actorLogic?.getItemLogic(
                this.data.parentSkillCode,
                ITEM_KIND.SKILL,
            );
            if (parentLogic) {
                this.parentSkill = parentLogic;
            }
        }
        if (this.masteryLevel.base > 0) {
            let newML = this.masteryLevel.base;
            for (let i = 0; i < this.boosts; i++) {
                newML += calcMasteryBoost(newML);
            }
            this.masteryLevel.setBase(newML);
        }
        // Ensure base ML is not greater than MaxML
        if (this.masteryLevel.base > this.masteryLevel.maxTarget) {
            this.masteryLevel.setBase(this.masteryLevel.maxTarget);
        }
        if (
            skillBaseAttrShortcodes(this.data.skillBaseFormula).includes("aur")
        ) {
            // Any skill that has Aura in its SB formula cannot use fate
            this.fateMasteryLevel.disabled =
                "SOHL.MasteryLevel.AuraBasedNoFate";
        }
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
        if (this.masteryLevel.disabled) {
            this.fateMasteryLevel.disabled =
                VALUE_DELTA_ID[VALUE_DELTA_INFO.MLDSBL].name;
        }
        if (!this.fateMasteryLevel.disabled) {
            // Apply magic modifiers
            if (this.magicMod) {
                this.fateMasteryLevel.add(
                    VALUE_DELTA_INFO.MAGICMOD,
                    this.magicMod,
                );
            }
            if (!this.availableFate.length) {
                this.fateMasteryLevel.disabled =
                    "SOHL.MasteryLevel.NoFateAvailable";
            }
        }
    }
}

/**
 * Calculates the mastery boost based on the given mastery level. Returns different boost values based on different ranges of mastery levels.
 *
 * @param ml The current Mastery Level
 * @returns The calculated Mastery Boost
 */
/**
 * The attribute shortcodes referenced by a skill-base formula — its `@code`
 * terms, lowercased and stripped of any `:multiplier`. Used to validate a
 * formula (needs ≥ 2 attributes) and to detect Aura-based skills.
 *
 * @param skillBaseFormula - The skill's `skillBaseFormula` string.
 * @returns The referenced attribute shortcodes, in formula order.
 */
function skillBaseAttrShortcodes(skillBaseFormula: string): string[] {
    return (skillBaseFormula || "")
        .toLowerCase()
        .split(",")
        .map((term) => term.trim())
        .filter((term) => term.startsWith("@") && term.length > 1)
        .map((term) => term.slice(1).split(":")[0]);
}

/**
 * Computes a skill's **skill base** (SB) value from its formula, resolving
 * attribute references and birthsign bonuses against the owning actor.
 *
 * The formula is a comma-separated, case-insensitive list of terms:
 *
 * - `@code` — average in the actor's attribute with that shortcode; `@code:2`
 *   weights it ×2.
 * - `hirin:2` — add 2 if the actor has the `hirin` birthsign; `ahnu` adds 1.
 *   Birthsigns are Mystery items of subtype `buff`, matched by shortcode; only
 *   the single largest matching birthsign bonus applies.
 * - `5` — a flat numeric modifier.
 *
 * The attribute average rounds up when exactly two attributes are given and the
 * first (primary) exceeds the second, down when it does not, and to nearest
 * otherwise. The result is clamped to ≥ 0. A formula referencing fewer than two
 * attributes (or an absent formula/actor) yields 0.
 *
 * @param skillBaseFormula - The skill's `skillBaseFormula` string.
 * @param actorLogic - The owning actor's logic, source of attribute scores and
 *   birthsign mysteries; a falsy value yields 0.
 * @returns The computed skill base value (≥ 0).
 */
export function calcSkillBase(
    skillBaseFormula: string,
    actorLogic: SohlActorLogic<any> | null | undefined,
): number {
    if (!skillBaseFormula || !actorLogic) return 0;

    const attributes = actorLogic.logicTypes[ITEM_KIND.ATTRIBUTE];
    // Birthsigns are `buff`-subtype Mystery items; the shortcode is the token.
    const birthsigns = new Set(
        actorLogic.logicTypes[ITEM_KIND.MYSTERY]
            .filter((m) => m.data.subType === MYSTERY_SUBTYPE.BUFF)
            .map((m) => m.data.shortcode.toLowerCase()),
    );

    const attrScores: number[] = [];
    let birthsignBonus = 0;
    let modifier = 0;

    for (const raw of skillBaseFormula.toLowerCase().split(",")) {
        const term = raw.trim();
        if (!term) continue;

        if (term.startsWith("@")) {
            // Attribute reference: `@code`, optionally `@code:multiplier`.
            const [code, multRaw] = term.slice(1).split(":");
            if (!code) continue;
            const mult = multRaw ? Number.parseInt(multRaw, 10) || 1 : 1;
            const attr = attributes.find((a) => a.data.shortcode === code);
            attrScores.push((attr?.score.effective ?? 0) * mult);
            continue;
        }

        if (/^[-+]?\d+$/.test(term)) {
            // Flat numeric modifier.
            modifier += Number.parseInt(term, 10);
            continue;
        }

        // Birthsign term: `code` (adds 1) or `code:count`. Only the largest
        // matching birthsign bonus applies.
        const [code, countRaw] = term.split(":");
        const count = countRaw ? Number.parseInt(countRaw, 10) || 1 : 1;
        if (birthsigns.has(code)) {
            birthsignBonus = Math.max(birthsignBonus, count);
        }
    }

    // A valid skill base averages two or more attributes.
    if (attrScores.length < 2) return 0;

    const sum = attrScores.reduce((acc, score) => acc + score, 0);
    let average = sum / attrScores.length;
    if (attrScores.length === 2) {
        // Two-attribute rounding: up when the primary exceeds the secondary.
        average =
            attrScores[0] > attrScores[1] ?
                Math.ceil(average)
            :   Math.floor(average);
    } else {
        average = Math.round(average);
    }

    return Math.max(0, average + birthsignBonus + modifier);
}

function calcMasteryBoost(ml: number): number {
    if (ml <= 39) return 10;
    else if (ml <= 44) return 9;
    else if (ml <= 49) return 8;
    else if (ml <= 59) return 7;
    else if (ml <= 69) return 6;
    else if (ml <= 79) return 5;
    else if (ml <= 99) return 4;
    else return 3;
}

/**
 * @remarks The shape of `system` on a `skill` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "skill"`. The backing DataModel implements this interface.
 */
export interface SkillData<
    TLogic extends SkillLogic<SkillData> = SkillLogic<any>,
> extends SohlItemData<TLogic> {
    /** Skill category (Combat, Social, Physical, etc.) */
    subType: SkillSubType;
    /** Formula for calculating the skill base from referenced traits */
    skillBaseFormula: string;
    /** Base mastery level representing training and experience */
    masteryLevelBase: number;
    /** Whether this item is flagged for mastery improvement via SDR */
    improveFlag: boolean;
    /** Combat category this skill applies to, if any */
    combatCategory: string;
    /** Name of the base skill if this is a specialization */
    parentSkillCode: string;
    /** Multiplier applied to skill base when initializing a new character */
    initSkillMult: number;
}
