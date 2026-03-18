import { SohlArray } from "@src/utils/collection/SohlArray";

describe("SohlArray", () => {
    describe("basic operations", () => {
        it("starts empty with no arguments", () => {
            const arr = new SohlArray<number>();
            expect(arr.length).toBe(0);
        });

        it("can be constructed with initial items", () => {
            const arr = new SohlArray(1, 2, 3);
            expect(arr.length).toBe(3);
            expect(arr.at(0)).toBe(1);
            expect(arr.at(1)).toBe(2);
            expect(arr.at(2)).toBe(3);
        });

        it("push adds elements and returns new length", () => {
            const arr = new SohlArray<number>();
            expect(arr.push(10)).toBe(1);
            expect(arr.push(20, 30)).toBe(3);
            expect(arr.length).toBe(3);
        });

        it("pop removes and returns last element", () => {
            const arr = new SohlArray(1, 2, 3);
            expect(arr.pop()).toBe(3);
            expect(arr.length).toBe(2);
        });

        it("pop returns undefined on empty array", () => {
            const arr = new SohlArray<number>();
            expect(arr.pop()).toBeUndefined();
        });

        it("shift removes and returns first element", () => {
            const arr = new SohlArray(1, 2, 3);
            expect(arr.shift()).toBe(1);
            expect(arr.length).toBe(2);
            expect(arr.at(0)).toBe(2);
        });

        it("unshift adds to beginning and returns new length", () => {
            const arr = new SohlArray(2, 3);
            expect(arr.unshift(0, 1)).toBe(4);
            expect(arr.at(0)).toBe(0);
            expect(arr.at(1)).toBe(1);
        });

        it("splice removes and inserts elements", () => {
            const arr = new SohlArray(1, 2, 3, 4);
            const removed = arr.splice(1, 2, 10, 20);
            expect(removed).toEqual([2, 3]);
            expect(arr.values().toArray()).toEqual([1, 10, 20, 4]);
        });

        it("at supports negative indices", () => {
            const arr = new SohlArray("a", "b", "c");
            expect(arr.at(-1)).toBe("c");
            expect(arr.at(-2)).toBe("b");
        });

        it("at returns undefined for out of bounds", () => {
            const arr = new SohlArray(1);
            expect(arr.at(5)).toBeUndefined();
        });
    });

    describe("setAt", () => {
        it("replaces element at given index", () => {
            const arr = new SohlArray(10, 20, 30);
            arr.setAt(1, 99);
            expect(arr.at(1)).toBe(99);
        });

        it.todo(
            "throws for index beyond length — verify SohlArray bounds checking behavior",
        );
    });

    describe("iteration", () => {
        it("values returns Itr over elements", () => {
            const arr = new SohlArray(1, 2, 3);
            expect(arr.values().toArray()).toEqual([1, 2, 3]);
        });

        it("keys returns Itr over indices", () => {
            const arr = new SohlArray("a", "b");
            expect(arr.keys().toArray()).toEqual([0, 1]);
        });

        it("entries returns Itr over [index, value] pairs", () => {
            const arr = new SohlArray("x", "y");
            expect(arr.entries().toArray()).toEqual([
                [0, "x"],
                [1, "y"],
            ]);
        });

        it("supports for...of via Symbol.iterator", () => {
            const arr = new SohlArray(10, 20);
            const collected: number[] = [];
            for (const val of arr) {
                collected.push(val);
            }
            expect(collected).toEqual([10, 20]);
        });
    });

    describe("map and reduce", () => {
        it("map transforms elements", () => {
            const arr = new SohlArray(1, 2, 3);
            const result = arr.map((n) => n * 2);
            expect(result).toEqual([2, 4, 6]);
        });

        it("reduce accumulates a value", () => {
            const arr = new SohlArray(1, 2, 3, 4);
            const sum = arr.reduce((acc, n) => acc + n, 0);
            expect(sum).toBe(10);
        });
    });

    describe("expandingEntries", () => {
        it("iterates existing entries", () => {
            const arr = new SohlArray(1, 2);
            const result: [number, number][] = [];
            for (const entry of arr.expandingEntries()) {
                result.push(entry);
            }
            expect(result).toEqual([
                [0, 1],
                [1, 2],
            ]);
        });

        it.todo(
            "picks up entries added during iteration — verify expandingEntries behavior",
        );
    });
});
