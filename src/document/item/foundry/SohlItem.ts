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

import {
    slugifyShortcode,
    subTypeOptionsFromChoices,
    uniqueShortcode,
    type SubTypeOption,
} from "@src/utils/helpers";
import { toFilePath } from "@src/utils/helpers";
import {
    dialog,
    fvttRenderSheet,
    fvttDiscoverArchetypes,
    fvttResolveUuidAsync,
} from "@src/core/FoundryHelpers";
import {
    buildArchetypeOptions,
    resolveArchetypes,
    resolveCreateIdentity,
    stripDocArchetypeFlag,
    type ArchetypeCandidate,
    type ArchetypeIdentity,
} from "@src/entity/archetype/archetype";
import { dispatchChatCardAction } from "@src/document/chat/chat-card-dispatch";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlActiveEffect } from "@src/document/effect/foundry/SohlActiveEffect";
import type { SohlContextMenu } from "@src/apps/foundry/SohlContextMenu";
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
 * Label for the Create-dialog **(none)** archetype option — the deliberate
 * blank-slate choice (for a world designer authoring a new kind of being/item).
 */
const ARCHETYPE_NONE_LABEL = "(none)";

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

    // Discover archetype templates once (world + matching compendium packs); the
    // pure resolver re-filters this list per the dialog's current (type, subType)
    // as the user changes them — no further Foundry access on those changes.
    const archetypeCandidates = await fvttDiscoverArchetypes(documentName);
    const initialArchetypes = buildArchetypeOptions(
        resolveArchetypes(archetypeCandidates, type, subType),
        ARCHETYPE_NONE_LABEL,
    );

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
            archetype: initialArchetypes.defaultValue,
            archetypes: Object.fromEntries(
                initialArchetypes.options.map((o) => [o.value, o.label]),
            ),
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
            const archetypeSelect =
                element.querySelector<HTMLSelectElement>("#archetype-select");
            const subtypeSelect =
                element.querySelector<HTMLSelectElement>("#subtype-select");

            // Archetype-first defaulting (#643): the Name / Shortcode fields are
            // optional and pre-fill from the chosen archetype's own name /
            // shortcode, staying live until the user edits them by hand. A
            // pre-seeded `data.name` counts as an edit so it is never clobbered.
            let nameEdited = !!data.name;
            let shortcodeEdited = false;

            // The currently-selected archetype's identity, resolved live from the
            // discovered candidates for the current (type, subType) — `undefined`
            // for the **(none)** blank-slate choice.
            const selectedArchetype = (): ArchetypeIdentity | undefined => {
                const uuid = archetypeSelect?.value;
                if (!uuid) return undefined;
                const curType = typeSelect?.value || type;
                const curSubType = subtypeSelect?.value ?? subType;
                const winner = resolveArchetypes(
                    archetypeCandidates,
                    curType,
                    curSubType,
                ).find((c) => c.uuid === uuid);
                return winner ?
                        { name: winner.name, shortcode: winner.shortcode }
                    :   undefined;
            };

            // Recompute the (un-edited) Name and Shortcode defaults from the
            // current archetype selection and uniqueness scope. With an archetype
            // chosen, Name mirrors it and Shortcode is its own (uniquified); with
            // **(none)** chosen, Name is left blank (its placeholder shows the
            // class default) and Shortcode derives from whatever Name holds.
            const recomputeDefaults = () => {
                const curType = typeSelect?.value || type;
                const arch = selectedArchetype();
                if (nameInput && !nameEdited) {
                    nameInput.value = arch ? arch.name : "";
                }
                if (shortcodeInput && !shortcodeEdited) {
                    const base =
                        arch ?
                            arch.shortcode || slugifyShortcode(arch.name)
                        :   slugifyShortcode(nameInput?.value ?? "");
                    shortcodeInput.value =
                        base ?
                            uniqueShortcode(
                                base,
                                takenShortcodesFor(
                                    documentName,
                                    parent,
                                    curType,
                                ),
                            )
                        :   "";
                }
            };

            nameInput?.addEventListener("input", () => {
                nameEdited = true;
                recomputeDefaults();
            });
            shortcodeInput?.addEventListener("input", () => {
                shortcodeEdited = true;
            });
            archetypeSelect?.addEventListener("change", recomputeDefaults);

            // Re-derive the archetype list from the current (type, subType), and
            // reset the selection to the new default when the current choice no
            // longer matches.
            const syncArchetypes = () => {
                const curType = typeSelect?.value || type;
                const curSubType = subtypeSelect?.value ?? subType;
                repopulateArchetypes(
                    element,
                    archetypeCandidates,
                    curType,
                    curSubType,
                );
            };

            subtypeSelect?.addEventListener("change", () => {
                syncArchetypes();
                recomputeDefaults();
            });

            if (typeSelect) {
                typeSelect.addEventListener("change", (ev) => {
                    const chosen = (ev.target as HTMLSelectElement).value;
                    repopulateSubtypes(element, documentName, chosen);
                    syncArchetypes();
                    recomputeDefaults();
                });
                // Ensure the subtype control matches the currently-selected type
                // on first render too (covers the pre-seeded-and-locked case).
                repopulateSubtypes(element, documentName, typeSelect.value);
            }
            // Align archetypes with the (possibly repopulated) subtype on first
            // render, then seed the Name / Shortcode defaults from the initial
            // (default) archetype selection.
            syncArchetypes();
            recomputeDefaults();
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
            const archetype = ((formData.archetype as string) ?? "").trim();
            return {
                name,
                type: chosenType,
                subType: chosenSubType,
                shortcode,
                folder,
                archetype,
            };
        },
    });

    if (!result) return null;

    type = result.type;
    subType = result.subType;

    // Resolve the final Name and Shortcode base under the archetype-first rules
    // (#643): a blank Name/Shortcode defaults to the chosen archetype's own
    // name/shortcode; **(none)** falls back to the class default and a
    // name-derived shortcode. The archetype's identity comes from the discovered
    // candidate list (still in scope) so a field cleared back to blank still
    // resolves to the archetype's value.
    const archetypeInfo: ArchetypeIdentity | undefined =
        result.archetype ?
            (() => {
                const c = archetypeCandidates.find(
                    (a) => a.uuid === result.archetype,
                );
                return c ? { name: c.name, shortcode: c.shortcode } : undefined;
            })()
        :   undefined;

    const { name: chosenName, shortcodeBase } = resolveCreateIdentity(
        result.name,
        result.shortcode,
        archetypeInfo,
        cls.defaultName?.({ type }) ?? "",
        type,
    );

    // Make the `(type, shortcode)` key unique in scope. `_preCreate` is the
    // backstop, but resolving it here keeps the human create flow off the reject
    // path.
    const shortcode = uniqueShortcode(
        shortcodeBase,
        takenShortcodesFor(documentName, parent, type),
    );

    let createData: PlainObject;
    if (result.archetype) {
        // Seed from the chosen archetype: clone its `toObject()` (embedded
        // documents included, so a being arrives fully populated), clean the
        // copy the way an import does, strip the archetype marker (an instance
        // is not itself a template), then overlay the dialog's Name/Shortcode.
        createData = await seedFromArchetype(
            result.archetype,
            chosenName,
            type,
            subType,
            shortcode,
        );
        if (result.folder) createData.folder = result.folder;
    } else {
        createData = { name: chosenName, type };
        const system: PlainObject = { shortcode };
        if (subType) system.subType = subType;
        createData.system = system;
        if (result.folder) createData.folder = result.folder;
    }

    const created = await cls.create(createData, {
        parent: (createOptions as PlainObject).parent ?? null,
        ...createOptions,
    });
    void fvttRenderSheet(created as any);
    return created ?? null;
}

/**
 * Build create-data by cloning an archetype document, addressed by UUID. The
 * source's `toObject()` carries its embedded documents (items, effects), so a
 * being seeds fully populated. The copy is cleaned like an import — fresh id,
 * no folder/sort/ownership carried over — its `flags.sohl.docArchetype` marker
 * is stripped (an instance is not itself an archetype; see
 * {@link sohl.entity.archetype.stripDocArchetypeFlag}), and the dialog's
 * Name / Type / SubType / Shortcode are overlaid. `_preCreate` remains the
 * backstop for `(type, shortcode)` uniqueness.
 *
 * @param uuid - The chosen archetype's UUID.
 * @param name - The dialog's chosen name.
 * @param type - The chosen document type.
 * @param subType - The chosen subtype (`""` when the type has none).
 * @param shortcode - The finalized, unique shortcode.
 * @returns The seeded create-data (empty-ish object if the UUID does not resolve).
 */
async function seedFromArchetype(
    uuid: string,
    name: string,
    type: string,
    subType: string,
    shortcode: string,
): Promise<PlainObject> {
    const src = await fvttResolveUuidAsync(uuid);
    const seed = (src?.toObject?.() ?? {}) as PlainObject;
    delete seed._id;
    delete seed.folder;
    delete seed.sort;
    delete seed.ownership;
    if (seed._stats && typeof seed._stats === "object") {
        delete (seed._stats as PlainObject).duplicateSource;
    }
    stripDocArchetypeFlag(seed);
    seed.name = name;
    seed.type = type;
    const system = (
        seed.system && typeof seed.system === "object" ?
            seed.system
        :   {}) as PlainObject;
    system.shortcode = shortcode;
    if (subType) system.subType = subType;
    seed.system = system;
    return seed;
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

/**
 * Rebuild the create-dialog's `#archetype-select` options for the current
 * `(type, subType)` from the pre-discovered candidate list, delegating the
 * filter/dedup/winner logic to the Foundry-free
 * {@link sohl.entity.archetype.resolveArchetypes}. The current choice is kept
 * when it still matches; otherwise the selection resets to the new default
 * (the highest-priority archetype, or **(none)** when none exists). Called on
 * initial render and on every type/subtype change.
 *
 * @param element - The dialog root element.
 * @param candidates - Every archetype candidate discovered for the document type.
 * @param type - The currently-selected document type.
 * @param subType - The currently-selected subtype (`""` when the type has none).
 */
function repopulateArchetypes(
    element: HTMLElement,
    candidates: readonly ArchetypeCandidate[],
    type: string,
    subType: string,
): void {
    const select =
        element.querySelector<HTMLSelectElement>("#archetype-select");
    if (!select) return;
    const { options, defaultValue } = buildArchetypeOptions(
        resolveArchetypes(candidates, type, subType),
        ARCHETYPE_NONE_LABEL,
    );
    const previous = select.value;
    select.innerHTML = "";
    for (const opt of options) {
        const el = document.createElement("option");
        el.value = opt.value;
        el.textContent = opt.label;
        select.appendChild(el);
    }
    select.value =
        options.some((o) => o.value === previous) ? previous : defaultValue;
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
        await dispatchChatCardAction(this.logic, btn);
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

    /**
     * Create a new embedded Active Effect on this item. Called by the sheet's
     * effect-create control (see the {@link SohlDataModel} sheet mixin).
     *
     * @param data - Partial `ActiveEffect` creation data (name, type, img, …).
     * @returns The created effect, or `undefined` if creation did not apply.
     */
    async createEffect(
        data: Record<string, unknown> = {},
    ): Promise<SohlActiveEffect | undefined> {
        const created = await this.createEmbeddedDocuments("ActiveEffect", [
            data,
        ] as any);
        return created?.[0] as unknown as SohlActiveEffect | undefined;
    }
}

// The Foundry-free logic-layer contracts (SohlItemLogic, SohlItemData,
// SohlItemBaseLogic) live in the logic layer and are their sole namespace home
// (`sohl.document.item.logic.*`). They are imported here for this module's own
// use only — not re-exported, so the Foundry layer does not become a second,
// canonical home for them in the API tree.
import type { SohlItemLogic } from "@src/document/item/logic/SohlItemBaseLogic";
