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

import { describe, it, expect, vi, afterEach } from "vitest";
import { VehicleLogic } from "@src/document/actor/logic/VehicleLogic";
import { ACTOR_KIND } from "@src/utils/constants";
import { makeActorLogic } from "@tests/mocks/logicHarness";
import * as helpers from "@src/core/FoundryHelpers";

afterEach(() => vi.restoreAllMocks());

describe("Vehicle informational payload", () => {
    it("aggregates resolved people, carried gear and owned cargo without changing movement data", () => {
        const being = {
            logic: {
                data: { kind: "being", uuid: "Actor.a" },
                body: { weight: { effective: 150 } },
                carriedWeight: { effective: 20 },
            },
        };
        vi.spyOn(helpers, "fvttActorByRef").mockImplementation((ref) =>
            ref === "a" ? being : undefined,
        );
        const vehicle = makeActorLogic(VehicleLogic, ACTOR_KIND.VEHICLE, {
            occupants: [
                { actorCodeOrUuid: "a", role: "passenger", title: null },
                { actorCodeOrUuid: "missing", role: "crew", title: null },
            ],
            occupantCapacity: 0,
            carryingCapacity: 10,
            currentMoveMedium: "terrestrial",
            movementProfiles: [
                {
                    medium: "terrestrial",
                    feetPerRound: 50,
                    leaguesPerWatch: 5,
                    encumbrance: "0",
                    strMod: "0",
                    disabled: false,
                },
            ],
        });
        vi.spyOn(vehicle, "allLogics", "get").mockReturnValue([
            { data: { kind: "miscgear", quantity: 2, weightBase: 5 } },
        ] as any);
        const movement = JSON.stringify({
            profiles: vehicle.data.movementProfiles,
            medium: vehicle.data.currentMoveMedium,
        });
        vehicle.deriveVehicleState();
        expect(vehicle.occupantCount).toBe(1);
        expect(vehicle.occupantWeight).toBe(170);
        expect(vehicle.cargoWeight).toBe(10);
        expect(vehicle.totalLoad).toBe(180);
        expect(
            JSON.stringify({
                profiles: vehicle.data.movementProfiles,
                medium: vehicle.data.currentMoveMedium,
            }),
        ).toBe(movement);
        expect(vehicle.data.carryingCapacity).toBe(10);
    });
    it("replaces derived totals when occupants disappear", () => {
        vi.spyOn(helpers, "fvttActorByRef").mockReturnValue(undefined);
        const vehicle = makeActorLogic(VehicleLogic, ACTOR_KIND.VEHICLE, { occupants: [] });
        vehicle.deriveVehicleState();
        expect(vehicle.occupantCount).toBe(0);
        expect(vehicle.totalLoad).toBe(0);
    });
});
