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

import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlActiveEffect } from "@src/document/effect/foundry/SohlActiveEffect";
import type { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import type { SohlLogic, SohlLogicData } from "@src/core/logic/SohlLogic";
import type { SohlAction } from "@src/entity/action/SohlAction";
import type { ScheduledAction } from "@src/entity/event/scheduled-actions";
import { dialog, fvttResolveUuid } from "@src/core/FoundryHelpers";
import {
    ActionSubType,
    ActionSubTypes,
    ACTOR_KIND,
    ActorKinds,
    KIND_KEY,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    SohlActionScopes,
    SohlContextMenuSortGroups,
} from "@src/utils/constants";
import {
    defaultFromJSON,
    FilePath,
    HTMLString,
    toFilePath,
    toHTMLString,
} from "@src/utils/helpers";
import { SohlContextMenu } from "@src/apps/foundry/SohlContextMenu";
import {
    COMMON_ACTOR_LOGIC,
    COMMON_ITEM_LOGIC,
    COMBATANT_LOGIC,
} from "@src/core/foundry/sohl-config";
import { URLField } from "./URLField";
const { HandlebarsApplicationMixin } = foundry.applications.api;
const {
    StringField,
    SchemaField,
    NumberField,
    ArrayField,
    ObjectField,
    JavaScriptField,
} = foundry.data.fields;

/**
 * Builds the Foundry data schema shared by every SoHL data model (shortcode,
 * documentation URL, and the array of action definitions). Concrete document
 * schemas (`defineSohlItemDataSchema`, `defineSohlActorDataSchema`, the
 * combatant schema) spread this so every SoHL data model carries these fields.
 * @returns The shared SoHL data schema.
 */
export function defineSohlDataSchema(): foundry.data.fields.DataSchema {
    return {
        // Shortcode is present on every SoHL data model, but only items and
        // actors treat `(type, shortcode)` as a required, unique key — their
        // schemas override this field to `required, blank: false` and enforce
        // uniqueness in `_preCreate`. Other documents (combatant, …) keep it
        // optional, so the base leaves it blank-defaulted.
        shortcode: new StringField({ initial: "" }),
        docUrl: new URLField(),
        actionDefs: new ArrayField(
            new SchemaField({
                // Unique code identifying this action on its Logic instance —
                // the key `logic.actions` is built under. Without it a stored
                // (e.g. Script) action persists with no shortcode and can never
                // be looked up via `actions.get(...)`. See SohlAction.Data.
                shortcode: new StringField({ initial: "" }),
                subType: new StringField({
                    choices: ActionSubTypes,
                    required: true,
                }),
                title: new StringField({ initial: "" }),
                scope: new StringField({
                    choices: SohlActionScopes,
                    required: true,
                    initial: SOHL_ACTION_SCOPE.SELF,
                }),
                // A reference, never code: an intrinsic method name or a
                // Foundry Macro UUID (see SohlAction). Not a JavaScriptField —
                // no executable source is stored on a document.
                executor: new StringField({ initial: "" }),
                trigger: new JavaScriptField({ initial: "true" }),
                visible: new JavaScriptField({ initial: "true" }),
                iconFAClass: new StringField({
                    initial: "fa-solid fa-circle-question",
                }),
                group: new StringField({
                    choices: SohlContextMenuSortGroups,
                    initial: SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT,
                }),
                /**
                 * Minimum Foundry document-ownership level the current
                 * user must hold on the action's parent actor to execute
                 * it. Matches `CONST.DOCUMENT_OWNERSHIP_LEVELS`:
                 * 0 = NONE, 1 = LIMITED, 2 = OBSERVER, 3 = OWNER. GMs
                 * always pass via Foundry's `testUserPermission`.
                 */
                minActorOwnership: new NumberField({
                    min: 0,
                    max: 3,
                    initial: 3,
                }),
            }),
            { initial: [] },
        ),
        // Generic recurring schedule (issue #588). Each entry defers an action
        // (`actionName`, run on this document's logic) to `anchor + interval`;
        // the event queue offers it as a [Perform] reminder when due, and
        // `sohl.schedule` / the scope-matched re-arm hook keep it in sync with
        // the queue. Any SoHL document can carry a schedule — a wound, a scene,
        // or a `_sohlworld` actor — with no bespoke fields. Logical identity is
        // `actionName`; write the whole array back (never by index).
        scheduledActions: new ArrayField(
            new SchemaField({
                /** The action shortcode to run on this document's logic. */
                actionName: new StringField({ required: true, blank: false }),
                /** World time (seconds) the schedule was last set from. */
                anchor: new NumberField({ required: true, initial: 0 }),
                /** Seconds from `anchor` to the next fire. */
                interval: new NumberField({ required: true, initial: 0 }),
                /**
                 * The lifecycle trigger this schedule listens to (issue #622).
                 * Blank (the default) or `"updateWorldTime"` means a time-based
                 * schedule that fires at `anchor + interval`; any other value
                 * (`"turnEnd"`, `"combatStart"`, a scene-region trigger, …) makes
                 * it event-driven — armed as a live subscription on that trigger,
                 * with `interval` unused. Backwards compatible: an entry written
                 * before #622 has no trigger and stays time-based.
                 */
                triggerName: new StringField({
                    required: false,
                    blank: true,
                    initial: "",
                }),
                /**
                 * The uuid of the scene this schedule is bound to (issue #590).
                 * When set, it is offered only while that scene is active; blank
                 * (the default) means world-wide (fires regardless of scene).
                 */
                sceneUuid: new StringField({
                    required: false,
                    blank: true,
                    initial: "",
                }),
                /** Opaque data handed to the action as its scope on `[Perform]`. */
                payload: new ObjectField({ initial: {} }),
            }),
            { initial: [] },
        ),
        // Generic run record (issue #579): a map of `actionName` → the world
        // time (seconds) that action last *performed* on this document. Stamped
        // at the action chokepoint (`SohlAction.execute`) for actions flagged
        // `recordsLastRun`, so "when did X last happen here?" is answerable for
        // ANY action without a bespoke field — and, unlike a schedule, the record
        // survives after the schedule ends. It is the past-tense mirror of
        // `scheduledActions` (which is the future): for event-driven triggers
        // whose next fire is undeterminable, this is the only meaningful temporal
        // fact. Keyed, sparse, integer values.
        lastRun: new ObjectField({ initial: {} }),
    };
}

/** @internal */
export abstract class SohlDataModel<
    TSchema extends foundry.data.fields.DataSchema,
    TDocument extends SohlDocument,
    TLogic extends SohlLogic<any> = SohlLogic<any>,
>
    extends foundry.abstract.TypeDataModel<TSchema, TDocument>
    implements SohlLogicData<TDocument>
{
    declare parent: TDocument;

    /**
     * The localization prefixes used to look up the translation keys for this
     * data model. This is used to localize the data model's fields and
     * properties.
     *
     * This is actually defined in the superclass (TypeDataModel), but TypeScript
     * doesn't recognize that, so we have to define it here as well.
     * @see `foundry.abstract.TypeDataModel.LOCALIZATION_PREFIXES`
     */
    static override readonly LOCALIZATION_PREFIXES: string[];
    static readonly kind: string = "" as const;
    protected _logic!: TLogic;
    shortcode!: string;
    actionDefs!: SohlAction.Data[];
    scheduledActions!: ScheduledAction[];
    lastRun!: Record<string, number>;

    /**
     * Construct the data model, forwarding the source data and options to the
     * Foundry `TypeDataModel` base.
     * @param data - The source data for the data model.
     * @param options - Foundry data model construction options.
     */
    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        super(data as any, options as any);
    }

    /**
     * Construct the Logic instance for this data model's {@link kind}, looking
     * up the registered logic constructor in the common actor/item registries.
     * @param data - The source data for the Logic.
     * @param options - Logic construction options (e.g. `parent`).
     * @returns The newly created Logic instance.
     * @throws If no logic constructor is registered for the kind.
     */
    static create<L extends SohlLogic<any>>(
        data: PlainObject,
        options: PlainObject,
    ): L {
        const kind: string = this.kind;
        let logicCtor: Constructor<SohlLogic<any>> | undefined =
            COMMON_ACTOR_LOGIC[kind];
        logicCtor ??= COMMON_ITEM_LOGIC[kind];
        //logicCtor ??= EFFECT_LOGIC[kind];
        logicCtor ??= COMBATANT_LOGIC[kind];
        if (!logicCtor) {
            throw new Error(`No logic constructor found for kind "${kind}"`);
        }
        return new logicCtor(data, options) as L;
    }

    /** The Logic instance for this data model, created lazily on first access. */
    get logic(): TLogic {
        if (!this._logic) {
            this._logic = (this.constructor as any).create(
                {},
                { parent: this },
            );
        }
        return this._logic;
    }

    /**
     * This data model's kind identifier, read from its constructor's static
     * `kind`.
     * @throws Error if the concrete data-model class defines no static `kind`.
     */
    get kind(): string {
        const kind: string = (this.constructor as any).kind;
        if (!kind) {
            throw new Error("kind must be defined");
        }
        return kind;
    }

    // --- SohlLogicData Foundry-document port ---------------------------------
    // The logic layer reaches the document through these members instead of the
    // Foundry document directly, keeping it Foundry-free and testable.

    /** The owning document's id. */
    get id(): string {
        return (this.parent as any)?.id ?? "";
    }

    /** The owning document's name. */
    get name(): string {
        return (this.parent as any)?.name ?? "";
    }

    /** The owning document's type (its actor or item kind). */
    get type(): string {
        return (this.parent as any)?.type ?? this.kind;
    }

    /** The owning document's globally-unique id (opaque identity token). */
    get uuid(): string {
        return (this.parent as any)?.uuid ?? "";
    }

    /** Whether the current user owns the document (edit permission). */
    get isOwner(): boolean {
        return (this.parent as any)?.isOwner ?? false;
    }

    /**
     * The owning actor's logic: this document's own logic when it is an actor,
     * the owning actor's logic when it is an item/effect, or `null`.
     */
    get actorLogic(): SohlActorLogic<any> | null {
        const doc = this.parent as any;
        if (!doc) return null;
        const actorDoc = ActorKinds.includes(doc.type) ? doc : doc.actor;
        return (actorDoc?.logic as SohlActorLogic<any>) ?? null;
    }

    /**
     * Read a namespaced flag from the owning document.
     * @param scope - The flag scope (module/system id, e.g. `"sohl"`).
     * @param key - The flag key within the scope.
     * @returns The stored flag value, or `undefined` if unset.
     */
    getFlag(scope: string, key: string): unknown {
        return (this.parent as any)?.getFlag(scope, key);
    }

    /**
     * Write a namespaced flag on the owning document.
     * @param scope - The flag scope (module/system id, e.g. `"sohl"`).
     * @param key - The flag key within the scope.
     * @param value - The value to store.
     * @returns Resolves once the flag is persisted.
     */
    setFlag(scope: string, key: string, value: unknown): Promise<unknown> {
        return (this.parent as any)?.setFlag(scope, key, value);
    }

    /**
     * Persist a partial update to the owning document (self-mutation only).
     * @param data - The partial update payload (Foundry update syntax).
     * @returns Resolves once the update completes.
     */
    update(data: object): Promise<unknown> {
        return (this.parent as any)?.update(data);
    }

    /**
     * Reconstruct a data model instance from serialized data, resolving the
     * concrete data model class from the data's {@link KIND_KEY} and restoring
     * any JSON-normalized field values.
     * @param data - The serialized data (object or JSON string) including a kind key.
     * @param options - Data model construction options.
     * @returns The reconstructed data model instance.
     * @throws If the data has no kind key or no data model is registered for it.
     */
    static fromData<TDataModel extends Constructor<SohlDataModel<any, any>>>(
        data: any,
        options: PlainObject = {},
    ): InstanceType<TDataModel> {
        const kind = data[KIND_KEY];

        if (!kind) {
            throw new Error(
                `Data does not contain a "${KIND_KEY}" key: ${JSON.stringify(
                    data,
                )}`,
            );
        }
        let dataModel: Constructor<SohlDataModel<any, any>> | undefined;
        for (const docType of ["Item", "Actor", "ActiveEffect"] as const) {
            dataModel = sohl.CONFIG[docType].dataModels[kind] as Constructor<
                SohlDataModel<any, any>
            >;
            if (dataModel) break;
        }
        if (!dataModel) {
            throw new Error(
                `No data model found for kind "${kind}" in sohl.CONFIG`,
            );
        }

        if (typeof data === "string") {
            data = JSON.parse(data);
        }

        // Convert the data (which may be in JSON normalized form)
        // back to the original form, dropping the kind key.
        const newData: PlainObject = {};
        for (const [key, value] of Object.entries(data)) {
            if (key === KIND_KEY) continue;
            newData[key] = defaultFromJSON(value);
        }

        return new dataModel(newData, options) as InstanceType<TDataModel>;
    }
}

/** @internal */
export namespace SohlDataModel {
    export type Any = SohlDataModel<any, any>;

    export namespace DataModel {
        export interface Statics {
            readonly LOCALIZATION_PREFIXES: string[];
            readonly kind: string;
            create<L extends SohlLogic<any>>(
                data: PlainObject,
                options: PlainObject,
            ): L;
        }

        export const Shape: WithStatics<
            AnyConstructor<SohlDataModel<any, any>>,
            Statics
        > = SohlDataModel;
    }

    /**
     * Mixin that adds SoHL's shared sheet behavior (drag-and-drop, context
     * menus, effect handling, and array/object field editors) on top of a
     * Handlebars document sheet base class.
     * @param Base - The document sheet base class to extend.
     * @returns A subclass of `Base` with the shared SoHL sheet behavior.
     */
    export function SheetMixin<
        TDocument extends SohlDocument,
        TBase extends foundry.applications.api.DocumentSheetV2.AnyConstructor,
    >(Base: TBase): TBase {
        return class SMix extends HandlebarsApplicationMixin(Base) {
            /** @inheritDoc */
            static override DEFAULT_OPTIONS: PlainObject = {
                classes: ["sohl"],
                // Persist field edits: DocumentSheetV2 submits (updating the
                // document via its default form handler) whenever a form field
                // changes. Without this, typing in a sheet field never saves.
                form: {
                    submitOnChange: true,
                },
                // Active-effect authoring, shared by every SoHL sheet. Objects
                // deep-merge into each concrete sheet's own `actions`, so item
                // and actor sheets inherit these without re-declaring them.
                // Declared as thunks that resolve the static handler at call
                // time, so they do not depend on static-field vs. static-method
                // evaluation order within the class.
                actions: {
                    effectCreate(this: any): unknown {
                        return SMix._onEffectCreate.call(this);
                    },
                    effectToggle(
                        this: any,
                        event: PointerEvent,
                        target: HTMLElement,
                    ): unknown {
                        return SMix._onEffectToggle.call(this, event, target);
                    },
                    effectDelete(
                        this: any,
                        event: PointerEvent,
                        target: HTMLElement,
                    ): unknown {
                        return SMix._onEffectDelete.call(this, event, target);
                    },
                },
            };
            protected _dragDrop: DragDrop[];

            /**
             * Construct the sheet and wire up its drag-and-drop handlers.
             * @param document - The document this sheet renders.
             * @param options - Application render/configuration options.
             */
            constructor(document: TDocument, options: PlainObject = {}) {
                // The HandlebarsApplicationMixin constructor typing is incompatible with
                // our generic signature; suppress the type-check here and forward args.
                // @ts-expect-error - Base class constructor signature mismatch
                super(document, options);
                this._dragDrop = this._createDragDropHandlers();
            }

            /** The document this sheet renders, narrowed to its concrete type. */
            override get document(): TDocument {
                return super.document as TDocument;
            }

            /** @inheritDoc */
            protected override _configureRenderOptions(
                options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
            ): void {
                super._configureRenderOptions(options);
            }

            /**
             * Build the drag-and-drop handlers from the sheet's `dragDrop`
             * options, binding their permission and callback hooks to this sheet.
             * @returns The configured drag-and-drop handlers.
             */
            protected _createDragDropHandlers(): DragDrop[] {
                return (
                    (this.options as any).dragDrop?.map((d: PlainObject) => {
                        d.permissions = {
                            dragStart: this._canDragStart.bind(this),
                            drop: this._canDragDrop.bind(this),
                        };
                        d.callbacks = {
                            dragstart: this._onDragStart.bind(this),
                            dragover: this._onDragOver.bind(this),
                            drop: this._onDrop.bind(this),
                        };
                        return new foundry.applications.ux.DragDrop(
                            d,
                        ) as DragDrop;
                    }) ?? []
                );
            }

            /**
             * Define whether a user is able to begin a dragstart workflow for a given drag selector
             * @param selector - The candidate HTML selector for dragging
             * @returns Can the current user drag this selector?
             */
            protected _canDragStart(selector: string): boolean {
                return this.isEditable;
            }

            /**
             * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
             * @param selector - The candidate HTML selector for the drop target
             * @returns  Can the current user drop on this selector?
             */
            protected _canDragDrop(selector: string): boolean {
                return this.isEditable;
            }

            /** The actor this sheet relates to: the document itself if it is an actor, otherwise its owning actor (or `null`). */
            get actor(): SohlActor | null {
                return ActorKinds.includes(this.document.type as any) ?
                        (this.document as SohlActor)
                    :   (this.document as any).actor || null;
            }

            /**
             * Prepare the template render context, augmenting the base context
             * with system config, ownership flags, the related actor, document
             * data, and the set of transferred (incoming) active effects.
             * @param options - The render options for this pass.
             * @returns The prepared render context.
             */
            protected override async _prepareContext(
                options: any,
            ): Promise<PlainObject> {
                const data: PlainObject = await super._prepareContext(options);
                data.config = sohl.CONFIG;
                data.owner = !!this.document.isOwner;
                data.limited = !!this.document.limited;
                data.options = (this.document as any).options;
                data.editable = this.isEditable;
                data.cssClass = data.owner ? "editable" : "locked";
                data.isBeing = this.document.type === ACTOR_KIND.BEING;
                data.actor =
                    ActorKinds.includes(this.document.type as any) ?
                        (this.document as SohlActor)
                    :   (this.document as any).actor || null;
                data.flags = this.document.flags;
                data.system = this.document.system;
                data.isGM = game.user.isGM;
                data.fields = this.document.system.schema.fields;
                data.effects = (this.document as any).effects;

                // Collect all effects from other Items/Actors that are affecting this item
                data.trxEffects = {};
                (this.document as any).transferredEffects?.forEach(
                    (effect: SohlActiveEffect) => {
                        if (effect.id && !effect.disabled) {
                            data.trxEffects[effect.id] = effect;
                        }
                    },
                );

                return data;
            }

            /**
             * Actions performed after any render of the Application.
             * Post-render steps are not awaited by the render process.
             * @param context - Prepared context data
             * @param options - Provided render options
             */
            protected override async _onRender(
                context: PlainObject,
                options: PlainObject,
            ): Promise<void> {
                await super._onRender(context, options);
                this._dragDrop.forEach((d: DragDrop) => d.bind(this.element));
            }

            /**
             * Filter the sheet's item list against a search query, hiding
             * non-matching items and collapsing categories with no matches.
             * @param event - The keyboard event that triggered the filter.
             * @param query - The current search query text.
             * @param rgx - The regular expression compiled from the query.
             * @param element - The container element holding the items and categories.
             */
            protected _onSearchFilter(
                event: KeyboardEvent,
                query: string,
                rgx: RegExp,
                element: HTMLElement,
            ): void {
                if (!element) return;
                const visibleCategories = new Set<string>();

                for (const entry of Array.from(
                    element.querySelectorAll<HTMLElement>(".item"),
                )) {
                    if (!query) {
                        entry.classList.remove("hidden");
                        continue;
                    }

                    const name = entry.dataset.itemName;
                    const match = name && rgx.test(name.trim());
                    entry.classList.toggle("hidden", !match);
                    if (match) {
                        const cat = entry.closest<HTMLElement>(".category");
                        if (cat?.dataset.category)
                            visibleCategories.add(cat.dataset.category);
                    }
                }

                for (const category of Array.from(
                    element.querySelectorAll<HTMLElement>(".category"),
                )) {
                    const catName = category.dataset.category;
                    if (!catName) continue;
                    const visible = query && visibleCategories.has(catName);
                    category.classList.toggle("hidden", !!query && !visible);
                }
            }

            /**
             * Attach SoHL context menus to the sheet's item and effect rows.
             * @param element - The sheet root element to bind the menus to.
             */
            protected _contextMenu(element: HTMLElement): void {
                const parent = (this.document as any).logic;
                new SohlContextMenu(element, ".item", [], {
                    onOpen: this._onItemContextMenuOpen.bind(this),
                    parent,
                });
                new SohlContextMenu(element, ".item-contextmenu", [], {
                    eventName: "click",
                    onOpen: this._onItemContextMenuOpen.bind(this),
                    parent,
                });
                new SohlContextMenu(element, ".effects__row", [], {
                    onOpen: this._onEffectContextMenuOpen.bind(this),
                    parent,
                });
                new SohlContextMenu(element, ".effect-contextmenu", [], {
                    eventName: "click",
                    onOpen: this._onEffectContextMenuOpen.bind(this),
                    parent,
                });
            }

            /**
             * Populate the active context menu with the options for the item
             * (or action) under the opened menu's row.
             * @param element - The element the context menu was opened on.
             * @returns An empty array; the menu items are set on the UI context as a side effect.
             */
            protected _onItemContextMenuOpen(
                element: HTMLElement,
            ): SohlContextMenu.Entry[] {
                const anyDoc = this.document as any;
                let ele = element.closest("[data-item-id]") as HTMLElement;
                if (!ele) return [];
                const actionName = ele?.dataset.actionName;
                const docId = ele?.dataset.itemId;
                if (!docId) return [];
                let doc;
                if (actionName) {
                    doc = anyDoc.system.actions.get(docId);
                } else {
                    let actor: SohlActor | null =
                        ActorKinds.includes(anyDoc.type) ?
                            (anyDoc as SohlActor)
                        :   anyDoc.actor;
                    if (!actor) return [];
                    doc = actor.items.get(docId);
                }
                if (doc) {
                    const uiContext = (foundry as any).ui.context;
                    if (uiContext) {
                        uiContext.menuItems = doc.getContextOptions();
                    }
                }
                return [];
            }

            /**
             * Populate the active context menu with the options for the active
             * effect under the opened menu's row.
             * @param element - The element the context menu was opened on.
             */
            protected _onEffectContextMenuOpen(element: HTMLElement): void {
                let ele = element.closest("[data-effect-id]") as HTMLElement;
                if (!ele) return;
                const effectId = ele.dataset.effectId;
                const effect = (this.document as any).effects.get(effectId);
                const uiContext = (foundry as any).ui.context;
                if (uiContext) {
                    uiContext.menuItems =
                        effect ? effect.getContextOptions(effect) : [];
                }
            }

            /**
             * Retrieve the context options for the given item. Sort the menu items based on groups, with items having no group at the top, items in the 'primary' group in the middle, and items in the 'secondary' group at the bottom.
             *
             * @static
             * @param doc
             * @returns
             */
            protected static _getContextOptions(
                doc: SohlDocument,
            ): SohlContextMenu.Entry[] {
                let result = (
                    doc as any
                ).getContextOptions() as SohlContextMenu.Entry[];
                if (!result || !result.length) return [];

                result = result.filter(
                    (co) => co.group !== SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
                );

                // Sort the menu items according to group.  Expect items with no group
                // at the top, items in the "primary" group next, and items in the
                // "secondary" group last.
                const collator = new Intl.Collator(sohl.i18n.lang);
                result.sort(
                    (a: SohlContextMenu.Entry, b: SohlContextMenu.Entry) =>
                        collator.compare(a.group || "", b.group || ""),
                );
                return result;
            }

            /**
             * Toggle the enabled state of the active effect for the clicked row.
             * @param event - The pointer event that triggered the toggle.
             * @param target - The clicked element within the effect row.
             */
            protected static async _onEffectToggle(
                this: any,
                event: PointerEvent,
                target: HTMLElement,
            ): Promise<void> {
                const li = target.closest(
                    "[data-effect-id]",
                ) as HTMLElement | null;
                const effectId = li?.dataset.effectId;
                if (!effectId) return;
                const effect = this.document.effects.get(effectId);
                await effect?.toggleEnabledState();
            }

            /**
             * Create a new active effect on the document, picking a unique
             * default name and origin.
             * @throws If the document does not expose a `createEffect` method.
             */
            protected static async _onEffectCreate(this: any): Promise<void> {
                const doc = this.document;
                const createEffect = doc.createEffect as Function | undefined;
                if (!createEffect) {
                    throw new Error(
                        "SohlDataModel.Sheet._onEffectCreate: createEffect not found",
                    );
                }
                let name = game.i18n.localize("SOHL.Effect.newName");
                let base = name;
                let i = 0;
                while (
                    doc.effects.some((e: SohlActiveEffect) => e.name === name)
                ) {
                    name = `${base} ${++i}`;
                }
                await doc.createEffect({
                    name,
                    type: "sohleffectdata",
                    img: "icons/svg/aura.svg",
                    origin: doc.uuid,
                });
            }

            /**
             * Delete the active effect for the clicked row, after a
             * confirmation prompt (Foundry's `deleteDialog`).
             * @param event - The pointer event that triggered the delete.
             * @param target - The clicked element within the effect row.
             */
            protected static async _onEffectDelete(
                this: any,
                event: PointerEvent,
                target: HTMLElement,
            ): Promise<void> {
                const li = target.closest(
                    "[data-effect-id]",
                ) as HTMLElement | null;
                const effectId = li?.dataset.effectId;
                if (!effectId) return;
                const effect = this.document.effects.get(effectId);
                if (!effect) return;
                const confirmed =
                    await foundry.applications.api.DialogV2.confirm({
                        window: {
                            title: game.i18n.localize(
                                "SOHL.Effect.contextMenu.delete",
                            ),
                        },
                        content: `<p>${game.i18n.format("SOHL.Effect.deleteHint", { name: effect.name })}</p>`,
                    } as any);
                if (!confirmed) return;
                await effect.delete();
            }

            /**
             * Callback actions which occur at the beginning of a drag start workflow.
             * @param event - The originating DragEvent
             */
            protected _onDragStart(event: DragEvent): void {
                const li = event.currentTarget as HTMLElement;
                if ("link" in li?.dataset) return;

                // Create drag data
                let dragData: PlainObject | null = null;

                // Owned Items
                if (li.dataset.uuid) {
                    const item = fvttResolveUuid(li.dataset.uuid) as any;
                    dragData = item?.toDragData() || null;
                }

                // Active Effect
                else if (li.dataset.effectId && this.actor) {
                    const effect = (this.actor as any).effects.get(
                        li.dataset.effectId,
                    );
                    dragData = effect?.toDragData() || null;
                }

                if (!dragData) return;

                // Set data transfer
                event.dataTransfer?.setData(
                    "text/plain",
                    JSON.stringify(dragData),
                );
            }

            /**
             * Callback actions which occur when a dragged element is over a drop target.
             * @param event - The originating DragEvent
             */
            protected _onDragOver(event: DragEvent): void {}

            /**
             * Callback actions which occur when a dragged element is dropped on a target.
             * @param event - The originating DragEvent
             */
            protected async _onDrop(event: DragEvent): Promise<void> {
                const data = JSON.parse(
                    event.dataTransfer?.getData("text/plain") || "{}",
                );
                const documentClass = foundry.utils.getDocumentClass(data.type);
                if (documentClass) {
                    const document = await documentClass.fromDropData(data);
                    switch (document.documentName) {
                        case "ActiveEffect":
                            void this._onDropActiveEffect(event, document);
                            break;

                        case "Actor":
                            void this._onDropActor(event, document);
                            break;

                        case "Item":
                            void this._onDropItem(event, document);
                            break;
                        case "Folder":
                            void this._onDropFolder(event, document);
                            break;
                    }
                }
            }

            /**
             * Handle an active effect dropped onto the sheet.
             * @param event - The originating drop event.
             * @param droppedEffect - The active effect that was dropped.
             */
            protected async _onDropActiveEffect(
                event: DragEvent,
                droppedEffect: SohlActiveEffect,
            ): Promise<void> {}

            /**
             * Handle an actor dropped onto the sheet.
             * @param event - The originating drop event.
             * @param droppedActor - The actor that was dropped.
             */
            protected async _onDropActor(
                event: DragEvent,
                droppedActor: SohlActor,
            ): Promise<void> {}

            /**
             * Handle a folder dropped onto the sheet.
             * @param event - The originating drop event.
             * @param droppedFolder - The folder that was dropped.
             */
            protected async _onDropFolder(
                event: DragEvent,
                droppedFolder: Folder,
            ): Promise<void> {}

            /**
             * Handle an item dropped onto the sheet.
             * @param event - The originating drop event.
             * @param droppedItem - The item that was dropped.
             */
            protected async _onDropItem(
                event: DragEvent,
                droppedItem: SohlItem,
            ): Promise<void> {}

            /**
             * Prompt for a primitive (string or number) value via a dialog and
             * append it to the array field named in the trigger element's dataset.
             * @param event - The pointer event whose target carries the array dataset.
             * @param options - Behavior options for the add operation.
             * @param options.allowDuplicates - When `false`, skip values already present in the array.
             */
            protected async _addPrimitiveArrayItem(
                event: PointerEvent,
                { allowDuplicates = false } = {},
            ): Promise<void> {
                const dataset = (event.currentTarget as HTMLElement)?.dataset;
                if (!dataset?.array) return;
                let oldArray: any[] = foundry.utils.getProperty(
                    this.document,
                    dataset.array,
                ) as any[];
                let newArray: any[] = foundry.utils.deepClone(oldArray);
                const datatype = dataset.dtype;
                const choices = dataset.choices;
                const defaultValue =
                    dataset.dtype === "Number" ?
                        String(
                            Number.parseFloat(dataset.defaultValue || "0") || 0,
                        )
                    :   String(dataset.defaultValue);

                const dialogData = {
                    valueName: dataset.title,
                    newValue: defaultValue,
                    choices,
                };

                const dlgHtml: HTMLString = toHTMLString(`<form id="value">
                <div class="form-group">
                    <label>{{valueName}}</label>
                    {{#if choices}}
                    <select name="newValue">
                        {{selectOptions choices selected=newValue}}
                    </select>
                    {{else}}
                    <input
                        type="{{#if (eq type 'Number')}}number{{else}}text{{/if}}"
                        name="newValue"
                        value="{{newValue}}" />
                    {{/if}}
                </div>
                </form>`);

                const dlgResult = await dialog({
                    title: dataset.title,
                    content: dlgHtml,
                    data: dialogData,
                    buttons: [
                        {
                            action: "ok",
                            label: `Add ${dataset.title}`,
                            default: true,
                        },
                    ],
                    callback: (formData: PlainObject) => {
                        const expanded = foundry.utils.expandObject(
                            formData,
                        ) as PlainObject;
                        let formValue = expanded.newValue;
                        if (datatype === "Number") {
                            formValue = Number.parseFloat(formValue);
                            if (Number.isNaN(formValue))
                                formValue = dataset.defaultValue;
                        }
                        return formValue;
                    },
                    rejectClose: false,
                });

                // if dialog was closed, do nothing
                if (!dlgResult) return;

                if (!allowDuplicates && newArray.includes(dlgResult)) return;

                newArray.push(dlgResult);
                const updateData = { [dataset.array]: newArray };
                const result = await (this.document as any).update(updateData);
                if (result) void this.render();
            }

            /**
             * Prompt the user to pick from a set of choices and append the
             * chosen value to the array field named in the trigger's dataset.
             * @param event - The pointer event whose target carries the choices and array dataset.
             */
            protected async _addChoiceArrayItem(
                event: PointerEvent,
            ): Promise<void> {
                const dataset = (event.currentTarget as HTMLElement).dataset;
                if (!dataset.choices || !dataset.array) return;
                let array: string[] = (
                    (foundry.utils.getProperty(this.document, dataset.array) ||
                        []) as any[]
                ).concat();
                const choices: string[] = dataset.choices.split(";");
                let formHtml =
                    '<form id="get-choice"><div class="form-group"><select name="choice">';
                choices.forEach((c) => {
                    const [label, val] = c.split(":").map((v) => v.trim());
                    const escapedVal = Handlebars.escapeExpression(val);
                    const escapedLabel = Handlebars.escapeExpression(label);
                    formHtml += `<option value="${escapedVal}">${escapedLabel}</option>`;
                });
                formHtml += `</select></div></form>`;
                const dlgHtml = formHtml;

                const dlgResult = await Dialog.prompt({
                    title: dataset.title,
                    content: dlgHtml.trim(),
                    label: `Add ${dataset.title}`,
                    callback: (element) => {
                        const form = element.querySelector("form");
                        const fd = new (
                            foundry.applications as any
                        ).ux.FormDataExtended(form);
                        const formData = foundry.utils.expandObject(
                            fd.object,
                        ) as PlainObject;
                        return formData.choice;
                    },
                    rejectClose: false,
                    options: { jQuery: false },
                });

                // if dialog was closed, do nothing
                if (!dlgResult) return;

                if (array.some((a: string) => a === dlgResult)) {
                    sohl.log.uiWarn(
                        `Choice with value "${dlgResult} already exists, ignoring`,
                    );
                    return;
                }

                array.push(dlgResult);
                const updateData = { [dataset.array]: array };
                await (this.document as any).update(updateData);
            }

            /**
             * Prompt for an aim entry (name and probability weight) and append
             * it to the array field named in the trigger's dataset.
             * @param event - The pointer event whose target carries the aim and array dataset.
             */
            protected async _addAimArrayItem(
                event: PointerEvent,
            ): Promise<void> {
                const dataset = (event.currentTarget as HTMLElement).dataset;
                if (!dataset.aim || !dataset.array) return;
                let array: { name: string; probWeightBase: number }[] = (
                    (foundry.utils.getProperty(this.document, dataset.array) ||
                        []) as Array<{ name: string; probWeightBase: number }>
                ).concat();
                const compiled = Handlebars.compile(`<form id="aim">
        <div class="form-group flexrow">
            <div class="flexcol">
                <label>Name</label>
                <input type="text" name="name" />
            </div><div class="flexcol">
                <label>Prob Weight Base</label>
                {{numberInput 0 name="probWeightBase" min=0 step=1}}
            </div></div></form>`);
                const dlgHtml = compiled(
                    {},
                    {
                        allowProtoMethodsByDefault: true,
                        allowProtoPropertiesByDefault: true,
                    },
                );

                const dlgResult = await Dialog.prompt({
                    title: dataset.title,
                    content: dlgHtml.trim(),
                    label: `Add ${dataset.title}`,
                    callback: (element) => {
                        const form = element.querySelector("form");
                        const fd = new (
                            foundry.applications as any
                        ).ux.FormDataExtended(form);
                        const formData = foundry.utils.expandObject(
                            fd.object,
                        ) as PlainObject;
                        const result = {
                            name: formData.name,
                            probWeightBase:
                                Number.parseInt(formData.probWeightBase, 10) ||
                                0,
                        };
                        return result;
                    },
                    rejectClose: false,
                    options: { jQuery: false },
                });

                // if dialog was closed, do nothing
                if (!dlgResult) return;

                if (
                    array.some(
                        (a: { name: string; probWeightBase: number }) =>
                            a.name === dlgResult.name,
                    )
                ) {
                    sohl.log.uiWarn(
                        `Aim with name "${dlgResult.name} already exists, ignoring`,
                    );
                    return;
                }

                array.push(dlgResult);
                const updateData = { [dataset.array]: array };
                await (this.document as any).update(updateData);
            }

            /**
             * Prompt for a value-description entry (label and max value) and
             * append it (sorted by max value) to the array field named in the
             * trigger's dataset.
             * @param event - The pointer event whose target carries the valueDesc and array dataset.
             */
            protected async _addValueDescArrayItem(
                event: PointerEvent,
            ): Promise<void> {
                const dataset = (event.currentTarget as HTMLElement).dataset;
                // Routed here by `data-object-type="ValueDesc"` in the dispatcher;
                // only the target array path is required.
                if (!dataset.array) return;
                let array: { label: string; maxValue: number }[] = (
                    (foundry.utils.getProperty(this.document, dataset.array) ||
                        []) as Array<{ label: string; maxValue: number }>
                ).concat();
                const compiled = Handlebars.compile(`<form id="aim">
                <div class="form-group flexrow">
                    <div class="flexcol">
                        <label>Label</label>
                        <input type="text" name="label" />
                    </div><div class="flexcol">
                        <label>Max Value</label>
                        {{numberInput 0 name="maxValue" min=0 step=1}}
                    </div></div></form>`);
                const dlgHtml = compiled(
                    {},
                    {
                        allowProtoMethodsByDefault: true,
                        allowProtoPropertiesByDefault: true,
                    },
                );

                const dlgResult = await Dialog.prompt({
                    title: dataset.title,
                    content: dlgHtml.trim(),
                    label: `Add ${dataset.title}`,
                    callback: (element) => {
                        const form = element.querySelector("form");
                        const fd = new (
                            foundry.applications as any
                        ).ux.FormDataExtended(form);
                        const formData = foundry.utils.expandObject(
                            fd.object,
                        ) as PlainObject;
                        const result = {
                            label: formData.label,
                            maxValue:
                                Number.parseInt(formData.maxValue, 10) || 0,
                        };
                        return result;
                    },
                    rejectClose: false,
                    options: { jQuery: false },
                });

                // if dialog was closed, do nothing
                if (!dlgResult) return;

                if (
                    array.some(
                        (a: { label: string; maxValue: number }) =>
                            a.label === dlgResult.label,
                    )
                ) {
                    sohl.log.uiWarn(
                        `Aim with name "${dlgResult.label} already exists, ignoring`,
                    );
                    return;
                }

                array.push(dlgResult);
                array.sort(
                    (
                        a: { label: string; maxValue: number },
                        b: { label: string; maxValue: number },
                    ) => a.maxValue - b.maxValue,
                );
                const updateData = { [dataset.array]: array };
                await (this.document as any).update(updateData);
                void this.render();
            }

            /**
             * Dispatch an "add array item" action to the appropriate handler
             * based on the trigger's dataset (aim, value description, choice, or
             * primitive), after saving any pending sheet edits.
             * @param event - The pointer event whose target carries the array item dataset.
             */
            protected async _addArrayItem(event: PointerEvent): Promise<void> {
                const dataset = (event.currentTarget as HTMLElement).dataset;
                // Flush any focused-but-unsaved field edit. ApplicationV2 saves
                // on change (submitOnChange), and clicking a control blurs the
                // field; the optional call is a belt-and-suspenders flush that
                // no-ops when the base sheet exposes no `_onSubmit`.
                await (this as any)._onSubmit?.(event);

                if (dataset.objectType === "Aim") {
                    await this._addAimArrayItem(event);
                } else if (dataset.objectType === "ValueDesc") {
                    await this._addValueDescArrayItem(event);
                } else if (dataset.choices) {
                    await this._addChoiceArrayItem(event);
                } else if (
                    ["Number", "String"].includes(dataset.dtype || "String")
                ) {
                    await this._addPrimitiveArrayItem(event, {
                        allowDuplicates: dataset.allowDuplicates === "true",
                    });
                }
                void this.render();
            }

            /**
             * Remove the value identified by the trigger's dataset from its
             * array field, after saving any pending sheet edits.
             * @param event - The pointer event whose target carries the array and value dataset.
             */
            protected async _deleteArrayItem(
                event: PointerEvent,
            ): Promise<void> {
                const dataset = (event.currentTarget as HTMLElement).dataset;
                if (!dataset.array) return;
                // Flush any focused-but-unsaved field edit. ApplicationV2 saves
                // on change (submitOnChange), and clicking a control blurs the
                // field; the optional call is a belt-and-suspenders flush that
                // no-ops when the base sheet exposes no `_onSubmit`.
                await (this as any)._onSubmit?.(event);
                const current = foundry.utils.getProperty(
                    this.document,
                    dataset.array,
                );
                let array: any[] = Array.isArray(current) ? [...current] : [];
                // Object-array rows delete by index (`data-index`); primitive
                // rows delete by value (`data-value`). Either way the whole
                // array is written back, never an element by index.
                if (dataset.index !== undefined) {
                    const idx = Number.parseInt(dataset.index, 10);
                    if (
                        !Number.isInteger(idx) ||
                        idx < 0 ||
                        idx >= array.length
                    )
                        return;
                    array.splice(idx, 1);
                } else {
                    array = array.filter((a: any) => a !== dataset.value);
                }
                const result = await (this.document as any).update({
                    [dataset.array]: array,
                });
                if (result) void this.render();
            }

            /**
             * Prompt for a key/value pair via a dialog and add it to the object
             * field named in the trigger's dataset, coercing the value to a
             * number or boolean where appropriate.
             * @param event - The pointer event whose target carries the object dataset.
             */
            protected async _addObjectKey(event: PointerEvent): Promise<void> {
                const dataset = (event.currentTarget as HTMLElement).dataset;
                if (!dataset.object) return;
                if (!dataset.title) dataset.title = "Add Key";

                // Flush any focused-but-unsaved field edit. ApplicationV2 saves
                // on change (submitOnChange), and clicking a control blurs the
                // field; the optional call is a belt-and-suspenders flush that
                // no-ops when the base sheet exposes no `_onSubmit`.
                await (this as any)._onSubmit?.(event);

                let object = foundry.utils.getProperty(
                    this.document,
                    dataset.object,
                ) as any;

                const dialogData = {
                    newKey: "",
                    newValue: "",
                };

                let dlgTemplate: FilePath = toFilePath(
                    "systems/sohl/templates/dialog/keyvalue-dialog.hbs",
                );

                const dlgResult = await dialog({
                    title: dataset.title,
                    template: dlgTemplate,
                    data: dialogData,
                    callback: (rawForm: PlainObject) => {
                        const formData = foundry.utils.expandObject(
                            rawForm,
                        ) as PlainObject;
                        let formKey = formData.newKey;
                        let formValue = formData.newValue;
                        let value: number = Number.parseFloat(formValue);
                        if (Number.isNaN(value)) {
                            if (formValue === "true") value = 1;
                            else if (formValue === "false") value = 0;
                            else if (formValue === "null") value = 0;
                            else value = formValue;
                        }
                        return { key: formKey, value: value };
                    },
                    rejectClose: false,
                });

                // if dialog was closed, or key is empty, do nothing
                if (!dlgResult || !dlgResult.key) return;

                object[dlgResult.key] = dlgResult.value;
                const updateData = { [dataset.object]: object };
                const result = await (this.document as any).update(updateData);
                if (result) void this.render();
            }
        } as unknown as TBase;
    }
}
