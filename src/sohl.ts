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

import { SOHLCONFIG } from "@src/core/foundry/sohl-config";
import { SohlSystem } from "@src/core/logic/SohlSystem";
import { ACTOR_KIND, LOGLEVEL } from "@src/utils/constants";
import { SohlCombatant } from "@src/document/combatant/foundry/SohlCombatant";
import { resolveChatCardHandlerUuid } from "@src/document/chat/chat-card-dispatch";
import { gateAutomatedDefenseButtons } from "@src/document/chat/chat-card-gating";
import { CohortDataModel } from "@src/document/actor/foundry/CohortDataModel";
import { registerCombatTrackerHooks } from "@src/document/combat/combat-tracker-hooks";
import { registerCombatantConfigHooks } from "@src/document/combatant/combatant-config-hooks";
import { wireSohlHookBridge } from "@src/core/logic/SohlHookBridge";
import { CalendarSettingsMenu } from "@src/apps/foundry/CalendarSettingsMenu";
import { DomainManagerApp } from "@src/apps/foundry/DomainManagerApp";
import { ExpressionLibraryMenu } from "@src/apps/foundry/ExpressionLibraryMenu";
import { expressionHelpers } from "@src/entity/expr/ExpressionHelperRegistry";
import { DomainRegistry } from "@src/entity/domain/DomainRegistry";
import { BUILTIN_DOMAINS } from "@src/entity/domain/builtin-domains";
import { SohlTokenDocument } from "@src/document/token/foundry/SohlTokenDocument";

/**
 * Initializes the SoHL system: merges its CONFIG into Foundry's and
 * registers the document sheets.
 * @returns The initialized {@link SohlSystem} singleton.
 */
function setupSystem(): SohlSystem {
    const sohl = SohlSystem.getInstance();
    foundry.utils.mergeObject(CONFIG, SOHLCONFIG);
    // TokenDocument is not a typed document (no `system` DataModel), so it is
    // registered directly here rather than through a `SOHLCONFIG` block. This
    // makes canvas tokens `SohlTokenDocument` instances, giving them the
    // transient `.logic` adapter and `onChatCardButton` that the opposed-test
    // flow dispatches to.
    CONFIG.Token.documentClass = SohlTokenDocument as any;
    sohl.setupSheets();
    console.log("Song of Heroic Lands | System initialized");
    return sohl;
}

/**
 * Registers all SoHL world and client settings with Foundry's settings API.
 */
function registerSystemSettings() {
    game.settings.register("sohl", "systemMigrationVersion", {
        name: "SOHL.Settings.systemMigrationVersion.label",
        scope: "world",
        config: false,
        type: String,
        default: "",
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
    game.settings.register("sohl", "combatAudio", {
        name: "SOHL.Settings.combatAudio.label",
        hint: "SOHL.Settings.combatAudio.hint",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
    });
    game.settings.register("sohl", "recordTrauma", {
        name: "SOHL.Settings.recordTrauma.label",
        hint: "SOHL.Settings.recordTrauma.hint",
        scope: "client",
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

    // Calendar settings
    game.settings.register("sohl", "activeCalendar", {
        name: "SOHL.Settings.Calendar.Name",
        hint: "SOHL.Settings.Calendar.Hint",
        scope: "world",
        config: false,
        type: String,
        default: "sohl-default",
        onChange: (value: string): void => {
            try {
                SohlSystem.applyCalendar(value);
            } catch (err) {
                sohl.log.error(`Failed to apply calendar "${value}":`, err);
            }
        },
    });
    game.settings.register("sohl", "importedCalendars", {
        name: "SOHL.Settings.ImportedCalendars.Name",
        scope: "world",
        config: false,
        type: Object,
        default: {},
    });
    game.settings.registerMenu("sohl", "calendarConfig", {
        name: "SOHL.Settings.CalendarConfig.Name",
        label: "SOHL.Settings.CalendarConfig.Label",
        hint: "SOHL.Settings.CalendarConfig.Hint",
        icon: "sohl-calendar",
        type: CalendarSettingsMenu as any,
        restricted: true,
    });

    // Domain registry settings
    game.settings.register("sohl", "domains", {
        name: "SOHL.Settings.domains.label",
        hint: "SOHL.Settings.domains.hint",
        scope: "world",
        config: false,
        type: Object,
        default: {},
        requiresReload: false,
    });
    game.settings.registerMenu("sohl", "domainsMenu", {
        name: "SOHL.Settings.domainsMenu.name",
        label: "SOHL.Settings.domainsMenu.label",
        hint: "SOHL.Settings.domainsMenu.hint",
        icon: "sohl-circle",
        type: DomainManagerApp as any,
        restricted: true,
    });

    // Expression helper library settings. The parsed custom-helper map and the
    // chosen file path are persisted so helpers reload on world start.
    game.settings.register("sohl", "expressionHelpers", {
        name: "SOHL.Settings.expressionHelpers.name",
        scope: "world",
        config: false,
        type: Object,
        default: {},
    });
    game.settings.register("sohl", "expressionHelpersPath", {
        name: "SOHL.Settings.expressionHelpersPath.name",
        scope: "world",
        config: false,
        type: String,
        default: "",
    });
    game.settings.registerMenu("sohl", "expressionHelpersMenu", {
        name: "SOHL.Settings.expressionHelpersMenu.name",
        label: "SOHL.Settings.expressionHelpersMenu.label",
        hint: "SOHL.Settings.expressionHelpersMenu.hint",
        icon: "sohl-scroll",
        type: ExpressionLibraryMenu as any,
        restricted: true,
    });
}

/**
 * Seed the world domain registry with system built-ins. Only fills in
 * shortcodes that are not already present, so any GM-saved overrides win
 * on subsequent world loads. Idempotent and safe to call once per session.
 */
let __builtinDomainsSeeded = false;
/**
 * Registers any built-in domains missing from the world registry.
 * Idempotent: runs at most once per session and never overwrites
 * GM-saved overrides.
 */
function registerBuiltinDomains(): void {
    if (__builtinDomainsSeeded) return;
    __builtinDomainsSeeded = true;
    const existing = DomainRegistry.getAll();
    const missing = BUILTIN_DOMAINS.filter(
        (entry) => !(entry.shortcode in existing),
    );
    if (missing.length === 0) return;
    void DomainRegistry.register(missing, "sohl").catch((err) => {
        sohl.log.error("SoHL | Failed to register built-in domains", err);
    });
}

/**
 * Rehydrate imported calendars from the world setting into the registry.
 */
function rehydrateCalendars(): void {
    const imported = game.settings.get("sohl", "importedCalendars") as Record<
        string,
        any
    >;
    for (const [id, reg] of Object.entries(imported)) {
        SohlSystem.registerCalendar(id, {
            ...reg,
            builtin: false,
        });
    }
}

/**
 * Load the world's persisted custom expression helpers into the global
 * registry at world start. Reads the `expressionHelpers` world setting (a map
 * of helper name → `{ args?, body }`) and installs each; invalid entries are
 * skipped and logged. Safe to call before any data-authored expression is
 * built (item logic runs later in the lifecycle).
 */
function rehydrateExpressionHelpers(): void {
    const library = game.settings.get("sohl", "expressionHelpers") as Record<
        string,
        unknown
    >;
    if (!library || !Object.keys(library).length) return;
    const { installed, skipped } = expressionHelpers.loadLibrary(library);
    if (skipped.length) {
        for (const s of skipped) {
            sohl.log.warn(
                `Expression helper "${s.name}" skipped on load: ${s.reason}`,
            );
        }
    }
    sohl.log.info(
        `SoHL | Loaded ${installed.length} custom expression helper(s).`,
    );
}

/**
 * Apply the active calendar from settings to CONFIG.time.
 */
function applyActiveCalendar(): void {
    const activeId = game.settings.get("sohl", "activeCalendar") as string;
    const cal = SohlSystem.getCalendar(activeId);
    if (cal) {
        SohlSystem.applyCalendar(activeId);
    } else {
        console.warn(
            `SoHL | Calendar "${activeId}" not found, falling back to default`,
        );
        SohlSystem.applyCalendar("sohl-default");
    }
}

/**
 * Wires SoHL combat-tracker hooks and bridges Foundry's lifecycle hooks
 * to SoHL trigger dispatches.
 */
function registerSystemHooks() {
    registerCombatTrackerHooks();
    registerCombatantConfigHooks();

    // Translate Foundry's built-in lifecycle hooks (updateWorldTime,
    // combatStart, combatRound, combatTurn, deleteCombat) into SoHL
    // trigger dispatches. Only the active GM dispatches; non-GM clients
    // ignore the bridge.
    wireSohlHookBridge(sohl.events);

    // Intercept Cohort drops to offer group vs. individual token placement.
    (Hooks as any).on(
        "dropCanvasData",
        (_canvas: any, data: any, _event: any) => {
            if (data.type !== "Actor") return true;
            const actor =
                (Actor as any).implementation.fromDropData?.(data) ??
                game.actors?.get(data.id);
            if (!actor || actor.type !== ACTOR_KIND.COHORT) return true;
            if (!actor.isOwner) return false; // silently cancel for non-owners

            // Cancel default token creation — we'll handle it in the dialog
            CohortDataModel.handleCohortDrop(actor, data).catch((err: any) =>
                console.error("SoHL | Cohort drop error:", err),
            );
            return false;
        },
    );

    // Add "Expand Cohort" button to TokenHUD for Cohort tokens.
    (Hooks as any).on("renderTokenHUD", (hud: any, element: HTMLElement) => {
        const actor = hud.actor;
        if (!actor || actor.type !== ACTOR_KIND.COHORT) return;
        if (!actor.isOwner) return;

        const leftCol = element.querySelector(".col.left");
        if (!leftCol) return;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.classList.add("control-icon");
        btn.dataset.tooltip = game.i18n.localize("SOHL.Cohort.HUD.expand");
        btn.innerHTML = '<i class="sohl-people-group" inert></i>';
        btn.addEventListener("click", async (ev: Event) => {
            ev.preventDefault();
            const token = hud.document;
            const x = token.x;
            const y = token.y;
            const elevation = token.elevation ?? 0;

            // Delete the group token first
            await token.delete();

            // Spawn individual members at that location
            await CohortDataModel.spawnCohortMembers(actor, x, y, elevation);
        });
        leftCol.appendChild(btn);
    });

    (Hooks as any).on(
        "renderChatMessageHTML",
        (_chatMsg: ChatMessage, element: HTMLElement, _data: PlainObject) => {
            // Per-client gating: show defender-response buttons only to the
            // defender's owner, and only the defenses they're capable of.
            gateAutomatedDefenseButtons(element, (uuid) =>
                foundry.utils.fromUuidSync(uuid),
            );

            element.addEventListener("click", (ev) => {
                const btn: HTMLButtonElement | null = (
                    ev.target as HTMLElement
                )?.closest("button");
                if (btn?.closest(".card-buttons")) {
                    const docUuid = resolveChatCardHandlerUuid(btn.dataset);
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
                    const docUuid =
                        edit?.dataset ?
                            resolveChatCardHandlerUuid(edit.dataset)
                        :   null;
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
(Hooks as any).once("init", () => {
    const initMessage = `===========================================================
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

    globalThis.sohl = setupSystem();

    registerBuiltinDomains();
    rehydrateCalendars();
    applyActiveCalendar();
    rehydrateExpressionHelpers();
    sohl.log.setLogThreshold(
        (game as any).settings.get("sohl", "logLevel") || LOGLEVEL.INFO,
    );
    registerSystemHooks();

    CONFIG.Combat.initiative = { formula: "@initiativeRank", decimals: 2 };
    CONFIG.time.roundTime = 5;
    CONFIG.time.turnTime = 0;
});

// Register ready hook
(Hooks as any).once("ready", () => {
    registerHandlebarsHelpers();
    SohlSystem.ready = true;
});

/*-------------------------------------------------------*/
/*            Handlebars FUNCTIONS                       */
/*-------------------------------------------------------*/
/**
 * Registers all SoHL Handlebars helpers used by the system templates.
 */
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

    /**
     * True when the ActiveEffect changes-row should expose the
     * `strikeModePredicate` input: scope is `"weapongear"` AND the change
     * key matches `^(mod:)?sm:`. Used by the effect-config sheet to
     * conditionally render the predicate row.
     */
    Handlebars.registerHelper(
        "isSmKey",
        function (scope: unknown, key: unknown) {
            return (
                scope === "weapongear" && /^(mod:)?sm:/.test(String(key ?? ""))
            );
        },
    );

    /**
     * Format a trauma severity level for display, dispatching on subType.
     *   - physical: 0 → "NA", 1 → "M1", 2 → "S2", 3 → "S3", 4 → "G4",
     *               5 → "G5", >5 → "G{val}".
     *   - mental:   0 → "—", N → "PSY {N}".
     *   - spiritual: 0 → "—", N → "AS {N}".
     *   - shadow:   0 → "—", N → "SL {N}".
     * Unknown subType falls back to the bare number.
     */
    Handlebars.registerHelper(
        "injurySeverity",
        function (val: unknown, subType: unknown) {
            const n = Number(val) || 0;
            switch (subType) {
                case "physical":
                    if (n <= 0) return "NA";
                    return n <= 5 ?
                            ["NA", "M1", "S2", "S3", "G4", "G5"][n]
                        :   `G${n}`;
                case "mental":
                    return n <= 0 ? "—" : `PSY ${n}`;
                case "spiritual":
                    return n <= 0 ? "—" : `AS ${n}`;
                case "shadow":
                    return n <= 0 ? "—" : `SL ${n}`;
                default:
                    return String(n);
            }
        },
    );

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

    /**
     * Format a world time (seconds, as in `game.time.worldTime`) using the
     * active calendar. Safe to call regardless of which calendar (SoHL's or a
     * module's) is currently installed — the `sohl.*` formatters degrade
     * gracefully on foreign calendar classes.
     *
     * @example
     * ```hbs
     * {{displayWorldTime injury.nextHealingCheck}}
     * {{displayWorldTime t format="sohl.timestamp"}}
     * {{displayWorldTime t format="sohl.relative" short=true maxTerms=2}}
     * ```
     */
    Handlebars.registerHelper("displayWorldTime", function (value, options) {
        if (value === null || value === undefined || value === "") return "";
        const time = Number(value);
        if (!Number.isFinite(time)) return "";
        const calendar = sohl.calendar;
        if (!calendar) return "";
        const { format = "sohl.default", ...rest } = options?.hash ?? {};
        try {
            return calendar.format(time, format, rest);
        } catch (err) {
            sohl.log.warn(
                `displayWorldTime: formatter "${format}" failed`,
                err,
            );
            return "";
        }
    });
}
