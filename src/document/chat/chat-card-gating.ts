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
    collectBlockableStrikeModes,
    hasMeleeAttackStrikeMode,
    hasAnyStatus,
    DEFENSE_DISABLING_STATUSES,
} from "@src/document/actor/logic/combat-actions";

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
 * Foundry-facing glue: it touches the DOM and `fromUuidSync`, composing the pure,
 * unit-tested capability helpers. A no-op on any card without these buttons.
 *
 * @param element The chat message's rendered root element.
 */
export function gateAutomatedDefenseButtons(element: HTMLElement): void {
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
    const defender = uuid ? (foundry.utils.fromUuidSync(uuid) as any) : null;
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
        // Owner: keep Dodge + Ignore; gate Block + Counterstrike by capability.
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
