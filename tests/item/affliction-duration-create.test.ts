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

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ duration: vi.fn(), allowed: undefined as boolean | undefined }));
vi.mock("@src/document/item/foundry/SohlItemDataModel", () => ({
    SohlItemDataModel: class {
        async _preCreate() {
            return m.allowed;
        }
    },
}));
vi.mock("@src/document/item/logic/AfflictionLogic", () => ({
    AfflictionLogic: class {},
    rollDurationFormula: m.duration,
}));
let Model: any;
beforeAll(async () => {
    ({ AfflictionDataModel: Model } =
        await import("@src/document/item/foundry/AfflictionDataModel"));
});
beforeEach(() => {
    vi.clearAllMocks();
    m.allowed = undefined;
    vi.stubGlobal("game", { time: { worldTime: 0 } });
});
afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
function model() {
    return Object.assign(Object.create(Model.prototype), {
        onsetDurationFormula: "(2d6)*86400",
        logic: {},
        updateSource: vi.fn(),
    });
}
describe("Affliction creation awaits duration evaluation", () => {
    it("does not persist creation defaults until evaluation resolves and keeps world time zero", async () => {
        const item = model();
        let finish!: (n: number) => void;
        m.duration.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finish = resolve;
                }),
        );
        const creating = item._preCreate({}, {}, {});
        await vi.waitFor(() => expect(m.duration).toHaveBeenCalledOnce());
        expect(item.updateSource).not.toHaveBeenCalled();
        finish(604800);
        await creating;
        expect(item.updateSource).toHaveBeenCalledWith({
            contractDate: 0,
            onsetDurationBase: 604800,
        });
    });
    it("rejects invalid evaluation before updateSource", async () => {
        const item = model();
        m.duration.mockRejectedValueOnce(new Error("invalid duration"));
        await expect(item._preCreate({}, {}, {})).rejects.toThrow("invalid duration");
        expect(item.updateSource).not.toHaveBeenCalled();
    });
    it("honors a superclass creation veto without rolling", async () => {
        const item = model();
        m.allowed = false;
        await expect(item._preCreate({}, {}, {})).resolves.toBe(false);
        expect(m.duration).not.toHaveBeenCalled();
        expect(item.updateSource).not.toHaveBeenCalled();
    });
});
