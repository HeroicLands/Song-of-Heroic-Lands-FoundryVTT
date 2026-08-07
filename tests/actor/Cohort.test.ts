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
            leaderCode: null,
            movementProfiles: [],
            members: [],
            ...fields,
        },
        opts,
    );
}

/**
 * Stub `fvttActorByRef` so the given handles resolve to a minimal actor and
 * every other handle resolves to nothing.
 */
function resolveRefs(byRef: Record<string, Record<string, unknown>>) {
    vi.spyOn(FoundryHelpersMock, "fvttActorByRef").mockImplementation(
        (ref: string) => byRef[ref],
    );
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("CohortLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object CohortData (no Foundry)", () => {
            const logic = makeCohort({
                leaderCode: "Alpha",
                members: [member("Alpha"), member("Beta")],
            });
            expect(logic).toBeInstanceOf(CohortLogic);
            expect(logic).toBeInstanceOf(SohlActorBaseLogic);
            expect(logic.data.kind).toBe(ACTOR_KIND.COHORT);
            expect(logic.data.leaderCode).toBe("Alpha");
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

        it("clears the leader when the removed member was leading", () => {
            const logic = makeCohort({
                members: [member("Alpha"), member("Beta")],
                leaderCode: "Alpha",
            }) as CohortLogic;
            expect(logic.removeMemberUpdate("Alpha")).toEqual({
                "system.members": [member("Beta")],
                "system.leaderCode": null,
            });
        });

        it("leaves the leader alone when another member is removed", () => {
            const logic = makeCohort({
                members: [member("Alpha"), member("Beta")],
                leaderCode: "Alpha",
            }) as CohortLogic;
            expect(logic.removeMemberUpdate("Beta")).not.toHaveProperty(
                "system.leaderCode",
            );
        });
    });

    describe("setLeaderUpdate", () => {
        it("builds an update payload naming a member as leader", () => {
            const logic = makeCohort({
                members: [member("Alpha"), member("Beta")],
            }) as CohortLogic;
            expect(logic.setLeaderUpdate("Beta")).toEqual({
                "system.leaderCode": "Beta",
            });
        });

        it("clears the leader when the same member is picked again", () => {
            const logic = makeCohort({
                members: [member("Alpha")],
                leaderCode: "Alpha",
            }) as CohortLogic;
            expect(logic.setLeaderUpdate("Alpha")).toEqual({
                "system.leaderCode": null,
            });
        });

        it("clears the leader when given null", () => {
            const logic = makeCohort({
                members: [member("Alpha")],
                leaderCode: "Alpha",
            }) as CohortLogic;
            expect(logic.setLeaderUpdate(null)).toEqual({
                "system.leaderCode": null,
            });
        });

        it("refuses a handle that is not a member", () => {
            const logic = makeCohort({
                members: [member("Alpha")],
            }) as CohortLogic;
            expect(logic.setLeaderUpdate("Nobody")).toBeUndefined();
        });
    });

    describe("leaderCode", () => {
        it("is the member handle named by the stored code", () => {
            const logic = makeCohort({
                members: [member("Alpha")],
                leaderCode: "Alpha",
            }) as CohortLogic;
            expect(logic.leaderCode).toBe("Alpha");
        });

        it("is null when no leader is named", () => {
            const logic = makeCohort({
                members: [member("Alpha")],
            }) as CohortLogic;
            expect(logic.leaderCode).toBeNull();
        });

        it("is null when the stored code names nobody in the list", () => {
            const logic = makeCohort({
                members: [member("Alpha")],
                leaderCode: "Departed",
            }) as CohortLogic;
            expect(logic.leaderCode).toBeNull();
            expect(logic.leader).toBeUndefined();
        });
    });

    describe("memberRows", () => {
        it("names each member from the actor its handle resolves to", () => {
            resolveRefs({
                aldric: { name: "Aldric", uuid: "Actor.a1", img: "a.webp" },
                "Actor.b1": { name: "Brunjar", uuid: "Actor.b1" },
            });
            const logic = makeCohort({
                members: [member("aldric"), member("Actor.b1", "director")],
            }) as CohortLogic;

            const rows = logic.memberRows;
            expect(rows.map((r) => r.name)).toEqual(["Aldric", "Brunjar"]);
            expect(rows.map((r) => r.uuid)).toEqual(["Actor.a1", "Actor.b1"]);
            expect(rows[0].img).toBe("a.webp");
            expect(rows.every((r) => r.isResolved)).toBe(true);
        });

        it("still lists a member whose actor no longer resolves, named by its handle", () => {
            resolveRefs({});
            const logic = makeCohort({
                members: [member("ghost")],
            }) as CohortLogic;

            const [row] = logic.memberRows;
            expect(row.name).toBe("ghost");
            expect(row.isResolved).toBe(false);
            expect(row.uuid).toBeNull();
        });

        it("carries each member's role and its localization key", () => {
            resolveRefs({});
            const logic = makeCohort({
                members: [member("aldric", "director")],
            }) as CohortLogic;

            expect(logic.memberRows[0].role).toBe("director");
            expect(logic.memberRows[0].roleLabel).toBe(
                "SOHL.Cohort.MemberRole.director",
            );
        });

        it("marks exactly the leader's row, and none when there is no leader", () => {
            resolveRefs({});
            const led = makeCohort({
                members: [member("aldric"), member("brunjar")],
                leaderCode: "brunjar",
            }) as CohortLogic;
            expect(led.memberRows.map((r) => r.isLeader)).toEqual([
                false,
                true,
            ]);
            expect(led.leader?.ref).toBe("brunjar");

            const leaderless = makeCohort({
                members: [member("aldric")],
            }) as CohortLogic;
            expect(leaderless.memberRows.map((r) => r.isLeader)).toEqual([
                false,
            ]);
        });
    });

    describe("memberRows health (#199)", () => {
        /** A resolvable actor stub carrying a health value on its logic data. */
        function withHealth(name: string, value: number, max = 100) {
            return {
                name,
                uuid: `Actor.${name}`,
                logic: { data: { health: { value, max } } },
            };
        }

        it("carries each resolved member's health as a percentage and a band", () => {
            resolveRefs({ aldric: withHealth("Aldric", 72) });
            const logic = makeCohort({
                members: [member("aldric")],
            }) as CohortLogic;

            const [row] = logic.memberRows;
            expect(row.healthPct).toBe(72);
            expect(row.healthBand).toBe("Fair");
            // The band is displayed via its key, never as the raw token.
            expect(row.healthBandLabel).toBe("SOHL.Health.BAND.Fair");
        });

        it("reports the percentage relative to max, not the raw value", () => {
            resolveRefs({ aldric: withHealth("Aldric", 30, 60) });
            const logic = makeCohort({
                members: [member("aldric")],
            }) as CohortLogic;

            expect(logic.memberRows[0].healthPct).toBe(50);
        });

        it("bands the extremes as Excellent and Dead", () => {
            resolveRefs({
                hale: withHealth("Hale", 100),
                slain: withHealth("Slain", 0),
            });
            const logic = makeCohort({
                members: [member("hale"), member("slain")],
            }) as CohortLogic;

            expect(logic.memberRows.map((r) => r.healthBand)).toEqual([
                "Excellent",
                "Dead",
            ]);
        });

        it("leaves health undefined for a member whose actor does not resolve", () => {
            resolveRefs({});
            const logic = makeCohort({
                members: [member("ghost")],
            }) as CohortLogic;

            const [row] = logic.memberRows;
            expect(row.isResolved).toBe(false);
            expect(row.healthPct).toBeUndefined();
            expect(row.healthBand).toBeUndefined();
        });

        it("leaves health undefined when the resolved actor exposes none", () => {
            resolveRefs({ aldric: { name: "Aldric", uuid: "Actor.a1" } });
            const logic = makeCohort({
                members: [member("aldric")],
            }) as CohortLogic;

            const [row] = logic.memberRows;
            expect(row.isResolved).toBe(true);
            expect(row.healthPct).toBeUndefined();
            expect(row.healthBand).toBeUndefined();
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

    describe("membership intrinsic actions", () => {
        /** An action context carrying the given scope, with dialogs skipped. */
        function ctx(scope: Record<string, unknown> = {}, skipDialog = true) {
            return { scope, skipDialog } as any;
        }

        /** The `update()` payloads the cohort's actor was asked to persist. */
        function updates(logic: CohortLogic) {
            return ((logic.data as any).update as any).mock.calls.map(
                (call: unknown[]) => call[0],
            );
        }

        it("defines addMember / removeMember / toggleLeader", () => {
            const logic = makeCohort();
            for (const name of ["addMember", "removeMember", "toggleLeader"])
                expect(logic.actions.has(name)).toBe(true);
        });

        describe("addMember", () => {
            it("adds a member whose handle resolves to an actor", async () => {
                resolveRefs({ aldric: { name: "Aldric" } });
                const logic = makeCohort() as CohortLogic;

                await logic.addMember(
                    ctx({ shortcodeOrUuid: "aldric", role: "director" }),
                );

                expect(updates(logic)).toEqual([
                    {
                        "system.members": [
                            { shortcodeOrUuid: "aldric", role: "director" },
                        ],
                    },
                ]);
            });

            it("defaults an unrecognized role to MEMBER", async () => {
                resolveRefs({ aldric: { name: "Aldric" } });
                const logic = makeCohort() as CohortLogic;

                await logic.addMember(
                    ctx({ shortcodeOrUuid: "aldric", role: "monarch" }),
                );

                expect(updates(logic)[0]["system.members"][0].role).toBe(
                    "member",
                );
            });

            it("refuses a handle that names no actor", async () => {
                resolveRefs({});
                const logic = makeCohort() as CohortLogic;

                await logic.addMember(ctx({ shortcodeOrUuid: "nobody" }));

                expect(updates(logic)).toEqual([]);
            });

            it("refuses a handle that is already a member", async () => {
                resolveRefs({ aldric: { name: "Aldric" } });
                const logic = makeCohort({
                    members: [member("aldric")],
                }) as CohortLogic;

                await logic.addMember(ctx({ shortcodeOrUuid: "aldric" }));

                expect(updates(logic)).toEqual([]);
            });

            it("asks for the handle when none was supplied, even with skipDialog", async () => {
                resolveRefs({ aldric: { name: "Aldric" } });
                const ask = vi
                    .spyOn(FoundryHelpersMock, "dialog")
                    .mockResolvedValue({
                        shortcodeOrUuid: "aldric",
                        role: "member",
                    });
                const logic = makeCohort() as CohortLogic;

                await logic.addMember(ctx({}));

                expect(ask).toHaveBeenCalledOnce();
                expect(updates(logic)[0]["system.members"]).toEqual([
                    { shortcodeOrUuid: "aldric", role: "member" },
                ]);
            });

            it("adds nothing when the dialog is dismissed", async () => {
                resolveRefs({ aldric: { name: "Aldric" } });
                vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(
                    undefined,
                );
                const logic = makeCohort() as CohortLogic;

                await logic.addMember(ctx({}, false));

                expect(updates(logic)).toEqual([]);
            });
        });

        describe("removeMember", () => {
            it("removes the named member once confirmed", async () => {
                resolveRefs({});
                vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(true);
                const logic = makeCohort({
                    members: [member("aldric"), member("brunjar")],
                }) as CohortLogic;

                await logic.removeMember(
                    ctx({ shortcodeOrUuid: "aldric" }, false),
                );

                expect(updates(logic)[0]["system.members"]).toEqual([
                    member("brunjar"),
                ]);
            });

            it("removes nothing when the confirmation is declined", async () => {
                resolveRefs({});
                vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(false);
                const logic = makeCohort({
                    members: [member("aldric")],
                }) as CohortLogic;

                await logic.removeMember(
                    ctx({ shortcodeOrUuid: "aldric" }, false),
                );

                expect(updates(logic)).toEqual([]);
            });

            it("clears the leader when the leader is removed", async () => {
                resolveRefs({});
                const logic = makeCohort({
                    members: [member("aldric")],
                    leaderCode: "aldric",
                }) as CohortLogic;

                await logic.removeMember(ctx({ shortcodeOrUuid: "aldric" }));

                expect(updates(logic)[0]).toEqual({
                    "system.members": [],
                    "system.leaderCode": null,
                });
            });

            it("ignores a handle that is not a member", async () => {
                resolveRefs({});
                const logic = makeCohort({
                    members: [member("aldric")],
                }) as CohortLogic;

                await logic.removeMember(ctx({ shortcodeOrUuid: "nobody" }));

                expect(updates(logic)).toEqual([]);
            });
        });

        describe("toggleLeader", () => {
            it("promotes a member who is not yet the leader", async () => {
                resolveRefs({});
                const logic = makeCohort({
                    members: [member("aldric"), member("brunjar")],
                }) as CohortLogic;

                await logic.toggleLeader(ctx({ shortcodeOrUuid: "brunjar" }));

                expect(updates(logic)).toEqual([
                    { "system.leaderCode": "brunjar" },
                ]);
            });

            it("displaces the sitting leader", async () => {
                resolveRefs({});
                const logic = makeCohort({
                    members: [member("aldric"), member("brunjar")],
                    leaderCode: "aldric",
                }) as CohortLogic;

                await logic.toggleLeader(ctx({ shortcodeOrUuid: "brunjar" }));

                expect(updates(logic)).toEqual([
                    { "system.leaderCode": "brunjar" },
                ]);
            });

            it("stands the leader down when toggled again — no leader", async () => {
                resolveRefs({});
                const logic = makeCohort({
                    members: [member("aldric")],
                    leaderCode: "aldric",
                }) as CohortLogic;

                await logic.toggleLeader(ctx({ shortcodeOrUuid: "aldric" }));

                expect(updates(logic)).toEqual([{ "system.leaderCode": null }]);
            });

            it("ignores a handle that is not a member", async () => {
                resolveRefs({});
                const logic = makeCohort({
                    members: [member("aldric")],
                }) as CohortLogic;

                await logic.toggleLeader(ctx({ shortcodeOrUuid: "nobody" }));

                expect(updates(logic)).toEqual([]);
            });

            it("asks which member to promote when invoked with no handle", async () => {
                resolveRefs({});
                vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(
                    "aldric",
                );
                const logic = makeCohort({
                    members: [member("aldric")],
                }) as CohortLogic;

                await logic.toggleLeader(ctx({}));

                expect(updates(logic)).toEqual([
                    { "system.leaderCode": "aldric" },
                ]);
            });

            it("does nothing when a memberless cohort is asked for a leader", async () => {
                resolveRefs({});
                const ask = vi.spyOn(FoundryHelpersMock, "dialog");
                const logic = makeCohort() as CohortLogic;

                await logic.toggleLeader(ctx({}));

                expect(ask).not.toHaveBeenCalled();
                expect(updates(logic)).toEqual([]);
            });
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
        it.todo("defines leaderCode as a nullable StringField");
        it.todo("defines movementProfiles as an ArrayField");
        it.todo(
            "defines members as ArrayField of {shortcodeOrUuid, role} schemas",
        );
        it.todo("members role defaults to COHORT_MEMBER_ROLE.MEMBER");
    });

    it.todo("has kind set to ACTOR_KIND.COHORT");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
