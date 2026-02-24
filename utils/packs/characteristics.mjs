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
import log from "loglevel";
import prefix from "loglevel-plugin-prefix";

const stats = {
    systemId: "sohl",
    systemVersion: "0.5.6",
    coreVersion: "13",
    createdTime: 0,
    modifiedTime: 0,
    lastModifiedBy: "sohlbuilder00000",
};

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

    static mergeObject(obj1, obj2, depth = 0, maxDepth = 20) {
        if (depth > maxDepth) {
            throw new Error(
                `Recursion depth exceeded: Maximum allowed depth is ${maxDepth}`,
            );
        }

        if (typeof obj1 !== "object" || obj1 === null) return obj2;
        if (typeof obj2 !== "object" || obj2 === null) return obj1;

        const result = { ...obj1 };

        for (const key of Object.keys(obj2)) {
            if (
                obj2[key] &&
                typeof obj2[key] === "object" &&
                !Array.isArray(obj2[key])
            ) {
                result[key] = this.mergeObject(
                    obj1[key] || {},
                    obj2[key],
                    depth + 1,
                    maxDepth,
                );
            } else {
                result[key] = obj2[key];
            }
        }

        return result;
    }

    async processTraits() {
        const filePath = path.join(this.dataDir, "traits.yaml");
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const trait of data) {
            log.debug(`Processing trait ${trait.name}`);
            let fname =
                `${unidecode(trait.name)}_${trait.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = {
                name: trait.name,
                type: "trait",
                img: trait.img,
                _id: trait.id,
                system: {
                    notes: "",
                    description: trait.description,
                    textReference: trait.textReference,
                    nestedIn: null,
                    subType: trait.subType,
                    textValue: trait.textValue,
                    max: trait.max,
                    isNumeric: trait.isNumeric,
                    intensity: trait.intensity,
                    valueDesc: trait.valueDesc,
                    choices: trait.choices,
                    shortcode: trait.shortcode,
                    skillBaseFormula: trait.skillBaseFormula,
                    masteryLevelBase: 0,
                    improveFlag: false,
                },
                effects: [],
                flags: trait.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: trait.folderId || null,
                _key: `!items!${trait.id}`,
            };

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processSkills() {
        const filePath = path.join(this.dataDir, "skills.yaml");
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const skill of data) {
            log.debug(`Processing skill ${skill.name}`);
            let fname =
                `${unidecode(skill.name)}_${skill.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            Characteristics.mergeObject(skill["flags"], {
                sohl: {
                    legendary: {
                        initSkillMult: skill.initSM,
                        expertiseParentSkill: skill.expertiseParentSkill || "",
                    },
                },
            });
            const outputData = {
                name: skill.name,
                type: "skill",
                img: skill.img,
                _id: skill.id,
                system: {
                    notes: "",
                    description: skill.description,
                    textReference: skill.textReference,
                    nestedIn: null,
                    subType: skill.subType,
                    shortcode: skill.shortcode,
                    skillBaseFormula: skill.skillBaseFormula,
                    masteryLevelBase: 0,
                    improveFlag: false,
                    weaponGroup: skill.weaponGroup,
                    domain: skill.domain,
                    baseSkill: skill.baseSkill,
                },
                effects: skill.effects || [],
                flags: skill.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: skill.folderId || null,
                _key: `!items!${skill.id}`,
            };

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processCombatTechniques() {
        let filePath = path.join(this.dataDir, "combattechsm.yaml");
        let data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const cmbttech of data) {
            log.debug(`Processing Combat Technique ${cmbttech.name}`);
            let fname =
                `${unidecode(cmbttech.name)}_${cmbttech.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            Characteristics.mergeObject(cmbttech["flags"], {
                sohl: {
                    legendary: {
                        zoneDie: cmbttech.zoneDie,
                    },
                },
            });

            const sm = {
                name: cmbttech.name,
                type: "combattechniquestrikemode",
                img: cmbttech.img,
                _id: cmbttech.id,
                system: {
                    notes: "",
                    textReference: "",
                    description: "",
                    group: cmbttech.group,
                    mode: cmbttech.subDesc,
                    minParts: cmbttech.minParts,
                    assocSkillName: cmbttech.assocSkill,
                    lengthBase: cmbttech.lengthBase,
                    impactBase: {
                        numDice: cmbttech.impactDie > 0 ? 1 : 0,
                        die: cmbttech.impactDie,
                        modifier: cmbttech.impactMod,
                        aspect: cmbttech.impactAspect,
                    },
                },
                effects: [],
                flags: cmbttech.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: null,
                _key: `!items!${cmbttech.id}`,
            };

            const eid = cmbttech.effectId;

            const effect = {
                name: `${cmbttech.subDesc} Traits`,
                icon: "icons/svg/aura.svg",
                changes: [],
                flags: {},
                _id: eid,
                disabled: false,
                type: "sohlactiveeffect",
                system: {
                    targetType: "this",
                    targetName: "",
                },
                duration: {
                    startTime: null,
                    seconds: null,
                    combat: null,
                    rounds: null,
                    turns: null,
                    startRound: null,
                    startTurn: null,
                },
                origin: "",
                tint: null,
                transfer: false,
                description: "",
                statuses: [],
                _key: `!items.effects!${sm._id}.${eid}`,
            };

            for (const chg in cmbttech.effectChanges) {
                const change = {
                    key: chg.key,
                    mode: chg.mode,
                    value: chg.value,
                    priority: null,
                };
                effect.changes.push(change);
            }
            sm.effects.push(effect);

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processAfflictionss() {
        const filePath = path.join(this.dataDir, "afflictions.yaml");
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const affliction of data) {
            log.debug(`Processing Affliction ${affliction.name}`);
            let fname =
                `${unidecode(affliction.name)}_${affliction.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = {
                name: affliction.name,
                type: "affliction",
                img: affliction.img,
                _id: affliction.id,
                system: {
                    notes: "",
                    textReference: "",
                    description: affliction.description,
                    subType: affliction.subType,
                    category: affliction.category,
                    isDormant: false,
                    isTreated: false,
                    diagnosisBonusBase: affliction.diagnosisBonus,
                    levelBase: affliction.level,
                    healingRateBase: affliction.healingRate,
                    contagionIndexBase: affliction.contagionIndex,
                    transmission: affliction.transmission,
                },
                effects: affliction.effects || [],
                flags: affliction.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: affliction.folderId || null,
                _key: `!items!${affliction.id}`,
            };

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processFolders() {
        const filePath = path.join(this.dataDir, "folders.yaml");
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const folder of data) {
            log.debug(`Processing Folder ${folder.name}`);
            let fname =
                `folder_${unidecode(folder.name)}_${folder.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

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
        await this.processTraits();
        await this.processSkills();
        await this.processCombatTechniques();
        await this.processAfflictionss();
        await this.processFolders();
    }
}
