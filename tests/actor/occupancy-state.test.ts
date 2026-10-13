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

import { describe, expect, it } from "vitest";
import {
    resolvedPeople,
    cargoWeightOf,
    occupantsWeightOf,
} from "@src/document/actor/logic/occupancy-state";

const person = (uuid: string, body: number, carried: number) => ({
    data: { kind: "being", uuid },
    body: { weight: { effective: body } },
    carriedWeight: { effective: carried },
});

describe("informational occupancy and payload", () => {
    it("counts people once across direct and nested cohort references, terminating cycles", () => {
        const a = person("Actor.a", 150, 20);
        const b = person("Actor.b", 180, 10);
        const group: any = { data: { kind: "cohort", uuid: "Actor.group" }, memberLogics: [a, b] };
        group.memberLogics.push(group);
        expect(resolvedPeople([a, group])).toEqual([a, b]);
        expect(occupantsWeightOf([a, group])).toBe(360);
    });
    it("excludes non-person actor kinds from occupancy", () => {
        expect(resolvedPeople([{ data: { kind: "structure", uuid: "Actor.store" } }])).toEqual([]);
    });
    it("adds every owned gear item's weight and quantity without rounding or counting non-gear", () => {
        const items = [
            {
                data: { kind: "miscgear", quantity: 2, weightBase: 99 },
                weight: { effective: 0.52 },
            },
            { data: { kind: "containergear", quantity: 1, weightBase: 2 } },
            { data: { kind: "trauma", quantity: 1, weightBase: 100 } },
        ];
        expect(cargoWeightOf(items)).toBeCloseTo(3.04, 12);
    });
    it("includes cohort-owned cargo once with its occupants", () => {
        const a = person("Actor.a", 150, 20);
        const group = {
            data: { kind: "cohort", uuid: "Actor.group" },
            memberLogics: [a],
            allLogics: [{ data: { kind: "miscgear", quantity: 2, weightBase: 5 } }],
        };
        expect(occupantsWeightOf([a, group, group])).toBe(180);
    });
    it("treats absent or invalid weights as unavailable instead of propagating NaN", () => {
        expect(occupantsWeightOf([person("Actor.a", Number.NaN, -10)])).toBe(0);
        expect(cargoWeightOf([{ data: { kind: "miscgear", weightBase: Number.NaN } }])).toBe(0);
    });
});
