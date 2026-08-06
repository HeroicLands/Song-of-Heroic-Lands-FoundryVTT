/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the Cohort **Shared Gear** tab and the gear sheets' cohort-sharing
 * control for real in Node, and assert the emitted HTML (issue #76) — the two
 * ends of the sharing link. The tab is read-only by contract, so what it must
 * *not* emit (create/delete controls, carry/wear toggles, a weight total) is
 * asserted as carefully as what it must.
 */

import { describe, it, expect } from "vitest";
import Handlebars from "handlebars";
import {
    renderTemplateReal,
    registerTestHbsHelpers,
} from "@tests/mocks/hbs-helpers";

const SHARED_GEAR = "systems/sohl/templates/actor/cohort/shared-gear.hbs";

/** One shared-gear row, as `CohortSheet._prepareSharedGearContext` builds it. */
function row(overrides: Record<string, unknown> = {}) {
    return {
        id: "item1",
        uuid: "Actor.a1.Item.item1",
        name: "Coil of Rope",
        img: "icons/rope.webp",
        type: "miscgear",
        typeLabel: "Misc Gear",
        quantity: 2,
        weight: 5,
        quality: "+9",
        durability: 12,
        weightDeltaLabel: "",
        qualityDeltaLabel: "",
        durabilityDeltaLabel: "",
        notes: "Fifty feet",
        carrierName: "Aldric Harvenar",
        carrierUuid: "Actor.a1",
        ...overrides,
    };
}

describe("cohort Shared Gear tab", () => {
    it("renders one ledger row per shared item, naming its carrier", () => {
        const html = renderTemplateReal(SHARED_GEAR, {
            sharedGear: [
                row(),
                row({
                    id: "item2",
                    name: "Lantern",
                    carrierName: "Brunjar Skathhelm",
                    carrierUuid: "Actor.b1",
                }),
            ],
        });

        expect(html).toContain("Coil of Rope");
        expect(html).toContain("Lantern");
        expect(html).toContain("Aldric Harvenar");
        expect(html).toContain("Brunjar Skathhelm");
        expect(html.match(/class="ledger__row"/g)).toHaveLength(2);
    });

    it("binds each row to the item and to the member that carries it", () => {
        const html = renderTemplateReal(SHARED_GEAR, { sharedGear: [row()] });

        expect(html).toContain('data-item-id="item1"');
        expect(html).toContain('data-uuid="Actor.a1.Item.item1"');
        // The carrier cell carries the custodian's uuid — the handle on the
        // actor an editor must go to.
        expect(html).toContain('data-uuid="Actor.a1"');
    });

    it("shows the ordinary Gear columns plus Carried By", () => {
        const html = renderTemplateReal(SHARED_GEAR, { sharedGear: [row()] });

        for (const heading of [
            "Item",
            "Carried By",
            "Type",
            "Qty",
            "Weight",
            "Qual",
            "Dur",
            "Notes",
        ])
            expect(html).toContain(`>${heading}<`);
    });

    it("is read-only: no create, delete, carry, or wear controls", () => {
        const html = renderTemplateReal(SHARED_GEAR, { sharedGear: [row()] });

        expect(html).not.toContain("data-action=");
        expect(html).not.toContain("item-create");
        expect(html).not.toContain("item-carried");
        expect(html).not.toContain("item-worn");
        expect(html).not.toContain("item-contextmenu");
    });

    it("reports no combined weight — a sum across carriers is nobody's load", () => {
        const html = renderTemplateReal(SHARED_GEAR, {
            sharedGear: [row(), row({ id: "item2", name: "Lantern" })],
        });

        expect(html).not.toContain("Carried:");
        expect(html).not.toContain("Capacity:");
        expect(html).not.toContain("Enc ");
    });

    it("explains the empty state instead of rendering an empty ledger", () => {
        const html = renderTemplateReal(SHARED_GEAR, { sharedGear: [] });

        expect(html).not.toContain("ledger__head");
        expect(html).toContain(
            "No member has shared any gear with this cohort",
        );
    });

    it("marks itself active only for the selected tab", () => {
        const inactive = renderTemplateReal(SHARED_GEAR, { sharedGear: [] });
        const active = renderTemplateReal(SHARED_GEAR, {
            sharedGear: [],
            tab: { active: true, group: "primary" },
        });

        expect(inactive).toContain('class="tab sharedgear"');
        expect(active).toContain('class="tab sharedgear active"');
        expect(active).toContain('data-group="primary"');
    });
});

describe("sharedWithCohortsField partial (gear sheets)", () => {
    /** Render the registered partial the gear Properties tabs include. */
    function renderPartial(data: Record<string, unknown>): string {
        registerTestHbsHelpers();
        return Handlebars.compile(
            "{{> sharedWithCohortsField cohortChoices=cohortChoices sharedWithCohortIds=sharedWithCohortIds}}",
        )(data);
    }

    it("offers every world cohort, selecting the ones already shared with", () => {
        const html = renderPartial({
            cohortChoices: [
                { value: "wardens", label: "The Wardens" },
                { value: "bandits", label: "Roadside Bandits" },
            ],
            sharedWithCohortIds: ["wardens"],
        });

        expect(html).toContain(
            '<select name="system.sharedWithCohortIds" multiple',
        );
        expect(html).toContain('<option value="wardens" selected>');
        expect(html).toContain("The Wardens");
        expect(html).toContain('<option value="bandits">');
        expect(html).toContain("Roadside Bandits");
        expect(html).toContain("Shared With");
    });

    it("renders nothing when the world has no cohort to share with", () => {
        expect(
            renderPartial({
                cohortChoices: [],
                sharedWithCohortIds: [],
            }).trim(),
        ).toBe("");
    });
});
