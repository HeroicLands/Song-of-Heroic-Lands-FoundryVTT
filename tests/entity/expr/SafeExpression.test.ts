import { describe, it, expect } from "vitest";
import {
    SafeExpression,
    SafeExpressionError,
} from "@src/entity/expr/SafeExpression";

// SafeExpression extends SohlEntity, whose constructor requires an owning
// `parent`. Helpers now come from the global registry (built-ins always
// present), so no helper argument is passed at construction.
const mockParent = { id: "test", name: "Test" } as any;

/** Compile + evaluate in one step against the standard helper registry. */
function run(source: string, context?: Record<string, unknown>): unknown {
    return new SafeExpression({ source }, { parent: mockParent }).evaluate(
        context,
    );
}

/** Build a thunk that constructs a SafeExpression (for rejection assertions). */
function compile(source: string): () => SafeExpression {
    return () => new SafeExpression({ source }, { parent: mockParent });
}

describe("SafeExpression", () => {
    describe("literals", () => {
        it("evaluates numbers, strings, booleans, null", () => {
            expect(run("42")).toBe(42);
            expect(run("'hello'")).toBe("hello");
            expect(run("true")).toBe(true);
            expect(run("false")).toBe(false);
            expect(run("null")).toBeNull();
        });

        it("evaluates array literals", () => {
            expect(run("[1, 2, 3]")).toEqual([1, 2, 3]);
            expect(run("[]")).toEqual([]);
            expect(run("[1 + 1, 'a']")).toEqual([2, "a"]);
        });
    });

    describe("operators", () => {
        it("evaluates arithmetic with precedence", () => {
            expect(run("1 + 2")).toBe(3);
            expect(run("10 - 4 * 2")).toBe(2);
            expect(run("8 / 2")).toBe(4);
            expect(run("7 % 3")).toBe(1);
            expect(run("(1 + 2) * 3")).toBe(9);
        });

        it("concatenates strings with +", () => {
            expect(run("'a' + 'b'")).toBe("ab");
        });

        it("evaluates strict equality", () => {
            expect(run("1 === 1")).toBe(true);
            expect(run("1 === 2")).toBe(false);
            expect(run("1 !== 2")).toBe(true);
            expect(run("'x' === 'x'")).toBe(true);
        });

        it("evaluates relational comparisons", () => {
            expect(run("3 > 2")).toBe(true);
            expect(run("3 < 2")).toBe(false);
            expect(run("2 <= 2")).toBe(true);
            expect(run("2 >= 3")).toBe(false);
        });

        it("evaluates logical and unary operators", () => {
            expect(run("true && true")).toBe(true);
            expect(run("true && false")).toBe(false);
            expect(run("false || true")).toBe(true);
            expect(run("!true")).toBe(false);
            expect(run("-5")).toBe(-5);
            expect(run("+'3'")).toBe(3);
        });

        it("evaluates ternary conditionals", () => {
            expect(run("true ? 1 : 2")).toBe(1);
            expect(run("false ? 1 : 2")).toBe(2);
        });
    });

    describe("short-circuit evaluation", () => {
        it("does not evaluate the untaken side of &&", () => {
            expect(run("false && missing")).toBe(false);
        });

        it("does not evaluate the untaken side of ||", () => {
            expect(run("true || missing")).toBe(true);
        });

        it("does not evaluate the untaken ternary branch", () => {
            expect(run("true ? 1 : missing")).toBe(1);
            expect(run("false ? missing : 2")).toBe(2);
        });
    });

    describe("identifiers", () => {
        it("resolves identifiers from the context", () => {
            expect(run("x + 1", { x: 10 })).toBe(11);
            expect(run("a && b", { a: true, b: false })).toBe(false);
        });

        it("throws on an unknown identifier", () => {
            expect(() => run("missing")).toThrow(SafeExpressionError);
        });

        it("rejects referencing a helper without calling it", () => {
            expect(() => run("has")).toThrow(SafeExpressionError);
        });
    });

    describe("member access", () => {
        it("reads dot and bracket properties", () => {
            const ctx = { obj: { a: 5, "weird key": 9 } };
            expect(run("obj.a", ctx)).toBe(5);
            expect(run("obj['a']", ctx)).toBe(5);
            expect(run("obj['weird key']", ctx)).toBe(9);
        });

        it("reads chained properties", () => {
            expect(run("obj.a.b", { obj: { a: { b: 7 } } })).toBe(7);
        });

        it("returns undefined for access on a nullish object", () => {
            expect(run("obj.a.b", { obj: {} })).toBeUndefined();
            expect(run("obj.a", { obj: null })).toBeUndefined();
        });

        it("invokes getters transparently", () => {
            const obj = {
                get computed(): number {
                    return 42;
                },
            };
            expect(run("o.computed", { o: obj })).toBe(42);
        });

        it("rejects reading a method (function-valued property)", () => {
            expect(() => run("o.fn", { o: { fn: () => 1 } })).toThrow(
                SafeExpressionError,
            );
        });

        it("rejects member access on a function", () => {
            expect(() => run("f.name", { f: () => 1 })).toThrow(
                SafeExpressionError,
            );
        });

        it("rejects access to dangerous property names", () => {
            expect(compile("o.constructor")).toThrow(SafeExpressionError);
            expect(compile("o.__proto__")).toThrow(SafeExpressionError);
            expect(compile("o.prototype")).toThrow(SafeExpressionError);
            expect(compile("o['constructor']")).toThrow(SafeExpressionError);
        });
    });

    describe("helper calls", () => {
        it("calls helpers with literal and expression arguments", () => {
            expect(run("has(2, [1, 2, 3])")).toBe(true);
            expect(run("has(9, [1, 2, 3])")).toBe(false);
            expect(run("max(1 + 1, 5, 3)")).toBe(5);
        });

        it("rejects an unknown helper", () => {
            expect(compile("nope(1)")).toThrow(SafeExpressionError);
        });

        it("wraps an error thrown by a helper", () => {
            expect(() => run("matches('x', '[')")).toThrow(SafeExpressionError);
        });
    });

    describe("STANDARD_HELPERS", () => {
        it("has: membership in arrays and objects", () => {
            expect(run("has('per', ['str', 'per'])")).toBe(true);
            expect(run("has('dex', ['str', 'per'])")).toBe(false);
            expect(run("has('a', obj)", { obj: { a: 1 } })).toBe(true);
            expect(run("has('b', obj)", { obj: { a: 1 } })).toBe(false);
            expect(run("has(1, n)", { n: null })).toBe(false);
        });

        it("len and empty", () => {
            expect(run("len([1, 2])")).toBe(2);
            expect(run("len('abc')")).toBe(3);
            expect(run("len(o)", { o: { a: 1, b: 2 } })).toBe(2);
            expect(run("len(n)", { n: null })).toBe(0);
            expect(run("empty([])")).toBe(true);
            expect(run("empty([1])")).toBe(false);
            expect(run("empty('')")).toBe(true);
            expect(run("empty(n)", { n: null })).toBe(true);
        });

        it("string helpers", () => {
            expect(run("lower('AbC')")).toBe("abc");
            expect(run("upper('AbC')")).toBe("ABC");
            expect(run("startsWith('hello', 'he')")).toBe(true);
            expect(run("endsWith('hello', 'lo')")).toBe(true);
            expect(run("contains('hello', 'ell')")).toBe(true);
            expect(run("contains('hello', 'xyz')")).toBe(false);
        });

        it("matches: regex from a string pattern", () => {
            expect(run("matches('hello', '^h')")).toBe(true);
            expect(run("matches('Hello', '^h', 'i')")).toBe(true);
            expect(run("matches('hello', '^z')")).toBe(false);
        });

        it("numeric helpers", () => {
            expect(run("min(3, 1, 2)")).toBe(1);
            expect(run("max(3, 1, 2)")).toBe(3);
            expect(run("round(2.5)")).toBe(3);
            expect(run("floor(2.9)")).toBe(2);
            expect(run("ceil(2.1)")).toBe(3);
            expect(run("abs(-4)")).toBe(4);
        });

        it("type-check helpers", () => {
            expect(run("isNumber(3)")).toBe(true);
            expect(run("isNumber('3')")).toBe(false);
            expect(run("isString('x')")).toBe(true);
            expect(run("isArray([1])")).toBe(true);
            expect(run("isArray('x')")).toBe(false);
            expect(run("defined(1)")).toBe(true);
            expect(run("defined(n)", { n: null })).toBe(false);
            expect(run("defined(o.missing)", { o: {} })).toBe(false);
        });
    });

    describe("rejects unsafe or unsupported syntax", () => {
        it("rejects method calls", () => {
            expect(compile("item.logic.hasAttr('per')")).toThrow(
                SafeExpressionError,
            );
        });

        it("rejects assignment and updates", () => {
            expect(compile("x = 1")).toThrow(SafeExpressionError);
            expect(compile("x += 1")).toThrow(SafeExpressionError);
            expect(compile("x++")).toThrow(SafeExpressionError);
        });

        it("rejects loose equality", () => {
            expect(compile("1 == 1")).toThrow(SafeExpressionError);
            expect(compile("1 != 2")).toThrow(SafeExpressionError);
        });

        it("rejects bitwise operators", () => {
            expect(compile("1 & 2")).toThrow(SafeExpressionError);
            expect(compile("1 | 2")).toThrow(SafeExpressionError);
            expect(compile("1 ^ 2")).toThrow(SafeExpressionError);
            expect(compile("~1")).toThrow(SafeExpressionError);
            expect(compile("1 << 2")).toThrow(SafeExpressionError);
        });

        it("rejects typeof, new, delete, instanceof", () => {
            expect(compile("typeof x")).toThrow(SafeExpressionError);
            expect(compile("new Date()")).toThrow(SafeExpressionError);
            expect(compile("delete x")).toThrow(SafeExpressionError);
            expect(compile("x instanceof Object")).toThrow(SafeExpressionError);
        });

        it("rejects function definitions", () => {
            expect(compile("() => 1")).toThrow(SafeExpressionError);
            expect(compile("function(){}")).toThrow(SafeExpressionError);
        });

        it("rejects this, comma sequences, and template literals", () => {
            expect(compile("this")).toThrow(SafeExpressionError);
            expect(compile("1, 2")).toThrow(SafeExpressionError);
            expect(compile("`abc`")).toThrow(SafeExpressionError);
        });

        it("rejects malformed expressions", () => {
            expect(compile("1 +")).toThrow(SafeExpressionError);
            expect(compile("(((")).toThrow(SafeExpressionError);
        });
    });

    describe("reuse", () => {
        it("compiles once and evaluates against many contexts", () => {
            const expr = new SafeExpression(
                { source: "x * 2" },
                { parent: mockParent },
            );
            expect(expr.source).toBe("x * 2");
            expect(expr.evaluate({ x: 3 })).toBe(6);
            expect(expr.evaluate({ x: 5 })).toBe(10);
        });
    });

    describe("serialization (SohlEntity)", () => {
        it("requires a parent", () => {
            expect(() => new SafeExpression({ source: "1 + 1" }, {})).toThrow(
                /parent/,
            );
        });

        it("toJSON persists only the source (plus the kind tag)", () => {
            const expr = new SafeExpression(
                { source: "level >= 3" },
                { parent: mockParent },
            );
            const json = expr.toJSON() as Record<string, unknown>;
            expect(json.source).toBe("level >= 3");
            expect(json.__kind).toBe("SafeExpression");
            // The AST is never serialized.
            expect(json.ast).toBeUndefined();
        });

        it("round-trips through toJSON and reconstruction", () => {
            const original = new SafeExpression(
                { source: "level >= 3 && !injured" },
                { parent: mockParent },
            );
            const revived = new SafeExpression(
                original.toJSON() as { source: string },
                { parent: mockParent },
            );
            expect(revived.source).toBe(original.source);
            expect(revived.evaluate({ level: 5, injured: false })).toBe(true);
            expect(revived.evaluate({ level: 2, injured: false })).toBe(false);
        });
    });

    describe("compendium 'test' expression", () => {
        const EXPR =
            "(item.type === 'skill' && has('per', item.logic.skillBase.attrShortcodes)) || " +
            "(item.type === 'attribute' && item.system.shortcode === 'per')";

        it("compiles without rejection", () => {
            expect(compile(EXPR)).not.toThrow();
        });

        it("matches perception-based skills", () => {
            const skill = {
                type: "skill",
                system: {},
                logic: { skillBase: { attrShortcodes: ["str", "per"] } },
            };
            expect(run(EXPR, { item: skill })).toBe(true);
        });

        it("does not match skills that do not use perception", () => {
            const skill = {
                type: "skill",
                system: {},
                logic: { skillBase: { attrShortcodes: ["str", "dex"] } },
            };
            expect(run(EXPR, { item: skill })).toBe(false);
        });

        it("matches the perception attribute", () => {
            const attr = { type: "attribute", system: { shortcode: "per" } };
            expect(run(EXPR, { item: attr })).toBe(true);
        });

        it("does not match other attributes or item types", () => {
            const strAttr = {
                type: "attribute",
                system: { shortcode: "str" },
            };
            const gear = { type: "gear", system: {} };
            expect(run(EXPR, { item: strAttr })).toBe(false);
            expect(run(EXPR, { item: gear })).toBe(false);
        });
    });
});
