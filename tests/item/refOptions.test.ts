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
import {
    buildRefOptions,
    actorItemRefOptions,
} from "@src/document/item/logic/refOptions";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { ITEM_KIND } from "@src/utils/constants";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

/** Embed a combat skill named `name` on `actor` under `shortcode`. */
function addSkill(actor: any, shortcode: string, name: string): SkillLogic {
    return makeItemLogic(
        SkillLogic,
        ITEM_KIND.SKILL,
        { subType: "combattechnique", masteryLevelBase: 40 },
        { actor, shortcode, name, id: `skill-${shortcode}` },
    );
}

describe("buildRefOptions", () => {
    it("maps candidates to {value,label} sorted by label", () => {
        const opts = buildRefOptions([
            { shortcode: "swd", name: "Sword" },
            { shortcode: "axe", name: "Axe" },
            { shortcode: "bow", name: "Bow" },
        ]);
        expect(opts).toEqual([
            { value: "axe", label: "Axe" },
            { value: "bow", label: "Bow" },
            { value: "swd", label: "Sword" },
        ]);
    });

    it("skips candidates with a blank shortcode", () => {
        const opts = buildRefOptions([
            { shortcode: "", name: "Nameless" },
            { shortcode: "swd", name: "Sword" },
        ]);
        expect(opts).toEqual([{ value: "swd", label: "Sword" }]);
    });

    it("falls back to the shortcode when the name is blank", () => {
        const opts = buildRefOptions([{ shortcode: "swd", name: "" }]);
        expect(opts).toEqual([{ value: "swd", label: "swd" }]);
    });

    it("excludes the given shortcode (self-reference)", () => {
        const opts = buildRefOptions(
            [
                { shortcode: "swd", name: "Sword" },
                { shortcode: "axe", name: "Axe" },
            ],
            undefined,
            "swd",
        );
        expect(opts.map((o) => o.value)).toEqual(["axe"]);
    });

    it("appends a flagged option for a dangling selected value", () => {
        const opts = buildRefOptions(
            [{ shortcode: "swd", name: "Sword" }],
            "ghost",
        );
        expect(opts).toEqual([
            { value: "swd", label: "Sword" },
            { value: "ghost", label: "ghost (unresolved)", unresolved: true },
        ]);
    });

    it("does not append when the selected value resolves", () => {
        const opts = buildRefOptions(
            [{ shortcode: "swd", name: "Sword" }],
            "swd",
        );
        expect(opts).toEqual([{ value: "swd", label: "Sword" }]);
        expect(opts.some((o) => o.unresolved)).toBe(false);
    });

    it("returns an empty list for no candidates and no selection", () => {
        expect(buildRefOptions([])).toEqual([]);
    });

    it("still flags a dangling selection when there are no candidates", () => {
        expect(buildRefOptions([], "ghost")).toEqual([
            { value: "ghost", label: "ghost (unresolved)", unresolved: true },
        ]);
    });
});

describe("actorItemRefOptions", () => {
    it("builds sorted options from the actor's items of the given kind", () => {
        const actor = makeMockActor();
        addSkill(actor, "swd", "Sword");
        addSkill(actor, "axe", "Axe");
        const opts = actorItemRefOptions(actor.logic, ITEM_KIND.SKILL);
        expect(opts).toEqual([
            { value: "axe", label: "Axe" },
            { value: "swd", label: "Sword" },
        ]);
    });

    it("excludes the self shortcode", () => {
        const actor = makeMockActor();
        addSkill(actor, "swd", "Sword");
        addSkill(actor, "axe", "Axe");
        const opts = actorItemRefOptions(
            actor.logic,
            ITEM_KIND.SKILL,
            undefined,
            "swd",
        );
        expect(opts.map((o) => o.value)).toEqual(["axe"]);
    });

    it("flags a dangling stored shortcode with no matching item", () => {
        const actor = makeMockActor();
        addSkill(actor, "swd", "Sword");
        const opts = actorItemRefOptions(actor.logic, ITEM_KIND.SKILL, "bow");
        expect(opts).toContainEqual({
            value: "bow",
            label: "bow (unresolved)",
            unresolved: true,
        });
    });

    it("returns an empty list when there is no actor logic", () => {
        expect(actorItemRefOptions(undefined, ITEM_KIND.SKILL)).toEqual([]);
        expect(actorItemRefOptions(null, ITEM_KIND.SKILL)).toEqual([]);
    });

    describe("filter predicate (#1405)", () => {
        it("narrows the options to the candidates the predicate accepts", () => {
            const actor = makeMockActor();
            addSkill(actor, "swd", "Sword");
            addSkill(actor, "axe", "Axe");
            const opts = actorItemRefOptions(
                actor.logic,
                ITEM_KIND.SKILL,
                undefined,
                undefined,
                (l) => l.data.shortcode === "axe",
            );
            expect(opts.map((o) => o.value)).toEqual(["axe"]);
        });

        it("sees each candidate's full data, so a subtype can be filtered on", () => {
            const actor = makeMockActor();
            addSkill(actor, "swd", "Sword");
            const seen: unknown[] = [];
            actorItemRefOptions(
                actor.logic,
                ITEM_KIND.SKILL,
                undefined,
                undefined,
                (l) => {
                    seen.push((l.data as any).subType);
                    return true;
                },
            );
            expect(seen).toEqual(["combattechnique"]);
        });

        it("still flags a dangling stored shortcode the predicate filtered out", () => {
            // The stored value is never silently blanked, filter or no filter.
            const actor = makeMockActor();
            addSkill(actor, "swd", "Sword");
            const opts = actorItemRefOptions(
                actor.logic,
                ITEM_KIND.SKILL,
                "swd",
                undefined,
                () => false,
            );
            expect(opts).toEqual([
                { value: "swd", label: "swd (unresolved)", unresolved: true },
            ]);
        });

        it("is unchanged when no predicate is given", () => {
            const actor = makeMockActor();
            addSkill(actor, "swd", "Sword");
            addSkill(actor, "axe", "Axe");
            expect(actorItemRefOptions(actor.logic, ITEM_KIND.SKILL)).toEqual(
                actorItemRefOptions(
                    actor.logic,
                    ITEM_KIND.SKILL,
                    undefined,
                    undefined,
                    undefined,
                ),
            );
        });
    });
});
