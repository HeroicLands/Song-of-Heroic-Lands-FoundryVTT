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
    resolveTargetCombatant,
    collectAttackableStrikeModes,
    classifyMissileRange,
    indexOfBestMastery,
    firstStatusIn,
    ATTACK_BLOCKING_STATUSES,
    type AttackableStrikeMode,
} from "@src/document/actor/foundry/combat-actions";
import { toFilePath, toHTMLString } from "@src/utils/helpers";
import { resolveActionInput } from "@src/utils/actionInput";
import {
    ITEM_KIND,
    STATUS_EFFECT,
    TEST_TYPE,
    VALUE_DELTA_ID,
} from "@src/utils/constants";
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

/**
 * The resolved participants of an attack. Automated combat is between
 * **combatants** — each carries its own token (`.token`) and actor (`.actor`),
 * and the in-combat invariant is enforced by the type.
 */
interface AttackContext {
    /** The attacking combatant. */
    attacker: SohlCombatant;
    /** The target combatant. */
    target: SohlCombatant;
    /** Center-to-center distance between their tokens, in feet. */
    distanceFeet: number;
}

/** Parameters for {@link startAutomatedAttack}. */
export interface StartAutomatedAttackParams {
    /** The attacking combatant (supplies token, actor, and last-used-mode persistence). */
    attacker: SohlCombatant;
    /** The target combatant (supplies token + actor). */
    target: SohlCombatant;
    /** The chosen attackable strike mode (carries the owning item's id/name + the mode). */
    mode: AttackableStrikeMode;
    /** The action context — supplies the speaker, `skipDialog`, `noChat`, and `scope`. */
    context: SohlActionContext<any>;
}

/** The given combat's combatant for `token`, or `null`. */
function combatantForToken(
    combat: ReturnType<typeof getActiveCombat>,
    token: SohlTokenDocument,
): SohlCombatant | null {
    if (!combat) return null;
    return (
        (combat.combatants.find(
            (c: any) => c.tokenId === token.id,
        ) as SohlCombatant | undefined) ?? null
    );
}

/** The active combat's combatant for `token`, or `null`. */
export function findCombatant(token: SohlTokenDocument): SohlCombatant | null {
    return combatantForToken(getActiveCombat(), token);
}

/**
 * A combatant's active status-effect ids, treating Foundry's DEFEATED special
 * status as the `vanquished` status so the combat invariants can test it
 * uniformly alongside the actor's own statuses.
 */
function combatantStatuses(combatant: SohlCombatant): Set<string> {
    const ids = new Set<string>(
        ((combatant.actor as any)?.statuses ?? []) as Iterable<string>,
    );
    if ((combatant as any).isDefeated) ids.add(STATUS_EFFECT.VANQUISHED);
    return ids;
}

/**
 * Resolve the attacker's token, the **target combatant** (and its token), and
 * the center-to-center distance between them. Returns `null` (with a UI warning)
 * when the attacker has no token, there is no active combat, or the target rule
 * isn't met.
 *
 * Automated combat targets a *combatant*, not a token. The target is taken from
 * `context.scope.targetCombatant` (a combatant id) when supplied; otherwise it
 * is resolved from the client's targeted tokens — exactly one of which must be a
 * combatant of the current combat (see {@link resolveTargetCombatant}).
 */
function resolveAttackContext(
    actor: any,
    context: SohlActionContext<any>,
): AttackContext | null {
    const attackerToken = resolveAttackerToken(actor, context.token);
    if (!attackerToken) return null;
    const combat = getActiveCombat();
    if (!combat) {
        sohl.log.uiWarn("Automated combat requires an active combat.");
        return null;
    }
    const attacker = combatantForToken(combat, attackerToken);
    if (!attacker) {
        sohl.log.uiWarn(
            "The attacker is not a combatant in the current combat.",
        );
        return null;
    }
    // Invariant: the attacker must not be incapacitated/dead/defeated.
    const attackerStatus = firstStatusIn(
        combatantStatuses(attacker),
        ATTACK_BLOCKING_STATUSES,
    );
    if (attackerStatus) {
        sohl.log.uiWarn(
            `${attackerToken.name ?? "The attacker"} cannot make an automated attack while ${attackerStatus}.`,
        );
        return null;
    }

    let target: SohlCombatant | null;
    const scopeTarget = (context.scope as any)?.targetCombatant;
    if (scopeTarget) {
        // Programmatic / headless: an explicit combatant id wins.
        target =
            (combat.combatants.get?.(scopeTarget) as
                | SohlCombatant
                | undefined) ?? null;
        if (!target) {
            sohl.log.uiWarn(
                "The specified target combatant is not in the current combat.",
            );
            return null;
        }
    } else {
        // Resolve from the client's targeted tokens, keeping only combatants.
        const targeted = SohlTokenDocument.getTargetedTokens() ?? [];
        try {
            target = resolveTargetCombatant(targeted, (t) =>
                combatantForToken(combat, t),
            );
        } catch (err) {
            sohl.log.uiWarn((err as Error).message);
            return null;
        }
    }

    const targetToken = target.token as SohlTokenDocument | null;
    if (!targetToken) {
        sohl.log.uiWarn("The target combatant has no token on the canvas.");
        return null;
    }
    // Invariant: a dead defender cannot be the target of an automated attack.
    if (firstStatusIn(combatantStatuses(target), [STATUS_EFFECT.DEAD])) {
        sohl.log.uiWarn(
            `${targetToken.name ?? "The target"} is dead and cannot be attacked.`,
        );
        return null;
    }
    const distanceFeet =
        SohlTokenDocument.rangeToTarget(attackerToken, targetToken) ?? Infinity;
    return { attacker, target, distanceFeet };
}

/** The resolved spatial context of a counterstrike (defender striking back). */
export interface CounterstrikeContext {
    /** The original attacker's combatant — always the counterstrike's target. */
    attacker: SohlCombatant;
    /** Center-to-center distance from defender to attacker, in feet. */
    distanceFeet: number;
}

/**
 * Resolve the counterstrike's spatial context. A counterstrike is itself an
 * attack, but its target is **never** resolved from the client's targeted tokens:
 * the target combatant is **always the original attacker** (the counterstrike
 * strikes back at whoever attacked). The attacker combatant is recovered from the
 * attack snapshot's speaker token; the distance is measured from the
 * counterstriking `defender` to them. Returns `null` (with a UI warning) when
 * either combatant's token is unavailable or the attacker is no longer in combat.
 */
export function resolveCounterstrikeContext(
    attackResult: AttackResult,
    defender: SohlCombatant | null,
): CounterstrikeContext | null {
    const attackerToken = attackResult.speaker?.token ?? null;
    const defenderToken = (defender?.token as SohlTokenDocument | null) ?? null;
    if (!attackerToken || !defenderToken) {
        sohl.log.uiWarn(
            "Counterstrike needs both the attacker's and defender's tokens on the canvas.",
        );
        return null;
    }
    const attacker = combatantForToken(getActiveCombat(), attackerToken);
    if (!attacker) {
        sohl.log.uiWarn(
            "The attacker is no longer a combatant in the current combat.",
        );
        return null;
    }
    const distanceFeet =
        SohlTokenDocument.rangeToTarget(defenderToken, attackerToken) ??
        Infinity;
    return { attacker, distanceFeet };
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
): Promise<{
    /** The selected choice key (e.g. the chosen strike mode). */
    key: string;
    /** The player-entered situational modifier. */
    situationalModifier: number;
} | null> {
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
    const recent = rc.attacker.lastAttackMode ?? null;
    const defaultIdx = defaultModeIndex(modes, recent);
    const choices: Record<string, string> = {};
    modes.forEach((m, i) => {
        choices[String(i)] = `${m.itemName} — ${m.strikeMode.name}`;
    });
    const attackerName = (rc.attacker.token as SohlTokenDocument | null)?.name;

    const pickedKey = await resolveActionInput<string | null>(context, {
        fromScope: (s) => {
            const idx = modes.findIndex(
                (m) => m.itemId === s.itemId && m.smId === s.strikeModeId,
            );
            return idx >= 0 ? String(idx) : String(defaultIdx);
        },
        dialog: () =>
            pickChoice(
                `${attackerName} — Select Attack`,
                "Strike Mode:",
                choices,
                String(defaultIdx),
            ),
    });
    if (pickedKey === null) return;
    const entry = modes[Number(pickedKey)];
    if (!entry) return;

    await startAutomatedAttack({
        attacker: rc.attacker,
        target: rc.target,
        mode: entry,
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
    const sm = p.mode.strikeMode as any;
    const attackerToken = p.attacker.token as SohlTokenDocument | null;
    const targetToken = p.target.token as SohlTokenDocument | null;
    if (!attackerToken || !targetToken) {
        sohl.log.uiWarn(
            "Automated combat requires both combatants to have a token in the scene.",
        );
        return;
    }
    const defenderActor = p.target.actor as any;
    const weaponName = p.mode.itemName;
    const distanceFeet =
        SohlTokenDocument.rangeToTarget(attackerToken, targetToken) ?? Infinity;

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
                `${attackerToken.name} vs. ${targetToken.name} Attack with ${weaponName}`,
                aimChoices,
                defaultAim,
            ),
    });
    if (!input) return;
    const { aim, situationalModifier } = input;

    // Spread (for injury hit-location scatter) + any impact range bonus.
    let spread: number;
    let impactRangeBonus = 0;
    if (sm.isMissile) {
        const band = classifyMissileRange(
            distanceFeet,
            sm.baseRange?.effective ?? 0,
        );
        if (!band.direct) {
            // Should not happen (range-filtered upstream), but guard volley.
            sohl.log.uiWarn(
                `${targetToken.name} is beyond direct range (volley is not supported).`,
            );
            return;
        }
        spread = band.spread;
        impactRangeBonus = band.impactRangeBonus;
    } else {
        spread = sm.spread?.effective ?? 0;
    }

    const testType =
        sm.isMissile ?
            TEST_TYPE.AUTOCOMBATMISSILE.id
        :   TEST_TYPE.AUTOCOMBATMELEE.id;
    const attackResult = buildAttackResult({
        attackML: sm.attack,
        impact: sm.impact,
        parent: sm.parentLogic,
        token: attackerToken,
        testType,
        aimBodyPartCode: aim,
        spread,
        title: weaponName,
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
    await p.attacker.recordAttackMode(p.mode.itemId, sm.id);

    if (context.noChat) return;
    const cardData = buildAttackCardData({
        attackResult,
        title: `${weaponName} ${sm.isMelee ? "Melee" : "Missile"} Attack`,
        attackerName: attackerToken.name ?? "",
        actorId: p.attacker.actor?.id ?? null,
        aimLabel: aimChoices[aim] ?? aim,
        target:
            defenderActor ?
                {
                    name: targetToken.name ?? "",
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
            `${(rc.target.token as SohlTokenDocument | null)?.name} is out of range of any strike mode (melee or missile).`,
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
            `${itemName} has no strike mode in range of ${(rc.target.token as SohlTokenDocument | null)?.name}.`,
        );
        return;
    }
    await chooseModeAndAttack(modes, rc, context);
}
