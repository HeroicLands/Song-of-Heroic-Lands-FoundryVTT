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

export class VehicleStructures {
    static id = "vehicles-and-structures";

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

    async processVehicles() {
        const filePath = path.join(this.dataDir, "vehicles.yaml");
        if (!fs.existsSync(filePath)) {
            log.warn(`File does not exist, skipping vehicles: ${filePath}`);
            return;
        }
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const vehicle of data) {
            log.debug(`Processing vehicle ${vehicle.name}`);
            let fname =
                `${unidecode(vehicle.name)}_${vehicle.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = {
                name: vehicle.name,
                type: "vehicle",
                img: vehicle.img,
                _id: vehicle.id,
                system: {
                },
                effects: [],
                flags: vehicle.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: vehicle.folderId || null,
                _key: `!items!${vehicle.id}`,
            };

            fs.writeFileSync(
                outputPath,
                JSON.stringify(outputData, null, 2),
                "utf8",
            );
        }
    }

    async processStructures() {
        const filePath = path.join(this.dataDir, "structures.yaml");
        if (!fs.existsSync(filePath)) {
            log.warn(`File does not exist, skipping structures: ${filePath}`);
            return;
        }
        const data = yaml.parse(fs.readFileSync(filePath, "utf8"));

        for (const structure of data) {
            log.debug(`Processing structure ${structure.name}`);
            let fname =
                `${unidecode(structure.name)}_${structure.id}`.replace(
                    /[^0-9a-zA-Z]+/g,
                    "_",
                ) + ".json";
            let outputPath = path.join(this.outputDir, fname);

            const outputData = {
                name: structure.name,
                type: "structure",
                img: structure.img,
                _id: structure.id,
                system: {
                },
                effects: [],
                flags: structure.flags || {},
                _stats: stats,
                ownership: { default: 0 },
                folder: structure.folderId || null,
                _key: `!items!${structure.id}`,
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
        if (!fs.existsSync(filePath)) {
            log.warn(`File does not exist, skipping folders: ${filePath}`);
            return;
        }
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
        await this.processVehicles();
        await this.processStructures();
        await this.processFolders();
    }
}
