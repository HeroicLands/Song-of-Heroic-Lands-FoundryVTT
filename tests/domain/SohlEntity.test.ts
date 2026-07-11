import { describe, it, expect } from "vitest";
import { SohlEntity } from "@src/entity/SohlEntity";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import { BRAND } from "@src/utils/constants";

// A stand-in owning logic carrying the SohlLogic brand so `isA(x, "SohlLogic")`
// recognizes it — the overloaded `(parent)` shorthand depends on that brand.
const mockParent = {
    id: "test",
    name: "Test",
    label: "Test Label",
    data: { kind: "skill" },
    [BRAND.SohlLogic]: true,
} as any;

/**
 * A minimal concrete {@link SohlEntity} for exercising the base construction
 * contract. Adds one field so data normalization can be observed, and exposes
 * the protected static normalizers for direct assertions.
 */
class Probe extends SohlEntity {
    extra: string;

    constructor(parent: SohlLogic<any>);
    constructor(
        data: Partial<Probe.Data>,
        options: Partial<SohlEntity.Options>,
    );
    constructor(
        dataOrParent: SohlEntity.DataOrParent<Probe.Data> = {},
        options: Partial<SohlEntity.Options> = {},
    ) {
        super(
            SohlEntity.dataOf<Probe.Data>(dataOrParent),
            SohlEntity.optionsOf<SohlEntity.Options>(dataOrParent, options),
        );
        const data = SohlEntity.dataOf<Probe.Data>(dataOrParent);
        this.extra = data.extra ?? "";
    }

    /** Test-only passthrough to the protected static normalizer. */
    static callDataOf(x: SohlEntity.DataOrParent<Probe.Data>) {
        return SohlEntity.dataOf<Probe.Data>(x);
    }
    /** Test-only passthrough to the protected static normalizer. */
    static callOptionsOf(
        x: SohlEntity.DataOrParent<Probe.Data>,
        o: Partial<SohlEntity.Options>,
    ) {
        return SohlEntity.optionsOf<SohlEntity.Options>(x, o);
    }
}
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Probe {
    export const Kind = "Probe";
    export interface Data extends SohlEntity.Data {
        extra?: string;
    }
}

describe("SohlEntity", () => {
    describe("constructor overloads", () => {
        it("the (parent) shorthand equals ({}, { parent }) field-for-field", () => {
            const shorthand = new Probe(mockParent);
            const longhand = new Probe({}, { parent: mockParent });
            expect(shorthand.parent).toBe(mockParent);
            expect(shorthand.parent).toBe(longhand.parent);
            expect(shorthand.extra).toBe(longhand.extra);
            expect(shorthand.extra).toBe("");
        });

        it("the data form rehydrates fields from data", () => {
            const e = new Probe({ extra: "hello" }, { parent: mockParent });
            expect(e.extra).toBe("hello");
            expect(e.parent).toBe(mockParent);
        });

        it("throws the exact message when no parent resolves", () => {
            expect(() => new Probe({}, {} as any)).toThrow(
                "SohlEntity requires a parent",
            );
            expect(
                () => new Probe({ extra: "x" }, { parent: undefined } as any),
            ).toThrow("SohlEntity requires a parent");
        });

        it("rejects the data form without an options argument at compile time", () => {
            expect(() => {
                // @ts-expect-error — the data form requires an options argument
                new Probe({ extra: "x" });
            }).toThrow("SohlEntity requires a parent");
        });
    });

    describe("dataOf / optionsOf normalizers", () => {
        it("dataOf returns {} for a parent Logic and the data bag otherwise", () => {
            expect(Probe.callDataOf(mockParent)).toEqual({});
            const data = { extra: "hi" };
            expect(Probe.callDataOf(data)).toBe(data);
        });

        it("optionsOf injects parent for the shorthand and passes options through otherwise", () => {
            expect(Probe.callOptionsOf(mockParent, {})).toEqual({
                parent: mockParent,
            });
            const opts = { parent: mockParent };
            expect(Probe.callOptionsOf({ extra: "x" }, opts)).toBe(opts);
        });
    });

    describe("brand check (not duck-typing)", () => {
        it("does not mistake a data bag that carries a `parent` key for a Logic", () => {
            // A plain object with a `parent` property but no SohlLogic brand is
            // data, not a parent Logic.
            const sneaky = { extra: "x", parent: mockParent } as any;
            expect(Probe.callDataOf(sneaky)).toBe(sneaky);
            expect(Probe.callOptionsOf(sneaky, {})).toEqual({});
            // …so passing it as the sole argument resolves no parent and throws.
            expect(() => new Probe(sneaky, {} as any)).toThrow(
                "SohlEntity requires a parent",
            );
        });
    });
});
