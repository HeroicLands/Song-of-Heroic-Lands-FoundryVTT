/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi } from "vitest";
import { buildCombatantActionMenuEntries } from "@src/document/combat/combat-tracker-hooks";

const ATTACK_TITLE = "SOHL.Being.ACTION.automatedCombatStart";
const MOVE_TITLE = "SOHL.Combatant.ACTION.moveToGroup";

/**
 * A stub combatant exposing the `getContextOptions` / `isOwner` surface the
 * tracker menu builder reads. Each context entry has a compiled `condition`
 * predicate and a `callback`, matching `SohlLogic.getContextOptions` output.
 */
function makeStubCombatant(opts: {
    isOwner?: boolean;
    attackVisible?: boolean;
    moveVisible?: boolean;
    attackCb?: any;
    moveCb?: any;
}): any {
    return {
        isOwner: opts.isOwner ?? true,
        getContextOptions: () => [
            {
                id: ATTACK_TITLE,
                name: ATTACK_TITLE,
                condition: () => opts.attackVisible ?? true,
                callback: opts.attackCb ?? vi.fn(),
            },
            {
                id: MOVE_TITLE,
                name: MOVE_TITLE,
                condition: () => opts.moveVisible ?? true,
                callback: opts.moveCb ?? vi.fn(),
            },
        ],
    };
}

const li = {} as HTMLElement;

describe("buildCombatantActionMenuEntries", () => {
    it("yields one entry per non-HIDDEN combatant action (Automated Attack + Move to Group), not the resumes", () => {
        const entries = buildCombatantActionMenuEntries(() =>
            makeStubCombatant({}),
        );
        const titles = entries.map((e) => e.__sohlActionTitle).sort();
        expect(titles).toEqual([ATTACK_TITLE, MOVE_TITLE].sort());
        // No HIDDEN defense resumes leak in.
        expect(
            entries.some((e) =>
                /automatedBlockResume|automatedDodgeResume/.test(
                    e.__sohlActionTitle,
                ),
            ),
        ).toBe(false);
    });

    it("carries the action label and icon", () => {
        const entries = buildCombatantActionMenuEntries(() =>
            makeStubCombatant({}),
        );
        const attack = entries.find((e) => e.__sohlActionTitle === ATTACK_TITLE);
        expect(attack.label).toBe(ATTACK_TITLE);
        expect(attack.icon).toBe("sohl-crossed-swords");
        const move = entries.find((e) => e.__sohlActionTitle === MOVE_TITLE);
        expect(move.icon).toBe("sohl-person-group");
    });

    it("visible is false for a non-owner", () => {
        const entries = buildCombatantActionMenuEntries(() =>
            makeStubCombatant({ isOwner: false }),
        );
        for (const e of entries) expect(e.visible(li)).toBe(false);
    });

    it("visible reflects the action's own condition for an owner", () => {
        const entries = buildCombatantActionMenuEntries(() =>
            makeStubCombatant({
                isOwner: true,
                attackVisible: true,
                moveVisible: false,
            }),
        );
        const attack = entries.find((e) => e.__sohlActionTitle === ATTACK_TITLE);
        const move = entries.find((e) => e.__sohlActionTitle === MOVE_TITLE);
        expect(attack.visible(li)).toBe(true);
        expect(move.visible(li)).toBe(false);
    });

    it("onClick dispatches through the combatant's matching getContextOptions callback", () => {
        const attackCb = vi.fn();
        const entries = buildCombatantActionMenuEntries(() =>
            makeStubCombatant({ attackCb }),
        );
        const attack = entries.find((e) => e.__sohlActionTitle === ATTACK_TITLE);
        attack.onClick({} as Event, li);
        expect(attackCb).toHaveBeenCalledWith(li);
    });

    it("visible is false when no combatant resolves", () => {
        const entries = buildCombatantActionMenuEntries(() => null);
        for (const e of entries) expect(e.visible(li)).toBe(false);
    });
});
