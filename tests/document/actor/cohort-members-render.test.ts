/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render the Cohort **Members** tab for real in Node and assert the emitted
 * HTML (issue #1151). The tab previously bound fields the schema does not have
 * (`member.name` / `member.shortcode` / `moveRepName`), so it listed nothing at
 * all; these specs pin the row to what a member entry actually carries — its
 * `shortcodeOrUuid` handle and role — and pin the three controls the tab owns:
 * add, remove, and promote-to-leader.
 */

import { describe, it, expect } from "vitest";
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";

const MEMBERS = "systems/sohl/templates/actor/cohort/members.hbs";

/** One member row, as `CohortSheet._prepareMembersContext` builds it. */
function row(overrides: Record<string, unknown> = {}) {
    return {
        ref: "aldric",
        name: "Aldric Harvenar",
        img: "icons/aldric.webp",
        uuid: "Actor.a1",
        role: "member",
        roleLabel: "SOHL.Cohort.MemberRole.member",
        isResolved: true,
        isLeader: false,
        ...overrides,
    };
}

describe("cohort Members tab", () => {
    it("lists one row per member, named from the actor its handle resolves to", () => {
        const html = renderTemplateReal(MEMBERS, {
            members: [
                row(),
                row({
                    ref: "Actor.b1",
                    name: "Brunjar Skathhelm",
                    uuid: "Actor.b1",
                }),
            ],
        });

        expect(html).toContain("Aldric Harvenar");
        expect(html).toContain("Brunjar Skathhelm");
        expect(html.match(/class="ledger__row"/g)).toHaveLength(2);
    });

    it("binds each row to the member's handle and resolved actor", () => {
        const html = renderTemplateReal(MEMBERS, { members: [row()] });

        expect(html).toContain('data-member-ref="aldric"');
        expect(html).toContain('data-uuid="Actor.a1"');
    });

    it("shows the member actor's portrait, left of its name", () => {
        const html = renderTemplateReal(MEMBERS, { members: [row()] });

        expect(html).toContain('<img src="icons/aldric.webp"');
        // The portrait cell precedes the name cell in the row.
        expect(html.indexOf("icons/aldric.webp")).toBeLessThan(
            html.indexOf("ledger__name"),
        );
    });

    it("leaves the portrait cell empty when the member has no image", () => {
        const html = renderTemplateReal(MEMBERS, {
            members: [row({ img: "" })],
        });

        expect(html).toContain("ledger__icon");
        expect(html).not.toContain("<img");
    });

    it("flags an unresolved member with a NOT FOUND warning (#199)", () => {
        const html = renderTemplateReal(MEMBERS, {
            members: [
                row({
                    ref: "departed",
                    name: "departed",
                    uuid: null,
                    img: "",
                    isResolved: false,
                }),
            ],
        });

        expect(html).toContain("member-missing");
        expect(html).toContain("fa-triangle-exclamation");
        expect(html).toContain("Not Found");
    });

    it("shows no warning for a member that resolves", () => {
        const html = renderTemplateReal(MEMBERS, { members: [row()] });

        expect(html).not.toContain("member-missing");
        expect(html).not.toContain("fa-triangle-exclamation");
    });

    it("shows each member's localized role", () => {
        const html = renderTemplateReal(MEMBERS, {
            members: [
                row({
                    role: "director",
                    roleLabel: "SOHL.Cohort.MemberRole.director",
                }),
            ],
        });

        expect(html).toContain("Director");
    });

    it("marks a member whose actor no longer resolves", () => {
        const html = renderTemplateReal(MEMBERS, {
            members: [
                row({
                    ref: "ghost",
                    name: "ghost",
                    uuid: null,
                    img: "",
                    isResolved: false,
                }),
            ],
        });

        expect(html).toContain("ledger__row--disabled");
        expect(html).toContain("ghost");
    });

    it("lights the chess-king control on the leader's row only", () => {
        const html = renderTemplateReal(MEMBERS, {
            members: [
                row({ isLeader: true }),
                row({ ref: "brunjar", name: "Brunjar" }),
            ],
        });

        // One king per row; exactly one of them is in the lit (leader) state.
        expect(html.match(/fa-chess-king/g)).toHaveLength(2);
        expect(html.match(/icon-button is-on/g)).toHaveLength(1);
    });

    it("makes every king clickable, carrying the row's handle", () => {
        const html = renderTemplateReal(MEMBERS, {
            members: [
                row({ isLeader: true }),
                row({ ref: "brunjar", name: "Brunjar" }),
            ],
        });

        expect(html.match(/data-action="setCohortLeader"/g)).toHaveLength(2);
        expect(html).toContain('data-member-ref="brunjar"');
    });

    it("offers a remove control on each row and an add control in the header", () => {
        const html = renderTemplateReal(MEMBERS, { members: [row()] });

        expect(html).toContain('data-action="removeCohortMember"');
        expect(html).toContain("fa-trash");
        expect(html).toContain('data-action="addCohortMember"');
        expect(html).toContain("Add Member");
    });

    it("explains the empty state instead of rendering an empty ledger", () => {
        const html = renderTemplateReal(MEMBERS, { members: [] });

        expect(html).not.toContain("ledger__head");
        expect(html).toContain("This cohort has no members yet");
        // The add control stays reachable — that is how the first member arrives.
        expect(html).toContain('data-action="addCohortMember"');
    });

    it("binds no field the Cohort schema does not carry", () => {
        const html = renderTemplateReal(MEMBERS, { members: [row()] });

        expect(html).not.toContain("moveRepName");
        expect(html).not.toContain("Movement Rep");
        expect(html).not.toContain("Shortcode");
    });

    it("marks itself active only for the selected tab", () => {
        const inactive = renderTemplateReal(MEMBERS, { members: [] });
        const active = renderTemplateReal(MEMBERS, {
            members: [],
            tab: { active: true, group: "primary" },
        });

        expect(inactive).toContain('class="tab members"');
        expect(active).toContain('class="tab members active"');
        expect(active).toContain('data-group="primary"');
    });
});
