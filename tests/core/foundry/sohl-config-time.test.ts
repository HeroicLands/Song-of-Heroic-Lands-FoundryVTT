/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, beforeAll } from "vitest";

/**
 * `sohl-config.ts` is Foundry-layer code: importing it pulls in the sheet and
 * DataModel tree, which reads `foundry.applications.api` at module scope. The
 * shared setup stubs the logic layer's needs only, so the pieces that tree
 * touches on the way to `SOHLCONFIG` are supplied here and nowhere else.
 */
function stubFoundryApplicationApi(): void {
    const foundryGlobal = (globalThis as any).foundry;
    class ApplicationV2 {
        static DEFAULT_OPTIONS = {};
        static PARTS = {};
        static TABS = {};
        constructor(..._args: any[]) {}
    }
    foundryGlobal.applications.api = {
        ApplicationV2,
        DocumentSheetV2: ApplicationV2,
        DialogV2: ApplicationV2,
        HandlebarsApplicationMixin: (base: any) => base,
    };
    foundryGlobal.applications.sheets ??= {};
    foundryGlobal.applications.sheets.ActorSheetV2 ??= ApplicationV2;
    foundryGlobal.applications.sheets.ItemSheetV2 ??= ApplicationV2;
    foundryGlobal.applications.sheets.SceneConfig ??= ApplicationV2;

    // Foundry exposes its document classes as bare globals, which the system's
    // document subclasses extend at module scope.
    class BaseDocument {
        static defineSchema() {
            return {};
        }
        constructor(..._args: any[]) {}
    }
    for (const name of [
        "Actor",
        "Item",
        "ActiveEffect",
        "Combat",
        "Combatant",
        "Scene",
        "ChatMessage",
        "Macro",
        "JournalEntry",
        "Token",
        "TokenDocument",
    ]) {
        (globalThis as any)[name] ??= BaseDocument;
    }
}

let SOHLCONFIG: any;

beforeAll(async () => {
    stubFoundryApplicationApi();
    ({ SOHLCONFIG } = await import("@src/core/foundry/sohl-config"));
});

/**
 * `SOHLCONFIG.time` contributes formatters to Foundry's world time and nothing
 * else: the calendar itself belongs to whoever owns it — core, or a module that
 * installs one. Every key asserted is read off the live object, so a key added
 * back fails here rather than shipping.
 */
describe("SOHLCONFIG.time", () => {
    it("declares formatters and nothing else", () => {
        expect(Object.keys(SOHLCONFIG.time).sort()).toEqual(["formatters"]);
    });

    it("installs no world calendar of its own", () => {
        for (const key of Object.keys(SOHLCONFIG.time)) {
            expect(key.toLowerCase()).not.toContain("calendar");
        }
    });

    it("registers the three SoHL world-time formatters", () => {
        const formatters = SOHLCONFIG.time.formatters as Record<string, unknown>;
        expect(Object.keys(formatters).sort()).toEqual([
            "sohl.default",
            "sohl.relative",
            "sohl.timestamp",
        ]);
        for (const fn of Object.values(formatters)) {
            expect(typeof fn).toBe("function");
        }
    });
});
