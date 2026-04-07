import { describe, it, expect } from "vitest";
import { MovementProfile } from "@src/domain/movement/MovementProfile";

const SAMPLE_FACTOR: MovementProfile.Factor = {
    scope: "terrain",
    key: "road",
    mode: "multiply",
    textValue: "1.5",
};

const TERRESTRIAL: MovementProfile.Data = {
    medium: "terrestrial",
    metersPerRound: 10,
    metersPerWatch: 20000,
    disabled: false,
    factors: [SAMPLE_FACTOR],
};

const AQUATIC: MovementProfile.Data = {
    medium: "aquatic",
    metersPerRound: 5,
    metersPerWatch: 8000,
    disabled: false,
    factors: [],
};

// Minimal mock beingLogic with canonical data
const MOCK_BEING_LOGIC = {
    data: {
        movementProfiles: [TERRESTRIAL, AQUATIC],
    },
} as any;

describe("MovementProfile", () => {
    describe("construction", () => {
        it("creates from data with all properties", () => {
            const profile = new MovementProfile(TERRESTRIAL, MOCK_BEING_LOGIC, 0);
            expect(profile.medium).toBe("terrestrial");
            expect(profile.metersPerRound.effective).toBe(10);
            expect(profile.metersPerWatch.effective).toBe(20000);
            expect(profile.disabled).toBe(false);
            expect(profile.factors).toHaveLength(1);
            expect(profile.index).toBe(0);
        });

        it("copies factors defensively", () => {
            const data = { ...TERRESTRIAL, factors: [{ ...SAMPLE_FACTOR }] };
            const profile = new MovementProfile(data, MOCK_BEING_LOGIC, 0);
            data.factors[0].textValue = "changed";
            expect(profile.factors[0].textValue).toBe("1.5");
        });
    });

    describe("index and updatePath", () => {
        it("has correct index", () => {
            const profile = new MovementProfile(AQUATIC, MOCK_BEING_LOGIC, 1);
            expect(profile.index).toBe(1);
        });

        it("builds dot-notation update path", () => {
            const profile = new MovementProfile(AQUATIC, MOCK_BEING_LOGIC, 1);
            expect(profile.updatePath).toBe("system.movementProfiles.1");
        });
    });

    describe("getByMedium", () => {
        it("finds a profile by medium from beingLogic", () => {
            const profiles = [TERRESTRIAL, AQUATIC].map(
                (d, i) => new MovementProfile(d, MOCK_BEING_LOGIC, i),
            );
            const found = MovementProfile.getByMedium(profiles, "aquatic");
            expect(found).toBeDefined();
            expect(found!.medium).toBe("aquatic");
        });

        it("returns undefined for unknown medium", () => {
            const profiles = [TERRESTRIAL].map(
                (d, i) => new MovementProfile(d, MOCK_BEING_LOGIC, i),
            );
            expect(
                MovementProfile.getByMedium(profiles, "aerial"),
            ).toBeUndefined();
        });
    });

    describe("addProfileUpdate", () => {
        it("returns update payload with new profile appended", () => {
            const profile = new MovementProfile(TERRESTRIAL, MOCK_BEING_LOGIC, 0);
            const newData: MovementProfile.Data = {
                medium: "aerial",
                metersPerRound: 20,
                metersPerWatch: 40000,
                disabled: false,
                factors: [],
            };
            const update = MovementProfile.addProfileUpdate(
                MOCK_BEING_LOGIC,
                newData,
            );
            const profiles = update["system.movementProfiles"];
            expect(profiles).toHaveLength(3);
            expect(profiles[2].medium).toBe("aerial");
        });
    });

    describe("removeProfileUpdate", () => {
        it("returns update payload with profile removed by medium", () => {
            const update = MovementProfile.removeProfileUpdate(
                MOCK_BEING_LOGIC,
                "aquatic",
            );
            const profiles = update["system.movementProfiles"];
            expect(profiles).toHaveLength(1);
            expect(profiles[0].medium).toBe("terrestrial");
        });

        it("returns unchanged array if medium not found", () => {
            const update = MovementProfile.removeProfileUpdate(
                MOCK_BEING_LOGIC,
                "aerial",
            );
            const profiles = update["system.movementProfiles"];
            expect(profiles).toHaveLength(2);
        });
    });

});
