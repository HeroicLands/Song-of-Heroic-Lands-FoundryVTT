/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { entitySurface } from "@src/entity/surface";

// The `document`/`core`/`apps` barrels pull in Foundry-coupled base classes
// (DataModels, sheets) that only exist under a live Foundry runtime, so their
// resolution is exercised by the bundle build, not this unit test. The entity
// tree is Foundry-free, so it validates the merge and the `export * as` barrel
// mechanism here.
describe("sohl namespace surface (#403)", () => {
    describe("entity: class registry merged with sub-namespaces", () => {
        it("keeps the flat, override-aware class getters + register/base", () => {
            expect(typeof entitySurface.ValueModifier).toBe("function");
            expect(typeof entitySurface.SuccessTestResult).toBe("function");
            expect(typeof entitySurface.register).toBe("function");
            expect(typeof entitySurface.base).toBe("function");
        });

        it("adds the sub-namespaces — the same class as the flat getter by default", () => {
            expect(entitySurface.modifier.ValueModifier).toBe(
                entitySurface.ValueModifier,
            );
            expect(entitySurface.result.SuccessTestResult).toBe(
                entitySurface.SuccessTestResult,
            );
            expect(entitySurface.strikemode.MeleeStrikeMode).toBeTypeOf(
                "function",
            );
        });

        it("the flat getters and lowercase namespaces do not collide", () => {
            // PascalCase class + lowercase namespace coexist as distinct props.
            expect(entitySurface.modifier).not.toBe(
                entitySurface.ValueModifier,
            );
        });

        it("resolves a nested addressing path (entity.body.BodyStructure)", () => {
            expect(entitySurface.body.BodyStructure).toBeTypeOf("function");
        });
    });
});
