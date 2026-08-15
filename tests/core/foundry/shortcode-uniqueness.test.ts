/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    enforceShortcodeOnCreate,
    enforceShortcodeOnUpdate,
} from "@src/core/foundry/shortcode-uniqueness";

/**
 * An **actor-embedded** item stand-in.
 *
 * Embedded deliberately: that scope resolves its taken set from
 * `doc.actor.items`, so the whole fixture is local and the test never reaches
 * for a Foundry world global — which the logic-layer boundary guard forbids, and
 * which `tests/setup.ts` alone is allowed to install. The character-set rule is
 * scope independent, so nothing about the subject is lost.
 *
 * The empty sibling list also means nothing here can collide — so a rejection in
 * these tests can only have come from the charset rule.
 */
function makeItem(shortcode: string, over: Record<string, unknown> = {}) {
    return {
        documentName: "Item",
        type: "trauma",
        id: "item1",
        name: "Self-protective",
        actor: { name: "Aldric", items: [] },
        system: { shortcode },
        updateSource: vi.fn(),
        ...over,
    } as any;
}

let warn: ReturnType<typeof vi.fn>;

beforeEach(() => {
    warn = vi.fn();
    (globalThis as any).ui = { notifications: { warn } };
});

describe("enforceShortcodeOnCreate — character set (#1397)", () => {
    it("vetoes a create whose authored shortcode is not alphanumeric", async () => {
        const doc = makeItem("self-pro");
        await expect(enforceShortcodeOnCreate(doc, {}, {})).resolves.toBe(
            false,
        );
        expect(doc.updateSource).not.toHaveBeenCalled();
    });

    it("names the charset rule rather than a duplicate that does not exist", async () => {
        // Asserted through `format`'s arguments rather than the rendered text:
        // the test harness's i18n stub returns the key, so the message itself
        // would only prove what the stub does.
        const format = vi.spyOn((globalThis as any).sohl.i18n, "format");
        await enforceShortcodeOnCreate(makeItem("B&CFl"), {}, {});
        expect(warn).toHaveBeenCalledTimes(1);
        expect(format).toHaveBeenCalledWith("SOHL.Shortcode.notAlphanumeric", {
            shortcode: "B&CFl",
        });
        format.mockRestore();
    });

    it("vetoes even with shortcodeDedupe — an illegal key cannot be suffixed into a legal one", async () => {
        await expect(
            enforceShortcodeOnCreate(
                makeItem("self-pro"),
                {},
                {
                    shortcodeDedupe: true,
                },
            ),
        ).resolves.toBe(false);
    });

    it("allows a create whose authored shortcode is alphanumeric", async () => {
        const doc = makeItem("selfpro");
        await expect(
            enforceShortcodeOnCreate(doc, {}, {}),
        ).resolves.toBeUndefined();
        expect(warn).not.toHaveBeenCalled();
    });

    it("still derives a legal code from the name when none is authored", async () => {
        // `slugifyShortcode` strips the hyphen, so the derived key is legal even
        // though the name is not.
        const doc = makeItem("");
        await expect(
            enforceShortcodeOnCreate(doc, {}, {}),
        ).resolves.toBeUndefined();
        expect(doc.updateSource).toHaveBeenCalledWith({
            "system.shortcode": "selfprotective",
        });
    });
});

describe("enforceShortcodeOnUpdate — character set (#1397)", () => {
    const change = (shortcode: unknown) => ({ system: { shortcode } });

    it("vetoes an update that introduces a non-alphanumeric shortcode", async () => {
        await expect(
            enforceShortcodeOnUpdate(
                makeItem("selfpro"),
                change("self-pro"),
                {},
            ),
        ).resolves.toBe(false);
        expect(warn).toHaveBeenCalledTimes(1);
    });

    it("lets an update through that merely restates an existing malformed code", async () => {
        // A migration rewrites the whole `system` object, so its payload
        // restates the shortcode it has not come to fix yet. Vetoing that would
        // make a document carrying a legacy key unwritable — and unrepairable.
        const doc = makeItem("self-pro");
        await expect(
            enforceShortcodeOnUpdate(doc, change("self-pro"), {}),
        ).resolves.toBeUndefined();
        expect(warn).not.toHaveBeenCalled();
    });

    it("lets the repairing update itself through", async () => {
        await expect(
            enforceShortcodeOnUpdate(
                makeItem("self-pro"),
                change("selfpro"),
                {},
            ),
        ).resolves.toBeUndefined();
    });

    it("is a no-op when the update does not touch the shortcode", async () => {
        await expect(
            enforceShortcodeOnUpdate(makeItem("self-pro"), { system: {} }, {}),
        ).resolves.toBeUndefined();
        expect(warn).not.toHaveBeenCalled();
    });

    it("allows an ordinary alphanumeric rename", async () => {
        await expect(
            enforceShortcodeOnUpdate(makeItem("selfpro"), change("selfp2"), {}),
        ).resolves.toBeUndefined();
        expect(warn).not.toHaveBeenCalled();
    });
});
