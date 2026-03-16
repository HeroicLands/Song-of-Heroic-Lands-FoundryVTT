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

import type { SohlSpeaker } from "@common/SohlSpeaker";
import { SohlSystem } from "@common/SohlSystem";
import { LegendarySystem } from "@legendary/LegendarySystem";
import { MistyIsleSystem } from "@mistyisle/MistyIsleSystem";
import { LOGLEVEL } from "@utils/constants";
import { AIAdapter } from "@utils/ai/AIAdapter";
import { SohlCombatant } from "@common/combatant/SohlCombatant";

// Register all system variants
SohlSystem.registerVariant(LegendarySystem.ID, LegendarySystem.getInstance());
SohlSystem.registerVariant(MistyIsleSystem.ID, MistyIsleSystem.getInstance());

function setupVariant(): SohlSystem {
    const variantId = game.settings.get("sohl", "variant");
    const sohl = SohlSystem.selectVariant(variantId);
    foundry.utils.mergeObject(CONFIG, sohl.CONFIG);
    sohl.setupSheets();
    console.log(sohl.initMessage);
    return sohl;
}

function registerSystemSettings() {
    game.settings.register("sohl", "systemMigrationVersion", {
        name: "SOHL.Settings.systemMigrationVersion.label",
        scope: "world",
        config: false,
        type: String,
        default: "",
    });
    game.settings.register("sohl", "variant", {
        name: "SOHL.Settings.Variant.label",
        hint: "SOHL.Settings.Variant.hint",
        scope: "world",
        config: true,
        requiresReload: true,
        default: "legendary",
        type: String,
        choices: {
            legendary: "SOHL.Settings.Variant.CHOICES.Legendary",
            mistyisle: "SOHL.Settings.Variant.CHOICES.MistyIsle",
        },
    });
    game.settings.register("sohl", "logLevel", {
        name: "SOHL.Settings.logLevel.label",
        hint: "SOHL.Settings.logLevel.hint",
        scope: "client",
        config: true,
        default: "info",
        type: String,
        choices: {
            debug: "SOHL.Settings.logLevel.CHOICES.debug",
            info: "SOHL.Settings.logLevel.CHOICES.info",
            warn: "SOHL.Settings.logLevel.CHOICES.warn",
            error: "SOHL.Settings.logLevel.CHOICES.error",
        },
        onChange: (value: string): void => {
            sohl.log.setLogThreshold(value);
        },
    });
    game.settings.register("sohl", "showWelcomeDialog", {
        name: "SOHL.Settings.showWelcomeDialog.label",
        hint: "SOHL.Settings.showWelcomeDialog.hint",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register("sohl", "showAssemblies", {
        name: "SOHL.Settings.showAssemblies.label",
        hint: "SOHL.Settings.showAssemblies.hint",
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
    });
    game.settings.register("sohl", "combatAudio", {
        name: "SOHL.Settings.combatAudio.label",
        hint: "SOHL.Settings.combatAudio.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register("sohl", "recordTrauma", {
        name: "SOHL.Settings.recordTrauma.label",
        hint: "SOHL.Settings.recordTrauma.hint",
        scope: "world",
        config: true,
        default: "enable",
        type: String,
        choices: {
            enable: "SOHL.Settings.recordTrauma.Choices.Enable",
            disable: "SOHL.Settings.recordTrauma.Choices.Disable",
            ask: "SOHL.Settings.recordTrauma.Choices.Ask",
        },
    });
    game.settings.register("sohl", "healingSeconds", {
        name: "SOHL.Settings.healingSeconds.label",
        hint: "SOHL.Settings.healingSeconds.hint",
        scope: "world",
        config: true,
        type: Number,
        default: 432000, // 5 days
    });
    game.settings.register("sohl", "optionProjectileTracking", {
        name: "SOHL.Settings.optionProjectileTracking.label",
        hint: "SOHL.Settings.optionProjectileTracking.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });
    game.settings.register("sohl", "optionFate", {
        name: "SOHL.Settings.optionFate.label",
        hint: "SOHL.Settings.optionFate.hint",
        scope: "world",
        config: true,
        default: "enable",
        type: String,
        choices: {
            none: "SOHL.Settings.optionFate.None",
            pconly: "SOHL.Settings.optionFate.PCOnly",
            everyone: "SOHL.Settings.optionFate.Everyone",
        },
    });
    game.settings.register("sohl", "optionGearDamage", {
        name: "SOHL.Settings.optionGearDamage.label",
        hint: "SOHL.Settings.optionGearDamage.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });
    game.settings.register("sohl", "tacticalDistanceUnit", {
        name: "SOHL.Settings.tacticalDistanceUnit.label",
        hint: "SOHL.Settings.tacticalDistanceUnit.hint",
        scope: "world",
        config: true,
        type: String,
        choices: {
            meter: "SOHL.Settings.tacticalDistanceUnit.CHOICES.meter", // 1 meter
            foot: "SOHL.Settings.tacticalDistanceUnit.CHOICES.foot", // 0.3048 meters
            yard: "SOHL.Settings.tacticalDistanceUnit.CHOICES.yard", // 0.9144 meters
            cubit: "SOHL.Settings.tacticalDistanceUnit.CHOICES.cubit", // 0.4572 meters
        },
        default: "meter",
    });
    game.settings.register("sohl", "trekDistanceUnit", {
        name: "SOHL.Settings.trekDistanceUnit.label",
        hint: "SOHL.Settings.trekDistanceUnit.hint",
        scope: "world",
        config: true,
        type: String,
        choices: {
            kilometer: "SOHL.Settings.trekDistanceUnit.CHOICES.kilometer", // 1000 meters
            mile: "SOHL.Settings.trekDistanceUnit.CHOICES.mile", // 1609.344 meters
            nauticalMile: "SOHL.Settings.trekDistanceUnit.CHOICES.nauticalMile", // 1852 meters
            league: "SOHL.Settings.trekDistanceUnit.CHOICES.league", // 4828.032 meters
            li: "SOHL.Settings.trekDistanceUnit.CHOICES.li", // Chinese miles; 500 meters
            parsang: "SOHL.Settings.trekDistanceUnit.CHOICES.parsang", // 5500 meters
        },
        default: "kilometer",
    });
}

/**
 * Register startup hooks
 */
function registerSystemHooks() {
    Hooks.on(
        "chatMessage",
        (
            _app: ChatLog,
            message: string,
            data: {
                speaker?: Partial<SohlSpeaker.Data>;
                user: string | null;
            },
        ) => AIAdapter.chatMessage(ui.chat, message, data),
    );

    Hooks.on(
        "renderChatMessageHTML",
        (_chatMsg: ChatMessage, element: HTMLElement, _data: PlainObject) => {
            element.addEventListener("click", (ev) => {
                const btn: HTMLButtonElement | null = (
                    ev.target as HTMLElement
                )?.closest("button");
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
                    const edit: HTMLElement | null = (
                        ev.target as HTMLElement
                    )?.closest("a.edit-action");
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
        },
    );

    Hooks.on(
        "renderSceneConfig",
        (app: SceneConfig, element: HTMLElement, data: PlainObject) => {
            const scene: Scene = app.document;
            const isTotm =
                foundry.utils.getProperty(scene.flags, "sohl.isTotm") ?? false;
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
        },
    );

    Hooks.on("closeSceneConfig", (app: SceneConfig) => {
        const scene = app.document;
        const input = app.form?.querySelector<HTMLInputElement>(
            "input[name='sohlTotm']",
        );
        const isTotm = input?.checked ?? false;
        scene.setFlag("sohl" as any, "isTotm", isTotm);
    });

    (Hooks as any).on(
        "updateCombat",
        async (combat: Combat, changed: DeepPartial<Combat.Source>) => {
            if (changed.turn === undefined && changed.round === undefined)
                return;

            const combatant = combat.combatant as SohlCombatant | null;
            if (!combatant?.token) return;

            const token = combatant.token as any;
            const center = token.object?.center ?? token.center;
            if (!center) return;

            const updateData = {
                system: {
                    initialLocation: {
                        x: center.x,
                        y: center.y,
                        elevation: token.elevation ?? 0,
                    },
                    didAction: false,
                },
            } satisfies DeepPartial<
                SohlCombatant["_source"]
            > as Combatant.UpdateData;
            await combatant.update(updateData);
        },
    );
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
