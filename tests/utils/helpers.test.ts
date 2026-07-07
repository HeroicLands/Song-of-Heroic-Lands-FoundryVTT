import {
    romanize,
    maxPrecision,
    createHash16,
    cyrb53,
    hashToId,
    isDocumentId,
    isString,
    isNumber,
    isBoolean,
    isFunction,
    isObject,
    isUndefined,
    isNull,
    isSymbol,
    isBigInt,
    isFilePath,
    combine,
    createUniqueName,
    asyncForEach,
    textToFunction,
    buildActionScope,
    secondaryModifier,
    index,
    defaultToJSON,
    defaultFromJSON,
    cloneInstance,
    setUuidResolver,
    sortStrings,
    getStatic,
} from "@src/utils/helpers";
import { fvttResolveUuid } from "@src/core/FoundryHelpers";
import {
    registerFunc,
    _clearFuncRegistryForTests,
} from "@src/utils/funcRegistry";

describe("romanize", () => {
    it("converts 1 to I", () => {
        expect(romanize(1)).toBe("I");
    });

    it("converts 4 to IV", () => {
        expect(romanize(4)).toBe("IV");
    });

    it("converts 9 to IX", () => {
        expect(romanize(9)).toBe("IX");
    });

    it("converts 14 to XIV", () => {
        expect(romanize(14)).toBe("XIV");
    });

    it("converts 42 to XLII", () => {
        expect(romanize(42)).toBe("XLII");
    });

    it("converts 100 to C", () => {
        expect(romanize(100)).toBe("C");
    });

    it("converts 399 to CCCXCIX", () => {
        expect(romanize(399)).toBe("CCCXCIX");
    });

    it("converts 1000 to M", () => {
        expect(romanize(1000)).toBe("M");
    });

    it("converts 3000 to MMM", () => {
        expect(romanize(3000)).toBe("MMM");
    });

    it("returns NaN for NaN input", () => {
        expect(romanize(NaN)).toBeNaN();
    });

    it("converts 0 to empty string", () => {
        expect(romanize(0)).toBe("");
    });
});

describe("maxPrecision", () => {
    it("rounds to 0 decimal places by default", () => {
        expect(maxPrecision(3.14159)).toBe(3);
    });

    it("rounds to specified precision", () => {
        expect(maxPrecision(3.14159, 2)).toBe(3.14);
    });

    it("does not add trailing zeros for lower precision values", () => {
        expect(maxPrecision(3, 2)).toBe(3);
    });

    it("handles negative numbers", () => {
        expect(maxPrecision(-2.567, 1)).toBe(-2.6);
    });

    it("handles zero", () => {
        expect(maxPrecision(0, 5)).toBe(0);
    });
});

describe("createHash16", () => {
    it("returns a 16-character string", () => {
        expect(createHash16("test")).toHaveLength(16);
    });

    it("is deterministic (same input gives same output)", () => {
        expect(createHash16("hello")).toBe(createHash16("hello"));
    });

    it("produces different output for different inputs", () => {
        expect(createHash16("abc")).not.toBe(createHash16("xyz"));
    });

    it("handles empty string", () => {
        const result = createHash16("");
        expect(result).toHaveLength(16);
    });
});

describe("cyrb53", () => {
    it("returns a number", () => {
        expect(typeof cyrb53("test")).toBe("number");
    });

    it("is deterministic", () => {
        expect(cyrb53("hello")).toBe(cyrb53("hello"));
    });

    it("produces different outputs for different inputs", () => {
        expect(cyrb53("abc")).not.toBe(cyrb53("xyz"));
    });

    it("respects seed parameter", () => {
        expect(cyrb53("test", 1)).not.toBe(cyrb53("test", 2));
    });

    it("uses default seed of 0", () => {
        expect(cyrb53("test")).toBe(cyrb53("test", 0));
    });
});

describe("hashToId", () => {
    it("returns a 16-character string", () => {
        expect(hashToId("test-input")).toHaveLength(16);
    });

    it("is deterministic", () => {
        expect(hashToId("my-item")).toBe(hashToId("my-item"));
    });

    it("produces different output for different inputs", () => {
        expect(hashToId("foo")).not.toBe(hashToId("bar"));
    });

    it("only uses alphanumeric characters", () => {
        const result = hashToId("anything");
        expect(result).toMatch(/^[A-Za-z0-9]{16}$/);
    });
});

describe("isDocumentId", () => {
    it("returns true for valid 16-char alphanumeric string", () => {
        expect(isDocumentId("abcdefgh12345678")).toBe(true);
    });

    it("returns true for all uppercase", () => {
        expect(isDocumentId("ABCDEFGHIJKLMNOP")).toBe(true);
    });

    it("returns false for too short", () => {
        expect(isDocumentId("abc123")).toBe(false);
    });

    it("returns false for too long", () => {
        expect(isDocumentId("abcdefgh123456789")).toBe(false);
    });

    it("returns false for non-alphanumeric characters", () => {
        expect(isDocumentId("abcdefgh1234567!")).toBe(false);
    });

    it("returns false for non-string", () => {
        expect(isDocumentId(12345)).toBe(false);
    });

    it("returns false for null", () => {
        expect(isDocumentId(null)).toBe(false);
    });
});

describe("isString", () => {
    it("returns true for strings", () => {
        expect(isString("hello")).toBe(true);
        expect(isString("")).toBe(true);
    });

    it("returns false for non-strings", () => {
        expect(isString(123)).toBe(false);
        expect(isString(null)).toBe(false);
        expect(isString(undefined)).toBe(false);
    });
});

describe("isNumber", () => {
    it("returns true for numbers", () => {
        expect(isNumber(42)).toBe(true);
        expect(isNumber(0)).toBe(true);
        expect(isNumber(-1.5)).toBe(true);
    });

    it("returns false for NaN", () => {
        expect(isNumber(NaN)).toBe(false);
    });

    it("returns false for non-numbers", () => {
        expect(isNumber("42")).toBe(false);
        expect(isNumber(null)).toBe(false);
    });
});

describe("isBoolean", () => {
    it("returns true for booleans", () => {
        expect(isBoolean(true)).toBe(true);
        expect(isBoolean(false)).toBe(true);
    });

    it("returns false for non-booleans", () => {
        expect(isBoolean(0)).toBe(false);
        expect(isBoolean("true")).toBe(false);
    });
});

describe("isFunction", () => {
    it("returns true for functions", () => {
        expect(isFunction(() => {})).toBe(true);
        expect(isFunction(function () {})).toBe(true);
    });

    it("returns false for non-functions", () => {
        expect(isFunction("function")).toBe(false);
        expect(isFunction(null)).toBe(false);
    });
});

describe("isObject", () => {
    it("returns true for objects", () => {
        expect(isObject({})).toBe(true);
        expect(isObject([])).toBe(true);
        expect(isObject(new Date())).toBe(true);
    });

    it("returns false for null", () => {
        expect(isObject(null)).toBe(false);
    });

    it("returns false for primitives", () => {
        expect(isObject("string")).toBe(false);
        expect(isObject(42)).toBe(false);
    });
});

describe("isUndefined", () => {
    it("returns true for undefined", () => {
        expect(isUndefined(undefined)).toBe(true);
    });

    it("returns false for null and other values", () => {
        expect(isUndefined(null)).toBe(false);
        expect(isUndefined(0)).toBe(false);
    });
});

describe("isNull", () => {
    it("returns true for null", () => {
        expect(isNull(null)).toBe(true);
    });

    it("returns false for undefined and other values", () => {
        expect(isNull(undefined)).toBe(false);
        expect(isNull(0)).toBe(false);
    });
});

describe("isSymbol", () => {
    it("returns true for symbols", () => {
        expect(isSymbol(Symbol())).toBe(true);
        expect(isSymbol(Symbol("test"))).toBe(true);
    });

    it("returns false for non-symbols", () => {
        expect(isSymbol("symbol")).toBe(false);
    });
});

describe("isBigInt", () => {
    it("returns true for bigints", () => {
        expect(isBigInt(BigInt(42))).toBe(true);
        expect(isBigInt(0n)).toBe(true);
    });

    it("returns false for numbers", () => {
        expect(isBigInt(42)).toBe(false);
    });
});

describe("isFilePath", () => {
    it("returns true for Unix paths", () => {
        expect(isFilePath("/usr/local/bin")).toBe(true);
    });

    it("returns true for relative-style paths", () => {
        expect(isFilePath("some/path/file.txt")).toBe(true);
    });

    it("returns true for file:// URLs", () => {
        expect(isFilePath("file:///home/user/file.txt")).toBe(true);
    });

    it("returns false for paths with invalid characters", () => {
        expect(isFilePath("path\nwith\nnewlines")).toBe(false);
    });
});

describe("sortStrings", () => {
    it("sorts strings alphabetically", () => {
        const result = sortStrings("banana", "apple", "cherry");
        expect(result).toEqual(["apple", "banana", "cherry"]);
    });

    it("handles empty input", () => {
        const result = sortStrings();
        expect(result).toEqual([]);
    });

    it("handles single element", () => {
        const result = sortStrings("only");
        expect(result).toEqual(["only"]);
    });
});

describe("combine", () => {
    it("combines multiple iterables", () => {
        const result = Array.from(combine([1, 2], [3, 4], [5]));
        expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it("handles empty iterables", () => {
        const result = Array.from(combine([], [1], []));
        expect(result).toEqual([1]);
    });

    it("handles no arguments", () => {
        const result = Array.from(combine());
        expect(result).toEqual([]);
    });
});

describe("createUniqueName", () => {
    it("returns base name when no siblings", () => {
        const siblings = new Map<string, { name: string }>();
        expect(createUniqueName("Item", siblings)).toBe("Item");
    });

    it("appends index when name is taken", () => {
        const siblings = new Map<string, { name: string }>([
            ["1", { name: "Item" }],
        ]);
        expect(createUniqueName("Item", siblings)).toBe("Item (2)");
    });

    it("increments index for multiple conflicts", () => {
        const siblings = new Map<string, { name: string }>([
            ["1", { name: "Item" }],
            ["2", { name: "Item (2)" }],
        ]);
        expect(createUniqueName("Item", siblings)).toBe("Item (3)");
    });

    it("throws on empty baseName", () => {
        expect(() => createUniqueName("", new Map())).toThrow(
            "Must provide baseName",
        );
    });
});

describe("asyncForEach", () => {
    it("iterates over all items", async () => {
        const results: number[] = [];
        await asyncForEach([1, 2, 3], async (item) => {
            results.push(item * 2);
        });
        expect(results).toEqual([2, 4, 6]);
    });

    it("provides correct index", async () => {
        const indices: number[] = [];
        await asyncForEach(["a", "b"], async (_item, index) => {
            indices.push(index);
        });
        expect(indices).toEqual([0, 1]);
    });

    it("handles empty array", async () => {
        const results: unknown[] = [];
        await asyncForEach([], async (item) => {
            results.push(item);
        });
        expect(results).toEqual([]);
    });
});

describe("textToFunction", () => {
    it("creates a function from a simple expression", () => {
        const fn = textToFunction("a + b", ["a", "b"]) as Function;
        expect(fn(2, 3)).toBe(5);
    });

    it("creates a function from a block with return", () => {
        const fn = textToFunction("return a * 2;", ["a"]) as Function;
        expect(fn(5)).toBe(10);
    });

    it("throws on disallowed keywords", () => {
        expect(() => textToFunction("eval('bad')", [])).toThrow(
            /Disallowed keyword/,
        );
    });

    it("throws on window access", () => {
        expect(() => textToFunction("window.location", [])).toThrow(
            /Disallowed keyword/,
        );
    });

    it("blocks the Function-constructor escape via .constructor", () => {
        expect(() =>
            textToFunction("({}).constructor.constructor('x')", []),
        ).toThrow(/Disallowed pattern/);
    });

    it('blocks the Function-constructor escape via ["constructor"]', () => {
        expect(() => textToFunction('({})["constructor"]("x")', [])).toThrow(
            /Disallowed pattern/,
        );
    });

    it("blocks __proto__ chain access", () => {
        expect(() => textToFunction("({}).__proto__", [])).toThrow(
            /Disallowed pattern/,
        );
        expect(() => textToFunction('({})["__proto__"]', [])).toThrow(
            /Disallowed pattern/,
        );
    });

    it("blocks new Function regardless of whitespace between tokens", () => {
        // Caught by the `Function` keyword scan, which is whitespace-agnostic.
        expect(() => textToFunction("new   Function('x')", [])).toThrow(
            /Disallowed/,
        );
        expect(() => textToFunction("new\tFunction('x')", [])).toThrow(
            /Disallowed/,
        );
    });

    it("blocks additional dangerous globals", () => {
        for (const keyword of [
            "process",
            "Reflect",
            "Proxy",
            "navigator",
            "location",
            "localStorage",
        ]) {
            expect(() => textToFunction(`${keyword}.foo`, [])).toThrow(
                /Disallowed keyword/,
            );
        }
    });

    it("does not false-positive on flagged words inside strings", () => {
        const fn = textToFunction('return "window-shopping";', []) as Function;
        expect(fn()).toBe("window-shopping");
    });

    it("does not false-positive on flagged words inside comments", () => {
        const fn = textToFunction(
            "// uses fetch internally\nreturn 1;",
            [],
        ) as Function;
        expect(fn()).toBe(1);
    });

    it("rejects non-identifier parameter names", () => {
        expect(() => textToFunction("return x;", ["x = sideEffect()"])).toThrow(
            /Invalid parameter name/,
        );
        expect(() => textToFunction("return 1;", ["a, b"])).toThrow(
            /Invalid parameter name/,
        );
        expect(() => textToFunction("return 1;", ["1abc"])).toThrow(
            /Invalid parameter name/,
        );
    });

    it("does not mutate the caller-supplied args array", () => {
        const args = ["a", "b"];
        textToFunction("a + b", args);
        expect(args).toEqual(["a", "b"]);
    });
});

describe("secondaryModifier", () => {
    it("returns -25 for index <= 0", () => {
        expect(secondaryModifier(0)).toBe(-25);
        expect(secondaryModifier(-1)).toBe(-25);
    });

    it("returns (index - 5) * 5 for positive index", () => {
        expect(secondaryModifier(5)).toBe(0);
        expect(secondaryModifier(10)).toBe(25);
        expect(secondaryModifier(1)).toBe(-20);
    });

    it("truncates fractional index", () => {
        expect(secondaryModifier(5.9)).toBe(0);
    });
});

describe("index", () => {
    it("returns 0 for value <= 0", () => {
        expect(index(0)).toBe(0);
        expect(index(-5)).toBe(0);
    });

    it("returns floor(value / 10) for positive values", () => {
        expect(index(10)).toBe(1);
        expect(index(25)).toBe(2);
        expect(index(99)).toBe(9);
    });

    it("returns 0 for values under 10", () => {
        expect(index(5)).toBe(0);
        expect(index(9)).toBe(0);
    });
});

describe("defaultToJSON / defaultFromJSON", () => {
    it("round-trips null", () => {
        expect(defaultFromJSON(defaultToJSON(null))).toBeNull();
    });

    it("round-trips strings", () => {
        expect(defaultFromJSON(defaultToJSON("hello"))).toBe("hello");
    });

    it("round-trips numbers", () => {
        expect(defaultFromJSON(defaultToJSON(42))).toBe(42);
    });

    it("round-trips booleans", () => {
        expect(defaultFromJSON(defaultToJSON(true))).toBe(true);
    });

    it("round-trips BigInt", () => {
        const serialized = defaultToJSON(BigInt(12345));
        expect(serialized).toBe("__bigint__:12345");
        const restored = defaultFromJSON(serialized);
        expect(restored).toBe(BigInt(12345));
    });

    it("round-trips Date", () => {
        const date = new Date("2024-01-15T00:00:00.000Z");
        const serialized = defaultToJSON(date);
        expect(typeof serialized).toBe("string");
        const restored = defaultFromJSON(serialized);
        expect(restored).toBeInstanceOf(Date);
        expect((restored as Date).toISOString()).toBe(date.toISOString());
    });

    it("round-trips Map", () => {
        const map = new Map([
            ["a", 1],
            ["b", 2],
        ]);
        const serialized = defaultToJSON(map);
        const restored = defaultFromJSON(serialized);
        expect(restored).toBeInstanceOf(Map);
        expect((restored as Map<string, number>).get("a")).toBe(1);
        expect((restored as Map<string, number>).get("b")).toBe(2);
    });

    it("round-trips Set", () => {
        const set = new Set([1, 2, 3]);
        const serialized = defaultToJSON(set);
        const restored = defaultFromJSON(serialized);
        expect(restored).toBeInstanceOf(Set);
        expect((restored as Set<number>).has(1)).toBe(true);
        expect((restored as Set<number>).has(3)).toBe(true);
    });

    it("round-trips RegExp", () => {
        const regex = /test/gi;
        const serialized = defaultToJSON(regex);
        const restored = defaultFromJSON(serialized);
        expect(restored).toBeInstanceOf(RegExp);
        expect((restored as RegExp).source).toBe("test");
        expect((restored as RegExp).flags).toBe("gi");
    });

    it("round-trips plain objects", () => {
        const obj = { a: 1, b: "hello" };
        const serialized = defaultToJSON(obj);
        const restored = defaultFromJSON(serialized);
        expect(restored).toEqual({ a: 1, b: "hello" });
    });

    it("round-trips arrays", () => {
        const arr = [1, "two", true];
        const serialized = defaultToJSON(arr);
        const restored = defaultFromJSON(serialized);
        expect(restored).toEqual([1, "two", true]);
    });

    it("returns undefined for functions", () => {
        expect(defaultToJSON(() => {})).toBeUndefined();
    });

    it("returns undefined for symbols", () => {
        expect(defaultToJSON(Symbol())).toBeUndefined();
    });

    it("returns undefined for undefined", () => {
        expect(defaultToJSON(undefined)).toBeUndefined();
    });

    it("converts undefined fields to null when delegating to a custom toJSON", () => {
        const obj = { toJSON: () => ({ a: 1, b: undefined }) };
        expect(defaultToJSON(obj)).toEqual({ a: 1, b: null });
    });

    it("deeply converts undefined to null within a custom toJSON result", () => {
        const obj = {
            toJSON: () => ({ nested: { x: undefined }, list: [undefined, 2] }),
        };
        expect(defaultToJSON(obj)).toEqual({
            nested: { x: null },
            list: [null, 2],
        });
    });

    it("leaves a custom toJSON's null and defined values intact", () => {
        const obj = { toJSON: () => ({ a: null, b: "x", c: 0 }) };
        expect(defaultToJSON(obj)).toEqual({ a: null, b: "x", c: 0 });
    });
});

describe("getStatic", () => {
    it("retrieves a static property from an instance", () => {
        class MyClass {
            static myProp = "value";
        }
        const inst = new MyClass();
        expect(getStatic(inst, "myProp")).toBe("value");
    });

    it("retrieves inherited static properties", () => {
        class Parent {
            static parentProp = "parent";
        }
        class Child extends Parent {}
        const inst = new Child();
        expect(getStatic(inst, "parentProp")).toBe("parent");
    });

    it("throws for non-existent static property", () => {
        class MyClass {}
        const inst = new MyClass();
        expect(() => getStatic(inst, "nope")).toThrow(
            'Static property "nope" not found',
        );
    });
});

describe("cloneInstance (pure deep-merge of overrides)", () => {
    it("returns a deep copy, not the same reference", () => {
        const original = { a: 1, nested: { x: 1 } };
        const copy = cloneInstance<typeof original>(original);
        expect(copy).toEqual(original);
        expect(copy).not.toBe(original);
        expect(copy.nested).not.toBe(original.nested);
    });

    it("applies top-level field overrides", () => {
        const original = { a: 1, b: 2 };
        const copy = cloneInstance<typeof original>(original, { b: 99 });
        expect(copy).toEqual({ a: 1, b: 99 });
    });

    it("inserts keys absent from the source", () => {
        const original: Record<string, number> = { a: 1 };
        const copy = cloneInstance<Record<string, number>>(original, { c: 3 });
        expect(copy).toEqual({ a: 1, c: 3 });
    });

    it("recursively merges nested plain objects (Foundry mergeObject semantics)", () => {
        const original = { pos: { x: 1, y: 2 } };
        const copy = cloneInstance<typeof original>(original, {
            pos: { y: 3, z: 4 } as any,
        });
        // Deep merge keeps x, overrides y, and inserts z.
        expect(copy).toEqual({ pos: { x: 1, y: 3, z: 4 } });
    });

    it("replaces arrays wholesale rather than merging them", () => {
        const original = { tags: [1, 2, 3] };
        const copy = cloneInstance<typeof original>(original, {
            tags: [9] as any,
        });
        expect(copy).toEqual({ tags: [9] });
    });
});

describe("defaultFromJSON — ClientDocument revival via registered resolver", () => {
    afterEach(() => {
        // Restore the default (mock) resolver so later tests are unaffected.
        setUuidResolver(fvttResolveUuid);
    });

    it("resolves a ClientDocument reference through the registered resolver", () => {
        setUuidResolver((uuid) => ({ __resolved: uuid }));
        const revived = defaultFromJSON({
            __type: "ClientDocument",
            uuid: "Actor.abc123",
        });
        expect(revived).toEqual({ __resolved: "Actor.abc123" });
    });

    it("revives nested ClientDocument references inside objects and arrays", () => {
        setUuidResolver((uuid) => `doc:${uuid}`);
        const revived = defaultFromJSON({
            single: { __type: "ClientDocument", uuid: "Item.x" },
            many: [{ __type: "ClientDocument", uuid: "Item.y" }, "plain"],
        });
        expect(revived).toEqual({
            single: "doc:Item.x",
            many: ["doc:Item.y", "plain"],
        });
    });

    it("throws a clear error when no resolver is registered", () => {
        setUuidResolver(undefined);
        expect(() =>
            defaultFromJSON({ __type: "ClientDocument", uuid: "Actor.z" }),
        ).toThrow(/resolver/i);
    });
});

describe("defaultToJSON / defaultFromJSON — funcref", () => {
    beforeEach(() => {
        _clearFuncRegistryForTests();
    });

    it("serializes a registered function to its __funcref__ id", () => {
        const fn = (n: number) => n + 1;
        registerFunc("test.increment", fn);
        expect(defaultToJSON(fn)).toBe("__funcref__:test.increment");
    });

    it("revives a __funcref__ id back to the identical function", () => {
        const fn = (n: number) => n + 1;
        registerFunc("test.increment", fn);
        const restored = defaultFromJSON(defaultToJSON(fn));
        expect(restored).toBe(fn);
        expect((restored as (n: number) => number)(41)).toBe(42);
    });

    it("round-trips a registered function nested in an object and array", () => {
        const fn = () => "hi";
        registerFunc("test.greet", fn);
        const serialized = defaultToJSON({ cb: fn, list: [fn] });
        // JSON-safe: survives an actual stringify/parse boundary
        const revived = defaultFromJSON(
            JSON.parse(JSON.stringify(serialized)),
        ) as { cb: unknown; list: unknown[] };
        expect(revived.cb).toBe(fn);
        expect(revived.list[0]).toBe(fn);
    });

    it("still drops an UNregistered function to undefined (unchanged behavior)", () => {
        expect(defaultToJSON(() => {})).toBeUndefined();
        expect(defaultToJSON({ cb: () => {}, keep: 1 })).toEqual({ keep: 1 });
    });

    it("revives an unknown __funcref__ id to undefined without throwing", () => {
        expect(defaultFromJSON("__funcref__:no.such.func")).toBeUndefined();
    });

    it("revives a bare __funcref__: (empty id) to undefined", () => {
        expect(defaultFromJSON("__funcref__:")).toBeUndefined();
    });
});

describe("defaultFromJSON — legacy __func__ code payload is inert (no RCE)", () => {
    it("never compiles a __func__ string; returns it as an inert string", () => {
        (globalThis as Record<string, unknown>).PWNED = undefined;
        const payload = "__func__:[]globalThis.PWNED=1;return 1";
        const revived = defaultFromJSON(payload);
        // No deserializeFn / new Function path remains: the string is returned
        // verbatim, never turned into a callable.
        expect(typeof revived).not.toBe("function");
        expect(revived).toBe(payload);
        expect((globalThis as Record<string, unknown>).PWNED).toBeUndefined();
    });

    it("does not revive a __func__ string nested in an object", () => {
        const revived = defaultFromJSON({
            cb: "__func__:[]return 1",
        }) as Record<string, unknown>;
        expect(typeof revived.cb).not.toBe("function");
        expect(revived.cb).toBe("__func__:[]return 1");
    });
});

describe("buildActionScope — rejects legacy code payloads", () => {
    it("throws when the scope JSON contains a __func__ marker", () => {
        const dataset = {
            scope: JSON.stringify({ cb: "__func__:[]return 1" }),
        } as unknown as DOMStringMap;
        expect(() => buildActionScope(dataset, undefined)).toThrow(
            /legacy code marker/i,
        );
    });

    it("revives a normal scope payload unchanged", () => {
        const dataset = {
            scope: JSON.stringify({ a: 1, b: "two" }),
        } as unknown as DOMStringMap;
        expect(buildActionScope(dataset, undefined)).toEqual({
            a: 1,
            b: "two",
        });
    });

    it("returns an empty object when no scope is present", () => {
        expect(buildActionScope({} as DOMStringMap, undefined)).toEqual({});
    });
});

describe("defaultToJSON / defaultFromJSON — funcref adversarial", () => {
    beforeEach(() => {
        _clearFuncRegistryForTests();
    });

    it("NEVER emits executable source — output is a funcref tag or dropped", () => {
        // A registered function serializes only to its reference tag; the tag
        // must not contain the function body.
        const fn = () => {
            return "secret-body-marker";
        };
        registerFunc("test.marker", fn);
        const out = defaultToJSON(fn);
        expect(out).toBe("__funcref__:test.marker");
        expect(String(out)).not.toContain("secret-body-marker");
        expect(String(out)).not.toContain("=>");
        expect(String(out)).not.toContain("function");
    });

    it("does not compile a __funcref__ payload — an unknown id never yields a function", () => {
        const revived = defaultFromJSON(
            "__funcref__:[]return globalThis.EVIL=1",
        );
        expect(typeof revived).not.toBe("function");
        expect(revived).toBeUndefined();
        expect((globalThis as Record<string, unknown>).EVIL).toBeUndefined();
    });

    it("resists hostile prototype-chain ids in a __funcref__ payload", () => {
        for (const id of [
            "__proto__",
            "constructor",
            "prototype",
            "toString",
        ]) {
            expect(defaultFromJSON(`__funcref__:${id}`)).toBeUndefined();
        }
    });

    it("only SELECTS an already-registered function, never introduces one", () => {
        const allowed = () => "allowed";
        registerFunc("test.allowed", allowed);
        // Attacker-supplied scope can reference the registered id (selection)…
        expect(defaultFromJSON("__funcref__:test.allowed")).toBe(allowed);
        // …but any id the system did not register resolves to nothing.
        expect(defaultFromJSON("__funcref__:test.attacker")).toBeUndefined();
    });

    it("resolves an unknown __funcref__ id to undefined without throwing", () => {
        expect(() =>
            defaultFromJSON("__funcref__:definitely-not-registered"),
        ).not.toThrow();
        expect(
            defaultFromJSON("__funcref__:definitely-not-registered"),
        ).toBeUndefined();
    });

    it("bounds and de-control-chars the unknown-id warning (no log flood/injection)", () => {
        const warn = vi
            .spyOn(console, "warn")
            .mockImplementation(() => undefined);
        try {
            const hostileId = "a".repeat(500) + "\n[fake] injected line";
            expect(defaultFromJSON(`__funcref__:${hostileId}`)).toBeUndefined();
            expect(warn).toHaveBeenCalledTimes(1);
            const logged = String(warn.mock.calls[0][0]);
            expect(logged).not.toContain("\n");
            // The interpolated id portion is capped (64 chars), so the crafted
            // 500-char payload cannot bloat the log line.
            expect(logged).not.toContain("a".repeat(65));
        } finally {
            warn.mockRestore();
        }
    });
});
