/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi } from "vitest";
import {
    resolveChatCardHandlerUuid,
    resolveAuthorizedChatCardHandler,
    dispatchChatCardAction,
} from "@src/document/chat/chat-card-dispatch";

// The runtime value is a DOMStringMap, but for a pure unit test a plain
// record with the same camelCased keys behaves identically.
function dataset(values: Record<string, string>): DOMStringMap {
    return values as unknown as DOMStringMap;
}

describe("resolveChatCardHandlerUuid", () => {
    it("returns docUuid when present (back-compat)", () => {
        expect(
            resolveChatCardHandlerUuid(dataset({ docUuid: "Actor.aaa" })),
        ).toBe("Actor.aaa");
    });

    it("falls back to handlerUuid when docUuid is absent", () => {
        expect(
            resolveChatCardHandlerUuid(dataset({ handlerUuid: "Item.bbb" })),
        ).toBe("Item.bbb");
    });

    it("falls back to handlerActorUuid", () => {
        expect(
            resolveChatCardHandlerUuid(
                dataset({ handlerActorUuid: "Actor.ccc" }),
            ),
        ).toBe("Actor.ccc");
    });

    it("falls back to actionHandlerUuid", () => {
        expect(
            resolveChatCardHandlerUuid(
                dataset({ actionHandlerUuid: "Actor.ddd" }),
            ),
        ).toBe("Actor.ddd");
    });

    it("honors precedence when several are present", () => {
        expect(
            resolveChatCardHandlerUuid(
                dataset({
                    docUuid: "Actor.win",
                    handlerUuid: "Item.lose",
                    handlerActorUuid: "Actor.lose",
                    actionHandlerUuid: "Actor.lose",
                }),
            ),
        ).toBe("Actor.win");
    });

    it("prefers handlerUuid over the *-handler variants", () => {
        expect(
            resolveChatCardHandlerUuid(
                dataset({
                    handlerUuid: "Item.win",
                    handlerActorUuid: "Actor.lose",
                    actionHandlerUuid: "Actor.lose",
                }),
            ),
        ).toBe("Item.win");
    });

    it("prefers handlerActorUuid over actionHandlerUuid", () => {
        expect(
            resolveChatCardHandlerUuid(
                dataset({
                    handlerActorUuid: "Actor.win",
                    actionHandlerUuid: "Actor.lose",
                }),
            ),
        ).toBe("Actor.win");
    });

    it("returns null when no recognized uuid attribute is present", () => {
        expect(
            resolveChatCardHandlerUuid(dataset({ action: "fateTest" })),
        ).toBe(null);
    });

    it("returns null for an empty dataset", () => {
        expect(resolveChatCardHandlerUuid(dataset({}))).toBe(null);
    });
});

describe("resolveAuthorizedChatCardHandler (#167)", () => {
    it("returns the handler document when the current client owns it", () => {
        const owned = { isOwner: true, name: "Defender" };
        const resolve = vi.fn(() => owned);
        expect(
            resolveAuthorizedChatCardHandler(
                dataset({ handlerActorUuid: "Actor.def" }),
                resolve,
            ),
        ).toBe(owned);
        // Authorization keys on the resolved handler document's uuid.
        expect(resolve).toHaveBeenCalledWith("Actor.def");
    });

    it("treats a GM as owner (Foundry `isOwner` is true for a GM)", () => {
        const gmOwned = { isOwner: true };
        expect(
            resolveAuthorizedChatCardHandler(
                dataset({ handlerActorUuid: "Actor.any" }),
                () => gmOwned,
            ),
        ).toBe(gmOwned);
    });

    it("refuses (returns null) when the client does not own the handler", () => {
        expect(
            resolveAuthorizedChatCardHandler(
                dataset({ handlerActorUuid: "Actor.other" }),
                () => ({ isOwner: false }),
            ),
        ).toBe(null);
    });

    it("returns null when no handler uuid is present", () => {
        const resolve = vi.fn(() => ({ isOwner: true }));
        expect(
            resolveAuthorizedChatCardHandler(dataset({ action: "x" }), resolve),
        ).toBe(null);
        expect(resolve).not.toHaveBeenCalled();
    });

    it("returns null when the uuid does not resolve to a document", () => {
        expect(
            resolveAuthorizedChatCardHandler(
                dataset({ handlerActorUuid: "Actor.missing" }),
                () => null,
            ),
        ).toBe(null);
    });
});

describe("dispatchChatCardAction (#66)", () => {
    function btn(
        action?: string,
        extra: Record<string, string> = {},
    ): HTMLElement {
        return {
            dataset: {
                ...(action ? { action } : {}),
                ...extra,
            } as DOMStringMap,
            textContent: action ?? null,
        } as unknown as HTMLElement;
    }

    it("does nothing when dataset.action is absent", async () => {
        const execute = vi.fn();
        const logic: any = {
            speaker: {},
            actions: new Map([["someAction", { data: {}, execute }]]),
        };
        await dispatchChatCardAction(logic, btn());
        expect(execute).not.toHaveBeenCalled();
    });

    it("executes the action from logic.actions when found by name", async () => {
        const execute = vi.fn();
        const logic: any = {
            speaker: {},
            actions: new Map([["successTest", { data: {}, execute }]]),
        };
        await dispatchChatCardAction(logic, btn("successTest"));
        expect(execute).toHaveBeenCalledOnce();
    });

    it("falls back to calling a method on logic when not in actions", async () => {
        const successTest = vi.fn();
        const logic: any = {
            speaker: {},
            actions: new Map(),
            successTest,
        };
        await dispatchChatCardAction(logic, btn("successTest"));
        expect(successTest).toHaveBeenCalledOnce();
    });

    it("warns when action not in actions map and not a method", async () => {
        const warn = vi.fn();
        const logic: any = {
            speaker: {},
            actions: new Map(),
            log: { warn },
        };
        (globalThis as any).sohl = { log: { warn } };
        await dispatchChatCardAction(logic, btn("nonexistent"));
        expect(warn).toHaveBeenCalled();
        delete (globalThis as any).sohl;
    });
});
