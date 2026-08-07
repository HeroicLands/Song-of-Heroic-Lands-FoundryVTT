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

/**
 * Skill Development Roll chat card (#1103). The SDR used to render through
 * `standard-test-card.hbs` under keys that template does not read, so the two
 * numbers that make the card worth reading — the Target and the Roll — came out
 * blank, and the card carried a GM result-edit pencil with an empty scope even
 * though an SDR is not a success test and has nothing to re-evaluate.
 *
 * These tests assert the **real rendered HTML**: first the template on its own,
 * then the card the `improveWithSDR` executor actually builds, driven through
 * the Node render harness.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { improveWithSDR } from "@src/document/item/logic/improve-sdr";
import {
    makeItemLogic,
    makeMockActor,
    makeAttributeStub,
} from "@tests/mocks/logicHarness";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";

const CHAT = "systems/sohl/templates/chat";

describe("sdr-card renders the development roll (#1103)", () => {
    it("shows the roll total and the mastery level it was tested against", () => {
        const html = renderTemplateReal(`${CHAT}/sdr-card.hbs`, {
            actorUuid: "Actor.a",
            title: "Sword Development Roll",
            target: 40,
            rollTotal: 87,
            isSuccess: true,
            resultText: "Sword Improved",
            resultDesc: "Sword increased by 1 to 41.",
            description: "Success",
        });
        expect(html).toContain("Sword Development Roll");
        expect(html).toContain(">40<");
        expect(html).toContain(">87<");
        expect(html).toContain("Sword increased by 1 to 41.");
    });

    it("marks a failed roll with the failure style and keeps both numbers", () => {
        const html = renderTemplateReal(`${CHAT}/sdr-card.hbs`, {
            title: "Sword Development Roll",
            target: 40,
            rollTotal: 12,
            isSuccess: false,
            resultText: "Sword Not Improved",
            resultDesc: "Sword did not increase.",
            description: "Failure",
        });
        expect(html).toContain(">40<");
        expect(html).toContain(">12<");
        expect(html).toContain("failure-text");
        expect(html).not.toContain("success-text");
    });

    it("renders no GM result-edit pencil — an SDR has nothing to re-evaluate", () => {
        const html = renderTemplateReal(`${CHAT}/sdr-card.hbs`, {
            title: "Sword Development Roll",
            target: 40,
            rollTotal: 87,
            isSuccess: true,
            description: "Success",
        });
        expect(html).not.toContain('data-action="resultEdit"');
        expect(html).not.toContain("edit-action");
    });
});

describe("improveWithSDR posts a card whose numbers are populated (#1103)", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    /** A Skill logic with a live mastery level and a computable Skill Base. */
    function makeSkill(overrides: Record<string, unknown> = {}) {
        const actor = makeMockActor();
        actor.items.set("str1", makeAttributeStub("str", 12));
        actor.items.set("int1", makeAttributeStub("int", 14));
        const logic = makeItemLogic(
            SkillLogic,
            "skill",
            {
                name: "Sword",
                skillBaseFormula: "sb(attr.str, attr.int)",
                masteryLevelBase: 40,
                improveFlag: true,
                ...overrides,
            },
            { actor },
        );
        logic.initialize();
        return logic;
    }

    /** Render the card the executor posts, through the real templates. */
    async function renderPostedCard(rollTotal: number): Promise<string> {
        vi.spyOn(SimpleRoll, "fromFormula").mockReturnValue({
            roll: vi.fn(),
            total: rollTotal,
            result: String(rollTotal),
        } as any);
        vi.spyOn(FoundryHelpersMock, "toHTMLWithTemplate").mockImplementation(((
            tpl: any,
            d: any,
        ) => Promise.resolve(renderTemplateReal(String(tpl), d))) as any);

        const logic = makeSkill();
        let rendered = "";
        const speaker = {
            toChat: vi.fn(async (tpl: any, data: any) => {
                rendered = await (FoundryHelpersMock as any).toHTMLWithTemplate(
                    tpl,
                    data,
                );
                return undefined;
            }),
        };
        await improveWithSDR(logic as any, { speaker } as any);
        return rendered;
    }

    // The global i18n stub echoes the key back (substituting only `{…}`
    // placeholders present in the key itself), so the result rows assert on
    // the key the executor chose, not on English prose.
    it("renders the SDR roll total and the target mastery level on a success", async () => {
        const html = await renderPostedCard(95);
        // Target is the base mastery level the roll had to beat.
        expect(html).toContain(">40<");
        expect(html).toContain(">95<");
        expect(html).toContain("SOHL.MasteryLevel.improveSDR.increase.title");
        expect(html).toContain("success-text");
    });

    it("renders both numbers on a failure too", async () => {
        const html = await renderPostedCard(10);
        expect(html).toContain(">40<");
        expect(html).toContain(">10<");
        expect(html).toContain("SOHL.MasteryLevel.improveSDR.noIncrease.title");
        expect(html).toContain("failure-text");
    });

    it("renders no result-edit pencil with an empty scope", async () => {
        const html = await renderPostedCard(95);
        expect(html).not.toContain('data-action="resultEdit"');
        expect(html).not.toContain('data-scope=""');
        expect(html).not.toContain('data-action-handler-uuid=""');
    });
});
