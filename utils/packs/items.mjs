/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Items pack compiler — produces JSON pack files for the single "items"
 * Foundry compendium from markdown notes in the `assets/content/` tree.
 *
 * The content root (`contentBase`) is walked recursively; any `.md` file whose
 * frontmatter declares a recognized `type:` is compiled into one JSON entry.
 * Files outside the whitelist (blog posts, rules text, templates) are
 * silently skipped.
 *
 * Type-specific `system.*` fields come from the nested `sohl:` block in
 * vault frontmatter, read via `sohlField()`. The rendered markdown body
 * becomes `system.docHtml`. Folder assignment is deferred — every item
 * currently emits `folder: null`.
 *
 * Not a standalone script — exports the `Items` compiler class, imported and
 * driven by `utils/packs/generate.mjs` (via `npm run build:compiledb`).
 */

import fs from "fs";
import path from "path";
import log from "loglevel";

import {
    walkMarkdownTree,
    sohlField,
    makeFilename,
    slugify,
    buildDocUrl,
    parseValueDesc,
    resolveName,
    buildStats,
} from "./helpers.mjs";

const STATS = buildStats("0.6.0");

const ITEM_TYPES = new Set([
    "affiliation",
    "affliction",
    "armorgear",
    "attribute",
    "combattechnique",
    "concoctiongear",
    "containergear",
    "corpus",
    "miscgear",
    "mystery",
    "mysticalability",
    "projectilegear",
    "skill",
    "trait",
    "trauma",
    "weapongear",
]);

const DEFAULT_IMG = {
    affiliation: "systems/sohl/assets/icons/shield.svg",
    affliction: "systems/sohl/assets/icons/sick.svg",
    armorgear: "systems/sohl/assets/icons/breastplate.svg",
    attribute: "systems/sohl/assets/icons/charm.svg",
    combattechnique: "systems/sohl/assets/icons/crossed-swords.svg",
    concoctiongear: "systems/sohl/assets/icons/flask.svg",
    containergear: "systems/sohl/assets/icons/sack.svg",
    corpus: "systems/sohl/assets/icons/dna.svg",
    miscgear: "systems/sohl/assets/icons/question-mark.svg",
    mystery: "systems/sohl/assets/icons/sparkles.svg",
    mysticalability: "systems/sohl/assets/icons/hand-sparkles.svg",
    projectilegear: "systems/sohl/assets/icons/arrow.svg",
    skill: "systems/sohl/assets/icons/head-gear.svg",
    trait: "systems/sohl/assets/icons/user-gear.svg",
    trauma: "systems/sohl/assets/icons/injury.svg",
    weapongear: "systems/sohl/assets/icons/sword.svg",
};

const PERCEPTION_TEST =
    "(doc.type==='skill' && doc.logic.hasAttr('per'))" +
    "||(doc.type==='attribute' && doc.system.shortcode==='per')";

/**
 * Translate a vault-relative img path (`icons/user-gear.svg`) into the
 * Foundry-relative path (`systems/sohl/assets/icons/user-gear.svg`). Falls
 * back to the per-type default when the field is missing.
 */
function resolveImg(fm, type) {
    const raw = fm.img;
    if (!raw) return DEFAULT_IMG[type] || DEFAULT_IMG.miscgear;
    const s = String(raw);
    if (s.startsWith("systems/") || s.startsWith("icons/svg/")) return s;
    if (s.startsWith("icons/")) return `systems/sohl/assets/${s}`;
    return s;
}

/**
 * Build the `system.*` fields shared by every item type:
 *   shortcode, docUrl, actionDefs, notes, docHtml.
 */
function commonSystem(fm, description, type, name) {
    const slug = fm.slug || slugify(name);
    if (!fm.shortcode) {
        throw new Error(`Missing required shortcode for item "${name}" (slug: ${slug})`);
    }
    return {
        shortcode: fm.shortcode,
        docUrl: buildDocUrl(type, slug, name),
        actionDefs: Array.isArray(fm.actionDefs) ? fm.actionDefs : [],
        notes: "",
        docHtml: description || "",
    };
}

/**
 * Gear common fields (quantity, carried flags, weight/value/quality/
 * durability). Layered onto every `*gear` system block.
 */
function gearCommon(fm) {
    return {
        quantity: 1,
        weightBase: sohlField(fm, "weight", 0),
        valueBase: sohlField(fm, "value", 0),
        qualityBase: sohlField(fm, "quality", 0),
        durabilityBase: sohlField(fm, "durability", 0),
        sharedWithCohortIds: [],
        containerId: null,
        isCarried: true,
        isEquipped: false,
    };
}

/* -------------------------------------------------------------------- */
/*  Per-type system builders                                            */
/* -------------------------------------------------------------------- */

function buildTrait(fm) {
    return {
        subType: sohlField(fm, "subType", "physique"),
        textValue: String(sohlField(fm, "textValue", "")),
        isNumeric: Boolean(sohlField(fm, "isNumeric", false)),
        intensity: sohlField(fm, "intensity", "trait"),
        valueDesc: parseValueDesc(sohlField(fm, "valueDesc", [])),
        score: sohlField(fm, "score", { value: 0, max: 0 }),
        choices: sohlField(fm, "choices", []),
    };
}

function buildSkill(fm) {
    return {
        subType: sohlField(fm, "subType", "social"),
        skillBaseFormula: sohlField(fm, "skillBaseFormula", ""),
        masteryLevelBase: Number(sohlField(fm, "masteryLevelBase", 0)) || 0,
        improveFlag: Boolean(sohlField(fm, "improveFlag", false)),
        combatCategory: sohlField(fm, "combatCategory", "none"),
        parentSkillCode: sohlField(fm, "parentSkillCode", ""),
        initSkillMult: Number(sohlField(fm, "initSkillMult", 0)) || 0,
    };
}

function buildAttribute(fm) {
    return {
        scoreBase: Number(sohlField(fm, "scoreBase", 0)) || 0,
        valueDesc: parseValueDesc(sohlField(fm, "valueDesc", [])),
        initDiceFormula: sohlField(fm, "initDiceFormula", ""),
        impairedByRoles: sohlField(fm, "impairedByRoles", []),
    };
}

function buildAffliction(fm) {
    return {
        subType: sohlField(fm, "subType", ""),
        category: sohlField(fm, "category", ""),
        isDormant: false,
        isTreated: false,
        diagnosisBonusBase: Number(sohlField(fm, "diagnosisBonus", 0)) || 0,
        levelBase: Number(sohlField(fm, "levelBase", 0)) || 0,
        healingRateBase: Number(sohlField(fm, "healingRateBase", 0)) || 0,
        contagionIndexBase: Number(sohlField(fm, "contagionIndex", 0)) || 0,
        transmission: sohlField(fm, "transmission", "none"),
    };
}

function buildAffiliation(fm) {
    return {
        society: String(sohlField(fm, "society", "")),
        office: String(sohlField(fm, "office", "")),
        title: String(sohlField(fm, "title", "")),
        level: Number(sohlField(fm, "level", 0)) || 0,
    };
}

function buildCombatTechnique(fm) {
    const strikeMode = sohlField(fm, "strikeMode", null);
    if (!strikeMode || typeof strikeMode !== "object" || !strikeMode.type) {
        throw new Error(
            `combattechnique requires sohl.strikeMode with a 'type' discriminator ("melee" or "missile")`,
        );
    }
    return {
        group: String(sohlField(fm, "group", "")),
        strikeMode,
    };
}

function buildTrauma(fm) {
    return {
        subType: sohlField(fm, "subType", "physical"),
        levelBase: Number(sohlField(fm, "levelBase", 0)) || 0,
        healingRateBase: Number(sohlField(fm, "healingRateBase", 0)) || 0,
        aspect: sohlField(fm, "aspect", "blunt"),
        isTreated: Boolean(sohlField(fm, "isTreated", false)),
        isBleeding: Boolean(sohlField(fm, "isBleeding", false)),
        bodyLocationCode: sohlField(fm, "bodyLocationCode", ""),
    };
}

function buildMystery(fm) {
    return {
        levelBase: Number(sohlField(fm, "levelBase", 0)) || 0,
        charges: {
            usesCharges: Boolean(sohlField(fm, "charges.usesCharges", false)),
            value: Number(sohlField(fm, "charges.value", 0)) || 0,
            max: Number(sohlField(fm, "charges.max", 0)) || 0,
        },
    };
}

function buildMysticalAbility(fm) {
    return {
        subType: sohlField(fm, "subType", ""),
        assocSkillCode: sohlField(fm, "assocSkillCode", ""),
        assocMysteryCode: sohlField(fm, "assocMysteryCode", ""),
        masteryLevelBase: Number(sohlField(fm, "masteryLevelBase", 0)) || 0,
        improveFlag: Boolean(sohlField(fm, "improveFlag", false)),
        levelBase: Number(sohlField(fm, "levelBase", 0)) || 0,
        charges: {
            usesCharges: Boolean(sohlField(fm, "charges.usesCharges", false)),
            value: Number(sohlField(fm, "charges.value", 0)) || 0,
            max: Number(sohlField(fm, "charges.max", 0)) || 0,
        },
    };
}

function buildCorpus(fm) {
    const movementProfiles = (sohlField(fm, "movementProfiles", []) || []).map(
        (p) => ({
            medium: String(p.medium ?? "terrestrial"),
            feetPerRound: Number(p.feetPerRound ?? 0) || 0,
            leaguesPerWatch: Number(p.leaguesPerWatch ?? 0) || 0,
            encumbrance: String(p.encumbrance ?? "0"),
            strMod: String(p.strMod ?? "0"),
            disabled: Boolean(p.disabled ?? false),
        }),
    );
    // Mirror each profile's tactical speed onto the per-medium `moveBase` scalar
    // the movement system reads and Active Effects target (see #362).
    const moveBase = {};
    for (const p of movementProfiles) {
        if (p.medium) moveBase[p.medium] = p.feetPerRound;
    }
    const weight = sohlField(fm, "weight", {}) || {};
    return {
        structure: sohlField(fm, "structure", {
            parts: [],
            adjacent: [],
        }),
        moveBase,
        defaultMoveMedium: String(
            sohlField(fm, "defaultMoveMedium", "terrestrial"),
        ),
        personalFatigue: String(sohlField(fm, "personalFatigue", "enc")),
        movementProfiles,
        weight: {
            base: weight.base == null ? null : Number(weight.base),
            calc: String(weight.calc ?? "0"),
        },
        reachBase: Number(sohlField(fm, "reachBase", 0)) || 0,
    };
}

function buildWeaponGear(fm) {
    return {
        ...gearCommon(fm),
        encumbranceBase: Number(sohlField(fm, "encumbrance", 0)) || 0,
        heftBase: Number(sohlField(fm, "heft", 0)) || 0,
        strikeModes: sohlField(fm, "strikeModes", {}),
    };
}

function buildArmorGear(fm) {
    const protection = sohlField(fm, "protection", {}) || {};
    return {
        ...gearCommon(fm),
        material: sohlField(fm, "material", ""),
        locations: {
            flexible: sohlField(fm, "flexloc", []) || [],
            rigid: sohlField(fm, "rigidloc", []) || [],
        },
        protectionBase: {
            blunt: Number(protection.blunt) || 0,
            edged: Number(protection.edged) || 0,
            piercing: Number(protection.piercing) || 0,
            fire: Number(protection.fire) || 0,
        },
        encumbrance: Number(sohlField(fm, "encumbrance", 0)) || 0,
    };
}

function buildProjectileGear(fm) {
    const impact = sohlField(fm, "impact", {}) || {};
    const die = Number(impact.die) || 0;
    return {
        ...gearCommon(fm),
        subType: sohlField(fm, "subType", ""),
        impactBase: {
            overrideDice: Boolean(impact.overrideDice ?? (die > 0)),
            overrideModifier: Boolean(impact.overrideModifier ?? false),
            numDice: die > 0 ? 1 : 0,
            die,
            modifier: Number(impact.modifier) || 0,
            aspect: impact.aspect || "piercing",
        },
    };
}

function buildContainerGear(fm) {
    return {
        ...gearCommon(fm),
        maxCapacityBase: Number(sohlField(fm, "maxCapacity", 0)) || 0,
    };
}

function buildMiscGear(fm) {
    return gearCommon(fm);
}

function buildConcoctionGear(fm) {
    return {
        ...gearCommon(fm),
        subType: sohlField(fm, "subType", ""),
        potency: sohlField(fm, "potency", "notApplicable"),
        strength: Number(sohlField(fm, "strength", 0)) || 0,
    };
}

const BUILDERS = {
    affiliation: buildAffiliation,
    affliction: buildAffliction,
    armorgear: buildArmorGear,
    attribute: buildAttribute,
    combattechnique: buildCombatTechnique,
    concoctiongear: buildConcoctionGear,
    containergear: buildContainerGear,
    corpus: buildCorpus,
    miscgear: buildMiscGear,
    mystery: buildMystery,
    mysticalability: buildMysticalAbility,
    projectilegear: buildProjectileGear,
    skill: buildSkill,
    trait: buildTrait,
    trauma: buildTrauma,
    weapongear: buildWeaponGear,
};

/* -------------------------------------------------------------------- */
/*  Synthesized Active Effects                                          */
/* -------------------------------------------------------------------- */

/**
 * Armor with a non-zero perception modifier emits one Active Effect that
 * dampens any skill using `per` and the `per` attribute itself.
 */
function buildPerceptionEffect(itemId, perception) {
    return {
        name: "Anything Using Perception",
        type: "sohleffectdata",
        _id: perception.effectId,
        system: {
            scope: "test",
            test: PERCEPTION_TEST,
        },
        changes: [
            {
                key: "mod:logic.masteryLevel",
                mode: 2,
                value: String(perception.value),
                priority: null,
            },
        ],
        _key: `!items.effects!${itemId}.${perception.effectId}`,
    };
}

/* -------------------------------------------------------------------- */
/*  Compiler                                                            */
/* -------------------------------------------------------------------- */

export class Items {
    static id = "items";

    /** @type {string} */
    contentBase;
    /** @type {string} */
    outputDir;
    /** @type {(path: string|null) => string|null} */
    folderResolver;
    /** @type {number} */
    errorCount = 0;

    constructor({ contentBase, dest, folderResolver = () => null }) {
        if (!contentBase) {
            throw new Error("Items compiler requires `contentBase`");
        }
        if (!fs.existsSync(contentBase)) {
            throw new Error(`Content tree not found at ${contentBase}`);
        }
        Object.defineProperty(this, "contentBase", {
            value: contentBase,
            writable: false,
        });
        Object.defineProperty(this, "outputDir", {
            value: dest,
            writable: false,
        });
        Object.defineProperty(this, "folderResolver", {
            value: folderResolver,
            writable: false,
        });
    }

    writeItem(outputData) {
        const fname = makeFilename(outputData.name, outputData._id);
        const outputPath = path.join(this.outputDir, fname);
        fs.writeFileSync(
            outputPath,
            JSON.stringify(outputData, null, 2),
            "utf8",
        );
    }

    /**
     * Construct the full compendium envelope for one item, including
     * synthesized Active Effects where applicable.
     */
    buildEntry(type, fm, description) {
        const name = resolveName(fm);
        const id = fm.id;
        const system = {
            ...commonSystem(fm, description, type, name),
            ...BUILDERS[type](fm),
        };

        const effects = Array.isArray(fm.effects) ? [...fm.effects] : [];

        // Armor perception → one synthesized AE per item.
        if (type === "armorgear") {
            const perception = sohlField(fm, "perception", null);
            if (
                perception &&
                typeof perception === "object" &&
                perception.value &&
                perception.effectId
            ) {
                effects.push(buildPerceptionEffect(id, perception));
            }
        }

        const folderId = sohlField(fm, "folder", null);
        const folder = this.folderResolver(folderId);

        return {
            name,
            type,
            img: resolveImg(fm, type),
            _id: id,
            system,
            effects,
            flags: fm.flags || {},
            _stats: STATS,
            ownership: { default: 0 },
            folder,
            _key: `!items!${id}`,
        };
    }

    async compile() {
        const counts = Object.fromEntries(
            [...ITEM_TYPES].map((t) => [t, 0]),
        );
        let skippedNoId = 0;
        let skippedDraft = 0;
        let skippedOtherType = 0;

        for (const { frontmatter: fm, description, absPath } of walkMarkdownTree(
            this.contentBase,
        )) {
            if (!fm || fm.package !== "sohl") {
                skippedOtherType++;
                continue;
            }
            const type = fm.type;
            if (!type || !ITEM_TYPES.has(type)) {
                skippedOtherType++;
                continue;
            }
            if (fm.draft === true) {
                skippedDraft++;
                log.debug(`Skipping draft: ${absPath}`);
                continue;
            }
            if (!fm.id) {
                skippedNoId++;
                log.warn(`Item missing id, skipping: ${absPath}`);
                continue;
            }

            log.debug(`Processing ${type}: ${resolveName(fm)} (${absPath})`);
            try {
                const entry = this.buildEntry(type, fm, description);
                this.writeItem(entry);
                counts[type]++;
            } catch (err) {
                this.errorCount++;
                log.error(
                    `Failed to compile ${type} at ${absPath}: ${err.message}`,
                );
            }
        }

        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        log.info(`Compiled ${total} items:`);
        for (const [t, n] of Object.entries(counts)) {
            if (n > 0) log.info(`  ${t}: ${n}`);
        }
        if (skippedNoId)
            log.info(`Skipped ${skippedNoId} item(s) missing id`);
        if (skippedDraft) log.info(`Skipped ${skippedDraft} draft(s)`);
        log.debug(
            `Skipped ${skippedOtherType} non-item file(s) (no recognized type)`,
        );
    }
}
