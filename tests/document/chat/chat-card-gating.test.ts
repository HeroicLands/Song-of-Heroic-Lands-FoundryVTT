/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { gateAutomatedDefenseButtons } from "@src/document/chat/chat-card-gating";
import * as CombatActions from "@src/document/actor/logic/combat-actions";

const ACTIONS = {
    dodge: "automatedDodgeResume",
    counter: "automatedCounterstrikeResume",
    block: "automatedBlockResume",
    ignore: "automatedIgnoreResume",
} as const;

/** A stub defense button with a removable spy and the defender uuid. */
function makeButton(uuid = "Combatant.defender") {
    return { dataset: { handlerActorUuid: uuid }, remove: vi.fn() };
}

/** A stub `.card-buttons` container; `empty` controls whether it still holds a button. */
function makeContainer(empty: boolean) {
    return { querySelector: () => (empty ? null : {}), remove: vi.fn() };
}

/**
 * A stub chat-card root: `querySelector` resolves
 * `button[data-action="…"]` against `buttons`; `querySelectorAll` returns the
 * given `.card-buttons` containers.
 */
function makeElement(
    buttons: Record<string, any>,
    containers: any[] = [],
): HTMLElement {
    return {
        querySelector: (sel: string) => {
            const m = sel.match(/data-action="([^"]+)"/);
            return m ? (buttons[m[1]] ?? null) : null;
        },
        querySelectorAll: () => containers,
    } as unknown as HTMLElement;
}

/** All four defense buttons present. */
function allButtons() {
    return {
        [ACTIONS.dodge]: makeButton(),
        [ACTIONS.counter]: makeButton(),
        [ACTIONS.block]: makeButton(),
        [ACTIONS.ignore]: makeButton(),
    } as Record<string, ReturnType<typeof makeButton>>;
}

function makeDefender(isOwner: boolean): any {
    return { isOwner, actor: { statuses: [], logic: {} } };
}

describe("gateAutomatedDefenseButtons", () => {
    let incapacitated: any;
    let canBlock: any;
    let canCounter: any;

    beforeEach(() => {
        // Default: healthy, block- and counter-capable. Tests override per case.
        incapacitated = vi
            .spyOn(CombatActions, "hasAnyStatus")
            .mockReturnValue(false);
        canBlock = vi
            .spyOn(CombatActions, "collectBlockableStrikeModes")
            .mockReturnValue([{} as any]);
        canCounter = vi
            .spyOn(CombatActions, "hasMeleeAttackStrikeMode")
            .mockReturnValue(true);
    });
    afterEach(() => vi.restoreAllMocks());

    it("is a no-op on a card with no defense buttons (does not resolve a defender)", () => {
        const resolveDefender = vi.fn();
        gateAutomatedDefenseButtons(makeElement({}), resolveDefender);
        expect(resolveDefender).not.toHaveBeenCalled();
    });

    it("removes every defense button when the viewer is not the defender's owner", () => {
        const buttons = allButtons();
        const resolveDefender = vi.fn(() => makeDefender(false));
        gateAutomatedDefenseButtons(makeElement(buttons), resolveDefender);
        for (const key of Object.values(ACTIONS)) {
            expect(buttons[key].remove).toHaveBeenCalledTimes(1);
        }
    });

    it("leaves only Ignore when an owned defender is incapacitated", () => {
        incapacitated.mockReturnValue(true);
        const buttons = allButtons();
        gateAutomatedDefenseButtons(makeElement(buttons), () =>
            makeDefender(true),
        );
        expect(buttons[ACTIONS.dodge].remove).toHaveBeenCalled();
        expect(buttons[ACTIONS.counter].remove).toHaveBeenCalled();
        expect(buttons[ACTIONS.block].remove).toHaveBeenCalled();
        expect(buttons[ACTIONS.ignore].remove).not.toHaveBeenCalled();
    });

    it("removes Block (only) when an owned, healthy defender has no block-capable mode", () => {
        canBlock.mockReturnValue([]);
        const buttons = allButtons();
        gateAutomatedDefenseButtons(makeElement(buttons), () =>
            makeDefender(true),
        );
        expect(buttons[ACTIONS.block].remove).toHaveBeenCalled();
        expect(buttons[ACTIONS.counter].remove).not.toHaveBeenCalled();
        expect(buttons[ACTIONS.dodge].remove).not.toHaveBeenCalled();
        expect(buttons[ACTIONS.ignore].remove).not.toHaveBeenCalled();
    });

    it("removes Counterstrike (only) when an owned, healthy defender has no melee-attack mode", () => {
        canCounter.mockReturnValue(false);
        const buttons = allButtons();
        gateAutomatedDefenseButtons(makeElement(buttons), () =>
            makeDefender(true),
        );
        expect(buttons[ACTIONS.counter].remove).toHaveBeenCalled();
        expect(buttons[ACTIONS.block].remove).not.toHaveBeenCalled();
        expect(buttons[ACTIONS.dodge].remove).not.toHaveBeenCalled();
    });

    it("keeps all four for an owned, healthy, fully-capable defender", () => {
        const buttons = allButtons();
        gateAutomatedDefenseButtons(makeElement(buttons), () =>
            makeDefender(true),
        );
        for (const key of Object.values(ACTIONS)) {
            expect(buttons[key].remove).not.toHaveBeenCalled();
        }
    });

    it("removes a .card-buttons container left empty after gating", () => {
        const buttons = allButtons();
        const emptied = makeContainer(true);
        const kept = makeContainer(false);
        gateAutomatedDefenseButtons(makeElement(buttons, [emptied, kept]), () =>
            makeDefender(false),
        );
        expect(emptied.remove).toHaveBeenCalledTimes(1);
        expect(kept.remove).not.toHaveBeenCalled();
    });
});
