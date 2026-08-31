import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * #1105 — the Attribute sheet's Properties tab rendered its two scalar fields
 * (`system.scoreBase`, `system.initDiceFormula`) with **empty** `<label>`s.
 *
 * The cause is not in the template: `formGroup` labels a field from
 * `field.label`, which Foundry's `Localization.localizeSchema` only assigns when
 * a `<PREFIX>.FIELDS.<path>.label` key exists. `AttributeDataModel` declares
 * `LOCALIZATION_PREFIXES = ["SOHL.Attribute", …]` but `lang/en.json` carried no
 * `SOHL.Attribute.FIELDS.*` entries at all, so both labels stayed unset.
 *
 * `package-build lang coverage` cannot catch this (it treats every
 * `LOCALIZATION_PREFIXES` entry as a namespace, not a concrete key), so the
 * guard lives here: every field the Attribute Properties tab binds with
 * `formGroup` must have a resolvable label under one of the model's prefixes.
 */

const REPO_ROOT = resolve(__dirname, "../../..");

const LANG: Record<string, string> = JSON.parse(
    readFileSync(resolve(REPO_ROOT, "lang/en.json"), "utf8"),
);

const TEMPLATE = readFileSync(
    resolve(REPO_ROOT, "templates/item/attribute-properties.hbs"),
    "utf8",
);

/** The prefixes `AttributeDataModel.LOCALIZATION_PREFIXES` declares, in order. */
const PREFIXES = ["SOHL.Attribute", "SOHL.MasteryLevel", "SOHL.Item"];

/**
 * Every `{{formGroup fields.<name> …}}` binding in the Attribute Properties
 * template, read from the template itself so a newly bound field is covered
 * without editing this test.
 */
function boundFields(): string[] {
    return [
        ...new Set([...TEMPLATE.matchAll(/\{\{formGroup\s+fields\.([\w.]+)/g)].map((m) => m[1])),
    ];
}

/** Resolve `FIELDS.<path>.<suffix>` against the model's prefixes, in order. */
function resolveFieldKey(path: string, suffix: string): string | undefined {
    return PREFIXES.map((p) => `${p}.FIELDS.${path}.${suffix}`).find(
        (k) => typeof LANG[k] === "string" && LANG[k].trim() !== "",
    );
}

describe("Attribute Properties tab field labels (#1105)", () => {
    it("binds the score and init-dice fields", () => {
        // Guards the discovery above: if the template stops using formGroup the
        // per-field assertions below would vacuously pass.
        expect(boundFields()).toEqual(expect.arrayContaining(["scoreBase", "initDiceFormula"]));
    });

    it.each(["scoreBase", "initDiceFormula"])("labels %s from a localization key", (field) => {
        expect(resolveFieldKey(field, "label")).toBeDefined();
    });

    it.each(["scoreBase", "initDiceFormula"])("hints %s from a localization key", (field) => {
        expect(resolveFieldKey(field, "hint")).toBeDefined();
    });

    it("labels every field the template binds with formGroup", () => {
        const unlabelled = boundFields().filter((f) => !resolveFieldKey(f, "label"));
        expect(unlabelled).toEqual([]);
    });
});
