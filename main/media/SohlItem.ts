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

import {
    buildActionScope,
    slugifyShortcode,
    subTypeOptionsFromChoices,
    uniqueShortcode,
    type SubTypeOption,
} from "@src/utils/helpers";
import { toFilePath } from "@src/utils/helpers";
import { dialog } from "@src/core/FoundryHelpers";
import { dispatchChatCardAction } from "@src/document/chat/chat-card-dispatch";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlActiveEffect } from "@src/document/effect/foundry/SohlActiveEffect";
import type { SohlContextMenu } from "@src/apps/foundry/SohlContextMenu";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { SohlTriggerContext } from "@src/entity/event/event-trigger";
import { isScriptActionMutationAllowed } from "@src/entity/action/SohlAction";

/**
 * Path to the shared create-document dialog template used by
 * `SohlItem.createDialog` (and the actor counterpart).
 */
const CREATE_ITEM_TEMPLATE = toFilePath(
    "systems/sohl/templates/dialog/create-item.hbs",
);

/**
 * Read the localized subtype options for a document `type` from its registered
 * DataModel. The type's DataModel `subType` field (when present) carries a
 * `{ value: localizationKey }` `choices` map; this resolves that map through the
 * pure {@link subTypeOptionsFromChoices} and localizes each label. Types without
 * a `subType` field yield an empty array — the signal that no subtype is asked.
 *
 * Foundry-boundary: reads `CONFIG.<documentName>.dataModels[type].schema` and
 * `sohl.i18n`; the mapping itself is delegated to the pure helper.
 * @param documentName - The document class name (e.g. `"Item"`, `"Actor"`).
 * @param type - The document subtype whose DataModel to inspect.
 * @returns The localized subtype options (empty when the type has no subtypes).
 */
export function subTypeOptionsForType(
    documentName: string,
    type: string,
): SubTypeOption[] {
    const model = (CONFIG as any)?.[documentName]?.dataModels?.[type];
    const field = model?.schema?.fields?.subType;
    const choices = field?.choices as Record<string, string> | undefined | null;
    if (!choices || typeof choices !== "object") return [];
    return subTypeOptionsFromChoices(choices, (key) => sohl.i18n.localize(key));
}

/**
 * Collect the shortcodes already used by same-type documents in the scope where
 * a new one must be unique: the parent actor's items for an owned item, the
 * world item directory for a world item, or the world actor directory for an
 * actor. Used to suggest and finalize a unique `shortcode` in the create dialog.
 *
 * @param documentName - `"Item"` or `"Actor"`.
 * @param parent - The parent actor for an owned item, else `null`.
 * @param type - The document type whose siblings share the key namespace.
 * @returns The set of taken shortcodes.
 */
function takenShortcodesFor(
    documentName: string,
    parent: any,
    type: string,
): Set<string> {
    const taken = new Set<string>();
    const collection =
        documentName === "Actor" ? (game as any).actors
        : parent ? parent.items
        : (game as any).items;
    for (const doc of collection ?? []) {
        if (doc.type === type) taken.add((doc.system as any)?.shortcode);
    }
    return taken;
}

/**
 * Shared `createDialog` implementation for `SohlItem` and `SohlActor`.
 *
 * Computes the allowed types (excluding the base document type, honoring an
 * optional `types` restriction), decides whether to ask for the type and the
 * subtype (a valid pre-seeded value locks/hides its field), renders the shared
 * create dialog through the {@link dialog} boundary — wiring progressive
 * subtypes via the render hook — and on confirm creates the document and opens
 * its sheet.
 *
 * @param cls - The concrete document class (`SohlItem` / `SohlActor`).
 * @param data - Creation data; `type` / `system.subType` pre-seed and lock.
 * @param createOptions - Document creation options forwarded to `create`.
 * @param options - Dialog options.
 * @param options.types - A restriction of the creatable document types.
 * @returns The created document, or `null` if the dialog was dismissed.
 */
export async function sohlCreateDialog(
    cls: any,
    data: PlainObject = {},
    createOptions: PlainObject = {},
    options: { types?: string[]; [k: string]: any } = {},
): Promise<any> {
    const { types } = options;
    const documentName: string = cls.documentName;
    const parent = (createOptions as PlainObject).parent ?? null;
    const baseType = (foundry as any).CONST?.BASE_DOCUMENT_TYPE ?? "base";

    // Allowed types: every registered type except the base, filtered by `types`.
    const allTypes: string[] = (cls.TYPES as string[]) ?? [];
    if (types && types.length === 0) {
        throw new Error(
            "The array of sub-types to restrict to must not be empty",
        );
    }
    const typeLabels = (CONFIG as any)?.[documentName]?.typeLabels ?? {};
    const documentTypes = allTypes
        .filter((t) => t !== baseType && (!types || types.includes(t)))
        .map((value) => ({
            value,
            label: sohl.i18n.localize(typeLabels[value] ?? value),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

    if (!documentTypes.length) {
        throw new Error("No document types were permitted to be created");
    }

    // A valid pre-seeded type means we do not ask for (and lock) the type.
    const preType = data.type as string | undefined;
    const typeIsValid =
        !!preType && documentTypes.some((t) => t.value === preType);
    const askType = !typeIsValid;
    let type = typeIsValid ? preType! : documentTypes[0].value;

    const subTypeOptions = subTypeOptionsForType(documentName, type);
    const preSubType = (data.system as PlainObject | undefined)?.subType as
        | string
        | undefined;
    const subTypeIsValid =
        !!preSubType && subTypeOptions.some((s) => s.value === preSubType);
    // Only lock the subtype if the type is also locked (a locked type keeps the
    // pre-seeded subtype meaningful); asking the type re-derives subtypes.
    const askSubType = askType || !subTypeIsValid;
    let subType =
        subTypeIsValid ? preSubType!
        : subTypeOptions.length ? subTypeOptions[0].value
        : "";

    const label = sohl.i18n.localize(cls.metadata?.label ?? documentName);
    const title = sohl.i18n.format("DOCUMENT.Create", { type: label });

    // Suggest a unique shortcode from any pre-seeded name (the render hook keeps
    // it in sync as the user types, until they edit the field by hand).
    const initialShortcode =
        data.name ?
            uniqueShortcode(
                slugifyShortcode(data.name as string),
                takenShortcodesFor(documentName, parent, type),
            )
        :   "";

    const result = await dialog({
        title,
        template: CREATE_ITEM_TEMPLATE,
        data: {
            name: (data.name as string) ?? "",
            defaultName: cls.defaultName?.({ type }) ?? "",
            showShortcode: true,
            shortcode: initialShortcode,
            type,
            types: Object.fromEntries(
                documentTypes.map((t) => [t.value, t.label]),
            ),
            askType,
            subtype: subType,
            subtypes: Object.fromEntries(
                subTypeOptions.map((s) => [s.value, s.label]),
            ),
            hasSubtypes: subTypeOptions.length > 0,
            askSubType,
            hasFolders: false,
            folders: {},
        },
        buttons: [
            {
                action: "create",
                label: title,
                icon: "fa-solid fa-check",
                default: true,
            },
        ],
        render: (element: HTMLElement) => {
            const typeSelect = element.querySelector<HTMLSelectElement>(
                'select[name="type"]',
            );
            const nameInput =
                element.querySelector<HTMLInputElement>('input[name="name"]');
            const shortcodeInput = element.querySelector<HTMLInputElement>(
                'input[name="shortcode"]',
            );

            // Keep the shortcode in sync with the name (and the selected type's
            // uniqueness scope) until the user edits the shortcode by hand.
            let shortcodeEdited = false;
            const syncShortcode = () => {
                if (!shortcodeInput || shortcodeEdited) return;
                const curType = typeSelect?.value || type;
                const base = slugifyShortcode(nameInput?.value ?? "");
                shortcodeInput.value =
                    base ?
                        uniqueShortcode(
                            base,
                            takenShortcodesFor(documentName, parent, curType),
                        )
                    :   "";
            };
            shortcodeInput?.addEventListener("input", () => {
                shortcodeEdited = true;
            });
            nameInput?.addEventListener("input", syncShortcode);

            if (typeSelect) {
                typeSelect.addEventListener("change", (ev) => {
                    const chosen = (ev.target as HTMLSelectElement).value;
                    repopulateSubtypes(element, documentName, chosen);
                    syncShortcode();
                });
                // Ensure the subtype control matches the currently-selected type
                // on first render too (covers the pre-seeded-and-locked case).
                repopulateSubtypes(element, documentName, typeSelect.value);
            }
        },
        callback: (formData: PlainObject) => {
            const chosenType =
                askType ? (formData.type as string) || type : type;
            const options = subTypeOptionsForType(documentName, chosenType);
            let chosenSubType =
                askSubType ? ((formData.subtype as string) ?? "") : subType;
            if (!options.some((s) => s.value === chosenSubType)) {
                chosenSubType = options[0]?.value ?? "";
            }
            const name = ((formData.name as string) ?? "").trim();
            const shortcode = ((formData.shortcode as string) ?? "").trim();
            const folder = (formData.folder as string) || undefined;
            return {
                name,
                type: chosenType,
                subType: chosenSubType,
                shortcode,
                folder,
            };
        },
    });

    if (!result) return null;

    type = result.type;
    subType = result.subType;

    // Finalize the `(type, shortcode)` key: derive from the name (then the type)
    // when left blank, and make it unique in scope. `_preCreate` is the backstop,
    // but resolving it here keeps the human create flow off the reject path.
    let shortcode = slugifyShortcode(result.shortcode || result.name);
    if (!shortcode) {
        shortcode = slugifyShortcode(cls.defaultName?.({ type }) ?? "") || type;
    }
    shortcode = uniqueShortcode(
        shortcode,
        takenShortcodesFor(documentName, parent, type),
    );

    const createData: PlainObject = {
        name: result.name || (cls.defaultName?.({ type }) ?? "New Item"),
        type,
    };
    const system: PlainObject = { shortcode };
    if (subType) system.subType = subType;
    createData.system = system;
    if (result.folder) createData.folder = result.folder;

    const created = await cls.create(createData, {
        parent: (createOptions as PlainObject).parent ?? null,
        ...createOptions,
    });
    (created as any)?.sheet?.render(true);
    return created ?? null;
}

/**
 * Rebuild the create-dialog's `#subtype-select` options from `type`'s DataModel
 * subtype choices and toggle the subtype form-group's visibility. Called on
 * initial render and on every type change.
 * @param element - The dialog root element.
 * @param documentName - The document class name (`"Item"` / `"Actor"`).
 * @param type - The currently-selected document type.
 */
function repopulateSubtypes(
    element: HTMLElement,
    documentName: string,
    type: string,
): void {
    const group = element.querySelector<HTMLElement>("#subtypes");
    const select = element.querySelector<HTMLSelectElement>("#subtype-select");
    if (!group || !select) return;
    const options = subTypeOptionsForType(documentName, type);
    if (!options.length) {
        group.style.display = "none";
        select.innerHTML = "";
        return;
    }
    group.style.display = "";
    const previous = select.value;
    select.innerHTML = "";
    for (const opt of options) {
        const el = document.createElement("option");
        el.value = opt.value;
        el.textContent = opt.label;
        select.appendChild(el);
    }
    if (options.some((o) => o.value === previous)) select.value = previous;
}

// NOTE: The Foundry-free contracts (SohlItemLogic, SohlItemData, SohlItemBaseLogic)
// now live in src/document/item/logic/SohlItemBaseLogic.ts and are re-exported here.
/**
 * Base class for all Item documents in the SoHL system — affiliations,
 * afflictions, gear (armor, weapons, containers, misc, projectiles,
 * concoctions), combat techniques, mysteries, mystical abilities, skills,
 * traits, and traumas.
 *
 * Like `SohlActor`, the typed game-rules surface lives on the item's
 * logic object: prefer `item.logic` (equivalently `item.system.logic`) and the
 * typed `item.logic.data` ({@link sohl.document.item.logic.SohlItemData}) over reaching into
 * `item.system` directly.
 *
 * @internal The Foundry document layer is an implementation detail; author-facing
 * code reaches the item through the logic layer (`sohl.itemLogics`, `item.logic`).
 */
export class SohlItem extends Item {
    /**
     * Get the logic object for this item.
     * @remarks
     * This is a convenience accessor to avoid having to access `this.system.logic`
     */
    get logic(): SohlItemLogic<any> {
        return (this.system as any).logic as SohlItemLogic<any>;
    }

    /**
     * Present a dialog to create a new Item, adapted from Foundry's
     * `Item.createDialog` for the SoHL progressive type → subtype flow.
     *
     * The clicked control's `data-type` / `data-sub-type` pre-seed `data.type`
     * and `data.system.subType`; a pre-seeded, valid value locks (hides) that
     * field so the dialog only asks for what is not already known. The subtype
     * list is repopulated from the chosen type's DataModel `subType` choices
     * whenever the type changes (wired via the `dialog` render hook). On
     * confirm the item is created and its sheet opened.
     *
     * @param data - Document creation data; `type` and `system.subType` pre-seed.
     * @param createOptions - Document creation options (`parent`, `pack`, …).
     * @param options - Dialog options; `types` restricts the selectable subtypes.
     * @param options.types - A restriction of the creatable document types.
     * @returns The created item, or `null` if the dialog was dismissed.
     */
    static override async createDialog(
        this: any,
        data: PlainObject = {},
        createOptions: PlainObject = {},
        options: { types?: string[]; [k: string]: any } = {},
    ): Promise<any> {
        return sohlCreateDialog(this as any, data, createOptions, options);
    }

    /**
     * Get the context menu options for a specific SohlItem document.
     * @param doc - The SohlItem document to get context options for.
     * @returns The context menu options for the specified SohlItem document.
     */
    protected static _getContextOptions(
        doc: SohlItem,
    ): SohlContextMenu.Entry[] {
        return doc.getContextOptions();
    }

    /**
     * The context-menu options — the actions currently available — for this
     * item.
     *
     * @remarks
     * One entry per action whose `visible` predicate currently passes (an
     * action's `trigger` / domain preconditions can hide it); `SCRIPT` actions
     * are additionally permission-gated when executed. Use this to discover
     * which actions can be performed on the item.
     *
     * @returns The available context-menu entries.
     */
    getContextOptions(): SohlContextMenu.Entry[] {
        return this.logic.getContextOptions();
    }

    /**
     * Authoring gate: block non-GM users from adding, removing, or
     * modifying SCRIPT entries in `system.actionDefs`. SCRIPT actions
     * run unsandboxed JavaScript, so authorship is restricted to the GM.
     * INTRINSIC actions and non-actionDefs updates are unaffected.
     * @param changes - The changes about to be applied.
     * @param options - Foundry update options.
     * @param user - The user attempting the update.
     * @returns `false` to cancel the update, otherwise delegates to super.
     */
    protected override async _preUpdate(
        changes: PlainObject,
        options: PlainObject,
        user: User,
    ): Promise<boolean | void> {
        const allowed = await super._preUpdate(
            changes as any,
            options as any,
            user as any,
        );
        if (allowed === false) return false;
        const newActionDefs = (changes as any)?.system?.actionDefs;
        if (newActionDefs !== undefined) {
            const oldActionDefs = (this.system as any)?.actionDefs;
            if (
                !isScriptActionMutationAllowed(
                    oldActionDefs,
                    newActionDefs,
                    user,
                )
            ) {
                sohl.log.warn(
                    `Refusing actionDefs update on "${this.name}": only the GM may modify SCRIPT action entries.`,
                    { item: this.id, user: (user as any)?.id },
                );
                (globalThis as any).ui?.notifications?.warn?.(
                    "Only the GM can modify scripted actions on this item.",
                );
                return false;
            }
        }
        return undefined;
    }

    /**
     * Set of phases for which `applyActiveEffects` has already run in the
     * current data-preparation cycle. Cleared at the top of the actor's
     * `prepareBaseData()`. Mirrors Foundry's `Actor#_completedActiveEffectPhases`.
     */
    protected _completedActiveEffectPhases?: Set<string>;

    /**
     * Effects living elsewhere whose `targets` include this item. Walks
     * sibling items and the owning actor. Phaseless; the caller filters by
     * `change.phase` when iterating changes.
     * @returns The effects on siblings and the actor that target this item.
     */
    transferredActiveEffects(): SohlActiveEffect[] {
        const out: SohlActiveEffect[] = [];
        const actor = this.actor;
        if (!actor) return out;

        for (const sibling of actor.items.values() as Iterable<SohlItem>) {
            if (sibling === this) continue;
            for (const effect of sibling.effects.values() as Iterable<SohlActiveEffect>) {
                if (effect.targets.includes(this)) out.push(effect);
            }
        }
        for (const effect of actor.effects.values() as Iterable<SohlActiveEffect>) {
            if (effect.targets.includes(this)) out.push(effect);
        }
        return out;
    }

    /**
     * All effects applicable to this item: own self-targeting effects plus
     * those transferred from siblings / the actor via scope. Mirrors the
     * shape of Foundry's `Actor#allApplicableEffects` generator so the same
     * dispatch loop can consume both.
     */
    *allApplicableEffects(): Generator<SohlActiveEffect> {
        for (const effect of this.effects.values() as Iterable<SohlActiveEffect>) {
            if (effect.targets.includes(this)) yield effect;
        }
        for (const effect of this.transferredActiveEffects()) yield effect;
    }

    /**
     * Walk `allApplicableEffects()`, filter changes by `phase`, sort by
     * priority, and dispatch each to the static `applyChange` path
     * (which routes through `SohlActiveEffect._applyChangeUnguided` for
     * SoHL-prefixed keys). Mirrors Foundry's `Actor#applyActiveEffects`.
     * @param phase - The change phase whose effect changes to apply this pass.
     */
    applyActiveEffects(phase: string): void {
        const AEClass = foundry.documents.ActiveEffect as any;
        if (typeof phase !== "string") return;
        if (!(phase in (AEClass.CHANGE_PHASES ?? {}))) {
            sohl.log.warn(
                `Unknown phase "${phase}" passed to SohlItem.applyActiveEffects`,
            );
            return;
        }
        this._completedActiveEffectPhases ??= new Set<string>();
        if (this._completedActiveEffectPhases.has(phase)) return;
        this._completedActiveEffectPhases.add(phase);

        interface Pending {
            effect: SohlActiveEffect;
            change: any;
        }
        const pending: Pending[] = [];

        for (const effect of this.allApplicableEffects()) {
            if (!(effect as any).active) continue;
            const effectChanges =
                ((effect as any).system?.changes as any[]) ?? [];
            for (const change of effectChanges) {
                if (!change.key || change.phase !== phase) continue;
                pending.push({ effect, change });
            }
        }
        pending.sort(
            (a, b) =>
                ((a.change.priority as number) ?? 0) -
                ((b.change.priority as number) ?? 0),
        );

        for (const { effect, change } of pending) {
            try {
                const copy = foundry.utils.deepClone(change);
                (copy as any).effect = effect;
                (effect.constructor as any).applyChange(this, copy, {});
            } catch (err) {
                sohl.log.warn(
                    `Effect "${(effect as any).name}" change "${change.key}" failed on ${this.uuid}:`,
                    err as PlainObject,
                );
            }
        }
    }

    /**
     * Helper method to handle chat card button clicks.
     * @param btn - The button element that was clicked.
     */
    async onChatCardButton(btn: HTMLElement): Promise<void> {
        // Only an owner of this item (a GM owns all) may run a chat-card action
        // against it; the render-time gate is UX only and a direct or
        // synthesized call bypasses it (issue #167). Mirrors onChatCardEditAction.
        if (!this.isOwner) return;
        const actionName = btn.dataset.action;
        if (!actionName) return;

        const context = new SohlActionContext({
            speaker: this.logic.speaker,
            type: actionName,
            title: btn.textContent?.trim() ?? actionName,
            scope: buildActionScope(
                btn.dataset,
                (this.logic as any).actorLogic ?? this.logic,
            ),
        });
        const action =
            this.logic.actions.get(actionName) ??
            [...this.logic.actions.values()].find(
                (act) =>
                    act.data.executor === actionName ||
                    act.data.title === actionName,
            );

        if (action) {
            await action.execute(context);
            return;
        }

        const fn = (this.logic as any)[actionName];
        if (typeof fn === "function") {
            await fn.call(this.logic, context);
        } else {
            sohl.log.warn(
                `Chat card action "${actionName}" not found on item "${this.name}".`,
            );
        }
    }

    /**
     * Helper method to handle chat card edit actions.
     * @param btn - The button element that was clicked.
     */
    async onChatCardEditAction(btn: HTMLElement): Promise<void> {
        if (!this.isOwner) return;
        await dispatchChatCardAction(this.logic, btn);
    }

    /**
     * Handle a trigger dispatched by the SoHL event queue.
     * Override in subclasses to implement item-specific trigger handling.
     * @param kind - Subscription kind identifier
     * @param _context - Trigger context (discriminated by `context.name`)
     * @param _payload - Optional context data attached when subscribing
     */
    async handleSohlEvent(
        kind: string,
        _context: SohlTriggerContext,
        _payload?: Record<string, unknown>,
    ): Promise<void> {
        console.warn(
            `SoHL | ${this.name} (Item) received unhandled event "${kind}"`,
        );
    }

    /**
     * The SohlActor that owns this item, or null if it is unowned.
     */
    override get actor(): SohlActor | null {
        return this.parent;
    }
}

// The Foundry-free logic-layer contracts (SohlItemLogic, SohlItemData,
// SohlItemBaseLogic) live in the logic layer and are their sole namespace home
// (`sohl.document.item.logic.*`). They are imported here for this module's own
// use only — not re-exported, so the Foundry layer does not become a second,
// canonical home for them in the API tree.
import type { SohlItemLogic } from "@src/document/item/logic/SohlItemBaseLogic";
