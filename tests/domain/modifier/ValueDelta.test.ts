import { ValueDelta } from "@src/domain/modifier/ValueDelta";
import { VALUE_DELTA_OPERATOR } from "@src/utils/constants";

describe("ValueDelta", () => {
    describe("constructor", () => {
        it("creates an instance with valid data", () => {
            const delta = new ValueDelta({
                name: "SOHL.INFO.test",
                shortcode: "TST",
                op: VALUE_DELTA_OPERATOR.ADD,
                value: "5",
            });
            expect(delta.name).toBe("SOHL.INFO.test");
            expect(delta.shortcode).toBe("TST");
            expect(delta.op).toBe(VALUE_DELTA_OPERATOR.ADD);
            expect(delta.value).toBe("5");
        });

        it("throws when shortcode is missing", () => {
            expect(
                () =>
                    new ValueDelta({
                        name: "SOHL.INFO.test",
                        shortcode: "",
                        op: VALUE_DELTA_OPERATOR.ADD,
                        value: "5",
                    }),
            ).toThrow("ValueDelta requires an shortcode");
        });

        it("throws when name does not start with SOHL.INFO.", () => {
            expect(
                () =>
                    new ValueDelta({
                        name: "BadPrefix.test",
                        shortcode: "TST",
                        op: VALUE_DELTA_OPERATOR.ADD,
                        value: "5",
                    }),
            ).toThrow("ValueDelta name must start with SOHL.INFO.");
        });

        it("throws when value is non-numeric for non-CUSTOM operator", () => {
            expect(
                () =>
                    new ValueDelta({
                        name: "SOHL.INFO.test",
                        shortcode: "TST",
                        op: VALUE_DELTA_OPERATOR.ADD,
                        value: "abc",
                    }),
            ).toThrow(/ValueDelta value must be numeric/);
        });

        it("accepts non-numeric value for CUSTOM operator", () => {
            const delta = new ValueDelta({
                name: "SOHL.INFO.test",
                shortcode: "TST",
                op: VALUE_DELTA_OPERATOR.CUSTOM,
                value: "someCustomValue",
            });
            expect(delta.value).toBe("someCustomValue");
        });

        it("normalizes boolean strings for CUSTOM operator", () => {
            const deltaTrue = new ValueDelta({
                name: "SOHL.INFO.test",
                shortcode: "TST",
                op: VALUE_DELTA_OPERATOR.CUSTOM,
                value: "TRUE",
            });
            expect(deltaTrue.value).toBe("true");

            const deltaFalse = new ValueDelta({
                name: "SOHL.INFO.test",
                shortcode: "TST2",
                op: VALUE_DELTA_OPERATOR.CUSTOM,
                value: "FALSE",
            });
            expect(deltaFalse.value).toBe("false");
        });
    });

    describe("numValue", () => {
        it('returns 1 for "true"', () => {
            const delta = new ValueDelta({
                name: "SOHL.INFO.test",
                shortcode: "TST",
                op: VALUE_DELTA_OPERATOR.CUSTOM,
                value: "true",
            });
            expect(delta.numValue).toBe(1);
        });

        it('returns 0 for "false"', () => {
            const delta = new ValueDelta({
                name: "SOHL.INFO.test",
                shortcode: "TST",
                op: VALUE_DELTA_OPERATOR.CUSTOM,
                value: "false",
            });
            expect(delta.numValue).toBe(0);
        });

        it("returns numeric value for numeric strings", () => {
            const delta = new ValueDelta({
                name: "SOHL.INFO.test",
                shortcode: "TST",
                op: VALUE_DELTA_OPERATOR.ADD,
                value: "5",
            });
            expect(delta.numValue).toBe(5);
        });

        it("returns 0 for non-numeric non-boolean strings (CUSTOM op)", () => {
            const delta = new ValueDelta({
                name: "SOHL.INFO.test",
                shortcode: "TST",
                op: VALUE_DELTA_OPERATOR.CUSTOM,
                value: "abc",
            });
            expect(delta.numValue).toBe(0);
        });
    });

    describe("apply(base)", () => {
        describe("numeric values", () => {
            it("ADD: returns base + value", () => {
                const delta = new ValueDelta({
                    name: "SOHL.INFO.test",
                    shortcode: "TST",
                    op: VALUE_DELTA_OPERATOR.ADD,
                    value: "3",
                });
                expect(delta.apply(10)).toBe(13);
            });

            it("ADD: handles negative values", () => {
                const delta = new ValueDelta({
                    name: "SOHL.INFO.test",
                    shortcode: "TST",
                    op: VALUE_DELTA_OPERATOR.ADD,
                    value: "-3",
                });
                expect(delta.apply(10)).toBe(7);
            });

            it("MULTIPLY: returns base * value", () => {
                const delta = new ValueDelta({
                    name: "SOHL.INFO.test",
                    shortcode: "TST",
                    op: VALUE_DELTA_OPERATOR.MULTIPLY,
                    value: "3",
                });
                expect(delta.apply(10)).toBe(30);
            });

            it("MULTIPLY: handles zero", () => {
                const delta = new ValueDelta({
                    name: "SOHL.INFO.test",
                    shortcode: "TST",
                    op: VALUE_DELTA_OPERATOR.MULTIPLY,
                    value: "0",
                });
                expect(delta.apply(10)).toBe(0);
            });

            it("UPGRADE (floor): returns Math.max(base, value)", () => {
                const delta = new ValueDelta({
                    name: "SOHL.INFO.test",
                    shortcode: "TST",
                    op: VALUE_DELTA_OPERATOR.UPGRADE,
                    value: "5",
                });
                expect(delta.apply(3)).toBe(5);
                expect(delta.apply(10)).toBe(10);
            });

            it("DOWNGRADE (ceiling): returns Math.min(base, value)", () => {
                const delta = new ValueDelta({
                    name: "SOHL.INFO.test",
                    shortcode: "TST",
                    op: VALUE_DELTA_OPERATOR.DOWNGRADE,
                    value: "5",
                });
                expect(delta.apply(3)).toBe(3);
                expect(delta.apply(10)).toBe(5);
            });

            it("OVERRIDE: returns value regardless of base", () => {
                const delta = new ValueDelta({
                    name: "SOHL.INFO.test",
                    shortcode: "TST",
                    op: VALUE_DELTA_OPERATOR.OVERRIDE,
                    value: "42",
                });
                expect(delta.apply(0)).toBe(42);
                expect(delta.apply(100)).toBe(42);
                expect(delta.apply(-50)).toBe(42);
            });
        });

        describe("boolean values (via CUSTOM op)", () => {
            it('ADD with "true": returns 1 when base is truthy or value is true', () => {
                const delta = new ValueDelta({
                    name: "SOHL.INFO.test",
                    shortcode: "TST",
                    op: VALUE_DELTA_OPERATOR.CUSTOM,
                    value: "true",
                });
                // CUSTOM/OVERRIDE branch: returns 1 for "true"
                expect(delta.apply(0)).toBe(1);
                expect(delta.apply(5)).toBe(1);
            });

            it('CUSTOM with "false": returns 0', () => {
                const delta = new ValueDelta({
                    name: "SOHL.INFO.test",
                    shortcode: "TST",
                    op: VALUE_DELTA_OPERATOR.CUSTOM,
                    value: "false",
                });
                expect(delta.apply(0)).toBe(0);
                expect(delta.apply(5)).toBe(0);
            });
        });
    });

    describe("toJSON()", () => {
        it("serializes the delta to a plain object", () => {
            const delta = new ValueDelta({
                name: "SOHL.INFO.test",
                shortcode: "TST",
                op: VALUE_DELTA_OPERATOR.ADD,
                value: "5",
            });
            const json = delta.toJSON();
            expect(json).toHaveProperty("name", "SOHL.INFO.test");
            expect(json).toHaveProperty("shortcode", "TST");
            expect(json).toHaveProperty("op", VALUE_DELTA_OPERATOR.ADD);
            expect(json).toHaveProperty("value", "5");
        });
    });

    describe("isA()", () => {
        it("returns true for ValueDelta instances", () => {
            const delta = new ValueDelta({
                name: "SOHL.INFO.test",
                shortcode: "TST",
                op: VALUE_DELTA_OPERATOR.ADD,
                value: "5",
            });
            expect(ValueDelta.isA(delta)).toBe(true);
        });

        it("returns false for plain objects", () => {
            expect(ValueDelta.isA({ name: "test", shortcode: "TST" })).toBe(
                false,
            );
        });

        it("returns false for null and undefined", () => {
            expect(ValueDelta.isA(null)).toBe(false);
            expect(ValueDelta.isA(undefined)).toBe(false);
        });

        it("returns false for primitives", () => {
            expect(ValueDelta.isA(42)).toBe(false);
            expect(ValueDelta.isA("string")).toBe(false);
        });
    });
});
