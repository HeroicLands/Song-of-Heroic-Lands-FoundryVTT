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

import { describe, it, expect } from "vitest";
import { resolveAssocSkill } from "@src/document/item/logic/resolveAssocSkill";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { ITEM_KIND } from "@src/utils/constants";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

/** Embed a combat skill on `actor` under `shortcode` and return its logic. */
function addSkill(actor: any, shortcode: string): SkillLogic {
    return makeItemLogic(
        SkillLogic,
        ITEM_KIND.SKILL,
        { subType: "combattechnique", masteryLevelBase: 40 },
        { actor, shortcode, id: `skill-${shortcode}` },
    );
}

describe("resolveAssocSkill", () => {
    it("resolves the embedded skill matching the shortcode", () => {
        const actor = makeMockActor();
        const swd = addSkill(actor, "swd");
        addSkill(actor, "axe");
        expect(resolveAssocSkill(actor.logic, "swd")).toBe(swd);
    });

    it("returns undefined for a blank/undefined code", () => {
        const actor = makeMockActor();
        addSkill(actor, "swd");
        expect(resolveAssocSkill(actor.logic, "")).toBeUndefined();
        expect(resolveAssocSkill(actor.logic, undefined)).toBeUndefined();
    });

    it("returns undefined when no skill matches the code", () => {
        const actor = makeMockActor();
        addSkill(actor, "swd");
        expect(resolveAssocSkill(actor.logic, "bow")).toBeUndefined();
    });

    it("returns undefined when there is no actor logic", () => {
        expect(resolveAssocSkill(undefined, "swd")).toBeUndefined();
        expect(resolveAssocSkill(null, "swd")).toBeUndefined();
    });

    it("does not match a non-skill item that shares the shortcode", () => {
        const actor = makeMockActor();
        // A weapongear sharing the shortcode must not be returned — the lookup
        // is kind-scoped to skills.
        makeItemLogic(
            SkillLogic,
            ITEM_KIND.WEAPONGEAR,
            {},
            { actor, shortcode: "dup", id: "weapon-dup" },
        );
        expect(resolveAssocSkill(actor.logic, "dup")).toBeUndefined();
    });
});
