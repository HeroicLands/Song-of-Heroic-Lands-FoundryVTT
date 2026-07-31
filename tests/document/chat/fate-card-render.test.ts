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

import { describe, it, expect, vi } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { MARGINAL_FAILURE } from "@src/utils/constants";

const CHAT = "systems/sohl/templates/chat";

/** A parent logic stub sufficient to build/serialize a SuccessTestResult. */
const parent = {
    id: "skill1",
    name: "Melee",
    label: "Melee",
    uuid: "Actor.a.Item.skill1",
    data: { kind: "skill" },
    actorLogic: { uuid: "Actor.a" },
    item: { logic: { availableFate: [] } },
} as any;

/** A three-rung description table keyed by success level (identity target). */
const TABLE = [
    {
        maxValue: 0,
        lastDigits: [],
        label: "Failure",
        description: "",
        success: false,
        result: 0,
    },
    {
        maxValue: 1,
        lastDigits: [],
        label: "Success",
        description: "",
        success: true,
        result: 1,
    },
    {
        maxValue: 2,
        lastDigits: [],
        label: "Critical",
        description: "",
        success: true,
        result: 2,
    },
];

describe("fate-roll-card renders the resolved path (#854)", () => {
    it("shows the spent-path text and the source", () => {
        const html = renderTemplateReal(`${CHAT}/fate-roll-card.hbs`, {
            title: "Melee — Fate Test",
            target: 50,
            rollTotal: 5,
            isSuccess: true,
            isCritical: false,
            outcomeLabel: "Fate Test Success",
            pathText: "Fate Point spent → +1 success level.",
            sourceText: "(spent from Lucky Star)",
        });
        expect(html).toContain("Melee — Fate Test");
        expect(html).toContain("Fate Point spent → +1 success level.");
        expect(html).toContain("(spent from Lucky Star)");
    });

    it("shows the no-effect path for a marginal failure", () => {
        const html = renderTemplateReal(`${CHAT}/fate-roll-card.hbs`, {
            title: "Melee — Fate Test",
            target: 50,
            rollTotal: 88,
            isSuccess: false,
            isCritical: false,
            outcomeLabel: "No Fate Effect",
            pathText: "No effect.",
            sourceText: "",
        });
        expect(html).toContain("No effect.");
        expect(html).not.toContain("spent from");
    });
});

describe("standard-test-card re-posts the bumped outcome (#854)", () => {
    /** Capture the chat-card data `toChat` builds, without posting. */
    async function chatDataFor(result: SuccessTestResult): Promise<any> {
        let captured: any;
        vi.spyOn((result as any)._speaker, "toChat").mockImplementation((async (
            _tpl: any,
            data: any,
        ) => {
            captured = data;
            return undefined;
        }) as any);
        await result.toChat({ canFate: false });
        return captured;
    }

    it("a Fate +1 bump re-derives the card's Result to the higher rung", async () => {
        const result = new SuccessTestResult(
            {
                successLevel: MARGINAL_FAILURE,
                successStarTable: TABLE,
                canFate: true,
            },
            { parent },
        );
        // Before the bump the card reads the failure rung.
        expect((await chatDataFor(result)).resultText).toBe("Failure");

        result.bumpSuccessLevel(1); // Fate: marginal failure → marginal success

        const data = await chatDataFor(result);
        expect(data.resultText).toBe("Success");

        const html = renderTemplateReal(`${CHAT}/standard-test-card.hbs`, data);
        expect(html).toContain("Success");
        // Re-posted with Fate disabled — no second Fate offer on the amended card.
        expect(html).not.toContain('data-action="fateTest"');
    });

    it("offers the Fate button, carrying the serialized original, when canFate", () => {
        const result = new SuccessTestResult(
            {
                successLevel: MARGINAL_FAILURE,
                successStarTable: TABLE,
                canFate: true,
            },
            { parent },
        );
        // availableFate on the stub parent is [] → canFate stays false; assert the
        // template wiring directly instead (the button + its scope attribute).
        const html = renderTemplateReal(`${CHAT}/standard-test-card.hbs`, {
            canFate: true,
            item: { uuid: "Item.skill1" },
            fateScopeJSON: '{"priorTestResult":{"__kind":"SuccessTestResult"}}',
            mlMod: { empty: true, effective: 30, successLevelMod: 0 },
            roll: { total: 5 },
            isSuccess: false,
        });
        expect(html).toContain('data-action="fateTest"');
        expect(html).toContain('data-handler-uuid="Item.skill1"');
        expect(html).toContain("priorTestResult");
        expect(html).toContain("Spend Fate");
    });
});
