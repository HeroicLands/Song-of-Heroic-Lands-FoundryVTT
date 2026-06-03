/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { resolveChatCardHandlerUuid } from "@src/document/chat/chat-card-dispatch";

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
        expect(resolveChatCardHandlerUuid(dataset({ action: "fateTest" }))).toBe(
            null,
        );
    });

    it("returns null for an empty dataset", () => {
        expect(resolveChatCardHandlerUuid(dataset({}))).toBe(null);
    });
});
