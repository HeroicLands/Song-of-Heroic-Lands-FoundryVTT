import { describe, it, expect, vi, afterEach } from "vitest";
import { CohortLogic } from "@src/document/actor/logic/CohortLogic";
import { SohlActorBaseLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { ACTOR_KIND } from "@src/utils/constants";
import { makeActorLogic } from "@tests/mocks/logicHarness";

/** A cohort member entry. */
function member(name: string, shortcode = "wolf", role = "member") {
    return { shortcode, name, role };
}

/** Construct a CohortLogic against a plain-object CohortData. */
function makeCohort(
    fields: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeActorLogic(
        CohortLogic,
        ACTOR_KIND.COHORT,
        {
            leaderName: "",
            moveRepName: "",
            members: [],
            ...fields,
        },
        opts,
    );
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("CohortLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object CohortData (no Foundry)", () => {
            const logic = makeCohort({
                leaderName: "Alpha",
                moveRepName: "Beta",
                members: [member("Alpha"), member("Beta")],
            });
            expect(logic).toBeInstanceOf(CohortLogic);
            expect(logic).toBeInstanceOf(SohlActorBaseLogic);
            expect(logic.data.kind).toBe(ACTOR_KIND.COHORT);
            expect(logic.data.leaderName).toBe("Alpha");
            expect(logic.data.moveRepName).toBe("Beta");
            expect(logic.data.members).toHaveLength(2);
        });

        it("defines the base edit/delete intrinsic actions", () => {
            const logic = makeCohort();
            expect(logic.actions.has("editDocument")).toBe(true);
        });
    });

    describe("addMemberUpdate", () => {
        it("builds an update payload appending the member", () => {
            const alpha = member("Alpha");
            const logic = makeCohort({ members: [alpha] });
            const beta = member("Beta");
            expect(logic.addMemberUpdate(beta)).toEqual({
                "system.members": [alpha, beta],
            });
        });

        it("does not mutate the live members array or persist anything", () => {
            const logic = makeCohort({ members: [member("Alpha")] });
            logic.addMemberUpdate(member("Beta"));
            expect(logic.data.members).toHaveLength(1);
            expect((logic.actor as any).update).not.toHaveBeenCalled();
        });
    });

    describe("removeMemberUpdate", () => {
        it("builds an update payload without the named member", () => {
            const alpha = member("Alpha");
            const beta = member("Beta");
            const logic = makeCohort({ members: [alpha, beta] });
            expect(logic.removeMemberUpdate("Alpha")).toEqual({
                "system.members": [beta],
            });
        });

        it("returns the unchanged list when the name does not match", () => {
            const alpha = member("Alpha");
            const logic = makeCohort({ members: [alpha] });
            expect(logic.removeMemberUpdate("Nobody")).toEqual({
                "system.members": [alpha],
            });
            expect(logic.data.members).toHaveLength(1);
        });
    });

    describe("lifecycle", () => {
        it("initialize/evaluate/finalize are no-ops that do not throw", () => {
            const logic = makeCohort();
            expect(() => {
                logic.initialize();
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });
    });
});

describe("CohortDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlActorDataModel base schema fields");
        it.todo("defines leaderName as a StringField");
        it.todo("defines moveRepName as a StringField");
        it.todo(
            "defines members as ArrayField of {shortcode, name, role} schemas",
        );
        it.todo("members role defaults to COHORT_MEMBER_ROLE.MEMBER");
    });

    it.todo("has kind set to ACTOR_KIND.COHORT");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
