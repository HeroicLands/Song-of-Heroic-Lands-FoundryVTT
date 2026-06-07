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

import {
    inputDialog,
    getActiveCombat,
    type DialogButtonCallback,
} from "@src/core/FoundryHelpers";
import { SohlTokenDocument } from "@src/document/token/SohlTokenDocument";
import {
    buildAttackResult,
    buildAttackCardData,
    resolveAttackTarget,
    collectAttackableStrikeModes,
    classifyMissileRange,
    indexOfBestMastery,
    type AttackableStrikeMode,
} from "@src/document/actor/foundry/combat-actions";
import { toFilePath, toHTMLString } from "@src/utils/helpers";
import { resolveActionInput } from "@src/utils/actionInput";
import { ITEM_KIND, TEST_TYPE, VALUE_DELTA_ID } from "@src/utils/constants";
import type { StrikeModeBase } from "@src/domain/strikemode/StrikeModeBase";
import type { SohlLogic } from "@src/core/SohlLogic";
import type { SohlActionContext } from "@src/core/SohlActionContext";
import type { SohlCombatant } from "@src/document/combatant/SohlCombatant";
import type { AttackResult } from "@src/domain/result/AttackResult";

/**
 * Orchestration glue for **automated combat** — the attacker's entry flow.
 *
 * This module is the Foundry-facing layer: it drives dialogs and posts the
 * attack chat card. The Foundry-free, unit-tested pieces it composes
 * (`buildAttackResult`, `buildAttackCardData`, `collectAttackableStrikeModes`,
 * `classifyMissileRange`, …) live in `combat-actions.ts`.
 *
 * Every dialog here is **bypassable**: with `context.skipDialog` set, the same
 * inputs are read from `context.scope` instead (see {@link resolveActionInput}).
 * Dialog callbacks are side-effect-free. `context.noChat` suppresses the chat
 * post. Together these let the whole flow run headlessly.
 *
 * Range gates the available modes: melee by reach, missile by base range.
 * **Volley** (a missile beyond base range) is an area attack with no aim and is
 * **not supported** — such modes never appear, and a wholly out-of-range target
 * short-circuits with a warning.
 */

/** The attack dialog's inputs (from the dialog form or from `scope`). */
interface AttackDialogInput {
    /** The targeted body part (shortcode). */
    aim: string;
    /** Player-entered additional modifier. */
    situationalModifier: number;
}

/** The resolved spatial context of an attack: attacker, target, and distance. */
interface AttackContext {
    attackerToken: SohlTokenDocument;
    targetToken: SohlTokenDocument;
    /** Center-to-center distance in feet. */
    distanceFeet: number;
}

/** Parameters for {@link startAutomatedAttack}. */
export interface StartAutomatedAttackParams {
    /** Logic that owns the resulting AttackResult and its cloned modifiers. */
    attackerLogic: SohlLogic;
    /** The attacker's token (a real, owned token so `evaluate()` passes its ownership gate). */
    attackerToken: SohlTokenDocument;
    /** The chosen strike mode. */
    strikeMode: StrikeModeBase;
    /** Id of the item owning the strike mode (for recording the last-used mode). */
    itemId: string;
    /** The wielding item's display name (card title). */
    weaponName: string;
    /** The resolved target token. */
    targetToken: SohlTokenDocument;
    /** Center-to-center distance to the target, in feet (for missile range). */
    distanceFeet: number;
    /** The action context — supplies the speaker, `skipDialog`, `noChat`, and `scope`. */
    context: SohlActionContext<any>;
}

/** True when `token` is a combatant in the given combat. */
function tokenInCombat(
    combat: ReturnType<typeof getActiveCombat>,
    token: SohlTokenDocument,
): boolean {
    if (!combat) return false;
    return combat.combatants.some((c: any) => c.tokenId === token.id);
}

/** The active combat's combatant for `token`, or `null`. */
export function findCombatant(token: SohlTokenDocument): SohlCombatant | null {
    const combat = getActiveCombat();
    if (!combat) return null;
    return (
        (combat.combatants.find(
            (c: any) => c.tokenId === token.id,
        ) as SohlCombatant | undefined) ?? null
    );
}

/**
 * Resolve the attacker's token, the single targeted in-combat defender, and the
 * center-to-center distance between them. Returns `null` (with a UI warning)
 * when the attacker has no token or the target rule isn't met.
 */
function resolveAttackContext(
    actor: any,
    context: SohlActionContext<any>,
): AttackContext | null {
    const attackerToken = resolveAttackerToken(actor, context.token);
    if (!attackerToken) return null;
    const combat = getActiveCombat();
    const targeted = SohlTokenDocument.getTargetedTokens() ?? [];
    let targetToken: SohlTokenDocument;
    try {
        targetToken = resolveAttackTarget(targeted, (t) =>
            tokenInCombat(combat, t),
        );
    } catch (err) {
        sohl.log.uiWarn((err as Error).message);
        return null;
    }
    const distanceFeet =
        SohlTokenDocument.rangeToTarget(attackerToken, targetToken) ?? Infinity;
    return { attackerToken, targetToken, distanceFeet };
}

/** The resolved spatial context of a counterstrike (defender striking back). */
export interface CounterstrikeContext {
    /** The original attacker's token — the counterstrike's target. */
    attackerToken: SohlTokenDocument;
    /** The original attacker's actor. */
    attackerActor: any;
    /** Center-to-center distance from defender to attacker, in feet. */
    distanceFeet: number;
}

/**
 * Resolve the counterstrike's spatial context: the original attacker (the target
 * of the counterstrike, read from the attack snapshot's speaker token) and the
 * distance from the counterstriking defender to them. Returns `null` (with a UI
 * warning) when either token is unavailable on the canvas.
 */
export function resolveCounterstrikeContext(
    attackResult: AttackResult,
    defenderToken: SohlTokenDocument | null,
): CounterstrikeContext | null {
    const attackerToken = attackResult.speaker?.token ?? null;
    if (!attackerToken || !defenderToken) {
        sohl.log.uiWarn(
            "Counterstrike needs both the attacker's and defender's tokens on the canvas.",
        );
        return null;
    }
    const distanceFeet =
        SohlTokenDocument.rangeToTarget(defenderToken, attackerToken) ??
        Infinity;
    return {
        attackerToken,
        attackerActor: attackerToken.actor,
        distanceFeet,
    };
}

/**
 * Build the Aim select options (a `{ shortcode: label }` map) from the
 * defender's body parts. Empty when the defender has no lineage / body structure.
 */
export function buildAimChoices(defenderActor: any): Record<string, string> {
    const lineageLogic = defenderActor?.itemTypes?.[ITEM_KIND.LINEAGE]?.[0]
        ?.logic as any;
    const parts: any[] = lineageLogic?.bodyStructure?.parts ?? [];
    const choices: Record<string, string> = {};
    for (const part of parts) {
        choices[part.shortcode] = part.locations?.[0]?.name ?? part.shortcode;
    }
    return choices;
}

/** Render `<option>` HTML for a `{ value: label }` map (raw-content dialogs). */
function renderOptions(
    choices: Record<string, string>,
    selected: string,
): string {
    return Object.entries(choices)
        .map(([value, label]) => {
            const safe = String(label)
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            const sel = value === selected ? " selected" : "";
            return `<option value="${value}"${sel}>${safe}</option>`;
        })
        .join("");
}

/**
 * Show the attack dialog (Aim + Additional Modifier) and resolve to the chosen
 * inputs, or `null` if dismissed. Side-effect-free.
 */
function showAttackDialog(
    title: string,
    aimChoices: Record<string, string>,
    defaultAim: string,
): Promise<AttackDialogInput | null> {
    return inputDialog({
        title,
        template: toFilePath("systems/sohl/templates/dialog/attack-dialog.hbs"),
        data: { aimChoices, defaultAim, situationalModifier: 0 },
        callback: ((_event, button: HTMLButtonElement): Promise<any> => {
            const form = button.querySelector("form");
            if (!form) return Promise.resolve(null);
            const fd = new FormDataExtended(form);
            const f = fd.object as PlainObject;
            return Promise.resolve({
                aim: String(f.aim ?? defaultAim),
                situationalModifier:
                    Number.parseInt(String(f.situationalModifier), 10) || 0,
            } satisfies AttackDialogInput);
        }) as DialogButtonCallback,
        rejectClose: false,
    }) as Promise<AttackDialogInput | null>;
}

/**
 * Present a single-select dialog (with a preselected `defaultKey`) and resolve to
 * the chosen key, or `null` if dismissed. Side-effect-free.
 */
export function pickChoice(
    title: string,
    label: string,
    choices: Record<string, string>,
    defaultKey: string,
): Promise<string | null> {
    return inputDialog({
        title,
        content: toHTMLString(
            `<form><div class="form-group"><label>${label}</label><select name="choice">${renderOptions(choices, defaultKey)}</select></div></form>`,
        ),
        callback: ((_event, button: HTMLButtonElement): Promise<any> => {
            const form = button.querySelector("form");
            if (!form) return Promise.resolve(null);
            const fd = new FormDataExtended(form);
            return Promise.resolve(
                String((fd.object as PlainObject).choice ?? defaultKey),
            );
        }) as DialogButtonCallback,
        rejectClose: false,
    }) as Promise<string | null>;
}

/**
 * Show a defense dialog with a strike-mode select **and** an Additional Modifier
 * field, preselecting `defaultKey`; resolve to `{ key, situationalModifier }` or
 * `null` if dismissed. Side-effect-free. Used by Block.
 */
export function showDefenseDialog(
    title: string,
    selectLabel: string,
    choices: Record<string, string>,
    defaultKey: string,
): Promise<{ key: string; situationalModifier: number } | null> {
    return inputDialog({
        title,
        content: toHTMLString(
            `<form>` +
                `<div class="form-group"><label>${selectLabel}</label>` +
                `<select name="choice">${renderOptions(choices, defaultKey)}</select></div>` +
                `<div class="form-group"><label>Additional Modifier:</label>` +
                `<input type="number" name="situationalModifier" value="0" /></div>` +
                `</form>`,
        ),
        callback: ((_event, button: HTMLButtonElement): Promise<any> => {
            const form = button.querySelector("form");
            if (!form) return Promise.resolve(null);
            const fd = new FormDataExtended(form);
            const f = fd.object as PlainObject;
            return Promise.resolve({
                key: String(f.choice ?? defaultKey),
                situationalModifier:
                    Number.parseInt(String(f.situationalModifier), 10) || 0,
            });
        }) as DialogButtonCallback,
        rejectClose: false,
    }) as Promise<{ key: string; situationalModifier: number } | null>;
}

/**
 * The default mode index for a picker: the most-recently-used mode if it is
 * still available, otherwise the best-chance mode (highest effective ML).
 */
function defaultModeIndex(
    modes: AttackableStrikeMode[],
    recent: { itemId: string; smId: string } | null,
): number {
    if (recent) {
        const idx = modes.findIndex(
            (m) => m.itemId === recent.itemId && m.smId === recent.smId,
        );
        if (idx >= 0) return idx;
    }
    return Math.max(
        0,
        indexOfBestMastery(modes, (m) => m.strikeMode.attack.constrainedEffective),
    );
}

/**
 * Choose a strike mode from the available list (default = recent-or-best;
 * bypassable via `scope.itemId` + `scope.strikeModeId`) and run the attack.
 */
async function chooseModeAndAttack(
    modes: AttackableStrikeMode[],
    rc: AttackContext,
    context: SohlActionContext<any>,
): Promise<void> {
    const recent = findCombatant(rc.attackerToken)?.lastAttackMode ?? null;
    const defaultIdx = defaultModeIndex(modes, recent);
    const choices: Record<string, string> = {};
    modes.forEach((m, i) => {
        choices[String(i)] = `${m.itemName} — ${m.strikeMode.name}`;
    });

    const pickedKey = await resolveActionInput<string | null>(context, {
        fromScope: (s) => {
            const idx = modes.findIndex(
                (m) => m.itemId === s.itemId && m.smId === s.strikeModeId,
            );
            return idx >= 0 ? String(idx) : String(defaultIdx);
        },
        dialog: () =>
            pickChoice(
                `${rc.attackerToken.name} — Select Attack`,
                "Strike Mode:",
                choices,
                String(defaultIdx),
            ),
    });
    if (pickedKey === null) return;
    const entry = modes[Number(pickedKey)];
    if (!entry) return;

    await startAutomatedAttack({
        attackerLogic: entry.strikeMode.parentLogic,
        attackerToken: rc.attackerToken,
        strikeMode: entry.strikeMode,
        itemId: entry.itemId,
        weaponName: entry.itemName,
        targetToken: rc.targetToken,
        distanceFeet: rc.distanceFeet,
        context,
    });
}

/**
 * Run the attacker-side flow for a chosen strike mode: resolve attack inputs
 * (Aim + modifier; dialog or `scope`) → derive spread + any point-blank impact
 * bonus → assemble and evaluate the {@link AttackResult} → record the mode on the
 * combatant → post the attack card (unless `noChat`).
 */
export async function startAutomatedAttack(
    p: StartAutomatedAttackParams,
): Promise<void> {
    const { context } = p;
    const sm = p.strikeMode as any;
    const defenderActor = p.targetToken.actor as any;

    const aimChoices = buildAimChoices(defenderActor);
    const defaultAim = Object.keys(aimChoices)[0] ?? "";

    const input = await resolveActionInput<AttackDialogInput>(context, {
        fromScope: (s) => ({
            aim: String(s.aim ?? defaultAim),
            situationalModifier:
                Number.parseInt(String(s.situationalModifier), 10) || 0,
        }),
        dialog: () =>
            showAttackDialog(
                `${p.attackerToken.name} vs. ${p.targetToken.name} Attack with ${p.weaponName}`,
                aimChoices,
                defaultAim,
            ),
    });
    if (!input) return;
    const { aim, situationalModifier } = input;

    // Spread (for injury hit-location scatter) + any impact range bonus.
    let spread: number;
    let impactRangeBonus = 0;
    if (p.strikeMode.isMissile) {
        const band = classifyMissileRange(
            p.distanceFeet,
            sm.baseRange?.effective ?? 0,
        );
        if (!band.direct) {
            // Should not happen (range-filtered upstream), but guard volley.
            sohl.log.uiWarn(
                `${p.targetToken.name} is beyond direct range (volley is not supported).`,
            );
            return;
        }
        spread = band.spread;
        impactRangeBonus = band.impactRangeBonus;
    } else {
        spread = sm.spread?.effective ?? 0;
    }

    const testType =
        p.strikeMode.isMissile ?
            TEST_TYPE.AUTOCOMBATMISSILE.id
        :   TEST_TYPE.AUTOCOMBATMELEE.id;
    const attackResult = buildAttackResult({
        attackML: p.strikeMode.attack,
        impact: p.strikeMode.impact,
        parent: p.attackerLogic,
        token: p.attackerToken,
        testType,
        aimBodyPartCode: aim,
        spread,
        title: p.weaponName,
    });
    if (situationalModifier) {
        attackResult.masteryLevelModifier.add(
            VALUE_DELTA_ID.PLAYER,
            situationalModifier,
        );
    }
    if (impactRangeBonus) {
        // Point-blank missile: a flat bonus to the impact formula.
        attackResult.impact.add(
            { name: "SOHL.INFO.Range", shortcode: "Range" },
            impactRangeBonus,
        );
    }
    await attackResult.evaluate();

    // Remember this mode so it defaults next time on this combatant.
    await findCombatant(p.attackerToken)?.recordAttackMode(
        p.itemId,
        p.strikeMode.id,
    );

    if (context.noChat) return;
    const cardData = buildAttackCardData({
        attackResult,
        title: `${p.weaponName} ${p.strikeMode.isMelee ? "Melee" : "Missile"} Attack`,
        attackerName: p.attackerToken.name ?? "",
        actorId: p.attackerLogic.actor?.id ?? null,
        aimLabel: aimChoices[aim] ?? aim,
        target:
            defenderActor ?
                {
                    name: p.targetToken.name ?? "",
                    actorUuid: defenderActor.uuid,
                }
            :   null,
    });
    await context.speaker.toChat(
        toFilePath("systems/sohl/templates/chat/attack-card.hbs"),
        cardData,
    );
}

/**
 * Resolve the attacker's token from an action context, falling back to the
 * actor's first active token. Returns `null` (with a UI warning) when none is
 * available — automated combat requires a token on the canvas.
 */
export function resolveAttackerToken(
    actor: any,
    contextToken: SohlTokenDocument | null,
): SohlTokenDocument | null {
    const token =
        contextToken ?? actor?.getActiveTokens?.()?.[0]?.document ?? null;
    if (!token) {
        sohl.log.uiWarn(
            "Automated combat requires the attacker to have a token in the scene.",
        );
    }
    return token;
}

/**
 * Actor-level entry: resolve the target + distance, gather every **in-range**
 * attackable mode across the actor's weapons and combat techniques, then choose
 * and run. A wholly out-of-range target short-circuits.
 */
export async function startAutomatedAttackFromActor(
    actorLogic: SohlLogic,
    context: SohlActionContext<any>,
): Promise<void> {
    const actor = actorLogic.actor as any;
    const rc = resolveAttackContext(actor, context);
    if (!rc) return;

    const modes = collectAttackableStrikeModes(actor, rc.distanceFeet);
    if (modes.length === 0) {
        sohl.log.uiWarn(
            `${rc.targetToken.name} is out of range of any strike mode (melee or missile).`,
        );
        return;
    }
    await chooseModeAndAttack(modes, rc, context);
}

/**
 * Item-level entry: resolve the target + distance, then offer only **this
 * item's** in-range attackable modes. Out-of-range short-circuits.
 */
export async function startAutomatedAttackFromItem(
    itemLogic: SohlLogic,
    itemName: string,
    context: SohlActionContext<any>,
): Promise<void> {
    const actor = itemLogic.actor as any;
    const rc = resolveAttackContext(actor, context);
    if (!rc) return;

    const itemId = itemLogic.item?.id;
    const modes = collectAttackableStrikeModes(actor, rc.distanceFeet).filter(
        (m) => m.itemId === itemId,
    );
    if (modes.length === 0) {
        sohl.log.uiWarn(
            `${itemName} has no strike mode in range of ${rc.targetToken.name}.`,
        );
        return;
    }
    await chooseModeAndAttack(modes, rc, context);
}
