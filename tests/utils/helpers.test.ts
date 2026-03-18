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
    instanceToJSON,
    serializeFn,
    deserializeFn,
    textToFunction,
    secondaryModifier,
    index,
    defaultToJSON,
    defaultFromJSON,
    sortStrings,
    getStatic,
} from "@src/utils/helpers";

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

describe("instanceToJSON", () => {
    it("includes __kind from constructor", () => {
        class MyClass {
            static kind = "myKind";
            value = 42;
        }
        const instance = new MyClass();
        const json = instanceToJSON(instance);
        expect(json.__kind).toBe("myKind");
        expect(json.value).toBe(42);
    });

    it("strips leading underscores from property names", () => {
        class MyClass {
            static kind = "test";
            _private = "secret";
        }
        const json = instanceToJSON(new MyClass());
        expect(json.private).toBe("secret");
        expect(json._private).toBeUndefined();
    });
});

describe("serializeFn / deserializeFn", () => {
    it("round-trips a simple arrow function", () => {
        const fn = (a: number, b: number) => a + b;
        const serialized = serializeFn(fn);
        expect(serialized).toMatch(/^__func__:/);
        const restored = deserializeFn(serialized);
        expect(restored(2, 3)).toBe(5);
    });

    it("round-trips a function declaration style", () => {
        const fn = function (x: number) {
            return x * 2;
        };
        const serialized = serializeFn(fn);
        const restored = deserializeFn(serialized);
        expect(restored(5)).toBe(10);
    });

    it("deserializeFn throws on invalid format", () => {
        expect(() => deserializeFn("not a function")).toThrow(
            "Invalid serialized function format",
        );
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
