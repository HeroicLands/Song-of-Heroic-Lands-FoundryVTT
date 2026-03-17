import { Itr } from "@utils/Itr";

describe("Itr", () => {
    describe("construction", () => {
        it("wraps an array iterable", () => {
            const itr = new Itr([1, 2, 3]);
            expect(itr.toArray()).toEqual([1, 2, 3]);
        });

        it("wraps a Set iterable", () => {
            const itr = new Itr(new Set(["a", "b"]));
            expect(itr.toArray()).toEqual(["a", "b"]);
        });

        it("wraps a generator", () => {
            function* gen() {
                yield 10;
                yield 20;
            }
            const itr = new Itr(gen());
            expect(itr.toArray()).toEqual([10, 20]);
        });
    });

    describe("static from", () => {
        it("creates an Itr from an iterable", () => {
            const itr = Itr.from([1, 2, 3]);
            expect(itr.toArray()).toEqual([1, 2, 3]);
        });
    });

    describe("toArray", () => {
        it("converts to array", () => {
            expect(Itr.from([5, 6, 7]).toArray()).toEqual([5, 6, 7]);
        });

        it("returns empty array for empty iterable", () => {
            expect(Itr.from([]).toArray()).toEqual([]);
        });
    });

    describe("next", () => {
        it("returns elements sequentially", () => {
            const itr = new Itr([1, 2]);
            expect(itr.next().value).toBe(1);
            expect(itr.next().value).toBe(2);
            expect(itr.next().done).toBe(true);
        });
    });

    describe("Symbol.iterator", () => {
        it("supports for...of", () => {
            const itr = new Itr([1, 2, 3]);
            const collected: number[] = [];
            for (const val of itr) {
                collected.push(val);
            }
            expect(collected).toEqual([1, 2, 3]);
        });

        it("supports spread operator", () => {
            const itr = new Itr(["a", "b"]);
            expect([...itr]).toEqual(["a", "b"]);
        });
    });

    describe("take", () => {
        it("takes the first n elements", () => {
            const result = Itr.from([1, 2, 3, 4, 5]).take(3).toArray();
            expect(result).toEqual([1, 2, 3]);
        });

        it("takes all if n exceeds length", () => {
            const result = Itr.from([1, 2]).take(10).toArray();
            expect(result).toEqual([1, 2]);
        });

        it("takes none when n is 0", () => {
            const result = Itr.from([1, 2]).take(0).toArray();
            expect(result).toEqual([]);
        });
    });

    describe("drop", () => {
        it("skips the first n elements", () => {
            const result = Itr.from([1, 2, 3, 4, 5]).drop(2).toArray();
            expect(result).toEqual([3, 4, 5]);
        });

        it("returns empty when n exceeds length", () => {
            const result = Itr.from([1, 2]).drop(10).toArray();
            expect(result).toEqual([]);
        });

        it("returns all when n is 0", () => {
            const result = Itr.from([1, 2]).drop(0).toArray();
            expect(result).toEqual([1, 2]);
        });
    });

    describe("forEach", () => {
        it("calls callback for each element with index", () => {
            const items: [number, number][] = [];
            Itr.from([10, 20, 30]).forEach((val, idx) => {
                items.push([val, idx]);
            });
            expect(items).toEqual([
                [10, 0],
                [20, 1],
                [30, 2],
            ]);
        });
    });

    describe("map", () => {
        it("transforms elements", () => {
            const result = Itr.from([1, 2, 3])
                .map((n) => n * 10)
                .toArray();
            expect(result).toEqual([10, 20, 30]);
        });

        it("provides index to callback", () => {
            const result = Itr.from(["a", "b"])
                .map((val, idx) => `${idx}:${val}`)
                .toArray();
            expect(result).toEqual(["0:a", "1:b"]);
        });
    });

    describe("filter", () => {
        it("keeps only matching elements", () => {
            const result = Itr.from([1, 2, 3, 4, 5])
                .filter((n) => n % 2 === 0)
                .toArray();
            expect(result).toEqual([2, 4]);
        });

        it("returns empty when nothing matches", () => {
            const result = Itr.from([1, 3, 5])
                .filter((n) => n % 2 === 0)
                .toArray();
            expect(result).toEqual([]);
        });
    });

    describe("reduce", () => {
        it("accumulates a value", () => {
            const sum = Itr.from([1, 2, 3]).reduce((acc, n) => acc + n, 0);
            expect(sum).toBe(6);
        });

        it("returns initial value for empty iterator", () => {
            const result = Itr.from([]).reduce((acc, _n) => acc, 42);
            expect(result).toBe(42);
        });
    });

    describe("find", () => {
        it("returns the first matching element", () => {
            const result = Itr.from([1, 2, 3, 4]).find((n) => n > 2);
            expect(result).toBe(3);
        });

        it("returns undefined when nothing matches", () => {
            const result = Itr.from([1, 2]).find((n) => n > 10);
            expect(result).toBeUndefined();
        });
    });

    describe("some", () => {
        it("returns true when at least one matches", () => {
            expect(Itr.from([1, 2, 3]).some((n) => n === 2)).toBe(true);
        });

        it("returns false when none match", () => {
            expect(Itr.from([1, 2, 3]).some((n) => n > 10)).toBe(false);
        });

        it("returns false for empty iterator", () => {
            expect(Itr.from([]).some(() => true)).toBe(false);
        });
    });

    describe("includes", () => {
        it("returns true when value is present", () => {
            expect(Itr.from([1, 2, 3]).includes(2)).toBe(true);
        });

        it("returns false when value is absent", () => {
            expect(Itr.from([1, 2, 3]).includes(99)).toBe(false);
        });
    });

    describe("every", () => {
        it("returns true when all match", () => {
            expect(Itr.from([2, 4, 6]).every((n) => n % 2 === 0)).toBe(true);
        });

        it("returns false when one does not match", () => {
            expect(Itr.from([2, 3, 6]).every((n) => n % 2 === 0)).toBe(false);
        });

        it("returns true for empty iterator", () => {
            expect(Itr.from([]).every(() => false)).toBe(true);
        });
    });

    describe("chaining", () => {
        it("supports chained operations", () => {
            const result = Itr.from([1, 2, 3, 4, 5])
                .filter((n) => n > 2)
                .map((n) => n * 10)
                .take(2)
                .toArray();
            expect(result).toEqual([30, 40]);
        });
    });
});
