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
 * The **Chat Sequence runtime** — walks a {@link sohl.entity.sequence | sequence}
 * over the chat log. It posts the current step's card (addressed to the acting
 * role's actor), and on a button click runs the chosen choice's action through
 * the shared chat-card chokepoint, folds the result into the ledger
 * ({@link sohl.entity.sequence.advanceSequence}), and posts the next step's card —
 * or finishes on a terminal choice.
 *
 * Foundry-free at the boundary: it resolves documents and posts cards only
 * through the `fvtt*` shims and the logic-layer {@link sohl.core.logic.SohlSpeaker},
 * so it stays consent-structural — nothing here mutates a character; the choices'
 * own actions do, and only because a human clicked an ownership-gated button.
 */

import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import {
    toFilePath,
    buildActionScope,
    defaultToJSON,
} from "@src/utils/helpers";
import {
    getSequence,
    startInstance,
    advanceSequence,
    buildSequenceCardData,
    type SequenceDefinition,
    type SequenceInstance,
} from "@src/entity/sequence";
import type { SohlLogic } from "@src/core/logic/SohlLogic";

/** Path to the generic sequence-card template. */
const SEQUENCE_CARD_TEMPLATE = "systems/sohl/templates/chat/sequence-card.hbs";

/**
 * Run a named action or method on `logic` and return its result — the value that
 * gets folded into the sequence ledger. Mirrors the chat-card dispatch chokepoint
 * (`logic.actions` by name / executor / title, then a method fallback), but
 * returns the result rather than discarding it.
 *
 * @param logic - The acting role's logic.
 * @param actionName - The action shortcode or method name.
 * @param context - The action context (scope from the ledger, `skipDialog`).
 * @returns The action's result, or `undefined` when it resolves to nothing.
 */
async function runLogicAction(
    logic: SohlLogic,
    actionName: string,
    context: SohlActionContext,
): Promise<unknown> {
    const action =
        logic.actions?.get?.(actionName) ??
        [...(logic.actions?.values?.() ?? [])].find(
            (act) =>
                act.data.executor === actionName ||
                act.data.title === actionName,
        );
    if (action) return action.execute(context);

    const fn = (logic as unknown as Record<string, unknown>)[actionName];
    if (typeof fn === "function") {
        return (fn as (c: SohlActionContext) => unknown).call(logic, context);
    }
    sohl.log.warn(
        `SoHL | Sequence action "${actionName}" not found on logic "${logic.constructor.name}".`,
    );
    return undefined;
}

/** The minimal speaker surface the runner needs to post a card. */
interface CardSpeaker {
    toChat: (template: any, data: any) => Promise<unknown>;
}

/**
 * Post the current step's card to chat. The card's **button** is addressed to the
 * acting role (the click-time / render-time gate — a document owner, or `@self`
 * for an open step); the card is **spoken** by `speaker` — the actor announcing
 * it (the sequence's initiator, or the actor who just acted). Announcer and
 * responder are deliberately distinct: an open (`@self`) step has no bound
 * responder to speak it.
 *
 * @param def - The sequence definition.
 * @param instance - The current instance (its `stepId` selects the card).
 * @param speaker - The speaker announcing the card.
 * @returns A promise that resolves once the card is posted.
 */
export async function postSequenceCard(
    def: SequenceDefinition,
    instance: SequenceInstance,
    speaker: CardSpeaker | undefined,
): Promise<void> {
    if (!speaker) {
        sohl.log.warn(
            `SoHL | Sequence "${def.id}": no speaker to announce step "${instance.stepId}"; cannot post card.`,
        );
        return;
    }
    const cardData = buildSequenceCardData(def, instance);
    await speaker.toChat(toFilePath(SEQUENCE_CARD_TEMPLATE), {
        title: cardData.title,
        body: cardData.body,
        sequenceId: cardData.sequenceId,
        stepId: cardData.stepId,
        handlerUuid: cardData.handlerUuid,
        // The serialized instance the buttons carry (revived by buildActionScope
        // on the next click); round-tripped through defaultToJSON so any
        // `__kind`-tagged ledger value survives.
        scopeData: defaultToJSON({
            roles: instance.roles,
            state: instance.state,
        }),
        buttons: cardData.buttons,
    });
}

/**
 * Start a new instance of a sequence and post its initial card.
 *
 * @param def - The sequence definition to run.
 * @param roles - Role name → the bound actor's uuid (or the `@self` sentinel).
 * @param state - The initial ledger state.
 * @param speaker - The initiator's speaker, which announces the first card.
 * @returns A promise that resolves once the initial card is posted.
 */
export async function startSequence(
    def: SequenceDefinition,
    roles: Record<string, string>,
    state: Record<string, unknown>,
    speaker: CardSpeaker | undefined,
): Promise<void> {
    await postSequenceCard(def, startInstance(def, roles, state), speaker);
}

/**
 * Handle a sequence-card button click: revive the instance from the button, run
 * the chosen choice's action on `logic` (the acting role's logic, `skipDialog`
 * with the ledger-projected scope), advance the sequence with the result, and
 * post the next step's card — or finish on a terminal choice.
 *
 * Dispatched from the shared chat-card chokepoint when a button carries a
 * `data-sequence-id`.
 *
 * @param logic - The acting role's logic (resolved from the button's handler uuid).
 * @param btn - The clicked sequence-card button.
 * @returns A promise that resolves once the step is processed.
 */
export async function runSequenceStep(
    logic: SohlLogic,
    btn: HTMLElement,
): Promise<void> {
    const sequenceId = btn.dataset.sequenceId ?? "";
    const def = getSequence(sequenceId);
    if (!def) {
        sohl.log.warn(`SoHL | Unknown sequence "${sequenceId}".`);
        return;
    }
    const choiceKey = btn.dataset.choiceKey ?? "";
    const revived = buildActionScope(
        btn.dataset,
        (logic as unknown as { actorLogic?: unknown }).actorLogic ?? logic,
    ) as { roles?: Record<string, string>; state?: Record<string, unknown> };
    const instance: SequenceInstance = {
        sequenceId,
        stepId: btn.dataset.stepId ?? def.initial,
        roles: revived.roles ?? {},
        state: revived.state ?? {},
    };
    const step = def.steps[instance.stepId];
    const choice = step?.choices.find((c) => c.key === choiceKey);
    if (!choice) {
        sohl.log.warn(
            `SoHL | Sequence "${def.id}" step "${instance.stepId}": no choice "${choiceKey}".`,
        );
        return;
    }

    const context = new SohlActionContext({
        speaker: (logic as unknown as { speaker?: any }).speaker,
        skipDialog: true,
        type: choice.action,
        scope: choice.scope?.(instance.state) ?? {},
    });
    const result = await runLogicAction(logic, choice.action, context);

    // A step whose action returns `undefined` did not complete (e.g. it
    // self-gated and aborted, or a dialog was cancelled): the sequence does not
    // advance and no next card is posted, so the current card stays live for
    // another responder. State lives only in the posted cards — nothing here is
    // consumed or locked.
    if (result === undefined) return;

    const { instance: next, done } = advanceSequence(
        instance,
        def,
        choiceKey,
        result,
    );
    if (done) return;
    // The actor who just acted announces the next card (its button targets the
    // next role).
    await postSequenceCard(
        def,
        next,
        (logic as unknown as { speaker?: CardSpeaker }).speaker,
    );
}
