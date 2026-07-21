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
 * **Action cards** — the connective tissue of the consent model.
 *
 * An action card is an ordinary chat card whose buttons each invoke a
 * *self-sufficient action* — the same action a human could run from a sheet or
 * context menu, just pre-filled. The card is never special or privileged: its
 * button carries the action's parameters and a `skipDialog` marker, so clicking
 * it runs exactly the action the player could have run by hand (which would open
 * a dialog to gather those same parameters). Nothing is consumed or locked;
 * state lives in the posted cards, so a card can be ignored, answered later, or
 * overridden — see the security/consent model at
 * https://kb.heroiclands.org/dev/concepts/security-model/.
 *
 * {@link buildActionCard} is a pure assembler: it renders a caller-authored card
 * **body** (its own template or inline content — buttons are *not* part of it)
 * and appends the standard button block, returning the finished HTML. The card
 * author never writes the buttons. {@link postActionCard} is the one-line
 * convenience that posts that HTML through a {@link sohl.core.logic.SohlSpeaker}
 * (whose `toChat` accepts raw HTML directly).
 */

import {
    toHTMLWithTemplate,
    toHTMLWithContent,
} from "@src/core/FoundryHelpers";
import {
    toFilePath,
    toHTMLString,
    defaultToJSON,
    type HTMLString,
    type FilePath,
} from "@src/utils/helpers";

/** Path to the generic action-card button block appended by {@link buildActionCard}. */
const ACTION_BUTTONS_TEMPLATE =
    "systems/sohl/templates/chat/action-buttons.hbs";

/**
 * One button on an action card — a pre-filled invocation of a self-sufficient
 * action. Clicking it dispatches `action` on the resolved handler with `scope`
 * as the action context's scope and `skipDialog` set, so the action proceeds
 * without prompting (the card already supplied the parameters).
 */
export interface ActionCardButton {
    /** The action/executor name (or method name) to dispatch. */
    action: string;
    /**
     * The button's handler — the document whose owner may click it — as a
     * document uuid, or the `@self` sentinel ({@link sohl.document.chat.SELF_HANDLER})
     * for an **open** button any player may answer (their own default character
     * responds).
     */
    handlerUuid: string;
    /** The parameters handed to the action as its context scope. */
    scope?: Record<string, unknown>;
    /** The button label. */
    label: string;
    /** Optional Font Awesome icon class shown before the label. */
    iconFAClass?: string;
    /**
     * Whether the click runs the action with `skipDialog`. Defaults to `true` —
     * an action card pre-fills the parameters, so the dialog is unnecessary.
     */
    skipDialog?: boolean;
}

/**
 * The specification for an action card: a caller-authored **body** and zero or
 * more **buttons**. The body and the buttons are independent — a card author
 * supplies only the body (via `template` or `content`); {@link buildActionCard}
 * appends the buttons.
 */
export interface ActionCardSpec {
    /** Card body: a Handlebars template path, rendered with `data`. */
    template?: string;
    /** Card body: inline Handlebars content, rendered with `data` (alternative to `template`). */
    content?: string;
    /** Render data for `template` / `content`. */
    data?: Record<string, unknown>;
    /**
     * The card's buttons — a single button, an array, or omitted/empty for an
     * **informational** card (a result with no next action to offer).
     */
    buttons?: ActionCardButton | ActionCardButton[];
}

/** The per-button shape handed to the button template (scope pre-serialized). */
interface RenderableButton {
    action: string;
    handlerUuid: string;
    scopeJSON: string;
    label: string;
    iconFAClass?: string;
    skipDialog: boolean;
}

/**
 * Normalize a spec's `buttons` (one, many, or none) into the render shape,
 * pre-serializing each scope so the template only emits it (never builds HTML
 * from data). `skipDialog` defaults to `true`.
 *
 * @param buttons - The spec's buttons.
 * @returns The renderable button array (possibly empty).
 */
function toRenderableButtons(
    buttons: ActionCardSpec["buttons"],
): RenderableButton[] {
    if (!buttons) return [];
    const list = Array.isArray(buttons) ? buttons : [buttons];
    return list.map((b) => ({
        action: b.action,
        handlerUuid: b.handlerUuid,
        // Round-trip through defaultToJSON so any `__kind`-tagged scope value
        // (e.g. an embedded AttackResult) survives; revived by buildActionScope
        // on click.
        scopeJSON: JSON.stringify(defaultToJSON(b.scope ?? {})),
        label: b.label,
        iconFAClass: b.iconFAClass,
        skipDialog: b.skipDialog ?? true,
    }));
}

/**
 * Assemble an action card's HTML: render the caller-authored body, then append
 * the standard button block. Pure (Foundry access only through the render
 * shims), so it is unit-testable and carries no posting side effect.
 *
 * @param spec - The card body (template or content) and its buttons.
 * @returns The finished card HTML, ready to post (e.g. via `speaker.toChat`).
 */
export async function buildActionCard(
    spec: ActionCardSpec,
): Promise<HTMLString> {
    const body =
        spec.template ?
            await toHTMLWithTemplate(toFilePath(spec.template), spec.data)
        : spec.content ?
            await toHTMLWithContent(toHTMLString(spec.content), spec.data)
        :   "";
    const buttons = toRenderableButtons(spec.buttons);
    if (!buttons.length) return toHTMLString(body);
    const buttonHtml = await toHTMLWithTemplate(
        toFilePath(ACTION_BUTTONS_TEMPLATE),
        { buttons },
    );
    return toHTMLString(body + buttonHtml);
}

/** The minimal speaker surface {@link postActionCard} needs. */
interface CardSpeaker {
    toChat: (
        input: HTMLString | FilePath,
        data?: any,
        options?: any,
    ) => Promise<unknown>;
}

/**
 * Build an action card and post it through `speaker` — the one-line convenience
 * over {@link buildActionCard}. `speaker.toChat` accepts the assembled HTML
 * directly (it distinguishes raw HTML from a template path), so no extra
 * rendering happens.
 *
 * @param speaker - The speaker that announces the card.
 * @param spec - The card body and its buttons.
 * @returns The posted message (whatever `toChat` resolves to).
 */
export async function postActionCard(
    speaker: CardSpeaker,
    spec: ActionCardSpec,
): Promise<unknown> {
    return speaker.toChat(await buildActionCard(spec));
}
