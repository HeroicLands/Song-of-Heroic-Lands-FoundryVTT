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

import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import { buildActionScope } from "@src/utils/helpers";

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
 * @param dataset The `dataset` of the clicked button or anchor element.
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
 * Dispatch a chat-card action — either a button click or an edit-action link
 * click — to the given logic. Reads `btn.dataset.action`, builds an
 * {@link SohlActionContext}, then dispatches through `logic.actions` (by name,
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
