/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the Vehicle **Occupants** tab for real in Node and assert its HTML
 * (issue #201). The tab mirrors the cohort's roster — resolved rows, a health
 * readout, a NOT FOUND flag for an unresolvable handle — with two differences
 * it exists to prove: occupants carry a **title**, and there is **no leader
 * control**, because a vehicle's complement has roles but no single head.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const OCCUPANTS = "systems/sohl/templates/actor/vehicle/occupants.hbs";

/** One occupant row, as `VehicleLogic.occupantRows` builds it. */
function row(overrides: Record<string, unknown> = {}) {
    return {
        ref: "bosun",
        name: "Bosun Vell",
        img: "icons/bosun.webp",
        uuid: "Actor.b1",
        role: "crew",
        roleLabel: "SOHL.Vehicle.Occupant.Role.crew",
        title: "Bosun",
        isResolved: true,
        healthPct: 100,
        healthBand: "Excellent",
        healthBandLabel: "SOHL.Health.BAND.Excellent",
        ...overrides,
    };
}

/** The context the sheet hands the part. */
function ctx(occupants: unknown[], isEditable = true) {
    return { occupants, isEditable };
}

describe("vehicle Occupants tab", () => {
    it("lists one row per occupant, named from its resolved actor", () => {
        const html = renderTemplateReal(
            OCCUPANTS,
            ctx([row(), row({ ref: "cook", name: "Cook", uuid: "Actor.c1" })]),
        );

        expect(html).toContain("Bosun Vell");
        expect(html).toContain("Cook");
        expect(html.match(/class="ledger__row"/g)).toHaveLength(2);
    });

    it("binds each row to its handle and resolved actor", () => {
        const html = renderTemplateReal(OCCUPANTS, ctx([row()]));

        expect(html).toContain('data-occupant-ref="bosun"');
        expect(html).toContain('data-uuid="Actor.b1"');
    });

    it("shows the occupant's title alongside its role", () => {
        const html = renderTemplateReal(OCCUPANTS, ctx([row()]));

        expect(html).toContain("Bosun");
        expect(html).toContain("Crew");
    });

    it("shows health as a percentage and a localized band", () => {
        const html = renderTemplateReal(
            OCCUPANTS,
            ctx([
                row({
                    healthPct: 45,
                    healthBand: "Poor",
                    healthBandLabel: "SOHL.Health.BAND.Poor",
                }),
            ]),
        );

        expect(html).toContain("45%");
        expect(html).toContain("Poor");
        expect(html).not.toContain("SOHL.Health.BAND.Poor");
    });

    it("flags an occupant whose actor cannot be found", () => {
        const html = renderTemplateReal(
            OCCUPANTS,
            ctx([
                row({
                    ref: "departed",
                    name: "departed",
                    uuid: null,
                    img: "",
                    isResolved: false,
                    healthPct: undefined,
                    healthBand: undefined,
                    healthBandLabel: undefined,
                }),
            ]),
        );

        expect(html).toContain("ledger__row--disabled");
        expect(html).toContain("member-missing");
        expect(html).toContain("Not Found");
    });

    it("offers no leader control — a vehicle has none", () => {
        const html = renderTemplateReal(OCCUPANTS, ctx([row()]));

        expect(html).not.toContain("setCohortLeader");
        expect(html).not.toContain("fa-chess-king");
    });

    it("offers the add and remove controls to an editor", () => {
        const html = renderTemplateReal(OCCUPANTS, ctx([row()], true));

        expect(html).toContain('data-action="addVehicleOccupant"');
        expect(html).toContain('data-action="removeVehicleOccupant"');
    });

    it("withholds the controls when the sheet is not editable", () => {
        const html = renderTemplateReal(OCCUPANTS, ctx([row()], false));

        expect(html).not.toContain('data-action="addVehicleOccupant"');
        expect(html).not.toContain('data-action="removeVehicleOccupant"');
    });

    it("explains the empty state when nobody is aboard", () => {
        const html = renderTemplateReal(OCCUPANTS, ctx([]));

        expect(html).toContain("Nobody is aboard.");
    });
});
