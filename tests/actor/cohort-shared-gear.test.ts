import { describe, it, expect } from "vitest";
import {
    collectSharedGear,
    isSharedWithCohort,
} from "@src/document/actor/logic/cohort-shared-gear";

/** A minimal gear stub: a name plus the cohort references it is shared with. */
interface GearStub {
    name: string;
    data: { sharedWithCohortIds?: string[] };
}

/** Build a gear stub shared with the given cohort references. */
function gear(name: string, sharedWithCohortIds: string[] = []): GearStub {
    return { name, data: { sharedWithCohortIds } };
}

/** A carrier (cohort member) holding the given gear. */
function carrier(name: string, ...items: GearStub[]) {
    return { name, uuid: `Actor.${name}`, gear: items };
}

describe("isSharedWithCohort", () => {
    it("matches when a sharing entry names one of the cohort's references", () => {
        expect(isSharedWithCohort(["wardens"], ["wardens", "abc"])).toBe(true);
    });

    it("matches a cohort's document id as well as its shortcode", () => {
        expect(isSharedWithCohort(["abc123"], ["wardens", "abc123"])).toBe(
            true,
        );
    });

    it("matches a cohort UUID", () => {
        expect(
            isSharedWithCohort(["Actor.abc123"], ["wardens", "Actor.abc123"]),
        ).toBe(true);
    });

    it("does not match a different cohort", () => {
        expect(isSharedWithCohort(["bandits"], ["wardens"])).toBe(false);
    });

    it("is false for an empty or absent sharing list", () => {
        expect(isSharedWithCohort([], ["wardens"])).toBe(false);
        expect(isSharedWithCohort(undefined, ["wardens"])).toBe(false);
    });

    it("is false when the cohort has no references", () => {
        expect(isSharedWithCohort(["wardens"], [])).toBe(false);
    });

    it("never matches on an empty-string reference", () => {
        expect(isSharedWithCohort([""], [""])).toBe(false);
    });
});

describe("collectSharedGear", () => {
    it("returns only gear shared with this cohort, paired with its carrier", () => {
        const shared = gear("Rope", ["wardens"]);
        const carriers = [carrier("Aldric", shared, gear("Dagger"))];

        const rows = collectSharedGear(carriers, ["wardens"]);

        expect(rows).toHaveLength(1);
        expect(rows[0].gear).toBe(shared);
        expect(rows[0].carrierName).toBe("Aldric");
        expect(rows[0].carrierUuid).toBe("Actor.Aldric");
    });

    it("aggregates across every member without duplicating item data", () => {
        const rope = gear("Rope", ["wardens"]);
        const lantern = gear("Lantern", ["wardens"]);
        const rows = collectSharedGear(
            [carrier("Aldric", rope), carrier("Brunjar", lantern)],
            ["wardens"],
        );

        expect(rows.map((r) => r.gear)).toEqual([rope, lantern]);
        expect(rows.map((r) => r.carrierName)).toEqual(["Aldric", "Brunjar"]);
    });

    it("orders rows by carrier name, then item name", () => {
        const rows = collectSharedGear(
            [
                carrier(
                    "Brunjar",
                    gear("Tent", ["wardens"]),
                    gear("Axe", ["wardens"]),
                ),
                carrier("Aldric", gear("Rope", ["wardens"])),
            ],
            ["wardens"],
        );

        expect(rows.map((r) => `${r.carrierName}/${r.gear.name}`)).toEqual([
            "Aldric/Rope",
            "Brunjar/Axe",
            "Brunjar/Tent",
        ]);
    });

    it("ignores gear shared with a different cohort", () => {
        const rows = collectSharedGear(
            [carrier("Aldric", gear("Rope", ["bandits"]))],
            ["wardens"],
        );
        expect(rows).toEqual([]);
    });

    it("returns an empty list when the cohort has no members", () => {
        expect(collectSharedGear([], ["wardens"])).toEqual([]);
    });

    it("tolerates gear whose sharing list is absent", () => {
        const rows = collectSharedGear(
            [carrier("Aldric", { name: "Rope", data: {} })],
            ["wardens"],
        );
        expect(rows).toEqual([]);
    });
});
