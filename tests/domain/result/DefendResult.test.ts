describe("DefendResult", () => {
    describe("constructor", () => {
        it.todo("creates instance extending SuccessTestResult with default values");
        it.todo("applies situationalModifier to the mastery level modifier");
        it.todo("throws when no parent is provided");
    });

    describe("evaluate()", () => {
        it.todo("calls super.evaluate() and returns false if not allowed");
        it.todo("adds FUMBLE_TEST mishap for block/counterstrike critical failure with lastDigit 0");
        it.todo("adds STUMBLE_TEST mishap for block/counterstrike critical failure with lastDigit 5");
        it.todo("adds STUMBLE_TEST mishap for dodge critical failure");
    });
});
