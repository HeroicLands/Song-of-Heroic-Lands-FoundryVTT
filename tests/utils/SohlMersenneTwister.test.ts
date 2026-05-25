import { SohlMersenneTwister } from "@src/utils/SohlMersenneTwister";

describe("SohlMersenneTwister", () => {
    afterEach(() => {
        SohlMersenneTwister.reset();
    });

    describe("instance methods", () => {
        it("produces deterministic output with same seed", () => {
            const mt1 = new SohlMersenneTwister(12345);
            const mt2 = new SohlMersenneTwister(12345);
            const results1 = Array.from({ length: 10 }, () => mt1.int());
            const results2 = Array.from({ length: 10 }, () => mt2.int());
            expect(results1).toEqual(results2);
        });

        it("produces different output with different seeds", () => {
            const mt1 = new SohlMersenneTwister(12345);
            const mt2 = new SohlMersenneTwister(54321);
            const results1 = Array.from({ length: 5 }, () => mt1.int());
            const results2 = Array.from({ length: 5 }, () => mt2.int());
            expect(results1).not.toEqual(results2);
        });

        it("int() returns non-negative integers", () => {
            const mt = new SohlMersenneTwister(42);
            for (let i = 0; i < 100; i++) {
                const val = mt.int();
                expect(val).toBeGreaterThanOrEqual(0);
                expect(Number.isInteger(val)).toBe(true);
            }
        });

        it("int31() returns non-negative 31-bit integers", () => {
            const mt = new SohlMersenneTwister(42);
            for (let i = 0; i < 100; i++) {
                const val = mt.int31();
                expect(val).toBeGreaterThanOrEqual(0);
                expect(val).toBeLessThan(2147483648); // 2^31
            }
        });

        it("real() returns values in [0, 1]", () => {
            const mt = new SohlMersenneTwister(42);
            for (let i = 0; i < 100; i++) {
                const val = mt.real();
                expect(val).toBeGreaterThanOrEqual(0);
                expect(val).toBeLessThanOrEqual(1);
            }
        });

        it("rnd() returns values in [0, 1)", () => {
            const mt = new SohlMersenneTwister(42);
            for (let i = 0; i < 100; i++) {
                const val = mt.rnd();
                expect(val).toBeGreaterThanOrEqual(0);
                expect(val).toBeLessThan(1);
            }
        });

        it("random() is an alias for rnd()", () => {
            const mt1 = new SohlMersenneTwister(99);
            const mt2 = new SohlMersenneTwister(99);
            expect(mt1.random()).toBe(mt2.rnd());
        });

        it("realx() returns values in (0, 1)", () => {
            const mt = new SohlMersenneTwister(42);
            for (let i = 0; i < 100; i++) {
                const val = mt.realx();
                expect(val).toBeGreaterThan(0);
                expect(val).toBeLessThan(1);
            }
        });

        it("rndHiRes() returns values in [0, 1)", () => {
            const mt = new SohlMersenneTwister(42);
            for (let i = 0; i < 50; i++) {
                const val = mt.rndHiRes();
                expect(val).toBeGreaterThanOrEqual(0);
                expect(val).toBeLessThan(1);
            }
        });

        it("normal() returns finite numbers", () => {
            const mt = new SohlMersenneTwister(42);
            for (let i = 0; i < 50; i++) {
                const val = mt.normal(0, 1);
                expect(Number.isFinite(val)).toBe(true);
            }
        });
    });

    describe("seed method", () => {
        it("re-seeds and produces deterministic output", () => {
            const mt = new SohlMersenneTwister(1);
            mt.seed(12345);
            const val1 = mt.int();

            mt.seed(12345);
            const val2 = mt.int();

            expect(val1).toBe(val2);
        });
    });

    describe("seedArray", () => {
        it("seeds with an array and produces deterministic output", () => {
            const mt1 = new SohlMersenneTwister(0);
            mt1.seedArray([1, 2, 3, 4]);
            const results1 = Array.from({ length: 5 }, () => mt1.int());

            const mt2 = new SohlMersenneTwister(0);
            mt2.seedArray([1, 2, 3, 4]);
            const results2 = Array.from({ length: 5 }, () => mt2.int());

            expect(results1).toEqual(results2);
        });
    });

    describe("static methods", () => {
        it("getInstance returns a singleton", () => {
            const inst1 = SohlMersenneTwister.getInstance();
            const inst2 = SohlMersenneTwister.getInstance();
            expect(inst1).toBe(inst2);
        });

        it("setSeed replaces the singleton", () => {
            SohlMersenneTwister.setSeed(42);
            const val1 = SohlMersenneTwister.int();
            SohlMersenneTwister.setSeed(42);
            const val2 = SohlMersenneTwister.int();
            expect(val1).toBe(val2);
        });

        it("static random() returns a number in [0, 1)", () => {
            SohlMersenneTwister.setSeed(42);
            const val = SohlMersenneTwister.random();
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThan(1);
        });

        it("static normal() returns a finite number", () => {
            SohlMersenneTwister.setSeed(42);
            const val = SohlMersenneTwister.normal(0, 1);
            expect(Number.isFinite(val)).toBe(true);
        });

        it("reset clears the singleton", () => {
            const inst1 = SohlMersenneTwister.getInstance();
            SohlMersenneTwister.reset();
            const inst2 = SohlMersenneTwister.getInstance();
            expect(inst1).not.toBe(inst2);
        });

        it("useMock injects a custom instance", () => {
            const mock = new SohlMersenneTwister(999);
            SohlMersenneTwister.useMock(mock);
            expect(SohlMersenneTwister.getInstance()).toBe(mock);
        });
    });
});
