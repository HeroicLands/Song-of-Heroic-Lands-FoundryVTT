/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    fireSohlTrigger,
    registerSohlTrigger,
    SOHL_BUILTIN_TRIGGERS,
} from "@src/core/SohlEventTrigger";

describe("SohlEventTrigger", () => {
    describe("SOHL_BUILTIN_TRIGGERS", () => {
        it("matches Foundry's ACTIVE_EFFECT_EXPIRY_EVENTS vocabulary", () => {
            expect([...SOHL_BUILTIN_TRIGGERS].sort()).toEqual(
                [
                    "combatEnd",
                    "combatStart",
                    "roundEnd",
                    "roundStart",
                    "turnEnd",
                    "turnStart",
                    "updateWorldTime",
                ].sort(),
            );
        });
    });

    describe("registerSohlTrigger", () => {
        let originalConfig: any;

        beforeEach(() => {
            originalConfig = (globalThis as any).CONFIG;
            (globalThis as any).CONFIG = {
                ActiveEffect: { expiryEvents: {} },
            };
        });

        afterEach(() => {
            (globalThis as any).CONFIG = originalConfig;
        });

        it("adds the trigger name and label to CONFIG.ActiveEffect.expiryEvents", () => {
            registerSohlTrigger(
                "sohlInjuryHealed",
                "SOHL.Trigger.InjuryHealed",
            );
            expect(
                (globalThis as any).CONFIG.ActiveEffect.expiryEvents
                    .sohlInjuryHealed,
            ).toBe("SOHL.Trigger.InjuryHealed");
        });

        it("initialises expiryEvents if missing", () => {
            (globalThis as any).CONFIG.ActiveEffect = {};
            registerSohlTrigger("custom", "label");
            expect(
                (globalThis as any).CONFIG.ActiveEffect.expiryEvents.custom,
            ).toBe("label");
        });

        it("is a safe no-op when CONFIG.ActiveEffect is absent", () => {
            (globalThis as any).CONFIG = {};
            expect(() => registerSohlTrigger("x", "y")).not.toThrow();
        });
    });

    describe("fireSohlTrigger", () => {
        let originalSohl: any;
        let originalAE: any;

        beforeEach(() => {
            originalSohl = (globalThis as any).sohl;
            originalAE = (globalThis as any).ActiveEffect;
        });

        afterEach(() => {
            (globalThis as any).sohl = originalSohl;
            (globalThis as any).ActiveEffect = originalAE;
        });

        it("dual-dispatches to sohl.events.fire and ActiveEffect.registry.refresh", async () => {
            const fireSpy = vi.fn(async () => {});
            const refreshSpy = vi.fn(async () => {});
            (globalThis as any).sohl = { events: { fire: fireSpy } };
            (globalThis as any).ActiveEffect = {
                registry: { refresh: refreshSpy },
            };

            const ctx = { name: "custom", foo: "bar" };
            await fireSohlTrigger(ctx as any);
            expect(fireSpy).toHaveBeenCalledWith(ctx);
            expect(refreshSpy).toHaveBeenCalledWith("custom", ctx);
        });

        it("does not throw when registry is missing", async () => {
            const fireSpy = vi.fn(async () => {});
            (globalThis as any).sohl = { events: { fire: fireSpy } };
            (globalThis as any).ActiveEffect = {};
            await expect(
                fireSohlTrigger({ name: "x" } as any),
            ).resolves.not.toThrow();
            expect(fireSpy).toHaveBeenCalled();
        });

        it("does not throw when sohl.events is missing", async () => {
            const refreshSpy = vi.fn(async () => {});
            (globalThis as any).sohl = {};
            (globalThis as any).ActiveEffect = {
                registry: { refresh: refreshSpy },
            };
            await expect(
                fireSohlTrigger({ name: "x" } as any),
            ).resolves.not.toThrow();
            expect(refreshSpy).toHaveBeenCalled();
        });
    });
});
