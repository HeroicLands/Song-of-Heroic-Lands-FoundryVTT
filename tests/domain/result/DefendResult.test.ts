describe("DefendResult", () => {
    describe("constructor", () => {
        it.todo("creates instance extending ImpactResult with default values");
        it.todo("initializes situationalModifier to 0 by default");
        it.todo("throws when no parent is provided");
    });

    describe("evaluate()", () => {
        it.todo("calls super.evaluate() and returns false if not allowed");
        it.todo("adds FUMBLE_TEST mishap for block/counterstrike critical failure with lastDigit 0");
        it.todo("adds STUMBLE_TEST mishap for block/counterstrike critical failure with lastDigit 5");
        it.todo("adds STUMBLE_TEST mishap for dodge critical failure");
        it.todo("sets deliversImpact to false for block/counterstrike");
        it.todo("sets deliversImpact to false for dodge");
    });
});
