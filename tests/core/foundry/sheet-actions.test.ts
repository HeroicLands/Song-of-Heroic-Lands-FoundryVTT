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

import { describe, it, expect, vi, afterEach } from "vitest";
import { buildActionRows, runAction } from "@src/core/foundry/sheet-actions";
import { ACTION_SUBTYPE, SOHL_CONTEXT_MENU_SORT_GROUP } from "@src/utils/constants";
import { makeMockSpeaker } from "@tests/mocks/logicHarness";

/**
 * A stand-in for a {@link SohlAction} as the sheet layer sees it: the row
 * builder reads only `data`, `isAvailable`, and `unavailableReason`.
 */
function stubAction(overrides: Record<string, unknown> = {}): any {
    const { available = true, unavailableReason = "SOHL.Action.unavailable", ...data } = overrides;
    return {
        data: {
            shortcode: "act",
            subType: ACTION_SUBTYPE.INTRINSIC,
            title: "Act",
            iconFAClass: "fa-solid fa-bolt",
            group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            ...data,
        },
        isAvailable: available,
        unavailableReason,
        execute: vi.fn(async () => undefined),
    };
}

/**
 * A document whose logic carries the given actions, keyed by shortcode. The
 * owning actor supplies the speaker `runAction` builds its context from.
 */
function stubDoc(actions: any[], type = "miscgear"): any {
    return {
        type,
        actor: { getSpeaker: () => makeMockSpeaker() },
        logic: {
            actions: new Map(actions.map((a) => [a.data.shortcode, a])),
        },
    };
}

/** A clicked control inside a `data-action-name` row. */
function stubControl(shortcode: string): any {
    return {
        closest: (selector: string) =>
            selector === "[data-action-name]" ? { getAttribute: () => shortcode } : null,
    };
}

describe("buildActionRows (#1135, #1136)", () => {
    it("splits custom (script) from intrinsic actions", () => {
        const rows = buildActionRows(
            stubDoc([
                stubAction({ shortcode: "i1" }),
                stubAction({
                    shortcode: "s1",
                    subType: ACTION_SUBTYPE.SCRIPT,
                }),
            ]),
        );
        expect(rows.intrinsicActions.map((r) => r.data.shortcode)).toEqual(["i1"]);
        expect(rows.customActions.map((r) => r.data.shortcode)).toEqual(["s1"]);
    });

    it("omits internal hidden-group actions", () => {
        const rows = buildActionRows(
            stubDoc([
                stubAction({
                    shortcode: "lifecycle",
                    group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
                }),
            ]),
        );
        expect(rows.intrinsicActions).toEqual([]);
        expect(rows.customActions).toEqual([]);
    });

    it("marks a triggerable action available", () => {
        const [row] = buildActionRows(stubDoc([stubAction({ available: true })])).intrinsicActions;
        expect(row.available).toBe(true);
    });

    it("marks a gated action unavailable and carries its reason key", () => {
        const [row] = buildActionRows(
            stubDoc([
                stubAction({
                    available: false,
                    unavailableReason: "SOHL.Gear.actionRequiresCarried",
                }),
            ]),
        ).intrinsicActions;
        expect(row.available).toBe(false);
        // An i18n key, localized at render — never localized prose.
        expect(row.unavailableReason).toBe("SOHL.Gear.actionRequiresCarried");
    });

    it("yields empty lists for a document with no logic", () => {
        expect(buildActionRows({ type: "miscgear" } as any)).toEqual({
            customActions: [],
            intrinsicActions: [],
        });
    });
});

describe("runAction reports a refused action (#1135)", () => {
    afterEach(() => vi.restoreAllMocks());

    it("warns with the action's reason instead of failing silently", async () => {
        const warn = vi.spyOn(sohl.log, "uiWarn" as any).mockImplementation(() => {});
        const action = stubAction({
            available: false,
            unavailableReason: "SOHL.Gear.actionRequiresCarried",
        });
        await runAction(stubDoc([action]), stubControl("act"), {
            shiftKey: false,
        } as any);
        expect(action.execute).not.toHaveBeenCalled();
        // The i18n key is handed to the logger, which localizes it.
        expect(warn).toHaveBeenCalledWith("SOHL.Gear.actionRequiresCarried");
    });

    it("runs an available action without warning", async () => {
        const warn = vi.spyOn(sohl.log, "uiWarn" as any).mockImplementation(() => {});
        const action = stubAction({ available: true });
        await runAction(stubDoc([action]), stubControl("act"), {
            shiftKey: false,
        } as any);
        expect(action.execute).toHaveBeenCalledTimes(1);
        expect(warn).not.toHaveBeenCalled();
    });
});
