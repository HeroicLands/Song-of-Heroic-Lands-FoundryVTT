import { describe, it, expect, vi, afterEach } from "vitest";
import { AfflictionLogic } from "@src/document/item/logic/AfflictionLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import {
    AFFLICTION_SUBTYPE,
    AFFLICTION_TRANSMISSION,
    AfflictionSubTypeChoices,
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    ITEM_KIND,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
} from "@src/utils/constants";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import {
    makeAttributeStub,
    makeItemLogic,
    makeMockActor,
} from "@tests/mocks/logicHarness";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";
import * as ActionCard from "@src/document/chat/action-card";

describe("AFFLICTION_SUBTYPE", () => {
    // The long-duration / psychological / physiological categories (shock, coma,
    // fatigue, infection, fear, morale, pall, psychological-condition,
    // aural-shock) are now TRAUMA subtypes. Afflictions classify the incoming
    // agent by nature: POISONTOXIN (chemical), DISEASE (biological),
    // MALADICTION (supernatural — curse/hex/divine blight), plus OTHER.
    it("is limited to OTHER, DISEASE, POISONTOXIN, and MALADICTION", () => {
        expect(Object.keys(AfflictionSubTypeChoices).sort()).toEqual(
            ["disease", "maladiction", "other", "poisontoxin"].sort(),
        );
    });
    it("exposes each subtype as a value-keyed choice with an i18n label", () => {
        expect(AfflictionSubTypeChoices["other"]).toBe(
            "SOHL.Affliction.SubType.other",
        );
        expect(AfflictionSubTypeChoices["disease"]).toBe(
            "SOHL.Affliction.SubType.disease",
        );
        expect(AfflictionSubTypeChoices["maladiction"]).toBe(
            "SOHL.Affliction.SubType.maladiction",
        );
    });
});

/** Default AfflictionData fields; override per test. */
function afflictionFields(overrides: Record<string, unknown> = {}) {
    return {
        subType: AFFLICTION_SUBTYPE.DISEASE,
        category: "",
        isDormant: false,
        treatmentDate: null,
        onsetFormula: "2d6",
        levelBase: 2,
        healingRateBase: 4,
        contagionIndexBase: 3,
        transmission: AFFLICTION_TRANSMISSION.CONTACT,
        onsetMacroUuid: "",
        outcome: "cured",
        outcomeTrauma: "",
        ...overrides,
    };
}

function makeAffliction(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        AfflictionLogic,
        ITEM_KIND.AFFLICTION,
        afflictionFields(overrides),
        opts,
    );
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("affliction phase scheduling on the generic store (#483, #579, #588)", () => {
    afterEach(() => vi.restoreAllMocks());

    /** A `system.scheduledActions` seed (generic store, issue #588). */
    function sched(actionName: string, anchor: number, interval: number) {
        return {
            scheduledActions: [
                { actionName, anchor, interval, sceneUuid: "", payload: {} },
            ],
        };
    }

    function withStore() {
        (globalThis as any).sohl.events = {
            scheduleAt: vi.fn(),
            unsubscribe: vi.fn(),
        };
        const schedule = vi.spyOn((globalThis as any).sohl, "schedule");
        const unschedule = vi.spyOn((globalThis as any).sohl, "unschedule");
        return {
            scheduleAt: (globalThis as any).sohl.events.scheduleAt,
            schedule,
            unschedule,
        };
    }
    function affliction(overrides: Record<string, unknown> = {}) {
        const logic = makeAffliction(overrides);
        (logic.item as any).uuid = "Item.affliction00";
        return logic;
    }

    it("finalize re-arms the persisted onsetCheck schedule while incubating", () => {
        const { scheduleAt } = withStore();
        const logic = affliction({
            onsetDate: null,
            ...sched("onsetCheck", 1000, 500),
        });
        logic.initialize();
        logic.finalize();
        expect(scheduleAt).toHaveBeenCalledWith(
            expect.any(String),
            "onsetCheck",
            1500,
            {},
            undefined,
        );
    });

    it("setOnset crystallizes onsetDate, rolls the intervals, and schedules NOTHING (#1183)", async () => {
        const { schedule, unschedule } = withStore();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(2000);
        const logic = affliction({
            resolutionDurationFormula: "700",
            healingCheckDurationFormula: "300",
        });
        logic.initialize();
        await logic.setOnset({ skipDialog: true } as any);
        const update = (logic.item.update as any).mock.calls.at(-1)?.[0] ?? {};
        expect(update).toMatchObject({
            "system.onsetDate": 2000,
            "system.resolutionDurationBase": 700,
            "system.healingCheckDurationBase": 300,
        });
        expect(update).not.toHaveProperty("system.lastHealingCheckDate");
        // No further event is created — onset arms nothing. Only the spent onset
        // check is cleared; the course and resolution checks are each offered on
        // their own terms.
        expect(schedule).not.toHaveBeenCalled();
        expect(unschedule).toHaveBeenCalledWith(logic.item, "onsetCheck");
    });

    it("setOnset does nothing when the confirmation is declined (#1183)", async () => {
        const { schedule, unschedule } = withStore();
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(false);
        const logic = affliction({});
        logic.initialize();
        await expect(logic.setOnset({} as any)).resolves.toBeUndefined();
        expect(logic.item.update).not.toHaveBeenCalled();
        expect(schedule).not.toHaveBeenCalled();
        expect(unschedule).not.toHaveBeenCalled();
    });

    it("onsetCheck only posts a card — it sets no onset (#1183)", async () => {
        const { schedule, unschedule } = withStore();
        const post = vi
            .spyOn(ActionCard, "postActionCard")
            .mockResolvedValue(undefined as never);
        const logic = affliction({});
        logic.initialize();
        (logic.item.update as any).mockClear();
        await logic.onsetCheck({} as any);
        // It offers, and only offers: a card with a Set Onset button, no writes.
        expect(post).toHaveBeenCalledTimes(1);
        expect(post.mock.calls[0][1].buttons).toMatchObject({
            action: "setOnset",
        });
        expect(logic.item.update).not.toHaveBeenCalled();
        expect(schedule).not.toHaveBeenCalled();
        expect(unschedule).not.toHaveBeenCalled();
    });

    it("onsetCheck runs the optional onset Macro after crystallizing onset (#488)", async () => {
        withStore();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(2000);
        const exec = vi
            .spyOn(FoundryHelpersMock, "fvttExecuteMacro")
            .mockResolvedValue(undefined);
        const logic = affliction({
            onsetMacroUuid: "Macro.abc123",
            resolutionDurationFormula: "700",
            healingCheckDurationFormula: "300",
        });
        logic.initialize();
        await logic.setOnset({ skipDialog: true } as any);
        expect(exec).toHaveBeenCalledWith(
            "Macro.abc123",
            expect.objectContaining({ affliction: logic }),
        );
        // The macro runs after onset is persisted (symptomatic).
        expect(logic.item.update).toHaveBeenCalled();
    });

    it("onsetCheck does not run a macro when none is authored (#488)", async () => {
        withStore();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(2000);
        const exec = vi
            .spyOn(FoundryHelpersMock, "fvttExecuteMacro")
            .mockResolvedValue(undefined);
        const logic = affliction({ onsetMacroUuid: "" });
        logic.initialize();
        await logic.setOnset({ skipDialog: true } as any);
        expect(exec).not.toHaveBeenCalled();
    });

    it("finalize re-arms every persisted schedule once symptomatic", () => {
        const { scheduleAt } = withStore();
        const logic = affliction({
            levelBase: 3,
            onsetDate: 2000,
            scheduledActions: [
                {
                    actionName: "resolutionCheck",
                    anchor: 2000,
                    interval: 700,
                    sceneUuid: "",
                    payload: {},
                },
                {
                    actionName: "courseCheck",
                    anchor: 2000,
                    interval: 300,
                    sceneUuid: "",
                    payload: {},
                },
            ],
        });
        logic.initialize();
        logic.finalize();
        expect(scheduleAt).toHaveBeenCalledWith(
            expect.any(String),
            "resolutionCheck",
            2700,
            {},
            undefined,
        );
        expect(scheduleAt).toHaveBeenCalledWith(
            expect.any(String),
            "courseCheck",
            2300,
            {},
            undefined,
        );
    });

    it("setResolution records the chosen outcome + date and clears the schedules (#1183)", async () => {
        const { unschedule } = withStore();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(9000);
        const logic = affliction({ onsetDate: 2000, resolutionDate: null });
        logic.initialize();
        await logic.setResolution({
            skipDialog: true,
            scope: { outcome: "death" },
        } as any);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({
                "system.resolutionDate": 9000,
                "system.outcome": "death",
            }),
        );
        expect(unschedule).toHaveBeenCalledWith(logic.item, "courseCheck");
        expect(unschedule).toHaveBeenCalledWith(logic.item, "healingCheck");
        expect(unschedule).toHaveBeenCalledWith(logic.item, "resolutionCheck");
    });

    it("setResolution falls back to the authored outcome when none is supplied", async () => {
        withStore();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(9000);
        const logic = affliction({ outcome: "cured", resolutionDate: null });
        logic.initialize();
        await logic.setResolution({ skipDialog: true } as any);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.outcome": "cured" }),
        );
    });

    it("setResolution does nothing when the dialog is dismissed (#1183)", async () => {
        const { unschedule } = withStore();
        vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(null);
        const logic = affliction({ resolutionDate: null });
        logic.initialize();
        await expect(logic.setResolution({} as any)).resolves.toBeUndefined();
        expect(logic.item.update).not.toHaveBeenCalled();
        expect(unschedule).not.toHaveBeenCalled();
    });

    it("resolutionCheck only posts a card — it settles nothing (#1183)", async () => {
        const { unschedule } = withStore();
        const post = vi
            .spyOn(ActionCard, "postActionCard")
            .mockResolvedValue(undefined as never);
        const logic = affliction({ resolutionDate: null });
        logic.initialize();
        (logic.item.update as any).mockClear();
        await logic.resolutionCheck({} as any);
        // It offers, and only offers: a card with a Set Resolution button.
        expect(post).toHaveBeenCalledTimes(1);
        expect(post.mock.calls[0][1].buttons).toMatchObject({
            action: "setResolution",
        });
        expect(logic.item.update).not.toHaveBeenCalled();
        expect(unschedule).not.toHaveBeenCalled();
    });
});

describe("AfflictionLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object AfflictionData (no Foundry)", () => {
            const logic = makeAffliction();
            expect(logic).toBeInstanceOf(AfflictionLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.AFFLICTION);
        });

        it("builds all intrinsic actions (every executor resolves)", () => {
            const logic = makeAffliction();
            for (const shortcode of [
                "editDocument",
                "deleteDocument",
                "requestTreatment",
                "treatAffliction",
                "courseTest",
                "courseCheck",
                "onsetCheck",
                "resolutionCheck",
            ]) {
                expect(logic.actions.has(shortcode), shortcode).toBe(true);
            }
        });
    });

    describe("getters", () => {
        /** Build an affliction embedded on an actor carrying an Endurance attribute. */
        function makeAfflictionOnActor(
            overrides: Record<string, unknown> = {},
            enduranceOpts?: { disabled?: string } | null,
        ) {
            const actor = makeMockActor();
            if (enduranceOpts !== null) {
                actor.items.set(
                    "end0000000mock",
                    makeAttributeStub("end", 12, enduranceOpts ?? {}),
                );
            }
            const logic = makeAffliction(overrides, { actor });
            logic.initialize();
            return logic;
        }

        it("canTransmit - returns true (placeholder)", () => {
            expect(makeAffliction().canTransmit).toBe(true);
        });

        it("canContract - returns true (placeholder)", () => {
            expect(makeAffliction().canContract).toBe(true);
        });

        // hasCourse gates the Course Test on the affliction being active
        // (not dormant) AND the actor having a usable Endurance attribute —
        // matching the pre-port v0.5.6 courseTest contextCondition (#65).
        describe("hasCourse", () => {
            it("true when active and the actor has a usable Endurance attribute", () => {
                expect(
                    makeAfflictionOnActor({ isDormant: false }).hasCourse,
                ).toBe(true);
            });

            it("false when the affliction is dormant", () => {
                expect(
                    makeAfflictionOnActor({ isDormant: true }).hasCourse,
                ).toBe(false);
            });

            it("false when the actor has no Endurance attribute", () => {
                expect(
                    makeAfflictionOnActor({ isDormant: false }, null).hasCourse,
                ).toBe(false);
            });

            it("false when the actor's Endurance mastery is disabled", () => {
                expect(
                    makeAfflictionOnActor(
                        { isDormant: false },
                        { disabled: "SOHL.MasteryLevel.Disabled" },
                    ).hasCourse,
                ).toBe(false);
            });

            it("false when the affliction is not on any actor", () => {
                const logic = makeAffliction({ isDormant: false });
                logic.initialize();
                expect(logic.hasCourse).toBe(false);
            });
        });

        // canTreat gates the Treatment Test on the affliction not yet having
        // been treated — matching the pre-port v0.5.6 treatmentTest
        // contextCondition (#65). Afflictions have no `isBleeding` field (that
        // lives on Trauma), so the old FIXME's pysn/isBleeding gate never applied.
        describe("canTreat", () => {
            it("true when the affliction is untreated", () => {
                expect(makeAffliction({ treatmentDate: null }).canTreat).toBe(
                    true,
                );
            });

            it("false when the affliction is already treated", () => {
                // isTreated is derived from treatmentDate (#484).
                expect(makeAffliction({ treatmentDate: 123456 }).canTreat).toBe(
                    false,
                );
            });
        });

        // canHeal gates the Healing Test on the affliction having a usable
        // (non-disabled) healing rate AND the actor having a usable Endurance
        // attribute — matching the pre-port v0.5.6 healingTest contextCondition (#65).
        describe("canHeal", () => {
            it("true when healing rate is enabled and the actor has usable Endurance", () => {
                expect(
                    makeAfflictionOnActor({ healingRateBase: 4 }).canHeal,
                ).toBe(true);
            });

            it("false when the healing rate is disabled (healingRateBase null)", () => {
                expect(
                    makeAfflictionOnActor({ healingRateBase: null }).canHeal,
                ).toBe(false);
            });

            it("false when the actor has no Endurance attribute", () => {
                expect(
                    makeAfflictionOnActor({ healingRateBase: 4 }, null).canHeal,
                ).toBe(false);
            });

            it("false when the actor's Endurance mastery is disabled", () => {
                expect(
                    makeAfflictionOnActor(
                        { healingRateBase: 4 },
                        { disabled: "SOHL.MasteryLevel.Disabled" },
                    ).canHeal,
                ).toBe(false);
            });
        });
    });

    describe("levelLabel", () => {
        // The named-severity subtypes (fear, morale) are now traumas — see
        // Trauma.test.ts. On afflictions, levelLabel is just the numeric level.
        it("returns the numeric level as a string", () => {
            const logic = makeAffliction({
                subType: AFFLICTION_SUBTYPE.DISEASE,
                levelBase: 3,
            });
            logic.initialize();
            expect(logic.levelLabel).toBe("3");
        });

        it("clamps negative effective levels to 0", () => {
            const logic = makeAffliction({
                subType: AFFLICTION_SUBTYPE.DISEASE,
                levelBase: -2,
            });
            logic.initialize();
            expect(logic.levelLabel).toBe("0");
        });

        it("does not throw before initialize() — level not yet seeded (#511)", () => {
            // A freshly-dropped affliction can be read by the sheet before its
            // logic.initialize() has run, so `level` (a ValueModifier assigned
            // in initialize) is still undefined. The getter must degrade to "0"
            // rather than throw and brick the sheet.
            const logic = makeAffliction({
                subType: AFFLICTION_SUBTYPE.DISEASE,
                levelBase: 3,
            });
            // deliberately NOT calling logic.initialize()
            expect(() => logic.levelLabel).not.toThrow();
            expect(logic.levelLabel).toBe("0");
        });
    });

    describe("categoryLabel", () => {
        // The categorized subtypes (fatigue) are now traumas — see
        // Trauma.test.ts. On afflictions, categoryLabel is the raw category.
        it("returns empty string when category is unset", () => {
            const logic = makeAffliction({ category: "" });
            expect(logic.categoryLabel).toBe("");
        });

        it("returns the raw category string", () => {
            const logic = makeAffliction({
                subType: AFFLICTION_SUBTYPE.DISEASE,
                category: "plague",
            });
            expect(logic.categoryLabel).toBe("plague");
        });
    });

    // The five test methods below currently throw "Not Implemented" — that
    // is their explicit contract pending roadmap T2-1.

    describe("initialize", () => {
        it("sets isDormant to false", () => {
            const logic = makeAffliction();
            logic.initialize();
            expect(logic.isDormant).toBe(false);
        });

        it("derives isTreated from treatmentDate (#484)", () => {
            expect(makeAffliction({ treatmentDate: null }).isTreated).toBe(
                false,
            );
            expect(makeAffliction({ treatmentDate: 123456 }).isTreated).toBe(
                true,
            );
        });

        it("creates level ValueModifier from data.levelBase", () => {
            const logic = makeAffliction({ levelBase: 4 });
            logic.initialize();
            expect(logic.level).toBeInstanceOf(ValueModifier);
            expect(logic.level.base).toBe(4);
            expect(logic.level.effective).toBe(4);
        });

        it("creates healingRate ValueModifier from data.healingRateBase", () => {
            const logic = makeAffliction({ healingRateBase: 5 });
            logic.initialize();
            expect(logic.healingRate).toBeInstanceOf(ValueModifier);
            expect(logic.healingRate.base).toBe(5);
            expect(logic.healingRate.effective).toBe(5);
            expect(logic.healingRate.disabled).toBeFalsy();
        });

        it("disables healingRate when healingRateBase is null", () => {
            const logic = makeAffliction({ healingRateBase: null });
            logic.initialize();
            expect(logic.healingRate.disabled).toBe(
                "SOHL.Affliction.NoHealingRate",
            );
            expect(logic.healingRate.effective).toBe(0);
        });

        it("creates contagionIndex ValueModifier from data.contagionIndexBase", () => {
            const logic = makeAffliction({ contagionIndexBase: 3 });
            logic.initialize();
            expect(logic.contagionIndex).toBeInstanceOf(ValueModifier);
            expect(logic.contagionIndex.base).toBe(3);
            expect(logic.contagionIndex.effective).toBe(3);
        });

        it("sets transmission to AFFLICTION_TRANSMISSION.NONE", () => {
            // Note: current behavior ignores data.transmission; initialize
            // always resets to NONE.
            const logic = makeAffliction({
                transmission: AFFLICTION_TRANSMISSION.CONTACT,
            });
            logic.initialize();
            expect(logic.transmission).toBe(AFFLICTION_TRANSMISSION.NONE);
        });
    });

    describe("evaluate / finalize", () => {
        it("run without error after initialize", () => {
            const logic = makeAffliction();
            logic.initialize();
            expect(() => {
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });
    });
});

describe("AfflictionDataModel", () => {
    // The DataModel is Foundry-layer (implements AfflictionData via Foundry's
    // schema system); its schema is exercised in Foundry integration, not
    // in unit tests.
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines subType with AfflictionSubTypes choices");
        it.todo("defines category as a StringField");
        it.todo("defines isDormant as a BooleanField");
        it.todo("defines treatmentDate as a nullable NumberField");
        it.todo("defines diagnosisBonusBase as a NumberField");
        it.todo("defines levelBase as a NumberField with min 0");
        // "No natural healing" is an unset value (nullable, initial null),
        // not a -1 sentinel; the nullable schema is exercised in Foundry
        // integration (cypress/e2e/afflictions.cy.js), not in unit tests.
        it.todo("defines healingRateBase as a nullable NumberField");
        it.todo("defines contagionIndexBase as a NumberField with min 0");
        it.todo("defines transmission with AfflictionTransmissions choices");
    });

    it.todo("has kind set to ITEM_KIND.AFFLICTION");
});

describe("resolution outcome effect (#490)", () => {
    afterEach(() => vi.restoreAllMocks());

    function resolvingAffliction(overrides: Record<string, unknown> = {}) {
        const actor = makeMockActor();
        (actor.logic as any).setShockState = vi
            .fn()
            .mockResolvedValue(undefined);
        const logic = makeAffliction(
            {
                onsetDate: 2000,
                resolutionDate: null,
                healingRateBase: 3,
                ...overrides,
            },
            { actor },
        );
        (logic.item as any).uuid = "Item.affliction0";
        logic.initialize();
        return { logic, actor };
    }

    it("DEATH sets the being's shock state to Dead", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(9000);
        const { logic, actor } = resolvingAffliction({ outcome: "death" });
        await logic.setResolution({ skipDialog: true } as any);
        expect((actor.logic as any).setShockState).toHaveBeenCalledWith(4);
    });

    it("CURED sets Healing Rate to 6", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(9000);
        const { logic } = resolvingAffliction({ outcome: "cured" });
        await logic.setResolution({ skipDialog: true } as any);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.healingRateBase": 6 }),
        );
    });

    it("does not apply the outcome when the affliction was defeated (HR 6+)", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(9000);
        const { logic, actor } = resolvingAffliction({
            outcome: "death",
            healingRateBase: 6,
        });
        await logic.setResolution({ skipDialog: true } as any);
        expect((actor.logic as any).setShockState).not.toHaveBeenCalled();
    });

    it("contracts the outcome trauma, combining with the outcome", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(9000);
        vi.spyOn(
            FoundryHelpersMock,
            "fvttFindItemByShortcode",
        ).mockResolvedValue({
            type: "trauma",
            name: "Weakness",
            system: { shortcode: "weakness20" },
        });
        const create = vi
            .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
            .mockResolvedValue([]);
        const { logic } = resolvingAffliction({
            outcome: "cured",
            outcomeTrauma: "'weakness20'",
        });
        await logic.setResolution({ skipDialog: true } as any);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({ "system.healingRateBase": 6 }),
        );
        expect(create).toHaveBeenCalledWith(logic.actorLogic, [
            expect.objectContaining({
                system: expect.objectContaining({ shortcode: "weakness20" }),
            }),
        ]);
    });

    it("resolves an array of outcome trauma shortcodes", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(9000);
        const find = vi
            .spyOn(FoundryHelpersMock, "fvttFindItemByShortcode")
            .mockImplementation(async (code: string) => ({
                type: "trauma",
                name: code,
                system: { shortcode: code },
            }));
        const create = vi
            .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
            .mockResolvedValue([]);
        const { logic } = resolvingAffliction({
            outcome: "cured",
            outcomeTrauma: "['a', 'b']",
        });
        await logic.setResolution({ skipDialog: true } as any);
        expect(find).toHaveBeenCalledTimes(2);
        expect((create.mock.calls[0][1] as any[]).length).toBe(2);
    });

    it("warns and creates nothing when an outcome trauma is not found", async () => {
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(9000);
        vi.spyOn(
            FoundryHelpersMock,
            "fvttFindItemByShortcode",
        ).mockResolvedValue(undefined);
        const create = vi
            .spyOn(FoundryHelpersMock, "fvttCreateEmbeddedItems")
            .mockResolvedValue([]);
        const warn = vi.spyOn(sohl.log, "warn");
        const { logic } = resolvingAffliction({
            outcome: "cured",
            outcomeTrauma: "'nope'",
        });
        await logic.setResolution({ skipDialog: true } as any);
        expect(warn).toHaveBeenCalled();
        expect(create).not.toHaveBeenCalled();
    });
});

describe("view-only computed dates (#943)", () => {
    afterEach(() => vi.restoreAllMocks());

    /** A `system.scheduledActions` seed (generic store, issue #588). */
    function sched(actionName: string, anchor: number, interval: number) {
        return { actionName, anchor, interval, sceneUuid: "", payload: {} };
    }

    it("estOnsetDate = contractDate + onsetDurationBase", () => {
        const logic = makeAffliction({
            contractDate: 1000,
            onsetDurationBase: 500,
        });
        logic.initialize();
        expect(logic.estOnsetDate).toBe(1500);
    });

    it("estOnsetDate is undefined without a contract date", () => {
        const logic = makeAffliction({
            contractDate: null,
            onsetDurationBase: 500,
        });
        logic.initialize();
        expect(logic.estOnsetDate).toBeUndefined();
    });

    it("estResolutionDate anchors on onsetDate once symptomatic", () => {
        const logic = makeAffliction({
            contractDate: 1000,
            onsetDate: 2000,
            resolutionDurationBase: 300,
        });
        logic.initialize();
        expect(logic.estResolutionDate).toBe(2300);
    });

    it("estResolutionDate falls back to contractDate while incubating", () => {
        const logic = makeAffliction({
            contractDate: 1000,
            onsetDate: null,
            resolutionDurationBase: 300,
        });
        logic.initialize();
        expect(logic.estResolutionDate).toBe(1300);
    });

    it("nextHealTest uses the armed courseCheck schedule (anchor + interval)", () => {
        const logic = makeAffliction({
            contractDate: 1000,
            onsetDate: 2000,
            healingCheckDurationBase: 400,
            scheduledActions: [sched("courseCheck", 5000, 700)],
        });
        logic.initialize();
        // The live schedule wins over the arithmetic fallback.
        expect(logic.nextHealTest).toBe(5700);
    });

    it("nextHealTest falls back to (onsetDate ?? contractDate) + healingCheckDurationBase", () => {
        const logic = makeAffliction({
            contractDate: 1000,
            onsetDate: 2000,
            healingCheckDurationBase: 400,
            scheduledActions: [],
        });
        logic.initialize();
        expect(logic.nextHealTest).toBe(2400);
    });

    it("nextHealTest is undefined with no schedule and no interval", () => {
        const logic = makeAffliction({
            contractDate: 1000,
            healingCheckDurationBase: 0,
            scheduledActions: [],
        });
        logic.initialize();
        expect(logic.nextHealTest).toBeUndefined();
    });
});
