/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { brandLogic } from "@tests/mocks/brandLogic";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import {
    PRONE_MELEE_PENALTY,
    applyProneMeleePenalty,
} from "@src/entity/strikemode/prone";

const MOCK_LOGIC = brandLogic({
    actor: null,
    data: { kind: "weapongear" },
    name: "Test Weapon",
    label: "Test Weapon",
    speaker: {},
}) as any;

const MELEE_DATA: MeleeStrikeMode.Data = {
    type: "melee",
    name: "Cut",
    minParts: 1,
    assocSkillCode: "swd",
    lengthBase: 5,
    attack: { spread: 10, modifier: 10 },
    impactBase: { numDice: 1, die: 10, modifier: 5, aspect: "edged" },
    traits: {},
    defense: {
        block: { modifier: 8 },
        counterstrike: { modifier: 6 },
    },
};

describe("prone melee penalty (#562)", () => {
    it("is −20", () => {
        expect(PRONE_MELEE_PENALTY).toBe(-20);
    });

    it("subtracts 20 from attack and both defenses", () => {
        const sm = new MeleeStrikeMode(MELEE_DATA, MOCK_LOGIC, "sm1");
        const atk0 = sm.attack.effective;
        const blk0 = sm.defense.block.effective;
        const cx0 = sm.defense.counterstrike.effective;

        applyProneMeleePenalty(sm);

        expect(sm.attack.effective).toBe(atk0 - 20);
        expect(sm.defense.block.effective).toBe(blk0 - 20);
        expect(sm.defense.counterstrike.effective).toBe(cx0 - 20);
    });
});
