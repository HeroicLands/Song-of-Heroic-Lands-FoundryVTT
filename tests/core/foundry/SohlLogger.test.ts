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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SohlLogger } from "@src/core/foundry/SohlLogger";

/**
 * Regression guard for #267: `uiWarn`/`uiInfo`/`uiError` must surface exactly one
 * Foundry UI notification and must NOT recurse (the notify branch used to call
 * back into `uiWarn`/`log`, blowing the stack), and a formatting failure must not
 * crash `log()`.
 */
describe("SohlLogger UI notifications (#267)", () => {
    const notifications = (globalThis as any).ui.notifications;
    const i18n = (globalThis as any).sohl.i18n;
    const logger = SohlLogger.getInstance();

    beforeEach(() => vi.restoreAllMocks());

    it("uiWarn notifies once and does not recurse", () => {
        const warn = vi.spyOn(notifications, "warn");
        expect(() => logger.uiWarn("SOHL.Test.Warn")).not.toThrow();
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn).toHaveBeenCalledWith("SOHL.Test.Warn");
    });

    it("uiInfo notifies once and does not recurse", () => {
        const info = vi.spyOn(notifications, "info");
        expect(() => logger.uiInfo("SOHL.Test.Info")).not.toThrow();
        expect(info).toHaveBeenCalledTimes(1);
    });

    it("uiError notifies once and does not recurse", () => {
        const error = vi.spyOn(notifications, "error");
        expect(() => logger.uiError("SOHL.Test.Error")).not.toThrow();
        expect(error).toHaveBeenCalledTimes(1);
    });

    it("a formatting failure does not crash log()", () => {
        vi.spyOn(i18n, "format").mockImplementation(() => {
            throw new Error("format boom");
        });
        expect(() => logger.uiWarn("SOHL.Test.Warn")).not.toThrow();
    });
});
