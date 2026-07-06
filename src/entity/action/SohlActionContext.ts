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

import type {
    SohlActor,
    SohlActorLogic,
} from "@src/document/actor/foundry/SohlActor";
import type { SohlTokenDocument } from "@src/document/token/foundry/SohlTokenDocument";
import { isA } from "@src/utils/constants";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import type { SohlTokenDocumentLogic } from "@src/document/token/logic/SohlTokenDocumentLogic";

/**
 * The execution context passed to every SoHL action.
 *
 * Every intrinsic action — the methods discovered via
 * {@link SohlLogic.getContextOptions} and dispatched through the action
 * system — receives a `SohlActionContext`. It bundles the four things an
 * action needs to know to run and report its result:
 *
 * - **who is acting** — the {@link SohlSpeaker} (`speaker`), resolved from a
 *   token/actor/user and used as the chat-message speaker;
 * - **what is being acted upon** — the `target` token, if any (a raw
 *   {@link Token}, a {@link SohlTokenDocument}, or a {@link SohlActor} is normalized
 *   to the actor's first active token);
 * - **how to run** — `skipDialog` (bypass the action's configuration dialog)
 *   and `noChat` (suppress the chat-card output);
 * - **action-specific input/output** — `type` and `title` for labelling, plus
 *   a generic `scope` bag (`S`) that carries arbitrary per-action data
 *   (selected options, intermediate results) through the call.
 *
 * The context is a **runtime value**, not a persisted entity: it is built fresh
 * at every action dispatch and never revived from its own JSON. Only its
 * {@link scope} crosses the client boundary — carried in the chat-card `data-*`
 * attributes and rehydrated per-payload by the result machinery. {@link clone}
 * produces a modified copy so an action can fork the context (e.g. to retarget
 * or adjust scope) without mutating the original.
 *
 * @example
 * // Build a context naming who is acting, then run an action with it.
 * const ctx = new SohlActionContext({ speaker: actor.getSpeaker() });
 * await action.execute(ctx);
 *
 * @example
 * // Fork a received context to retarget it, leaving the original untouched.
 * const retargeted = context.clone({ target: someToken });
 *
 * @example
 * // Build a context naming who is acting, then run an action with it.
 * const ctx = new SohlActionContext({ speaker: actor.getSpeaker() });
 * await action.execute(ctx);
 *
 * @example
 * // Fork a received context to retarget it, leaving the original untouched.
 * const retargeted = context.clone({ target: someToken });
 *
 * @typeParam S - Shape of the {@link scope} payload for this action.
 */
export class SohlActionContext<S extends UnknownObject = UnknownObject> {
    /** Who is performing the action (resolved chat-message speaker). */
    speaker: SohlSpeaker;
    /** The token being acted upon, or `undefined` when the action has no target. */
    target?: SohlTokenDocumentLogic;
    /** When true, skip the action's configuration dialog and use defaults. */
    skipDialog: boolean;
    /** When true, suppress chat-card output for the action. */
    noChat: boolean;
    /** Action type discriminator (e.g. the action name). */
    type: string;
    /** Human-readable title used in dialogs and chat cards. */
    title: string;
    /** Arbitrary per-action payload carried through execution. */
    scope: S;

    /**
     * Build a context from {@link SohlActionContext.Data}.
     *
     * The `speaker` is required: a {@link SohlSpeaker} is used directly, while a
     * plain data object is wrapped in one. A `target` given as a {@link Token},
     * {@link TokenDocument}, or `Actor` is normalized to a {@link SohlTokenDocument}
     * (for an actor, its first active token).
     *
     * @param data - Initial context values; all but `speaker` are optional.
     * @throws Error if no `speaker` is provided, or if `target` is neither a
     *   token nor an actor.
     */
    constructor(data: Partial<SohlActionContext.Data<S>> = {}) {
        const {
            speaker,
            target = null,
            skipDialog = false,
            noChat = false,
            type = "",
            title = "",
            scope = {} as S,
        } = data;

        if (!speaker) {
            throw new Error("SohlActionContext requires a speaker.");
        }
        if (speaker instanceof SohlSpeaker) this.speaker = speaker;
        else this.speaker = new SohlSpeaker(speaker);

        this.target =
            isA(target, "SohlTokenDocumentLogic") ? target : (
                (target as SohlActorLogic<any>)?.speaker.tokenLogic
            );
        this.skipDialog = skipDialog;
        this.noChat = noChat;
        this.type = type;
        this.title = title;
        this.scope = scope;
    }

    /**
     * Fork this context into an independent copy, optionally overriding fields.
     *
     * Used to retarget or re-scope a received context without mutating the
     * original (e.g. building a sub-test's context from the current one).
     *
     * @param overrides - Fields to change on the copy; everything else is
     *   carried over from this context.
     * @returns A new context with `overrides` applied over this context's values.
     */
    clone(
        overrides: Partial<SohlActionContext.Data<S>> = {},
    ): SohlActionContext<S> {
        return new SohlActionContext<S>({
            speaker: this.speaker,
            target: this.target as unknown as SohlActorLogic<any>,
            skipDialog: this.skipDialog,
            noChat: this.noChat,
            type: this.type,
            title: this.title,
            scope: this.scope,
            ...overrides,
        });
    }

    /** The acting user's assigned character, or `null`. */
    get character(): SohlActorLogic<any> | undefined {
        return this.speaker.actorLogic;
    }

    /** The speaker's token, or `null`. */
    get token(): SohlTokenDocumentLogic | undefined {
        return this.speaker.tokenLogic;
    }
}

export namespace SohlActionContext {
    /**
     * Constructor input for {@link SohlActionContext}. Every field is optional
     * except that a `speaker` must be supplied (validated at construction).
     *
     * @typeParam S - Shape of the {@link scope} payload.
     */
    export interface Data<S extends UnknownObject = UnknownObject> {
        /** The speaker, as a {@link SohlSpeaker} or its data. */
        speaker: SohlSpeaker | Partial<SohlSpeaker.Data>;
        /** The target token/actor; normalized to a token document. */
        target: SohlActorLogic<any>;
        /** Skip the action's configuration dialog. */
        skipDialog: boolean;
        /** Suppress chat-card output. */
        noChat: boolean;
        /** Action type discriminator. */
        type: string;
        /** Human-readable title. */
        title: string;
        /** Arbitrary per-action payload. */
        scope: S;
    }
}
