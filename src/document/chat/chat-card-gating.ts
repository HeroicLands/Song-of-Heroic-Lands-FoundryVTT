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

import { collectBlockableStrikeModes } from "@src/document/combatant/logic/SohlCombatantLogic";
import type { SohlActorLogic } from "../actor/logic/SohlActorBaseLogic";
import { DEFENSE_DISABLING_STATUSES } from "../combatant/logic/SohlCombatantLogic";
import { ITEM_KIND, SKILL_CODE } from "@src/utils/constants";

/**
 * Render-time gating for an attack card's defender-response buttons.
 *
 * The attack card is built once (on the attacker's client) and emits **all four**
 * defense buttons — Dodge / Counterstrike / Block / Ignore. Which ones a given
 * client may actually use is decided here, when the card renders on that client,
 * because the decision is viewer-dependent (ownership) and needs the *defender's*
 * own view of its strike modes (an attacker may not be able to enumerate them):
 *
 * - **Owner gate:** only a user who owns the defender actor (a GM owns all) may
 *   respond — everyone else sees no defense buttons.
 * - **Incapacitation gate (owner only):** if the defender is dead/unconscious/
 *   asleep/restrained/paralyzed/frozen/incapacitated, **Ignore is the only viable
 *   defense** — Dodge / Block / Counterstrike are all removed.
 * - **Capability gate (owner only):** **Block** shows only if the defender has a
 *   non-`noBlock` melee mode; **Counterstrike** only if it has a non-`noAttack`
 *   melee mode. **Dodge** and **Ignore** are always available to the owner.
 *
 * Composes the pure, unit-tested capability helpers and manipulates the DOM.
 * Foundry document resolution is injected via `resolveDefender` (the caller
 * passes `foundry.utils.fromUuidSync`), so the gating itself carries no Foundry
 * dependency and is unit-testable with a stub element + stub defender. A no-op
 * on any card without these buttons.
 *
 * @param element - The chat message's rendered root element.
 * @param resolveDefender - Resolves the defender document from a button's
 *   `data-handler-actor-uuid` (the caller supplies the Foundry lookup).
 */
export function gateAutomatedDefenseButtons(
    element: HTMLElement,
    resolveDefender: (uuid: string) => any,
): void {
    const find = (action: string) =>
        element.querySelector<HTMLButtonElement>(
            `button[data-action="${action}"]`,
        );
    const dodge = find("automatedDodgeResume");
    const counter = find("automatedCounterstrikeResume");
    const block = find("automatedBlockResume");
    const ignore = find("automatedIgnoreResume");

    // Not an attack card with defense buttons — leave everything alone.
    if (!dodge && !counter && !block && !ignore) return;

    // The defense buttons address the defender's **combatant**; the actor (and
    // its statuses/capability) is reached through it.
    const uuid = (dodge ?? counter ?? block ?? ignore)?.dataset
        .handlerActorUuid;
    const defender = uuid ? resolveDefender(uuid) : null;
    const defenderActor = defender?.actor ?? null;
    const actorLogic = defenderActor?.logic ?? null;

    if (!defender?.isOwner) {
        // Not the defender's owner: remove every defense button.
        for (const b of [dodge, counter, block, ignore]) b?.remove();
    } else if (
        hasAnyStatus(
            (defenderActor?.statuses ?? []) as Iterable<string>,
            DEFENSE_DISABLING_STATUSES,
        )
    ) {
        // Incapacitated defender: Ignore is the only viable defense.
        for (const b of [dodge, counter, block]) b?.remove();
    } else {
        // Owner: gate Dodge / Block / Counterstrike by capability; keep Ignore.
        if (dodge && (!actorLogic || !hasUsableDodgeSkill(actorLogic))) {
            dodge.remove();
        }
        if (
            block &&
            (!actorLogic ||
                collectBlockableStrikeModes(actorLogic).length === 0)
        ) {
            block.remove();
        }
        if (counter && (!actorLogic || !hasMeleeAttackStrikeMode(actorLogic))) {
            counter.remove();
        }
    }

    // Drop any button container left empty by the removals (so no stray box).
    element.querySelectorAll(".card-buttons").forEach((container) => {
        if (!container.querySelector("button")) container.remove();
    });
}

/**
 * Whether the actor has any **melee attack** strike mode it could counterstrike
 * with — i.e. a melee mode whose `attack` is present and not disabled (not
 * `noAttack`). Range-independent (reach is checked when the counterstrike is
 * actually resolved); this is the capability gate for showing the Counterstrike
 * button. Pure and Foundry-free.
 * @param actorLogic - The actor's logic; its weapons and combat techniques are scanned via logicTypes.
 * @returns `true` if the actor has any usable melee attack strike mode.
 */
export function hasMeleeAttackStrikeMode(
    actorLogic: SohlActorLogic<any>,
): boolean {
    const usable = (sm: any) => !!sm && !sm.attack?.disabled && !!sm.isMelee;
    const lt = actorLogic.logicTypes;
    for (const logic of lt[ITEM_KIND.WEAPONGEAR]) {
        for (const sm of logic.strikeModes ?? []) if (usable(sm)) return true;
    }
    for (const logic of lt[ITEM_KIND.SKILL]) {
        if (usable(logic.strikeMode)) return true;
    }
    return false;
}

/**
 * Whether the actor has a Dodge skill (shortcode `"dge"`) in its skill
 * logicTypes — the capability gate for showing the Dodge button. Pure and
 * Foundry-free.
 * @param actorLogic - The actor's logic; its skills are scanned via logicTypes.
 * @returns `true` if the actor has a Dodge skill.
 */
export function hasUsableDodgeSkill(actorLogic: SohlActorLogic<any>): boolean {
    return (actorLogic.logicTypes[ITEM_KIND.SKILL] ?? []).some(
        (skill: any) => skill.data?.shortcode === SKILL_CODE.DODGE,
    );
}

/**
 * Whether any id in `forbidden` is present in `statuses`. Pure.
 * @param statuses - The status-effect ids currently active.
 * @param forbidden - The status ids to scan for.
 * @returns `true` if any forbidden id is present in `statuses`.
 */
export function hasAnyStatus(
    statuses: Iterable<string>,
    forbidden: readonly string[],
): boolean {
    const set = statuses instanceof Set ? statuses : new Set(statuses);
    return forbidden.some((s) => set.has(s));
}
