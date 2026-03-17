describe("ImpactModifier", () => {
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
        it.todo("creates a SimpleRoll from formula and rolls when no prior roll");
    });
});
