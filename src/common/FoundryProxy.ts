/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
    FilePath,
    toHTMLWithContent,
    toHTMLWithTemplate,
    HTMLString,
} from "@utils/helpers";

/*
 * =====================================================
 * Foundry VTT Wrapper Functions
 * =====================================================
 * These functions are wrappers around Foundry VTT's core functions
 * to enable easier mocking and access from Typescript.
 */

/**
 * Resolves a UUID to its corresponding Document or compendium index entry, using a synchronous lookup.
 *
 * @param {string} uuid - A string UUID identifying the Document to resolve. May be absolute or relative.
 * @param {object} options - Optional settings to control resolution behavior.
 * @param {Document} [options.relative] - A Document to use as the base for resolving relative UUIDs.
 * @param {boolean} [options.invalid=false] - If true, allows retrieval of documents marked as invalid.
 * @param {boolean} [options.strict=true] - If true, throws an error if the UUID cannot be resolved synchronously.
 *
 * @returns {Document} The resolved Document object, or a compendium index entry if the target resides in a compendium.
 * Returns `null` if the UUID is null/undefined or cannot be resolved and `strict` is false.
 *
 * @throws An error if the UUID cannot be resolved synchronously and `strict` is true.
 */
export function fromUuidSync(uuid: string, options: any = {}): any {
    // @ts-expect-error
    return foundry.utils.fromUuidSync(uuid, options);
}

/**
 * Asynchronously resolves a UUID to its corresponding Document.
 *
 * @param {string} uuid - A string UUID identifying the Document to retrieve. May be absolute or relative.
 * @param {object} options - Optional settings to control resolution behavior.
 * @param {Document} [options.relative] - A Document to use as the base for resolving relative UUIDs.
 * @param {boolean} [options.invalid=false] - If true, allows retrieval of documents marked as invalid.
 *
 * @returns {Promise<any>} A Promise that resolves to the retrieved Document. Resolves to `null` if the UUID
 * cannot be resolved.
 */
export async function fromUuid(uuid: string, options: any = {}): Promise<any> {
    // @ts-expect-error
    return await foundry.utils.fromUuid(uuid, options);
}

// Dialog-related types
export type DialogButtonCallback = (
    event: PointerEvent | SubmitEvent,
    button: HTMLButtonElement,
    dialog: HTMLDialogElement,
) => Promise<any>;

export interface DialogButton {
    action: string;
    label: string;
    icon: string;
    class: string;
    default?: boolean;
    callback: DialogButtonCallback;
}

export type DialogRenderCallback = (
    event: Event,
    dialogElement: HTMLDialogElement,
) => Promise<void>;

export type DialogCloseCallback = (
    event: Event,
    dialog: Record<string, any>,
) => Promise<void>;

export type DialogSubmitCallback = (result: any) => Promise<void>;

export interface DialogConfig {
    template?: FilePath;
    title?: string;
    content?: HTMLString;
    data?: PlainObject;
    modal?: boolean;
    rejectClose?: boolean;
    render?: DialogRenderCallback;
    close?: DialogCloseCallback;
    submit?: DialogSubmitCallback;
    ok?: Partial<DialogButton>;
    yes?: Partial<DialogButton>;
    no?: Partial<DialogButton>;
    buttons?: Partial<DialogButton>[];
}

export interface AwaitDialogResult {
    value: any;
    action: string;
}

/**
 * @summary Create a dialog with a yes/no option.
 * @description
 * This function creates a dialog with yes and no buttons. If the user clicks the yes button,
 * the promise resolves to `true`. If the user clicks the no button, the promise resolves to `false`.
 * If the user dismisses the dialog, the promise resolves to `null`, or rejects with an error if `rejectClose` is `true`.
 *
 * @param {object} config - The configuration object for the dialog.
 * @returns A promise that resolves to the result of the button callback, or `null` if
 *          the dialog was dismissed. If `rejectClose` is `true` the promise will be rejected with an error.
 */
export async function yesNoDialog(
    config: Partial<DialogConfig> = {},
): Promise<any | null> {
    if (!config.template) {
        if (!config.content) {
            throw new Error("Dialog content or template is required");
        }
        config.content = await toHTMLWithContent(config.content, config.data);
    } else {
        config.content = await toHTMLWithTemplate(config.template, config.data);
    }
    return await foundry.applications.api.DialogV2.confirm(config as any);
}

/**
 * @summary Create a dialog with an OK option.
 * @description
 * This function creates a dialog with an OK button. If the user clicks the OK button,
 * the promise resolves to `true`. If the user dismisses the dialog, the promise resolves to `null`,
 * or rejects with an error if `rejectClose` is `true`.
 *
 * @param {object} config - The configuration object for the dialog.
 * @returns A promise that resolves to the result of the button callback, or `null` if
 *          the dialog was dismissed. If `rejectClose` is `true` the promise will be rejected with an error.
 */
export async function okDialog(
    config: Partial<DialogConfig> = {},
): Promise<any | null> {
    if (!config.template) {
        if (!config.content) {
            throw new Error("Dialog content or template is required");
        }
        config.content = await toHTMLWithContent(config.content, config.data);
    } else {
        config.content = await toHTMLWithTemplate(config.template, config.data);
    }
    return await (foundry.applications.api.DialogV2 as any).ok(config);
}

/**
 * @summary Create a dialog with a set of input fields to collect user input.
 * @description
 * This function creates a dialog with input fields and an OK button.  When the OK button is clicked,
 * the promise resolves to an object containing the values of the input fields.
 * If the user dismisses the dialog, the promise resolves to `null`, or rejects with an error if `rejectClose` is `true`.
 *
 * @param config - The configuration object for the dialog.
 * @returns A promise that resolves to a Foundry VTT FormDataExtended object if OK is pressed, or `null` if
 *          the dialog was dismissed. If `rejectClose` is `true` the promise will be rejected with an error.
 */
export async function inputDialog(
    config: Partial<DialogConfig & { callback: DialogButtonCallback }> = {},
): Promise<PlainObject | null> {
    if (!config.template) {
        if (!config.content) {
            throw new Error("Dialog content or template is required");
        }
        config.content = await toHTMLWithContent(config.content, config.data);
    } else {
        config.content = await toHTMLWithTemplate(config.template, config.data);
    }
    return await (foundry.applications.api.DialogV2 as any).input(config);
}

/**
 * @summary Create a dialog.
 * @description
 * This function creates a dialog with a set of buttons. When a button is clicked,
 * the promise resolves to the value of the button that was clicked.
 * If the user dismisses the dialog, the promise resolves to `null`, or rejects with an error if `rejectClose` is `true`.
 *
 * @param config - The configuration object for the dialog.
 * @returns A Promist containing the identifier of the button used to submit the dialog, or the value
 *          returned by that button's callback.  If `rejectClose` is `true` the promise will be rejected with an error.
 */
export async function awaitDialog(config: Partial<DialogConfig>): Promise<any> {
    if (!config.template) {
        if (!config.content) {
            throw new Error("Dialog content or template is required");
        }
        config.content = await toHTMLWithContent(config.content, config.data);
    } else {
        config.content = await toHTMLWithTemplate(config.template, config.data);
    }
    return await foundry.applications.api.DialogV2.wait(config as any);
}

/**
 * Unregister a custom sheet for a Foundry document class.
 * @param {typeof foundry.abstract.Document} documentClass - The document class.
 * @param {typeof FormApplication} sheetClass - The sheet class.
 * @param {Object} options - Options for unregistering the sheet.
 * @param {string[]} [options.types] - Specific types to unregister.
 */
export function unregisterSheet(
    documentClass: any,
    sheetClass: any,
    { types }: { types?: string[] },
): void {
    DocumentSheetConfig.unregisterSheet(documentClass, "sohl", sheetClass, {
        types,
    });
}

/**
 * Utility class containing various helper methods for the SoHL system.
 */

/**
 * Determines the identity of the current token/actor that is in combat.
 * If token is specified, tries to use token (and will allow it regardless if user is GM.),
 * otherwise returned token will be the combatant whose turn it currently is.
 *
 * @param {Token|null} [token=null] - The token to check.
 * @param {boolean} [forceAllow=false] - Whether to force allow the token.
 * @returns {{ token: Token, actor: Actor }|null} The token and actor in combat, or null if not found.
 */
export function getTokenInCombat(
    token: any = null,
    forceAllow = false,
): { token: any; actor: any } | null {
    if (token && ((game as any).user?.isGM || forceAllow)) {
        return { token, actor: token.actor };
    }

    if (!(game as any).combat?.started) {
        sohl.log.uiWarn("No active combat.");
        return null;
    }

    if ((game as any).combat.combatants.size === 0) {
        sohl.log.uiWarn(`No combatants.`);
        return null;
    }

    const combatant = (game as any).combat.combatant;

    if (combatant.isDefeated) {
        sohl.log.uiWarn(`Combatant ${combatant.token.name} has been defeated`);
        return null;
    }

    if (token && token.id !== combatant.token.id) {
        sohl.log.uiWarn(`${combatant.token.name} is not the current combatant`);
        return null;
    }

    if (!combatant.actor.isOwner) {
        sohl.log.uiWarn(
            `You do not have permissions to control the combatant ${combatant.token.name}.`,
        );
        return null;
    }

    token = canvas.tokens.get(combatant.token.id);
    if (!token) {
        throw new Error(`Token ${combatant.token.id} not found on canvas`);
    }

    return { token, actor: combatant.actor };
}

/**
 * Retrieves documents from specified packs based on document name and type.
 *
 * @param packNames - The names of the packs to search.
 * @param options
 * @param options.documentName The document name to search for.
 * @param options.docType The document type to filter by.
 * @returns A promise resolving to an array of documents.
 */
export async function getDocsFromPacks(
    packNames: string[],
    options: { documentName?: string; docType?: string } = {
        documentName: "Item",
    },
): Promise<any[]> {
    let allDocs: any[] = [];
    for (let packName of packNames) {
        const pack = ((game as any).packs as any)?.get(packName);
        if (!pack) continue;
        if (pack.documentName !== options.documentName) continue;
        const query: PlainObject = {};
        if (options.docType) {
            query.type = options.docType;
        }
        const items = await pack.getDocuments(query);
        allDocs.push(...items.map((it: any) => it.toObject()));
    }
    return allDocs;
}

/**
 * Retrieves a document from specified packs based on name and optional type.
 *
 * @param  docName The name of the document to retrieve.
 * @param  packNames The names of the packs to search.
 * @param options
 * @param options.documentName The document name to search for.
 * @param options.docType The document type to filter by.
 * @param options.keepId Whether to keep the original ID.
 * @returns A promise resolving to the document data, or undefined if not found.
 */
export async function getDocumentFromPacks(
    docName: string,
    packNames: string[],
    options: { documentName?: string; docType?: string; keepId?: boolean } = {
        docType: "Item",
        keepId: false,
    },
): Promise<Optional<any>> {
    let data;
    const allDocs = await getDocsFromPacks(packNames, {
        documentName: options.documentName,
        docType: options.docType,
    });
    const doc = allDocs?.find((it: any) => it.name === docName);
    if (doc) {
        data = doc.toObject();
        if (!options.keepId) data._id = foundry.utils.randomID();
        delete data.folder;
        delete data.sort;
        if (doc.pack)
            foundry.utils.setProperty(
                data,
                "_stats.compendiumSource",
                doc.uuid,
            );
        if ("ownership" in data) {
            data.ownership = {
                default: foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
                [((game as any).user as any)?.id]:
                    foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
            };
        }
        if (doc.effects) {
            data.effects = doc.effects.contents.map((e: any) => e.toObject());
        }
    }

    return data;
}

export interface InternalClientDocument {
    /**
     * A collection of Application instances which should be re-rendered whenever this document is updated.
     * The keys of this object are the application ids and the values are Application instances. Each
     * Application in this object will have its render method called by {@link Document.render | `Document#render`}.
     * @see {@link Document.render | `Document#render`}
     * @defaultValue `{}`
     * @remarks Created during construction via `defineProperty`, with options `{value: {}, writable: false, enumerable: false}`
     */
    readonly apps: Record<string, foundry.applications.api.ApplicationV2.Any>;

    /**
     * Return a reference to the parent Collection instance which contains this Document.
     */
    get collection(): Collection<this>;

    /**
     * A reference to the Compendium Collection which contains this Document, if any, otherwise undefined.
     */
    get compendium(): CompendiumCollection<any> | undefined;

    /**
     * A boolean indicator for whether the current game User has ownership rights for this Document.
     * Different Document types may have more specialized rules for what constitutes ownership.
     */
    get isOwner(): boolean;

    /**
     * Test whether this Document is owned by any non-Gamemaster User.
     */
    get hasPlayerOwner(): boolean;

    /**
     * A boolean indicator for whether the current game User has exactly LIMITED visibility (and no greater).
     */
    get limited(): boolean;

    /**
     * Return a string which creates a dynamic link to this Document instance.
     */
    get link(): string;

    /**
     * Return the permission level that the current game User has over this Document.
     * See the CONST.DOCUMENT_OWNERSHIP_LEVELS object for an enumeration of these levels.
     *
     * @example
     * ```typescript
     * (game as any).user.id; // "dkasjkkj23kjf"
     * actor.data.permission; // {default: 1, "dkasjkkj23kjf": 2};
     * actor.permission; // 2
     * ```
     */
    get permission(): CONST.DOCUMENT_OWNERSHIP_LEVELS | null;

    /**
     * Lazily obtain a FormApplication instance used to configure this Document, or null if no sheet is available.
     */
    get sheet():
        | FormApplication.Any
        | foundry.applications.api.ApplicationV2.Any
        | null;

    /**
     * A boolean indicator for whether or not the current game User has at least limited visibility for this Document.
     * Different Document types may have more specialized rules for what determines visibility.
     */
    get visible(): boolean;

    /**
     * Prepare data for the Document. This method is called automatically by the DataModel#_initialize workflow.
     * This method provides an opportunity for Document classes to define special data preparation logic.
     * The work done by this method should be idempotent. There are situations in which prepareData may be called more
     * than once.
     */
    prepareData(): void;

    /**
     * Prepare data related to this Document itself, before any embedded Documents or derived data is computed.
     */
    prepareBaseData(): void;

    /**
     * Prepare all embedded Document instances which exist within this primary Document.
     */
    prepareEmbeddedDocuments(): void;

    /**
     * Apply transformations or derivations to the values of the source data object.
     * Compute data fields whose values are not stored to the database.
     */
    prepareDerivedData(): void;

    /**
     * Render all Application instances which are connected to this document by calling their respective
     * @see {@link Application.render | `Application#render`}
     * @param force   - Force rendering
     *                  (default: `false`)
     * @param context - Optional context
     *                  (default: `{}`)
     */
    render(
        force?: boolean,
        context?:
            | Application.RenderOptions
            | foundry.applications.api.ApplicationV2.RenderOptions,
    ): void;

    /**
     * Determine the sort order for this Document by positioning it relative a target sibling.
     * See SortingHelper.performIntegerSort for more details
     * @param options - Sorting options provided to SortingHelper.performIntegerSort
     * @returns The Document after it has been re-sorted
     */
    sortRelative(options?: ClientDocument.SortOptions<this>): Promise<this>;

    /**
     * Construct a UUID relative to another document.
     * @param doc - The document to compare against.
     */
    getRelativeUUID(relative: ClientDocument): string;

    /**
     * Orchestrate dispatching descendant document events to parent documents when embedded children are modified.
     * @param event      - The event name, preCreate, onCreate, etc...
     * @param collection - The collection name being modified within this parent document
     * @param args       - Arguments passed to each dispatched function
     * @param _parent    - The document with directly modified embedded documents.
     *                     Either this document or a descendant of this one.
     * @internal
     * @remarks This has not been typed per-document as there does not appear to be a reason for users to ever extend or call this method.
     * If you have a use case for this, please file an issue.
     */
    _dispatchDescendantDocumentEvents(
        event: ClientDocument.LifeCycleEventName,
        collection: string,
        args: never,
        _parent: never,
    ): void;

    /**
     * Actions taken after descendant documents have been created, but before changes are applied to the client data.
     * @param parent     - The direct parent of the created Documents, may be this Document or a child
     * @param collection - The collection within which documents are being created
     * @param data       - The source data for new documents that are being created
     * @param options    - Options which modified the creation operation
     * @param userId     - The ID of the User who triggered the operation
     */
    _preCreateDescendantDocuments(
        parent: never,
        collection: never,
        data: never,
        options: never,
        userId: string,
    ): void;

    /**
     * Actions taken after descendant documents have been created and changes have been applied to client data.
     * @param parent     - The direct parent of the created Documents, may be this Document or a child
     * @param collection - The collection within which documents were created
     * @param documents  - The array of created Documents
     * @param data       - The source data for new documents that were created
     * @param options    - Options which modified the creation operation
     * @param userId     - The ID of the User who triggered the operation
     */
    _onCreateDescendantDocuments(
        parent: never,
        collection: never,
        documents: never,
        data: never,
        options: never,
        userId: string,
    ): void;

    /**
     * Actions taken after descendant documents have been updated, but before changes are applied to the client data.
     * @param parent - The direct parent of the updated Documents, may be this Document or a child
     * @param collection - The collection within which documents are being updated
     * @param changes - The array of differential Document updates to be applied
     * @param options - Options which modified the update operation
     * @param userId - The ID of the User who triggered the operation
     */
    _preUpdateDescendantDocuments(
        parent: never,
        collection: never,
        changes: never,
        options: never,
        userId: string,
    ): void;

    /**
     * Actions taken after descendant documents have been updated and changes have been applied to client data.
     * @param parent - The direct parent of the updated Documents, may be this Document or a child
     * @param collection - The collection within which documents were updated
     * @param documents - The array of updated Documents
     * @param changes - The array of differential Document updates which were applied
     * @param options - Options which modified the update operation
     * @param userId - The ID of the User who triggered the operation
     */
    _onUpdateDescendantDocuments(
        parent: never,
        collection: never,
        documents: never,
        changes: never,
        options: never,
        userId: string,
    ): void;

    /**
     * Actions taken after descendant documents have been deleted, but before deletions are applied to the client data.
     * @param parent - The direct parent of the deleted Documents, may be this Document or a child
     * @param collection - The collection within which documents were deleted
     * @param ids - The array of document IDs which were deleted
     * @param options - Options which modified the deletion operation
     * @param userId - The ID of the User who triggered the operation
     */
    _preDeleteDescendantDocuments(
        parent: never,
        collection: never,
        ids: never,
        options: never,
        userId: string,
    ): void;

    /**
     * Actions taken after descendant documents have been deleted and those deletions have been applied to client data.
     * @param parent - The direct parent of the deleted Documents, may be this Document or a child
     * @param collection - The collection within which documents were deleted
     * @param documents - The array of Documents which were deleted
     * @param ids - The array of document IDs which were deleted
     * @param options - Options which modified the deletion operation
     * @param userId - The ID of the User who triggered the operation
     */
    _onDeleteDescendantDocuments(
        parent: never,
        collection: never,
        documents: never,
        ids: string[],
        options: never,
        userId: string,
    ): void;

    /**
     * Whenever the Document's sheet changes, close any existing applications for this Document, and re-render the new
     * sheet if one was already open.
     */
    // options: not null (destructured)
    _onSheetChange(
        options?: ClientDocument.OnSheetChangeOptions,
    ): Promise<void>;

    /**
     * Present a Dialog form to confirm deletion of this Document.
     * @param options - Positioning and sizing options for the resulting dialog
     *                  (default: `{}`)
     * @returns A Promise which resolves to the deleted Document
     */
    // options: not null (parameter default only)
    deleteDialog(
        options?: PlainObject,
    ): Promise<this | false | null | undefined>;

    /**
     * Export document data to a JSON file which can be saved by the client and later imported into a different session.
     * @param options - Additional options passed to the {@link ClientDocument.toCompendium | `ClientDocument#toCompendium`} method
     */
    // options: not null (destructured where forwarded)
    exportToJSON(options?: ClientDocument.ToCompendiumOptions): void;

    /**
     * Serialize salient information about this Document when dragging it.
     */
    toDragData(): foundry.abstract.Document.DropData<
        foundry.abstract.Document.Internal.Instance.Complete<any>
    >;

    /**
     * Update this Document using a provided JSON string.
     * @param json - JSON data string
     * @returns The updated Document instance
     */
    importFromJSON(json: string): Promise<this>;

    /**
     * Render an import dialog for updating the data related to this Document through an exported JSON file
     */
    importFromJSONDialog(): Promise<void>;

    /**
     * Transform the Document data to be stored in a Compendium pack.
     * Remove any features of the data which are world-specific.
     * @param pack    - A specific pack being exported to
     * @param options - Additional options which modify how the document is converted
     *                  (default: `{}`)
     * @returns A data object of cleaned data suitable for compendium import
     */
    // options: not null (destructured)
    toCompendium(
        pack?: CompendiumCollection<CompendiumCollection.Metadata> | null,
        options?: PlainObject,
    ): ClientDocument.ToCompendiumReturnType<any, any>;

    /**
     * Create a content link for this Document.
     * @param options - Additional options to configure how the link is constructed.
     */
    // options: not null (parameter default only)
    toAnchor(options?: TextEditor.EnrichmentAnchorOptions): HTMLAnchorElement;

    /**
     * Convert a Document to some HTML display for embedding purposes.
     * @param config  - Configuration for embedding behavior.
     * @param options - The original enrichment options for cases where the Document embed content also contains text that must be enriched.
     * @returns A representation of the Document as HTML content, or null if such a representation could not be generated.
     */
    // options: not null (parameter default only)
    toEmbed(
        config: TextEditor.DocumentHTMLEmbedConfig,
        options?: TextEditor.EnrichmentOptions,
    ): Promise<HTMLElement | null>;

    /**
     * A method that can be overridden by subclasses to customize embedded HTML generation.
     * @param config  - Configuration for embedding behavior.
     * @param options - The original enrichment options for cases where the Document embed content also contains text that must be enriched.
     * @returns Either a single root element to append, or a collection of elements that comprise the embedded content
     */
    _buildEmbedHTML(
        config: TextEditor.DocumentHTMLEmbedConfig,
        options?: TextEditor.EnrichmentOptions,
    ): Promise<HTMLElement | HTMLCollection | null>;

    /**
     * A method that can be overridden by subclasses to customize inline embedded HTML generation.
     * @param content - The embedded content.
     * @param config  - Configuration for embedding behavior.
     * @param options - The original enrichment options for cases where the Document embed content also contains text that must be enriched.
     */
    _createInlineEmbed(
        content: HTMLElement | HTMLCollection,
        config: TextEditor.DocumentHTMLEmbedConfig,
        options?: TextEditor.EnrichmentOptions,
    ): Promise<HTMLElement | null>;

    /**
     * A method that can be overridden by subclasses to customize the generation of the embed figure.
     * @param content - The embedded content.
     * @param config  - Configuration for embedding behavior.
     * @param options - The original enrichment options for cases where the Document embed content also contains text that must be enriched.
     */
    _createFigureEmbed(
        content: HTMLElement | HTMLCollection,
        config: TextEditor.DocumentHTMLEmbedConfig,
        options?: TextEditor.EnrichmentOptions,
    ): Promise<HTMLElement | null>;

    /**
     * Preliminary actions taken before a set of embedded Documents in this parent Document are created.
     * @param embeddedName - The name of the embedded Document type
     * @param result       - An Array of created data objects
     * @param options      - Options which modified the creation operation
     * @param userId       - The ID of the User who triggered the operation
     * @deprecated since v11
     */
    _preCreateEmbeddedDocuments(
        embeddedName: string,
        result: AnyObject[],
        options: foundry.abstract.Document.ModificationOptions,
        userId: string,
    ): void;

    /**
     * Follow-up actions taken after a set of embedded Documents in this parent Document are created.
     * @param embeddedName - The name of the embedded Document type
     * @param documents    - An Array of created Documents
     * @param result       - An Array of created data objects
     * @param options      - Options which modified the creation operation
     * @param userId       - The ID of the User who triggered the operation
     * @deprecated since v11
     */
    _onCreateEmbeddedDocuments(
        embeddedName: string,
        documents: never,
        result: AnyObject[],
        options: foundry.abstract.Document.ModificationOptions,
        userId: string,
    ): void;

    /**
     * Preliminary actions taken before a set of embedded Documents in this parent Document are updated.
     * @param embeddedName - The name of the embedded Document type
     * @param result       - An Array of incremental data objects
     * @param options      - Options which modified the update operation
     * @param userId       - The ID of the User who triggered the operation
     * @deprecated since v11
     */
    _preUpdateEmbeddedDocuments(
        embeddedName: string,
        result: AnyObject[],
        options: foundry.abstract.Document.ModificationOptions,
        userId: string,
    ): void;

    /**
     * Follow-up actions taken after a set of embedded Documents in this parent Document are updated.
     * @param embeddedName - The name of the embedded Document type
     * @param documents    - An Array of updated Documents
     * @param result       - An Array of incremental data objects
     * @param options      - Options which modified the update operation
     * @param userId       - The ID of the User who triggered the operation
     * @deprecated since v11
     */
    _onUpdateEmbeddedDocuments(
        embeddedName: string,
        documents: never,
        result: AnyObject[],
        options: foundry.abstract.Document.ModificationContext<foundry.abstract.Document.Any | null>,
        userId: string,
    ): void;

    /**
     * Preliminary actions taken before a set of embedded Documents in this parent Document are deleted.
     * @param embeddedName - The name of the embedded Document type
     * @param result       - An Array of document IDs being deleted
     * @param options      - Options which modified the deletion operation
     * @param userId       - The ID of the User who triggered the operation
     * @deprecated since v11
     */
    _preDeleteEmbeddedDocuments(
        embeddedName: string,
        result: string[],
        options: foundry.abstract.Document.ModificationContext<foundry.abstract.Document.Any | null>,
        userId: string,
    ): void;

    /**
     * Follow-up actions taken after a set of embedded Documents in this parent Document are deleted.
     * @param embeddedName - The name of the embedded Document type
     * @param documents    - An Array of deleted Documents
     * @param result       - An Array of document IDs being deleted
     * @param options      - Options which modified the deletion operation
     * @param userId       - The ID of the User who triggered the operation
     * @deprecated since v11
     */
    _onDeleteEmbeddedDocuments(
        embeddedName: string,
        documents: never,
        result: string[],
        options: foundry.abstract.Document.ModificationContext<foundry.abstract.Document.Any | null>,
        userId: string,
    ): void;
}
