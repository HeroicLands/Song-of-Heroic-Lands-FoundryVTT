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

import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlTokenDocument } from "@src/document/token/foundry/SohlTokenDocument";
import type { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import {
    ACTION_SUBTYPE,
    ActorKinds,
    BRAND,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";
import {
    ContextMenuEntry,
    type ContextMenuCondition,
    resolveContextActor,
    resolveContextItem,
} from "@src/apps/logic/ContextMenuEntry";
import { SohlSpeaker } from "@src/core/logic/SohlSpeaker";
import { SohlAction } from "@src/entity/action/SohlAction";
import { SohlMap } from "@src/utils/collection/SohlMap";

/**
 * Abstract base class for all business logic in the SoHL system.
 *
 * Every actor type and item type has a corresponding Logic class that extends
 * `SohlLogic`. Logic classes are responsible for game rules, calculations, and
 * actions — separated from data persistence (`SohlDataModel`) and UI
 * presentation (Sheet classes).
 *
 * Logic instances are created automatically by the data model's `create()` factory
 * and are accessible via `document.system.logic` (or the convenience `document.logic`
 * accessor on {@link SohlActor} and {@link SohlItem}).
 *
 * ## Phase-batched lifecycle
 *
 * Foundry VTT's default behavior processes each embedded item fully
 * (`prepareBaseData` → `prepareEmbeddedData` → `prepareDerivedData`) before
 * moving to the next item. This means sibling items cannot depend on each
 * other — when Item B prepares, Item A may or may not be ready.
 *
 * SoHL overrides this in {@link SohlActor.prepareEmbeddedData} to run three
 * phases across **all** items with barriers between them:
 *
 * 1. **{@link initialize}** — Set up base state from persisted data: create
 *    ValueModifiers, set base values. **Cannot** read
 *    sibling items (they may not have initialized yet).
 * 2. **{@link evaluate}** — Compute derived values that depend on sibling
 *    items being initialized (e.g., a Skill reading trait attribute values
 *    for its skill base formula). All `initialize()` calls across every item
 *    on the actor complete before any `evaluate()` runs.
 * 3. **{@link finalize}** — Resolve cross-item dependencies that require
 *    sibling items to have been evaluated (e.g., fate mastery level
 *    depending on a fully computed Aura trait). All `evaluate()` calls
 *    complete before any `finalize()` runs.
 *
 * How Foundry's data-preparation hooks map onto these phases (the actor's own
 * logic runs around the item passes):
 *
 * ```text
 * Foundry calls:            SoHL runs:
 * prepareBaseData()     →   actor.logic.initialize()
 * prepareEmbeddedData() →   per item: initialize()  ═ barrier ═  evaluate()  ═ barrier ═  finalize()
 * prepareDerivedData()  →   actor.logic.evaluate(), then actor.logic.finalize()
 * ```
 *
 * These method names are deliberately different from Foundry's
 * `prepareBaseData`/`prepareDerivedData` to signal that they follow
 * different ordering rules. Do not implement Foundry's preparation
 * methods on items — use these lifecycle methods instead.
 *
 * @typeParam TData - The data interface this logic operates on, extending
 *   {@link SohlLogicData}.
 */
export abstract class SohlLogic<
    TData extends SohlLogicData<any> = SohlLogicData<any>,
> {
    private readonly _parent: TData;
    /** Executable actions for this document, keyed by title — context-menu entries, chat-card buttons, and lifecycle hooks. */
    actions!: SohlMap<string, SohlAction>;

    /**
     * Runtime brand identifying any SohlLogic (or subtype) — inherited by every
     * subclass at any depth. Lets consumers detect a SohlLogic via
     * {@link isA} without importing the class as a value (which would form an
     * import cycle through the entity layer). Not an own property, so it never
     * serializes.
     */
    get [BRAND.SohlLogic](): true {
        return true;
    }

    /**
     * Define and return all intrinsic actions for this logic type.
     * @returns A map of action shortcodes to their definitions
     */
    static defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            {
                shortcode: "postfinalize",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.SohlLogic.Action.postfinalize.title",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-gears",
                // Must match the postFinalize method name exactly — intrinsic
                // executors are resolved by case-sensitive property lookup.
                executor: "postFinalize",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
        ];
    }

    /**
     * The parent data model this logic is embedded in.
     */
    get parent(): TData {
        return this._parent;
    }

    /**
     * This logic's typed data — its `*Data` interface (e.g. `SkillData`), the same
     * persisted object as `document.system`. Prefer **`document.logic.data`** when
     * reading a document's fields from a macro, Script Action, or module: it is the
     * typed, API-documented surface (autocomplete and reference links resolve),
     * whereas `document.system` is typed as the internal DataModel.
     * @remarks Convenience accessor for {@link parent}.
     */
    get data(): TData {
        return this.parent;
    }

    /** The owning document's id. */
    get id(): DocumentId {
        return this.data.id as DocumentId;
    }

    /** The owning document's UUID — the opaque identity token from the data port. */
    get uuid(): string {
        return this.data.uuid;
    }

    /** The owning document's name. */
    get name(): string {
        return this.data.name;
    }

    /** The owning document's kind (its actor or item type id). */
    get kind(): string {
        return this.data.kind;
    }

    /**
     * The owning {@link SohlItem}.
     *
     * @throws If this logic is not embedded in an item.
     */
    get item(): SohlItem {
        if ("item" in this.parent) {
            return this.parent.item as SohlItem;
        } else {
            throw new Error("SohlLogic must be present in an Item");
        }
    }

    /**
     * The owning {@link SohlActor} — the document itself when it is an actor,
     * otherwise its owning actor (for an item, combatant, or effect), or `null`.
     */
    get actor(): SohlActor | null {
        const doc = this.parent?.parent as any;
        if (!doc) return null;
        if (ActorKinds.includes(doc.type)) return doc as SohlActor;
        return (doc.actor as SohlActor | null) ?? null;
    }

    /**
     * The logic of the owning actor — the Foundry-free way to reach the actor
     * layer from any logic. For an actor's own logic this is itself; for an
     * item's logic it is the owning actor's logic; otherwise `null`.
     *
     * @remarks Resolved through the {@link SohlLogicData} port, so logic code
     * can navigate to the actor (and iterate items via `allLogics` /
     * `logicTypes` / `getItemLogic`) without touching the Foundry document.
     */
    get actorLogic(): SohlActorLogic<any> | null {
        return this.data.actorLogic;
    }

    /** A {@link SohlSpeaker} for the owning actor/item (a blank speaker if neither resolves). */
    get speaker(): SohlSpeaker {
        return (
            this.actor?.getSpeaker() ??
            this.item?.actor?.getSpeaker() ??
            new SohlSpeaker()
        );
    }

    /** Localized type (and sub-type, when present) label for the owning document. */
    get typeLabel(): string {
        const dataModel = this.parent as any;
        const type = dataModel.parent.type;
        const typeLabel = sohl.i18n.localize(
            `TYPE.${ActorKinds.includes(type) ? "ACTOR" : "ITEM"}.${dataModel.parent.type}`,
        );
        if (typeof (this.parent as any).subType === "string") {
            return sohl.i18n.format(
                `SOHL.${type}.labelWithSubtype.${(this.parent as any).subType}`,
            );
        } else {
            return typeLabel;
        }
    }

    /** Localized display label combining the {@link typeLabel} and the document's name. */
    get label(): string {
        const dataModel = this.parent as any;
        const type = dataModel.parent.type;
        const locKey = `SOHL.${type}.${dataModel.shortcode}.label`;
        const locResult = sohl.i18n.localize(locKey);
        const name = locResult !== locKey ? locResult : dataModel.parent.name;
        return sohl.i18n.format("SOHL.docLabelFormat", {
            type: this.typeLabel,
            name,
        });
    }

    /**
     * Binds this logic to its parent data model and builds the {@link actions}
     * map from the parent's intrinsic and scripted action definitions, selecting
     * a default action.
     *
     * @param data - Reserved base data (unused by the base class).
     * @param options - Must provide `options.parent`, the data model this logic
     *   is embedded in; the parent's `actionDefs` are used to build
     *   {@link actions}.
     * @throws If no `parent` is provided.
     */
    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        if (!options.parent) {
            throw new Error(
                "SohlLogic must be constructed with a parent item or actor.",
            );
        }
        this._parent = options.parent;

        // Initialize all actions, both intrinsic ones and scripts
        const actns = [
            ...(this.constructor as any).defineIntrinsicActions(),
            ...this.data.actionDefs,
        ].map((data) => new SohlAction(data, { parent: this }));

        // Set the default action based on the parent's settings
        // and generate a map from the array of actions.
        this.actions = new SohlMap<string, SohlAction>(
            setDefaultAction(actns).map((act) => [act.shortcode, act]),
        );
    }

    /**
     * Serialize this logic to a plain **reference**.
     *
     * @remarks
     * A logic is a behavior wrapper over a live Foundry document; it is never
     * revived from its own JSON (its constructor needs that document). Wherever a
     * logic is persisted — a chat card, an action {@link SohlActionContext.scope}
     * — it is re-resolved from its `uuid` (e.g. via `fvttLogicFromUuidSync`), not
     * rebuilt from a payload. So it serializes as a compact, resolvable reference
     * (`name`/`kind` are carried for display and debugging); the owning document
     * holds the actual persisted state.
     * @returns A uuid-keyed reference to this logic.
     */
    toJSON(): PlainObject {
        return {
            uuid: this.uuid,
            name: this.name,
            kind: this.kind,
        };
    }

    /**
     * The context-menu options — the actions currently available — for this
     * logic's document.
     *
     * @remarks
     * One entry per action whose `visible` predicate currently passes (an
     * action's `trigger` / domain preconditions can hide it); `SCRIPT` actions
     * are additionally permission-gated when executed. Use this to discover
     * which actions can be performed on the document.
     *
     * @returns The available context-menu entries.
     */
    getContextOptions(): ContextMenuEntry[] {
        const entries: ContextMenuEntry[] = [];
        for (const action of this.actions.values()) {
            const data = action.data;
            const condition: ContextMenuCondition = (
                target: HTMLElement,
            ): boolean => action.visible(target);
            const callback = (element: HTMLElement) => {
                // Resolve the acting actor from the clicked row when present
                // (sheet menus carry `data-actor-id`); otherwise fall back to
                // this logic's own actor so menus on documents without that
                // marker — e.g. a combatant row in the combat tracker — still
                // dispatch with the correct speaker.
                const item = resolveContextItem(element);
                const actor =
                    resolveContextActor(element) ?? item?.actor ?? this.actor;
                const ctx = new SohlActionContext({
                    speaker: actor?.getSpeaker(),
                } as any);
                action.execute(ctx);
            };
            entries.push(
                new ContextMenuEntry({
                    id: data.title,
                    name: data.title,
                    iconFAClass: data.iconFAClass,
                    condition,
                    callback,
                    group: data.group as any,
                }),
            );
        }
        return entries;
    }

    /**
     * Returns the {@link SohlActionContext} for this actor.
     * @param token The token to use for context, if any.
     * @param data Additional context data to merge into the action context.
     * @returns The action context for this actor.
     */
    protected _getContext(
        data: Partial<SohlActionContext.Data> = {},
    ): SohlActionContext {
        data.speaker ??= this.speaker;
        return new SohlActionContext(data);
    }

    /**
     * Execute an action by shortcode, using the provided context or creating a new one.
     * @param shortcode - The shortcode of the action to execute.
     * @param context - The action context to use, if any.
     * @returns The result of the action execution, or undefined if the action was not found or could not be executed.
     */
    async executeAction(
        shortcode: string,
        context?: SohlActionContext,
    ): Promise<unknown> {
        const actorLogic: SohlActorLogic<any> | undefined =
            this.actorLogic ?? this.item?.actor?.logic;
        if (!actorLogic) {
            console.warn(
                `SoHL | ${this.name} (Actor) has no actor to execute action "${shortcode}"`,
            );
            return;
        }
        context ??= actorLogic._getContext();
        const action = this.actions.get(shortcode);
        if (!action) {
            console.warn(
                `SoHL | ${this.name} (Actor) has no action "${shortcode}"`,
            );
            return;
        }
        return action.execute(context);
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Intrinsic action performed after finalize lifecycle stage.
     * This is intended for modules to hook into (or ActionItems to override)
     * to perform additional logic after the main lifecycle stages have completed.
     *
     * @param context - The action context for the post-finalize hook.
     */
    postFinalize(context: SohlActionContext): void {
        // No-op by default
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /*
     * Phase-batched lifecycle methods, called by
     * SohlActor.prepareEmbeddedData() in three barrier-separated passes across
     * ALL items, NOT per-item like Foundry's default. See the class-level JSDoc
     * and docs/concepts/lifecycle-model.md.
     */

    /**
     * Set up base state from persisted data: create ValueModifiers, set base
     * values.
     *
     * @remarks
     * Called on every item before any item's {@link evaluate} runs.
     *
     * **Safe to access:** own persisted data fields (`this.data.*`).
     *
     * **Not safe to access:** sibling items on the same actor — they may not
     * have initialized yet. Cross-item reads belong in {@link evaluate}.
     *
     * **Example:** a Skill creates its `MasteryLevelModifier`
     * from persisted fields; it does not yet read trait attribute values.
     */
    initialize(): void {}

    /**
     * Compute derived values that depend on sibling items being initialized.
     *
     * @remarks
     * Called on every item after ALL items have completed {@link initialize}.
     *
     * **Safe to access:** sibling items' initialized state (e.g., reading
     * trait attribute values for a skill base formula).
     *
     * **Not safe to access:** sibling items' evaluated state — another item's
     * `evaluate()` may not have run yet. Dependencies on evaluated state
     * belong in {@link finalize}.
     *
     * **Example:** a Skill reads trait attribute values to compute its skill
     * base; a gear item resolves its `containerId` to find its parent container.
     */
    abstract evaluate(): void;

    /**
     * Resolve cross-item dependencies that require all items to have been
     * evaluated.
     *
     * @remarks
     * Called on every item after ALL items have completed {@link evaluate}.
     *
     * **Safe to access:** all sibling items' initialized and evaluated state.
     *
     * **Example:** fate mastery level (which depends on an already-evaluated
     * Aura trait); encumbrance totals summed across all evaluated gear.
     */
    abstract finalize(): void;
}

/**
 * Normalize a list of actions for display: ensure at most one is marked as
 * the default (demoting extras to "essential"), promote the configured
 * {@link defaultIntrinsicActionName} when none is marked, and sort the list
 * by context-menu group.
 *
 * @param actions - The actions to normalize; sorted and mutated in place.
 * @returns The same array, normalized and sorted.
 */
function setDefaultAction(actions: SohlAction[]): SohlAction[] {
    // Ensure there is at most one default, all others set to Essential
    let hasDefault = false;
    actions.forEach((act) => {
        const action = act as SohlAction;
        const isDefault =
            action.data.group === SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT;
        if (hasDefault) {
            if (isDefault) {
                action.data.group = SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL;
            }
        } else {
            hasDefault ||= isDefault;
        }
    });

    const collator = new Intl.Collator(sohl.i18n.lang);
    actions.sort((actA: SohlAction, actB: SohlAction) => {
        const groupA = actA.data.group || SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL;
        const groupB = actB.data.group || SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL;
        return collator.compare(groupA, groupB);
    });

    // If after all that, we still don't have a default action, then
    // set the first action as the default
    const firstAction = actions.at(0);
    if (!hasDefault && firstAction) {
        firstAction.data.group = SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT;
        actions = actions.filter(
            (act) => act.shortcode !== firstAction.shortcode,
        );
        actions.unshift(firstAction);
    }

    return actions;
}

/**
 * The base data interface for all Logic classes.
 *
 * Every actor/item data interface (e.g., {@link SohlItemData},
 * {@link SohlActorData}, {@link GearData}) ultimately extends this.
 * The corresponding `SohlDataModel` class implements it via
 * Foundry's schema system.
 * @remarks The base shape of every document's `system` data, reachable as `document.system` and (typed as the interface) `document.logic.data`.
 */
export interface SohlLogicData<
    TParent extends SohlDocument | SohlTokenDocument = SohlDocument,
    TLogic extends SohlLogic<any> = SohlLogic<any>,
> {
    /** The Foundry document (actor or item) this data belongs to, or `null`. */
    parent: TParent | null;
    /** The logic instance built from this data. */
    logic: TLogic;
    /** The owning document's id. */
    id: string;
    /** The owning document's name. */
    name: string;
    /** The owning document's type (its actor or item kind). */
    type: string;
    /**
     * The owning document's globally-unique id, treated as an **opaque**
     * identity token: pass it through (e.g. into chat-card data) and resolve it
     * back to logic via `fvttLogicFromUuid` / `fvttLogicFromUuidSync` — never `fromUuid`
     * it to a Foundry document inside the logic layer.
     */
    uuid: string;
    /** Whether the current user owns the document (edit permission). */
    isOwner: boolean;
    /** The document kind (its actor or item type id). */
    kind: string;
    /** Short identity code for this document. */
    shortcode: string;
    /** Serialized action definitions used to build the logic's `actions` map. */
    actionDefs: SohlAction.Data[];

    // --- Foundry-document port -------------------------------------------
    // These members let the logic layer reach the owning actor's logic, flags,
    // and persistence WITHOUT importing or naming the Foundry document class.
    // The Foundry data model (`SohlDataModel`) implements them by delegating to
    // its `parent` document; tests supply a fake data object.

    /**
     * The logic of the owning actor — this actor's own logic when the data is
     * an actor's, the owning actor's logic when it is an item's, or `null`.
     */
    actorLogic: SohlActorLogic<any> | null;
    /** Read a namespaced flag from the owning document. */
    getFlag(scope: string, key: string): unknown;
    /** Write a namespaced flag on the owning document. */
    setFlag(scope: string, key: string, value: unknown): Promise<unknown>;
    /** Persist a partial update to the owning document (self-mutation only). */
    update(data: object): Promise<unknown>;
}
