/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// sohl-bootstrap.mjs
// Must be imported before any modules that use the `sohl` global
import * as helpers from "../../utils/helpers.js";
import { SohlLocalize } from "./SohlLocalize.mjs";
import { SohlLogger } from "../../utils/SohlLogger.js";
import { SohlClassRegistryElement } from "../../utils/SohlClassRegistry.js";
import {
    KIND_KEY,
    SCHEMA_VERSION_KEY,
    SohlBase,
} from "../../logic/common/core/SohlBase.js";

// Define globalThis.sohl if not already defined
if (!globalThis.sohl) {
    globalThis.sohl = {
        CONFIG: {},
        CONST: {},
        variants: {},
        classRegistry: {},
        i18n: SohlLocalize.getInstance(),
        utils: helpers,
        game: null, // Placeholder for the system game object
        ready: false,
        simpleCalendar: null, // Placeholder for Simple Calendar API
        log: SohlLogger.getInstance(),
        registerValue,
        unregisterValue,
        registerSheet,
        unregisterSheet,
        registeredClassFactory,
    };
}

/**
 * Register a value or object in the `sohl` global namespace.
 * @param {string|Object} pathOrObject - The path or object to register.
 * @param {*} [value] - The value to register (if path is a string).
 * @param {PropertyDescriptor} [descriptor] - Property descriptor for the value.
 */
function registerValue(
    pathOrObject,
    value,
    descriptor = {
        writable: false,
        configurable: true,
        enumerable: false,
    },
) {
    if (typeof pathOrObject === "string") {
        helpers.setPathValue(sohl, pathOrObject, value, descriptor);
    } else if (typeof pathOrObject === "object") {
        const flattened = helpers.expandFlattened(pathOrObject);
        for (const [path, val] of Object.entries(flattened)) {
            helpers.setPathValue(sohl, path, val, descriptor);
        }
    }
}

/**
 * Unregister a value from the `sohl` global namespace.
 * @param {string} path - The path to unregister.
 * @returns {boolean} - Whether the value was successfully unregistered.
 */
function unregisterValue(path) {
    return helpers.deletePath(globalThis.sohl, path);
}

/**
 * Register a custom sheet for a Foundry document class.
 * @param {typeof foundry.abstract.Document} documentClass - The document class.
 * @param {Function} sheetClass - The sheet class.
 * @param {Object} [config] - Configuration options for the sheet.
 */
function registerSheet(documentClass, sheetClass, config) {
    const documentSheetConfig = foundry.applications.apps.DocumentSheetConfig;
    documentSheetConfig.registerSheet(
        documentClass,
        "sohl",
        sheetClass,
        config,
    );
}

/**
 * Unregister a custom sheet for a Foundry document class.
 * @param {typeof foundry.abstract.Document} documentClass - The document class.
 * @param {typeof FormApplication} sheetClass - The sheet class.
 * @param {Object} options - Options for unregistering the sheet.
 * @param {string[]} [options.types] - Specific types to unregister.
 */
function unregisterSheet(documentClass, sheetClass, { types }) {
    const documentSheetConfig = foundry.applications.apps.DocumentSheetConfig;
    documentSheetConfig.unregisterSheet(documentClass, "sohl", sheetClass, {
        types,
    });
}

/**
 * Create a new SohlBase instance from registered metadata.
 * @param {SohlBaseParent} parent - The parent object.
 * @param {Object} [data={}] - The data for the instance.
 * @param {Object} [options={}] - Additional options.
 * @returns {SohlBase} - The created SohlBase instance.
 * @throws {TypeError} - If data is invalid or missing required keys.
 */
function registeredClassFactory(parent, data = {}, options = {}) {
    if (!data) {
        throw new TypeError("Data cannot be empty");
    }
    if (typeof data !== "object") {
        throw new TypeError("Data must be an object");
    }
    if (!Object.hasOwn(data, KIND_KEY) || !data.kind) {
        throw new TypeError(
            `Missing or invalid ${KIND_KEY} key in SohlBaseData.`,
        );
    }
    if (!Object.hasOwn(data, SCHEMA_VERSION_KEY) || !data.schemaVersion) {
        throw new TypeError(
            `Missing or invalid ${SCHEMA_VERSION_KEY} key in SohlBaseData.`,
        );
    }
    const classInfo = sohl.classRegistry[data[KIND_KEY]];
    if (!classInfo?.ctor) {
        throw new Error(
            `Class '${data[KIND_KEY]}' is not registered in SohlBaseRegistry.`,
        );
    }
    if (
        sohl.utils.isNewerVersion(classInfo.schemaVersion, data.schemaVersion)
    ) {
        data = classInfo.ctor?.migrateData?.(data);
    }

    return classInfo.create(parent, data, options);
}
