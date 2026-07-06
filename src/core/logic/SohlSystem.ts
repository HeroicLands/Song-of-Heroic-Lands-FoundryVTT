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

import { SohlMap } from "@src/utils/collection/SohlMap";
import { SohlCalendarData } from "@src/core/foundry/SohlCalendar";
import { SohlEventQueue } from "@src/entity/event/SohlEventQueue";
import * as utils from "@src/utils/helpers";
import * as constants from "@src/utils/constants";
import { SohlLocalize } from "@src/utils/SohlLocalize";
import { SohlLogger } from "@src/utils/SohlLogger";
import {
    ActorKinds,
    ItemKinds,
    SOHL_DEFAULT_CALENDAR_CONFIG,
} from "@src/utils/constants";
import {
    COMMON_ACTOR_SHEETS,
    COMMON_ITEM_SHEETS,
    SOHLCONFIG,
    type CalendarRegistration,
} from "@src/core/foundry/sohl-config";
import { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { SohlItemLogic } from "@src/document/item/logic/SohlItemBaseLogic";
import { SohlCombatantLogic } from "@src/document/combatant/logic/SohlCombatantLogic";
import { getActiveCombat } from "@src/core/FoundryHelpers";

/**
 * The central runtime object for Song of Heroic Lands — and what the global
 * **`sohl`** variable points at.
 *
 * A single `SohlSystem` instance is created during Foundry's **`init`** hook
 * (via {@link getInstance}) and installed as `globalThis.sohl`, so it is
 * reachable from `init` onward — before `ready` ({@link SohlSystem.ready} flips
 * to `true` once `ready`-hook setup finishes). Macros, modules, and Script
 * Actions reach SoHL's system-wide services through it. This is the canonical
 * reference for that **`sohl` surface**; the members below are the full list.
 *
 * For working with one *specific* actor or item, prefer that document's `.logic`
 * (the "document surface") over walking these collections — see the **The SoHL
 * API** how-to guide for the two-surface model. What `sohl` offers, by category:
 *
 * - **Services** — {@link i18n} (localization), {@link log} (logging),
 *   {@link events} (the trigger/event queue).
 * - **Helpers & constants** — {@link utils} (e.g. `sohl.utils.romanize()`) and
 *   {@link constants} (`ACTOR_KIND`, `ITEM_KIND`, …).
 * - **Direct entries into the logic layer** — {@link actorLogics},
 *   {@link itemLogics}, {@link currentCombatCombatantLogics}.
 * - **Config & calendar** — {@link SOHLCONFIG} (the document/sheet/DataModel,
 *   modifier, and result classes merged into Foundry's `CONFIG` at init) and the
 *   active {@link calendar}.
 */
export class SohlSystem {
    private static instance: SohlSystem | null = null;

    /**
     * Return the singleton instance, creating it on first call.
     *
     * @returns The shared {@link SohlSystem} instance.
     */
    static getInstance(): SohlSystem {
        if (!this.instance) {
            this.instance = new SohlSystem();
        }
        return this.instance;
    }

    protected static _calendars: SohlMap<string, CalendarRegistration> =
        new SohlMap<string, CalendarRegistration>();

    /** The {@link utils} helper module (static access). */
    static readonly utils: typeof utils = utils;
    /** The {@link constants} module (static access). */
    static readonly constants: typeof constants = constants;
    /** Set true once the system has finished its `ready`-hook setup. */
    static ready: boolean = false;
    /** Localization helper (`sohl.i18n`). */
    readonly i18n: SohlLocalize;
    /** System logger (`sohl.log`). */
    readonly log: SohlLogger;
    /** In-memory trigger/event dispatcher (`sohl.events`). */
    readonly events: SohlEventQueue;

    /* -------------------------------------------- */
    /*  Calendar Registry                           */
    /* -------------------------------------------- */

    /**
     * Register a calendar configuration. Overwrites any existing registration
     * with the same ID.
     *
     * @param id - The unique identifier for the calendar.
     * @param registration - The calendar registration to store.
     */
    static registerCalendar(
        id: string,
        registration: CalendarRegistration,
    ): void {
        this._calendars.set(id, registration);
    }

    /**
     * Remove a calendar registration. Throws if the calendar is builtin.
     *
     * @param id - The identifier of the calendar to remove.
     */
    static unregisterCalendar(id: string): void {
        const cal = this._calendars.get(id);
        if (!cal) return;
        if (cal.builtin) {
            throw new Error(`Cannot delete built-in calendar "${id}".`);
        }
        this._calendars.delete(id);
    }

    /**
     * Get a registered calendar by ID.
     *
     * @param id - The identifier of the calendar to retrieve.
     * @returns The matching calendar registration, or `undefined` if none.
     */
    static getCalendar(id: string): CalendarRegistration | undefined {
        return this._calendars.get(id);
    }

    /**
     * All registered calendars.
     */
    static get calendars(): SohlMap<string, CalendarRegistration> {
        return this._calendars;
    }

    /**
     * Apply a registered calendar to SOHLCONFIG.time, and re-initialize
     * game.time so the change takes effect without a reload. Safe to call
     * during the `init` hook before game.time exists.
     *
     * @param id - The identifier of the registered calendar to apply.
     */
    static applyCalendar(id: string): void {
        const cal = this._calendars.get(id);
        if (!cal) {
            throw new Error(
                `Calendar "${id}" is not registered. Available: ${Array.from(
                    this._calendars.keys(),
                ).join(", ")}`,
            );
        }
        SOHLCONFIG.time.worldCalendarConfig = cal.config as any;
        SOHLCONFIG.time.worldCalendarClass = (cal.calendarClass ??
            SohlCalendarData) as any;
        (game as any)?.time?.initializeCalendar?.();
    }

    /** The {@link utils} helper module (`sohl.utils`). */
    get utils(): typeof utils {
        return (this.constructor as any).utils;
    }

    /** The {@link constants} module (`sohl.constants`). */
    get constants(): typeof constants {
        return (this.constructor as any).constants;
    }

    /**
     * The logic instance of every world actor — a direct entry point into the
     * actor logic layer (`sohl.actorLogics`), instead of going through
     * `game.actors` and reading each `.logic`.
     *
     * @returns One {@link SohlActorLogic} per world actor.
     */
    get actorLogics(): SohlActorLogic<any>[] {
        return game.actors.map((actor) => (actor as any).logic);
    }

    /**
     * The logic instance of every world (non-embedded) item — a direct entry
     * point into the item logic layer (`sohl.itemLogics`), instead of going
     * through `game.items` and reading each `.logic`.
     *
     * @returns One {@link SohlItemLogic} per world item.
     */
    get itemLogics(): SohlItemLogic<any>[] {
        return game.items.map((item) => (item as any).logic);
    }

    /**
     * The {@link SohlCombatantLogic} of every combatant in the active combat — a
     * direct entry point into the combatant logic layer
     * (`sohl.currentCombatCombatantLogics`). Empty when no combat is active.
     *
     * @returns One {@link SohlCombatantLogic} per combatant in `game.combat`.
     */
    get currentCombatCombatantLogics(): SohlCombatantLogic[] {
        return (
            getActiveCombat()?.combatants.map((c: any) => (c as any).logic) ??
            []
        );
    }

    /**
     * Constructs the system singleton, wiring up the localization, logging,
     * and event-queue services. Use {@link getInstance} rather than calling
     * this directly.
     */
    protected constructor() {
        this.i18n = SohlLocalize.getInstance();
        this.log = SohlLogger.getInstance();
        this.events = new SohlEventQueue();
    }

    /**
     * The currently active world calendar. May be a SohlCalendarData or any
     * CalendarData subclass installed by another module — code that consumes
     * this must use only the base CalendarData API.
     */
    get calendar(): foundry.data.CalendarData<foundry.data.CalendarData.TimeComponents> {
        return game.time.calendar;
    }

    /**
     * Register every actor, item, active-effect, and scene sheet with Foundry
     * and make them the default for their document types. Called once during
     * system initialization.
     */
    setupSheets(): void {
        ActorKinds.forEach((kind) => {
            foundry.applications.apps.DocumentSheetConfig.registerSheet(
                SOHLCONFIG.Actor.documentClass,
                "sohl",
                COMMON_ACTOR_SHEETS[kind] as any,
                {
                    types: [kind],
                    makeDefault: true,
                },
            );
        });
        ItemKinds.forEach((kind) => {
            foundry.applications.apps.DocumentSheetConfig.registerSheet(
                SOHLCONFIG.Item.documentClass,
                "sohl",
                COMMON_ITEM_SHEETS[kind] as any,
                {
                    types: [kind],
                    makeDefault: true,
                },
            );
        });
        foundry.applications.apps.DocumentSheetConfig.registerSheet(
            SOHLCONFIG.ActiveEffect.documentClass,
            "sohl",
            SOHLCONFIG.ActiveEffect.documentSheets[0].cls,
            {
                makeDefault: true,
            },
        );
        foundry.applications.apps.DocumentSheetConfig.registerSheet(
            SOHLCONFIG.Scene.documentClass,
            "sohl",
            SOHLCONFIG.Scene.documentSheets[0].cls,
            {
                makeDefault: true,
            },
        );
    }
}

// Register the default calendar
SohlSystem.registerCalendar("sohl-default", {
    label: "SOHL.CalendarSettings.default",
    config: SOHL_DEFAULT_CALENDAR_CONFIG,
    calendarClass: SohlCalendarData,
    builtin: true,
});
