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
} from "@src/document/actor/foundry/combat-actions";
import { toFilePath, toHTMLString } from "@src/utils/helpers";
import { resolveActionInput } from "@src/utils/actionInput";
import { ITEM_KIND, TEST_TYPE, VALUE_DELTA_ID } from "@src/utils/constants";
import type { StrikeModeBase } from "@src/domain/strikemode/StrikeModeBase";
import type { SohlLogic } from "@src/core/SohlLogic";
import type { SohlActionContext } from "@src/core/SohlActionContext";

/**
 * Orchestration glue for **automated combat** — the attacker's entry flow.
 *
 * This module is the Foundry-facing layer: it drives dialogs and posts the
 * attack chat card. The Foundry-free, unit-tested pieces it composes
 * (`buildAttackResult`, `buildAttackCardData`, `resolveAttackTarget`) live in
 * `combat-actions.ts`; this file keeps them apart from the UI plumbing.
 *
 * Every dialog here is **bypassable**: with `context.skipDialog` set, the same
 * inputs are read from `context.scope` instead (see {@link resolveActionInput}).
 * Dialog callbacks are side-effect-free — they only return data — so the two
 * paths converge on one apply site. `context.noChat` suppresses the chat post.
 * Together these let the whole flow run headlessly.
 */

/** The attack dialog's inputs (from the dialog form or from `scope`). */
interface AttackDialogInput {
    /** The targeted body part (shortcode). */
    aim: string;
    /** Player-entered additional modifier. */
    situationalModifier: number;
}

/** A strike mode paired with the item logic that owns it (for the actor-level picker). */
interface AttackEntry {
    /** The owning item's logic (parent of the resulting AttackResult). */
    logic: SohlLogic;
    /** The owning item's id (stable key for headless `scope` selection). */
    itemId: string;
    /** The strike mode to attack with. */
    strikeMode: StrikeModeBase;
    /** The owning item's display name, used in the card title. */
    itemName: string;
}

/** Parameters for {@link startAutomatedAttack}. */
export interface StartAutomatedAttackParams {
    /** Logic that owns the resulting AttackResult and its cloned modifiers. */
    attackerLogic: SohlLogic;
    /** The attacker's token (must be a real, owned token so `evaluate()` passes its ownership gate). */
    attackerToken: SohlTokenDocument;
    /** The chosen strike mode. */
    strikeMode: StrikeModeBase;
    /** The wielding item's display name (card title). */
    weaponName: string;
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

/**
 * Build the Aim select options (a `{ shortcode: label }` map for Foundry's
 * `selectOptions` helper) from the defender's body parts. Empty when the
 * defender has no lineage / body structure.
 */
function buildAimChoices(defenderActor: any): Record<string, string> {
    const lineageLogic = defenderActor?.itemTypes?.[ITEM_KIND.LINEAGE]?.[0]
        ?.logic as any;
    const parts: any[] = lineageLogic?.bodyStructure?.parts ?? [];
    const choices: Record<string, string> = {};
    for (const part of parts) {
        // BodyPart has no display name of its own; fall back to its first
        // location's name, then to the shortcode.
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
 * inputs, or `null` if dismissed. Side-effect-free: the callback only reads the
 * form and returns data.
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
 * Present a single-select dialog and resolve to the chosen key, or `null` if
 * dismissed. Side-effect-free.
 */
function pickChoice(
    title: string,
    label: string,
    choices: Record<string, string>,
): Promise<string | null> {
    const keys = Object.keys(choices);
    const defaultKey = keys[0] ?? "";
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
 * field; resolve to `{ key, situationalModifier }` or `null` if dismissed.
 * Side-effect-free. Used by Block (and any other defense that picks a mode plus a
 * modifier).
 */
export function showDefenseDialog(
    title: string,
    selectLabel: string,
    choices: Record<string, string>,
): Promise<{ key: string; situationalModifier: number } | null> {
    const defaultKey = Object.keys(choices)[0] ?? "";
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
 * Collect every attackable strike mode across the actor's weapons and combat
 * techniques (for the actor-level entry). Modes whose attack is disabled
 * (e.g. the `noAttack` trait) are filtered out.
 */
function collectAttackEntries(actor: any): AttackEntry[] {
    const out: AttackEntry[] = [];
    const itemTypes = actor?.itemTypes ?? {};
    for (const item of itemTypes[ITEM_KIND.WEAPONGEAR] ?? []) {
        const logic = item.logic as any;
        for (const sm of (logic?.strikeModes ?? []) as StrikeModeBase[]) {
            if (!sm.attack.disabled) {
                out.push({
                    logic,
                    itemId: item.id,
                    strikeMode: sm,
                    itemName: item.name,
                });
            }
        }
    }
    for (const item of itemTypes[ITEM_KIND.COMBATTECHNIQUE] ?? []) {
        const logic = item.logic as any;
        const sm = logic?.strikeMode as StrikeModeBase | undefined;
        if (sm && !sm.attack.disabled) {
            out.push({
                logic,
                itemId: item.id,
                strikeMode: sm,
                itemName: item.name,
            });
        }
    }
    return out;
}

/**
 * Run the attacker-side automated-combat flow for a chosen strike mode:
 * resolve the single targeted, in-combat defender → resolve the attack inputs
 * (dialog, or `scope` when `skipDialog`) → assemble and evaluate the
 * {@link AttackResult} on the attacker's client → post the attack card with the
 * serialized result embedded in the defense buttons (unless `noChat`).
 */
export async function startAutomatedAttack(
    p: StartAutomatedAttackParams,
): Promise<void> {
    const { context } = p;

    // 1. Resolve the single targeted defender, which must be in the combat.
    const combat = getActiveCombat();
    const targeted = SohlTokenDocument.getTargetedTokens() ?? [];
    let defenderToken: SohlTokenDocument;
    try {
        defenderToken = resolveAttackTarget(targeted, (t) =>
            tokenInCombat(combat, t),
        );
    } catch (err) {
        sohl.log.uiWarn((err as Error).message);
        return;
    }
    const defenderActor = defenderToken.actor as any;

    // 2. Aim choices come from the defender's body parts (echoed on the card).
    const aimChoices = buildAimChoices(defenderActor);
    const defaultAim = Object.keys(aimChoices)[0] ?? "";

    // 3. Attack inputs: from the dialog, or from `scope` when `skipDialog`.
    const input = await resolveActionInput<AttackDialogInput>(context, {
        fromScope: (s) => ({
            aim: String(s.aim ?? defaultAim),
            situationalModifier:
                Number.parseInt(String(s.situationalModifier), 10) || 0,
        }),
        dialog: () =>
            showAttackDialog(
                `${p.attackerToken.name} vs. ${defenderToken.name} Attack with ${p.weaponName}`,
                aimChoices,
                defaultAim,
            ),
    });
    if (!input) return;
    const { aim, situationalModifier } = input;

    // 4. Assemble + evaluate the attack on the attacker's client (owns the speaker).
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
        title: p.weaponName,
    });
    if (situationalModifier) {
        attackResult.masteryLevelModifier.add(
            VALUE_DELTA_ID.PLAYER,
            situationalModifier,
        );
    }
    await attackResult.evaluate();

    // 5. Post the attack card (spoken by the attacker). All four defense buttons
    //    are emitted; per-defender capability gating happens at render time.
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
                    name: defenderToken.name ?? "",
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
 * Actor-level entry: gather every attackable strike mode across the actor's
 * weapons and combat techniques, choose one (dialog, or `scope.itemId` +
 * `scope.strikeModeId` when `skipDialog`), then run the attack.
 */
export async function startAutomatedAttackFromActor(
    actorLogic: SohlLogic,
    context: SohlActionContext<any>,
): Promise<void> {
    const actor = actorLogic.actor as any;
    const attackerToken = resolveAttackerToken(actor, context.token);
    if (!attackerToken) return;

    const entries = collectAttackEntries(actor);
    if (entries.length === 0) {
        sohl.log.uiWarn("This actor has no usable attack.");
        return;
    }

    const choices: Record<string, string> = {};
    entries.forEach((e, i) => {
        choices[String(i)] = `${e.itemName} — ${e.strikeMode.name}`;
    });

    const pickedKey = await resolveActionInput<string | null>(context, {
        fromScope: (s) => {
            const idx = entries.findIndex(
                (e) =>
                    e.itemId === s.itemId &&
                    e.strikeMode.id === s.strikeModeId,
            );
            return idx >= 0 ? String(idx) : "0";
        },
        dialog: () =>
            pickChoice(
                `${attackerToken.name} — Select Attack`,
                "Strike Mode:",
                choices,
            ),
    });
    if (pickedKey === null) return;
    const entry = entries[Number(pickedKey)];
    if (!entry) return;

    await startAutomatedAttack({
        attackerLogic: entry.logic,
        attackerToken,
        strikeMode: entry.strikeMode,
        weaponName: entry.itemName,
        context,
    });
}

/**
 * Item-level entry: run the attack for one item's strike modes. The mode is
 * chosen via dialog when there is more than one; with `skipDialog` it is read
 * from `scope.strikeModeId` (falling back to the first attackable mode).
 */
export async function startAutomatedAttackFromItem(
    itemLogic: SohlLogic,
    strikeModes: StrikeModeBase[],
    itemName: string,
    context: SohlActionContext<any>,
): Promise<void> {
    const attackerToken = resolveAttackerToken(
        itemLogic.actor as any,
        context.token,
    );
    if (!attackerToken) return;

    const modes = strikeModes.filter((sm) => !sm.attack.disabled);
    if (modes.length === 0) {
        sohl.log.uiWarn(`${itemName} has no usable strike mode.`);
        return;
    }

    let strikeMode = modes[0];
    if (modes.length > 1 || context.skipDialog) {
        const choices: Record<string, string> = {};
        modes.forEach((m) => {
            choices[m.id] = m.name;
        });
        const pickedId = await resolveActionInput<string | null>(context, {
            fromScope: (s) => String(s.strikeModeId ?? modes[0].id),
            dialog: () =>
                pickChoice(
                    `${itemName} — Select Strike Mode`,
                    "Strike Mode:",
                    choices,
                ),
        });
        if (pickedId === null) return;
        strikeMode = modes.find((m) => m.id === pickedId) ?? modes[0];
    }

    await startAutomatedAttack({
        attackerLogic: itemLogic,
        attackerToken,
        strikeMode,
        weaponName: itemName,
        context,
    });
}
