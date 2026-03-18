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

import type { SohlSpeaker } from "@src/common/SohlSpeaker";
import { SohlSystem } from "@src/common/SohlSystem";
import { LegendarySystem } from "@src/common/LegendarySystem";
import { ACTOR_KIND, LOGLEVEL } from "@src/utils/constants";
import { AIAdapter } from "@src/utils/ai/AIAdapter";
import { SohlCombatant } from "@src/common/combatant/SohlCombatant";
import { SohlEncounterConfig } from "@src/common/region-behavior/SohlEncounter";
import { SohlRegionConfig } from "@src/common/region/SohlRegion";
import { CalendarSettingsMenu } from "@src/common/apps/CalendarSettingsMenu";
import {
    registerAssemblySidebar,
    registerAssemblyContextMenu,
} from "@src/common/apps/AssemblyDirectory";

/**
 * Register all built-in variants and allow modules to register their own.
 * Called during the init hook, before settings are registered.
 */
function registerVariants(): void {
    // Register built-in variants
    SohlSystem.registerVariant(
        LegendarySystem.ID,
        LegendarySystem.getInstance(),
    );

    // Allow modules to register additional variants.
    // Modules should listen for this hook and call SohlSystem.registerVariant().
    Hooks.callAll("sohl.registerVariants" as any);
}

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
    // Build variant choices dynamically from the registry
    const variantChoices: Record<string, string> = {};
    for (const [id, variant] of SohlSystem.variants) {
        variantChoices[id] = (variant.constructor as any).TITLE || id;
    }
    game.settings.register("sohl", "variant", {
        name: "SOHL.Settings.Variant.label",
        hint: "SOHL.Settings.Variant.hint",
        scope: "world",
        config: true,
        requiresReload: true,
        default: "",
        type: String,
        choices: variantChoices,
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
        requiresReload: true,
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
        icon: "fa-solid fa-calendar",
        type: CalendarSettingsMenu as any,
        restricted: true,
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
 * Register startup hooks
 */
/**
 * Find valid placement positions for multiple tokens near a drop point.
 *
 * Uses BFS outward from the drop cell, skipping cells that are occupied
 * by existing tokens, already claimed in this batch, or separated from
 * the drop point by a wall.
 *
 * @param dropX - Drop X coordinate (canvas pixels)
 * @param dropY - Drop Y coordinate (canvas pixels)
 * @param count - Number of positions needed
 * @param elevation - Elevation for all tokens
 * @returns Array of {x, y} positions in canvas coordinates
 */
export function findPlacementPositions(
    dropX: number,
    dropY: number,
    count: number,
    elevation: number,
): { x: number; y: number }[] {
    const grid = (canvas as any).grid;
    const gridSize = grid.size;

    // Snap drop point to grid center
    const snapped = grid.getSnappedPoint({ x: dropX, y: dropY });
    const startCol = Math.floor(snapped.x / gridSize);
    const startRow = Math.floor(snapped.y / gridSize);

    // Build set of occupied cells from existing scene tokens at same elevation
    const occupied = new Set<string>();
    for (const token of (canvas as any).scene.tokens) {
        if (token.elevation !== elevation) continue;
        const col = Math.floor(token.x / gridSize);
        const row = Math.floor(token.y / gridSize);
        occupied.add(`${col},${row}`);
    }

    const results: { x: number; y: number }[] = [];
    const visited = new Set<string>();
    const queue: [number, number][] = [[startCol, startRow]];
    visited.add(`${startCol},${startRow}`);

    // 4-directional neighbors (up, down, left, right)
    const dirs = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
    ];

    while (queue.length > 0 && results.length < count) {
        const [col, row] = queue.shift()!;
        const cellKey = `${col},${row}`;
        const cellX = col * gridSize;
        const cellY = row * gridSize;
        const cellCenterX = cellX + gridSize / 2;
        const cellCenterY = cellY + gridSize / 2;

        // Check if cell is occupied
        if (!occupied.has(cellKey)) {
            // Check wall collision between drop point and this cell
            const hasWall =
                (CONFIG as any).Canvas?.losBackend ?
                    (canvas as any).walls.checkCollision(
                        new Ray(
                            { x: snapped.x, y: snapped.y },
                            { x: cellCenterX, y: cellCenterY },
                        ),
                        { type: "move", mode: "any" },
                    )
                :   false;

            if (!hasWall) {
                results.push({ x: cellX, y: cellY });
                occupied.add(cellKey); // Claim this cell
            }
        }

        // Expand to neighbors
        for (const [dx, dy] of dirs) {
            const nc = col + dx;
            const nr = row + dy;
            const nk = `${nc},${nr}`;
            if (!visited.has(nk)) {
                visited.add(nk);
                // Stay within canvas bounds
                if (
                    nc >= 0 &&
                    nr >= 0 &&
                    nc * gridSize < (canvas as any).dimensions.width &&
                    nr * gridSize < (canvas as any).dimensions.height
                ) {
                    queue.push([nc, nr]);
                }
            }
        }
    }

    return results;
}

/**
 * Handle placing a Cohort actor on a scene, with a dialog asking
 * the user to choose group or individual token placement.
 *
 * Used both by the canvas drop hook and by encounter spawning.
 *
 * @param actor - The Cohort actor to place
 * @param data - Object with at least `x` and `y` drop coordinates
 */
export async function handleCohortDrop(actor: any, data: any): Promise<void> {
    const dropX = data.x ?? 0;
    const dropY = data.y ?? 0;

    const choice = await foundry.applications.api.DialogV2.wait({
        window: {
            title: game.i18n.localize("SOHL.Cohort.Drop.title"),
        },
        content: game.i18n.format("SOHL.Cohort.Drop.content", {
            name: actor.name,
        }),
        buttons: [
            {
                action: "group",
                label: game.i18n.localize("SOHL.Cohort.Drop.group"),
                icon: "fa-solid fa-users",
            },
            {
                action: "individual",
                label: game.i18n.localize("SOHL.Cohort.Drop.individual"),
                icon: "fa-solid fa-user",
            },
        ],
        close: () => null,
    } as any);

    if (!choice) return; // Dialog closed without choosing

    const scene = (canvas as any).scene;

    if (choice === "group") {
        // Create a single token for the Cohort actor
        const tokenData = (await (actor as any).getTokenDocument(
            { x: dropX, y: dropY },
            { parent: scene },
        )) as any;
        await tokenData.constructor.create(tokenData.toObject(), {
            parent: scene,
        });
    } else if (choice === "individual") {
        await spawnCohortMembers(actor, dropX, dropY, 0);
    }
}

/**
 * Create individual tokens for each member of a Cohort actor,
 * placed in a cluster around the given point.
 *
 * Used by both the Cohort drop dialog and the TokenHUD expand button.
 *
 * @param actor - The Cohort actor
 * @param dropX - Center X coordinate (canvas pixels)
 * @param dropY - Center Y coordinate (canvas pixels)
 * @param elevation - Elevation for all placed tokens
 */
export async function spawnCohortMembers(
    actor: any,
    dropX: number,
    dropY: number,
    elevation: number,
): Promise<void> {
    const scene = (canvas as any).scene;
    const members = actor.system?.members ?? [];
    if (members.length === 0) return;

    const positions = findPlacementPositions(
        dropX,
        dropY,
        members.length,
        elevation,
    );

    const tokenDocs: any[] = [];
    for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const pos = positions[i];
        if (!pos) break;

        const memberActor = game.actors?.find(
            (a: any) => a.system?.shortcode === member.shortcode,
        );
        if (!memberActor) {
            console.warn(
                game.i18n.format("SOHL.Cohort.Drop.memberNotFound", {
                    shortcode: member.shortcode,
                    name: member.name,
                }),
            );
            continue;
        }

        const tokenData = (await (memberActor as any).getTokenDocument(
            {
                x: pos.x,
                y: pos.y,
                elevation,
                name: member.name,
            },
            { parent: scene },
        )) as any;

        tokenDocs.push(tokenData.toObject());
    }

    if (tokenDocs.length > 0) {
        await (TokenDocument as any).createDocuments(tokenDocs, {
            parent: scene,
        });
    }
}

function registerSystemHooks() {
    // Process timed events when world time advances.
    // Only the primary GM processes to prevent duplicate execution.
    (Hooks as any).on(
        "updateWorldTime",
        async (worldTime: number, _delta: number) => {
            if (!(game as any).user?.isActiveGM) return;
            await sohl.events.processDueEvents(worldTime);
        },
    );

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
            handleCohortDrop(actor, data).catch((err: any) =>
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
        btn.innerHTML = '<i class="fa-solid fa-users" inert></i>';
        btn.addEventListener("click", async (ev: Event) => {
            ev.preventDefault();
            const token = hud.document;
            const x = token.x;
            const y = token.y;
            const elevation = token.elevation ?? 0;

            // Delete the group token first
            await token.delete();

            // Spawn individual members at that location
            await spawnCohortMembers(actor, x, y, elevation);
        });
        leftCol.appendChild(btn);
    });

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

/**
 * Show a blocking dialog for first-time variant selection.
 * The dialog cannot be dismissed without making a choice.
 * After selection, the setting is saved and the page is reloaded
 * so the system initializes cleanly with the chosen variant.
 *
 * The dropdown is built dynamically from all registered variants
 * via SohlSystem.variants.
 */
async function showVariantSelectionDialog(): Promise<void> {
    // Build dropdown options from registered variants
    const options = Array.from(SohlSystem.variants)
        .map(([id, variant]) => {
            const title = (variant.constructor as any).TITLE || id;
            return `<option value="${id}">${title}</option>`;
        })
        .join("\n");

    const content = `
        <div style="padding: 1em;">
            <h2 style="text-align: center; margin-bottom: 0.5em;">Welcome to Song of Heroic Lands</h2>
            <p style="margin-bottom: 1.5em;">
                Before you begin, please choose which rules variant to use for this world.
                This choice determines how combat, skills, and other game mechanics work.
                <strong>This cannot be easily changed later.</strong>
            </p>
            <div class="form-group">
                <label for="sohl-variant-select">Rules Variant</label>
                <select id="sohl-variant-select" style="width: 100%;">
                    ${options}
                </select>
            </div>
        </div>
    `;

    return new Promise<void>((resolve) => {
        const dialog = new Dialog(
            {
                title: "Song of Heroic Lands — Choose Rules Variant",
                content,
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Confirm",
                        callback: async (html: HTMLElement | JQuery) => {
                            const el =
                                html instanceof HTMLElement ? html : html[0];
                            const select = el.querySelector<HTMLSelectElement>(
                                "#sohl-variant-select",
                            );
                            const variant = select?.value;
                            if (variant) {
                                (dialog as any)._variantSelected = true;
                                await game.settings.set(
                                    "sohl",
                                    "variant",
                                    variant,
                                );
                                window.location.reload();
                            }
                            resolve();
                        },
                    },
                },
                close: () => {
                    // Prevent closing without a selection — reopen
                    if (!(dialog as any)._variantSelected) {
                        setTimeout(
                            () => showVariantSelectionDialog().then(resolve),
                            100,
                        );
                    }
                },
            },
            {
                width: 420,
                classes: ["sohl-variant-dialog"],
            },
        );
        dialog.render(true);
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

    // Register built-in variants and let modules add theirs
    registerVariants();

    // Register settings (variant choices are built from the registry)
    registerSystemSettings();

    // Check if a variant has been selected
    const variantId = game.settings.get("sohl", "variant") as string;

    if (!variantId) {
        // No variant selected — defer full initialization until the user picks one.
        // Register a minimal sohl global so nothing crashes if accessed.
        console.log("SoHL | No variant selected — awaiting user selection.");
        return;
    }

    // Variant is set — proceed with full initialization
    globalThis.sohl = setupVariant();

    rehydrateCalendars();
    applyActiveCalendar();
    sohl.log.setLogThreshold(
        (game as any).settings.get("sohl", "logLevel") || LOGLEVEL.INFO,
    );
    registerSystemHooks();

    CONFIG.Combat.initiative = { formula: "@initiativeRank", decimals: 2 };
    CONFIG.time.roundTime = 5;
    CONFIG.time.turnTime = 0;

    // Register the Assemblies sidebar tab and filter Assemblies from Actors sidebar
    registerAssemblySidebar();
    registerAssemblyContextMenu();

    // Register Region sheet
    foundry.applications.apps.DocumentSheetConfig.registerSheet(
        RegionDocument as any,
        "sohl",
        SohlRegionConfig as any,
        { makeDefault: true },
    );

    // Register RegionBehavior encounter sheet
    foundry.applications.apps.DocumentSheetConfig.registerSheet(
        RegionBehavior as any,
        "sohl",
        SohlEncounterConfig as any,
        { types: ["sohlencounter"], makeDefault: true },
    );
});

// Register ready hook
Hooks.once("ready", async () => {
    const variantId = game.settings.get("sohl", "variant") as string;

    if (!variantId) {
        // No variant selected — show blocking selection dialog
        await showVariantSelectionDialog();
        return;
    }

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
