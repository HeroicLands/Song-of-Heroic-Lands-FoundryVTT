describe("AttackResult", () => {
    describe("constructor", () => {
        it.todo("creates instance extending ImpactResult with default values");
        it.todo("initializes situationalModifier to 0 by default");
        it.todo("initializes allowedDefenses as empty Set by default");
        it.todo("initializes damage to 0 by default");
        it.todo("initializes modifiers as empty Map by default");
        it.todo("throws when no parent is provided");
    });

    describe("evaluate()", () => {
        it.todo("calls super.evaluate() and returns false if not allowed");
        it.todo("adds FUMBLE_TEST mishap for melee critical failure with lastDigit 0");
        it.todo("adds STUMBLE_TEST mishap for melee critical failure with lastDigit 5");
        it.todo("adds FUMBLE_TEST mishap for missile critical failure with lastDigit 0");
        it.todo("adds MISSILE_MISFIRE mishap for missile critical failure with lastDigit 5");
        it.todo("sets deliversImpact to true on success");
        it.todo("sets deliversImpact to false on failure");
    });

    describe("testDialog()", () => {
        it.todo("extends super dialog data with impact situational modifier");
        it.todo("applies impact situational modifier from form data");
    });

    describe("toChat()", () => {
        it.todo("includes impact modifier and delivers impact in chat data");
    });
});
