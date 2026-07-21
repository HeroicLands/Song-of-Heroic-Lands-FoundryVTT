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
 * **Chat Sequence** definitions and registry — the declarative, Foundry-free core
 * of the consent-gated interaction engine.
 *
 * A **Sequence** models a multi-step, multi-party interaction (treatment,
 * timed-effect offer/remind/perform, a combat exchange) as a step graph. Each
 * step is performed by one **role**; a click on one of the step's **choices**
 * runs a normal {@link sohl.entity.action.SohlAction}, folds its result into the
 * sequence's threaded **ledger** state, and advances to the next step — or ends.
 * Because every transition is a human-triggered, ownership-gated, chat-posted
 * step, the engine makes the project's assist-only / consent design structural.
 *
 * This module holds the **types**, the **registry** (`defineSequence` /
 * `getSequence`), and **validation**. The pure engine operations
 * (advance / render) live in {@link sohl.entity.sequence | sequence-engine}. No
 * Foundry access; the Foundry runtime (posting cards, routing clicks) is a thin
 * layer on top.
 */

/**
 * The threaded, serializable **ledger** state of a running sequence instance —
 * the accumulated context prior steps have produced (a request, a roll result,
 * …). Distinct from an individual action's `context.scope`.
 */
export type SequenceState = Record<string, unknown>;

/**
 * The presentation content of a step's card — supplied by the feature; the engine
 * wraps it in the generic card shell and adds the choice buttons.
 */
export interface SequenceCardContent {
    /** Card title. */
    title: string;
    /** Optional card body (already localized/escaped by the feature). */
    body?: string;
}

/**
 * One offered transition within a step — rendered as a single button, gated to
 * the step's acting role, that runs an action and advances the sequence.
 */
export interface SequenceChoice {
    /** Stable id of this choice / its button. */
    key: string;
    /** Button label (an i18n key or a literal). */
    label: string;
    /** Optional FontAwesome icon class for the button. */
    iconFAClass?: string;
    /**
     * Conditional visibility (capability/status), evaluated against the ledger.
     * Absent means always visible. Re-checked at click time by the runtime.
     */
    when?: (state: SequenceState) => boolean;
    /**
     * The action this choice runs — a {@link sohl.entity.action.SohlAction}
     * shortcode or a logic method name, dispatched through the shared chat-card
     * chokepoint.
     */
    action: string;
    /**
     * Project the ledger into the action's `context.scope`. Absent means the
     * action receives an empty scope (and, under `skipDialog`, its own defaults).
     */
    scope?: (state: SequenceState) => Record<string, unknown>;
    /**
     * Fold the action's result into the ledger. Absent means the state is
     * unchanged.
     */
    reduce?: (state: SequenceState, result: unknown) => SequenceState;
    /**
     * The next step: a static step id, a function of the action result, or `null`
     * to end the sequence (the choice's action is the terminal recording step).
     */
    next: string | null | ((result: unknown) => string | null);
}

/**
 * One step of a sequence: a single **role** acts, choosing among the step's
 * {@link SequenceChoice | choices}. A single-action step simply has one choice.
 */
export interface SequenceStep {
    /**
     * The role permitted to act on this step. The step's card is addressed to
     * this role's document, so only its owner (or a GM) may click — the click-time
     * ownership gate.
     */
    by: string;
    /** Build the card content shown for this step from the current ledger. */
    card: (state: SequenceState) => SequenceCardContent;
    /** The offered choices (one button each). */
    choices: SequenceChoice[];
}

/**
 * A declarative **sequence**: named participant roles and a step graph.
 */
export interface SequenceDefinition {
    /** Unique sequence id. */
    id: string;
    /** Named participant roles, bound to documents when an instance starts. */
    roles: string[];
    /** The id of the initial step. */
    initial: string;
    /** The steps, keyed by id. */
    steps: Record<string, SequenceStep>;
}

/**
 * A running **instance** of a sequence — which sequence, the current step, the
 * role→document bindings, and the accumulated ledger. Serializable so it can be
 * carried on a chat card and revived on the next click.
 */
export interface SequenceInstance {
    /** The {@link SequenceDefinition.id} this instance runs. */
    sequenceId: string;
    /** The current step id. */
    stepId: string;
    /** Role name → the bound document's uuid (the button handler uuid). */
    roles: Record<string, string>;
    /** The threaded ledger state. */
    state: SequenceState;
}

/**
 * Validate a sequence definition's static structure — throwing on the first
 * problem. Checks that the `initial` step exists, that every step's `by` role is
 * declared in `roles`, and that every **static** `next` target (a string) names a
 * real step. Function-valued `next` targets can only be checked at runtime.
 *
 * @param def - The sequence definition to validate.
 * @throws Error describing the first structural problem found.
 */
export function validateSequence(def: SequenceDefinition): void {
    if (!def.steps[def.initial]) {
        throw new Error(
            `Sequence "${def.id}": initial step "${def.initial}" does not exist.`,
        );
    }
    const roles = new Set(def.roles);
    for (const [stepId, step] of Object.entries(def.steps)) {
        if (!roles.has(step.by)) {
            throw new Error(
                `Sequence "${def.id}" step "${stepId}": role "${step.by}" is not declared in roles.`,
            );
        }
        for (const choice of step.choices) {
            if (typeof choice.next === "string" && !def.steps[choice.next]) {
                throw new Error(
                    `Sequence "${def.id}" step "${stepId}" choice "${choice.key}": next step "${choice.next}" does not exist.`,
                );
            }
        }
    }
}

/** The sequence registry — populated by {@link defineSequence}. */
const SEQUENCES = new Map<string, SequenceDefinition>();

/**
 * Register a sequence definition. Validates it ({@link validateSequence}) and
 * rejects a duplicate id.
 *
 * @param def - The sequence definition to register.
 * @returns The same definition (for `export const X = defineSequence(...)`).
 * @throws Error if the id is already registered or the definition is invalid.
 */
export function defineSequence(def: SequenceDefinition): SequenceDefinition {
    if (SEQUENCES.has(def.id)) {
        throw new Error(`Sequence "${def.id}" is already registered.`);
    }
    validateSequence(def);
    SEQUENCES.set(def.id, def);
    return def;
}

/**
 * Look up a registered sequence definition by id.
 *
 * @param id - The sequence id.
 * @returns The definition, or `undefined` if none is registered.
 */
export function getSequence(id: string): SequenceDefinition | undefined {
    return SEQUENCES.get(id);
}
