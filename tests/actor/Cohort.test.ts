import { describe, it, expect, vi, afterEach } from "vitest";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import { CohortLogic } from "@src/document/actor/logic/CohortLogic";
import { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import { MiscGearLogic } from "@src/document/item/logic/MiscGearLogic";
import { SohlActorBaseLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { ACTOR_KIND, ITEM_KIND } from "@src/utils/constants";
import { makeActorLogic, makeItemLogic } from "@tests/mocks/logicHarness";

/** A cohort member entry, keyed by the shortcode/UUID of its world actor. */
function member(shortcodeOrUuid: string, role = "member") {
    return { shortcodeOrUuid, role };
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
            movementProfiles: [],
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
                members: [member("Alpha"), member("Beta")],
            });
            expect(logic).toBeInstanceOf(CohortLogic);
            expect(logic).toBeInstanceOf(SohlActorBaseLogic);
            expect(logic.data.kind).toBe(ACTOR_KIND.COHORT);
            expect(logic.data.leaderName).toBe("Alpha");
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
        it("builds an update payload without the matching member", () => {
            const alpha = member("Alpha");
            const beta = member("Beta");
            const logic = makeCohort({ members: [alpha, beta] });
            expect(logic.removeMemberUpdate("Alpha")).toEqual({
                "system.members": [beta],
            });
        });

        it("returns the unchanged list when the shortcode/UUID does not match", () => {
            const alpha = member("Alpha");
            const logic = makeCohort({ members: [alpha] });
            expect(logic.removeMemberUpdate("Nobody")).toEqual({
                "system.members": [alpha],
            });
            expect(logic.data.members).toHaveLength(1);
        });
    });

    describe("sharingRefs", () => {
        it("lists the shortcode, id, and uuid a gear item may share with", () => {
            const logic = makeCohort({ shortcode: "wardens" }) as CohortLogic;
            expect(logic.sharingRefs).toContain("wardens");
            expect(logic.sharingRefs).toContain(logic.data.id);
            expect(logic.sharingRefs).toContain(logic.data.uuid);
        });
    });

    describe("memberLogics", () => {
        it("resolves each member's shortcodeOrUuid to its actor logic", () => {
            const aldric = makeActorLogic(BeingLogic, ACTOR_KIND.BEING, {
                name: "Aldric",
                shortcode: "aldric",
            });
            vi.spyOn(FoundryHelpersMock, "fvttActorByRef").mockImplementation(
                (ref: string) =>
                    ref === "aldric" ? (aldric as any).actor : undefined,
            );

            const logic = makeCohort({
                members: [member("aldric")],
            }) as CohortLogic;

            expect(logic.memberLogics).toEqual([aldric]);
        });

        it("skips a member whose actor no longer resolves", () => {
            vi.spyOn(FoundryHelpersMock, "fvttActorByRef").mockReturnValue(
                undefined,
            );
            const logic = makeCohort({
                members: [member("ghost")],
            }) as CohortLogic;
            expect(logic.memberLogics).toEqual([]);
        });
    });

    describe("sharedGear", () => {
        /**
         * Build a cohort whose single member carries `items` — each entry a
         * `[name, sharedWithCohortIds]` pair — and return its logic.
         */
        function cohortWithMemberGear(
            memberName: string,
            items: [string, string[]][],
            cohortFields: Record<string, unknown> = { shortcode: "wardens" },
        ) {
            const memberLogic = makeActorLogic(BeingLogic, ACTOR_KIND.BEING, {
                name: memberName,
                shortcode: memberName.toLowerCase(),
            });
            const memberActor = (memberLogic as any).actor;
            memberActor.name = memberName;
            (memberLogic as any).data.name = memberName;
            for (const [name, sharedWithCohortIds] of items) {
                makeItemLogic(
                    MiscGearLogic,
                    ITEM_KIND.MISCGEAR,
                    {
                        name,
                        quantity: 1,
                        weightBase: 1,
                        valueBase: 1,
                        isCarried: true,
                        qualityBase: 0,
                        durabilityBase: 0,
                        sharedWithCohortIds,
                        containerId: null,
                    },
                    { actor: memberActor, name, id: `item-${name}` },
                );
            }
            vi.spyOn(FoundryHelpersMock, "fvttActorByRef").mockImplementation(
                (ref: string) =>
                    ref === memberName.toLowerCase() ? memberActor : undefined,
            );
            return makeCohort({
                ...cohortFields,
                members: [member(memberName.toLowerCase())],
            }) as CohortLogic;
        }

        it("lists a member's gear shared with this cohort, naming its carrier", () => {
            const logic = cohortWithMemberGear("Aldric", [
                ["Rope", ["wardens"]],
            ]);

            const rows = logic.sharedGear;

            expect(rows).toHaveLength(1);
            expect(rows[0].gear.data.name).toBe("Rope");
            expect(rows[0].carrierName).toBe("Aldric");
        });

        it("omits a member's gear that is not shared", () => {
            const logic = cohortWithMemberGear("Aldric", [
                ["Rope", ["wardens"]],
                ["Dagger", []],
            ]);
            expect(logic.sharedGear.map((r) => r.gear.data.name)).toEqual([
                "Rope",
            ]);
        });

        it("omits gear shared with a different cohort", () => {
            const logic = cohortWithMemberGear("Aldric", [
                ["Rope", ["bandits"]],
            ]);
            expect(logic.sharedGear).toEqual([]);
        });

        it("is empty for a cohort with no members", () => {
            const logic = makeCohort({ shortcode: "wardens" }) as CohortLogic;
            expect(logic.sharedGear).toEqual([]);
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
        it.todo("defines movementProfiles as an ArrayField");
        it.todo(
            "defines members as ArrayField of {shortcodeOrUuid, role} schemas",
        );
        it.todo("members role defaults to COHORT_MEMBER_ROLE.MEMBER");
    });

    it.todo("has kind set to ACTOR_KIND.COHORT");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
