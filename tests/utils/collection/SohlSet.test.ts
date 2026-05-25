import { SohlSet } from "@src/utils/collection/SohlSet";

describe("SohlSet", () => {
    describe("basic operations", () => {
        it("starts empty when no data provided", () => {
            const set = new SohlSet<number>();
            expect([...set]).toEqual([]);
        });

        it("can be constructed with initial data", () => {
            const set = new SohlSet([1, 2, 3]);
            const values = set.values().toArray();
            expect(values).toEqual([1, 2, 3]);
        });

        it("add inserts a value", () => {
            const set = new SohlSet<string>();
            set.add("hello");
            expect(set.values().toArray()).toContain("hello");
        });

        it("add returns this for chaining", () => {
            const set = new SohlSet<string>();
            const result = set.add("a");
            expect(result).toBe(set);
        });

        it("add does not duplicate values", () => {
            const set = new SohlSet([1, 2]);
            set.add(1);
            expect(set.values().toArray()).toEqual([1, 2]);
        });

        it("delete removes a value and returns true", () => {
            const set = new SohlSet([1, 2, 3]);
            expect(set.delete(2)).toBe(true);
            expect(set.values().toArray()).toEqual([1, 3]);
        });

        it("delete returns false for non-existent value", () => {
            const set = new SohlSet([1]);
            expect(set.delete(99)).toBe(false);
        });

        it("clear removes all values", () => {
            const set = new SohlSet([1, 2, 3]);
            set.clear();
            expect(set.values().toArray()).toEqual([]);
        });
    });

    describe("iteration", () => {
        it("values returns all values via Itr", () => {
            const set = new SohlSet(["a", "b", "c"]);
            expect(set.values().toArray()).toEqual(["a", "b", "c"]);
        });

        it("keys returns the same as values", () => {
            const set = new SohlSet([10, 20]);
            expect(set.keys().toArray()).toEqual([10, 20]);
        });

        it("entries returns [value, value] pairs", () => {
            const set = new SohlSet(["x", "y"]);
            expect(set.entries().toArray()).toEqual([
                ["x", "x"],
                ["y", "y"],
            ]);
        });

        it("supports for...of via Symbol.iterator", () => {
            const set = new SohlSet([1, 2, 3]);
            const collected: number[] = [];
            for (const val of set) {
                collected.push(val);
            }
            expect(collected).toEqual([1, 2, 3]);
        });
    });

    describe("expandingEntries", () => {
        it("iterates existing entries", () => {
            const set = new SohlSet(["a", "b"]);
            const result: string[] = [];
            for (const [val] of set.expandingEntries()) {
                result.push(val);
            }
            expect(result).toEqual(["a", "b"]);
        });

        it("picks up entries added during iteration", () => {
            const set = new SohlSet(["first"]);
            const result: string[] = [];
            for (const [val] of set.expandingEntries()) {
                result.push(val);
                if (val === "first") {
                    set.add("second");
                }
            }
            expect(result).toContain("first");
            expect(result).toContain("second");
        });
    });
});
