import { SohlMap } from "@src/utils/collection/SohlMap";

describe("SohlMap", () => {
    describe("basic operations", () => {
        it("starts empty", () => {
            const map = new SohlMap<string, number>();
            expect(map.size()).toBe(0);
        });

        it("can be constructed with entries", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", 2],
            ]);
            expect(map.size()).toBe(2);
            expect(map.get("a")).toBe(1);
            expect(map.get("b")).toBe(2);
        });

        it("set and get", () => {
            const map = new SohlMap<string, number>();
            map.set("key", 42);
            expect(map.get("key")).toBe(42);
        });

        it("set returns this for chaining", () => {
            const map = new SohlMap<string, number>();
            const result = map.set("a", 1);
            expect(result).toBe(map);
        });

        it("has returns true for existing keys", () => {
            const map = new SohlMap<string, number>([["x", 10]]);
            expect(map.has("x")).toBe(true);
            expect(map.has("y" as any)).toBe(false);
        });

        it("delete removes entry and returns true", () => {
            const map = new SohlMap<string, number>([["a", 1]]);
            expect(map.delete("a")).toBe(true);
            expect(map.has("a")).toBe(false);
            expect(map.size()).toBe(0);
        });

        it("delete returns false for non-existent key", () => {
            const map = new SohlMap<string, number>();
            expect(map.delete("nope")).toBe(false);
        });

        it("clear removes all entries", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", 2],
            ]);
            map.clear();
            expect(map.size()).toBe(0);
        });

        it("get returns undefined for missing keys", () => {
            const map = new SohlMap<string, number>();
            expect(map.get("missing")).toBeUndefined();
        });
    });

    describe("iteration", () => {
        it("keys returns all keys", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", 2],
            ]);
            expect(map.keys().toArray()).toEqual(["a", "b"]);
        });

        it("values returns all values", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", 2],
            ]);
            expect(map.values().toArray()).toEqual([1, 2]);
        });

        it("entries returns key-value pairs", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", 2],
            ]);
            expect(map.entries().toArray()).toEqual([
                ["a", 1],
                ["b", 2],
            ]);
        });

        it("supports for...of via Symbol.iterator", () => {
            const map = new SohlMap<string, number>([
                ["x", 10],
                ["y", 20],
            ]);
            const collected: [string, number][] = [];
            for (const entry of map) {
                collected.push(entry);
            }
            expect(collected).toEqual([
                ["x", 10],
                ["y", 20],
            ]);
        });
    });

    describe("functional methods", () => {
        it("forEach iterates all entries", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", 2],
            ]);
            const collected: [string, number][] = [];
            map.forEach((value, key) => {
                collected.push([key, value]);
            });
            expect(collected).toEqual([
                ["a", 1],
                ["b", 2],
            ]);
        });

        it("filter returns matching values", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", 2],
                ["c", 3],
            ]);
            const result = map.filter((v) => v > 1);
            expect(result).toEqual([2, 3]);
        });

        it("find returns first matching value", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", 2],
                ["c", 3],
            ]);
            expect(map.find((v) => v > 1)).toBe(2);
        });

        it("find returns undefined when no match", () => {
            const map = new SohlMap<string, number>([["a", 1]]);
            expect(map.find((v) => v > 10)).toBeUndefined();
        });

        it("some returns true when at least one matches", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", 5],
            ]);
            expect(map.some((v) => v > 3)).toBe(true);
        });

        it("some returns false when none match", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", 2],
            ]);
            expect(map.some((v) => v > 10)).toBe(false);
        });

        it("every returns true when all match", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", 2],
            ]);
            expect(map.every((v) => v > 0)).toBe(true);
        });

        it("every returns false when one does not match", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", -1],
            ]);
            expect(map.every((v) => v > 0)).toBe(false);
        });

        it("every returns true for empty map", () => {
            const map = new SohlMap<string, number>();
            expect(map.every(() => false)).toBe(true);
        });

        it("reduce accumulates values", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", 2],
                ["c", 3],
            ]);
            const sum = map.reduce((acc, v) => acc + v, 0);
            expect(sum).toBe(6);
        });
    });

    describe("toJSON", () => {
        it("serializes primitive values", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", 2],
            ]);
            const json = map.toJSON();
            expect(json).toEqual({ a: 1, b: 2 });
        });

        it("calls toJSON on values that have it", () => {
            const map = new SohlMap<string, { toJSON: () => any }>([
                ["x", { toJSON: () => "serialized" }],
            ]);
            const json = map.toJSON();
            expect(json).toEqual({ x: "serialized" });
        });
    });

    describe("expandingEntries", () => {
        it("iterates existing entries", () => {
            const map = new SohlMap<string, number>([
                ["a", 1],
                ["b", 2],
            ]);
            const result: [string, number][] = [];
            for (const entry of map.expandingEntries()) {
                result.push(entry);
            }
            expect(result).toEqual([
                ["a", 1],
                ["b", 2],
            ]);
        });

        it("picks up entries added during iteration", () => {
            const map = new SohlMap<string, number>([["a", 1]]);
            const result: string[] = [];
            for (const [key] of map.expandingEntries()) {
                result.push(key);
                if (key === "a") {
                    map.set("b", 2);
                }
            }
            expect(result).toContain("a");
            expect(result).toContain("b");
        });
    });

    describe("fromData", () => {
        it("creates a SohlMap from a plain object", () => {
            const data = { a: 1, b: 2 };
            const map = SohlMap.fromData<number>(data);
            expect(map.get("a")).toBe(1);
            expect(map.get("b")).toBe(2);
            expect(map.size()).toBe(2);
        });
    });
});
