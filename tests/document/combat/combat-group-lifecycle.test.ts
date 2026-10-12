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

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ activeGM: true, error: vi.fn(), world: new Map<string, any>() }));
vi.mock("@src/core/FoundryHelpers", () => ({
    fvttIsActiveGM: () => m.activeGM,
    fvttHookOnError: m.error,
}));
let SohlCombat: any;
beforeAll(async () => {
    vi.stubGlobal(
        "Combat",
        class {
            id = "combat";
            collection = m.world;
            groups = { contents: [] as any[] };
            combatants = new Map<string, any>();
            createEmbeddedDocuments = vi.fn(async () => [{ id: "opponents", name: "Opponents" }]);
            updateEmbeddedDocuments = vi.fn(async () => []);
            _onCreateDescendantDocuments() {}
        },
    );
    vi.stubGlobal("foundry", { abstract: { TypeDataModel: class {} } });
    ({ SohlCombat } = await import("@src/document/combat/foundry/SohlCombat"));
});
let combat: any, combatant: any;
beforeEach(() => {
    vi.clearAllMocks();
    m.world.clear();
    m.activeGM = true;
    combat = new SohlCombat();
    m.world.set(combat.id, combat);
    combatant = {
        id: "one",
        groupId: null,
        actor: { system: { defaultCombatGroup: "Opponents" } },
    };
    combat.combatants.set(combatant.id, combatant);
});
function deferred<T>() {
    let resolve!: (value: T) => void, reject!: (error: Error) => void;
    const promise = new Promise<T>((ok, fail) => {
        resolve = ok;
        reject = fail;
    });
    return { promise, resolve, reject };
}
function create() {
    combat._onCreateDescendantDocuments(combat, "combatants", [combatant], {}, {}, "owner");
}
async function settled() {
    await new Promise((resolve) => setTimeout(resolve, 0));
}
describe("asynchronous Combat group seeding lifecycle", () => {
    it("creates a missing group and assigns a live ungrouped combatant", async () => {
        create();
        await settled();
        expect(combat.updateEmbeddedDocuments).toHaveBeenCalledWith("Combatant", [
            { _id: "one", group: "opponents" },
        ]);
        expect(m.error).not.toHaveBeenCalled();
    });
    it("does not start group writes for an unregistered Combat or inactive GM", async () => {
        m.world.delete(combat.id);
        create();
        await settled();
        expect(combat.createEmbeddedDocuments).not.toHaveBeenCalled();
        m.world.set(combat.id, combat);
        m.activeGM = false;
        create();
        await settled();
        expect(combat.createEmbeddedDocuments).not.toHaveBeenCalled();
    });
    it("deletion while group creation is pending prevents the subsequent combatant update", async () => {
        const pending = deferred<any[]>();
        combat.createEmbeddedDocuments.mockReturnValueOnce(pending.promise);
        create();
        m.world.delete(combat.id);
        pending.resolve([{ id: "opponents", name: "Opponents" }]);
        await settled();
        expect(combat.updateEmbeddedDocuments).not.toHaveBeenCalled();
        expect(m.error).not.toHaveBeenCalled();
    });
    it("handles a pending create rejection after deletion without an unhandled rejection", async () => {
        const pending = deferred<any[]>();
        combat.createEmbeddedDocuments.mockReturnValueOnce(pending.promise);
        create();
        m.world.delete(combat.id);
        pending.reject(new Error("The Combat combat does not exist in combats"));
        await settled();
        expect(combat.updateEmbeddedDocuments).not.toHaveBeenCalled();
        expect(m.error).not.toHaveBeenCalled();
    });
    it("handles a pending combatant-update rejection after deletion", async () => {
        const pending = deferred<any[]>();
        combat.updateEmbeddedDocuments.mockReturnValueOnce(pending.promise);
        create();
        await settled();
        expect(combat.updateEmbeddedDocuments).toHaveBeenCalledOnce();
        m.world.delete(combat.id);
        pending.reject(new Error("The Combat combat does not exist in combats"));
        await settled();
        expect(m.error).not.toHaveBeenCalled();
    });
    it("reports genuine errors while the Combat is still live", async () => {
        const error = new Error("permission denied");
        combat.createEmbeddedDocuments.mockRejectedValueOnce(error);
        create();
        await settled();
        expect(m.error).toHaveBeenCalledWith(
            "SohlCombat.seedCombatantGroups",
            error,
            expect.objectContaining({ combatId: "combat", log: "error" }),
        );
    });
    it("does not seed a replacement Combat with the same id or after GM authority changes", async () => {
        const pending = deferred<any[]>();
        combat.createEmbeddedDocuments.mockReturnValueOnce(pending.promise);
        create();
        m.world.set(combat.id, { id: combat.id });
        pending.resolve([{ id: "opponents", name: "Opponents" }]);
        await settled();
        expect(combat.updateEmbeddedDocuments).not.toHaveBeenCalled();
        m.world.set(combat.id, combat);
        const next = deferred<any[]>();
        combat.createEmbeddedDocuments.mockReturnValueOnce(next.promise);
        create();
        m.activeGM = false;
        next.resolve([{ id: "opponents", name: "Opponents" }]);
        await settled();
        expect(combat.updateEmbeddedDocuments).not.toHaveBeenCalled();
    });
    it("preserves a manual group choice made while creation is pending", async () => {
        const pending = deferred<any[]>();
        combat.createEmbeddedDocuments.mockReturnValueOnce(pending.promise);
        create();
        combatant.groupId = "manual";
        pending.resolve([{ id: "opponents", name: "Opponents" }]);
        await settled();
        expect(combat.updateEmbeddedDocuments).not.toHaveBeenCalled();
    });
    it("skips combatants deleted while group creation is pending", async () => {
        const pending = deferred<any[]>();
        combat.createEmbeddedDocuments.mockReturnValueOnce(pending.promise);
        create();
        combat.combatants.delete(combatant.id);
        pending.resolve([{ id: "opponents", name: "Opponents" }]);
        await settled();
        expect(combat.updateEmbeddedDocuments).not.toHaveBeenCalled();
    });
});
