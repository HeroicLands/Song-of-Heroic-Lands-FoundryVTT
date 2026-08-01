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
import { buildCombatCardData } from "@src/document/combatant/logic/SohlCombatantLogic";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";
import { TEST_TYPE } from "@src/utils/constants";

const CARD = "systems/sohl/templates/chat/attack-result-card.hbs";

/**
 * The attack-result card's builder omitted several template variables, so the
 * card rendered an empty adjustment table and "None" victory stars on every
 * exchange (#844). These tests pin the builder's newly-supplied data and the
 * card's rendered HTML.
 */

/** A stub side of the exchange (attacker or defender). */
function side(opts: {
    name: string;
    weapon?: string;
    deltas?: { name: string; numValue: number }[];
    successLevel?: number;
    testType?: string;
}): any {
    return {
        label: `${opts.name}'s test`,
        combatant: { name: opts.name, actorLogic: { id: "act1" } },
        mode: opts.weapon ? { parent: { name: opts.weapon } } : undefined,
        masteryLevelModifier: {
            constrainedEffective: 60,
            deltas: opts.deltas ?? [],
        },
        roll: { total: 42 },
        successLevel: opts.successLevel ?? 1,
        normSuccessLevel: opts.successLevel ?? 1,
        isSuccess: (opts.successLevel ?? 1) >= 1,
        isCritical: false,
        testType: opts.testType ?? TEST_TYPE.BLOCK.id,
        mishaps: new Set<string>(),
        impact: { label: "5 + d6" },
        token: null,
    };
}

/** A stub CombatResult sufficient for buildCombatCardData (no injury buttons). */
function combatResult(overrides: Record<string, any> = {}): any {
    const attackResult = side({
        name: "Aldric",
        weapon: "Broadsword",
        deltas: [{ name: "Situational", numValue: 2 }],
        successLevel: 2, // Critical Success
    });
    const defendResult = side({
        name: "Bandit",
        weapon: "Shield",
        deltas: [{ name: "Off-hand", numValue: -5 }],
        successLevel: -1, // Critical Failure → margin 3
        testType: TEST_TYPE.BLOCK.id,
    });
    return {
        attackResult,
        defendResult,
        margin: 3, // CS(2) − CF(−1) = 3 victory degrees
        tacticalAdvantages: { side: "attacker", count: 2 },
        attackerLandsBlow: true,
        defenderLandsBlow: false,
        weaponBreakCheck: "defender",
        attackerImpact: null,
        cxImpact: null,
        ...overrides,
    };
}

describe("buildCombatCardData supplies the attack-result card variables (#844)", () => {
    it("provides the attacker and defender adjustment rows", () => {
        const { atkCardData } = buildCombatCardData(combatResult());
        expect(atkCardData.attackMods).toEqual([
            { name: "Situational", value: 2 },
        ]);
        expect(atkCardData.defendMods).toEqual([
            { name: "Off-hand", value: -5 },
        ]);
    });

    it("provides the defender's weapon name", () => {
        const { atkCardData } = buildCombatCardData(combatResult());
        expect(atkCardData.defendWeapon).toBe("Shield");
    });

    it("renders the victory degrees as that many stars", () => {
        const { atkCardData } = buildCombatCardData(combatResult());
        // Margin 3 → three filled stars.
        expect(atkCardData.vsText).toBe("★★★");
    });

    it("leaves the stars empty on a tie (margin 0) so the card shows None", () => {
        const { atkCardData } = buildCombatCardData(
            combatResult({ margin: 0 }),
        );
        expect(atkCardData.vsText).toBe("");
    });

    it("gives an ignored (uncontested) defense empty defender rows", () => {
        const cr = combatResult();
        cr.defendResult.testType = TEST_TYPE.IGNORE.id;
        const { atkCardData } = buildCombatCardData(cr);
        expect(atkCardData.defendMods).toEqual([]);
    });
});

describe("attack-result-card renders the supplied variables (#844)", () => {
    async function render(overrides: Record<string, any> = {}) {
        const { atkCardData } = buildCombatCardData(combatResult(overrides));
        return renderTemplateReal(CARD, {
            ...atkCardData,
            // Injury blocks (which use the toJSON helper) stay closed.
            hasAttackInjury: false,
            hasDefendInjury: false,
        });
    }

    it("renders the attacker adjustment table with a signed value", async () => {
        const html = await render();
        expect(html).toMatch(
            /adj-name">Situational<\/span>[\s\S]*?adj-value"\s*>\+2</,
        );
    });

    it("shows the Success Stars (renamed from Victory Stars) as star glyphs", async () => {
        const html = await render();
        expect(html).toContain("Success Stars:");
        expect(html).not.toContain("Victory Stars:");
        expect(html).toContain("★★★");
    });

    it("names the defender's broken weapon", async () => {
        const html = await render();
        // weaponBreakCheck "defender" → defWeaponBroke; the name must appear.
        expect(html).toContain("Bandit's Shield broke!");
    });

    it("no longer references the removed unbacked variables", async () => {
        const html = await render();
        expect(html).not.toContain("Outnumbered");
        expect(html).not.toContain("may increase by");
    });
});
