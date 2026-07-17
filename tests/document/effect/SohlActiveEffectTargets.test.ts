/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { SohlActiveEffect } from "@src/document/effect/foundry/SohlActiveEffect";
import { ACTIVE_EFFECT_SCOPE, ITEM_KIND } from "@src/utils/constants";

/**
 * Build a minimal SohlActiveEffect-like object that satisfies the `targets`
 * getter. We bypass the constructor (which needs Foundry's Document
 * machinery) and create a bare object proxy that calls the prototype
 * methods directly.
 */
function makeEffect(opts: {
    scope: string;
    test?: string;
    parent: any;
    actor?: any;
}): SohlActiveEffect {
    const eff = Object.create(SohlActiveEffect.prototype) as any;
    eff.parent = opts.parent;
    eff.system = { scope: opts.scope, test: opts.test ?? "" };
    // The `item` and `actor` getters on SohlActiveEffect derive from `parent`.
    if (opts.actor !== undefined) {
        Object.defineProperty(eff, "actor", {
            value: opts.actor,
            configurable: true,
        });
    }
    return eff as SohlActiveEffect;
}

function makeItem(
    type: string,
    id: string,
    system: any = {},
    logic: any = {},
): any {
    // Predicates bind `itemLogic` (the item's logic), so tests put the
    // predicate-visible fields on `logic`.
    return { type, id, system, logic, parent: null };
}

function makeActorWithItems(items: any[]): any {
    const itemsMap = new Map(items.map((i) => [i.id, i]));
    const actor = {
        items: {
            values: () => itemsMap.values(),
            get: (id: string) => itemsMap.get(id),
        },
        // `system.test` predicates compile to a SafeExpression parented on the
        // actor's logic; a truthy stand-in satisfies the SohlEntity contract.
        logic: { id: "actor-logic" },
    };
    items.forEach((i) => (i.parent = actor));
    return actor;
}

describe("SohlActiveEffect.targets", () => {
    it('scope "this" on an item-owned effect → [the item]', () => {
        const item = makeItem(ITEM_KIND.SKILL, "s1");
        const actor = makeActorWithItems([item]);
        // SohlActiveEffect.item is true when parent.type is in ItemKinds.
        const eff = makeEffect({
            scope: ACTIVE_EFFECT_SCOPE.THIS,
            parent: item,
            actor,
        });
        expect(eff.targets).toEqual([item]);
    });

    it('scope "this" on an actor-owned effect → [the actor]', () => {
        const actor = makeActorWithItems([]);
        // Parent is the actor; SohlActiveEffect.item returns null when parent
        // is not an item type. So targets returns [this.actor].
        const eff = makeEffect({
            scope: ACTIVE_EFFECT_SCOPE.THIS,
            parent: actor,
            actor,
        });
        expect(eff.targets).toEqual([actor]);
    });

    it('scope "actor" from an item-owned effect → [the actor]', () => {
        const item = makeItem(ITEM_KIND.WEAPONGEAR, "w1");
        const actor = makeActorWithItems([item]);
        const eff = makeEffect({
            scope: ACTIVE_EFFECT_SCOPE.ACTOR,
            parent: item,
            actor,
        });
        expect(eff.targets).toEqual([actor]);
    });

    it("scope <itemKind> with empty predicate → all items of that kind", () => {
        const sk1 = makeItem(ITEM_KIND.SKILL, "s1");
        const sk2 = makeItem(ITEM_KIND.SKILL, "s2");
        const wg = makeItem(ITEM_KIND.WEAPONGEAR, "w1");
        const actor = makeActorWithItems([sk1, sk2, wg]);
        const eff = makeEffect({
            scope: ITEM_KIND.SKILL,
            parent: actor,
            actor,
        });
        expect(eff.targets).toEqual([sk1, sk2]);
    });

    it("scope <itemKind> with predicate (bound itemLogic) → only matching items", () => {
        const sk1 = makeItem(ITEM_KIND.SKILL, "s1", {}, { code: "pyrn" });
        const sk2 = makeItem(ITEM_KIND.SKILL, "s2", {}, { code: "other" });
        const actor = makeActorWithItems([sk1, sk2]);
        const eff = makeEffect({
            scope: ITEM_KIND.SKILL,
            test: 'itemLogic.code === "pyrn"',
            parent: actor,
            actor,
        });
        expect(eff.targets).toEqual([sk1]);
    });

    it("malformed predicate yields empty matches (compile-time failure)", () => {
        const sk1 = makeItem(ITEM_KIND.SKILL, "s1");
        const actor = makeActorWithItems([sk1]);
        const eff = makeEffect({
            scope: ITEM_KIND.SKILL,
            test: "itemLogic.code === ", // syntactically incomplete
            parent: actor,
            actor,
        });
        expect(eff.targets).toEqual([]);
    });

    it("strike-mode scope with empty predicate → items carrying a matching strike mode", () => {
        // sword has a melee strike mode; bow has only a missile one.
        const sword = makeItem(
            ITEM_KIND.WEAPONGEAR,
            "w1",
            {},
            { strikeModes: [{ type: "melee", name: "Thrust" }] },
        );
        const bow = makeItem(
            ITEM_KIND.WEAPONGEAR,
            "w2",
            {},
            { strikeModes: [{ type: "missile", name: "Shoot" }] },
        );
        const actor = makeActorWithItems([sword, bow]);
        const eff = makeEffect({
            scope: ACTIVE_EFFECT_SCOPE.MELEE_STRIKE_MODE,
            parent: actor,
            actor,
        });
        expect(eff.targets).toEqual([sword]);
    });

    it("strike-mode scope with predicate (bound itemLogic + sm) → only items with a matching strike mode", () => {
        const sword = makeItem(
            ITEM_KIND.WEAPONGEAR,
            "w1",
            {},
            {
                name: "Sword",
                strikeModes: [
                    { type: "melee", name: "Thrust" },
                    { type: "melee", name: "Swing" },
                ],
            },
        );
        const dagger = makeItem(
            ITEM_KIND.WEAPONGEAR,
            "w2",
            {},
            {
                name: "Dagger",
                strikeModes: [{ type: "melee", name: "Stab" }],
            },
        );
        const actor = makeActorWithItems([sword, dagger]);
        const eff = makeEffect({
            scope: ACTIVE_EFFECT_SCOPE.MELEE_STRIKE_MODE,
            test: 'itemLogic.name === "Sword" && sm.name === "Thrust"',
            parent: actor,
            actor,
        });
        expect(eff.targets).toEqual([sword]);
    });

    it("unrecognized scope → empty array", () => {
        const actor = makeActorWithItems([]);
        const eff = makeEffect({
            scope: "totally-not-a-scope",
            parent: actor,
            actor,
        });
        expect(eff.targets).toEqual([]);
    });

    it("no actor → empty array", () => {
        const item = makeItem(ITEM_KIND.SKILL, "s1");
        const eff = makeEffect({
            scope: ACTIVE_EFFECT_SCOPE.THIS,
            parent: item,
            actor: null,
        });
        expect(eff.targets).toEqual([]);
    });
});
