/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the shared **Profile** part for real in Node and assert its HTML
 * (issue #1204). This is the tab the Cohort, Vehicle, and Structure sheets all
 * use — the Being has its own, richer Profile — so these specs pin what the
 * shared part shows: the attribute grid (kept for every actor kind, empty or
 * not), the movement ledger with its star control, and the dossier editor.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const PROFILE = "systems/sohl/templates/actor/parts/profile.hbs";

/** One movement row, as `buildMovementRows` produces it. */
function moveRow(overrides: Record<string, unknown> = {}) {
    return {
        medium: "terrestrial",
        label: "SOHL.MovementMedium.terrestrial",
        value: 30,
        isCurrent: false,
        ...overrides,
    };
}

/** The context the sheet hands the part. */
function ctx(overrides: Record<string, unknown> = {}) {
    return {
        isEditable: true,
        attributes: [],
        affiliations: [],
        movement: [moveRow({ medium: "none", value: 0, isCurrent: true })],
        fields: {},
        system: {},
        ...overrides,
    };
}

describe("shared Profile part", () => {
    it("renders the profile tab section", () => {
        const html = renderTemplateReal(PROFILE, ctx());

        expect(html).toContain('data-tab="profile"');
        expect(html).toContain("tab profile");
    });

    it("keeps the attributes section even when the actor has none", () => {
        const html = renderTemplateReal(PROFILE, ctx({ attributes: [] }));

        // The section header is always present — a vehicle or structure may
        // someday carry an attribute, so the section is not conditional.
        expect(html).toContain("Attributes");
        expect(html).toContain("No attributes.");
    });

    it("lists attribute scores when the actor has them", () => {
        const html = renderTemplateReal(
            PROFILE,
            ctx({
                attributes: [
                    {
                        id: "a1",
                        uuid: "Item.a1",
                        name: "Strength",
                        score: 14,
                        descriptor: "Strong",
                        tl: 3,
                        scoreDeltaLabel: "",
                        tlDeltaLabel: "",
                    },
                ],
            }),
        );

        expect(html).toContain("Strength");
        expect(html).toContain("14");
        expect(html).toContain("Strong");
        expect(html).not.toContain("No attributes.");
    });

    it("keeps the affiliations section even when the actor has none", () => {
        const html = renderTemplateReal(PROFILE, ctx({ affiliations: [] }));

        expect(html).toContain("No affiliations.");
    });

    it("lists affiliations when the actor has them", () => {
        const html = renderTemplateReal(
            PROFILE,
            ctx({
                affiliations: [
                    {
                        id: "af1",
                        uuid: "Item.af1",
                        name: "House Kaldor",
                        level: 3,
                        society: "Noble",
                        office: "Steward",
                        title: "Warden",
                        notes: "",
                    },
                ],
            }),
        );

        expect(html).toContain("House Kaldor");
        expect(html).toContain("Steward");
        expect(html).not.toContain("No affiliations.");
    });

    it("renders one movement row per medium, with its tactical move", () => {
        const html = renderTemplateReal(
            PROFILE,
            ctx({
                movement: [
                    moveRow({ medium: "none", value: 0 }),
                    moveRow({ medium: "terrestrial", value: 30 }),
                ],
            }),
        );

        expect(html).toContain('data-medium="none"');
        expect(html).toContain('data-medium="terrestrial"');
        expect(html).toContain("30");
    });

    it("stars the current medium and offers the control on the others", () => {
        const html = renderTemplateReal(
            PROFILE,
            ctx({
                movement: [
                    moveRow({ medium: "terrestrial", isCurrent: true }),
                    moveRow({ medium: "aquatic", isCurrent: false }),
                ],
            }),
        );

        // The current row shows a lit star and no action; the other offers it.
        expect(html).toContain("fa-solid fa-star");
        expect(html).toContain('data-action="makeDefaultMedium"');
        expect(html).toContain('data-medium="aquatic"');
    });

    it("offers the add controls to an editor", () => {
        const html = renderTemplateReal(PROFILE, ctx({ isEditable: true }));

        expect(html).toContain('data-action="createItem"');
        expect(html).toContain('data-type="attribute"');
        expect(html).toContain('data-type="affiliation"');
        expect(html).toContain('data-action="addMovementProfile"');
    });

    it("withholds the add controls when the sheet is not editable", () => {
        const html = renderTemplateReal(PROFILE, ctx({ isEditable: false }));

        expect(html).not.toContain('data-action="createItem"');
        expect(html).not.toContain('data-action="addMovementProfile"');
    });

    it("renders the dossier editor bound to the actor's dossier", () => {
        // `formGroup` renders as the harness's binding placeholder, so assert
        // the binding (field + value), not Foundry's real form markup.
        const html = renderTemplateReal(
            PROFILE,
            ctx({
                fields: { dossier: { name: "system.dossier" } },
                system: { dossier: "A quiet crew." },
            }),
        );

        expect(html).toContain("Biography");
        expect(html).toContain('data-helper="formGroup"');
        expect(html).toContain("A quiet crew.");
    });
});
