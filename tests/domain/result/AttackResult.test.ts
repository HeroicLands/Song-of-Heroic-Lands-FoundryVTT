describe("AttackResult", () => {
    describe("constructor", () => {
        it.todo(
            "creates instance extending SuccessTestResult with default values",
        );
        it.todo("initializes impact to a default ImpactModifier");
        it.todo("initializes aimBodyPartCode to empty string by default");
        it.todo("throws when no parent is provided");
    });

    describe("evaluate()", () => {
        it.todo("calls super.evaluate() and returns false if not allowed");
        it.todo(
            "adds FUMBLE_TEST mishap for melee critical failure with lastDigit 0",
        );
        it.todo(
            "adds STUMBLE_TEST mishap for melee critical failure with lastDigit 5",
        );
        it.todo(
            "adds FUMBLE_TEST mishap for missile critical failure with lastDigit 0",
        );
        it.todo(
            "adds MISSILE_MISFIRE mishap for missile critical failure with lastDigit 5",
        );
        it.todo("disables impact on a self-miss");
        it.todo("does not roll impact (that happens when the blow lands)");
    });

    describe("testDialog()", () => {
        it.todo("extends super dialog data with impact situational modifier");
        it.todo("applies impact situational modifier from form data");
    });

    describe("toChat()", () => {
        it.todo("includes the impact modifier in chat data");
    });
});
