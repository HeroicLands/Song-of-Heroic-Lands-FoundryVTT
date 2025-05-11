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

import "./core/sohl-bootstrap";
import { SohlActorSheet } from "./actor/SohlActorSheet.mjs";
import { SohlItemSheet } from "./item/SohlItemSheet.mjs";
import { SohlActiveEffectConfig } from "./foundry/SohlActiveEffectConfig.mjs";

sohl.registerSheet(CONFIG.Actor.documentClass, SohlActorSheet, {
    types: ["sohl"],
    makeDefault: true,
});
sohl.registerSheet(CONFIG.Item.documentClass, SohlItemSheet, {
    types: ["sohl"],
    makeDefault: true,
});
sohl.registerSheet(CONFIG.ActiveEffect.documentClass, SohlActiveEffectConfig, {
    types: ["sohl"],
    makeDefault: true,
});

/**
 * Setup version-specific configuration
 */
function setupSohlVariant() {
    const variantId = game.settings?.get("sohl", "sohlVariant");
    const sohl = SohlVariant[variantId].initialize();
    foundry.utils.mergeObject(CONFIG, sohl.game.CONFIG);
    console.log(sohl.game.initVariantMessage);
}

function registerSystemSettings() {
    game.registerSetting("systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: "",
    });
    game.registerSetting("sohlVariant", {
        name: "Rules Variant",
        hint: "Which variant of rules to use",
        scope: "world",
        config: true,
        requiresReload: true,
        default: "legendary",
        type: String,
        choices: {
            legendary: "Legendary",
            mistyisle: "MistyIsle",
        },
    });
    game.registerSetting("showWelcomeDialog", {
        name: "Show welcome dialog on start",
        hint: "Display the welcome dialog box when the user logs in.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
    });
    game.registerSetting("initMacros", {
        name: "Ask to initialize macros",
        hint: "The next time the user logs in, ask whether to install the default macros.",
        scope: "client",
        default: true,
        config: true,
        type: Boolean,
        initial: true,
    });
    game.registerSetting("combatAudio", {
        name: "Combat sounds",
        hint: "Enable combat flavor sounds",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        initial: true,
    });
    game.registerSetting("recordTrauma", {
        name: "Record trauma automatically",
        hint: "Automatically add physical and mental afflictions and injuries",
        scope: "world",
        config: true,
        default: "enable",
        type: String,
        initial: "enable",
        choices: {
            enable: "Record trauma automatically",
            disable: "Don't record trauma automatically",
            ask: "Prompt user on each injury or affliction",
        },
    });
    game.registerSetting("healingSeconds", {
        name: "Seconds between healing checks",
        hint: "Number of seconds between healing checks. Set to 0 to disable.",
        scope: "world",
        config: true,
        type: Number,
        default: 432000, // 5 days
        initial: 432000,
    });
    game.registerSetting("optionProjectileTracking", {
        name: "Track Projectile/Missile Quantity",
        hint: "Reduce projectile/missile quantity when used; disallow missile attack when quantity is zero",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        initial: false,
    });
    game.registerSetting("optionFate", {
        name: "Fate: Use fate rules",
        scope: "world",
        config: true,
        default: "enable",
        type: String,
        initial: "pconly",
        choices: {
            none: "Fate rules disabled",
            pconly: "Fate rules only apply to PCs",
            everyone: "Fate rules apply to all animate actors",
        },
    });
    game.registerSetting("optionGearDamage", {
        name: "Gear Damage",
        hint: "Enable combat rule that allows gear (weapons and armor) to be damaged or destroyed on successful block",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        initial: false,
    });
    game.registerSetting("logThreshold", {
        name: "Log Level Threshold",
        scope: "world",
        config: true,
        default: "enable",
        type: String,
        initial: "info",
        choices: {
            debug: "Debug",
            info: "Informational",
            warn: "Warning",
            error: "Error",
        },
        onChange: (value) => {
            sohl.log.setLogThreshold(value);
        },
    });
}

/**
 * Register startup hooks
 */
function registerSystemHooks() {
    // Example chat message hook
    Hooks.on("renderChatMessageHTML", (app, element, data) => {
        element.addEventListener("click", (ev) => {
            const btn = ev.target.closest("button");
            if (btn?.closest(".card-buttons")) {
                const docUuid = btn.dataset.docUuid;
                if (docUuid) {
                    const doc = foundry.utils.fromUuidSync(docUuid);
                    if (
                        doc &&
                        "onChatCardButton" in doc &&
                        typeof doc.onChatCardButton === "function"
                    ) {
                        doc.onChatCardButton(btn);
                    }
                }
            } else {
                const edit = ev.target.closest("a.edit-action");
                const docUuid = edit?.dataset.docUuid;
                if (docUuid) {
                    const doc = foundry.utils.fromUuidSync(docUuid);
                    if (
                        doc &&
                        "onChatCardEditAction" in doc &&
                        typeof doc.onChatCardEditAction === "function"
                    ) {
                        doc.onChatCardEditAction(edit);
                    }
                }
            }
        });
    });

    Hooks.on("renderSceneConfig", (app, element) => {
        const scene = app.object;
        const isTotm = scene.getFlag("sohl", "isTotm") ?? false;
        const totmHTML = `<div class="form-group">
        <label>Theatre of the Mind</label>
        <input id="sohl-totm" type="checkbox" name="sohlTotm" data-dtype="Boolean" ${isTotm ? "checked" : ""}>
        <p class="notes">Configure scene for Theatre of the Mind.</p>
      </div>`;
        const target = element.querySelector("input[name='gridAlpha']");
        target
            ?.closest(".form-group")
            ?.insertAdjacentHTML("afterend", totmHTML);
    });

    Hooks.on("closeSceneConfig", (app, element) => {
        const scene = app.object;
        const isTotm =
            element.querySelector <
                HTMLInputElement >
                "input[name='sohlTotm']"?.checked ?? false;
        scene.setFlag("sohl", "isTotm", isTotm);
    });
}

// Register init hook
Hooks.once("init", () => {
    const initMessage = `Initializing the Song of Heroic Lands Game System
===========================================================
 _____                            __
/  ___|                          / _|
\\ \`--.  ___  _ __   __ _    ___ | |_
 \`--. \\/ _ \\| '_ \\ / _\` |  / _ \\|  _|
/\\__/ / (_) | | | | (_| | | (_) | |
\\____/ \\___/|_| |_|\\__, |  \\___/|_|
                    __/ |
                   |___/
 _   _                _        _                     _
| | | |              (_)      | |                   | |
| |_| | ___ _ __ ___  _  ___  | |     __ _ _ __   __| |___
|  _  |/ _ \\ '__/ _ \\| |/ __| | |    / _\` | '_ \\ / _\` / __|
| | | |  __/ | | (_) | | (__  | |___| (_| | | | | (_| \\__ \\
\\_| |_/\\___|_|  \\___/|_|\\___| \\_____/\\__,_|_| |_|\\__,_|___/
===========================================================`;

    console.log(`SoHL | ${initMessage}`);

    registerSystemSettings();
    sohl.log.setLogThreshold(game.settings.get("sohl", "logLevel"));
    registerSystemHooks();
    setupSohlVariant();

    CONFIG.Combat.initiative = { formula: "@initiativeRank", decimals: 2 };
    CONFIG.time.roundTime = 5;
    CONFIG.time.turnTime = 0;
    Object.keys(game).forEach((key) => (sohlGame[key] = game[key]));
});

// Register ready hook
Hooks.once("ready", async () => {
    sohl.ready = true;
    await preloadHandlebarsTemplates();
    registerHandlebarsHelpers();
});

Hooks.once("simpleCalendarReady", async () => {
    const sc = globalThis.SimpleCalendar;
    sohl.simpleCalendar = game.modules.get("foundryvtt-simple-calendar");
    console.log("📅 Simple Calendar is ready!");
});

/*-------------------------------------------------------*/
/*            Handlebars FUNCTIONS                       */
/*-------------------------------------------------------*/
function registerHandlebarsHelpers() {
    /**
     * A helper to create a set of &lt;option> elements in a &lt;select> block based on a provided array.
     * This helper supports both single-select as well as multi-select input fields.
     *
     * @param {object|Array<object>>} choices      An array containing the choices
     * @param {object} options                     Helper options
     * @param {string|string[]} [options.selected] Which key is currently selected?
     * @param {string} [options.blank]             Add a blank option as the first option with this label
     * @param {boolean} [options.sort]             Sort the options by their label after localization
     * @returns {Handlebars.SafeString}
     *
     * @example The provided input data
     * ```js
     * let choices = {"Choice A", "Choice B"};
     * let value = "Choice A";
     * ```
     * The template HTML structure
     * ```hbs
     * <select name="importantChoice">
     *   {{selectArray choices selected=value}}
     * </select>
     * ```
     * The resulting HTML
     * ```html
     * <select name="importantChoice">
     *   <option value="Choice A" selected>Choice A</option>
     *   <option value="Choice B">Choice B</option>
     * </select>
     * ```
     */
    Handlebars.registerHelper("selectArray", function (choices, options) {
        let selected = options.hash.selected ?? null;
        let blank = options.hash.blank ?? null;
        let sort = options.hash.sort ?? false;

        selected =
            selected instanceof Array ?
                selected.map(String)
            :   [String(selected)];

        // Prepare the choices as an array of objects
        const selectOptions = [];
        if (choices instanceof Array) {
            for (const choice of choices) {
                const label = String(choice);
                selectOptions.push({ value: label, label });
            }
        } else {
            throw new Error("You must specify an array to selectArray");
        }

        // Sort the array of options
        if (sort) selectOptions.sort((a, b) => a.label.localeCompare(b.label));

        // Prepend a blank option
        if (blank !== null) {
            selectOptions.unshift({ value: "", label: blank });
        }

        // Create the HTML
        let fragHtml = "";
        for (const option of selectOptions) {
            const label = Handlebars.escapeExpression(option.label);
            const isSelected = selected.includes(option.value);
            fragHtml += `<option value="${option.value}" ${isSelected ? "selected" : ""}>${label}</option>`;
        }
        return new Handlebars.SafeString(fragHtml);
    });

    Handlebars.registerHelper("endswith", function (op1, op2) {
        return op1.endsWith(op2);
    });

    Handlebars.registerHelper("concat", function () {
        var outStr = "";
        for (var arg in arguments) {
            if (typeof arguments[arg] != "object") {
                outStr += arguments[arg];
            }
        }
        return outStr;
    });

    Handlebars.registerHelper(
        "optionalString",
        function (cond, strTrue = "", strFalse = "") {
            if (cond) return strTrue;
            return strFalse;
        },
    );

    Handlebars.registerHelper("setHas", function (set, value) {
        return set.has(value);
    });

    Handlebars.registerHelper("contains", function (container, value, options) {
        return container.includes(value) ?
                options.fn(container)
            :   options.inverse(container);
    });

    Handlebars.registerHelper("toJSON", function (obj) {
        return JSON.stringify(obj);
    });

    Handlebars.registerHelper("toLowerCase", function (str) {
        return str.toLowerCase();
    });

    Handlebars.registerHelper("getProperty", function (object, key) {
        return sohl.utils.getPathValue(object, key);
    });

    Handlebars.registerHelper("arrayToString", function (ary) {
        return ary.join(",");
    });

    Handlebars.registerHelper("injurySeverity", function (val) {
        return "NA"; // TODO: Remove this line when CONFIG.Item.dataModels.injury is available
        // if (val <= 0) return "NA";
        // return val <= 5 ?
        //         (CONFIG.Item.dataModels.injury)?.injuryLevels[val]
        //     :   `G${val}`;
    });

    Handlebars.registerHelper("object", function ({ hash }) {
        return hash;
    });

    Handlebars.registerHelper("array", function () {
        return Array.from(arguments).slice(0, arguments.length - 1);
    });

    Handlebars.registerHelper("textInput", function (value, options) {
        const { class: cssClass, ...config } = options.hash;
        config.value = value;
        const element = foundry.applications.fields.createTextInput(config);
        if (cssClass) element.className = cssClass;
        return new Handlebars.SafeString(element.outerHTML);
    });

    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    Handlebars.registerHelper("displayWorldTime", function (value, options) {
        //return new Handlebars.SafeString(sohl.utils.htmlWorldTime(value));
    });
}

async function preloadHandlebarsTemplates() {
    const partials = [
        // Item Sheet Partials
        "systems/sohl/templates/item/parts/item-actions-list.hbs",
        "systems/sohl/templates/item/parts/item-active-effects.hbs",
        "systems/sohl/templates/item/parts/item-description.hbs",
        "systems/sohl/templates/item/parts/item-nesteditems-list.hbs",
        "systems/sohl/templates/item/parts/item-gear-list.hbs",
        "systems/sohl/templates/item/parts/item-gear.hbs",
        "systems/sohl/templates/item/parts/item-masterylevel.hbs",
        "systems/sohl/templates/item/parts/item-refnote.hbs",
        "systems/sohl/templates/item/parts/item-strikemode.hbs",
        "systems/sohl/templates/item/parts/item-header.hbs",
    ];

    const paths = {};
    for (const path of partials) {
        paths[path.replace(".hbs", ".html")] = path;
        const fileName = path.split("/").pop();
        if (fileName) {
            paths[`sohl.${fileName.replace(".hbs", "")}`] = path;
        }
    }

    return loadTemplates(paths);
}
