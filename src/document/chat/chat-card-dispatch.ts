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

import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import { buildActionScope } from "@src/utils/helpers";
import { runSequenceStep } from "@src/document/chat/sequence-runner";

/**
 * Resolve the UUID of the document that should handle a chat-card button or
 * edit-action click.
 *
 * Chat-card templates name the handler document inconsistently: the standard
 * test/fate cards use `data-doc-uuid`, the combat/injury cards use
 * `data-handler-actor-uuid` (the responding actor) or `data-handler-uuid`,
 * and the opposed-test cards use `data-action-handler-uuid`. Rather than
 * rename attributes across every template (which would risk regressions and
 * break any in-flight chat messages), the dispatcher normalizes the *reader*
 * here.
 *
 * Pure function — no DOM or Foundry globals — so it is unit-testable. The
 * `renderChatMessageHTML` hook in `sohl.ts` calls this with the clicked
 * element's `dataset`.
 *
 * Precedence (most specific / legacy first):
 *   1. `data-doc-uuid`            (standard-test, fate, edit-action cards)
 *   2. `data-handler-uuid`        (damage, injury, attack-result cards)
 *   3. `data-handler-actor-uuid`  (attack-card defender responder)
 *   4. `data-action-handler-uuid` (opposed-request / opposed-result cards)
 *
 * @param dataset - The `dataset` of the clicked button or anchor element.
 * @returns The resolved document UUID, or `null` if none is present.
 */
export function resolveChatCardHandlerUuid(
    dataset: DOMStringMap,
): string | null {
    return (
        dataset.docUuid ??
        dataset.handlerUuid ??
        dataset.handlerActorUuid ??
        dataset.actionHandlerUuid ??
        null
    );
}

/**
 * Resolve the handler document for a chat-card click **and authorize it** — the
 * current client is only allowed to act if it owns that document (a GM owns
 * all). Returns the document when authorized, or `null` when the click must be
 * ignored (no handler uuid, the uuid does not resolve, or the client is not an
 * owner).
 *
 * Chat cards address their buttons to the actor that should *handle* the click
 * (via {@link resolveChatCardHandlerUuid}'s attributes — most explicitly
 * `data-handler-actor-uuid`). An action run from a card mutates that actor's own
 * state, so — under actor-state sovereignty — only a client that owns the actor
 * may run it. This is the **click-time** half of that rule; the render-time half
 * (`gateAutomatedDefenseButtons`) hides buttons the client can't use. The
 * render-time gate is UX only and is bypassable by a synthesized click or a
 * direct handler call, so this authorization gate is the real boundary before
 * any dialog, scope revival, or intrinsic logic runs (issue #167).
 *
 * Pure: Foundry document resolution is injected via `resolveDoc` (the caller
 * passes `foundry.utils.fromUuidSync`), so this stays Foundry-free and
 * unit-testable, mirroring `gateAutomatedDefenseButtons`.
 *
 * @param dataset - The clicked element's `dataset`.
 * @param resolveDoc - Resolves a document from its uuid (the caller supplies the
 *   Foundry lookup).
 * @returns The authorized handler document, or `null` if the click is not
 *   authorized and must be ignored.
 */
export function resolveAuthorizedChatCardHandler(
    dataset: DOMStringMap,
    resolveDoc: (uuid: string) =>
        | {
              /** Whether the current client owns the document (a GM owns all). */
              isOwner?: boolean;
          }
        | null
        | undefined,
): {
    /** Whether the current client owns the document (a GM owns all). */
    isOwner?: boolean;
} | null {
    const uuid = resolveChatCardHandlerUuid(dataset);
    if (!uuid) return null;
    const doc = resolveDoc(uuid);
    return doc?.isOwner ? doc : null;
}

/**
 * Dispatch a chat-card action — either a button click or an edit-action link
 * click — to the given logic. Reads `btn.dataset.action`, builds an
 * {@link sohl.entity.action.SohlActionContext}, then dispatches through `logic.actions` (by name,
 * executor id, or title) before falling back to a direct method call on the
 * logic. Warns via `sohl.log.warn` when no handler is found.
 *
 * Pure dispatch path — callers are responsible for the ownership check before
 * calling this function.
 *
 * @param logic - The logic instance that should handle the action.
 * @param btn - The clicked element (button or anchor); `dataset.action` names
 *   the action to dispatch.
 */
export async function dispatchChatCardAction(
    logic: SohlLogic,
    btn: HTMLElement,
): Promise<void> {
    // A Chat Sequence button advances a running interaction rather than invoking
    // a single action; route it to the sequence runtime (which itself runs the
    // chosen choice's action on this logic).
    if (btn.dataset.sequenceId) {
        await runSequenceStep(logic, btn);
        return;
    }

    const actionName = btn.dataset.action;
    if (!actionName) return;

    const context = new SohlActionContext({
        speaker: (logic as any).speaker,
        type: actionName,
        title: btn.textContent?.trim() ?? actionName,
        scope: buildActionScope(
            btn.dataset,
            (logic as any).actorLogic ?? logic,
        ),
    });

    const action =
        logic.actions.get(actionName) ??
        [...logic.actions.values()].find(
            (act) =>
                act.data.executor === actionName ||
                act.data.title === actionName,
        );

    if (action) {
        await action.execute(context);
        return;
    }

    const fn = (logic as any)[actionName];
    if (typeof fn === "function") {
        await fn.call(logic, context);
    } else {
        sohl.log.warn(
            `Chat-card action "${actionName}" not found on logic "${(logic as any).item?.name ?? logic.constructor.name}".`,
        );
    }
}
