/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Render real SoHL card + dialog templates in Node (no Foundry) and assert the
 * emitted HTML — the output of the card/dialog-building actions. Uses the shared
 * render harness ({@link renderTemplateReal}), which registers the same pure
 * helpers production does (via `registerPureHandlebarsHelpers`) plus faithful
 * Foundry logic/option-list helpers and placeholder stubs for the DOM builders.
 */

import { describe, it, expect } from "vitest";
import Handlebars from "handlebars";
import {
    renderTemplateReal,
    registerTestHbsHelpers,
} from "@tests/mocks/hbs-helpers";

const CHAT = "systems/sohl/templates/chat";
const DIALOG = "systems/sohl/templates/dialog";

describe("treatment cards (TraumaLogic.requestTreatment / performTreatmentTest)", () => {
    it("treatment-request-card binds patient + wound + aspect/severity", () => {
        const html = renderTemplateReal(`${CHAT}/treatment-request-card.hbs`, {
            patientName: "Aldric",
            woundName: "gash on the thorax",
            aspect: "edged",
            severity: 4,
        });
        expect(html).toContain("Treatment Requested");
        expect(html).toContain("Aldric");
        expect(html).toContain("gash on the thorax");
        // Aspect renders the localized label, not the bare enum value (#951).
        expect(html).toContain("Edged");
        expect(html).not.toContain(">edged<");
    });

    it("treatment-result-card shows the physician + a numeric Healing Rate", () => {
        const html = renderTemplateReal(`${CHAT}/treatment-result-card.hbs`, {
            physicianName: "Brother Cede",
            aspect: "edged",
            severity: 4,
            treatment: "SUR",
            hr: 4,
        });
        expect(html).toContain("Brother Cede");
        expect(html).toContain("H4"); // Heal Rate H{{hr}}
        expect(html).toContain("Treatment Result");
    });

    it("treatment-result-card renders `Healed` for a heal result (the `lt hr 0` branch)", () => {
        const html = renderTemplateReal(`${CHAT}/treatment-result-card.hbs`, {
            physicianName: "Brother Cede",
            aspect: "blunt",
            severity: 1,
            hr: -1,
        });
        expect(html).toContain("Healed");
    });

    it("treatment-result-card shows the infection / impairment / bleeder warnings when the builder flags them (#846)", () => {
        const html = renderTemplateReal(`${CHAT}/treatment-result-card.hbs`, {
            physicianName: "Brother Cede",
            aspect: "edged",
            severity: 4,
            treatment: "SUR",
            hr: 2,
            infect: true,
            impair: true,
            bleed: true,
        });
        expect(html).toContain("Infection risk");
        expect(html).toContain("Permanent impairment risk");
        expect(html).toContain("Treatment results in a bleeder");
    });

    it("treatment-result-card shows the amputation branch when newInj/newSev are provided (#846)", () => {
        const html = renderTemplateReal(`${CHAT}/treatment-result-card.hbs`, {
            physicianName: "Brother Cede",
            aspect: "edged",
            severity: 5,
            treatment: "AMP",
            hr: 2,
            newInj: 5,
            newSev: "G",
        });
        expect(html).toContain("Amputation results in a new G5 edged");
    });

    it("treatment-result-card omits every warning when no flags are set", () => {
        const html = renderTemplateReal(`${CHAT}/treatment-result-card.hbs`, {
            physicianName: "Brother Cede",
            aspect: "edged",
            severity: 1,
            treatment: "CLN",
            hr: 5,
        });
        expect(html).not.toContain("Infection risk");
        expect(html).not.toContain("Permanent impairment risk");
        expect(html).not.toContain("results in a bleeder");
        expect(html).not.toContain("Amputation results");
    });
});

describe("other action cards render with their logic helpers", () => {
    it("shock-card (`gt`) binds state + index computation", () => {
        const html = renderTemplateReal(`${CHAT}/shock-card.hbs`, {
            title: "Shock Test",
            shockText: "Incapacitated",
            shockML: 40,
            finalShockIndex: 7,
            origShockIndex: 5,
        });
        expect(html).toContain("Shock Test");
        expect(html).toContain("Incapacitated");
    });

    it("attack-result-card (`or`, `gt`, `toJSON`) binds attacker/defender + result", () => {
        const html = renderTemplateReal(`${CHAT}/attack-result-card.hbs`, {
            title: "Attack Result",
            attacker: "Aldric",
            defender: "Bandit",
            resultDesc: "A telling blow",
            outnumbered: true,
        });
        expect(html).toContain("Attack Result");
        expect(html).toContain("A telling blow");
    });
});

describe("dialogs render through the same shim as cards", () => {
    it("resolve-injury-dialog builds Target ZN / Zone Die inputs, a derive-default location list, and localized aspect labels (#828)", () => {
        const html = renderTemplateReal(`${DIALOG}/resolve-injury-dialog.hbs`, {
            hitLocations: [
                { code: "th", name: "Thorax" },
                { code: "hd", name: "Head" },
            ],
            // Default: derive from Target ZN + ZD (no specific location chosen).
            bodyLocationCode: "",
            targetZoneNumber: 1,
            zoneDie: 3,
            maxZoneNumber: 3,
            aspect: "edged",
            impact: 12,
            armorReduction: 0,
            treatmentModifier: 0,
            bleedImpactPenalty: 0,
            aspectChoices: {
                blunt: "SOHL.ImpactModifier.Aspect.blunt",
                edged: "SOHL.ImpactModifier.Aspect.edged",
                piercing: "SOHL.ImpactModifier.Aspect.piercing",
            },
        });
        // Zone-die targeting fields (not a body-part select).
        expect(html).toContain('name="targetZoneNumber"');
        expect(html).toContain('name="zoneDie"');
        expect(html).not.toContain('name="targetBodyPartCode"');
        expect(html).not.toContain('name="spread"');
        // Location dropdown defaults to derive.
        expect(html).toContain("(derive from Target ZN + ZD)");
        expect(html).toContain('<option value="th">Thorax</option>');
        // Aspect renders localized labels, not the bare enum value.
        expect(html).toContain('<option value="edged" selected>Edged</option>');
        expect(html).toContain('<option value="blunt">Blunt</option>');
        // Deriving by default, the aim fields are not disabled.
        expect(html).not.toMatch(/name="targetZoneNumber"[^>]*disabled/);
        expect(html).toContain('name="autoAddInjury"');
    });

    it("resolve-injury-dialog disables the aim fields when a specific location is chosen (#828)", () => {
        const html = renderTemplateReal(`${DIALOG}/resolve-injury-dialog.hbs`, {
            hitLocations: [{ code: "th", name: "Thorax" }],
            bodyLocationCode: "th", // a manual override
            targetZoneNumber: 1,
            zoneDie: 3,
            maxZoneNumber: 3,
            aspect: "blunt",
            impact: 0,
            armorReduction: 0,
            treatmentModifier: 0,
            bleedImpactPenalty: 0,
            aspectChoices: {
                blunt: "SOHL.ImpactModifier.Aspect.blunt",
                edged: "SOHL.ImpactModifier.Aspect.edged",
            },
        });
        expect(html).toMatch(/name="targetZoneNumber"[\s\S]*?disabled/);
        expect(html).toMatch(/name="zoneDie"[\s\S]*?disabled/);
    });

    it("amputation-test-dialog binds the location + editable modifier", () => {
        const html = renderTemplateReal(
            `${DIALOG}/amputation-test-dialog.hbs`,
            { locationName: "Neck", modifier: -20 },
        );
        expect(html).toContain("Neck");
        expect(html).toContain('name="modifier"');
        expect(html).toContain('value="-20"');
    });

    it("treat-injury-dialog (my Healing Rate input) renders bound", () => {
        const html = renderTemplateReal(`${DIALOG}/treat-injury-dialog.hbs`, {
            healingRate: 3,
        });
        expect(html).toContain('name="healingRate"');
        expect(html).toContain('value="3"');
    });
});

describe("injury-card zone-die states (#828)", () => {
    const base = {
        actorId: "a1",
        handlerActorUuid: "Actor.a1",
        name: "Longsword",
        bodyZoneName: "Torso",
        zoneName: "Torso",
        locationName: "Thorax",
        aspect: "edged",
        armorType: "",
        armorValue: 0,
        armorReduction: 0,
        impactVal: 12,
        isInjured: true,
        injuryLevelText: "S3",
        shockIndex: 3,
        needsShockRoll: false,
        addToCharSheet: false,
    };

    it("shows the Zone aim trace and the Location name, but never the Body Part", () => {
        const html = renderTemplateReal(`${CHAT}/injury-card.hbs`, {
            ...base,
            isMiss: false,
            locationDerived: true,
            locationOverridden: false,
            targetZoneNumber: 2,
            zoneDie: 6,
            zoneDieLabel: "d6",
            zoneDieResult: 3,
            hitZoneNumber: 4,
            hitZoneName: "Torso",
        });
        const flat = html.replace(/\s+/g, " ");
        // Localized Zone / Location labels.
        expect(html).toContain("Zone:");
        expect(html).toContain("Location:");
        // Zone value is the full aim trace ending in the zone name. The "="
        // comes from inside the localized string, so Handlebars HTML-escapes
        // it (still renders as "=" in the browser); assert around it.
        expect(flat).toContain("ZN 2 + d6 (3)");
        expect(flat).toContain("ZN 4 → Torso");
        // Location value is the location's name (its own value span).
        expect(flat).toContain('<span class="value">Thorax</span>');
        // The Body Part is not shown at all (inferable from the location).
        expect(html).not.toContain("Body Part");
        expect(html).not.toContain("Location overridden by player");
    });

    it("renders the Imp / IL / Shk three-column summary with localized headers", () => {
        const html = renderTemplateReal(`${CHAT}/injury-card.hbs`, {
            ...base,
            isMiss: false,
            locationDerived: true,
            locationOverridden: false,
            targetZoneNumber: 2,
            zoneDie: 6,
            zoneDieLabel: "d6",
            zoneDieResult: 3,
            hitZoneNumber: 4,
            hitZoneName: "Torso",
        });
        // Compact column headers (localized).
        expect(html).toContain("Imp");
        expect(html).toContain("IL");
        expect(html).toContain("Shk");
        // Their values render together in the summary.
        expect(html).toContain("12"); // impact
        expect(html).toContain("S3"); // injury level
        expect(html).toContain("3"); // shock index
    });

    it("shows a red override notice when the location was set by hand", () => {
        const html = renderTemplateReal(`${CHAT}/injury-card.hbs`, {
            ...base,
            isMiss: false,
            locationDerived: false,
            locationOverridden: true,
        });
        expect(html).toContain("Location overridden by player");
        expect(html).toContain("failure-text");
        expect(html).not.toContain("Hit Location Roll:");
    });

    it("renders the miss card with the aim trace and no injury details", () => {
        const html = renderTemplateReal(`${CHAT}/injury-card.hbs`, {
            actorId: "a1",
            handlerActorUuid: "Actor.a1",
            name: "Arrow",
            isMiss: true,
            isInjured: false,
            locationDerived: true,
            targetZoneNumber: 3,
            zoneDie: 6,
            zoneDieLabel: "d6",
            zoneDieResult: 5,
            hitZoneNumber: 7,
            addToCharSheet: false,
        });
        expect(html).toContain("Missed");
        const flatMiss = html.replace(/\s+/g, " ");
        // The "=" inside the localized roll string is HTML-escaped; assert
        // around it. The trace ends in the localized "Missed".
        expect(flatMiss).toContain("ZN 3 + d6 (5)");
        expect(flatMiss).toContain("ZN 7 → Missed");
        expect(html).toContain("no impact");
        // No injury rows on a miss.
        expect(html).not.toContain("Injury Level:");
        expect(html).not.toContain('data-action="injuryShock"');
    });
});

describe("trauma-state-card (Fear / Morale / Pall tests, #558)", () => {
    it("shows the resulting state, a PSY gain, and effect notes", () => {
        const html = renderTemplateReal(`${CHAT}/trauma-state-card.hbs`, {
            actorId: "abc",
            actorName: "Brigga",
            title: "Fear Test",
            stateLabel: "Terrified",
            isSuccess: false,
            psyGain: 1,
            notes: [
                "May respond in combat only with Block or Dodge.",
                "Must flee the source at full Move on the next turn.",
            ],
        });
        expect(html).toContain("Fear Test");
        expect(html).toContain("Brigga");
        expect(html).toContain("Terrified");
        expect(html).toContain("failure-text");
        expect(html).toContain("Gains +1 Psyche Stress.");
        expect(html).toContain("Block or Dodge");
        expect(html).toContain("full Move");
        expect(html).toContain('data-actor-id="abc"');
    });

    it("omits the PSY line and marks a success when there is no stress gain", () => {
        const html = renderTemplateReal(`${CHAT}/trauma-state-card.hbs`, {
            actorId: "abc",
            actorName: "Brigga",
            title: "Fear Test",
            stateLabel: "Brave",
            isSuccess: true,
            psyGain: 0,
            notes: ["Brave — immune to this source."],
        });
        expect(html).toContain("Brave");
        expect(html).toContain("success-text");
        expect(html).not.toContain("Psyche Stress");
    });
});

describe("rally-offer-card (BeingLogic.rallyTest, #559)", () => {
    it("names the rallier and offers to steady on a critical success", () => {
        const html = renderTemplateReal(`${CHAT}/rally-offer-card.hbs`, {
            actorId: "r1",
            rallierName: "Sir Kaldan",
            steady: true,
        });
        expect(html).toContain("Sir Kaldan");
        expect(html).toContain("steady themselves");
        expect(html).not.toContain("Reaction Test");
    });

    it("offers a Reaction Test on a marginal success", () => {
        const html = renderTemplateReal(`${CHAT}/rally-offer-card.hbs`, {
            actorId: "r1",
            rallierName: "Sir Kaldan",
            steady: false,
        });
        expect(html).toContain("Reaction Test");
    });
});

describe("face-pall-card (TraumaLogic.pallRecovery, #561)", () => {
    it("names the victim and lists the three fates", () => {
        const html = renderTemplateReal(`${CHAT}/face-pall-card.hbs`, {
            actorName: "Brother Deven",
        });
        expect(html).toContain("Face the Pall");
        expect(html).toContain("Brother Deven");
        expect(html).toContain("Embrace the Pall");
        expect(html).toContain("Vacate the Body");
        expect(html).toContain("Accept True Death");
    });
});

describe("blood-stoppage cards (#547)", () => {
    it("request card announces the bleeder and wound", () => {
        const html = renderTemplateReal(
            `${CHAT}/blood-stoppage-request-card.hbs`,
            { patientName: "Aldric", woundName: "a deep gash" },
        );
        expect(html).toContain("Blood Stoppage Requested");
        expect(html).toContain("Aldric");
        expect(html).toContain("a deep gash");
    });

    it("result card shows the physician and the outcome", () => {
        const html = renderTemplateReal(
            `${CHAT}/blood-stoppage-result-card.hbs`,
            {
                physicianName: "Sister Mara",
                woundName: "a deep gash",
                outcomeLabel: "Bleeding stops immediately.",
                stopped: true,
            },
        );
        expect(html).toContain("Sister Mara");
        expect(html).toContain("Bleeding stops immediately.");
        expect(html).toContain("success-text");
    });
});

describe("standard-test-card follow-up buttons (#853)", () => {
    const base = {
        title: "Rally Test",
        item: { uuid: "Item.rally1" },
        mlMod: { empty: true, effective: 50 },
        roll: { total: 42 },
        isSuccess: true,
    };

    it("renders caller-supplied action buttons alongside the Fate button", () => {
        const html = renderTemplateReal(`${CHAT}/standard-test-card.hbs`, {
            ...base,
            canFate: true,
            buttons: [
                {
                    action: "treatInjury",
                    handlerUuid: "@self",
                    scopeJSON: '{"woundId":"w1"}',
                    label: "Accept Treatment",
                    iconFAClass: "fa-solid fa-kit-medical",
                    skipDialog: true,
                },
            ],
        });
        // The follow-up action button dispatches through the shared chokepoint,
        // carrying the well-known handles the dispatcher/gater read.
        expect(html).toContain('class="action-card-button"');
        expect(html).toContain('data-action="treatInjury"');
        expect(html).toContain('data-handler-uuid="@self"');
        // scopeJSON is HTML-escaped inside the attribute (never HTML-from-data).
        expect(html).toContain(
            'data-scope="{&quot;woundId&quot;:&quot;w1&quot;}"',
        );
        expect(html).toContain('data-skip-dialog="true"');
        expect(html).toContain("Accept Treatment");
        expect(html).toContain("fa-kit-medical");
        // The existing edit-pencil (GM result-edit, #856) and Fate Test buttons
        // still render.
        expect(html).toContain('data-action="resultEdit"');
        expect(html).toContain('data-action="fateTest"');
    });

    it("renders multiple buttons, each with its own action/handler/scope", () => {
        const html = renderTemplateReal(`${CHAT}/standard-test-card.hbs`, {
            ...base,
            canFate: false,
            buttons: [
                {
                    action: "acceptRally",
                    handlerUuid: "Actor.a1",
                    scopeJSON: "{}",
                    label: "Steady",
                    skipDialog: true,
                },
                {
                    action: "reactionTest",
                    handlerUuid: "@self",
                    scopeJSON: "{}",
                    label: "Reaction Test",
                    skipDialog: false,
                },
            ],
        });
        expect(html).toContain('data-action="acceptRally"');
        expect(html).toContain('data-handler-uuid="Actor.a1"');
        expect(html).toContain('data-action="reactionTest"');
        expect(html).toContain('data-skip-dialog="false"');
    });

    it("renders no action-button block when no buttons are supplied", () => {
        const html = renderTemplateReal(`${CHAT}/standard-test-card.hbs`, {
            ...base,
            canFate: false,
        });
        expect(html).not.toContain("action-card-button");
        // The edit pencil (GM result-edit, #856) is always present regardless.
        expect(html).toContain('data-action="resultEdit"');
    });
});

describe("harness fidelity notes", () => {
    it("formGroup (sheet-tier) renders a binding placeholder, not Foundry markup", () => {
        registerTestHbsHelpers();
        const tpl = Handlebars.compile(
            `{{formGroup fields.origin value=source.origin name="system.origin" disabled=true}}`,
        );
        const html = tpl({
            fields: { origin: { fieldPath: "system.origin" } },
            source: { origin: "a wound" },
        });
        expect(html).toContain('data-helper="formGroup"');
        expect(html).toContain('data-field="system.origin"');
        expect(html).toContain('data-value="a wound"');
        expect(html).toContain("data-disabled");
    });

    it("localize resolves against the real lang/en.json", () => {
        registerTestHbsHelpers();
        const tpl = Handlebars.compile(`{{localize "SOHL.Clear"}}`);
        expect(tpl({})).not.toBe("");
    });

    it("localize performs {placeholder} format substitution from the options hash", () => {
        registerTestHbsHelpers();
        const tpl = Handlebars.compile(
            `{{localize "SOHL.Chat.Attack.subtitle" attacker="Aldric" defender="Bandit"}}`,
        );
        expect(tpl({})).toBe("Aldric vs. Bandit");
    });
});

const ITEM = "systems/sohl/templates/item";

describe("displayed enum values + labels are localized (#951)", () => {
    it("attack-card localizes the aspect value, the Aim/AML labels, and the subtitle", () => {
        const html = renderTemplateReal(`${CHAT}/attack-card.hbs`, {
            actorId: "a1",
            title: "Broadsword Swing",
            attackerName: "Aldric",
            defenderName: "Bandit",
            aimLabel: "High",
            aspect: "edged",
            aml: 75,
        });
        // Localized field labels + interpolated subtitle, not hardcoded English.
        expect(html).toContain("Aim:");
        expect(html).toContain("Aspect:");
        expect(html).toContain("AML:");
        expect(html).toContain("Aldric vs. Bandit");
        // Aspect enum value renders its localized label.
        expect(html).toContain(">Edged<");
        expect(html).not.toContain(">edged<");
    });

    it("damage-card localizes aspect + the calculate-injury button", () => {
        const html = renderTemplateReal(`${CHAT}/damage-card.hbs`, {
            actorId: "a1",
            title: "Dagger Damage",
            impactLabel: "1d6+2",
            rollResult: "5",
            impact: 7,
            aspect: "piercing",
            hasTarget: true,
            targetName: "Bandit",
        });
        expect(html).toContain("Formula:");
        expect(html).toContain("Roll:");
        expect(html).toContain(">Piercing<");
        expect(html).toContain("Calculate Bandit Injury");
    });

    it("missile-damage-card localizes aspect and its impact labels", () => {
        const html = renderTemplateReal(`${CHAT}/missile-damage-card.hbs`, {
            actorId: "a1",
            title: "Arrow Damage",
            damageDice: 2,
            aspect: "blunt",
            range: "Medium",
            rangeImpact: 3,
            addlImpact: 0,
            rollValue: 4,
            totalImpact: 7,
        });
        expect(html).toContain("Num. Damage Dice:");
        expect(html).toContain(">Blunt<");
        expect(html).toContain("Range (+ Impact):");
    });

    it("action ledger localizes the Group column value + header (concat over the SortGroup enum)", () => {
        const html = renderTemplateReal(`${ITEM}/parts/actions.hbs`, {
            tab: { active: true, group: "primary" },
            customActions: [
                {
                    data: {
                        title: "Custom Strike",
                        shortcode: "cstrk",
                        img: "icons/x.svg",
                        group: "general",
                    },
                },
            ],
            intrinsicActions: [],
        });
        // Column headers are localized.
        expect(html).toContain(">Group<");
        expect(html).toContain(">Action<");
        expect(html).toContain(">Custom Actions<");
        // The stored sort-group value renders its localized label, not "general".
        expect(html).toContain(">General<");
        expect(html).not.toContain(">general<");
        // Interpolated run tooltip.
        expect(html).toContain('data-tooltip="Run Custom Strike"');
    });

    it("treatment-test-dialog localizes the aspect <option> labels", () => {
        const html = renderTemplateReal(`${DIALOG}/treatment-test-dialog.hbs`, {
            aspectChoices: {
                blunt: "SOHL.ImpactModifier.Aspect.blunt",
                edged: "SOHL.ImpactModifier.Aspect.edged",
                piercing: "SOHL.ImpactModifier.Aspect.piercing",
            },
        });
        expect(html).toContain("Severity:");
        expect(html).toContain("Aspect:");
        // Options show the localized labels, never the raw i18n key.
        expect(html).toContain('<option value="edged">Edged</option>');
        expect(html).toContain('<option value="blunt">Blunt</option>');
        expect(html).not.toContain("SOHL.ImpactModifier.Aspect.edged");
    });
});
