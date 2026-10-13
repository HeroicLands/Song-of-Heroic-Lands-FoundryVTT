/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRng } from "@src/entity/random/createRng";

afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
});

async function fixture(driven = false) {
    const releases: (() => void)[] = [];
    class Tour {
        static activeTour: unknown;
        config: any;
        currentStep: any;
        constructor(config: any) {
            this.config = config;
            this.currentStep = config.steps[0];
        }
        async _preStep() {
            await new Promise<void>((resolve) => releases.push(resolve));
        }
        async progress() {
            await (this as any)._preStep();
        }
        async _postStep() {}
        exit() {
            void (this as any)._postStep();
            Tour.activeTour = null;
        }
    }
    const target = { setTarget: vi.fn() };
    vi.stubGlobal("foundry", { nue: { Tour } });
    vi.stubGlobal("game", { user: { targets: new Set([target]) } });
    vi.stubGlobal("document", { querySelectorAll: () => [] });
    const rng = createRng("ordinary-play");
    vi.stubGlobal("sohl", { random: rng });
    const { SohlTour } = await import("@src/apps/foundry/SohlTour");
    const tour = new SohlTour({
        namespace: "sohl",
        id: "preparation",
        title: "Preparation",
        seedRng: 123,
        steps: [
            {
                id: "intro",
                title: "Intro",
                content: "Intro",
                ...(driven ? { drive: [{ kind: "clear-target" as const }] } : {}),
            },
        ],
    });
    Tour.activeTour = tour;
    return { tour, Tour, releases, rng, target };
}

describe("SohlTour preparation lifetime", () => {
    it("never seeds a lease after exiting during stock preparation", async () => {
        const { tour, releases, rng } = await fixture();
        const before = rng.getState();
        const preparation = tour._preStep();
        await Promise.resolve();
        tour.exit();
        releases[0]();
        await preparation;
        expect(rng.getState()).toEqual(before);
    });

    it("ignores an old preparation after the same tour exits and restarts", async () => {
        const { tour, Tour, releases, rng, target } = await fixture(true);
        const old = tour._preStep();
        await Promise.resolve();
        tour.exit();
        Tour.activeTour = tour;
        const restarted = tour._preStep();
        await Promise.resolve();
        releases[1]();
        await restarted;
        rng.die(6);
        const continuation = rng.getState();
        expect(target.setTarget).toHaveBeenCalledOnce();
        releases[0]();
        await old;
        expect(target.setTarget).toHaveBeenCalledOnce();
        expect(rng.getState()).toEqual(continuation);
        tour.exit();
    });
    it("restores the lease when a drive throws during preparation", async () => {
        const { tour, releases, rng, target } = await fixture(true);
        const before = rng.getState();
        target.setTarget.mockImplementation(() => {
            throw new Error("drive failed");
        });
        const progressing = tour.progress(0);
        await Promise.resolve();
        releases[0]();
        await expect(progressing).rejects.toThrow("drive failed");
        expect(rng.getState()).toEqual(before);
    });
    it("attaches encounter ownership only to its creation payload and advances the named encounter", async () => {
        const { tour, releases } = await fixture();
        const own = { createEmbeddedDocuments: vi.fn(), startCombat: vi.fn(), nextTurn: vi.fn() };
        const foreign = { nextTurn: vi.fn() };
        const create = vi.fn(async () => own);
        vi.stubGlobal("Combat", { create });
        vi.stubGlobal("canvas", { scene: { id: "foreign-scene", tokens: [] } });
        vi.stubGlobal("game", { user: { targets: new Set() }, combats: { active: foreign } });
        (globalThis as any).foundry.utils = {
            fromUuidSync: (uuid: string) =>
                uuid === "Combat.lesson" ? own
                : uuid === "Scene.lesson" ? { id: "lesson", tokens: [] }
                : undefined,
        };
        const flags = { sohl: { automatedCombatTutorialRun: "unique-lesson" } };
        (tour as any).currentStep.drive = [
            { kind: "start-combat", sceneUuid: "Scene.lesson", combatFlags: flags },
            { kind: "advance-turn", combatUuid: "Combat.lesson" },
        ];
        const preparation = tour._preStep();
        await Promise.resolve();
        releases[0]();
        await preparation;
        expect(create).toHaveBeenCalledWith({ scene: "lesson", active: true, flags });
        expect(own.nextTurn).toHaveBeenCalledOnce();
        expect(foreign.nextTurn).not.toHaveBeenCalled();
        tour.exit();
    });
    it.each(["updateUser", "createChatMessage", "updateCombat"])(
        "rechecks document-backed gates after %s without another user input",
        async (hook) => {
            const { tour, releases } = await fixture();
            const { TourGate } = await import("@src/entity/tour");
            const handlers = new Map<string, () => void>();
            vi.stubGlobal("Hooks", {
                on: (name: string, callback: () => void) => {
                    handlers.set(name, callback);
                    return 1;
                },
                off: vi.fn((name: string) => handlers.delete(name)),
            });
            vi.stubGlobal("document", {
                querySelectorAll: () => [],
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            });
            vi.stubGlobal("requestAnimationFrame", (callback: () => void) => {
                callback();
                return 1;
            });
            let satisfied = false;
            const readState = vi.fn(() => satisfied);
            (tour as any).currentStep.gate = TourGate.state((context) => context.state === true);
            (tour as any).currentStep.readState = readState;
            const preparation = tour._preStep();
            await Promise.resolve();
            releases[0]();
            await preparation;
            satisfied = true;
            handlers.get(hook)?.();
            expect(readState).toHaveReturnedWith(true);
            tour.exit();
            expect(handlers.has(hook)).toBe(false);
        },
    );

    it("refreshes the actual slot-one macro predicate on a native user update", async () => {
        const { tour, releases } = await fixture();
        const { buildAutomatedCombatTour } =
            await import("@src/apps/foundry/tours/automated-combat-tour");
        const macroStep = (buildAutomatedCombatTour() as any).config.steps.find(
            (step: any) => step.id === "macro",
        );
        const user = { targets: new Set(), hotbar: {} as Record<number, string> };
        vi.stubGlobal("game", {
            user,
            macros: new Map([
                [
                    "stock",
                    {
                        type: "script",
                        command:
                            'await game.combat?.combatant?.logic.executeAction("automatedCombatStart");',
                    },
                ],
            ]),
        });
        const handlers = new Map<string, () => void>();
        vi.stubGlobal("Hooks", {
            on: (name: string, callback: () => void) => {
                handlers.set(name, callback);
                return 1;
            },
            off: vi.fn((name: string) => handlers.delete(name)),
        });
        vi.stubGlobal("document", {
            querySelectorAll: () => [],
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        });
        vi.stubGlobal("requestAnimationFrame", (callback: () => void) => {
            callback();
            return 1;
        });
        const readState = vi.fn(macroStep.readState);
        (tour as any).currentStep.gate = macroStep.gate;
        (tour as any).currentStep.readState = readState;
        const preparation = tour._preStep();
        await Promise.resolve();
        releases[0]();
        await preparation;
        expect(macroStep.readState(tour)).toBe(false);
        user.hotbar[1] = "stock";
        handlers.get("updateUser")?.();
        expect(readState).toHaveReturnedWith(true);
        tour.exit();
        expect(handlers.has("updateUser")).toBe(false);
    });
    it("rolls initiative before starting so turn zero follows the final initiative order", async () => {
        const { tour, releases } = await fixture();
        const order: string[] = [];
        const combat = {
            createEmbeddedDocuments: vi.fn(),
            rollAll: vi.fn(async () => {
                order.push("initiative");
            }),
            startCombat: vi.fn(async () => {
                order.push("start");
            }),
        };
        vi.stubGlobal("Combat", { create: vi.fn(async () => combat) });
        vi.stubGlobal("canvas", { scene: { id: "lesson", tokens: [] } });
        (tour as any).currentStep.drive = [{ kind: "start-combat", rollInitiative: true }];
        const preparation = tour._preStep();
        await Promise.resolve();
        releases[0]();
        await preparation;
        expect(order).toEqual(["initiative", "start"]);
        tour.exit();
    });
});
