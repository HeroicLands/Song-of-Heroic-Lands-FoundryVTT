/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { buildAttackCardData } from "@src/document/combatant/logic/SohlCombatantLogic";
import { buildActionCard } from "@src/document/chat/action-card";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

afterEach(() => vi.restoreAllMocks());

/** A minimal evaluated AttackResult stub for the card builder. */
function attackResult(): any {
    return {
        aimBodyPartCode: "th",
        impact: { aspectType: "edged" },
        masteryLevelModifier: { constrainedEffective: 72 },
        // The curated serializer the card embeds in each button's data-scope.
        toJSON() {
            return { __kind: "AttackResult", aimBodyPartCode: "th" };
        },
    };
}

const baseInput = {
    attackResult: attackResult(),
    title: "Broadsword Melee Attack",
    attackerName: "Aldric",
    actorId: "act1",
    aimLabel: "Thorax",
};

const DEFENSE_ACTIONS = [
    "automatedDodgeResume",
    "automatedCounterstrikeResume",
    "automatedBlockResume",
    "automatedIgnoreResume",
];

describe("buildAttackCardData → ActionCardSpec", () => {
    it("emits the body template + four defenses addressed to the defender COMBATANT", () => {
        const spec = buildAttackCardData({
            ...baseInput,
            target: { name: "Bandit", combatantUuid: "Combatant.def" },
        });
        expect(spec.template).toContain("attack-card.hbs");

        const buttons = spec.buttons as any[];
        expect(buttons.map((b) => b.action)).toEqual(DEFENSE_ACTIONS);
        for (const b of buttons) {
            // The dispatch/gating/executors all require the defender COMBATANT
            // uuid — not the actor uuid the old post-site mistakenly used.
            expect(b.handlerUuid).toBe("Combatant.def");
            // The evaluated attack rides in each button's scope (revived as
            // context.scope.attackResult by the resume executors).
            expect(b.scope).toHaveProperty("attackResult");
        }
    });

    it("emits no buttons when there is no target (informational card)", () => {
        const spec = buildAttackCardData({ ...baseInput, target: null });
        expect(spec.buttons).toBeUndefined();
    });

    it("renders (real Handlebars) four action-card buttons carrying the combatant uuid + skipDialog", async () => {
        // Render the real .hbs off disk — the button block is helper-free.
        vi.spyOn(FoundryHelpersMock, "toHTMLWithTemplate").mockImplementation(((
            tpl: any,
            data: any,
        ) => Promise.resolve(renderTemplateReal(String(tpl), data))) as any);

        const spec = buildAttackCardData({
            ...baseInput,
            target: { name: "Bandit", combatantUuid: "Combatant.def" },
        });
        const html = await buildActionCard(spec);

        expect((html.match(/class="action-card-button"/g) ?? []).length).toBe(
            4,
        );
        for (const action of DEFENSE_ACTIONS) {
            expect(html).toContain(`data-action="${action}"`);
        }
        expect(html).toContain('data-handler-uuid="Combatant.def"');
        expect(html).toContain('data-skip-dialog="true"');
        // The body rendered too (AML from the evaluated attack).
        expect(html).toContain("72");
    });
});
