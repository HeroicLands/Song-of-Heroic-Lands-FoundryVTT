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
 * Process a chat-card button click.
 * @param btn The HTMLButtonElement that represents the clicked button
 */
export function onChatCardButton(btn: HTMLButtonElement): void {}

/**
 * Process a chat-card edit link click (to modify the parameters of certain
 * chat cards).
 * @param edit The HTMLElement that represents the clicked element
 */
export function onChatCardEditAction(edit: HTMLElement): void {}
