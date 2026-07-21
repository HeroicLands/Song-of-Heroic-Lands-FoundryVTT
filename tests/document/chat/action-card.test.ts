/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
    buildActionCard,
    postActionCard,
} from "@src/document/chat/action-card";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";

afterEach(() => vi.restoreAllMocks());

describe("buildActionCard", () => {
    it("renders the body from inline content and appends nothing when there are no buttons", async () => {
        const html = await buildActionCard({ content: "<p>Body</p>" });
        expect(html).toContain("<p>Body</p>");
        expect(html).not.toContain("card-buttons");
        expect(html).not.toContain("action-card-button");
    });

    it("appends a button block carrying the action, handler, scope, and skipDialog", async () => {
        // The button template renders the passed button rows; capture the data.
        const spy = vi
            .spyOn(FoundryHelpersMock, "toHTMLWithTemplate")
            .mockResolvedValue('<div class="card-buttons"></div>' as any);
        await buildActionCard({
            content: "<p>Result</p>",
            buttons: {
                action: "treatInjury",
                handlerUuid: "Item.wound",
                scope: { healingRate: 4 },
                label: "Accept",
            },
        });
        // The button template was rendered with a single renderable button whose
        // scope is pre-serialized and skipDialog defaults to true.
        const [, data] = spy.mock.calls[0];
        expect(data!.buttons).toEqual([
            expect.objectContaining({
                action: "treatInjury",
                handlerUuid: "Item.wound",
                scopeJSON: JSON.stringify({ healingRate: 4 }),
                label: "Accept",
                skipDialog: true,
            }),
        ]);
    });

    it("accepts an array of buttons (e.g. an attack card's four defenses)", async () => {
        const spy = vi
            .spyOn(FoundryHelpersMock, "toHTMLWithTemplate")
            .mockResolvedValue("" as any);
        await buildActionCard({
            content: "<p>Attack</p>",
            buttons: [
                { action: "a", handlerUuid: "C.d", label: "Dodge" },
                { action: "b", handlerUuid: "C.d", label: "Block" },
            ],
        });
        expect(spy.mock.calls[0][1]!.buttons).toHaveLength(2);
    });
});

describe("postActionCard", () => {
    it("posts the assembled HTML through the speaker's toChat", async () => {
        const toChat = vi.fn().mockResolvedValue({ id: "msg" });
        const res = await postActionCard({ toChat } as any, {
            content: "<p>Hi</p>",
        });
        expect(toChat).toHaveBeenCalledOnce();
        expect(String(toChat.mock.calls[0][0])).toContain("<p>Hi</p>");
        expect(res).toEqual({ id: "msg" });
    });
});
