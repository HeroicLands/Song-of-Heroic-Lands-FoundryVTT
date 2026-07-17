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

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    DomainRegistry,
    type DomainEntry,
} from "@src/entity/domain/DomainRegistry";
import { DOMAIN_FAMILY } from "@src/utils/constants";
// Mock-swapped shim (vitest alias); spy on it instead of touching raw Foundry globals.
import * as FoundryHelpers from "@src/core/FoundryHelpers";

/**
 * Backs the settings shim with an in-memory store so DomainRegistry can read/write
 * the "sohl.domains" setting under test, by spying on the mock-swapped
 * `fvttGetSetting`/`fvttSetSetting` rather than touching raw Foundry globals.
 */
function installSettingsStore(): { reset: () => void } {
    const store = new Map<string, unknown>();
    vi.spyOn(FoundryHelpers, "fvttGetSetting").mockImplementation(
        (module: string, key: string) => store.get(`${module}.${key}`),
    );
    vi.spyOn(FoundryHelpers, "fvttSetSetting").mockImplementation(
        async (module: string, key: string, value: unknown) => {
            store.set(`${module}.${key}`, value);
            return value;
        },
    );
    return {
        reset: () => store.clear(),
    };
}

function makeEntry(overrides: Partial<DomainEntry> = {}): DomainEntry {
    return {
        shortcode: "sohl.test.entry",
        label: "Test Entry",
        family: DOMAIN_FAMILY.ARCANE,
        iconFAClass: "sohl-circle",
        img: "",
        description: "A test entry",
        sort: 0,
        source: "sohl",
        ...overrides,
    };
}

describe("DomainRegistry", () => {
    let store: { reset: () => void };

    beforeEach(() => {
        store = installSettingsStore();
        // Make SohlSystem.ready known so register() chooses the right
        // default source. Tests that need a different state set it
        // explicitly.
        (globalThis as any).sohl.ready = false;
        store.reset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("register", () => {
        it("adds a single entry to the registry", async () => {
            const entry = makeEntry({ shortcode: "sohl.test.alpha" });
            await DomainRegistry.register(entry);
            expect(DomainRegistry.get("sohl.test.alpha")).toEqual(entry);
        });

        it("adds an array of entries in one call", async () => {
            await DomainRegistry.register([
                makeEntry({ shortcode: "sohl.test.alpha" }),
                makeEntry({ shortcode: "sohl.test.beta" }),
            ]);
            expect(DomainRegistry.get("sohl.test.alpha")).toBeDefined();
            expect(DomainRegistry.get("sohl.test.beta")).toBeDefined();
        });

        it("merges new entries with existing ones (does not clobber)", async () => {
            await DomainRegistry.register(
                makeEntry({ shortcode: "sohl.test.alpha" }),
            );
            await DomainRegistry.register(
                makeEntry({ shortcode: "sohl.test.beta" }),
            );
            expect(DomainRegistry.get("sohl.test.alpha")).toBeDefined();
            expect(DomainRegistry.get("sohl.test.beta")).toBeDefined();
        });

        it("overwrites entries with the same shortcode (last write wins)", async () => {
            await DomainRegistry.register(
                makeEntry({
                    shortcode: "sohl.test.alpha",
                    label: "First",
                }),
            );
            await DomainRegistry.register(
                makeEntry({
                    shortcode: "sohl.test.alpha",
                    label: "Second",
                }),
            );
            expect(DomainRegistry.get("sohl.test.alpha")?.label).toBe("Second");
        });

        it("defaults source to 'sohl' when SohlSystem is not ready", async () => {
            (globalThis as any).sohl.ready = false;
            // Build an entry without an explicit source
            const entry = { ...makeEntry({ shortcode: "sohl.test.alpha" }) };
            delete (entry as any).source;
            await DomainRegistry.register(entry as DomainEntry);
            expect(DomainRegistry.get("sohl.test.alpha")?.source).toBe("sohl");
        });

        it("defaults source to 'world' when SohlSystem is ready", async () => {
            (globalThis as any).sohl.ready = true;
            const entry = { ...makeEntry({ shortcode: "world.test.alpha" }) };
            delete (entry as any).source;
            await DomainRegistry.register(entry as DomainEntry);
            expect(DomainRegistry.get("world.test.alpha")?.source).toBe(
                "world",
            );
        });

        it("uses the explicit source argument over defaults", async () => {
            (globalThis as any).sohl.ready = true;
            const entry = {
                ...makeEntry({ shortcode: "fakemodule.test.alpha" }),
            };
            delete (entry as any).source;
            await DomainRegistry.register(entry as DomainEntry, "fakemodule");
            expect(DomainRegistry.get("fakemodule.test.alpha")?.source).toBe(
                "fakemodule",
            );
        });

        it("preserves an entry's existing source when one is provided", async () => {
            await DomainRegistry.register(
                makeEntry({
                    shortcode: "fakemodule.test.alpha",
                    source: "fakemodule",
                }),
            );
            expect(DomainRegistry.get("fakemodule.test.alpha")?.source).toBe(
                "fakemodule",
            );
        });

        it("round-trips img and iconFAClass through the setting", async () => {
            await DomainRegistry.register(
                makeEntry({
                    shortcode: "sohl.test.alpha",
                    iconFAClass: "sohl-fire",
                    img: "systems/sohl/assets/icons/fire.webp",
                }),
            );
            const got = DomainRegistry.get("sohl.test.alpha");
            expect(got?.iconFAClass).toBe("sohl-fire");
            expect(got?.img).toBe("systems/sohl/assets/icons/fire.webp");
        });

        it("round-trips an optional parentShortcode through the setting", async () => {
            await DomainRegistry.register(
                makeEntry({
                    shortcode: "sohl.asguardian.faithbaldr",
                    family: DOMAIN_FAMILY.RELIGION,
                    ancestorShortcode: "sohl.asguardian.baldr",
                }),
            );
            expect(
                DomainRegistry.get("sohl.asguardian.faithbaldr")
                    ?.ancestorShortcode,
            ).toBe("sohl.asguardian.baldr");
        });

        it("leaves parentShortcode undefined when not provided", async () => {
            await DomainRegistry.register(
                makeEntry({ shortcode: "sohl.test.standalone" }),
            );
            expect(
                DomainRegistry.get("sohl.test.standalone")?.ancestorShortcode,
            ).toBeUndefined();
        });

        it("allows parentShortcode to point at a non-existent parent", async () => {
            // The 'no real deity behind the faith' case: a faith may
            // reference a deity that has not been registered.
            await DomainRegistry.register(
                makeEntry({
                    shortcode: "world.faith.believers",
                    family: DOMAIN_FAMILY.RELIGION,
                    source: "world",
                    ancestorShortcode: "world.deity.imaginary",
                }),
            );
            const got = DomainRegistry.get("world.faith.believers");
            expect(got?.ancestorShortcode).toBe("world.deity.imaginary");
            expect(DomainRegistry.get("world.deity.imaginary")).toBeUndefined();
        });
    });

    describe("get", () => {
        it("returns undefined for an unknown shortcode", () => {
            expect(DomainRegistry.get("sohl.nope.missing")).toBeUndefined();
        });

        it("returns the registered entry for a known shortcode", async () => {
            const entry = makeEntry({ shortcode: "sohl.test.alpha" });
            await DomainRegistry.register(entry);
            expect(DomainRegistry.get("sohl.test.alpha")).toEqual(entry);
        });

        it("returns shortcodes containing literal spaces verbatim", async () => {
            await DomainRegistry.register(
                makeEntry({
                    shortcode: "sohl.totem.Sea Bass",
                    family: DOMAIN_FAMILY.SPIRIT,
                    label: "Sea Bass",
                }),
            );
            expect(DomainRegistry.get("sohl.totem.Sea Bass")?.label).toBe(
                "Sea Bass",
            );
        });
    });

    describe("getAll", () => {
        it("returns all registered entries keyed by shortcode", async () => {
            await DomainRegistry.register([
                makeEntry({ shortcode: "sohl.test.alpha" }),
                makeEntry({ shortcode: "sohl.test.beta" }),
            ]);
            const all = DomainRegistry.getAll();
            expect(Object.keys(all).sort()).toEqual([
                "sohl.test.alpha",
                "sohl.test.beta",
            ]);
        });

        it("returns an empty object when no entries are registered", () => {
            expect(DomainRegistry.getAll()).toEqual({});
        });

        it("returns a frozen object that cannot be mutated by the caller", async () => {
            await DomainRegistry.register(
                makeEntry({ shortcode: "sohl.test.alpha" }),
            );
            const all = DomainRegistry.getAll();
            expect(Object.isFrozen(all)).toBe(true);
            expect(() => {
                (all as any)["sohl.test.injected"] = makeEntry();
            }).toThrow();
        });
    });

    describe("getByFamily", () => {
        beforeEach(async () => {
            await DomainRegistry.register([
                makeEntry({
                    shortcode: "sohl.hexhodai.fire",
                    family: DOMAIN_FAMILY.ARCANE,
                    label: "Fire",
                    sort: 1,
                }),
                makeEntry({
                    shortcode: "sohl.hexhodai.water",
                    family: DOMAIN_FAMILY.ARCANE,
                    label: "Water",
                    sort: 0,
                }),
                makeEntry({
                    shortcode: "sohl.totem.Bear",
                    family: DOMAIN_FAMILY.SPIRIT,
                    label: "Bear",
                    sort: 0,
                }),
            ]);
        });

        it("returns only entries matching the requested family", () => {
            const arcane = DomainRegistry.getByFamily(DOMAIN_FAMILY.ARCANE);
            expect(arcane).toHaveLength(2);
            expect(arcane.every((e) => e.family === DOMAIN_FAMILY.ARCANE)).toBe(
                true,
            );
        });

        it("sorts entries by sort, then by label", () => {
            const arcane = DomainRegistry.getByFamily(DOMAIN_FAMILY.ARCANE);
            expect(arcane[0].label).toBe("Water"); // sort 0
            expect(arcane[1].label).toBe("Fire"); // sort 1
        });

        it("returns an empty array for a family with no entries", () => {
            expect(DomainRegistry.getByFamily(DOMAIN_FAMILY.NATURAL)).toEqual(
                [],
            );
        });
    });

    describe("getChoices", () => {
        beforeEach(async () => {
            await DomainRegistry.register([
                makeEntry({
                    shortcode: "sohl.hexhodai.fire",
                    family: DOMAIN_FAMILY.ARCANE,
                    label: "Fire",
                }),
                makeEntry({
                    shortcode: "sohl.totem.Bear",
                    family: DOMAIN_FAMILY.SPIRIT,
                    label: "Bear",
                }),
            ]);
        });

        it("returns shortcode/label pairs for all entries when no family is given", () => {
            const choices = DomainRegistry.getChoices();
            expect(choices).toHaveLength(2);
            expect(choices[0]).toHaveProperty("shortcode");
            expect(choices[0]).toHaveProperty("label");
        });

        it("filters choices by family", () => {
            const choices = DomainRegistry.getChoices(DOMAIN_FAMILY.ARCANE);
            expect(choices).toHaveLength(1);
            expect(choices[0].shortcode).toBe("sohl.hexhodai.fire");
        });
    });

    describe("remove", () => {
        it("removes a world-source entry", async () => {
            await DomainRegistry.register(
                makeEntry({
                    shortcode: "world.test.alpha",
                    source: "world",
                }),
            );
            await DomainRegistry.remove("world.test.alpha");
            expect(DomainRegistry.get("world.test.alpha")).toBeUndefined();
        });

        it("rejects removal of a sohl-source entry", async () => {
            await DomainRegistry.register(
                makeEntry({
                    shortcode: "sohl.test.alpha",
                    source: "sohl",
                }),
            );
            await expect(
                DomainRegistry.remove("sohl.test.alpha"),
            ).rejects.toThrow();
            expect(DomainRegistry.get("sohl.test.alpha")).toBeDefined();
        });

        it("rejects removal of a module-source entry", async () => {
            await DomainRegistry.register(
                makeEntry({
                    shortcode: "fakemodule.test.alpha",
                    source: "fakemodule",
                }),
            );
            await expect(
                DomainRegistry.remove("fakemodule.test.alpha"),
            ).rejects.toThrow();
            expect(DomainRegistry.get("fakemodule.test.alpha")).toBeDefined();
        });

        it("is a no-op for a missing shortcode", async () => {
            await expect(
                DomainRegistry.remove("sohl.test.missing"),
            ).resolves.toBeUndefined();
        });
    });
});
