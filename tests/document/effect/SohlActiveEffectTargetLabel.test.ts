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
import { SohlActiveEffectDataModel } from "@src/document/effect/foundry/SohlActiveEffectDataModel";
import { ACTIVE_EFFECT_SCOPE, ITEM_KIND } from "@src/utils/constants";

/**
 * Build a minimal `SohlActiveEffectDataModel`-like object exercising the
 * `targetLabel` getter without Foundry's DataModel machinery: bypass the
 * constructor and set `scope` plus a fake `parent` document exposing the
 * `item` / `actor` getters the label derivation reads.
 */
function makeSystem(opts: {
    scope: string;
    item?: { type: string } | null;
    actor?: { name: string };
}): SohlActiveEffectDataModel {
    const sys = Object.create(SohlActiveEffectDataModel.prototype) as any;
    sys.scope = opts.scope;
    sys.parent = {
        item: opts.item ?? null,
        actor: opts.actor ?? { name: "Unnamed" },
    };
    return sys as SohlActiveEffectDataModel;
}

describe("SohlActiveEffectDataModel.targetLabel", () => {
    it("reads 'This Actor: {name}' for a 'this'-scoped actor effect", () => {
        const sys = makeSystem({
            scope: ACTIVE_EFFECT_SCOPE.THIS,
            item: null,
            actor: { name: "Aldric" },
        });
        // format() substitutes {actorName} into the returned key text.
        expect(sys.targetLabel).toBe("SOHL.ActiveEffect.targetLabel.ThisActor");
    });

    it("reads 'This {itemType}' for a 'this'-scoped item effect", () => {
        const sys = makeSystem({
            scope: ACTIVE_EFFECT_SCOPE.THIS,
            item: { type: ITEM_KIND.WEAPONGEAR },
        });
        expect(sys.targetLabel).toBe("SOHL.ActiveEffect.targetLabel.ThisItem");
    });

    it("reads the Actor label for an 'actor' scope", () => {
        const sys = makeSystem({ scope: ACTIVE_EFFECT_SCOPE.ACTOR });
        expect(sys.targetLabel).toBe("SOHL.ActiveEffect.TARGET_TYPE.actor");
    });

    it("reads the item-type label for an item-kind scope", () => {
        const sys = makeSystem({ scope: ITEM_KIND.SKILL });
        expect(sys.targetLabel).toBe("TYPE.ITEM.skill");
    });

    it("reads the strike-mode scope label", () => {
        const sys = makeSystem({
            scope: ACTIVE_EFFECT_SCOPE.MELEE_STRIKE_MODE,
        });
        expect(sys.targetLabel).toBe("SOHL.ActiveEffect.Scope.meleestrikemode");
    });
});
