import { describe, it, expect } from "vitest";
import { MovementProfile } from "@src/domain/movement/MovementProfile";

const SAMPLE_FACTOR: MovementProfile.Factor = {
    scope: "terrain",
    key: "road",
    mode: 0,
    textValue: "1.5",
};

const SAMPLE_DATA: MovementProfile.Data = {
    medium: "terrestrial",
    metersPerRound: 10,
    metersPerWatch: 20000,
    disabled: false,
    factors: [SAMPLE_FACTOR],
};

describe("MovementProfile", () => {
    describe("construction", () => {
        it("creates from data with all properties", () => {
            const profile = new MovementProfile(SAMPLE_DATA);
            expect(profile.medium).toBe("terrestrial");
            expect(profile.metersPerRound).toBe(10);
            expect(profile.metersPerWatch).toBe(20000);
            expect(profile.disabled).toBe(false);
            expect(profile.factors).toHaveLength(1);
        });

        it("copies factors defensively", () => {
            const data = { ...SAMPLE_DATA, factors: [{ ...SAMPLE_FACTOR }] };
            const profile = new MovementProfile(data);
            data.factors[0].textValue = "changed";
            expect(profile.factors[0].textValue).toBe("1.5");
        });
    });

    describe("disabled state", () => {
        it("can be disabled", () => {
            const profile = new MovementProfile({
                ...SAMPLE_DATA,
                disabled: true,
            });
            expect(profile.disabled).toBe(true);
        });
    });

    describe("toJSON", () => {
        it("round-trips through serialization", () => {
            const profile = new MovementProfile(SAMPLE_DATA);
            const json = profile.toJSON();
            expect(json.medium).toBe("terrestrial");
            expect(json.metersPerRound).toBe(10);
            expect(json.metersPerWatch).toBe(20000);
            expect(json.disabled).toBe(false);
            expect(json.factors).toHaveLength(1);
            expect(json.factors[0].key).toBe("road");
        });
    });
});
