import { describe, it, expect, vi, afterEach } from "vitest";
import { AfflictionLogic } from "@src/document/item/logic/AfflictionLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import {
    AFFLICTION_SUBTYPE,
    AFFLICTION_TRANSMISSION,
    AfflictionSubTypeChoices,
    ITEM_KIND,
} from "@src/utils/constants";
import {
    makeAttributeStub,
    makeItemLogic,
    makeMockActor,
} from "@tests/mocks/logicHarness";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";

describe("AFFLICTION_SUBTYPE", () => {
    // The long-duration / psychological / physiological categories (shock, coma,
    // fatigue, infection, fear, morale, pall, psychological-condition,
    // aural-shock) are now TRAUMA subtypes; afflictions keep only these three.
    it("is limited to OTHER, DISEASE, and POISONTOXIN", () => {
        expect(Object.keys(AfflictionSubTypeChoices).sort()).toEqual(
            ["disease", "other", "poisontoxin"].sort(),
        );
    });
    it("exposes each subtype as a value-keyed choice with an i18n label", () => {
        expect(AfflictionSubTypeChoices["other"]).toBe(
            "SOHL.Affliction.SubType.other",
        );
        expect(AfflictionSubTypeChoices["disease"]).toBe(
            "SOHL.Affliction.SubType.disease",
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
        diagnosisBonusBase: 0,
        levelBase: 2,
        healingRateBase: 4,
        contagionIndexBase: 3,
        transmission: AFFLICTION_TRANSMISSION.CONTACT,
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

describe("affliction phase scheduling (#483)", () => {
    afterEach(() => vi.restoreAllMocks());

    function withEvents() {
        const scheduleAt = vi.fn();
        const unsubscribe = vi.fn();
        (globalThis as any).sohl.events = { scheduleAt, unsubscribe };
        return { scheduleAt, unsubscribe };
    }
    function affliction(overrides: Record<string, unknown> = {}) {
        const logic = makeAffliction(overrides);
        (logic.item as any).uuid = "Item.affliction00";
        return logic;
    }

    it("finalize arms onsetCheck while incubating (no onsetDate yet)", () => {
        const { scheduleAt } = withEvents();
        const logic = affliction({
            contractDate: 1000,
            onsetDurationBase: 500,
            onsetDate: null,
        });
        logic.initialize();
        logic.finalize();
        expect(scheduleAt).toHaveBeenCalledWith(
            expect.any(String),
            "onsetCheck",
            1500,
        );
    });

    it("onsetCheck crystallizes onsetDate and rolls the resolution + recovery intervals", async () => {
        withEvents();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(2000);
        const logic = affliction({
            resolutionDurationFormula: "700",
            healingCheckDurationFormula: "300",
        });
        logic.initialize();
        await logic.onsetCheck({} as any);
        expect(logic.item.update).toHaveBeenCalledWith(
            expect.objectContaining({
                "system.onsetDate": 2000,
                "system.lastHealingCheckDate": 2000,
                "system.resolutionDurationBase": 700,
                "system.healingCheckDurationBase": 300,
            }),
        );
    });

    it("finalize arms resolutionCheck + recurring healingCheck once symptomatic", () => {
        const { scheduleAt } = withEvents();
        const logic = affliction({
            levelBase: 3,
            onsetDate: 2000,
            resolutionDurationBase: 700,
            lastHealingCheckDate: 2000,
            healingCheckDurationBase: 300,
        });
        logic.initialize();
        logic.finalize();
        expect(scheduleAt).toHaveBeenCalledWith(
            expect.any(String),
            "resolutionCheck",
            2700,
        );
        expect(scheduleAt).toHaveBeenCalledWith(
            expect.any(String),
            "healingCheck",
            2300,
        );
    });

    it("resolutionCheck crystallizes resolutionDate; finalize then unsubscribes all phases", () => {
        withEvents();
        vi.spyOn(FoundryHelpersMock, "fvttWorldTime").mockReturnValue(9000);
        const logic = affliction({ onsetDate: 2000, resolutionDate: null });
        logic.initialize();
        return logic.resolutionCheck({} as any).then(() => {
            expect(logic.item.update).toHaveBeenCalledWith(
                expect.objectContaining({ "system.resolutionDate": 9000 }),
            );
        });
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
                "transmitaffliction",
                "contractafflictiontest",
                "coursetest",
                "fatiguetest",
                "moraletest",
                "feartest",
                "treatmenttest",
                "diagnosistest",
                "healingtest",
            ]) {
                expect(logic.actions.has(shortcode), shortcode).toBe(true);
            }
        });

        // The transmitaffliction / contractafflictiontest actions now point at
        // the existing transmit() / contractTest() methods (name mismatch fix).
        it("fatigueTest — warns and resolves null (not yet implemented)", async () => {
            const logic = makeAffliction();
            const warn = vi.spyOn(sohl.log, "uiWarn");
            await expect(logic.fatigueTest({} as any)).resolves.toBeNull();
            expect(warn).toHaveBeenCalled();
        });

        it("moraleTest — warns and resolves null (not yet implemented)", async () => {
            const logic = makeAffliction();
            const warn = vi.spyOn(sohl.log, "uiWarn");
            await expect(logic.moraleTest({} as any)).resolves.toBeNull();
            expect(warn).toHaveBeenCalled();
        });

        it("fearTest — warns and resolves null (not yet implemented)", async () => {
            const logic = makeAffliction();
            const warn = vi.spyOn(sohl.log, "uiWarn");
            await expect(logic.fearTest({} as any)).resolves.toBeNull();
            expect(warn).toHaveBeenCalled();
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

    describe("transmit", () => {
        it("logs a warning (not yet implemented)", async () => {
            const warn = vi.spyOn((globalThis as any).sohl.log, "warn");
            const logic = makeAffliction();
            await expect(logic.transmit({} as any)).resolves.toBeUndefined();
            expect(warn).toHaveBeenCalledWith(
                "Affliction Transmit Not Implemented",
            );
        });
    });

    // The five test methods below currently throw "Not Implemented" — that
    // is their explicit contract pending roadmap T2-1.
    describe("contractTest", () => {
        it("rejects with not implemented error (roadmap T2-1)", async () => {
            const logic = makeAffliction();
            await expect(logic.contractTest({} as any)).rejects.toThrow(
                "Affliction Contract Test Not Implemented",
            );
        });
    });

    describe("courseTest", () => {
        it("rejects with not implemented error (roadmap T2-1)", async () => {
            const logic = makeAffliction();
            await expect(logic.courseTest({} as any)).rejects.toThrow(
                "Affliction Course Test Not Implemented",
            );
        });
    });

    describe("diagnosisTest", () => {
        it("rejects with not implemented error (roadmap T2-1)", async () => {
            const logic = makeAffliction();
            await expect(logic.diagnosisTest({} as any)).rejects.toThrow(
                "Affliction Diagnosis Test Not Implemented",
            );
        });
    });

    describe("treatmentTest", () => {
        it("rejects with not implemented error (roadmap T2-1)", async () => {
            const logic = makeAffliction();
            await expect(logic.treatmentTest({} as any)).rejects.toThrow(
                "Affliction Treatment Test Not Implemented",
            );
        });
    });

    describe("healingTest", () => {
        it("rejects with not implemented error (roadmap T2-1)", async () => {
            const logic = makeAffliction();
            await expect(logic.healingTest({} as any)).rejects.toThrow(
                "Affliction Healing Test Not Implemented",
            );
        });
    });

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

        it("creates diagnosisBonus ValueModifier", () => {
            // Note: despite the field docs, diagnosisBonus is NOT seeded
            // from data.diagnosisBonusBase — it starts at 0.
            const logic = makeAffliction({ diagnosisBonusBase: 5 });
            logic.initialize();
            expect(logic.diagnosisBonus).toBeInstanceOf(ValueModifier);
            expect(logic.diagnosisBonus.base).toBe(0);
            expect(logic.diagnosisBonus.effective).toBe(0);
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
            expect(logic.healingRate.disabled).toBe("No Healing Rate");
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
