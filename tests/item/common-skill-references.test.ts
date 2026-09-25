/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import {
    commonSkillRows,
    resolveCommonSkillReference,
} from "@src/document/item/logic/common-skill-references";

const foreignUuid = "Compendium.thalorna.skills.Item.ABC123";

afterEach(() => {
    vi.restoreAllMocks();
    (globalThis as any).fromUuid = async () => null;
});

describe("affiliation common skill references", () => {
    it("renders an empty list without looking up documents", async () => {
        const resolver = vi.fn(async () => null);
        (globalThis as any).fromUuid = resolver;
        expect(await commonSkillRows([])).toEqual([]);
        expect(resolver).not.toHaveBeenCalled();
    });

    it("resolves a skill from another module's compendium by its exact UUID", async () => {
        const skill = { documentName: "Item", type: "skill", name: "Herblore", uuid: foreignUuid };
        const resolver = vi.fn(async () => skill);
        (globalThis as any).fromUuid = resolver;
        expect(await commonSkillRows([foreignUuid])).toEqual([
            { uuid: foreignUuid, label: "Herblore", unavailable: false },
        ]);
        expect(resolver).toHaveBeenCalledExactlyOnceWith(foreignUuid);
        expect(await resolveCommonSkillReference(foreignUuid)).toBe(skill);
    });

    it("keeps an unavailable UUID visible and unchanged", async () => {
        (globalThis as any).fromUuid = async () => null;
        expect(await commonSkillRows([foreignUuid])).toEqual([
            { uuid: foreignUuid, label: foreignUuid, unavailable: true },
        ]);
        expect(await resolveCommonSkillReference(foreignUuid)).toBeUndefined();
    });

    it("keeps the UUID visible when an unavailable pack rejects resolution", async () => {
        (globalThis as any).fromUuid = async () => {
            throw new Error("Pack unavailable");
        };
        expect(await commonSkillRows([foreignUuid])).toEqual([
            { uuid: foreignUuid, label: foreignUuid, unavailable: true },
        ]);
    });

    it("rejects non-skill Items and other document types", async () => {
        for (const document of [
            { documentName: "Item", type: "affiliation", uuid: foreignUuid },
            { documentName: "Actor", type: "skill", uuid: foreignUuid },
        ]) {
            (globalThis as any).fromUuid = async () => document;
            expect(await resolveCommonSkillReference(foreignUuid)).toBeUndefined();
        }
    });
});
