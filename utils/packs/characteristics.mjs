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

import fs from "fs";
import path from "path";
import yaml from "yaml";
import unidecode from "unidecode";
import markdownit from "markdown-it";
import log from "loglevel";

const md = markdownit({ html: true });

const stats = {
    systemId: "sohl",
    systemVersion: "0.6.0",
    coreVersion: "14",
    createdTime: 0,
    modifiedTime: 0,
    lastModifiedBy: "sohlbuilder00000",
};

/**
 * Parses a markdown file with YAML frontmatter.
 * Returns { frontmatter, description } where description is the
 * markdown content after the frontmatter block, converted to basic HTML.
 */
function parseMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!fmMatch) {
        log.warn(`No frontmatter found in ${filePath}`);
        return { frontmatter: {}, description: "" };
    }
    const frontmatter = yaml.parse(fmMatch[1]) || {};
    const rawMarkdown = fmMatch[2].trim();
    const description = rawMarkdown ? md.render(rawMarkdown) : "";
    return { frontmatter, description };
}

/**
 * Generates a filename from a name and ID, matching the existing naming scheme:
 * `Name_id.json` with non-alphanumeric characters replaced by underscores.
 */
function makeFilename(name, id) {
    return (
        `${unidecode(name)}_${id}`.replace(/[^0-9a-zA-Z]+/g, "_") + ".json"
    );
}

/**
 * Reads all markdown files from a directory and returns parsed results.
 */
function readMarkdownDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        log.warn(`Directory does not exist, skipping: ${dirPath}`);
        return [];
    }
    return fs
        .readdirSync(dirPath)
        .filter((f) => f.endsWith(".md"))
        .map((f) => parseMarkdownFile(path.join(dirPath, f)));
}

/**
 * Resolves a dotted frontmatter key (e.g., "charges.value") into the
 * correct nested value. Also handles the trait valueDesc format.
 */
function getFrontmatter(fm, key, defaultValue = undefined) {
    // Check for dotted notation in frontmatter keys (e.g., "name.full", "charges.value")
    if (key in fm) return fm[key];
    const dotKey = key;
    const parts = dotKey.split(".");
    let current = fm;
    for (const part of parts) {
        if (current == null || typeof current !== "object") return defaultValue;
        current = current[part];
    }
    return current !== undefined ? current : defaultValue;
}

/**
 * Parses the trait valueDesc format. In frontmatter this can appear as:
 * - An array of "Label:MaxValue" strings
 * - An array of objects with { label, maxValue }
 */
function parseValueDesc(raw) {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map((entry) => {
        if (typeof entry === "string") {
            const [label, maxStr] = entry.split(":");
            return { label: label.trim(), maxValue: parseInt(maxStr, 10) || 0 };
        }
        if (typeof entry === "object" && entry.label !== undefined) {
            return { label: entry.label, maxValue: entry.maxValue || 0 };
        }
        return { label: String(entry), maxValue: 0 };
    });
}

export class Characteristics {
    static id = "characteristics";

    constructor(dataDir, outputDir) {
        Object.defineProperty(this, "dataDir", {
            value: dataDir,
            writable: false,
        });
        Object.defineProperty(this, "outputDir", {
            value: outputDir,
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

    async processTraits() {
        const dirPath = path.join(this.dataDir, "traits");
        const items = readMarkdownDir(dirPath);

        for (const { frontmatter: fm, description } of items) {
            const name = getFrontmatter(fm, "name.full", "Unknown Trait");
            const id = fm.id;
            if (!id) {
                log.warn(`Trait "${name}" has no id, skipping`);
                continue;
            }
            log.debug(`Processing trait ${name}`);

            this.writeItem({
                name,
                type: "trait",
                img:
                    fm.img || "systems/sohl/assets/icons/user-gear.svg",
                _id: id,
                system: {
                    notes: "",
                    description,
                    textReference: "",
                    shortcode: fm.shortcode || fm.abbrev || "",
                    subType: fm.subType || "physique",
                    textValue: fm.textValue != null ? String(fm.textValue) : "",
                    max: fm.max != null ? Number(fm.max) : null,
                    isNumeric: fm.isNumeric || false,
                    intensity: fm.intensity || "trait",
                    valueDesc: parseValueDesc(fm.valueDesc),
                    choices: fm.choices || {},
                    diceFormula: fm.diceFormula || "",
                    skillBaseFormula: fm.skillBaseFormula || "",
                    masteryLevelBase: 0,
                    improveFlag: false,
                },
                effects: fm.effects || [],
                flags: fm.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: fm.folderId || null,
                _key: `!items!${id}`,
            });
        }
    }

    async processSkills() {
        const dirPath = path.join(this.dataDir, "skills");
        const items = readMarkdownDir(dirPath);

        for (const { frontmatter: fm, description } of items) {
            const name = getFrontmatter(fm, "name.full", "Unknown Skill");
            const id = fm.id;
            if (!id) {
                log.warn(`Skill "${name}" has no id, skipping`);
                continue;
            }
            log.debug(`Processing skill ${name}`);

            this.writeItem({
                name,
                type: "skill",
                img:
                    fm.img || "systems/sohl/assets/icons/head-gear.svg",
                _id: id,
                system: {
                    notes: "",
                    description,
                    textReference: "",
                    shortcode: fm.shortcode || "",
                    subType: fm.subType || "social",
                    skillBaseFormula: fm.skillBaseFormula || "",
                    masteryLevelBase: 0,
                    improveFlag: false,
                    weaponGroup: fm.weaponGroup || "none",
                    domainCode: fm.domainCode || "",
                    baseSkill: fm.baseSkill || "",
                    initSkillMult: fm.initSM || 0,
                    expertiseParentSkill: fm.expertiseParentSkill || "",
                },
                effects: fm.effects || [],
                flags: fm.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: fm.folderId || null,
                _key: `!items!${id}`,
            });
        }
    }

    async processAfflictions() {
        const dirPath = path.join(this.dataDir, "afflictions");
        const items = readMarkdownDir(dirPath);

        for (const { frontmatter: fm, description } of items) {
            const name = getFrontmatter(fm, "name.full", "Unknown Affliction");
            const id = fm.id;
            if (!id) {
                log.warn(`Affliction "${name}" has no id, skipping`);
                continue;
            }
            log.debug(`Processing affliction ${name}`);

            this.writeItem({
                name,
                type: "affliction",
                img:
                    fm.img || "systems/sohl/assets/icons/sick.svg",
                _id: id,
                system: {
                    notes: "",
                    description,
                    textReference: "",
                    shortcode: fm.shortcode || "",
                    subType: fm.subType || "",
                    skillBaseFormula: "",
                    masteryLevelBase: 0,
                    improveFlag: false,
                    isDormant: false,
                    isTreated: false,
                    diagnosisBonusBase: fm.diagnosisBonus || 0,
                    levelBase: fm.level || 0,
                    healingRateBase: fm.healingRate || 0,
                    contagionIndexBase: fm.contagionIndex || 0,
                    transmission: fm.transmission || "",
                },
                effects: fm.effects || [],
                flags: fm.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: fm.folderId || null,
                _key: `!items!${id}`,
            });
        }
    }

    async processMysteries() {
        const dirPath = path.join(this.dataDir, "mysteries");
        const items = readMarkdownDir(dirPath);

        for (const { frontmatter: fm, description } of items) {
            const name = getFrontmatter(fm, "name.full", "Unknown Mystery");
            const id = fm.id;
            if (!id) {
                log.warn(`Mystery "${name}" has no id, skipping`);
                continue;
            }
            log.debug(`Processing mystery ${name}`);

            this.writeItem({
                name,
                type: "mystery",
                img:
                    fm.img || "systems/sohl/assets/icons/sparkles.svg",
                _id: id,
                system: {
                    notes: "",
                    description,
                    textReference: "",
                    shortcode: fm.shortcode || "",
                    subType: fm.subType || "",
                    domainCode: fm.domainCode || "",
                    skills: fm.skills || [],
                    levelBase: fm.level || 0,
                    charges: {
                        value: getFrontmatter(fm, "charges.value", null),
                        max: getFrontmatter(fm, "charges.max", null),
                    },
                },
                effects: fm.effects || [],
                flags: fm.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: fm.folderId || null,
                _key: `!items!${id}`,
            });
        }
    }

    async processMysticalAbilities() {
        const dirPath = path.join(this.dataDir, "mystical-abilities");
        const items = readMarkdownDir(dirPath);

        for (const { frontmatter: fm, description } of items) {
            const name = getFrontmatter(fm, "name.full", "Unknown Ability");
            const id = fm.id;
            if (!id) {
                log.warn(`Mystical ability "${name}" has no id, skipping`);
                continue;
            }
            log.debug(`Processing mystical ability ${name}`);

            this.writeItem({
                name,
                type: "mysticalability",
                img:
                    fm.img ||
                    "systems/sohl/assets/icons/hand-sparkles.svg",
                _id: id,
                system: {
                    notes: "",
                    description,
                    textReference: "",
                    shortcode: fm.shortcode || "",
                    subType: fm.subType || "",
                    assocSkillCode: fm.assocSkillCode || null,
                    isImprovable: fm.isImprovable || false,
                    domainCode: fm.domainCode || "",
                    skillBaseFormula: fm.skillBaseFormula || "",
                    masteryLevelBase: 0,
                    improveFlag: false,
                    levelBase: fm.level || 0,
                    charges: {
                        value: getFrontmatter(fm, "charges.value", null),
                        max: getFrontmatter(fm, "charges.max", null),
                    },
                },
                effects: fm.effects || [],
                flags: fm.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: fm.folderId || null,
                _key: `!items!${id}`,
            });
        }
    }

    async processFolders() {
        const filePath = path.join(this.dataDir, "folders.yaml");
        if (!fs.existsSync(filePath)) {
            log.warn(`File does not exist, skipping folders: ${filePath}`);
            return;
        }
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const folder of data) {
            log.debug(`Processing Folder ${folder.name}`);
            const fname =
                `folder_${unidecode(folder.name)}_${folder.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            const outputPath = path.join(this.outputDir, fname);

            const outputData = {
                name: folder.name,
                sorting: "a",
                folder: folder.parentFolderId || null,
                type: "Item",
                _id: folder.id,
                sort: 0,
                color: folder.color,
                flags: folder.flags || {},
                _stats: stats,
                _key: `!folders!${folder.id}`,
            };

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async compile() {
        await this.processFolders();
        await this.processTraits();
        await this.processSkills();
        await this.processAfflictions();
        await this.processMysteries();
        await this.processMysticalAbilities();
    }
}
