/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { BRAND } from "@src/utils/constants";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

/**
 * Minimal parent stub sufficient for SuccessTestResult + MasteryLevelModifier
 * (mirrors tests/domain/result/SuccessTestResult.test.ts).
 */
const parent = {
    id: "actor0000000001",
    name: "Hero",
    label: "Hero",
    data: { kind: "skill" },
    item: { logic: { availableFate: [] } },
    [BRAND.SohlLogic]: true,
} as any;

/**
 * Drive the real `SuccessTestResult.toChat` and return the HTML the card
 * template renders. `toChat` builds the chat-data object and hands it to
 * `this._speaker.toChat(template, chatData)`; the real `SohlSpeaker` renders it
 * with `toHTMLWithTemplate(template, chatData)`. This speaker stub is owned (so
 * `evaluate()` may roll) and renders the very same way through the Node harness,
 * so the assertions are against the actual chat-data `toChat` produces. The die
 * is supplied directly (`rolls: [rollTotal]`) so the outcome is deterministic.
 */
async function renderCard(effective: number, rollTotal: number) {
    let captured = "";
    const speaker = {
        isOwner: true,
        name: "GM",
        toJSON: () => ({ name: "GM" }),
        toChat: (tpl: unknown, data: unknown) => {
            captured = renderTemplateReal(String(tpl), data as any);
            return Promise.resolve(undefined);
        },
    } as any;
    // toChat converts the SimpleRoll to a Foundry Roll at the boundary.
    vi.spyOn(FoundryHelpersMock, "fvttToFoundryRoll").mockResolvedValue(
        {} as any,
    );

    const mlMod = new MasteryLevelModifier({ baseValue: effective } as any, {
        parent,
    });
    const roll = new SimpleRoll(
        { numDice: 1, dieFaces: 100, modifier: 0, rolls: [rollTotal] } as any,
        { parent },
    );
    const result = new SuccessTestResult(
        { masteryLevelModifier: mlMod, roll, title: "Skill Test" } as any,
        { parent, chatSpeaker: speaker },
    );
    await result.evaluate();
    await result.toChat();
    return { html: captured, result };
}

afterEach(() => vi.restoreAllMocks());

describe("standard-test-card renders the evaluated success test", () => {
    it("shows the effective mastery level as the Target", async () => {
        const { html, result } = await renderCard(50, 32);
        const target = result.masteryLevelModifier.constrainedEffective;
        expect(html).toMatch(
            new RegExp(
                `Target:</span>\\s*<span class="value">${target}</span>`,
            ),
        );
    });

    it("shows the d100 roll total in the Roll row", async () => {
        const { html } = await renderCard(50, 32);
        expect(html).toMatch(/Roll:[\s\S]*?>32<\/span>/);
    });

    it("styles a passing roll as a success, not a failure", async () => {
        const { html, result } = await renderCard(50, 32);
        expect(result.isSuccess).toBe(true);
        // The Roll value span carries success styling on a pass.
        expect(html).toMatch(/Roll:[\s\S]*?class="value success-text"/);
    });

    it("shows a localized outcome in the footer, not a raw i18n key", async () => {
        const { html } = await renderCard(50, 32);
        expect(html).not.toContain("SOHL.SuccessTestResult.");
        // Marginal success on a plain (crit-allowed) skill test.
        expect(html).toMatch(/card-footer[\s\S]*?Success/);
    });
});
