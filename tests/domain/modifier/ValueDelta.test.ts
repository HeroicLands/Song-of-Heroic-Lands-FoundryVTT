import { ValueDelta } from "@src/entity/modifier/ValueDelta";
import { VALUE_DELTA_OPERATOR } from "@src/utils/constants";

// ValueDelta extends SohlEntity, so it requires an owning `parent`.
const mockParent = { id: "test", name: "Test", data: { kind: "skill" } } as any;
const makeDelta = (data: Partial<ValueDelta.Data>): ValueDelta =>
    new ValueDelta(data, { parent: mockParent });

describe("ValueDelta", () => {
    describe("constructor", () => {
        it("creates an instance with valid data", () => {
            const delta = makeDelta({
                name: "SOHL.INFO.test",
                abbrev: "TST",
                op: VALUE_DELTA_OPERATOR.ADD,
                value: "5",
            });
            expect(delta.name).toBe("SOHL.INFO.test");
            expect(delta.abbrev).toBe("TST");
            expect(delta.op).toBe(VALUE_DELTA_OPERATOR.ADD);
            expect(delta.value).toBe("5");
        });

        it("passes name and abbrev through without validation", () => {
            // name / abbrev are display / identity labels, not validated
            // localization keys — any value (incl. other namespaces) is kept.
            const delta = makeDelta({
                name: "SOHL.ValueDelta.INFO.SitMod",
                abbrev: "SitMod",
                op: VALUE_DELTA_OPERATOR.ADD,
                value: "5",
            });
            expect(delta.name).toBe("SOHL.ValueDelta.INFO.SitMod");
            expect(delta.abbrev).toBe("SitMod");
        });

        it("throws when value is non-numeric for non-CUSTOM operator", () => {
            expect(() =>
                makeDelta({
                    name: "SOHL.INFO.test",
                    abbrev: "TST",
                    op: VALUE_DELTA_OPERATOR.ADD,
                    value: "abc",
                }),
            ).toThrow(/ValueDelta value must be numeric/);
        });

        it("accepts non-numeric value for CUSTOM operator", () => {
            const delta = makeDelta({
                name: "SOHL.INFO.test",
                abbrev: "TST",
                op: VALUE_DELTA_OPERATOR.CUSTOM,
                value: "someCustomValue",
            });
            expect(delta.value).toBe("someCustomValue");
        });

        it("normalizes boolean strings for CUSTOM operator", () => {
            const deltaTrue = makeDelta({
                name: "SOHL.INFO.test",
                abbrev: "TST",
                op: VALUE_DELTA_OPERATOR.CUSTOM,
                value: "TRUE",
            });
            expect(deltaTrue.value).toBe("true");

            const deltaFalse = makeDelta({
                name: "SOHL.INFO.test",
                abbrev: "TST2",
                op: VALUE_DELTA_OPERATOR.CUSTOM,
                value: "FALSE",
            });
            expect(deltaFalse.value).toBe("false");
        });
    });

    describe("numValue", () => {
        it('returns 1 for "true"', () => {
            const delta = makeDelta({
                name: "SOHL.INFO.test",
                abbrev: "TST",
                op: VALUE_DELTA_OPERATOR.CUSTOM,
                value: "true",
            });
            expect(delta.numValue).toBe(1);
        });

        it('returns 0 for "false"', () => {
            const delta = makeDelta({
                name: "SOHL.INFO.test",
                abbrev: "TST",
                op: VALUE_DELTA_OPERATOR.CUSTOM,
                value: "false",
            });
            expect(delta.numValue).toBe(0);
        });

        it("returns numeric value for numeric strings", () => {
            const delta = makeDelta({
                name: "SOHL.INFO.test",
                abbrev: "TST",
                op: VALUE_DELTA_OPERATOR.ADD,
                value: "5",
            });
            expect(delta.numValue).toBe(5);
        });

        it("returns 0 for non-numeric non-boolean strings (CUSTOM op)", () => {
            const delta = makeDelta({
                name: "SOHL.INFO.test",
                abbrev: "TST",
                op: VALUE_DELTA_OPERATOR.CUSTOM,
                value: "abc",
            });
            expect(delta.numValue).toBe(0);
        });
    });

    describe("apply(base)", () => {
        describe("numeric values", () => {
            it("ADD: returns base + value", () => {
                const delta = makeDelta({
                    name: "SOHL.INFO.test",
                    abbrev: "TST",
                    op: VALUE_DELTA_OPERATOR.ADD,
                    value: "3",
                });
                expect(delta.apply(10)).toBe(13);
            });

            it("ADD: handles negative values", () => {
                const delta = makeDelta({
                    name: "SOHL.INFO.test",
                    abbrev: "TST",
                    op: VALUE_DELTA_OPERATOR.ADD,
                    value: "-3",
                });
                expect(delta.apply(10)).toBe(7);
            });

            it("MULTIPLY: returns base * value", () => {
                const delta = makeDelta({
                    name: "SOHL.INFO.test",
                    abbrev: "TST",
                    op: VALUE_DELTA_OPERATOR.MULTIPLY,
                    value: "3",
                });
                expect(delta.apply(10)).toBe(30);
            });

            it("MULTIPLY: handles zero", () => {
                const delta = makeDelta({
                    name: "SOHL.INFO.test",
                    abbrev: "TST",
                    op: VALUE_DELTA_OPERATOR.MULTIPLY,
                    value: "0",
                });
                expect(delta.apply(10)).toBe(0);
            });

            it("UPGRADE (floor): returns Math.max(base, value)", () => {
                const delta = makeDelta({
                    name: "SOHL.INFO.test",
                    abbrev: "TST",
                    op: VALUE_DELTA_OPERATOR.UPGRADE,
                    value: "5",
                });
                expect(delta.apply(3)).toBe(5);
                expect(delta.apply(10)).toBe(10);
            });

            it("DOWNGRADE (ceiling): returns Math.min(base, value)", () => {
                const delta = makeDelta({
                    name: "SOHL.INFO.test",
                    abbrev: "TST",
                    op: VALUE_DELTA_OPERATOR.DOWNGRADE,
                    value: "5",
                });
                expect(delta.apply(3)).toBe(3);
                expect(delta.apply(10)).toBe(5);
            });

            it("OVERRIDE: returns value regardless of base", () => {
                const delta = makeDelta({
                    name: "SOHL.INFO.test",
                    abbrev: "TST",
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
                const delta = makeDelta({
                    name: "SOHL.INFO.test",
                    abbrev: "TST",
                    op: VALUE_DELTA_OPERATOR.CUSTOM,
                    value: "true",
                });
                // CUSTOM/OVERRIDE branch: returns 1 for "true"
                expect(delta.apply(0)).toBe(1);
                expect(delta.apply(5)).toBe(1);
            });

            it('CUSTOM with "false": returns 0', () => {
                const delta = makeDelta({
                    name: "SOHL.INFO.test",
                    abbrev: "TST",
                    op: VALUE_DELTA_OPERATOR.CUSTOM,
                    value: "false",
                });
                expect(delta.apply(0)).toBe(0);
                expect(delta.apply(5)).toBe(0);
            });
        });
    });

    describe("label (#1127)", () => {
        afterEach(() => vi.restoreAllMocks());

        it("localizes the stored name for display", () => {
            vi.spyOn((globalThis as any).sohl.i18n, "localize").mockImplementation((k: any) =>
                k === "SOHL.MysticalAbility.LevelPenalty" ? "Level Penalty" : k,
            );
            const delta = makeDelta({
                name: "SOHL.MysticalAbility.LevelPenalty",
                abbrev: "LvlPen",
                op: VALUE_DELTA_OPERATOR.ADD,
                value: "-6",
            });
            expect(delta.label).toBe("Level Penalty");
            // The stored name remains the key — only display is localized.
            expect(delta.name).toBe("SOHL.MysticalAbility.LevelPenalty");
        });

        it("passes plain prose through unchanged (idempotent)", () => {
            const delta = makeDelta({
                name: "Dagger",
                abbrev: "DGR",
                op: VALUE_DELTA_OPERATOR.ADD,
                value: "2",
            });
            expect(delta.label).toBe("Dagger");
        });
    });

    describe("toJSON()", () => {
        it("serializes the delta to a plain object", () => {
            const delta = makeDelta({
                name: "SOHL.INFO.test",
                abbrev: "TST",
                op: VALUE_DELTA_OPERATOR.ADD,
                value: "5",
            });
            const json = delta.toJSON();
            expect(json).toHaveProperty("name", "SOHL.INFO.test");
            expect(json).toHaveProperty("abbrev", "TST");
            expect(json).toHaveProperty("op", VALUE_DELTA_OPERATOR.ADD);
            expect(json).toHaveProperty("value", "5");
        });
    });
});
