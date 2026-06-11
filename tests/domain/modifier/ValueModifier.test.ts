import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { ValueDelta } from "@src/domain/modifier/ValueDelta";
import {
    VALUE_DELTA_ID,
    VALUE_DELTA_INFO,
    VALUE_DELTA_OPERATOR,
} from "@src/utils/constants";

const mockParent = {
    id: "test",
    name: "Test",
    label: "Test Label",
    data: { kind: "skill" },
} as any;

function createVM(data: Partial<ValueModifier.Data> = {}): ValueModifier {
    return new ValueModifier(data, { parent: mockParent });
}

/** Helper: push a delta directly into the VM's deltas array (bypasses _oper validation). */
function pushDelta(
    vm: ValueModifier,
    shortcode: string,
    op: string,
    value: string | number,
): void {
    vm.deltas.push(
        new ValueDelta({
            name: "SOHL.INFO.test",
            shortcode,
            op,
            value: String(value),
        }),
    );
    // Mark dirty so _apply recalculates on next access
    (vm as any).dirty = true;
}

describe("ValueModifier", () => {
    describe("constructor", () => {
        it("throws when constructed without a parent", () => {
            expect(() => new ValueModifier({}, {} as any)).toThrow(
                "ValueModifier must be constructed with a parent.",
            );
        });

        it("creates an instance with a parent", () => {
            const vm = createVM();
            expect(vm).toBeInstanceOf(ValueModifier);
            expect(vm.parent).toBe(mockParent);
        });

        it("initializes with default values", () => {
            const vm = createVM();
            expect(vm.base).toBe(0);
            expect(vm.hasBase).toBe(false);
            expect(vm.effective).toBe(0);
            expect(vm.disabled).toBe("");
            expect(vm.empty).toBe(true);
        });
    });

    describe("base / setBase() / hasBase", () => {
        it("base defaults to 0 when baseValue is undefined", () => {
            const vm = createVM();
            expect(vm.base).toBe(0);
            expect(vm.hasBase).toBe(false);
        });

        it("setBase sets a numeric base value", () => {
            const vm = createVM();
            vm.setBase(10);
            expect(vm.base).toBe(10);
            expect(vm.hasBase).toBe(true);
        });

        it("setBase with undefined clears the base", () => {
            const vm = createVM({ baseValue: 10 });
            vm.setBase(undefined);
            expect(vm.hasBase).toBe(false);
            expect(vm.base).toBe(0);
        });

        it("setBase throws for non-numeric value", () => {
            const vm = createVM();
            expect(() => vm.setBase("abc" as any)).toThrow(
                "value must be numeric or undefined",
            );
        });

        it("setBase returns the ValueModifier for chaining", () => {
            const vm = createVM();
            const result = vm.setBase(5);
            expect(result).toBe(vm);
        });

        it("base setter works like setBase", () => {
            const vm = createVM();
            vm.base = 15;
            expect(vm.base).toBe(15);
        });
    });

    describe("disabled / disabled setter", () => {
        it("disabled is empty string when not disabled", () => {
            const vm = createVM();
            expect(vm.disabled).toBe("");
        });

        it("setting disabled with a string sets the reason", () => {
            const vm = createVM();
            vm.disabled = "some reason";
            expect(vm.disabled).toBe("some reason");
        });

        it("setting disabled=true sets a default reason", () => {
            const vm = createVM();
            vm.disabled = true;
            expect(vm.disabled).toBe("SOHL.DELTAINFO.DISABLED");
        });

        it("setting disabled=false clears the disabled state", () => {
            const vm = createVM({ disabledReason: "was disabled" });
            vm.disabled = false;
            expect(vm.disabled).toBe("");
        });

        it("effective is 0 when disabled", () => {
            const vm = createVM();
            vm.disabled = true;
            pushDelta(vm, "A", VALUE_DELTA_OPERATOR.ADD, 10);
            expect(vm.effective).toBe(0);
        });
    });

    describe("get() / has()", () => {
        it("get returns the delta by shortcode", () => {
            const vm = createVM();
            pushDelta(vm, "TST", VALUE_DELTA_OPERATOR.ADD, 5);
            const delta = vm.get("TST");
            expect(delta).toBeDefined();
            expect(delta!.shortcode).toBe("TST");
        });

        it("get returns undefined for non-existent shortcode", () => {
            const vm = createVM();
            expect(vm.get("NONE")).toBeUndefined();
        });

        it("has returns true when delta exists", () => {
            const vm = createVM();
            pushDelta(vm, "TST", VALUE_DELTA_OPERATOR.ADD, 5);
            expect(vm.has("TST")).toBe(true);
        });

        it("has returns false when delta does not exist", () => {
            const vm = createVM();
            expect(vm.has("NONE")).toBe(false);
        });

        it("get throws for non-string shortcode", () => {
            const vm = createVM();
            expect(() => vm.get(123 as any)).toThrow(
                "shortcode is not a string",
            );
        });

        it("has throws for non-string shortcode", () => {
            const vm = createVM();
            expect(() => vm.has(123 as any)).toThrow(
                "shortcode is not a string",
            );
        });
    });

    describe("delete()", () => {
        it("removes a delta by shortcode", () => {
            const vm = createVM();
            pushDelta(vm, "TST", VALUE_DELTA_OPERATOR.ADD, 5);
            expect(vm.has("TST")).toBe(true);
            vm.delete("TST");
            expect(vm.has("TST")).toBe(false);
        });

        it("does nothing when shortcode does not exist", () => {
            const vm = createVM();
            pushDelta(vm, "TST", VALUE_DELTA_OPERATOR.ADD, 5);
            vm.delete("NONE");
            expect(vm.has("TST")).toBe(true);
        });

        it("throws for non-string shortcode", () => {
            const vm = createVM();
            expect(() => vm.delete(123 as any)).toThrow(
                "shortcode is not a string",
            );
        });
    });

    describe("effective value calculation", () => {
        it("effective is 0 with no deltas and no base", () => {
            const vm = createVM();
            expect(vm.effective).toBe(0);
        });

        it("ADD deltas are summed", () => {
            const vm = createVM();
            pushDelta(vm, "A", VALUE_DELTA_OPERATOR.ADD, 3);
            pushDelta(vm, "B", VALUE_DELTA_OPERATOR.ADD, 7);
            expect(vm.effective).toBe(10);
        });

        it("MULTIPLY is applied after ADD", () => {
            const vm = createVM();
            pushDelta(vm, "A", VALUE_DELTA_OPERATOR.ADD, 5);
            pushDelta(vm, "B", VALUE_DELTA_OPERATOR.MULTIPLY, 3);
            expect(vm.effective).toBe(15);
        });

        it("UPGRADE (floor) clamps effective to minimum", () => {
            const vm = createVM();
            pushDelta(vm, "A", VALUE_DELTA_OPERATOR.ADD, 3);
            pushDelta(vm, "B", VALUE_DELTA_OPERATOR.UPGRADE, 10);
            expect(vm.effective).toBe(10);
        });

        it("UPGRADE does not affect values already above the floor", () => {
            const vm = createVM();
            pushDelta(vm, "A", VALUE_DELTA_OPERATOR.ADD, 20);
            pushDelta(vm, "B", VALUE_DELTA_OPERATOR.UPGRADE, 10);
            expect(vm.effective).toBe(20);
        });

        it("DOWNGRADE (ceiling) clamps effective to maximum", () => {
            const vm = createVM();
            pushDelta(vm, "A", VALUE_DELTA_OPERATOR.ADD, 20);
            pushDelta(vm, "B", VALUE_DELTA_OPERATOR.DOWNGRADE, 10);
            expect(vm.effective).toBe(10);
        });

        it("DOWNGRADE does not affect values already below the ceiling", () => {
            const vm = createVM();
            pushDelta(vm, "A", VALUE_DELTA_OPERATOR.ADD, 3);
            pushDelta(vm, "B", VALUE_DELTA_OPERATOR.DOWNGRADE, 10);
            expect(vm.effective).toBe(3);
        });

        it("OVERRIDE replaces the computed value", () => {
            const vm = createVM();
            pushDelta(vm, "A", VALUE_DELTA_OPERATOR.ADD, 100);
            pushDelta(vm, "B", VALUE_DELTA_OPERATOR.OVERRIDE, 42);
            expect(vm.effective).toBe(42);
        });

        it("processing order: add, multiply, clamp, override", () => {
            const vm = createVM();
            pushDelta(vm, "A", VALUE_DELTA_OPERATOR.ADD, 4);
            pushDelta(vm, "B", VALUE_DELTA_OPERATOR.MULTIPLY, 3); // 4*3 = 12
            pushDelta(vm, "C", VALUE_DELTA_OPERATOR.UPGRADE, 15); // max(12,15) = 15
            expect(vm.effective).toBe(15);
        });
    });

    describe("empty", () => {
        it("returns true when no deltas", () => {
            const vm = createVM();
            expect(vm.empty).toBe(true);
        });

        it("returns false when deltas exist", () => {
            const vm = createVM();
            pushDelta(vm, "TST", VALUE_DELTA_OPERATOR.ADD, 5);
            expect(vm.empty).toBe(false);
        });
    });

    describe("modifier", () => {
        it("returns effective minus base", () => {
            const vm = createVM({ baseValue: 10 });
            pushDelta(vm, "A", VALUE_DELTA_OPERATOR.ADD, 15);
            // effective is 25 (base 10 + delta 15), base is 10
            expect(vm.modifier).toBe(15);
        });

        it("returns effective when base is undefined (base defaults to 0)", () => {
            const vm = createVM();
            pushDelta(vm, "A", VALUE_DELTA_OPERATOR.ADD, 7);
            expect(vm.modifier).toBe(7);
        });
    });

    describe("toJSON()", () => {
        it("returns a plain object without the parent back-reference", () => {
            const vm = createVM({ baseValue: 45 });
            const json = vm.toJSON();
            expect(typeof json).toBe("object");
            expect(json).not.toHaveProperty("parent");
            expect(json.baseValue).toBe(45);
        });
    });

    describe("clone()", () => {
        it("creates an independent copy that recomputes from revived deltas", () => {
            const vm = createVM({ baseValue: 45 });
            pushDelta(vm, "TST", VALUE_DELTA_OPERATOR.ADD, 20);
            expect(vm.effective).toBe(65);

            const copy = vm.clone<ValueModifier>();

            expect(copy).toBeInstanceOf(ValueModifier);
            expect(copy).not.toBe(vm);
            // Deltas were revived as live ValueDeltas, so effective recomputes.
            expect(copy.effective).toBe(65);
            expect(copy.deltas[0]).not.toBe(vm.deltas[0]);

            // Independent: changing the copy does not touch the source.
            pushDelta(copy, "TST2", VALUE_DELTA_OPERATOR.ADD, 10);
            expect(copy.effective).toBe(75);
            expect(vm.effective).toBe(65);
        });
    });

    describe("operator argument forms", () => {
        // The operators dispatch by arity:
        //   (shortcode, value)        — registry lookup, validated
        //   (name, shortcode, value)  — explicit, ad-hoc, unvalidated

        it("two-arg form resolves the display name from the registry", () => {
            const vm = createVM({ baseValue: 40 });
            vm.add(VALUE_DELTA_INFO.PLAYER, 10);
            expect(vm.effective).toBe(50);
            const delta = vm.get(VALUE_DELTA_INFO.PLAYER);
            expect(delta).toBeDefined();
            expect(delta!.shortcode).toBe(VALUE_DELTA_INFO.PLAYER);
            expect(delta!.name).toBe(
                VALUE_DELTA_ID[VALUE_DELTA_INFO.PLAYER].name,
            );
        });

        it("two-arg form throws on an unregistered shortcode", () => {
            const vm = createVM({ baseValue: 10 });
            // "Size" is a real ad-hoc shortcode but is not a VALUE_DELTA_INFO
            // member, so the convenience form rejects it.
            expect(() => (vm as any).add("Size", 5)).toThrow(
                /unknown value-delta shortcode/i,
            );
        });

        it("three-arg form passes name/shortcode through without validation", () => {
            // name / shortcode are display / identity labels, not validated
            // localization keys — any value is accepted and the delta applies.
            const vm = createVM({ baseValue: 10 });
            expect(() => vm.add("SOHL.INFO.Reach", "Size", 5)).not.toThrow();
            expect(vm.effective).toBe(15);
            expect(vm.get("Size")!.name).toBe("SOHL.INFO.Reach");
        });

        it("the same dispatch applies to multiply / floor / ceiling / set", () => {
            const mul = createVM({ baseValue: 4 });
            mul.multiply(VALUE_DELTA_INFO.OFFHAND, 2);
            expect(mul.effective).toBe(8);

            const flr = createVM({ baseValue: 3 });
            flr.floor(VALUE_DELTA_INFO.MINVALUE, 10);
            expect(flr.effective).toBe(10);

            const cap = createVM({ baseValue: 20 });
            cap.ceiling(VALUE_DELTA_INFO.MAXVALUE, 10);
            expect(cap.effective).toBe(10);

            const ovr = createVM({ baseValue: 100 });
            ovr.set(VALUE_DELTA_INFO.PLAYER, 42);
            expect(ovr.effective).toBe(42);
        });
    });

    describe("index", () => {
        it("returns Math.trunc(baseValue / 10)", () => {
            const vm = createVM({ baseValue: 55 });
            expect(vm.index).toBe(5);
        });

        it("returns 0 when baseValue is undefined", () => {
            const vm = createVM();
            expect(vm.index).toBe(0);
        });
    });
});
