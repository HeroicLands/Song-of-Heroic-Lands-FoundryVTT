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

import { SohlSystem } from "@common/SohlSystem";
import { LegendarySystem } from "@legendary/LegendarySystem";
import { MistyIsleSystem } from "@mistyisle/MistyIsleSystem";
import { SohlActor } from "@common/actor/SohlActor";
import { SohlActiveEffectConfig } from "@common/effect/SohlActiveEffectConfig";
import { SohlItem } from "@common/item/SohlItem";
import { LOGLEVEL, LogLevel } from "@utils/constants";
import { AIAdapter } from "@utils/ai/AIAdapter";

// Register all system variants
SohlSystem.registerVariant(LegendarySystem.ID, LegendarySystem.getInstance());
SohlSystem.registerVariant(MistyIsleSystem.ID, MistyIsleSystem.getInstance());

// @ts-expect-error - DocumentSheetConfig is a known class in Foundry
const DocumentSheetConfigClass = foundry.applications.apps.DocumentSheetConfig;
DocumentSheetConfigClass.registerSheet(
    CONFIG.Actor.documentClass,
    "sohl",
    SohlActor.Sheet,
    {
        types: ["sohl"],
        makeDefault: true,
    },
);
DocumentSheetConfigClass.registerSheet(
    CONFIG.Item.documentClass,
    "sohl",
    SohlItem.Sheet,
    {
        types: ["sohl"],
        makeDefault: true,
    },
);
DocumentSheetConfigClass.registerSheet(
    CONFIG.ActiveEffect.documentClass,
    "sohl",
    SohlActiveEffectConfig,
    {
        types: ["sohl"],
        makeDefault: true,
    },
);

function setupVariant(): SohlSystem {
    const variantId = (game as any).settings?.get("sohl", "variant");
    const sohl = SohlSystem.selectVariant(variantId);
    foundry.utils.mergeObject(CONFIG, sohl.CONFIG);
    console.log(sohl.initMessage);
    return sohl;
}

function registerSystemSettings() {
    const settings = (game as any).settings;
    settings.register("sohl", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        initial: "",
    });
    settings.register("sohl", "variant", {
        name: "Rules Variant",
        hint: "Which variant of rules to use",
        scope: "world",
        config: true,
        requiresReload: true,
        initial: "legendary",
        type: String,
        choices: {
            legendary: "Legendary",
            mistyisle: "MistyIsle",
        },
    });
    settings.register("sohl", "logLevel", {
        name: "Log Level",
        hint: "The level of detail to include in logs",
        scope: "client",
        config: true,
        initial: "info",
        type: String,
        choices: {
            debug: "Debug",
            info: "Informational",
            warn: "Warning",
            error: "Error",
        },
    });
    settings.register("sohl", "showWelcomeDialog", {
        name: "Show welcome dialog on start",
        hint: "Display the welcome dialog box when the user logs in.",
        scope: "client",
        config: true,
        type: Boolean,
        initial: true,
    });
    settings.register("sohl", "showAssemblies", {
        name: "Show Assemblies in Actors Tab",
        hint: "If enabled, shows all Assembly actors you own.",
        scope: "client",
        config: true,
        type: Boolean,
        initial: false,
    });
    settings.register("sohl", "combatAudio", {
        name: "Combat sounds",
        hint: "Enable combat flavor sounds",
        scope: "world",
        config: true,
        type: Boolean,
        initial: true,
    });
    settings.register("sohl", "recordTrauma", {
        name: "Record trauma automatically",
        hint: "Automatically add physical and mental afflictions and injuries",
        scope: "world",
        config: true,
        initial: "enable",
        type: String,
        choices: {
            enable: "Record trauma automatically",
            disable: "Don't record trauma automatically",
            ask: "Prompt user on each injury or affliction",
        },
    });
    settings.register("sohl", "healingSeconds", {
        name: "Seconds between healing checks",
        hint: "Number of seconds between healing checks. Set to 0 to disable.",
        scope: "world",
        config: true,
        type: Number,
        initial: 432000, // 5 days
    });
    settings.register("sohl", "optionProjectileTracking", {
        name: "Track Projectile/Missile Quantity",
        hint: "Reduce projectile/missile quantity when used; disallow missile attack when quantity is zero",
        scope: "world",
        config: true,
        type: Boolean,
        initial: false,
    });
    settings.register("sohl", "optionFate", {
        name: "Fate: Use fate rules",
        scope: "world",
        config: true,
        initial: "enable",
        type: String,
        choices: {
            none: "Fate rules disabled",
            pconly: "Fate rules only apply to PCs",
            everyone: "Fate rules apply to all animate actors",
        },
    });
    settings.register("sohl", "optionGearDamage", {
        name: "Gear Damage",
        hint: "Enable combat rule that allows gear (weapons and armor) to be damaged or destroyed on successful block",
        scope: "world",
        config: true,
        type: Boolean,
        initial: false,
    });
    settings.register("sohl", "logThreshold", {
        name: "Log Level Threshold",
        scope: "world",
        config: true,
        initial: "info",
        type: String,
        choices: {
            debug: "Debug",
            info: "Informational",
            warn: "Warning",
            error: "Error",
        },
        onChange: (value: LogLevel) => {
            sohl.log.setLogThreshold(value);
        },
    });
}

/**
 * Register startup hooks
 */
function registerSystemHooks() {
    Hooks.on("chatMessage", (_app, message, data) =>
        AIAdapter.chatMessage(ui.chat, message, data as any),
    );

    Hooks.on(
        "renderChatMessageHTML",
        (_app: any, element: HTMLElement, _data: any) => {
            element.addEventListener("click", (ev) => {
                const btn: HTMLButtonElement | null = (
                    ev.target as HTMLElement
                )?.closest("button");
                if (btn?.closest(".card-buttons")) {
                    const docUuid = btn.dataset.docUuid;
                    if (docUuid) {
                        // @ts-expect-error
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
                    const edit: HTMLElement | null = (
                        ev.target as HTMLElement
                    )?.closest("a.edit-action");
                    const docUuid = edit?.dataset.docUuid;
                    if (docUuid) {
                        // @ts-expect-error
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
        },
    );

    Hooks.on("renderSceneConfig", (app: any, element: HTMLElement) => {
        const scene: Scene = app.object;
        const isTotm =
            foundry.utils.getProperty((scene as any).flags, "sohl.isTotm") ??
            false;
        const totmHTML = `<div class="form-group">
        <label>Theatre of the Mind</label>
        <input id="sohl-totm" type="checkbox" name="sohlTotm" data-dtype="Boolean" ${isTotm ? "checked" : ""}>
        <p class="notes">Configure scene for Theatre of the Mind.</p>
      </div>`;
        const target: HTMLElement = element.querySelector(
            "input[name='gridAlpha']",
        ) as HTMLElement;
        target
            ?.closest(".form-group")
            ?.insertAdjacentHTML("afterend", totmHTML);
    });

    Hooks.on("closeSceneConfig", (app: any, element: HTMLElement) => {
        const scene = app.object;
        const isTotm =
            (
                element.querySelector(
                    "input[name='sohlTotm']",
                ) as HTMLInputElement
            )?.checked ?? false;
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
    globalThis.sohl = setupVariant();
    sohl.log.setLogThreshold(
        (game as any).settings.get("sohl", "logLevel") || LOGLEVEL.INFO,
    );
    registerSystemHooks();

    CONFIG.Combat.initiative = { formula: "@initiativeRank", decimals: 2 };
    CONFIG.time.roundTime = 5;
    CONFIG.time.turnTime = 0;
});

// Register ready hook
Hooks.once("ready", async () => {
    registerHandlebarsHelpers();
    SohlSystem.ready = true;
});

Hooks.once("simpleCalendarReady", async () => {
    SohlSystem.simpleCalendar = (game as any).modules.get(
        "foundryvtt-simple-calendar",
    );
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
        return foundry.utils.getProperty(object, key);
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
