describe("OpposedTestResult", () => {
    describe("constructor", () => {
        it.todo("throws when sourceTestResult is not provided");
        it.todo("throws when neither targetTestResult nor targetToken is provided");
        it.todo("creates instance with sourceTestResult and targetTestResult");
        it.todo("creates a default SuccessTestResult for target when only targetToken is provided");
        it.todo("initializes rollMode, tieBreak, and breakTies with defaults");
    });

    describe("isTied", () => {
        it.todo("returns true when both succeed at the same level and neither both-fail");
        it.todo("returns false when both fail");
        it.todo("returns false when success levels differ");
    });

    describe("bothFail", () => {
        it.todo("returns true when neither source nor target succeeded");
        it.todo("returns false when at least one succeeded");
    });

    describe("tieBreakOffset", () => {
        it.todo("returns tieBreak value when not bothFail");
        it.todo("returns 0 when bothFail");
    });

    describe("sourceWins", () => {
        it.todo("returns true when source normSuccessLevel > target normSuccessLevel");
        it.todo("returns false when both fail");
        it.todo("returns false when source level <= target level");
    });

    describe("targetWins", () => {
        it.todo("returns true when target normSuccessLevel > source normSuccessLevel");
        it.todo("returns false when both fail");
        it.todo("returns false when target level <= source level");
    });

    describe("evaluate()", () => {
        it.todo("evaluates both source and target test results");
        it.todo("returns false when either evaluation fails");
        it.todo("returns false when source or target is missing");
    });

    describe("toChat()", () => {
        it.todo("sends chat message with opposed test result data");
        it.todo("includes both source and target rolls");
    });
});
