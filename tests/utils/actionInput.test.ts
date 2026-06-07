/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi } from "vitest";
import { resolveActionInput } from "@src/utils/actionInput";

describe("resolveActionInput", () => {
    it("reads inputs from scope (not the dialog) when skipDialog is set", async () => {
        const dialog = vi.fn(async () => ({ aim: "from-dialog" }));
        const result = await resolveActionInput(
            { skipDialog: true, scope: { aim: "head", situationalModifier: 5 } },
            {
                fromScope: (s) => ({
                    aim: String(s.aim),
                    situationalModifier: Number(s.situationalModifier) || 0,
                }),
                dialog,
            },
        );
        expect(result).toEqual({ aim: "head", situationalModifier: 5 });
        expect(dialog).not.toHaveBeenCalled();
    });

    it("applies defaults for scope fields omitted under skipDialog", async () => {
        const result = await resolveActionInput(
            { skipDialog: true, scope: {} },
            {
                fromScope: (s) => ({
                    situationalModifier: Number(s.situationalModifier) || 0,
                }),
                dialog: async () => null,
            },
        );
        expect(result).toEqual({ situationalModifier: 0 });
    });

    it("shows the dialog and returns its data when skipDialog is false", async () => {
        const fromScope = vi.fn(() => ({ aim: "from-scope" }));
        const result = await resolveActionInput(
            { skipDialog: false, scope: { aim: "head" } },
            { fromScope, dialog: async () => ({ aim: "chosen" }) },
        );
        expect(result).toEqual({ aim: "chosen" });
        expect(fromScope).not.toHaveBeenCalled();
    });

    it("propagates a null (dismissed) dialog", async () => {
        const result = await resolveActionInput(
            { skipDialog: false, scope: {} },
            { fromScope: () => ({ aim: "x" }), dialog: async () => null },
        );
        expect(result).toBeNull();
    });
});
