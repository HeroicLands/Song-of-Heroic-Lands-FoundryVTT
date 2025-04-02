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
                    subType: trait.subType,
                    notes: "",
                    textReference: "",
                    description: trait.description,
                    macros: trait.macros,
                    nestedItems: [],
                    transfer: false,
                    abbrev: trait.abbrev,
                    skillBaseFormula: trait.skillBaseFormula,
                    masteryLevelBase: 0,
                    improveFlag: false,
                    textValue: trait.textValue,
                    isNumeric: trait.isNumeric,
                    intensity: trait.intensity,
                    max: trait.max,
                    valueDesc: trait.valueDesc,
                    choices: trait.choices,
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
                    subType: skill.subType,
                    notes: "",
                    textReference: "",
                    description: skill.description,
                    macros: skill.macros,
                    nestedItems: [],
                    transfer: false,
                    abbrev: skill.abbrev,
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

    async processCombatManeuvers() {
        let filePath = path.join(this.dataDir, "combatmaneuvers.yaml");
        let data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        const combatManeuvers = {};

        for (const cbtman of data) {
            log.debug(`Processing Combat Maneuver ${cbtman.name}`);

            combatManeuvers[cbtman.id] = {
                name: cbtman.name,
                type: "combatmaneuver",
                img: cbtman.img,
                _id: cbtman.id,
                system: {
                    notes: "",
                    textReference: "",
                    description: cbtman.description,
                    macros: cbtman.macros,
                    nestedItems: [],
                    transfer: true,
                    abbrev: cbtman.abbrev,
                },
                effects: cbtman.effects || [],
                flags: cbtman.flags || {},
                _stats: stats,
                ownership: { default: 3 },
                folder: cbtman.folderId || null,
                _key: `!items!${cbtman.id}`,
            };
        }

        filePath = path.join(this.dataDir, "combattechsm.yaml");
        data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const cmbttech of data) {
            log.debug(`Processing Combat Technique ${cmbttech.name}`);

            Characteristics.mergeObject(cmbttech["flags"], {
                sohl: {
                    legendary: {
                        zoneDie: cmbttech.zoneDie,
                    },
                },
            });

            const sm = {
                name: cmbttech.subDesc,
                type: "combattechniquestrikemode",
                img: cmbttech.img,
                _id: cmbttech.id,
                system: {
                    notes: "",
                    textReference: "",
                    description: "",
                    macros: cmbttech.macros,
                    nestedItems: [],
                    transfer: true,
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
            combatManeuvers[cmbttech.combatManeuverId].system.nestedItems.push(
                sm,
            );
        }

        for (const cmid of Object.keys(combatManeuvers)) {
            if (!cmid) continue;
            let fname =
                unidecode(`${combatManeuvers[cmid].name}_${cmid}`).replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);
            fs.writeFileSync(
                outputPath,
                JSON.stringify(combatManeuvers[cmid], null, 2),
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
                    subType: affliction.subType,
                    notes: "",
                    textReference: "",
                    description: affliction.description,
                    macros: affliction.macros,
                    nestedItems: [],
                    transfer: false,
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

    async processAnatomies() {
        const filePath = path.join(this.dataDir, "anatomies.yaml");
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const anatomy of data) {
            log.debug(`Processing Anatomy ${anatomy.name}`);
            let fname =
                `${unidecode(anatomy.name)}_${anatomy.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = Characteristics.mergeObject(anatomy, {
                _key: `!items!${anatomy.id}`,
            });

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
        await this.processCombatManeuvers();
        await this.processAfflictionss();
        await this.processAnatomies();
        await this.processFolders();
    }
}
