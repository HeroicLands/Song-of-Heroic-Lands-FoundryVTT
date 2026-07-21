/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    gateAutomatedDefenseButtons,
    gateActionCardButtons,
    hasUsableDodgeSkill,
} from "@src/document/chat/chat-card-gating";
import * as CombatantLogic from "@src/document/combatant/logic/SohlCombatantLogic";
import { DEFENSE_DISABLING_STATUSES } from "@src/document/combatant/logic/SohlCombatantLogic";
import { ITEM_KIND, SKILL_CODE } from "@src/utils/constants";

const ACTIONS = {
    dodge: "automatedDodgeResume",
    counter: "automatedCounterstrikeResume",
    block: "automatedBlockResume",
    ignore: "automatedIgnoreResume",
} as const;

/** A stub defense button with a removable spy and the defender combatant uuid. */
function makeButton(uuid = "Combatant.defender") {
    return { dataset: { handlerUuid: uuid }, remove: vi.fn() };
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

/**
 * A stub defender combatant. `statuses` feeds the real `hasAnyStatus` gate;
 * `hasMelee` shapes a real `logicTypes` so the real `hasMeleeAttackStrikeMode`
 * gate (both now live in `chat-card-gating.ts` and are called directly, so they
 * cannot be spied) returns the intended verdict. Block capability is still
 * decided by `collectBlockableStrikeModes`, which is spied (a cross-module call).
 */
function makeDefender(
    isOwner: boolean,
    {
        statuses = [],
        hasMelee = true,
        hasDodge = true,
    }: { statuses?: string[]; hasMelee?: boolean; hasDodge?: boolean } = {},
): any {
    const meleeMode = { isMelee: true, attack: {} };
    return {
        isOwner,
        actor: {
            statuses,
            logic: {
                logicTypes: {
                    [ITEM_KIND.WEAPONGEAR]:
                        hasMelee ? [{ strikeModes: [meleeMode] }] : [],
                    [ITEM_KIND.SKILL]:
                        hasDodge ?
                            [{ data: { shortcode: SKILL_CODE.DODGE } }]
                        :   [],
                },
            },
        },
    };
}

describe("hasUsableDodgeSkill (#64)", () => {
    it("returns true when the actor has a Dodge skill", () => {
        const actorLogic: any = {
            logicTypes: {
                [ITEM_KIND.SKILL]: [{ data: { shortcode: SKILL_CODE.DODGE } }],
            },
        };
        expect(hasUsableDodgeSkill(actorLogic)).toBe(true);
    });

    it("returns false when the actor has no skills at all", () => {
        const actorLogic: any = {
            logicTypes: { [ITEM_KIND.SKILL]: [] },
        };
        expect(hasUsableDodgeSkill(actorLogic)).toBe(false);
    });

    it("returns false when the actor has other skills but not Dodge", () => {
        const actorLogic: any = {
            logicTypes: {
                [ITEM_KIND.SKILL]: [{ data: { shortcode: "swd" } }],
            },
        };
        expect(hasUsableDodgeSkill(actorLogic)).toBe(false);
    });
});

describe("gateAutomatedDefenseButtons", () => {
    let canBlock: any;

    beforeEach(() => {
        // Default: block-capable. Incapacitation and counterstrike capability
        // are driven by real defender data (see makeDefender), not spies.
        canBlock = vi
            .spyOn(CombatantLogic, "collectBlockableStrikeModes")
            .mockReturnValue([{} as any]);
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
        const buttons = allButtons();
        gateAutomatedDefenseButtons(makeElement(buttons), () =>
            makeDefender(true, { statuses: [DEFENSE_DISABLING_STATUSES[0]] }),
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
        const buttons = allButtons();
        gateAutomatedDefenseButtons(makeElement(buttons), () =>
            makeDefender(true, { hasMelee: false }),
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

    it("removes Dodge (only) when an owned, healthy defender has no Dodge skill (#64)", () => {
        const buttons = allButtons();
        gateAutomatedDefenseButtons(makeElement(buttons), () =>
            makeDefender(true, { hasDodge: false }),
        );
        expect(buttons[ACTIONS.dodge].remove).toHaveBeenCalled();
        expect(buttons[ACTIONS.block].remove).not.toHaveBeenCalled();
        expect(buttons[ACTIONS.counter].remove).not.toHaveBeenCalled();
        expect(buttons[ACTIONS.ignore].remove).not.toHaveBeenCalled();
    });

    it("keeps Dodge for an owned, healthy defender that has a Dodge skill (#64)", () => {
        const buttons = allButtons();
        gateAutomatedDefenseButtons(makeElement(buttons), () =>
            makeDefender(true, { hasDodge: true }),
        );
        expect(buttons[ACTIONS.dodge].remove).not.toHaveBeenCalled();
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

describe("gateActionCardButtons", () => {
    /** A stub action-card button carrying its handler uuid + a remove spy. */
    function acButton(handlerUuid: string) {
        return {
            dataset: { handlerUuid },
            remove: vi.fn(),
        };
    }
    /** A stub root: `button.action-card-button` → buttons; `.card-buttons` → none. */
    function acElement(buttons: any[]): HTMLElement {
        return {
            querySelectorAll: (sel: string) =>
                sel.includes("action-card-button") ? buttons : [],
        } as unknown as HTMLElement;
    }

    it("keeps an open (@self) button for everyone", () => {
        const btn = acButton("@self");
        gateActionCardButtons(acElement([btn]), () => ({ isOwner: false }));
        expect(btn.remove).not.toHaveBeenCalled();
    });

    it("hides an owner-targeted button from a non-owner", () => {
        const btn = acButton("Item.wound");
        gateActionCardButtons(acElement([btn]), () => ({ isOwner: false }));
        expect(btn.remove).toHaveBeenCalledOnce();
    });

    it("keeps an owner-targeted button for its owner", () => {
        const btn = acButton("Item.wound");
        gateActionCardButtons(acElement([btn]), () => ({ isOwner: true }));
        expect(btn.remove).not.toHaveBeenCalled();
    });

    it("is a no-op when there are no action-card buttons", () => {
        expect(() =>
            gateActionCardButtons(acElement([]), () => ({ isOwner: false })),
        ).not.toThrow();
    });
});
