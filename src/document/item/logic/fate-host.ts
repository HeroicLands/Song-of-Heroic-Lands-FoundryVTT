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
import type { MysteryLogic } from "./MysteryLogic";
import type { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import type { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import {
    eligibleFateSources,
    preferredFateSource,
    resolveFateOutcome,
    type FateCritChoice,
    type FateOutcome,
} from "./fate";
import {
    CRITICAL_SUCCESS,
    ITEM_KIND,
    MYSTERY_SUBTYPE,
    SOHL_SPEAKER_SOUND,
    VALUE_DELTA_INFO,
} from "@src/utils/constants";
import { toFilePath, toHTMLString } from "@src/utils/helpers";
import { dialog, fvttGetSetting, fvttToFoundryRoll } from "@src/core/FoundryHelpers";

/**
 * The Fate **spend flow**, shared by every logic type whose tests may be fated
 * (issue #1106).
 *
 * The pure eligibility and outcome math lives in [`fate.ts`](./fate.ts); this
 * module is the flow built on top of it — seeding the fate mastery level,
 * selecting spendable points, and running the test-and-consume sequence.
 *
 * It is a **module of functions over a {@link FateHost}**, deliberately not a base
 * class: {@link sohl.document.item.logic.SkillLogic} and
 * {@link sohl.document.item.logic.AttributeLogic} opt in by satisfying the host
 * interface, while
 * {@link sohl.document.item.logic.MysticalAbilityLogic} — which shares their
 * common base — must **never** gain Fate. Putting the flow on the shared base
 * class would hand it Fate by inheritance; a host interface cannot.
 */

/** The shortcode of the Aura attribute, which governs and bounds Fate. */
export const AURA_SHORTCODE = "aur";

/** The reason string for a fate mastery level withheld because Aura is the basis. */
export const AURA_BASED_NO_FATE = "SOHL.MasteryLevel.AuraBasedNoFate";

/**
 * The surface the Fate flow needs from the logic it is spent on — satisfied
 * structurally, so a class opts in simply by having these members.
 */
export interface FateHost {
    /** The item's display label, used in dialog and card titles. */
    readonly label: string;
    /** The item's name, used to build the test's type discriminator. */
    readonly name: string;
    /** The speaker the fate card is posted as. */
    readonly speaker: SohlSpeaker;
    /** The fate-adjusted mastery level this host's Fate test rolls against. */
    fateMasteryLevel: MasteryLevelModifier;
    /** The Fate Mysteries currently spendable on this host's tests. */
    readonly availableFate: MysteryLogic[];
    /** The owning actor's logic, or `undefined` off an actor. */
    readonly actorLogic: any;
    /** The persisted data backing this logic. */
    readonly data: {
        /** The item kind, used to build the test's type discriminator. */
        kind: string;
        /** The item's shortcode, matched against a Fate Point's association. */
        shortcode: string;
    };
    /**
     * Post the fate result card. Implemented on the host so a test can spy on it
     * per class; the shared implementation is {@link postFateResultCard}.
     */
    postFateResultCard(
        fateResult: SuccessTestResult,
        outcome: FateOutcome,
        spentSource: MysteryLogic | undefined,
    ): Promise<void>;
}

/**
 * Returns the fate-test description table with labels/descriptions resolved from i18n.
 *
 * @returns Array of {@link sohl.entity.result.SuccessTestResult.LimitedDescription} entries covering
 *   all fate outcomes from "lose fate — no effect" through "permanent gain".
 */
export function getFateDescTable(): SuccessTestResult.LimitedDescription[] {
    const loc = (key: string) => sohl.i18n.localize(key);
    return [
        {
            maxValue: -1,
            label: loc("SOHL.Skill.FateDesc.loseFateNoEffect.label"),
            description: loc("SOHL.Skill.FateDesc.loseFateNoEffect.description"),
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
 * Build the fate mastery level for a host, applying the world's Fate setting and
 * the Aura governance rule.
 *
 * Fate is rolled at a base of 50 plus half the actor's Aura mastery level, and is
 * withheld entirely when:
 *
 * - the host's own basis **is** Aura (`auraBased`) — an Aura-governed test cannot
 *   be fated, whether that is the Aura attribute itself or a skill whose Skill
 *   Base is computed from Aura;
 * - the actor has no usable Aura attribute (`FateNotSupported`); or
 * - the `optionFate` world setting excludes this actor (`FateDisabled`).
 *
 * Off an actor the modifier is built but left ungated, matching the previous
 * skill-only behavior.
 *
 * @param host - The logic the fate mastery level belongs to.
 * @param auraBased - Whether this host's test is itself governed by Aura.
 * @returns The seeded {@link sohl.entity.modifier.MasteryLevelModifier}.
 */
export function buildFateMasteryLevel(host: FateHost, auraBased: boolean): MasteryLevelModifier {
    const fateMasteryLevel = new entity.MasteryLevelModifier(
        {
            testDescTable: getFateDescTable(),
            type: `${host.data.kind}-${host.name}-fate-test`,
            title: `${host.label} Fate Test`,
        },
        { parent: host as unknown as SohlLogic },
    ) as MasteryLevelModifier;

    const actorLogic = host.actorLogic;
    if (!actorLogic) return fateMasteryLevel;

    if (auraBased) {
        fateMasteryLevel.disabled = AURA_BASED_NO_FATE;
        return fateMasteryLevel;
    }

    const auraLogic = actorLogic.getItemLogic(AURA_SHORTCODE, ITEM_KIND.ATTRIBUTE);
    if (!auraLogic || auraLogic.masteryLevel.disabled) {
        fateMasteryLevel.disabled = "SOHL.MasteryLevel.FateNotSupported";
        return fateMasteryLevel;
    }

    const fateSetting = fvttGetSetting("sohl", "optionFate");
    if (fateSetting === "everyone" || (fateSetting === "pconly" && actorLogic.hasPlayerOwner)) {
        fateMasteryLevel.setBase(50);
        fateMasteryLevel.add(
            VALUE_DELTA_INFO.FATEBNS,
            Math.trunc(auraLogic.masteryLevel.effective / 2),
        );
    } else {
        fateMasteryLevel.disabled = "SOHL.MasteryLevel.FateDisabled";
    }
    return fateMasteryLevel;
}

/**
 * The Fate Mysteries on the actor that may be spent on this host's tests: every
 * `fate`-subtype Mystery whose scope matches (a **general** point with no
 * `assocSkillCode`, or one **specific** to this host's shortcode) that still has
 * a charge available (infinite, or `charges.value > 0`).
 *
 * The association field is named for skills historically, but the rule is the
 * same for any fatable test — an attribute matches a point associated with its
 * own shortcode (#1106).
 *
 * @param host - The logic whose eligible points to select.
 * @returns The eligible-and-charged Fate {@link MysteryLogic} instances (empty
 *   off an actor).
 */
export function availableFateFor(host: FateHost): MysteryLogic[] {
    const actorLogic = host.actorLogic;
    if (!actorLogic) return [];
    const mysteries = (actorLogic.logicTypes?.[ITEM_KIND.MYSTERY] ?? []) as MysteryLogic[];
    return eligibleFateSources(
        mysteries.map((m) => ({
            ref: m,
            subType: m.data.subType,
            assocSkillCode: m.data.assocSkillCode ?? null,
            // A disabled `charges.value` means infinite charges (or a mystery
            // that does not track charges at all) — always available, never
            // decremented.
            infinite: !!m.charges?.value.disabled,
            remaining: m.charges?.value.effective ?? 0,
        })),
        MYSTERY_SUBTYPE.FATE,
        host.data.shortcode,
    ).map((p) => p.ref);
}

/**
 * Spend Fate on a test: roll a Fate test and apply its **post-roll success-level
 * bump** to the original test — the die is never re-rolled (#854).
 *
 * The flow, all at the player's behest (the card's Fate button or the sheet cell
 * is the human trigger):
 * 1. **Gate** on an eligible, charged Fate Point ({@link availableFateFor}); no
 *    point ⇒ a warning and no-op.
 * 2. **Roll** the Fate test against the host's `fateMasteryLevel` (its own
 *    success test, resolved by {@link getFateDescTable}); its result posts
 *    nothing here — this function posts a single Fate card describing the
 *    resolved path.
 * 3. **Resolve the rung** via {@link resolveFateOutcome} — consumption and the
 *    level delta are driven by the matched rung, never `isSuccess`. A critical
 *    success prompts the player's **spend (+2) / keep (+1)** choice.
 * 4. **Consume a point** when the rung requires it, decrementing one eligible
 *    Fate Mystery — chosen by the player when more than one is eligible
 *    (auto-picked otherwise).
 * 5. **Bump the original** result's stored success level by the delta and
 *    **re-post** its card, which re-resolves its description table against the
 *    new level. The original result rides in `context.scope.priorTestResult`
 *    (serialized on the Fate button, revived on click).
 *
 * @param host - The logic the Fate is being spent on.
 * @param context - The action context; `context.scope.priorTestResult` is the
 *   original {@link sohl.entity.result.SuccessTestResult} being fated (absent
 *   when invoked with no card to amend — then only the Fate test is rolled).
 * @returns Resolves once the Fate test, any consumption, and the re-post
 *   complete. A no-op (with a warning) when Fate is unavailable, and a silent
 *   return when the player dismisses the Fate roll or a required choice.
 */
export async function performFateTest(
    host: FateHost,
    context: SohlActionContext<Partial<SuccessTestResult.ContextScope>>,
): Promise<void> {
    if (host.fateMasteryLevel.disabled) return;

    const eligible = host.availableFate;
    if (!eligible.length) {
        sohl.log.uiWarn(
            sohl.i18n.format("SOHL.Skill.Fate.noPoints", {
                label: host.label,
            }),
        );
        return;
    }

    const original = context.scope?.priorTestResult;

    // Roll the Fate test — its own fresh success test (never the original's
    // die). `noChat` suppresses the generic card; this flow posts a Fate card
    // that names the resolved path instead.
    const fateContext = new SohlActionContext({
        speaker: context.speaker,
        type: `${host.data.kind}-${host.name}-fate-test`,
        title: sohl.i18n.format("SOHL.Skill.Fate.testTitle", {
            label: host.label,
        }),
        skipDialog: context.skipDialog,
        noChat: true,
        scope: {
            situationalModifier: 0,
            targetValueFunc: (successLevel: number) => successLevel,
            resultDescTable: getFateDescTable(),
            // A Fate roll cannot itself be fated.
            canFate: false,
        },
    });
    const fateResult = await host.fateMasteryLevel.successTest(fateContext);
    if (!fateResult) return; // dismissed / not owned

    // A critical success is the one branching outcome — ask the player.
    let critChoice: FateCritChoice | undefined;
    if (fateResult.successLevel >= CRITICAL_SUCCESS) {
        critChoice = await promptFateCritChoice();
        if (!critChoice) return; // dismissed → cancel the whole spend
    }

    const outcome = resolveFateOutcome(fateResult.successLevel, critChoice);

    // Consume a Fate Point when the rung requires it; the player picks the
    // source when more than one is eligible.
    let spentSource: MysteryLogic | undefined;
    if (outcome.consumesPoint) {
        spentSource = await chooseFateSource(eligible);
        if (!spentSource) return; // dismissed → cancel
        await consumeFateCharge(spentSource);
    }

    // Apply the bump to the original test and re-post its card.
    if (original && outcome.levelDelta) {
        original.bumpSuccessLevel(outcome.levelDelta);
        // Re-post with Fate disabled: this result has now been fated, so the
        // amended card should not re-offer the same spend. The card re-derives
        // its outcome text/stars from the bumped level. (The revived original
        // carries the identity `targetValueFunc` a plain success test needs; a
        // bespoke non-identity test would have to re-supply it here — #854.)
        await original.toChat({ canFate: false });
    }

    await host.postFateResultCard(fateResult, outcome, spentSource);
}

/**
 * Prompt the player's choice on a **critical-success** Fate test: spend the
 * point for +2 success levels, or keep it for +1 (consent model — the one
 * branching outcome is asked, never auto-picked).
 *
 * @returns The chosen branch, or `undefined` if the dialog was dismissed.
 */
export async function promptFateCritChoice(): Promise<FateCritChoice | undefined> {
    const result = await dialog({
        title: sohl.i18n.localize("SOHL.Skill.Fate.critChoice.title"),
        content: toHTMLString(`<p>{{prompt}}</p>`),
        data: {
            prompt: sohl.i18n.localize("SOHL.Skill.Fate.critChoice.prompt"),
        },
        buttons: [
            {
                action: "spend",
                label: sohl.i18n.localize("SOHL.Skill.Fate.critChoice.spend"),
                icon: "fa-solid fa-star",
                default: true,
            },
            {
                action: "keep",
                label: sohl.i18n.localize("SOHL.Skill.Fate.critChoice.keep"),
                icon: "fa-solid fa-hand-holding",
            },
        ],
    });
    const action = result?.action;
    return action === "spend" || action === "keep" ? action : undefined;
}

/**
 * Resolve which eligible Fate Mystery to spend a point from: auto-pick when
 * exactly one is eligible, otherwise ask the player (pre-selecting the
 * most-restricted point via {@link preferredFateSource} so flexible general
 * points are preserved).
 *
 * @param eligible - The eligible Fate Mystery logics ({@link availableFateFor}).
 * @returns The chosen mystery, or `undefined` if the dialog was dismissed.
 */
export async function chooseFateSource(
    eligible: MysteryLogic[],
): Promise<MysteryLogic | undefined> {
    if (eligible.length === 1) return eligible[0];

    const preferred = preferredFateSource(
        eligible.map((m) => ({
            ref: m,
            subType: m.data.subType,
            assocSkillCode: m.data.assocSkillCode ?? null,
            infinite: !!m.charges?.value.disabled,
            remaining: m.charges?.value.effective ?? 0,
        })),
    )?.ref;

    const options = eligible.map((m) => ({
        id: m.id,
        name: m.name,
        scope:
            m.data.assocSkillCode ?
                sohl.i18n.format("SOHL.Skill.Fate.source.specific", {
                    skill: m.data.assocSkillCode,
                })
            :   sohl.i18n.localize("SOHL.Skill.Fate.source.general"),
        remaining: m.charges?.value.disabled ? "∞" : String(m.charges?.value.effective ?? 0),
        selected: m.id === preferred?.id,
    }));

    const result = await dialog({
        title: sohl.i18n.localize("SOHL.Skill.Fate.source.title"),
        content: toHTMLString(`<form>
                <div class="form-group">
                    <label>{{label}}</label>
                    <select name="mysteryId">
                        {{#each options}}
                        <option value="{{this.id}}" {{#if this.selected}}selected{{/if}}>{{this.name}} — {{this.scope}} ({{this.remaining}})</option>
                        {{/each}}
                    </select>
                </div>
            </form>`),
        data: {
            label: sohl.i18n.localize("SOHL.Skill.Fate.source.label"),
            options,
        },
    });
    if (!result) return undefined; // dismissed
    const chosenId = result.data?.mysteryId;
    return eligible.find((m) => m.id === chosenId) ?? preferred ?? eligible[0];
}

/**
 * Decrement one charge on the chosen Fate Mystery, unless its charges are
 * infinite (a disabled `charges.value`), in which case nothing is written.
 *
 * @param mystery - The Fate Mystery to spend a point from.
 */
export async function consumeFateCharge(mystery: MysteryLogic): Promise<void> {
    if (mystery.charges?.value.disabled) return; // infinite — never decrement
    const remaining = mystery.charges?.value.effective ?? 0;
    await mystery.data.update({
        "system.charges.value": Math.max(remaining - 1, 0),
    });
}

/**
 * Post the Fate result card naming the resolved path (CF "point lost" / MF
 * "no effect" / MS "+1" / CS the chosen "+2" or "retained +1") and the Fate
 * Mystery a point was spent from, attaching the Fate roll for display.
 *
 * @param host - The logic the Fate was spent on.
 * @param fateResult - The evaluated Fate test result.
 * @param outcome - The resolved {@link resolveFateOutcome} outcome.
 * @param spentSource - The Fate Mystery a point was consumed from, if any.
 */
export async function postFateResultCard(
    host: FateHost,
    fateResult: SuccessTestResult,
    outcome: FateOutcome,
    spentSource: MysteryLogic | undefined,
): Promise<void> {
    const cardData: PlainObject = {
        actorUuid: host.actorLogic?.uuid,
        title: sohl.i18n.format("SOHL.Skill.Fate.testTitle", {
            label: host.label,
        }),
        mlModHtml: fateResult.masteryLevelModifier.chatHtml,
        target: fateResult.masteryLevelModifier.effective,
        rollTotal: fateResult.roll.total,
        isSuccess: fateResult.isSuccess,
        isCritical: fateResult.isCritical,
        outcomeLabel: fateResult.resultText,
        pathText: sohl.i18n.localize(`SOHL.Skill.Fate.path.${outcome.path}`),
        sourceText:
            spentSource ?
                sohl.i18n.format("SOHL.Skill.Fate.path.source", {
                    name: spentSource.name,
                })
            :   "",
    };
    const options: PlainObject = {
        roll: await fvttToFoundryRoll(fateResult.roll),
        sound: SOHL_SPEAKER_SOUND.DICE,
    };
    void host.speaker.toChat(
        toFilePath("systems/sohl/templates/chat/fate-roll-card.hbs"),
        cardData,
        options,
    );
}
