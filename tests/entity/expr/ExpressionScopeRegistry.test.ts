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

import { describe, it, expect, vi, afterEach } from "vitest";
import {
    expressionScopes,
    ExpressionScope,
} from "@src/entity/expr/ExpressionScopeRegistry";
import { EXPRESSION_SCOPES } from "@src/entity/expr/expression-scopes.mjs";

afterEach(() => vi.restoreAllMocks());

describe("expressionScopes", () => {
    it("wraps every catalog entry, in catalog order", () => {
        expect(expressionScopes.ids()).toEqual(Object.keys(EXPRESSION_SCOPES));
        for (const scope of expressionScopes.all()) {
            expect(scope).toBeInstanceOf(ExpressionScope);
        }
    });

    it("resolves a scope by id and reports unknown ids as undefined", () => {
        expect(expressionScopes.get("skill.base")?.id).toBe("skill.base");
        expect(expressionScopes.get("no.such.scope")).toBeUndefined();
        expect(expressionScopes.get(null)).toBeUndefined();
        expect(expressionScopes.get(undefined)).toBeUndefined();
        expect(expressionScopes.has("skill.base")).toBe(true);
        expect(expressionScopes.has("no.such.scope")).toBe(false);
    });

    it("require() throws on an unknown id, naming where to declare it", () => {
        expect(() => expressionScopes.require("no.such.scope")).toThrow(
            /Unknown expression scope "no\.such\.scope".*expression-scopes\.mjs/s,
        );
        expect(expressionScopes.require("skill.base").id).toBe("skill.base");
    });

    it("every declared binding carries a non-empty description", () => {
        for (const scope of expressionScopes.all()) {
            for (const name of scope.names) {
                expect(
                    scope.describe(name),
                    `${scope.id}.${name} needs a description`,
                ).toBeTruthy();
            }
        }
    });

    it("every scope declares its documentation metadata", () => {
        for (const scope of expressionScopes.all()) {
            for (const field of [
                "label",
                "site",
                "field",
                "result",
                "summary",
            ] as const) {
                expect(scope[field], `${scope.id}.${field}`).toBeTruthy();
            }
        }
    });
});

describe("ExpressionScope", () => {
    const closed = expressionScopes.require("action.visible");
    const open = expressionScopes.require("event.predicate");
    const empty = expressionScopes.require("affliction.outcomeTrauma");

    it("reports its declared identifiers", () => {
        expect(closed.names).toContain("itemLogic");
        expect(closed.has("itemLogic")).toBe(true);
        expect(closed.has("nonesuch")).toBe(false);
        expect(closed.describe("isGM")).toMatch(/GM/);
        expect(closed.describe("nonesuch")).toBeUndefined();
    });

    it("a closed scope allows only its declared identifiers", () => {
        expect(closed.open).toBe(false);
        expect(closed.allows("itemLogic")).toBe(true);
        expect(closed.allows("nonesuch")).toBe(false);
    });

    it("an open scope allows undeclared identifiers but still describes its own", () => {
        expect(open.open).toBe(true);
        expect(open.allows("someCustomTriggerKey")).toBe(true);
        expect(open.has("someCustomTriggerKey")).toBe(false);
        expect(open.names).toContain("subscriberUuid");
    });

    it("a scope may declare no identifiers at all", () => {
        expect(empty.names).toEqual([]);
        expect(empty.allows("anything")).toBe(false);
    });

    describe("bind()", () => {
        it("passes a matching context through unchanged and logs nothing", () => {
            const warn = vi
                .spyOn(sohl.log, "warn")
                .mockImplementation(() => {});
            const context = {
                element: null,
                itemLogic: undefined,
                actorLogic: undefined,
                isGM: false,
            };
            expect(closed.bind(context)).toBe(context);
            expect(warn).not.toHaveBeenCalled();
        });

        it("warns when the call site drops a declared binding", () => {
            const warn = vi
                .spyOn(sohl.log, "warn")
                .mockImplementation(() => {});
            // A fresh scope instance — the real registry entries dedupe warnings
            // process-wide, which would make this order-dependent.
            const scope = new ExpressionScope("test.scope", {
                label: "T",
                site: "s",
                field: "f",
                result: "boolean",
                summary: "x",
                bindings: { a: "A", b: "B" },
            });
            scope.bind({ a: 1 });
            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn.mock.calls[0][1]).toMatchObject({
                missing: ["b"],
                undeclared: [],
            });
        });

        it("warns when the call site supplies an undeclared binding", () => {
            const warn = vi
                .spyOn(sohl.log, "warn")
                .mockImplementation(() => {});
            const scope = new ExpressionScope("test.scope", {
                label: "T",
                site: "s",
                field: "f",
                result: "boolean",
                summary: "x",
                bindings: { a: "A" },
            });
            scope.bind({ a: 1, sneaky: 2 });
            expect(warn.mock.calls[0][1]).toMatchObject({
                missing: [],
                undeclared: ["sneaky"],
            });
        });

        it("warns once per distinct mismatch, not once per evaluation", () => {
            const warn = vi
                .spyOn(sohl.log, "warn")
                .mockImplementation(() => {});
            const scope = new ExpressionScope("test.scope", {
                label: "T",
                site: "s",
                field: "f",
                result: "boolean",
                summary: "x",
                bindings: { a: "A", b: "B" },
            });
            scope.bind({ a: 1 });
            scope.bind({ a: 2 });
            scope.bind({ a: 3 });
            expect(warn).toHaveBeenCalledTimes(1);
        });

        it("never throws — a binding bug must not take the sheet down", () => {
            const scope = new ExpressionScope("test.scope", {
                label: "T",
                site: "s",
                field: "f",
                result: "boolean",
                summary: "x",
                bindings: { a: "A" },
            });
            vi.spyOn(sohl.log, "warn").mockImplementation(() => {});
            expect(() => scope.bind({})).not.toThrow();
            expect(scope.bind({ a: 1 })).toEqual({ a: 1 });
        });

        it("passes an open scope's context straight through", () => {
            const warn = vi
                .spyOn(sohl.log, "warn")
                .mockImplementation(() => {});
            const context = { name: "customTrigger", whateverElse: 1 };
            expect(open.bind(context)).toBe(context);
            expect(warn).not.toHaveBeenCalled();
        });

        it("treats an explicitly undefined binding as supplied, not missing", () => {
            const warn = vi
                .spyOn(sohl.log, "warn")
                .mockImplementation(() => {});
            // `itemLogic: undefined` is an absent *value*, which is legitimate —
            // it must not read as an unbound identifier.
            closed.bind({
                element: null,
                itemLogic: undefined,
                actorLogic: undefined,
                isGM: true,
            });
            expect(warn).not.toHaveBeenCalled();
        });
    });
});
