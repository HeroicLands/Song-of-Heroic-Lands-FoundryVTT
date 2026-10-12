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

import { afterEach, describe, expect, it, vi } from "vitest";
import * as FoundryHelpers from "@src/core/FoundryHelpers";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import { ITEM_KIND } from "@src/utils/constants";

afterEach(() => vi.restoreAllMocks());
describe("live strike-mode pointers", () => {
    it.each([ITEM_KIND.WEAPONGEAR, ITEM_KIND.SKILL])(
        "resolves a %s mode by its shortcode",
        (kind) => {
            const mode = { shortcode: "cut" };
            vi.spyOn(FoundryHelpers, "fvttLogicFromUuidSync").mockReturnValue({
                kind,
                strikeModes: [mode],
            } as unknown as SohlLogic);
            expect(
                StrikeModeBase.fromPointerData({
                    itemUuid: "Actor.source.Item.weapon",
                    smId: "cut",
                }),
            ).toBe(mode);
            expect(
                StrikeModeBase.fromPointerData({
                    itemUuid: "Actor.source.Item.weapon",
                    smId: "missing",
                }),
            ).toBeUndefined();
        },
    );
});
