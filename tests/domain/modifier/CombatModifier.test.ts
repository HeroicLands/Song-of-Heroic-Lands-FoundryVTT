import { CombatModifier } from "@src/entity/modifier/CombatModifier";
import { defaultToJSON, defaultFromJSON } from "@src/utils/helpers";
import { BRAND } from "@src/utils/constants";

const parent = {
    id: "p",
    name: "Weapon",
    label: "Weapon",
    data: { kind: "weapongear" },
    [BRAND.SohlLogic]: true,
} as any;

describe("CombatModifier", () => {
    describe("toJSON / serialization", () => {
        it("revives to the concrete CombatModifier type with fields intact", () => {
            const cm = new CombatModifier(
                { baseValue: 40, successLevelMod: 2, type: "attack" } as any,
                { parent },
            );
            const revived = defaultFromJSON(
                JSON.parse(JSON.stringify(defaultToJSON(cm))),
                { parent },
            ) as CombatModifier;
            expect(revived).toBeInstanceOf(CombatModifier);
            expect(revived.base).toBe(40);
            expect(revived.successLevelMod).toBe(2);
            expect(revived.type).toBe("attack");
        });
    });

    describe("constructor", () => {
        it.todo(
            "creates an instance extending MasteryLevelModifier with valid data and parent",
        );
        it.todo("throws when constructed without a parent");
    });

    describe("inheritance", () => {
        it.todo(
            "inherits all ValueModifier methods (add, multiply, set, floor, ceiling)",
        );
        it.todo(
            "inherits MasteryLevelModifier properties (minTarget, maxTarget, successLevelMod)",
        );
        it.todo("inherits constrainedEffective from MasteryLevelModifier");
    });

    describe("successTest", () => {
        it.todo("delegates to MasteryLevelModifier.successTest");
    });
});
