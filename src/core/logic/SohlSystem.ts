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
import * as constants from "@src/utils/constants";
import { SohlLocalize } from "@src/core/foundry/SohlLocalize";
import { SohlLogger } from "@src/core/foundry/SohlLogger";
import {
    ActorKinds,
    ItemKinds,
    SOHL_DEFAULT_CALENDAR_CONFIG,
    type ActorKind,
    type ItemKind,
} from "@src/utils/constants";
import {
    COMMON_ACTOR_LOGIC,
    COMMON_ITEM_LOGIC,
    COMMON_ACTOR_SHEETS,
    COMMON_ITEM_SHEETS,
    SOHLCONFIG,
    type CalendarRegistration,
    type SohlConfig,
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

    /** The {@link constants} module (static access). */
    static readonly constants: typeof constants = constants;
    /**
     * The `sohl.entity` surface — the constructable entity-class registry (the
     * outside-SoHL surface for macros and variant modules to `new`, subclass, or
     * override via `sohl.entity.X` / `sohl.entity.register(...)`; each class is a
     * getter, so a `register()` override is picked up at every construction
     * site) merged with the entity sub-namespaces for addressing
     * (`sohl.entity.modifier.ValueModifier`, …). Bound at init in `sohl.ts`; the
     * type is declared via `typeof import(...)` so the binding stays cycle-free.
     */
    declare readonly entity: typeof import("@src/entity/surface").entitySurface;
    /**
     * The `document` namespace tree — `sohl.document.effect.foundry.SohlActiveEffect`,
     * etc. Bound to the barrel namespace at init (in `sohl.ts`); the type is
     * declared here without a runtime import so the binding stays cycle-free.
     */
    declare readonly document: typeof import("@src/document");
    /** The `core` namespace tree (`sohl.core.logic.SohlSystem`, …). Bound at init. */
    declare readonly core: typeof import("@src/core");
    /** The `apps` namespace tree (`sohl.apps.foundry.DomainManagerApp`, …). Bound at init. */
    declare readonly apps: typeof import("@src/apps");
    /**
     * The `utils` namespace (`sohl.utils`) — the Foundry-free utility superset:
     * the {@link sohl.utils.romanize}-style helpers and the constants (`ACTOR_KIND`, …)
     * re-exported at its top level, plus the nested `collection` sub-namespace
     * (`sohl.utils.collection.SohlMap`). Bound to the barrel namespace at init
     * (in `sohl.ts`); the type is declared here without a runtime import so the
     * binding stays cycle-free. The curated {@link constants} alias
     * (`sohl.constants`) is kept alongside it.
     */
    declare readonly utils: typeof import("@src/utils");
    /** Set true once the system has finished its `ready`-hook setup. */
    static ready: boolean = false;
    /** Localization helper (`sohl.i18n`). */
    readonly i18n: SohlLocalize;
    /** System logger (`sohl.log`). */
    readonly log: SohlLogger;
    /** In-memory trigger/event dispatcher (`sohl.events`). */
    readonly events: SohlEventQueue;

    /**
     * The SoHL system configuration (`sohl.CONFIG`) — the document, sheet,
     * DataModel, modifier, and result registries merged into Foundry's `CONFIG`
     * at init. See {@link SOHLCONFIG}.
     */
    get CONFIG(): SohlConfig {
        return SOHLCONFIG;
    }

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
     * Remove a calendar registration. A no-op if `id` is not registered.
     *
     * @param id - The identifier of the calendar to remove.
     * @throws Error if `id` names a **built-in** calendar — built-ins cannot be
     *   deleted, only imported calendars can.
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
     * @throws Error if no calendar is registered under `id` (the message lists
     *   the available ids).
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
     * The {@link sohl.document.combatant.logic.SohlCombatantLogic} of every combatant in the active combat — a
     * direct entry point into the combatant logic layer
     * (`sohl.currentCombatCombatantLogics`). Empty when no combat is active.
     *
     * @returns One {@link sohl.document.combatant.logic.SohlCombatantLogic} per combatant in `game.combat`.
     */
    get currentCombatCombatantLogics(): SohlCombatantLogic[] {
        return (
            getActiveCombat()?.combatants.map((c: any) => (c as any).logic) ??
            []
        );
    }

    /* -------------------------------------------- */
    /*  Logic-class registry                        */
    /* -------------------------------------------- */

    /**
     * The actor-kind → base Logic-class map (`sohl.actorLogicClasses`). Exposes
     * the SoHL base classes so a variant module can subclass one before
     * registering the override. Reads reflect any registered override.
     *
     * @example
     * class MyBeing extends sohl.actorLogicClasses.being {}
     */
    get actorLogicClasses(): Record<
        ActorKind,
        Constructor<SohlActorLogic<any>>
    > {
        return COMMON_ACTOR_LOGIC as Record<
            ActorKind,
            Constructor<SohlActorLogic<any>>
        >;
    }

    /**
     * The item-kind → base Logic-class map (`sohl.itemLogicClasses`). Exposes the
     * SoHL base classes for subclassing. Reads reflect any registered override.
     */
    get itemLogicClasses(): Record<ItemKind, Constructor<SohlItemLogic<any>>> {
        return COMMON_ITEM_LOGIC as Record<
            ItemKind,
            Constructor<SohlItemLogic<any>>
        >;
    }

    /**
     * Register an actor Logic class for a kind, overriding the SoHL default.
     *
     * Call from a module's `init`/`setup` hook — before the first `.logic` for
     * that kind is constructed. No construction-site changes are needed: the
     * resolution path (`SohlDataModel.create`) reads this map, so every document
     * of that kind built afterward uses the registered class.
     *
     * @param kind - The actor kind whose Logic class to override.
     * @param cls - The replacement Logic class (a {@link SohlActorLogic} subclass).
     */
    registerActorLogic(
        kind: ActorKind,
        cls: Constructor<SohlActorLogic<any>>,
    ): void {
        (
            COMMON_ACTOR_LOGIC as Record<
                ActorKind,
                Constructor<SohlActorLogic<any>>
            >
        )[kind] = cls;
    }

    /**
     * Register an item Logic class for a kind, overriding the SoHL default. See
     * {@link registerActorLogic} for the calling contract.
     *
     * @param kind - The item kind whose Logic class to override.
     * @param cls - The replacement Logic class (a {@link SohlItemLogic} subclass).
     */
    registerItemLogic(
        kind: ItemKind,
        cls: Constructor<SohlItemLogic<any>>,
    ): void {
        (
            COMMON_ITEM_LOGIC as Record<
                ItemKind,
                Constructor<SohlItemLogic<any>>
            >
        )[kind] = cls;
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
