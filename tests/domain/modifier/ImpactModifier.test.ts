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
                    roll: new SimpleRoll({ numDice: 2, dieFaces: 6 }, { parent }),
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
                    roll: new SimpleRoll({ numDice: 2, dieFaces: 6, rolls: [3, 4] }, { parent }),
                    aspect: IMPACT_ASPECT.EDGED,
                } as any,
                { parent },
            );
            const revived = defaultFromJSON(JSON.parse(JSON.stringify(defaultToJSON(im))), {
                parent,
            }) as ImpactModifier;
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
        it.todo("creates an instance with default values (null roll, BLUNT aspect)");
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

    describe("formatDice", () => {
        it("drops the count for a single die (1dN → dN)", () => {
            expect(ImpactModifier.formatDice(1, 6)).toBe("d6");
            expect(ImpactModifier.formatDice(1, 10)).toBe("d10");
        });

        it("keeps the count for more than one die", () => {
            expect(ImpactModifier.formatDice(2, 6)).toBe("2d6");
            expect(ImpactModifier.formatDice(3, 8)).toBe("3d8");
        });

        it("returns an empty string when there are no dice", () => {
            expect(ImpactModifier.formatDice(0, 6)).toBe("");
        });

        it("returns an empty string when the die size is absent", () => {
            expect(ImpactModifier.formatDice(1, null)).toBe("");
            expect(ImpactModifier.formatDice(2, 0)).toBe("");
        });
    });

    describe("diceFormula", () => {
        // Build an ImpactModifier with a given roll + effective base.
        function make(
            numDice: number,
            dieFaces: number,
            baseValue: number,
            aspect: string = IMPACT_ASPECT.BLUNT,
        ): ImpactModifier {
            const roll = numDice ? new SimpleRoll({ numDice, dieFaces }, { parent }) : null;
            return new ImpactModifier({ baseValue, roll, aspect } as any, {
                parent,
            });
        }

        it("returns '0' when no dice and no effective value", () => {
            expect(make(0, 0, 0).diceFormula).toBe("0");
        });

        it("returns correct formula with dice and positive modifier", () => {
            expect(make(2, 6, 3).diceFormula).toBe("2d6+3");
        });

        it("drops the count for a single die", () => {
            expect(make(1, 6, 3).diceFormula).toBe("d6+3");
        });

        it("returns correct formula with dice and negative modifier", () => {
            expect(make(2, 6, -2).diceFormula).toBe("2d6-2");
        });

        it("returns effective value only when no dice", () => {
            expect(make(0, 0, 4).diceFormula).toBe("4");
        });
    });

    describe("label", () => {
        it("returns diceFormula plus aspect character", () => {
            const roll = new SimpleRoll({ numDice: 1, dieFaces: 8 }, { parent });
            const im = new ImpactModifier(
                { baseValue: 1, roll, aspect: IMPACT_ASPECT.PIERCING } as any,
                { parent },
            );
            expect(im.label).toBe("d8+1p");
        });
    });

    describe("evaluate()", () => {
        it.todo("returns roll total when roll already exists");
        it.todo("creates a SimpleRoll from formula and rolls when no prior roll");
    });

    // Regression (#769): the base constructor applied before ImpactModifier set
    // its dice `roll`, caching a "Dsbl" delta summary for an impact that is
    // actually enabled. The most-derived _apply() must run after the roll is set.
    describe("deltaLabel staleness", () => {
        it("summarizes an enabled impact (has dice) as Base +N, not Dsbl", () => {
            const im = new ImpactModifier(
                {
                    baseValue: 0,
                    roll: new SimpleRoll({ numDice: 1, dieFaces: 8 }, { parent }),
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
