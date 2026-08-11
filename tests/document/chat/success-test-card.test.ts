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
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Minimal parent stub sufficient for SuccessTestResult + MasteryLevelModifier
 * (mirrors tests/domain/result/SuccessTestResult.test.ts).
 */
const parent = {
    id: "actor0000000001",
    name: "Hero",
    label: "Hero",
    uuid: "Item.itm1",
    actor: { uuid: "Actor.act1" },
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
async function renderCard(
    effective: number,
    rollTotal: number,
    opts: {
        /**
         * Take the card's title from the modifier's own default rather than a
         * literal, so the rendered header exercises the real derivation (#1107).
         */
        useModifierTitle?: boolean;
        /** Ad-hoc deltas added to the modifier before evaluating (#1127). */
        deltas?: { name: string; abbrev: string; value: number }[];
    } = {},
) {
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
    for (const d of opts.deltas ?? []) mlMod.add(d.name, d.abbrev, d.value);
    const roll = new SimpleRoll(
        { numDice: 1, dieFaces: 100, modifier: 0, rolls: [rollTotal] } as any,
        { parent },
    );
    const result = new SuccessTestResult(
        {
            masteryLevelModifier: mlMod,
            roll,
            title: opts.useModifierTitle ? mlMod.title : "Skill Test",
        } as any,
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
        // Assert on the footer specifically: the edit pencil's `data-scope`
        // (#856) legitimately serializes the result — including the
        // `resultDescTable`, whose entries are i18n keys — so a whole-HTML key
        // check would match that reconstruction payload, not a display string.
        const footer = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
        expect(footer).not.toContain("SOHL.SuccessTestResult.");
        // Marginal success on a plain (crit-allowed) skill test.
        expect(footer).toMatch(/Success/);
    });

    it("wires the item/actor uuids so the edit and fate buttons dispatch", async () => {
        const { html } = await renderCard(50, 32);
        // Root element and the edit-pencil / fate-test buttons all need the
        // owning item's uuid (and the actor's) to dispatch their actions.
        expect(html).toContain('data-actor-uuid="Actor.act1"');
        expect(html).toContain('data-action-handler-uuid="Item.itm1"');
    });

    it("the edit pencil dispatches the GM result-edit, carrying this result as scope (#856)", async () => {
        const { html } = await renderCard(50, 32);
        // The pencil re-evaluates on the frozen roll, not a fresh test — it must
        // dispatch `resultEdit`, never `successTest`.
        expect(html).toMatch(
            /class="edit-action"[\s\S]*?data-action="resultEdit"/,
        );
        expect(html).not.toContain('data-action="successTest"');
        // It carries this result serialized under `priorTestResult` so the click
        // revives and re-evaluates *this* result (non-empty data-scope).
        expect(html).toMatch(
            /class="edit-action"[\s\S]*?data-scope="[^"]*priorTestResult/,
        );
    });
});

describe("standard-test-card renders a Skill Value Test (#848)", () => {
    /**
     * Render a Skill Value Test result. It is an ordinary success test carrying
     * `isSuccessValue`, a graded `resultDescTable`, and a `targetValueFunc` that
     * maps the success level to the Success Value (Index + Modifier). A small
     * inline table with literal labels keeps the card assertions independent of
     * localization.
     */
    async function renderSvCard(effective: number, rollTotal: number) {
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
        vi.spyOn(FoundryHelpersMock, "fvttToFoundryRoll").mockResolvedValue(
            {} as any,
        );
        const svTable = [
            {
                maxValue: 0,
                label: "No Value",
                description: "Nothing usable.",
                lastDigits: [],
                success: false,
                result: 0,
            },
            {
                maxValue: 4,
                label: "Base Value",
                description: "A sound result.",
                lastDigits: [],
                success: true,
                result: 0,
            },
            {
                maxValue: 5,
                label: "Bonus Value",
                description: "One Value Diamond.",
                lastDigits: [],
                success: true,
                result: 1,
            },
            {
                maxValue: Number.MAX_SAFE_INTEGER,
                label: "Bonus Value",
                description: "Two Value Diamonds.",
                lastDigits: [],
                success: true,
                result: 2,
            },
        ];
        const mlMod = new MasteryLevelModifier(
            { baseValue: effective } as any,
            {
                parent,
            },
        );
        const roll = new SimpleRoll(
            {
                numDice: 1,
                dieFaces: 100,
                modifier: 0,
                rolls: [rollTotal],
            } as any,
            { parent },
        );
        const result = new SuccessTestResult(
            {
                masteryLevelModifier: mlMod,
                roll,
                title: "Weaponcraft SV Test",
                isSuccessValue: true,
                resultDescTable: svTable,
                // Index 5 (ML 50) → SV = 5 + successLevel − 1.
                targetValueFunc: (sl: number) => 5 + sl - 1,
            } as any,
            { parent, chatSpeaker: speaker },
        );
        await result.evaluate();
        await result.toChat();
        return { html: captured, result };
    }

    it("shows the Success Value number", async () => {
        // 32 ≤ 50 → marginal success (level 1) → SV = 5 + 1 − 1 = 5.
        const { html, result } = await renderSvCard(50, 32);
        expect(result.targetValue).toBe(5);
        expect(html).toMatch(
            /Success Value:<\/span>\s*<span class="value">5<\/span>/,
        );
    });

    it("draws the Value Diamonds as icons, filled for earned and hollow for the rest", async () => {
        const { html, result } = await renderSvCard(50, 32);
        // SV 5 → one Value Diamond of the five on the scale.
        expect(result.valueDiamonds).toBe(1);
        expect(html.match(/fa-solid fa-diamond/g) ?? []).toHaveLength(1);
        expect(html.match(/fa-regular fa-diamond/g) ?? []).toHaveLength(4);
        // The count is still available to screen readers.
        expect(html).toContain('aria-label="1 Value Diamonds"');
    });

    it("shows the graded meaning text", async () => {
        const { html } = await renderSvCard(50, 32);
        expect(html).toContain("Bonus Value");
    });

    it("omits the Success Value block for a plain (non-SV) success test", async () => {
        const { html } = await renderCard(50, 32);
        expect(html).not.toContain("Success Value:");
        expect(html).not.toContain("Value Diamonds:");
    });
});

/**
 * Resolve `sohl.i18n` against the real `lang/en.json` for the duration of a
 * test. The unit stub echoes keys, which would make a "the card shows prose,
 * not a key" assertion vacuous.
 */
function useRealLang(): void {
    const lang = JSON.parse(
        readFileSync(resolve(process.cwd(), "lang/en.json"), "utf8"),
    ) as Record<string, string>;
    vi.spyOn(sohl.i18n, "localize").mockImplementation(
        (key: string) => lang[key] ?? key,
    );
    vi.spyOn(sohl.i18n, "format").mockImplementation(
        (key: string, data: Record<string, unknown> = {}) => {
            let out = lang[key] ?? key;
            for (const [k, v] of Object.entries(data))
                out = out.replace(`{${k}}`, String(v));
            return out;
        },
    );
}

describe("standard-test-card localizes its display strings", () => {
    it("renders the test name in the header, not a raw SOHL key (#1107)", async () => {
        useRealLang();
        const { html } = await renderCard(50, 32, { useModifierTitle: true });
        const title = /<h3 class="title">([\s\S]*?)</.exec(html)?.[1]?.trim();
        expect(title).toBe("Hero Test");
        expect(title).not.toMatch(/^SOHL\./);
    });

    it("renders each modifier-breakdown row localized (#1127)", async () => {
        useRealLang();
        const { html } = await renderCard(55, 32, {
            deltas: [
                {
                    name: "SOHL.MysticalAbility.LevelPenalty",
                    abbrev: "LvlPen",
                    value: -6,
                },
            ],
        });
        // Assert on the Adjustment block specifically: the edit pencil's
        // `data-scope` (#856) serializes the result — deltas included — and
        // that payload legitimately keeps each delta's stored i18n *key*.
        const adjustment =
            /<div class="adjustment">[\s\S]*?<\/div>\s*<\/div>/.exec(
                html,
            )?.[0] ?? "";
        expect(adjustment).toContain("Level Penalty");
        expect(adjustment).not.toContain("SOHL.MysticalAbility.LevelPenalty");
        expect(adjustment).not.toMatch(/SOHL\./);
    });
});
