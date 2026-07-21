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

/**
 * The pure **Chat Sequence** engine operations — starting an instance, computing
 * a step's renderable choices, advancing on a chosen choice, and building the
 * generic card render context. Foundry-free: the Foundry runtime supplies the
 * document lookups, posts the card, and dispatches clicks; these functions just
 * compute the next state and the card data. See
 * {@link sohl.entity.sequence.SohlSequence} for the types and registry.
 */

import type {
    SequenceDefinition,
    SequenceInstance,
    SequenceState,
    SequenceStep,
    SequenceChoice,
} from "@src/entity/sequence/SohlSequence";

/**
 * Start a new instance of a sequence at its initial step.
 *
 * @param def - The sequence definition.
 * @param roles - Role name → bound document uuid (the button handler uuid).
 * @param state - The initial ledger state.
 * @returns A fresh {@link SequenceInstance}.
 */
export function startInstance(
    def: SequenceDefinition,
    roles: Record<string, string>,
    state: SequenceState = {},
): SequenceInstance {
    return { sequenceId: def.id, stepId: def.initial, roles, state };
}

/**
 * The choices of a step that should be rendered as buttons — those whose `when`
 * predicate passes (a choice with no `when` always renders). Ownership gating is
 * separate: the card is addressed to the step's `by` role, so the click-time
 * handler-uuid gate decides who may actually click.
 *
 * @param step - The step whose choices to filter.
 * @param state - The current ledger state.
 * @returns The renderable choices, in definition order.
 */
export function renderableChoices(
    step: SequenceStep,
    state: SequenceState,
): SequenceChoice[] {
    return step.choices.filter((c) => c.when?.(state) ?? true);
}

/** The outcome of advancing a sequence: the new instance and whether it ended. */
export interface AdvanceResult {
    /** The advanced instance (its `stepId` is unchanged when `done`). */
    instance: SequenceInstance;
    /** Whether the sequence has ended (the chosen choice's `next` was `null`). */
    done: boolean;
}

/**
 * Advance a running sequence by the chosen choice and its action's result: fold
 * the result into the ledger (via the choice's `reduce`) and move to the choice's
 * `next` step (static, or computed from the result) — or end when `next` is
 * `null`.
 *
 * Pure: the caller has already run the choice's action (through the shared
 * chat-card dispatch chokepoint) and passes its `actionResult` here.
 *
 * @param instance - The current instance.
 * @param def - The instance's sequence definition.
 * @param choiceKey - The key of the chosen {@link SequenceChoice}.
 * @param actionResult - The result the choice's action produced.
 * @returns The {@link AdvanceResult}.
 * @throws Error if the step has no choice with `choiceKey`.
 */
export function advanceSequence(
    instance: SequenceInstance,
    def: SequenceDefinition,
    choiceKey: string,
    actionResult: unknown,
): AdvanceResult {
    const step = def.steps[instance.stepId];
    const choice = step?.choices.find((c) => c.key === choiceKey);
    if (!choice) {
        throw new Error(
            `Sequence "${def.id}" step "${instance.stepId}": no choice "${choiceKey}".`,
        );
    }
    const state =
        choice.reduce ?
            choice.reduce(instance.state, actionResult)
        :   instance.state;
    const next =
        typeof choice.next === "function" ?
            choice.next(actionResult)
        :   choice.next;
    return {
        instance: { ...instance, stepId: next ?? instance.stepId, state },
        done: next === null,
    };
}

/** A single rendered button in a sequence card. */
export interface SequenceCardButton {
    /** The action the button dispatches. */
    action: string;
    /** The choice key (carried so the runtime can advance the right transition). */
    choiceKey: string;
    /** Button label. */
    label: string;
    /** Optional FontAwesome icon class. */
    iconFAClass?: string;
}

/** The render context for the generic sequence card. */
export interface SequenceCardData {
    /** The sequence id (carried on the card). */
    sequenceId: string;
    /** The current step id (carried on the card). */
    stepId: string;
    /** Card title (from the step's content). */
    title: string;
    /** Card body (from the step's content; empty string when none). */
    body: string;
    /** The acting role's document uuid — the button handler / ownership gate. */
    handlerUuid: string;
    /** One button per renderable choice. */
    buttons: SequenceCardButton[];
}

/**
 * Build the generic card render context for a sequence instance's current step:
 * the step's content, the acting role's handler uuid (the click-time ownership
 * gate), and one button per renderable choice.
 *
 * @param def - The instance's sequence definition.
 * @param instance - The current instance.
 * @returns The {@link SequenceCardData} for the generic card template.
 */
export function buildSequenceCardData(
    def: SequenceDefinition,
    instance: SequenceInstance,
): SequenceCardData {
    const step = def.steps[instance.stepId];
    const content = step.card(instance.state);
    return {
        sequenceId: def.id,
        stepId: instance.stepId,
        title: content.title,
        body: content.body ?? "",
        handlerUuid: instance.roles[step.by],
        buttons: renderableChoices(step, instance.state).map((c) => ({
            action: c.action,
            choiceKey: c.key,
            label: c.label,
            iconFAClass: c.iconFAClass,
        })),
    };
}
