describe("SuccessTestResult", () => {
    describe("constructor", () => {
        it.todo("creates an instance with default values");
        it.todo("throws when no parent is provided");
        it.todo("merges data from options.testResult when provided");
        it.todo("initializes masteryLevelModifier from data or creates default");
        it.todo("initializes roll with MARGINAL_FAILURE standard data by default");
        it.todo("initializes testType, rollMode, movement, and mishaps");
        it.todo("sets speaker from options.chatSpeaker or creates from token");
    });

    describe("successLevel", () => {
        it.todo("clamps to CRITICAL_FAILURE when level is very low");
        it.todo("returns MARGINAL_FAILURE for levels between CF and MS");
        it.todo("returns MARGINAL_SUCCESS for level equal to MS constant");
        it.todo("clamps to CRITICAL_SUCCESS when level is very high");
    });

    describe("computed properties", () => {
        it.todo("targetValue calls targetValueFunc with successLevel");
        it.todo("normSuccessLevel returns normalized success level based on isSuccess and isCritical");
        it.todo("lastDigit returns roll total mod 10");
        it.todo("isCapped is true when effective differs from constrainedEffective");
        it.todo("critAllowed is true when crit digit arrays are non-empty");
        it.todo("isCritical is true for critical success or failure levels");
        it.todo("isSuccess is true when successLevel >= MARGINAL_SUCCESS");
        it.todo("canFate reflects available fate on item logic");
    });

    describe("availResponses", () => {
        it.todo("includes OPPOSEDTESTRESUME when testType is OPPOSEDTESTSTART");
        it.todo("returns empty array for other test types");
    });

    describe("evaluate()", () => {
        it.todo("returns false when speaker is not owner");
        it.todo("sets MARGINAL_SUCCESS when roll <= constrainedEffective (no crits)");
        it.todo("sets MARGINAL_FAILURE when roll > constrainedEffective (no crits)");
        it.todo("sets CRITICAL_SUCCESS when roll succeeds and last digit is in critSuccessDigits");
        it.todo("sets CRITICAL_FAILURE when roll fails and last digit is in critFailureDigits");
        it.todo("applies successLevelMod to the success level");
        it.todo("clamps success level to MS/MF range when crits not allowed");
        it.todo("sets description based on success/critical state");
        it.todo("computes successStars via handleLimitedDescription");
    });

    describe("testDialog()", () => {
        it.todo("renders a dialog with test data");
        it.todo("applies situational modifier from form data");
        it.todo("sets rollMode from form data");
    });

    describe("toChat()", () => {
        it.todo("sends chat message with test result data");
        it.todo("includes roll in chat options");
    });

    describe("StandardRollData", () => {
        it.todo("defines standard roll data for CF, MF, CS, MS outcomes");
    });
});
