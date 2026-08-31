import { describe, it, expect } from "vitest";
import { parseVersion, compareVersions, isNewerVersion } from "@src/entity/migration/version";

describe("parseVersion", () => {
    it("parses a dotted numeric version into a padded triple", () => {
        expect(parseVersion("0.7.0")).toEqual([0, 7, 0]);
        expect(parseVersion("1.2.3")).toEqual([1, 2, 3]);
    });

    it("pads missing components with zeros", () => {
        expect(parseVersion("1")).toEqual([1, 0, 0]);
        expect(parseVersion("1.4")).toEqual([1, 4, 0]);
    });

    it("treats an empty or nullish version as 0.0.0", () => {
        expect(parseVersion("")).toEqual([0, 0, 0]);
        expect(parseVersion(undefined as unknown as string)).toEqual([0, 0, 0]);
        expect(parseVersion(null as unknown as string)).toEqual([0, 0, 0]);
    });

    it("ignores a pre-release / build suffix and trims whitespace", () => {
        expect(parseVersion("1.2.3-beta.1")).toEqual([1, 2, 3]);
        expect(parseVersion("1.2.3+build.9")).toEqual([1, 2, 3]);
        expect(parseVersion("  0.7.0  ")).toEqual([0, 7, 0]);
    });

    it("coerces a non-numeric component to 0 rather than NaN", () => {
        expect(parseVersion("1.x.3")).toEqual([1, 0, 3]);
    });
});

describe("compareVersions", () => {
    it("returns 0 for equal versions (including differing zero-padding)", () => {
        expect(compareVersions("0.7.0", "0.7.0")).toBe(0);
        expect(compareVersions("1", "1.0.0")).toBe(0);
        expect(compareVersions("", "0.0.0")).toBe(0);
    });

    it("returns -1 when the first version is older", () => {
        expect(compareVersions("0.6.9", "0.7.0")).toBe(-1);
        expect(compareVersions("0.7.0", "0.7.1")).toBe(-1);
        expect(compareVersions("0.7.0", "1.0.0")).toBe(-1);
    });

    it("returns 1 when the first version is newer", () => {
        expect(compareVersions("0.7.1", "0.7.0")).toBe(1);
        expect(compareVersions("1.0.0", "0.9.9")).toBe(1);
    });

    it("compares numerically, not lexically (10 > 9)", () => {
        expect(compareVersions("0.10.0", "0.9.0")).toBe(1);
    });
});

describe("isNewerVersion", () => {
    it("is true only when the candidate is strictly newer than the baseline", () => {
        expect(isNewerVersion("0.7.1", "0.7.0")).toBe(true);
        expect(isNewerVersion("0.7.0", "0.7.0")).toBe(false);
        expect(isNewerVersion("0.6.9", "0.7.0")).toBe(false);
    });

    it("treats an empty baseline as 0.0.0 (any real version is newer)", () => {
        expect(isNewerVersion("0.1.0", "")).toBe(true);
        expect(isNewerVersion("0.0.0", "")).toBe(false);
    });
});
