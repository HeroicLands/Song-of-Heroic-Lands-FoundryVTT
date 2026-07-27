import { ImpactModifier } from "@src/entity/modifier/ImpactModifier";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { defaultToJSON, defaultFromJSON } from "@src/utils/helpers";
import { BRAND, IMPACT_ASPECT, VALUE_DELTA_INFO } from "@src/utils/constants";

// A stand-in owning logic carrying the SohlLogic brand.
const parent = { id: "p", [BRAND.SohlLogic]: true } as any;

describe("ImpactModifier", () => {
    describe("toJSON / serialization", () => {
        it("emits the roll and aspect alongside the modifier fields", () => {
            const im = new ImpactModifier(
                {
                    baseValue: 3,
                    roll: new SimpleRoll(
                        { numDice: 2, dieFaces: 6 },
                        { parent },
                    ),
                    aspect: IMPACT_ASPECT.EDGED,
                } as any,
                { parent },
            );
            const json = im.toJSON();
            expect(json.__kind).toBe("ImpactModifier");
            expect(json.aspect).toBe(IMPACT_ASPECT.EDGED);
            expect((json.roll as any).__kind).toBe("SimpleRoll");
            expect((json.roll as any).numDice).toBe(2);
            expect((json.roll as any).dieFaces).toBe(6);
        });

        it("round-trips roll + aspect through defaultFromJSON", () => {
            const im = new ImpactModifier(
                {
                    baseValue: 3,
                    roll: new SimpleRoll(
                        { numDice: 2, dieFaces: 6, rolls: [3, 4] },
                        { parent },
                    ),
                    aspect: IMPACT_ASPECT.EDGED,
                } as any,
                { parent },
            );
            const revived = defaultFromJSON(
                JSON.parse(JSON.stringify(defaultToJSON(im))),
                { parent },
            ) as ImpactModifier;
            expect(revived).toBeInstanceOf(ImpactModifier);
            expect(revived.numDice).toBe(2);
            expect(revived.die).toBe(6);
            expect(revived.aspectType).toBe(IMPACT_ASPECT.EDGED);
        });

        it("serializes a null roll as null", () => {
            const im = new ImpactModifier({ baseValue: 2 } as any, { parent });
            expect(im.toJSON().roll).toBeNull();
        });
    });

    describe("constructor", () => {
        it.todo(
            "creates an instance with default values (null roll, BLUNT aspect)",
        );
        it.todo("accepts roll data and creates a SimpleRoll");
        it.todo("accepts a valid aspect");
        it.todo("defaults to BLUNT for invalid aspect");
        it.todo("throws when constructed without a parent");
    });

    describe("disabled", () => {
        it.todo("returns disabled reason from parent when set");
        it.todo("returns DISABLED label when die is 0 and effective is 0");
        it.todo("returns empty string when not disabled and has impact");
    });

    describe("die", () => {
        it.todo("returns roll dieFaces or 0 when no roll");
    });

    describe("numDice", () => {
        it.todo("returns roll numDice or 0 when no roll");
    });

    describe("diceFormula", () => {
        it.todo("returns '0' when no dice and no effective value");
        it.todo("returns correct formula with dice and positive modifier");
        it.todo("returns correct formula with dice and negative modifier");
        it.todo("returns effective value only when no dice");
    });

    describe("label", () => {
        it.todo("returns diceFormula plus aspect character");
    });

    describe("evaluate()", () => {
        it.todo("returns roll total when roll already exists");
        it.todo(
            "creates a SimpleRoll from formula and rolls when no prior roll",
        );
    });

    // Regression (#769): the base constructor applied before ImpactModifier set
    // its dice `roll`, caching a "Dsbl" delta summary for an impact that is
    // actually enabled. The most-derived _apply() must run after the roll is set.
    describe("deltaLabel staleness", () => {
        it("summarizes an enabled impact (has dice) as Base +N, not Dsbl", () => {
            const im = new ImpactModifier(
                {
                    baseValue: 0,
                    roll: new SimpleRoll(
                        { numDice: 1, dieFaces: 8 },
                        { parent },
                    ),
                    aspect: IMPACT_ASPECT.PIERCING,
                } as any,
                { parent },
            );
            // die 8 → not auto-disabled → summary reflects the base, not "Dsbl".
            expect(im.disabled).toBe("");
            expect(im.deltaLabel).toBe(`${VALUE_DELTA_INFO.BASE} +0`);
        });

        it("summarizes a no-damage impact (no dice, zero modifier) as Dsbl", () => {
            const im = new ImpactModifier({ baseValue: 0 } as any, { parent });
            // die 0 and effective 0 → auto-disabled → "Dsbl".
            expect(im.disabled).toBeTruthy();
            expect(im.deltaLabel).toBe(VALUE_DELTA_INFO.DISABLED);
        });
    });
});
