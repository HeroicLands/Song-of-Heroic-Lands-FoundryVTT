/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
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
import type { Rng } from "@src/entity/random/Rng";
import { createRng } from "@src/entity/random/createRng";
import * as constants from "@src/utils/constants";
import { SohlLocalize } from "@src/core/foundry/SohlLocalize";
import { SohlLogger } from "@src/core/foundry/SohlLogger";
import {
    ActorKinds,
    ItemKinds,
    ACTOR_KIND,
    WORLD_HOST_SHORTCODE,
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
import {
    getActiveCombat,
    fvttWorldTime,
    fvttActorByShortcode,
    fvttCreateWorldActor,
    fvttIsCurrentUserGM,
} from "@src/core/FoundryHelpers";
import {
    scheduleAction,
    unscheduleAction,
    type Schedulable,
} from "@src/entity/event/scheduled-actions";
import {
    attachScriptAction,
    type ActionAttachable,
    type ScriptActionSpec,
} from "@src/entity/action/script-action-attach";
import type { SohlAction } from "@src/entity/action/SohlAction";

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
     * The process-wide pseudo-random generator (`sohl.random`) — the shared,
     * ambient {@link sohl.entity.random.Rng} stream backing
     * {@link sohl.entity.roll.SimpleRoll}, hit-location selection, and the
     * `rand()` expression helper when no generator is injected. Seeded from
     * entropy at construction; present from that point on (its own readiness
     * signal). It is one shared stream — safe for atomic synchronous draws but
     * not isolated; a flow needing isolation injects its own {@link createRng}
     * instance. e2e re-seeds it through the window for reproducibility
     * (`win.sohl.random.seed(...)`).
     *
     * **Never seed this with a fixed value in a play path** — predictable dice
     * ruin play, and a shared deterministic stream desyncs across clients
     * anyway. Fixed seeds are strictly a test/e2e affordance.
     */
    readonly random: Rng;

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
        this.random = createRng();
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

    /**
     * Schedule a recurring **action** on a document (issue #588) — `sohl.schedule`.
     * Persists the schedule to the document's `system.scheduledActions` (the
     * durable record, anchored at the current world time) **and** arms the event
     * queue (the live entry), so when it comes due the queue offers it as a
     * `[Perform]` reminder. Re-call it (e.g. from the action after it performs) to
     * reschedule the next occurrence.
     *
     * Works on any document whose data model extends the base `SohlDataModel`
     * and so carries a `system.scheduledActions` field — an **actor** (including
     * the `_sohlworld` host) or an **item** (a wound, an affliction). Scenes and
     * active effects extend `TypeDataModel` directly and cannot host a schedule.
     * Must run as an owner of `doc` (a document write). Both halves derive the
     * fire time from the same anchor + interval, so they cannot drift.
     *
     * A schedule may be **scene-bound** (issue #590): pass `sceneUuid` and the
     * `[Perform]` reminder is offered only while that scene is the active scene —
     * a bandit check at a hideout does not fire while the party is elsewhere, and
     * a check that came due while away surfaces when they return. Omit `sceneUuid`
     * (or pass `undefined`) for a **world-wide** schedule that fires regardless of
     * the active scene.
     *
     * @param doc - The document to schedule on (its logic hosts `actionName`).
     * @param actionName - The action shortcode to run when due.
     * @param interval - Seconds until the next fire.
     * @param payload - Opaque scope handed to the action on `[Perform]`.
     * @param sceneUuid - The scene the schedule is bound to, or `undefined` for a
     *   world-wide schedule.
     * @param triggerName - The lifecycle trigger to bind to (issue #622). Omitted
     *   or `"updateWorldTime"` ⇒ a time-based schedule fired at `now + interval`
     *   (the default); any other value (`"turnEnd"`, `"combatStart"`, …) ⇒ an
     *   event-driven schedule (`interval` is then unused).
     * @param predicate - Optional {@link sohl.entity.expr.SafeExpression} source
     *   gating an event-driven schedule (issue #569; `subscriberUuid` is bound to
     *   `doc`). Ignored for a time schedule.
     * @returns A promise that resolves once the schedule is persisted and armed.
     */
    schedule(
        doc: Schedulable,
        actionName: string,
        interval: number,
        payload?: Record<string, unknown>,
        sceneUuid?: string,
        triggerName?: string,
        predicate?: string,
    ): Promise<void> {
        return scheduleAction(
            doc,
            this.events,
            actionName,
            interval,
            payload,
            fvttWorldTime(),
            sceneUuid,
            triggerName,
            predicate,
        );
    }

    /**
     * Remove a recurring schedule for `actionName` on `doc` — `sohl.unschedule`.
     * Clears the persisted `system.scheduledActions` entry and unsubscribes it
     * from the event queue.
     *
     * @param doc - The document to unschedule on.
     * @param actionName - The schedule to remove.
     * @returns A promise that resolves once the schedule is removed.
     */
    unschedule(doc: Schedulable, actionName: string): Promise<void> {
        return unscheduleAction(doc, this.events, actionName);
    }

    /**
     * Find (or, for a GM, create) the singleton **world host** actor —
     * `sohl.worldHost()`. It is the document world-scoped scheduled actions and
     * events hang off of (issue #588): an Actor, so it already has the execution
     * surface (`onChatCardButton` + an `actions` collection) that a scheduled
     * action's `[Perform]` needs.
     *
     * Identified by the reserved shortcode {@link WORLD_HOST_SHORTCODE}. Created
     * with ownership default NONE, so only the GM ever sees it. If it has been
     * deleted, a GM call recreates it (its stored schedule is lost and must be
     * re-registered). A non-GM who cannot see it gets `undefined`.
     *
     * @returns The world-host actor, or `undefined` (non-GM, not visible).
     */
    async worldHost(): Promise<any> {
        const existing = fvttActorByShortcode(WORLD_HOST_SHORTCODE);
        if (existing) return existing;
        if (!fvttIsCurrentUserGM()) return undefined;
        return fvttCreateWorldActor({
            name: "World",
            type: ACTOR_KIND.BEING,
            system: { shortcode: WORLD_HOST_SHORTCODE },
            ownership: { default: 0 },
        });
    }

    /**
     * Attach a Foundry Macro to `doc` as a SCRIPT action —
     * `sohl.addScriptAction`. The clean programmatic sibling of the sheet's
     * "create action" control and of `sohl.schedule` / `sohl.worldHost`
     * (issue #588, deliverable §7): a module or macro hands a minimal spec
     * (`{ name, executor }` plus optional overrides) and gets a persisted,
     * runnable action back — without knowing the full `actionDefs` shape.
     *
     * `spec.name` becomes both the action's `shortcode` (what
     * {@link schedule} and the `[Perform]` reminder address) and its default
     * `title`; `spec.executor` is a Foundry Macro **UUID** (a reference, never
     * inline code). Re-attaching the same `name` replaces the entry rather than
     * duplicating it, so an init hook can run on every reload safely.
     *
     * Works on any document that carries `system.actionDefs` — an **actor**
     * (including the `_sohlworld` host) or an **item**. Because SCRIPT entries
     * are GM-authored, this is a no-op returning `undefined` for a non-GM (the
     * same gate `SohlActor`/`SohlItem._preUpdate` enforce at the persist
     * boundary); the caller must also be an owner of `doc` (a document write).
     *
     * @param doc - The document to attach the action to.
     * @param spec - The Script Action spec (`name` + `executor` required).
     * @returns The persisted action def, or `undefined` when the current user is
     *   not a GM.
     * @throws If `spec.name` or `spec.executor` is blank.
     */
    async addScriptAction(
        doc: ActionAttachable,
        spec: ScriptActionSpec,
    ): Promise<SohlAction.Data | undefined> {
        if (!fvttIsCurrentUserGM()) return undefined;
        return attachScriptAction(doc, spec);
    }
}

// Register the default calendar
SohlSystem.registerCalendar("sohl-default", {
    label: "SOHL.CalendarSettings.default",
    config: SOHL_DEFAULT_CALENDAR_CONFIG,
    calendarClass: SohlCalendarData,
    builtin: true,
});
