import { describe, it } from "vitest";

describe("CohortLogic", () => {
    describe("lifecycle", () => {
        it.todo("initialize - calls super.initialize");
        it.todo("evaluate - calls super.evaluate");
        it.todo("finalize - calls super.finalize");
    });
});

describe("CohortDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlActorDataModel base schema fields");
        it.todo("defines leaderName as a StringField");
        it.todo("defines moveRepName as a StringField");
        it.todo("defines members as ArrayField of {shortcode, name, role} schemas");
        it.todo("members role defaults to COHORT_MEMBER_ROLE.MEMBER");
    });

    it.todo("has kind set to ACTOR_KIND.COHORT");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
