/* eslint-disable no-unused-vars */
import * as sohl from "./sohl-common.js";
import * as legendary from "./legendary.js";
import * as mistyisle from "./mistyisle.js";

function setupSohlVersion(verData) {
    console.log(verData.CONST.initVersionMessage);
    sohl.SOHL.sysVer = verData;

    Object.values(verData.CONST.VERSETTINGS).forEach((setting) => {
        game.settings.register("sohl", setting.key, setting.data);
    });

    foundry.utils.mergeObject(CONFIG.Item, verData.CONFIG.Item, {
        inplace: true,
    });
    foundry.utils.mergeObject(CONFIG.Actor, verData.CONFIG.Actor, {
        inplace: true,
    });
    foundry.utils.mergeObject(CONFIG.Macro, verData.CONFIG.Macro, {
        inplace: true,
    });
    foundry.utils.mergeObject(
        CONFIG.ActiveEffect,
        verData.CONFIG.ActiveEffect,
        { inplace: true },
    );
    foundry.utils.mergeObject(CONFIG.Combatant, verData.CONFIG.Combatant, {
        inplace: true,
    });

    // Register sheet application classes
    if (Actors.registeredSheets.length) {
        Actors.unregisterSheet("sohl", ...Actors.registeredSheets);
    }

    sohl.SOHL.sysVer.CONFIG.Actor.documentSheets.forEach(({ cls, types }) => {
        Actors.registerSheet("sohl", cls, {
            types: types,
            makeDefault: true,
        });
    });
    if (Items.registeredSheets.length) {
        Items.unregisterSheet("sohl", ...Items.registeredSheets);
    }
    sohl.SOHL.sysVer.CONFIG.Item.documentSheets.forEach(({ cls, types }) => {
        Items.registerSheet("sohl", cls, {
            types: types,
            makeDefault: true,
        });
    });
    if (Macros.registeredSheets.length) {
        Macros.unregisterSheet("sohl", ...Macros.registeredSheets);
    }
    Macros.registerSheet("sohl", verData.CONFIG.Macro.documentSheet, {
        makeDefault: true,
        label: `Default ${verData.label} Macro Sheet`,
    });
    DocumentSheetConfig.unregisterSheet(
        ActiveEffect,
        "core",
        ActiveEffectConfig,
    );
    DocumentSheetConfig.registerSheet(
        ActiveEffect,
        "sohl",
        sohl.SohlActiveEffectConfig,
        {
            makeDefault: true,
            label: "Default HarnMaster Active Effect Sheet",
        },
    );
    Macros.registerSheet("sohl", verData.CONFIG.Macro.documentSheet, {
        makeDefault: true,
        label: `Default ${verData.label} Macro Sheet`,
    });
}

/*===============================================================*/
/*      System Settings                                          */
/*===============================================================*/
function registerSystemSettings() {
    Object.values(sohl.SOHL.CONST.SETTINGS).forEach((setting) => {
        game.settings.register("sohl", setting.key, setting.data);
    });
}

/*===============================================================*/
/*      System Initialization                                    */
/*===============================================================*/

Hooks.on("renderChatMessage", (app, html, data) => {
    // Display action buttons
    sohl.SOHL.cmds.displayChatActionButtons(app, html, data);
});

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
Hooks.on("renderChatLog", (app, html, data) => {
    html.on(
        "click",
        ".card-buttons button",
        sohl.SOHL.cmds.onChatCardAction.bind(this),
    );
});

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
Hooks.on("renderChatPopout", (app, html, data) => {
    html.on(
        "click",
        ".card-buttons button",
        sohl.SOHL.cmds.onChatCardAction.bind(this),
    );
});

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
Hooks.on("renderSceneConfig", (app, html, data) => {
    const scene = app.object;
    if (app.renderTOTMScene) return;
    app.renderTOTMScene = true;

    let isTotm = scene.getFlag("sohl", "isTotm");
    if (typeof isTotm === "undefined") {
        if (!scene.compendium) {
            scene.setFlag("sohl", "isTotm", false);
        }
        isTotm = false;
    }

    const totmHtml = `
    <div class="form-group">
        <label>Theatre of the Mind</label>
        <input id="sohl-totm" type="checkbox" name="sohlTotm" data-dtype="Boolean" ${isTotm ? "checked" : ""}>
        <p class="notes">Configure scene for Theatre of the Mind (e.g., no range calcs).</p>
    </div>
    `;

    const totmFind = html.find("input[name = 'gridAlpha']");
    const formGroup = totmFind.closest(".form-group");
    formGroup.after(totmHtml);
});

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
Hooks.on("closeSceneConfig", (app, html, data) => {
    const scene = app.object;
    app.renderTOTMScene = false;
    if (!scene.compendium) {
        scene.setFlag(
            "sohl",
            "isTotm",
            html.find("input[name='sohlTotm']").is(":checked"),
        );
    }
});

Hooks.once("init", async function () {
    console.log(`SoHL | ${sohl.SOHL.CONST.sohlInitMessage}`);

    game.sohl = sohl.SOHL;

    // Register all available SoHR versions
    sohl.SOHL.registerSystemVersion("legendary", legendary.verData);
    sohl.SOHL.registerSystemVersion("mistyisle", mistyisle.verData);

    // Initialize all system settings
    registerSystemSettings();

    let hmVer = game.settings.get(
        "sohl",
        sohl.SOHL.CONST.SETTINGS.sohlVariant.key,
    );
    if (hmVer) {
        setupSohlVersion(sohl.SOHL.versionsData[hmVer]);
    }

    /**
     * Set an initiative formula for the system
     * @type {String}
     */
    CONFIG.Combat.initiative = {
        formula: "@initiativeRank",
        decimals: 2,
    };

    // Set Combat Time Length
    CONFIG.time.roundTime = 5;
    CONFIG.time.turnTime = 0;

    sohl.SOHL.statusEffects.forEach((s) => CONFIG.statusEffects.push(s));
    foundry.utils.mergeObject(
        CONFIG.specialStatusEffects,
        sohl.SOHL.specialStatusEffects,
    );
    foundry.utils.mergeObject(CONFIG.controlIcons, sohl.SOHL.controlIcons);

    // Replace the standard fromUuidSync and fromUuid with new ones
    // that can handle embed items.
    globalThis.origFromUuidSync = globalThis.fromUuidSync;
    globalThis.origFromUuid = globalThis.fromUuid;
    globalThis.fromUuidSync = function (uuid, options = {}) {
        let doc = options.doc;
        let parts = options.parts;
        if (!doc) {
            parts = uuid.split("#");
            const topUuid = parts.shift();
            doc = globalThis.origFromUuidSync(topUuid, options);
        }

        if (doc instanceof sohl.SohlActor && parts.length) {
            // The UUID is for a nested or virtual item,
            // and the doc is an Actor.  Search for the
            // item in the virtual items list.
            const found = doc.system.virtualItems.find(
                (it) => it.uuid === uuid,
            );
            if (found) return found;
        }

        while (doc && parts.length) {
            const docType = parts.shift();
            const docId = parts.shift();

            if (docType === "VirtualItem") {
                if (!(doc instanceof sohl.SohlActor)) {
                    throw new Error(`Invalid UUID: ${uuid}`);
                }
                doc = doc.system.virtualItems.get(docId);
            } else if (docType === "NestedItem") {
                if (!(doc instanceof sohl.SohlItem)) {
                    throw new Error(`Invalid UUID: ${uuid}`);
                }
                doc = doc.system.items.get(docId);
            } else if (docType === "NestedMacro") {
                if (!(doc.system instanceof sohl.SohlBaseData)) {
                    throw new Error(`Invalid UUID: ${uuid}`);
                }
                doc = doc.system.actions.get(docId);
            } else {
                throw new Error(`Invalid UUID: ${uuid}`);
            }

            if (!doc) {
                console.error(`UUID ${uuid} not found`);
                break;
            }
        }

        return doc;
    };

    globalThis.fromUuid = async function (uuid, options = {}) {
        let parts = uuid.split("#");
        const topUuid = parts.shift();
        let doc = await globalThis.origFromUuid(topUuid, options);
        return globalThis.fromUuidSync(null, { doc, parts });
    };
});

/**
 * Once the entire VTT framework is initialized, check to see if
 * we should perform a data migration.
 */
Hooks.once("ready", function () {
    //Hooks.on("hotbarDrop", (bar, data, slot) => LegendaryCommand.createHMMacro(data, slot));

    if (
        game.settings.get(
            "sohl",
            sohl.SOHL.CONST.SETTINGS.showWelcomeDialog.key,
        )
    ) {
        welcomeDialog().then((showAgain) => {
            if (showAgain !== null)
                game.settings.set("sohl", "showWelcomeDialog", showAgain);
        });
    }

    if (game.user.isGM) {
        if (game.modules.get("foundryvtt-simple-calendar")?.active) {
            Hooks.on(SimpleCalendar.Hooks.Ready, () => {
                sohl.SOHL.hasSimpleCalendar = true;
            });
        }

        /*
         * Certain actions must only be performed by a single player. These
         * are best handled by the active GM. However, the active GM can change
         * during the game if the current active GM leaves and a new Assistant GM
         * becomes the active GM.  So, these all check each time to determine whether
         * they are the active GM before processing.
         */

        /*
         * Various actions need to occur whenever there is a change to the
         * current world time.
         */

        if (game.user.isGM) {
            const timeChangeWork = () => {
                if (game.user.ActiveGM?.isSelf) {
                    game.actors.forEach((actor) => actor.timeChangeWork());
                }
            };

            Hooks.on("updateWorldTime", timeChangeWork);
            Hooks.on("updateCombat", timeChangeWork);

            /*
             * Call the combat fatigue handler whenever combat is started or the round
             * changes.
             */

            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
            Hooks.on("combatStart", (combat, updateData) => {
                if (game.user.ActiveGM?.isSelf)
                    sohl.SOHL.cmds.handleCombatFatigue(combat);
            });

            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
            Hooks.on("combatRound", (combat, updateData, updateOptions) => {
                if (game.user.ActiveGM?.isSelf)
                    sohl.SOHL.cmds.handleCombatFatigue(combat);
            });
        }

        // see docs for more info https://github.com/fantasycalendar/FoundryVTT-ItemPiles/blob/master/docs/api.md
        Hooks.once("item-piles-ready", async () => {
            game.itempiles.API.addSystemIntegration({
                VERSION: "1.0.0",

                // The actor class type is the type of actor that will be used for the default item pile actor that is created on first item drop.
                ACTOR_CLASS_TYPE: "object",

                // The item class type is the type of item that will be used for the default loot item
                ITEM_CLASS_LOOT_TYPE: "miscgear",

                // The item class type is the type of item that will be used for the default weapon item
                ITEM_CLASS_WEAPON_TYPE: "weapongear",

                // The item class type is the type of item that will be used for the default equipment item
                ITEM_CLASS_EQUIPMENT_TYPE: "miscgear",

                CURRENCY_DECIMAL_DIGITS: 0.01,

                // The item quantity attribute is the path to the attribute on items that denote how many of that item that exists
                ITEM_QUANTITY_ATTRIBUTE: "system.quantity",

                // The item price attribute is the path to the attribute on each item that determine how much it costs
                ITEM_PRICE_ATTRIBUTE: "system.value",

                // Item types and the filters actively remove items from the item pile inventory UI that users cannot loot, such as spells, feats, and classes
                ITEM_FILTERS: [
                    {
                        path: "type",
                        filters: game.documentTypes.Item.filter(
                            (item) => item != "base" && !item.endsWith("gear"),
                        ).join(","),
                    },
                ],

                UNSTACKABLE_ITEM_TYPES: [
                    "weapongear",
                    "armorgear",
                    "containergear",
                ],

                // Item similarities determines how item piles detect similarities and differences in the system
                ITEM_SIMILARITIES: ["name", "type"],

                // Currencies in item piles is a versatile system that can accept actor attributes (a number field on the actor's sheet) or items (actual items in their inventory)
                // In the case of attributes, the path is relative to the "actor.system"
                // In the case of items, it is recommended you export the item with `.toObject()` and strip out any module data
                CURRENCIES: [
                    {
                        type: "item",
                        name: "Pence",
                        img: "systems/sohl/assets/icons/coins.svg",
                        abbreviation: "{#}d",
                        data: {
                            item: {
                                name: "Pence",
                                type: "miscgear",
                                img: "systems/sohl/assets/icons/coins.svg",
                                system: {
                                    quantity: 1,
                                    isCarried: true,
                                    isEquipped: false,
                                    qualityBase: 0,
                                    durabilityBase: 10,
                                    valueBase: 1,
                                    weightBase: 0.004,
                                },
                            },
                        },
                        primary: true,
                        exchangeRate: 1,
                    },
                ],
            });
        });

        // Determine whether a system migration is required
        const currentWorldSystemVersion = game.settings.get(
            "sohl",
            sohl.SOHL.CONST.SETTINGS.systemMigrationVersion.key,
        );

        if (currentWorldSystemVersion) {
            console.log(
                `SoHL | Current World Version = ${currentWorldSystemVersion}`,
            );

            if (
                foundry.utils.isNewerVersion(
                    game.system.flags.compatibleMigrationVersion,
                    currentWorldSystemVersion,
                )
            ) {
                ui.notifications.error(
                    `This world uses a version of SoHR (${currentWorldSystemVersion}) ` +
                        `that is too old to be migrated to the new version of S`,
                    { permanent: true },
                );
            } else {
                if (
                    foundry.utils.isNewerVersion(
                        game.system.flags.needsMigrationVersion,
                        currentWorldSystemVersion,
                    )
                ) {
                    // Perform the migration
                    console.warn("!!! PERFORM MIGRATION !!!");
                    //LegendaryMigration.migrateWorld();
                }
            }
        } else {
            game.settings.set(
                "sohl",
                "systemMigrationVersion",
                game.system.version,
            );
        }
    }

    // Preload handlebars helpers and partials
    registerHandlebarsHelpers();
    preloadHandlebarsTemplates();

    sohl.SOHL.ready = true;
});

async function welcomeDialog() {
    const dlgTemplate = "systems/sohl/templates/dialog/welcome.html";
    const html = await renderTemplate(dlgTemplate, {});

    // Create the dialog window
    return Dialog.prompt({
        title: "Welcome!",
        content: html,
        label: "Dismiss",
        callback: (html) => {
            const form = html.querySelector("#welcome");
            const fd = new FormDataExtended(form);
            const data = fd.object;
            return data.showOnStartup;
        },
        rejectClose: false,
        options: { jQuery: false },
    });
}

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
        let { selected = null, blank = null, sort = false } = options.hash;
        selected =
            selected instanceof Array
                ? selected.map(String)
                : [String(selected)];

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
        let html = "";
        for (const option of selectOptions) {
            const label = Handlebars.escapeExpression(option.label);
            const isSelected = selected.includes(option.value);
            html += `<option value="${option.value}" ${isSelected ? "selected" : ""}>${label}</option>`;
        }
        return new Handlebars.SafeString(html);
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
        return container.includes(value)
            ? options.fn(this)
            : options.inverse(this);
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
        if (val <= 0) return "NA";
        return val <= 5
            ? sohl.SOHL.InjuryItemData.injuryLevels[val]
            : `G${val}`;
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
        return new Handlebars.SafeString(sohl.Utility.htmlWorldTime(value));
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
        paths[`sohl.${path.split("/").pop().replace(".hbs", "")}`] = path;
    }

    return loadTemplates(paths);
}
