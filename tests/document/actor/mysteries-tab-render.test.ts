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
import { renderTemplateReal } from "@tests/mocks/hbs-helpers";
import {
    mysticalAbilityColumns,
    mysticalAbilityLedgerCols,
} from "@src/document/actor/logic/being-sheet-view";
import { MYSTICALABILITY_SUBTYPE } from "@src/utils/constants";

const TEMPLATE = "systems/sohl/templates/actor/being/mysteries.hbs";

/** A modifier-shaped stub the ledger reads (effective / disabled / deltaLabel). */
function mod(effective: number, disabled: unknown = false) {
    return { effective, disabled, deltaLabel: "" };
}

/**
 * A single Mystical Ability row fixture as the template reads it — the raw item
 * with a live `.logic`. Overrides patch the logic sub-objects.
 */
function abilityLike(over: Record<string, any> = {}) {
    const logic = {
        assocRef: { name: "Spellcraft" } as { name: string } | undefined,
        level: mod(3),
        masteryLevel: mod(42),
        charges: { value: mod(3), max: mod(5) },
        isDisabled: false,
        ...(over.logic ?? {}),
    };
    return {
        id: over.id ?? "ma1",
        name: over.name ?? "Sample Ability",
        img: over.img ?? "icons/x.svg",
        system: { notes: over.notes ?? "", improveFlag: false },
        logic,
    };
}

/** Render the Mysteries tab for one ability sub-type's section only. */
function render(subType: string, abilities: ReturnType<typeof abilityLike>[]) {
    const columns = mysticalAbilityColumns(subType);
    const section = {
        subType,
        label: subType,
        items: abilities,
        columns,
        ledgerCols: mysticalAbilityLedgerCols(columns),
    };
    return renderTemplateReal(TEMPLATE, {
        mysterySections: [],
        abilitySections: [section],
    });
}

describe("Being Mysteries tab — per-sub-type Mystical Ability columns (#990)", () => {
    it("shows Skill + Lvl + EML + Chgs/Max for a spirit power", () => {
        const html = render(MYSTICALABILITY_SUBTYPE.SPIRITPOWER, [
            abilityLike({ name: "Totem Bond" }),
        ]);
        expect(html).toContain(">Skill<");
        expect(html).toContain(">Lvl<");
        expect(html).toContain(">EML<");
        expect(html).toContain(">Chgs/Max<");
        expect(html).toContain("Totem Bond");
    });

    it("hides the Skill column for an intrinsic talent (arcanetalent)", () => {
        const html = render(MYSTICALABILITY_SUBTYPE.ARCANETALENT, [
            abilityLike({
                name: "Sixth Sense",
                logic: { assocRef: undefined },
            }),
        ]);
        expect(html).not.toContain(">Skill<");
        expect(html).toContain(">Lvl<");
        expect(html).toContain(">EML<");
    });

    it("hides the Lvl column for a subtype without a level (ritual action)", () => {
        const html = render(MYSTICALABILITY_SUBTYPE.RITUALACTION, [
            abilityLike({ name: "Devotion" }),
        ]);
        expect(html).toContain(">Skill<");
        expect(html).not.toContain(">Lvl<");
        expect(html).toContain(">EML<");
    });

    it("labels the assoc column 'Spirit Power' (not Skill/Lvl) for a spirit rite", () => {
        const html = render(MYSTICALABILITY_SUBTYPE.SPIRITRITE, [
            abilityLike({
                name: "Rite of Passage",
                logic: { assocRef: { name: "Fox Totem" }, isDisabled: false },
            }),
        ]);
        expect(html).toContain(">Spirit Power<");
        expect(html).not.toContain(">Skill<");
        expect(html).not.toContain(">Lvl<");
        expect(html).toContain("Fox Totem"); // the associated spirit power's name
    });

    it("disables a spirit-power ability and blocks its roll when no Spirit Power is associated", () => {
        const html = render(MYSTICALABILITY_SUBTYPE.SPIRITRITE, [
            abilityLike({
                name: "Orphan Rite",
                logic: { assocRef: undefined, isDisabled: true },
            }),
        ]);
        expect(html).toContain("ledger__row--disabled");
        expect(html).toContain("fa-xmark"); // ✕ in the Spirit Power cell
        expect(html).not.toContain('data-action="successTest"');
    });

    it("renders an fa-xmark in the assoc cell when none is associated (skill subtype)", () => {
        const html = render(MYSTICALABILITY_SUBTYPE.ALCHEMY, [
            abilityLike({ name: "Distill", logic: { assocRef: undefined } }),
        ]);
        expect(html).toContain("fa-xmark");
    });

    it("renders the Chgs/Max cell as left/max for finite charges", () => {
        const html = render(MYSTICALABILITY_SUBTYPE.RITUALACTION, [
            abilityLike({
                logic: { charges: { value: mod(2), max: mod(4) } },
            }),
        ]);
        expect(html).toContain("2/4");
    });

    it("greys and disables the row of an exhausted ability, blocking its roll", () => {
        const html = render(MYSTICALABILITY_SUBTYPE.RITUALACTION, [
            abilityLike({
                name: "Spent Devotion",
                logic: {
                    charges: { value: mod(0), max: mod(4) },
                    isDisabled: true,
                },
            }),
        ]);
        expect(html).toContain("ledger__row--disabled");
        // The EML cell of a disabled row is not rollable.
        expect(html).not.toContain('data-action="successTest"');
    });

    it("keeps the EML cell rollable while the ability is enabled", () => {
        const html = render(MYSTICALABILITY_SUBTYPE.RITUALACTION, [
            abilityLike({}),
        ]);
        expect(html).toContain('data-action="successTest"');
        expect(html).not.toContain("ledger__row--disabled");
    });
});
