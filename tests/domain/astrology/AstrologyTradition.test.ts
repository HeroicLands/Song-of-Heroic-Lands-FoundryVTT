import { describe, it, expect } from "vitest";
import {
    dayOfYear,
    daysInYear,
    signsForDate,
    signByShortcode,
    builtinTraditions,
    type AstrologyTradition,
    type AstrologyDate,
} from "@src/entity/astrology";

/** The default SoHL calendar: twelve 30-day months (360-day year). */
const MONTHS_30 = Array(12).fill(30) as number[];

/** Build an {@link AstrologyDate} on the default 12×30 calendar. */
function date(month: number, day: number): AstrologyDate {
    return { month, day, monthLengths: MONTHS_30 };
}

/** A two-sign tradition splitting the 360-day year in half, cusp 2 days. */
const TWO_SIGN: AstrologyTradition = {
    key: "t",
    label: "T",
    signs: [
        {
            shortcode: "alpha",
            label: "Alpha",
            start: { month: 1, day: 1 },
            end: { month: 6, day: 30 }, // day-of-year 1..180
            cuspDays: 2,
            skillModifiers: { aaa: 15, "subtype:combat": 5 },
        },
        {
            shortcode: "beta",
            label: "Beta",
            start: { month: 7, day: 1 }, // day-of-year 181..360
            end: { month: 12, day: 30 },
            cuspDays: 2,
            skillModifiers: { aaa: -15, bbb: 10 },
        },
    ],
};

describe("astrology day arithmetic", () => {
    it("dayOfYear is 1-based and accumulates prior months", () => {
        expect(dayOfYear({ month: 1, day: 1 }, MONTHS_30)).toBe(1);
        expect(dayOfYear({ month: 1, day: 30 }, MONTHS_30)).toBe(30);
        expect(dayOfYear({ month: 2, day: 1 }, MONTHS_30)).toBe(31);
        expect(dayOfYear({ month: 12, day: 30 }, MONTHS_30)).toBe(360);
    });

    it("daysInYear sums the month lengths", () => {
        expect(daysInYear(MONTHS_30)).toBe(360);
        expect(daysInYear([31, 28, 31])).toBe(90);
    });
});

describe("signsForDate", () => {
    it("returns the single governing sign on an ordinary day", () => {
        expect(
            signsForDate(TWO_SIGN, date(3, 15)).map((s) => s.shortcode),
        ).toEqual(["alpha"]);
        expect(
            signsForDate(TWO_SIGN, date(9, 15)).map((s) => s.shortcode),
        ).toEqual(["beta"]);
    });

    it("returns both signs on a cusp (within cuspDays of a shared boundary)", () => {
        // Alpha ends day 180 (6/30); Beta starts day 181 (7/1). cuspDays=2, so
        // 6/29 (179) and 7/2 (182) both fall under both signs.
        expect(
            signsForDate(TWO_SIGN, date(6, 29))
                .map((s) => s.shortcode)
                .sort(),
        ).toEqual(["alpha", "beta"]);
        expect(
            signsForDate(TWO_SIGN, date(7, 2))
                .map((s) => s.shortcode)
                .sort(),
        ).toEqual(["alpha", "beta"]);
    });

    it("just outside the cusp yields a single sign", () => {
        // 6/27 (177) is 3 days before the boundary — beyond cuspDays=2.
        expect(
            signsForDate(TWO_SIGN, date(6, 27)).map((s) => s.shortcode),
        ).toEqual(["alpha"]);
    });

    it("handles a window that wraps across year-end", () => {
        const wrap: AstrologyTradition = {
            key: "w",
            label: "W",
            signs: [
                {
                    shortcode: "wrapper",
                    label: "Wrapper",
                    start: { month: 11, day: 1 }, // 301
                    end: { month: 2, day: 30 }, // 60 (wraps)
                    cuspDays: 0,
                    skillModifiers: { zzz: 1 },
                },
            ],
        };
        expect(
            signsForDate(wrap, date(12, 15)).map((s) => s.shortcode),
        ).toEqual(["wrapper"]);
        expect(signsForDate(wrap, date(1, 20)).map((s) => s.shortcode)).toEqual(
            ["wrapper"],
        );
        expect(signsForDate(wrap, date(6, 15))).toEqual([]);
    });

    it("cuspDays of 0 yields an exact, non-overlapping partition at the boundary", () => {
        const exact: AstrologyTradition = {
            key: "e",
            label: "E",
            signs: TWO_SIGN.signs.map((s) => ({ ...s, cuspDays: 0 })),
        };
        expect(
            signsForDate(exact, date(6, 30)).map((s) => s.shortcode),
        ).toEqual(["alpha"]);
        expect(signsForDate(exact, date(7, 1)).map((s) => s.shortcode)).toEqual(
            ["beta"],
        );
    });
});

describe("signByShortcode", () => {
    it("finds a sign case-insensitively", () => {
        expect(signByShortcode(TWO_SIGN, "ALPHA")?.shortcode).toBe("alpha");
        expect(signByShortcode(TWO_SIGN, "beta")?.label).toBe("Beta");
    });

    it("returns undefined for an unknown shortcode", () => {
        expect(signByShortcode(TWO_SIGN, "gamma")).toBeUndefined();
    });
});

describe("builtinTraditions", () => {
    it("ships the Astrokýklos with twelve signs", () => {
        const reg = builtinTraditions();
        const tradition = reg["astrokyklos"];
        expect(tradition).toBeDefined();
        expect(tradition.signs).toHaveLength(12);
        expect(tradition.source).toBe("builtin");
        expect(tradition.signs.map((s) => s.shortcode)).toContain("arnos");
    });

    it("returns a fresh object each call (caller may mutate its copy)", () => {
        const a = builtinTraditions();
        const b = builtinTraditions();
        expect(a).not.toBe(b);
        a["extra"] = { key: "extra", label: "X", signs: [] };
        expect(b["extra"]).toBeUndefined();
    });

    it("every day of the year is governed by a sign (one, or two on a cusp)", () => {
        const tradition = builtinTraditions()["astrokyklos"];
        for (let m = 1; m <= 12; m++) {
            for (let d = 1; d <= 30; d++) {
                const n = signsForDate(tradition, date(m, d)).length;
                expect(n, `${m}/${d}`).toBeGreaterThanOrEqual(1);
                expect(n, `${m}/${d}`).toBeLessThanOrEqual(2);
            }
        }
    });

    it("treats the first two and last two days of a period as a cusp (both signs)", () => {
        const tradition = builtinTraditions()["astrokyklos"];
        // Arnos ends Blossomreach day 3; Bourax starts Blossomreach day 4. The
        // last 2 days of Arnos (Bls 2–3) and first 2 of Bourax (Bls 4–5) are cusps.
        for (const d of [2, 3, 4, 5]) {
            expect(
                signsForDate(tradition, date(2, d))
                    .map((s) => s.shortcode)
                    .sort(),
                `Blossomreach ${d}`,
            ).toEqual(["arnos", "bourax"]);
        }
        // Just outside the cusp on each side → a single sign.
        expect(
            signsForDate(tradition, date(2, 1)).map((s) => s.shortcode),
        ).toEqual(["arnos"]);
        expect(
            signsForDate(tradition, date(2, 6)).map((s) => s.shortcode),
        ).toEqual(["bourax"]);
    });

    it("maps Héx Hodäi elements to their skill subtypes (Arnos)", () => {
        // Arnos: earth +15, metal +5, fire -5, air -15, spirit -5, water +5.
        const arnos = builtinTraditions()["astrokyklos"].signs.find(
            (s) => s.shortcode === "arnos",
        )!;
        expect(arnos.skillModifiers).toEqual({
            "subtype:nature": 15, // earth
            "subtype:script": 5, // metal
            "subtype:craft": 5, // metal
            "subtype:combattechnique": -5, // fire
            "subtype:combat": -5, // fire
            "subtype:physical": -15, // air
            "subtype:mystical": -5, // spirit
            "subtype:lore": -5, // spirit
            "subtype:language": 5, // water
            "subtype:social": 5, // water
        });
    });

    it("omits zero-valued elements (Bourax has no fire or water)", () => {
        // Bourax: earth +10, metal +10, fire 0, air -10, spirit -10, water 0.
        const bourax = builtinTraditions()["astrokyklos"].signs.find(
            (s) => s.shortcode === "bourax",
        )!;
        expect(bourax.skillModifiers).toEqual({
            "subtype:nature": 10,
            "subtype:script": 10,
            "subtype:craft": 10,
            "subtype:physical": -10,
            "subtype:mystical": -10,
            "subtype:lore": -10,
        });
    });
});
