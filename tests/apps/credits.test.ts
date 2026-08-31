/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The Credits & Attributions entry points (issue #1517).
 *
 * The pure pieces — the menu-registration payload and the package-flag read —
 * are asserted here. Opening the journal sheet and the live `registerMenu` call
 * are Foundry-coupled and covered by `cypress/e2e/credits-menu.cy.js`.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    CREDITS_ACTION,
    CREDITS_MENU_KEY,
    buildCreditsMenuData,
    openCreditsJournal,
} from "@src/apps/foundry/credits";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";

/** Identity localizer — returns the key so assertions can match on keys. */
const idLocalize = (key: string) => key;

describe("credits — menu registration payload", () => {
    it("uses a stable menu key so a world's setting registration is durable", () => {
        expect(CREDITS_MENU_KEY).toBe("creditsMenu");
    });

    it("defaults to localized SOHL.Credits.* strings and an icon", () => {
        const data = buildCreditsMenuData({}, idLocalize);
        expect(data.name).toBe("SOHL.Credits.menuName");
        expect(data.label).toBe("SOHL.Credits.menuLabel");
        expect(data.hint).toBe("SOHL.Credits.menuHint");
        expect(data.icon).toBeTruthy();
    });

    it("is visible to players, not GM-only", () => {
        // Credits exist to be read. `restricted: true` would hide the button
        // from every non-GM in the world, which defeats the point.
        expect(buildCreditsMenuData({}, idLocalize).restricted).toBe(false);
    });

    it("lets a module override every display field", () => {
        const data = buildCreditsMenuData(
            {
                name: "MYMOD.name",
                label: "MYMOD.label",
                hint: "MYMOD.hint",
                icon: "fa-solid fa-heart",
            },
            idLocalize,
        );
        expect(data).toMatchObject({
            name: "MYMOD.name",
            label: "MYMOD.label",
            hint: "MYMOD.hint",
            icon: "fa-solid fa-heart",
        });
    });
});

describe("credits — opening the journal", () => {
    beforeEach(() => {
        (globalThis as any).sohl = {
            ...(globalThis as any).sohl,
            log: { uiWarn: vi.fn(), warn: vi.fn() },
        };
    });
    afterEach(() => vi.restoreAllMocks());

    it("renders the sheet of the resolved entry", async () => {
        const doc = { sheet: { render: vi.fn() } };
        const resolve = vi
            .spyOn(FoundryHelpersMock, "fvttResolveUuidAsync")
            .mockResolvedValue(doc as any);
        const render = vi.spyOn(FoundryHelpersMock, "fvttRenderSheet").mockResolvedValue(undefined);

        await openCreditsJournal("Compendium.sohl.journals.JournalEntry.abc");

        expect(resolve).toHaveBeenCalledWith("Compendium.sohl.journals.JournalEntry.abc");
        expect(render).toHaveBeenCalledWith(doc);
    });

    it("warns rather than throwing when the UUID does not resolve", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttResolveUuidAsync").mockResolvedValue(undefined);
        const render = vi.spyOn(FoundryHelpersMock, "fvttRenderSheet");

        // A click handler must never reject — a missing pack would otherwise
        // surface as an unhandled rejection in the console.
        await expect(openCreditsJournal("Compendium.x.y.z.nope")).resolves.toBeUndefined();
        expect(render).not.toHaveBeenCalled();
        expect((globalThis as any).sohl.log.uiWarn).toHaveBeenCalled();
    });

    it("warns without resolving when handed no UUID at all", async () => {
        const resolve = vi.spyOn(FoundryHelpersMock, "fvttResolveUuidAsync");
        await openCreditsJournal("");
        expect(resolve).not.toHaveBeenCalled();
        expect((globalThis as any).sohl.log.uiWarn).toHaveBeenCalled();
    });
});

describe("credits — the sidebar action name", () => {
    it("is namespaced so it cannot collide with a core sidebar action", () => {
        expect(CREDITS_ACTION).toBe("sohlOpenCredits");
        expect(CREDITS_ACTION).toMatch(/^sohl/);
    });
});
