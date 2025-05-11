import { P } from "vitest/dist/chunks/environment.d.Dmw5ulng";

export interface Point {
    x: number;
    y: number;
}

/* -------------------------------------------- */
/* Game World Utilities */
/* -------------------------------------------- */

/**
 * Get the Token and Actor associated with a combatant token.
 * @param token - The Token to check.
 * @param forceAllow - Allow non-combat tokens if true.
 */
export function getTokenInCombat(
    token?: Token | null,
    forceAllow?: boolean,
): { token: Token; actor: Actor } | null;

/**
 * Get the targeted TokenDocument for a given combatant's user.
 */
export function getUserTargetedToken(
    combatant: Combatant,
): TokenDocument | null;

/**
 * Retrieve an Actor based on item, actor, or speaker references.
 */
export function getActor(options?: {
    item?: any;
    actor?: any;
    speaker?: any;
}): SohlActor | null;

/**
 * Measure distance from source token to target token.
 */
export function rangeToTarget(
    sourceToken: Token | TokenDocument,
    targetToken: Token | TokenDocument,
    gridUnits?: boolean,
): number | null;

/**
 * Get the single currently selected token.
 */
export function getSingleSelectedToken(options?: {
    quiet?: boolean;
}): TokenDocument | null;

/* -------------------------------------------- */
/* Compendium Document Utilities */
/* -------------------------------------------- */

/**
 * Load multiple documents from specified Compendium packs.
 */
export function getDocsFromPacks(
    packNames: string[],
    options?: { documentName?: string; docType?: string },
): Promise<any[]>;

/**
 * Retrieve a single document by name from specified Compendium packs.
 */
export function getDocumentFromPacks(
    docName: string,
    packNames: string[],
    options?: { documentName?: string; docType?: string; keepId?: boolean },
): Promise<any | null>;

/**
 * Represents an HTTP Error when a non-OK response is returned by Fetch.
 */
class HttpError extends Error {
    constructor(statusText: string, code: number, displayMessage?: string);

    /** The HTTP response status code. */
    readonly code: number;

    /** The display message for the error. */
    readonly displayMessage: string;

    override toString(): string;
}

type RollOptions = {
    minimize?: boolean;
    maximize?: boolean;
    allowStrings?: boolean;
    allowInteractive?: boolean;
    strict?: boolean;
};

type ReplaceFormulaOptions = {
    missing?: string;
    warn?: boolean;
};

type RollAnchorOptions = {
    label?: string;
    attrs?: Record<string, string>;
    dataset?: Record<string, string>;
    classes?: string[];
    icon?: string;
};

type RollRenderOptions = {
    flavor?: string;
    template?: string;
    isPrivate?: boolean;
};

type ClassifyOptions = {
    intermediate?: boolean;
    prior?: RollTerm | string;
    next?: RollTerm | string;
};

interface DataModelValidationOptions {
    fields?: boolean;
    joint?: boolean;
    changes?: PlainObject;
    clean?: boolean;
    strict?: boolean;
    fallback?: boolean;
    partial?: boolean;
    dropInvalidEmbedded?: boolean;
}

interface DataModelUpdateOptions {
    dryRun?: boolean;
    fallback?: boolean;
    recursive?: boolean;
    restoreDelta?: boolean;
}

interface DataModelConstructionOptions {
    parent: DataModel | null;
    strict?: boolean;
    fallback?: boolean;
    dropInvalidEmbedded?: boolean;
}

interface DataModelFromSourceOptions {
    strict?: boolean;
}

type DataModelConstructor = {
    new (data?: PlainObject, options?: DataModelConstructionContext): DataModel;

    defineSchema(): PlainObject;
    readonly schema: SchemaField;

    LOCALIZATION_PREFIXES: string[];

    cleanData(source?: PlainObject, options?: PlainObject): PlainObject;
    validateJoint(data: PlainObject): void;

    fromSource(
        source: PlainObject,
        context?: Omit<DataModelConstructionContext, "strict"> &
            DataModelFromSourceOptions,
    ): DataModel;

    fromJSON(json: string): DataModel;

    migrateData(source: PlainObject): PlainObject;
    migrateDataSafe(source: PlainObject): PlainObject;
    shimData(data: PlainObject, options?: { embedded?: boolean }): PlainObject;
};

abstract class DataModel {
    readonly _source: PlainObject;
    readonly parent: DataModel | null;
    readonly validationFailures: {
        fields: DataModelValidationFailure | null;
        joint: DataModelValidationFailure | null;
    };

    // Public getters
    readonly schema: SchemaField;
    readonly invalid: boolean;

    // Protected methods
    _configure(options?: PlainObject): void;
    _initialize(options?: PlainObject): void;
    _initializeSource(
        data: PlainObject | DataModel,
        options?: PlainObject,
    ): PlainObject;

    // Validation
    validate(options?: DataModelValidationOptions): boolean;

    // State
    reset(): void;
    clone(
        data?: PlainObject,
        context?: DataModelConstructionContext,
    ): DataModel;

    // Update
    updateSource(
        changes: PlainObject,
        options?: DataModelUpdateOptions,
    ): PlainObject;

    // Serialization
    toObject(source?: boolean): PlainObject;
    toJSON(): PlainObject;
}

/**
 * Metadata for a Document class.
 */
class DocumentMetadata {
    name: string;
    label: string;
    collection: string;
    embedded: boolean;
    isPrimary: boolean;
    types?: string[];
    hasSystemData?: boolean;
    labelPlural?: string;
    documentClass?: Function;
}

/**
 * Context PlainObject for constructing a Document.
 */
interface DocumentConstructionContext extends DataModelConstructionContext {
    pack?: string;
    embedded?: boolean;
    type?: string;
}

/**
 * Options for creating a Document from source data.
 */
interface DocumentFromSourceOptions {
    strict?: boolean;
}

/**
 * A constructor type for a Document class.
 */
type DocumentConstructor<T extends Document = Document> = {
    new (data?: PlainObject, context?: DocumentConstructionContext): T;

    readonly metadata: DocumentMetadata;
    get documentName(): string;
};

abstract class Document<D extends TypeDataModel = any> extends DataModel {
    _configure({
        pack,
        parentCollection,
    }?: {
        pack?: null | undefined;
        parentCollection?: null | undefined;
    }): void;
    static get schema(): PlainObject;
    static _initializationOrder(): Generator<any[], void, unknown>;
    static metadata: Readonly<{
        name: "Document";
        label: "DOCUMENT.Document";
        coreTypes: any[];
        collection: "documents";
        embedded: {};
        hasTypeData: false;
        indexed: false;
        compendiumIndexFields: never[];
        permissions: {
            view: string;
            create: string;
            update: string;
            delete: string;
        };
        preserveOnImport: string[];
        schemaVersion: undefined;
    }>;
    static LOCALIZATION_PREFIXES: string[];
    static get database(): any;
    static get implementation(): any;
    static get baseDocument(): typeof Document;
    static get collectionName(): string;
    get collectionName(): string;
    static get documentName(): string;
    get documentName(): string;
    static get TYPES(): string[];
    static get hasTypeData(): boolean;
    static get hierarchy(): PlainObject;
    _getParentCollection(parentCollection: string | null): string | null;
    get id(): string | null;
    get isEmbedded(): boolean;
    get inCompendium(): boolean;
    get uuid(): string;
    static canUserCreate(user: User): boolean;
    getUserLevel(user: User): number;
    testUserPermission(
        user: User,
        permission: number,
        {
            exact,
        }?: {
            exact?: boolean | undefined;
        },
    ): boolean;
    canUserModify(user: any, action: string, data?: {}): boolean;
    clone(
        data: PlainObject = {},
        context: PlainObject = {},
    ): Document | Promise<Document>;
    migrateSystemData(): PlainObject;
    toObject(source?: boolean): PlainObject;
    static createDocuments(
        data: PlainObject[] | Document[] = [],
        operation: PlainObject = {},
    ): Promise<Document[] | undefined>;
    static updateDocuments(
        updates: PlainObject[] = [],
        operation: PlainObject = {},
    ): Promise<Document[] | undefined>;
    static deleteDocuments(
        ids: string[] = [],
        operation: PlainObject = {},
    ): Promise<Document[] | undefined>;
    static create(
        data: PlainObject,
        operation: PlainObject = {},
    ): Promise<Document | null>;
    update(
        data: PlainObject = {},
        operation: PlainObject = {},
    ): Promise<Document | null>;
    delete(operation: PlainObject = {}): Promise<Document | null>;
    static get(
        documentId: string,
        operation: PlainObject = {},
    ): Document | null;
    static getCollectionName(name: string): Collection | null;
    getEmbeddedCollection(embeddedName: string): Collection | null;
    getEmbeddedDocument(
        embeddedName: any,
        id: any,
        {
            invalid,
            strict,
        }?: {
            invalid?: boolean | undefined;
            strict?: boolean | undefined;
        },
    ): Document | null;
    createEmbeddedDocuments(
        embeddedName: string,
        data: PlainObject[] = [],
        operation: PlainObject = {},
    ): Promise<Document[]>;
    updateEmbeddedDocuments(
        embeddedName: any,
        updates?: never[],
        operation?: {},
    ): Promise<any>;
    deleteEmbeddedDocuments(
        embeddedName: any,
        ids: any,
        operation?: {},
    ): Promise<any>;
    traverseEmbeddedDocuments(_parentPath: any): Generator<any, void, any>;
    getFlag(scope: string, key: string): any;
    setFlag(scope: string, key: string, value: any): Promise<Document>;
    unsetFlag(scope: string, key: string): Promise<Document>;
    _preCreate(
        data: PlainObject = {},
        options: PlainObject = {},
        user: User = null,
    ): Promise<boolean | void>;
    _onCreate(
        data: PlainObject = {},
        options: PlainObject = {},
        userId: string = null,
    ): void;
    static _preCreateOperation(
        documents: any,
        operation: any,
        user: any,
    ): Promise<void>;
    static _onCreateOperation(
        documents: any,
        operation: any,
        user: any,
    ): Promise<void>;
    _preUpdate(changes: any, options: any, user: any): Promise<boolean | void>;
    _onUpdate(changes: any, options: any, userId: any): void;
    static _preUpdateOperation(
        documents: any,
        operation: any,
        user: any,
    ): Promise<void>;
    static _onUpdateOperation(
        documents: any,
        operation: any,
        user: any,
    ): Promise<void>;
    _preDelete(options: any, user: any): Promise<void>;
    _onDelete(options: any, userId: any): void;
    static _preDeleteOperation(
        documents: any,
        operation: any,
        user: any,
    ): Promise<void>;
    static _onDeleteOperation(
        documents: any,
        operation: any,
        user: any,
    ): Promise<void>;
    static _addDataFieldShims(data: any, shims: any, options: any): void;
    static _addDataFieldShim(
        data: any,
        oldKey: any,
        newKey: any,
        options?: {},
    ): void;
    static _addDataFieldMigration(
        data: any,
        oldKey: any,
        newKey: any,
        apply: any,
    ): boolean;
    static _logDataFieldMigration(oldKey: any, newKey: any, options?: {}): void;
}

/**
 * The client-side Folder document which extends the common BaseFolder model.
 */
export default class Folder extends ClientDocument<BaseFolder> {
    static createDialog(
        data?: Record<string, any>,
        createOptions?: Record<string, any>,
        dialogOptions?: Record<string, any>,
    ): Promise<Folder>;

    depth: number;
    children: Folder[];
    displayed: boolean;
    protected #contents?: (ClientDocument | object)[];

    get contents(): (ClientDocument | object)[];
    set contents(value: (ClientDocument | object)[]);

    get documentClass(): typeof ClientDocument;

    get documentCollection(): Collection | undefined;

    get expanded(): boolean;

    get ancestors(): Folder[];

    get inCompendium(): boolean;

    getSubfolders(recursive?: boolean): Folder[];

    getParentFolders(): Folder[];

    exportToCompendium(
        pack: CompendiumCollection,
        options?: {
            updateByName?: boolean;
            keepId?: boolean;
            keepFolders?: boolean;
            folder?: string;
        },
    ): Promise<CompendiumCollection | void>;

    exportDialog(
        pack: string | null,
        options?: {
            merge?: boolean;
            keepId?: boolean;
            keepFolders?: boolean;
        },
    ): Promise<void>;

    protected _preCreate(
        data: any,
        options: any,
        user: any,
    ): Promise<void | undefined>;
}

type ApplicationRenderState =
    (typeof ApplicationV2.RENDER_STATES)[keyof typeof ApplicationV2.RENDER_STATES];

declare interface ApplicationV2Constructor {
    new (options: PlainObject): ApplicationV2;
    DEFAULT_OPTIONS: PlainObject;
    BASE_APPLICATION: typeof ApplicationV2;
    TABS: PlainObject;
    RENDER_STATES: StrictObject<number>;
    emittedEvents: string[];
    inheritanceChain(): Generator<typeof ApplicationV2>;
}

/**
 * The ApplicationV2 class is responsible for rendering HTML into the UI.
 */
class ApplicationV2<
    Configuration = ApplicationV2ConstructorOptions,
    RenderOptions = PlainObject,
> extends EventTarget {
    readonly id: string;
    readonly classList: DOMTokenList | undefined;
    readonly title: string;
    readonly element: HTMLElement | undefined;
    readonly form: HTMLFormElement | null;
    readonly minimized: boolean;
    readonly rendered: boolean;
    readonly state: ApplicationRenderState;
    readonly hasFrame: boolean;
    readonly options: Configuration;
    readonly tabGroups: Record<string, string | null>;

    render(
        options?: boolean | RenderOptions,
        _options?: RenderOptions,
    ): Promise<this>;
    close(options?: object): Promise<this>;
    setPosition(
        position?: Partial<ApplicationPosition>,
    ): ApplicationPosition | void;
    bringToFront(): void;
    changeTab(tab: string, group: string, options?: object): void;
    submit(submitOptions?: object): Promise<any>;
    toggleControls(
        expanded?: boolean,
        options?: { animate?: boolean },
    ): Promise<void>;
    minimize(): Promise<void>;
    maximize(): Promise<void>;

    protected _initializeApplicationOptions(
        options: Partial<Configuration>,
    ): Configuration;
    protected _configureRenderOptions(options: RenderOptions): void;
    protected _prepareContext(
        options: RenderOptions,
    ): Promise<ApplicationRenderContext>;
    protected _getTabsConfig(
        group: string,
    ): ApplicationTabsConfiguration | null;
    protected _getHeaderControls(): ApplicationHeaderControlsEntry[];
    protected *_headerControlButtons(): Generator<ApplicationHeaderControlsEntry>;

    protected _renderHTML(
        context: ApplicationRenderContext,
        options: RenderOptions,
    ): Promise<any>;
    protected _replaceHTML(
        result: any,
        content: HTMLElement,
        options: RenderOptions,
    ): void;
    protected _renderFrame(options: RenderOptions): Promise<HTMLElement>;
    protected _insertElement(element: HTMLElement): void;
    protected _updateFrame(options: RenderOptions): void;

    protected _removeElement(element: HTMLElement): void;
    protected _tearDown(options: object): void;

    protected _createContextMenu(
        handler: () => ContextMenuEntry[],
        selector: string,
        options?: object,
    ): ContextMenu | null;

    protected _canRender(options: RenderOptions): false | void;
    protected _preFirstRender(
        context: ApplicationRenderContext,
        options: RenderOptions,
    ): Promise<void>;
    protected _onFirstRender(
        context: ApplicationRenderContext,
        options: RenderOptions,
    ): Promise<void>;
    protected _preRender(
        context: ApplicationRenderContext,
        options: RenderOptions,
    ): Promise<void>;
    protected _onRender(
        context: ApplicationRenderContext,
        options: RenderOptions,
    ): Promise<void>;
    protected _preClose(options: object): Promise<void>;
    protected _onClose(options: object): void;
    protected _prePosition(position: ApplicationPosition): void;
    protected _onPosition(position: ApplicationPosition): void;

    static parseCSSDimension(
        style: string,
        parentDimension: number,
    ): number | void;
    static waitForImages(element: HTMLElement): Promise<void>;

    bringToTop(): void; // Deprecated shim
}

class DocumentSheetConfiguration {
    document: ClientDocument;
    viewPermission: number;
    editPermission: number;
    canCreate: boolean;
    sheetConfig: boolean;
}

interface DocumentSheetRenderOptions {
    renderContext: string;
    renderData: object;
}

declare interface DocumentSheetV2Static {
    DEFAULT_OPTIONS: PlainObject;
    _migrateConstructorParams(first: unknown, rest: unknown[]): PlainObject;
}

type DocumentSheetV2Constructor = Constructor<DocumentSheetV2> &
    DocumentSheetV2Static;

/**
 * DocumentSheetV2 — a specialized ApplicationV2 for Documents
 */
class DocumentSheetV2 extends ApplicationV2 {
    readonly document: ClientDocument;
    readonly isVisible: boolean;
    readonly isEditable: boolean;

    protected _initializeApplicationOptions(options: PlainObject): PlainObject;

    protected _configureRenderOptions(options: PlainObject): void;
    protected _prepareContext(options: PlainObject): Promise<PlainObject>;

    protected _toggleDisabled(disabled: boolean): void;
    protected _canRender(options: PlainObject & PlainObject): false | void;

    protected _onRender(
        context: ApplicationRenderContext,
        options: PlainObject & PlainObject,
    ): Promise<void>;
    protected _onClose(options: object): void;

    protected _processFormData(
        event: SubmitEvent | null,
        form: HTMLFormElement,
        formData: FormDataExtended,
    ): object;

    protected _prepareSubmitData(
        event: SubmitEvent,
        form: HTMLFormElement,
        formData: FormDataExtended,
        updateData?: object,
    ): object;

    protected _processSubmitData(
        event: SubmitEvent,
        form: HTMLFormElement,
        submitData: object,
        options?: object,
    ): Promise<void>;
}

/** Button configuration for DialogV2. */
class DialogV2Button {
    action: string;
    label: string;
    icon?: string;
    class?: string;
    default?: boolean;
    callback?: DialogV2ButtonCallback;
}

/** Callback when a DialogV2 button is clicked. */
type DialogV2ButtonCallback = (
    event: PointerEvent | SubmitEvent,
    button: HTMLButtonElement,
    dialog: HTMLDialogElement,
) => Promise<any>;

/** Configuration object passed to DialogV2. */
class DialogV2Configuration {
    modal?: boolean;
    buttons: DialogV2Button[];
    content?: string | HTMLDivElement;
    submit?: DialogV2SubmitCallback;
}

/** Callback when a DialogV2 is rendered. */
type DialogV2RenderCallback = (event: Event, dialog: HTMLDialogElement) => void;

/** Callback when a DialogV2 is closed. */
type DialogV2CloseCallback = (event: Event, dialog: DialogV2) => void;

/** Callback when a DialogV2 form is submitted. */
type DialogV2SubmitCallback = (result: any) => Promise<void>;

/** Options for waiting on a DialogV2 result. */
interface DialogV2WaitOptions {
    render?: DialogV2RenderCallback;
    close?: DialogV2CloseCallback;
    rejectClose?: boolean;
}

export default class ActorSheetV2 extends DocumentSheetV2 {
    /** The Actor document managed by this sheet. */
    get actor(): Actor;
    get token(): TokenDocument | null;

    protected _getHeaderControls(): any[];

    protected _canDragStart(selector: string): boolean;
    protected _canDragDrop(selector: string): boolean;

    protected _onRender(context: unknown, options: unknown): Promise<void>;

    protected _onDragStart(event: DragEvent): Promise<void>;
    protected _onDragOver(event: DragEvent): void;
    protected _onDrop(event: DragEvent): Promise<void>;

    protected _onDropDocument(event: DragEvent, document: any): Promise<void>;
    protected _onDropActiveEffect(
        event: DragEvent,
        effect: ActiveEffect,
    ): Promise<void>;
    protected _onDropActor(event: DragEvent, actor: Actor): Promise<void>;
    protected _onDropItem(event: DragEvent, item: Item): Promise<void>;
    protected _onDropFolder(event: DragEvent, folder: Folder): Promise<void>;

    protected _onSortItem(event: DragEvent, item: Item): Promise<unknown>;
}

export default class ItemSheetV2 extends DocumentSheetV2 {
    /** The Item document managed by this sheet. */
    get item(): Item;

    /** The Actor instance which owns this Item, if any. */
    get actor(): Actor | null;
}

/**
 * A lightweight Application that renders a dialog.
 */
class DialogV2 extends ApplicationV2<
    ApplicationConfiguration & DialogV2Configuration
> {
    static DEFAULT_OPTIONS: object;

    protected _initializeApplicationOptions(options: any): any;

    protected _renderHTML(context: any, options: any): Promise<HTMLFormElement>;

    protected _renderButtons(): string;

    protected _onSubmit(
        target: HTMLButtonElement,
        event: PointerEvent | SubmitEvent,
    ): Promise<DialogV2>;

    protected _onFirstRender(context: any, options: any): Promise<void>;

    protected _attachFrameListeners(): void;

    protected _replaceHTML(
        result: HTMLElement,
        content: HTMLElement,
        options: any,
    ): void;

    protected _onKeyDown(event: KeyboardEvent): void;

    /** Click handler for buttons */
    protected static _onClickButton(
        this: DialogV2,
        event: PointerEvent,
        target: HTMLButtonElement,
    ): void;

    /** Factory methods */

    static confirm(
        config?: Partial<
            ApplicationConfiguration &
                DialogV2Configuration &
                DialogV2WaitOptions
        > & {
            yes?: Partial<DialogV2Button>;
            no?: Partial<DialogV2Button>;
        },
    ): Promise<any>;

    static prompt(
        config?: Partial<
            ApplicationConfiguration &
                DialogV2Configuration &
                DialogV2WaitOptions
        > & {
            ok?: Partial<DialogV2Button>;
        },
    ): Promise<any>;

    static input(
        config?: Partial<
            ApplicationConfiguration &
                DialogV2Configuration &
                DialogV2WaitOptions
        > & {
            ok?: Partial<DialogV2Button>;
        },
    ): Promise<any>;

    static wait(
        config?: Partial<
            ApplicationConfiguration &
                DialogV2Configuration &
                DialogV2WaitOptions
        >,
    ): Promise<any>;

    static query(
        user: User | string,
        type: "prompt" | "confirm" | "input" | "wait",
        config?: object,
    ): Promise<any>;

    /** Internal dialog query handler */
    protected static _handleQuery(options: {
        type: "prompt" | "confirm" | "input" | "wait";
        config: object;
    }): Promise<any>;
}

/**
 * An extension of the native FormData implementation.
 *
 * This class functions the same way as FormData, but is more opinionated about input field processing.
 */
class FormDataExtended extends FormData {
    constructor(
        form: HTMLFormElement,
        options?: {
            editors?: Record<string, object>;
            dtypes?: Record<string, string>;
            disabled?: boolean;
            readonly?: boolean;
        },
    );

    /** A mapping of requested data types for form fields. */
    readonly dtypes: Record<string, string>;

    /** A record of TinyMCE editor metadata objects linked to this form. */
    readonly editors: Record<string, object>;

    /** The object representation of the processed form data. */
    readonly object: Record<string, any>;

    /**
     * Process the HTML form element to populate the FormData instance.
     * @param form The HTML form being processed.
     * @param options Forwarded options from the constructor.
     */
    protected process(
        form: HTMLFormElement,
        options: {
            disabled?: boolean;
            readonly?: boolean;
        },
    ): void;

    /**
     * Override set method to assign JSON strings and parsed values.
     * @param name The field name.
     * @param value The value to assign.
     */
    override set(name: string, value: any): this;

    /**
     * Override append method to add values to arrays.
     * @param name The field name.
     * @param value The value to append.
     */
    override append(name: string, value: any): this;
}

class ActiveEffectChange {
    key: string;
    value: string;
    mode: number;
    priority?: number;
}

class ActiveEffectDuration {
    startTime?: number | null;
    seconds?: number;
    combat?: BaseCombat;
    rounds?: number;
    turns?: number;
    startRound?: number;
    startTurn?: number;
}

abstract class BaseActiveEffect extends Document {
    _id?: string;
    name: string;
    img?: string;
    type: string;
    system?: Record<string, unknown>;
    changes: ActiveEffectChange[];
    disabled?: boolean;
    duration?: ActiveEffectDuration;
    description?: string;
    origin?: string | null;
    tint?: string;
    transfer?: boolean;
    statuses?: Set<string>;
    sort?: number;
    flags?: Record<string, unknown>;
    _stats?: Record<string, unknown>;
}

abstract class BaseActor extends Document {
    _id?: string;
    name: string;
    img?: string;
    type: string;
    system: TypeDataModel;
    prototypeToken: PrototypeToken;
    items?: Item[];
    effects?: ActiveEffect[];
    folder?: string;
    sort?: number;
    ownership?: PlainObject;
    flags?: PlainObject;
    _stats?: PlainObject;

    /** Default artwork for an Actor */
    getDefaultArtwork(actorData: PlainObject): {
        img: string;
        texture: { src: string };
    };

    /** Default icon path */
    readonly DEFAULT_ICON: string;
}

type BaseActorConstructor = DocumentConstructor<BaseActor, typeof BaseActor>;

abstract class BaseCombatant extends Document {
    _id?: string;
    type: string;
    system: PlainObject;
    actorId: string;
    tokenId: string;
    sceneId: string;
    name?: string;
    img?: string;
    initiative?: number;
    hidden?: boolean;
    defeated?: boolean;
    group?: string;
    flags?: PlainObject;
    _stats?: PlainObject;
}

abstract class BaseItem extends Document {
    _id?: string;
    name: string;
    type: string;
    img?: string;
    system: PlainObject;
    effects?: any[];
    folder?: string;
    sort?: number;
    ownership?: PlainObject;
    flags?: PlainObject;
    _stats?: PlainObject;

    /** Default artwork for an Item */
    getDefaultArtwork(itemData: PlainObject): {
        img: string;
    };
}

/**
 * Data schema for a Macro document.
 */
abstract class BaseMacro extends Document {
    /** The unique identifier for the macro. */
    _id: string;

    /** The name of the macro. */
    name: string;

    /** The macro type. Likely "chat" or "script". */
    type: string;

    /** The ID of the authoring user. */
    author: string;

    /** Image path representing the macro. */
    img: string;

    /** The execution scope (e.g., "global", "actor", etc.). */
    scope: string;

    /** The command content of the macro. */
    command: string;

    /** The ID of the containing folder, if any. */
    folder?: string;

    /** The sort order integer for display. */
    sort: number;

    /** Document ownership data. */
    ownership: PlainObject;

    /** Arbitrary flags object. */
    flags: PlainObject;

    /** System-maintained metadata such as creation and update times. */
    _stats: PlainObject;
}

abstract class BaseChatMessage extends Document {
    _id?: string;
    user: string;
    speaker: PlainObject;
    content: string;
    timestamp: number;
    type: number;
    whisper?: string[];
    roll?: any;
    sound?: string;
    /** The ID of the containing folder, if any. */
    folder?: string;

    /** The sort order integer for display. */
    sort: number;

    /** Document ownership data. */
    ownership: PlainObject;
    flags?: PlainObject;
    _stats?: PlainObject;
}

abstract class BaseCombat extends Document {
    _id?: string;
    name?: string;
    scene: string;
    combatants: any[];
    round: number;
    turn: number;
    /** The ID of the containing folder, if any. */
    folder?: string;

    /** The sort order integer for display. */
    sort: number;

    /** Document ownership data. */
    ownership: PlainObject;
    flags?: PlainObject;
    _stats?: PlainObject;
}

abstract class BaseActiveEffect extends Document {
    _id?: string;
    name: string;
    icon?: string;
    disabled: boolean;
    duration?: PlainObject;
    changes: any[];
    /** The ID of the containing folder, if any. */
    folder?: string;

    /** The sort order integer for display. */
    sort: number;

    /** Document ownership data. */
    ownership: PlainObject;
    flags?: PlainObject;
    _stats?: PlainObject;
}

abstract class BaseScene extends Document {
    _id: string;
    name: string;
    active: boolean;
    navigation: boolean;
    navOrder: number;
    navName?: string;
    background: TextureData;
    foreground: string;
    foregroundElevation: number;
    thumb: string;
    width: number;
    height: number;
    padding: number;
    initial: { x: number; y: number; scale: number };
    backgroundColor: string;
    grid: {
        type: number;
        size: number;
        style: string;
        thickness: number;
        color: string;
        alpha: number;
        distance: number;
        units: string;
    };
    tokenVision: boolean;
    fog: {
        exploration: boolean;
        reset?: number;
        overlay: string;
        colors: { explored?: string; unexplored?: string };
    };
    environment: {
        darknessLevel: number;
        darknessLock: boolean;
        globalLight: {
            enabled: boolean;
            alpha: number;
            bright: boolean;
            color: string;
            coloration: number;
            luminosity: number;
            saturation: number;
            contrast: number;
            shadows: number;
            darkness: number;
        };
        cycle: boolean;
        base: PlainObject;
        dark: PlainObject;
    };
    drawings: any;
    tokens: any;
    lights: any;
    notes: any;
    sounds: any;
    regions: any;
    templates: any;
    tiles: any;
    walls: any;
    playlist: any;
    playlistSound: any;
    journal: any;
    journalEntryPage: any;
    weather: string;
    folder: any;
    sort: number;
    ownership: any;
    flags: any;
    _stats: any;
}

abstract class BaseToken extends Document {
    /** @internal */
    static _getHexagonalOffsets(
        width: number,
        height: number,
        shape: number,
        columns: boolean,
    ): any;

    /** @internal */
    protected _prepareDeltaUpdate(
        changes: Record<string, any>,
        options: DataModelUpdateOptions,
    ): void;
    getSnappedPosition(data?: Partial<any>): any;
    protected _positionToGridOffset(data?: Partial<any>): any;
    protected _gridOffsetToPosition(offset: any, data?: Partial<any>): any;
    getSize(data?: Partial<{ width: number; height: number }>): {
        width: number;
        height: number;
    };
    getCenterPoint(data?: Partial<any>): any;
    getGridSpacePolygon(data?: Partial<any>): any[] | void;
    getOccupiedGridSpaceOffsets(data?: Partial<any>): any[];
}
abstract class ClientDocument<
    TData extends PlainObject = any,
> extends Document<TData> {
    readonly apps: StrictObject<ApplicationV2>;
    readonly collection: any | null;
    readonly compendium?: any;
    readonly inCompendium: boolean;
    readonly isOwner: boolean;
    readonly hasPlayerOwner: boolean;
    readonly limited: boolean;
    readonly link: string;
    readonly permission: number;
    sheet: ApplicationV2 | null;
    readonly visible: boolean;

    prepareData(): void;
    prepareBaseData(): void;
    prepareEmbeddedDocuments(): void;
    prepareDerivedData(): void;
    render(force?: boolean, context?: PlainObject): void;
    sortRelative(options?: {
        updateData?: PlainObject;
        sortOptions?: PlainObject;
    }): Promise<this>;
    getRelativeUUID(relative: ClientDocument): string;
    _createDocumentLink(
        eventData: PlainObject,
        options?: {
            relativeTo?: ClientDocument;
            label?: string;
        },
    ): string;
    _onClickDocumentLink(event: MouseEvent): any;

    /** Event lifecycle hooks */
    _onSheetChange(options?: { sheetOpen?: boolean }): Promise<void>;

    /** Descendant document events */
    _dispatchDescendantDocumentEvents(
        event: string,
        collection: string,
        args: any[],
        _parent?: ClientDocument,
    ): void;

    _preCreateDescendantDocuments(
        parent: ClientDocument,
        collection: string,
        data: PlainObject[],
        options: PlainObject,
        userId: string,
    ): void;

    _onCreateDescendantDocuments(
        parent: ClientDocument,
        collection: string,
        documents: ClientDocument[],
        data: PlainObject[],
        options: PlainObject,
        userId: string,
    ): void;

    _preUpdateDescendantDocuments(
        parent: ClientDocument,
        collection: string,
        changes: PlainObject[],
        options: PlainObject,
        userId: string,
    ): void;

    _onUpdateDescendantDocuments(
        parent: ClientDocument,
        collection: string,
        documents: ClientDocument[],
        changes: PlainObject[],
        options: PlainObject,
        userId: string,
    ): void;

    _preDeleteDescendantDocuments(
        parent: ClientDocument,
        collection: string,
        ids: string[],
        options: PlainObject,
        userId: string,
    ): void;

    _onDeleteDescendantDocuments(
        parent: ClientDocument,
        collection: string,
        documents: ClientDocument[],
        ids: string[],
        options: PlainObject,
        userId: string,
    ): void;

    /** Import/methods */
    exportToJSON(options?: PlainObject): void;
    importFromJSON(json: string): Promise<this>;
    importFromJSONDialog(): Promise<void>;

    /** Drag/drop */
    toDragData(): PlainObject;

    /** Document linking and display */
    toAnchor(options?: Partial<any>): HTMLAnchorElement;
    toEmbed(config: any, options?: any): Promise<HTMLElement | null>;
    onEmbed(element: HTMLElement): void;
    _buildEmbedHTML(
        config: any,
        options?: any,
    ): Promise<HTMLElement | HTMLCollection | null>;
    _createInlineEmbed(
        content: HTMLElement | HTMLCollection,
        config?: any,
        options?: any,
    ): Promise<HTMLElement | null>;
    _createFigureEmbed(
        content: HTMLElement | HTMLCollection,
        config: any,
        options?: any,
    ): Promise<HTMLElement | null>;

    /** Document preparation */
    _safePrepareData(): void;

    /** Sheet class resolution */
    _getSheetClass(): Function | null;
}

interface ClientDocumentConstructor<T extends ClientDocument = ClientDocument> {
    new (data: PlainObject, context?: DocumentConstructionContext): T;
    fromImport(
        source: PlainObject,
        context?: DocumentConstructionContext,
    ): Promise<T>;
    createDialog(
        data?: PlainObject,
        createOptions?: PlainObject,
        dialogOptions?: PlainObject,
    ): Promise<T | null>;
    defaultName(context?: {
        type?: string;
        parent?: T | null;
        pack?: string | null;
    }): string;
}

class Actor extends ClientDocument<BaseActor> {
    // Properties
    overrides: UnknownObject;
    statuses: Set<string>;
    thumbnail: string;
    itemTypes: StrictObject<Item[]>;
    isToken: boolean;
    appliedEffects: ActiveEffect[];
    temporaryEffects: ActiveEffect[];
    token: TokenDocument | null;
    inCombat: boolean;

    // From ClientDocument
    prepareData(): void;
    prepareBaseData(): void;
    prepareEmbeddedDocuments(): void;
    prepareDerivedData(): void;
    render(force?: boolean, context?: PlainObject): void;
    sortRelative(options?: {
        updateData?: PlainObject;
        sortOptions?: PlainObject;
    }): Promise<this>;

    // Methods
    applyActiveEffects(): void;
    getActiveTokens(
        linked?: boolean,
        document?: boolean,
    ): Array<TokenDocument | Token>;
    getTokenImages(): Promise<string[]>;
    modifyTokenAttribute(
        attribute: string,
        value: number,
        isDelta?: boolean,
        isBar?: boolean,
    ): Promise<this>;
    getDependentTokens(options?: {
        scenes?: Scene | Scene[];
        linked?: boolean;
    }): TokenDocument[];
    getRollData(): PlainObject;
    getTokenDocument(
        data?: PlainObject,
        options?: PlainObject,
    ): Promise<TokenDocument>;
    toggleStatusEffect(
        statusId: string,
        options?: { active?: boolean; overlay?: boolean },
    ): Promise<ActiveEffect | boolean | undefined>;
    allApplicableEffects(): Generator<ActiveEffect>;
}

class ActiveEffect extends ClientDocument<BaseActiveEffect> {
    // No additional methods or properties defined in the subclass.
}

export interface ChatSpeakerData {
    actor: string;
    token: string;
    alias: string;
    scene: string;
}

class ChatMessage extends ClientDocument<BaseChatMessage> {
    logged: boolean;
    get alias(): string;
    get isAuthor(): boolean;
    get isContentVisible(): boolean;
    get isRoll(): boolean;
    get visible(): boolean;
    get speakerActor(): Actor | null;
    static applyRollMode(chatData: PlainObject, rollMode: string): PlainObject;
    applyRollMode(rollMode: string): void;
    /**
     * Attempt to determine who is the speaking character (and token) for a certain Chat Message
     * First assume that the currently controlled Token is the speaker
     *
     * @param {object} [options={}]           Options which affect speaker identification
     * @param {Scene} [options.scene]         The Scene in which the speaker resides
     * @param {Actor} [options.actor]         The Actor who is speaking
     * @param {TokenDocument} [options.token] The Token who is speaking
     * @param {string} [options.alias]        The name of the speaker to display
     *
     * @returns {ChatSpeakerData}             The identified speaker data
     */
    static getSpeaker({
        scene: Scene,
        actor: Actor,
        token: TokenDocument,
        alias: string,
    }?: {}): ChatSpeakerData;
    /**
     * Obtain an Actor instance which represents the speaker of this message (if any)
     * @param {Object} speaker    The speaker data object
     * @returns {Actor|null}
     */
    static getSpeakerActor(speaker: any): any;
    /**
     * Obtain a data object used to evaluate any dice rolls associated with this particular chat message
     * @returns {object}
     */
    getRollData(): any;
    /**
     * Given a string whisper target, return an Array of the user IDs which should be targeted for the whisper
     *
     * @param {string} name   The target name of the whisper target
     * @returns {User[]}      An array of User instances
     */
    static getWhisperRecipients(name: any): any;
    /**
     * Render the HTML for the ChatMessage which should be added to the log
     * @param {object} [options]             Additional options passed to the Handlebars template.
     * @param {boolean} [options.canDelete]  Render a delete button. By default, this is true for GM users.
     * @param {boolean} [options.canClose]   Render a close button for dismissing chat card notifications.
     * @returns {Promise<HTMLElement>}
     */
    renderHTML({
        canDelete,
        canClose,
        ...rest
    }?: {
        canClose?: boolean | undefined;
    }): Promise<any>;
    /** @inheritDoc */
    _preCreate(data: any, options: any, user: any): Promise<false | undefined>;
    /** @inheritDoc */
    _onCreate(data: any, options: any, userId: any): void;
    /** @inheritDoc */
    _onUpdate(changed: any, options: any, userId: any): void;
    /** @inheritDoc */
    _onDelete(options: any, userId: any): void;
    /**
     * Export the content of the chat message into a standardized log format
     * @returns {string}
     */
    export(): string;
    /**
     * @ignore
     * @deprecated since v13
     */
    getHTML(options: any): Promise<any>;
}

class Item extends ClientDocument<BaseItem> {
    readonly actor: Actor | null;
    readonly thumbnail: string;
    readonly isOwned: boolean;
    readonly transferredEffects: ActiveEffect[];

    // From ClientDocument
    prepareData(): void;
    prepareBaseData(): void;
    prepareEmbeddedDocuments(): void;
    prepareDerivedData(): void;
    render(force?: boolean, context?: PlainObject): void;
    sortRelative(options?: {
        updateData?: PlainObject;
        sortOptions?: PlainObject;
    }): Promise<this>;

    getRollData(): PlainObject;
}

class Combat extends ClientDocument<BaseCombat> {
    turns: Combatant[];
    current: CombatHistoryData;
    previous?: CombatHistoryData;
    CONFIG_SETTING: string;
    readonly combatant: Combatant | null;
    readonly nextCombatant: Combatant;
    readonly settings: PlainObject;
    readonly started: boolean;
    readonly isActive: boolean;
}

class Combatant extends ClientDocument<BaseCombatant> {
    _videoSrc: string | null;
    resource: PlainObject | null;
    readonly combat: Combat | null;
    readonly isNPC: boolean;
    readonly permission: number;
    readonly visible: boolean;
    readonly actor: Actor | null;
    readonly token: TokenDocument | null;
    readonly players: User[];
    readonly isDefeated: boolean;
    getInitiativeRoll(formula?: string): Roll;
    rollInitiative(formula?: string): Promise<Combatant>;
}

class User extends ClientDocument<BaseUser> {
    active: boolean;
    targets: Set<Token>;
    viewedScene: string | null;
    movingTokens: ReadonlySet<TokenDocument>;

    readonly isTrusted: boolean;
    readonly isSelf: boolean;
    readonly isActiveGM: boolean;
    readonly roleLabel: string;
    get lastActivityTime(): number;
    set lastActivityTime(timestamp: number);

    prepareDerivedData(): void;
}

class Scene extends ClientDocument<BaseScene> {
    _viewPosition: CanvasViewPosition;
    _view: boolean;
    grid: BaseGrid;
    dimensions: SceneDimensions;
    readonly thumbnail: string;
    readonly isView: boolean;

    pullUsers(users?: (User | string)[]): void;
    activate(): Promise<Scene>;
    view(): Promise<Scene>;
    unview(): Promise<Scene>;
    clone(
        createData?: PlainObject,
        options?: PlainObject,
    ): Scene | Promise<Scene>;
    reset(): void;
    toObject(source?: boolean): PlainObject;
    prepareBaseData(): void;
    getDimensions(): SceneDimensions;
    _onClickDocumentLink(event: Event): void;
    clearMovementHistories(): Promise<void>;
    updateTokenRegions(tokens?: Iterable<any>): Promise<any[]>;

    _onActivate(active: boolean): void;
    _onUpdate(changed: PlainObject, options: PlainObject, userId: string): void;
    _onDelete(options: PlainObject, userId: string): void;

    _preCreate(
        data: PlainObject,
        options: PlainObject,
        user: User,
    ): Promise<boolean | void>;
    _preUpdate(
        changed: PlainObject,
        options: PlainObject,
        user: User,
    ): Promise<boolean | void>;
    _onCreate(data: PlainObject, options: PlainObject, userId: string): void;

    _preCreateDescendantDocuments(
        parent: Document,
        collection: string,
        data: PlainObject[],
        options: PlainObject,
        userId: string,
    ): void;
    _preUpdateDescendantDocuments(
        parent: Document,
        collection: string,
        changes: PlainObject[],
        options: PlainObject,
        userId: string,
    ): void;
    _preDeleteDescendantDocuments(
        parent: Document,
        collection: string,
        ids: string[],
        options: PlainObject,
        userId: string,
    ): void;
    _onUpdateDescendantDocuments(
        parent: Document,
        collection: string,
        documents: Document[],
        changes: PlainObject[],
        options: PlainObject,
        userId: string,
    ): void;

    toCompendium(pack: any, options?: PlainObject): any;
    createThumbnail(options?: {
        img?: string | null;
        width?: number;
        height?: number;
        format?: string;
        quality?: number;
    }): Promise<{ thumb: string }>;
}

/**
 * The client-side Macro document which extends the common BaseMacro model.
 *
 * @category Documents
 * @see {@link foundry.documents.collections.Macros}
 * @see {@link foundry.applications.sheets.MacroConfig}
 */
class Macro extends ClientDocumentMixin<BaseMacro> {
    /** Is the current User the author of this macro? */
    get isAuthor(): boolean;

    /** Test whether the current User is capable of executing this Macro. */
    get canExecute(): boolean;

    /** Provide a thumbnail image path used to represent this document. */
    get thumbnail(): string;

    /**
     * Test whether the given User is capable of executing this Macro.
     * @param user - The User to test
     * @returns Can this User execute this Macro?
     */
    canUserExecute(user: User): boolean;

    /**
     * Execute the Macro command.
     * @param scope - Macro execution scope which is passed to script macros
     * @returns A promise containing a ChatMessage (or `undefined`) if a chat macro,
     *          or the return value if a script macro.
     *          A void return is possible if execution is denied or fails.
     */
    execute(scope?: {
        speaker?: ChatSpeakerData;
        actor?: Actor;
        token?: Token;
        event?: Event | RegionEvent;
        [key: string]: unknown;
    }): Promise<unknown> | void;

    /**
     * @internal
     * Execute the command as a chat macro.
     * @param speaker - The speaker data
     * @returns A promise that resolves to a created ChatMessage or void on error
     */
    #executeChat(speaker?: ChatSpeakerData): Promise<ChatMessage | void>;

    /**
     * @internal
     * Execute the command as a script macro.
     * @param scope - Execution scope
     * @returns The return value of the script, or void
     */
    #executeScript(scope?: {
        speaker?: ChatSpeakerData;
        actor?: Actor;
        token?: Token;
        [key: string]: unknown;
    }): Promise<unknown> | void;

    /** @inheritDoc */
    protected _onClickDocumentLink(event: MouseEvent): unknown;

    /** @inheritDoc */
    protected _onCreate(
        data: Record<string, unknown>,
        options: { hotbarSlot?: number },
        userId: string,
    ): void;
}

/**
 * A fully measured movement waypoint including all necessary data.
 */
class TokenMeasuredMovementWaypoint {
    x: number; // Top-left x-coordinate in pixels
    y: number; // Top-left y-coordinate in pixels
    elevation: number; // Elevation in grid units
    width: number; // Width in grid spaces
    height: number; // Height in grid spaces
    shape: TOKEN_SHAPES; // Shape type
    action: string; // Movement action
    teleport: boolean; // Is teleportation
    forced: boolean; // Is forced movement
    terrain: DataModel | null; // Terrain data for this segment
    snapped: boolean; // Was snapped to grid
    explicit: boolean; // Explicitly placed by user
    checkpoint: boolean; // Is a checkpoint
    intermediate: boolean; // Is an intermediate waypoint
    userId: string; // User ID who moved the token
    cost: number; // Cost to reach this waypoint
}

/**
 * A cleaner form of the movement waypoint used for planning or input.
 * Excludes measured-only or system-added metadata.
 */
type TokenMovementWaypoint = Omit<
    TokenMeasuredMovementWaypoint,
    "terrain" | "intermediate" | "userId" | "cost"
>;

/**
 * A raw waypoint used to initiate movement path measurement.
 * Allows partial of positional or shape-related attributes.
 */
class TokenMeasureMovementPathWaypoint {
    x?: number;
    y?: number;
    elevation?: number;
    width?: number;
    height?: number;
    shape?: TOKEN_SHAPES;
    action?: string;
    teleport?: boolean;
    forced?: boolean;
    terrain?: DataModel | null;
    cost?: number | TokenMovementCostFunction;
}

/**
 * A function that calculates movement cost between two points.
 */
type TokenMovementCostFunction = (
    from: { i: number; j: number; k: number },
    to: { i: number; j: number; k: number },
    distance: number,
    segment: object,
) => number;

class TokenDocument extends ClientDocument<BaseToken> {
    readonly movement: PlainObject;
    _movementContinuation: PlainObject;
    readonly actors: Collection<string, Actor>;
    get actor(): Actor | null;
    get baseActor(): Actor | null;
    get isOwner(): boolean;
    get isLinked(): boolean;
    get isSecret(): boolean;
    get combatant(): Combatant | null;
    get inCombat(): boolean;
    get movementHistory(): TokenMeasuredMovementWaypoint[];
    readonly regions: Set<any>;

    // From ClientDocument
    prepareData(): void;
    prepareBaseData(): void;
    prepareEmbeddedDocuments(): void;
    prepareDerivedData(): void;
    render(force?: boolean, context?: PlainObject): void;
    sortRelative(options?: {
        updateData?: PlainObject;
        sortOptions?: PlainObject;
    }): Promise<this>;

    getBarAttribute(
        barName: string,
        options?: { alternative?: string },
    ): object | null;
    hasStatusEffect(statusId: string): boolean;
    move(
        waypoints: PlainObject | PlainObject[],
        options?: Partial<{
            method: string;
            constrainOptions: any;
            autoRotate: boolean;
            showRuler: boolean;
        }>,
    ): Promise<boolean>;
    resize(dimensions: PlainObject, options?: PlainOject): Promise<boolean>;
    stopMovement(): boolean;
    pauseMovement(): Function | null;
    pauseMovement(key: string): Promise<boolean> | null;
    resumeMovement(movementId: string, key: string): void;
    clearMovementHistory(): Promise<void>;
    updateVisionMode(
        visionMode: string,
        defaults?: boolean,
    ): Promise<TokenDocument | undefined>;

    getCompleteMovementPath(waypoints: any[]): any[];

    measureMovementPath(
        waypoints: any[],
        options?: { cost?: unknown },
    ): unknown;

    toggleCombatant(options?: { active?: boolean }): Promise<boolean>;

    testInsideRegion(region: any, data?: PlainObject): boolean;
    segmentizeRegionMovementPath(
        region: any,
        waypoints: PlainObject[],
    ): PlainObject[];
}
class RollParser {
    formula: string;

    constructor(formula: string);

    protected _onExpression(
        head: RollParseNode,
        tail: [string[], RollParseNode][],
        leading: string | undefined,
        formula: string,
        error: (message: string) => never,
    ): RollParseTreeNode;

    protected _onDiceTerm(
        number: NumericRollParseNode | ParentheticalRollParseNode | null,
        faces:
            | string
            | NumericRollParseNode
            | ParentheticalRollParseNode
            | null,
        modifiers: string | null,
        flavor: string | null,
        formula: string,
    ): DiceRollParseNode;

    protected _onNumericTerm(
        number: number,
        flavor: string,
    ): NumericRollParseNode;

    protected _onFunctionTerm(
        fn: string,
        head: RollParseNode,
        tail: RollParseNode[],
        flavor: string,
        formula: string,
    ): FunctionRollParseNode;

    protected _onPoolTerm(
        head: RollParseNode,
        tail: RollParseNode[],
        modifiers: string | null,
        flavor: string | null,
        formula: string,
    ): PoolRollParseNode;

    protected _onParenthetical(
        term: RollParseNode,
        flavor: string | null,
        formula: string,
    ): ParentheticalRollParseNode;

    protected _onStringTerm(
        term: string,
        flavor?: string | null,
    ): StringParseNode;

    protected _collapseOperators(operators: string[]): string;

    protected _wrapNegativeTerm(term: RollParseNode): RollParseNode;

    static flattenTree(root: RollParseNode): RollParseNode[];

    static toAST(root: RollParseNode | RollTerm[]): RollParseNode;

    static isOperatorTerm(node: RollParseNode | RollTerm): boolean;

    static formatList(list: RollParseArg[]): string;

    static formatArg(arg: RollParseArg): string;

    static formatDebug(method: string, ...args: RollParseArg[]): string;
}

export class Roll {
    constructor(formula: string, data?: object, options?: RollOptions);

    data: object;
    options: RollOptions;
    terms: RollTerm[];
    _dice: DiceTerm[];
    _formula: string;
    _evaluated: boolean;
    _total?: number;
    _root?: Roll;
    _resolver?: RollResolver;

    get dice(): DiceTerm[];
    get formula(): string;
    get result(): string;
    get total(): number;
    get product(): any;
    get isDeterministic(): boolean;

    alter(
        multiply: number,
        add: number,
        options?: { multiplyNumeric?: boolean },
    ): Roll;
    clone(): Roll;
    evaluate(options?: RollOptions): Promise<Roll>;
    evaluateSync(options?: RollOptions): Roll;
    roll(options?: RollOptions): Promise<Roll>;
    reroll(options?: RollOptions): Promise<Roll>;
    resetFormula(): string;
    propagateFlavor(flavor: string): void;
    toString(): string;
    toJSON(): object;
    toAnchor(options?: RollAnchorOptions): HTMLAnchorElement;
    getTooltip(): Promise<string>;
    render(options?: RollRenderOptions): Promise<string>;
    toMessage(
        messageData?: object,
        options?: { rollMode?: string; create?: boolean },
    ): Promise<ChatMessage | object>;

    static create(formula: string, data?: object, options?: object): Roll;
    static get defaultImplementation(): typeof Roll;
    static get resolverImplementation(): typeof RollResolver;
    static getFormula(terms: RollTerm[]): string;
    static safeEval(expression: string): number;
    static simulate(formula: string, n?: number): Promise<number[]>;
    static registerResult(
        method: string,
        denomination: string,
        result: number,
    ): boolean | void;
    static parse(formula: string, data: object): RollTerm[];
    static instantiateAST(ast: RollParseNode): RollTerm[];
    static replaceFormulaData(
        formula: string,
        data: object,
        options?: ReplaceFormulaOptions,
    ): string;
    static validate(formula: string): boolean;
    static identifyFulfillableTerms(terms: RollTerm[]): DiceTerm[];
    static _classifyStringTerm(
        term: string,
        options?: ClassifyOptions,
    ): RollTerm;
    static expandInlineResult(a: HTMLAnchorElement): Promise<void>;
    static collapseInlineResult(a: HTMLAnchorElement): void;
    static fromData(data: object): Roll;
    static fromJSON(json: string): Roll;
    static fromTerms(terms: RollTerm[], options?: object): Roll;
}

class MersenneTwister {
    constructor(seed?: number);

    SEED: number;
    mt: number[];
    mti: number;
    MAX_INT: number;
    N: number;
    M: number;
    UPPER_MASK: number;
    LOWER_MASK: number;
    MATRIX_A: number;

    seed(seed: number): number;
    seedArray(vector: number[]): void;
    int(): number;
    int31(): number;
    real(): number;
    realx(): number;
    rnd(): number;
    random(): number;
    rndHiRes(): number;
    normal(mu: number, sigma: number): number;

    static random(): number;
    static normal(mu: number, sigma: number): number;
}

class RollTerm {
    constructor(termData?: { options?: object });
    options: object;
    _evaluated: boolean;
    _root?: Roll;
    isIntermediate: boolean;

    static FLAVOR_REGEXP_STRING: string;
    static FLAVOR_REGEXP: RegExp;
    static REGEXP: RegExp | undefined;
    static SERIALIZE_ATTRIBUTES: string[];

    get expression(): string;
    get formula(): string;
    get total(): number | string | void;
    get flavor(): string;
    get isDeterministic(): boolean;
    get resolver(): RollResolver | undefined;

    evaluate(options?: object): Promise<RollTerm> | RollTerm;
    protected _evaluate(options?: object): Promise<RollTerm> | RollTerm;

    static isDeterministic(
        term: RollTerm,
        options?: { maximize?: boolean; minimize?: boolean },
    ): boolean;
    static fromData(data: any): RollTerm;
    static fromParseNode(node: any): RollTerm;
    static _fromData(data: any): RollTerm;
    static fromJSON(json: string): RollTerm;

    toJSON(): any;
}

class DiceTerm extends RollTerm {
    constructor(termData: any);
    static DENOMINATION: string;
    static MODIFIERS: Record<string, string | Function>;
    static MODIFIERS_REGEXP_STRING: string;
    static MODIFIER_REGEXP: RegExp;
    static REGEXP: RegExp;
    static SERIALIZE_ATTRIBUTES: string[];

    modifiers: string[];
    results: any[];

    get method(): string;
    set method(method: string);
    get number(): number | void;
    set number(value: number | Roll);
    get faces(): number | void;
    set faces(value: number | Roll);
    get expression(): string;
    get denomination(): string;
    get dice(): DiceTerm[];
    get total(): number | undefined;
    get values(): number[];
    get isDeterministic(): boolean;

    alter(multiply: number, add: number): DiceTerm;
    _evaluate(options?: object): Promise<DiceTerm> | DiceTerm;
    protected _evaluateAsync(options?: object): Promise<DiceTerm>;
    protected _evaluateSync(options?: object): DiceTerm;
    roll(options?: object): Promise<any>;
    protected _roll(options?: object): Promise<number | void>;
    protected mapRandomFace(randomUniform: number): number;
    randomFace(): number;
    getResultLabel(result: any): string;
    getResultCSS(result: any): (string | null)[];
    getTooltipData(): any;
    protected _evaluateModifiers(): Promise<void>;
    protected _evaluateModifier(
        command: string,
        modifier: string,
    ): Promise<void>;

    static compareResult(
        result: number,
        comparison: string,
        target: number,
    ): boolean;
    static _keepOrDrop(
        results: any[],
        number: number,
        options?: { keep?: boolean; highest?: boolean },
    ): any[];
    static _applyCount(
        results: any[],
        comparison: string,
        target: number,
        options?: {
            flagSuccess?: boolean;
            flagFailure?: boolean;
        },
    ): void;
    static _applyDeduct(
        results: any[],
        comparison: string,
        target: number,
        options?: {
            deductFailure?: boolean;
            invertFailure?: boolean;
        },
    ): void;
    static matchTerm(
        expression: string,
        options?: { imputeNumber?: boolean },
    ): RegExpMatchArray | null;
    static fromMatch(match: RegExpMatchArray): DiceTerm;
    static fromParseNode(node: any): DiceTerm;
    static _fromData(data: any): DiceTerm;
    toJSON(): any;
}

class Die extends DiceTerm {
    static DENOMINATION: string;
    static MODIFIERS: Record<string, string | Function>;
    get total(): number;
    get denomination(): string;

    reroll(
        modifier: string,
        options?: { recursive?: boolean },
    ): Promise<false | void>;
    rerollRecursive(modifier: string): Promise<false | void>;
    explode(
        modifier: string,
        options?: { recursive?: boolean },
    ): Promise<false | void>;
    explodeOnce(modifier: string): Promise<false | void>;
    keep(modifier: string): void;
    drop(modifier: string): void;
    countSuccess(modifier: string): void;
    countFailures(modifier: string): void;
    countEven(modifier: string): void;
    countOdd(modifier: string): void;
    deductFailures(modifier: string): void;
    subtractFailures(modifier: string): void;
    marginSuccess(modifier: string): void;
    minimum(modifier: string): void;
    maximum(modifier: string): void;
}

class Coin extends DiceTerm {
    static DENOMINATION: string;
    static MODIFIERS: Record<string, string | Function>;

    roll(options?: object): Promise<any>;
    getResultLabel(result: any): string;
    getResultCSS(result: any): (string | null)[];
    mapRandomFace(randomUniform: number): number;
    call(modifier: string): boolean | void;
}

class FateDie extends DiceTerm {
    static DENOMINATION: string;
    static MODIFIERS: Record<string, string | Function>;

    roll(options?: object): Promise<any>;
    mapRandomFace(randomUniform: number): number;
    getResultLabel(result: any): string;
}

class FunctionTerm extends RollTerm {
    constructor(data?: any);

    fn: string;
    terms: string[];
    rolls: Roll[];
    result: string | number;

    static SERIALIZE_ATTRIBUTES: string[];
    get dice(): DiceTerm[];
    get total(): string | number;
    get expression(): string;
    get function(): any;
    get isDeterministic(): boolean;

    _evaluate(options?: object): Promise<FunctionTerm> | FunctionTerm;
    protected _evaluateAsync(options?: object): Promise<FunctionTerm>;
    protected _evaluateSync(options?: object): FunctionTerm;
    protected parseArgument(roll: Roll): string | number;
    static _fromData(data: any): FunctionTerm;
    toJSON(): any;
    static fromParseNode(node: any): FunctionTerm;
}

class NumericTerm extends RollTerm {
    constructor(data?: any);
    number: number;

    static REGEXP: RegExp;
    static SERIALIZE_ATTRIBUTES: string[];

    get expression(): string;
    get total(): number;

    static matchTerm(expression: string): RegExpMatchArray | null;
    static fromMatch(match: RegExpMatchArray): NumericTerm;
}

class OperatorTerm extends RollTerm {
    constructor(data?: any);
    operator: string;

    static PRECEDENCE: Readonly<Record<string, number>>;
    static OPERATORS: string[];
    static REGEXP: RegExp;
    static SERIALIZE_ATTRIBUTES: string[];

    get flavor(): string;
    get expression(): string;
    get total(): string;

    static _fromData(data: any): OperatorTerm;
}

class ParentheticalTerm extends RollTerm {
    constructor(data: { term: string; roll?: Roll; options?: object });
    term: string;
    roll?: Roll;

    static OPEN_REGEXP: RegExp;
    static CLOSE_REGEXP: RegExp;
    static SERIALIZE_ATTRIBUTES: string[];

    get dice(): DiceTerm[];
    get total(): number;
    get expression(): string;
    get isDeterministic(): boolean;

    _evaluate(options?: object): Promise<RollTerm> | RollTerm;
    protected _evaluateAsync(roll: Roll, options?: object): Promise<RollTerm>;
    protected _evaluateSync(roll: Roll, options?: object): RollTerm;

    static fromTerms(terms: RollTerm[], options?: object): ParentheticalTerm;
    static fromParseNode(node: any): ParentheticalTerm;
}

class PoolTerm extends RollTerm {
    constructor(data?: any);
    terms: string[];
    modifiers: string[];
    rolls: Roll[];
    results: any[];

    static MODIFIERS: Record<string, string | Function>;
    static OPEN_REGEXP: RegExp;
    static CLOSE_REGEXP: RegExp;
    static REGEXP: RegExp;
    static SERIALIZE_ATTRIBUTES: string[];

    get dice(): DiceTerm[];
    get expression(): string;
    get total(): number | undefined;
    get values(): number[];
    get isDeterministic(): boolean;

    alter(...args: any[]): PoolTerm;
    _evaluate(options?: object): Promise<PoolTerm> | PoolTerm;
    protected _evaluateAsync(options?: object): Promise<PoolTerm>;
    protected _evaluateSync(options?: object): PoolTerm;

    protected _evaluateModifiers(): Promise<void>;
    protected _evaluateModifier(
        command: string,
        modifier: string,
    ): Promise<void>;

    static _fromData(data: any): PoolTerm;
    toJSON(): any;

    static fromExpression(formula: string, options?: object): PoolTerm | null;
    static fromRolls(rolls: Roll[]): PoolTerm;
    static fromParseNode(node: any): PoolTerm;

    keep(modifier: string): void;
    drop(modifier: string): void;
    countSuccess(modifier: string): void;
    countFailures(modifier: string): void;
}

class StringTerm extends RollTerm {
    constructor(data?: { term: string; options?: object });
    term: string;

    static SERIALIZE_ATTRIBUTES: string[];

    get expression(): string;
    get total(): string;
    get isDeterministic(): boolean;

    evaluate(options?: { allowStrings?: boolean }): StringTerm;
}

/**
 * A reusable storage concept which blends the functionality of an Array with the efficient key-based lookup of a Map.
 * This concept is reused throughout Foundry VTT where a collection of uniquely identified elements is required.
 * @template K The key type, usually string.
 * @template V The value type.
 */
class Collection<K extends string = string, V = any> extends Map<K, V> {
    constructor(entries?: readonly (readonly [K, V])[] | null);

    /** Iterate over the values of the collection. */
    [Symbol.iterator](): IterableIterator<V>;

    /** Return an Array of all values in the Collection. */
    readonly contents: V[];

    /**
     * Find an entry in the Collection using a functional condition.
     * @param condition The functional condition to test.
     * @returns The value, if found, otherwise undefined.
     */
    find(
        condition: (value: V, index: number, collection: this) => boolean,
    ): V | undefined;

    /**
     * Filter the Collection, returning an Array of entries which match a functional condition.
     * @param condition The functional condition to test.
     * @returns An Array of matched values.
     */
    filter(
        condition: (value: V, index: number, collection: this) => boolean,
    ): V[];

    /**
     * Apply a function to each element of the collection.
     * @param fn A function to apply to each element.
     */
    forEach(fn: (value: V, index: number, collection: this) => void): void;

    /**
     * Get an element from the Collection by its key.
     * @param key The key of the entry to retrieve.
     * @param options Additional options.
     * @returns The retrieved entry value, if the key exists, otherwise undefined.
     */
    get(key: K, options?: { strict?: boolean }): V | undefined;

    /**
     * Get an entry from the Collection by name.
     * Use of this method assumes that the objects stored have a "name" attribute.
     * @param name The name of the entry to retrieve.
     * @param options Additional options.
     * @returns The retrieved entry value, if found, otherwise undefined.
     */
    getName(name: string, options?: { strict?: boolean }): V | undefined;

    /**
     * Transform each element of the Collection into a new form, returning an Array of transformed values.
     * @param transformer A transformation function applied to each entry value.
     * @returns An Array of transformed values.
     */
    map<U>(transformer: (value: V, index: number, collection: this) => U): U[];

    /**
     * Reduce the Collection by applying an evaluator function and accumulating entries.
     * @param reducer A reducer function applied to each entry value.
     * @param initial An initial value which accumulates with each iteration.
     * @returns The accumulated result.
     */
    reduce<U>(
        reducer: (
            accumulator: U,
            value: V,
            index: number,
            collection: this,
        ) => U,
        initial: U,
    ): U;

    /**
     * Test whether a condition is met by some entry in the Collection.
     * @param condition The functional condition to test.
     * @returns Was the test condition passed by at least one entry?
     */
    some(
        condition: (value: V, index: number, collection: this) => boolean,
    ): boolean;

    /**
     * Convert the Collection to a primitive array of its contents.
     * @returns An array of contained values.
     */
    toJSON(): any[];
}

/**
 * Represents an HTTP Error when a non-OK response is returned by Fetch.
 */
class HttpError extends Error {
    constructor(statusText: string, code: number, displayMessage?: string);

    /** The HTTP response status code. */
    readonly code: number;

    /** The display message for the error. */
    readonly displayMessage: string;

    override toString(): string;
}

class LineIntersection {
    x: number;
    y: number;
    t0: number;
    t1?: number;
}

class LineCircleIntersection {
    aInside: boolean;
    bInside: boolean;
    contained: boolean;
    outside: boolean;
    tangent: boolean;
    intersections: Point[];
}

/**
 * A 2D point.
 */
class Point {
    x: number;
    y: number;
}

class ContextMenuEntry {
    name: string;
    icon?: string;
    classes?: string;
    group?: string;
    callback: ContextMenuJQueryCallback;
    condition?: ContextMenuCondition | boolean;
}

type ContextMenuCondition = (html: JQuery | HTMLElement) => boolean;

type ContextMenuCallback = (target: HTMLElement) => unknown;

type ContextMenuJQueryCallback = (target: HTMLElement | JQuery) => unknown;

interface ContextMenuOptions {
    eventName?: string;
    onOpen?: ContextMenuCallback;
    onClose?: ContextMenuCallback;
    fixed?: boolean;
    jQuery?: boolean;
}

interface ContextMenuRenderOptions {
    event?: Event;
    animate?: boolean;
}

class ContextMenu {
    constructor(
        container: HTMLElement | JQuery,
        selector: string,
        menuItems: ContextMenuEntry[],
        options?: ContextMenuOptions,
    );

    static create(
        app: any, // Application V1 only
        html: HTMLElement | JQuery,
        selector: string,
        menuItems: ContextMenuEntry[],
        options?: Partial<ContextMenuOptions> & { hookName?: string },
    ): ContextMenu;

    static eventListeners(): void;
    static get implementation(): typeof ContextMenu;

    readonly element: HTMLElement;
    readonly selector: string;
    readonly eventName: string;
    readonly menuItems: (ContextMenuEntry & { element?: HTMLElement })[];
    readonly onOpen?: ContextMenuCallback;
    readonly onClose?: ContextMenuCallback;
    readonly expandUp: boolean;
    readonly fixed: boolean;
    readonly target: HTMLElement;

    render(
        target: HTMLElement,
        options?: ContextMenuRenderOptions,
    ): Promise<void>;
    close(options?: ContextMenuRenderOptions): Promise<void>;
    activateListeners(menu: HTMLElement): void;
}

class HotbarSlotData {
    slot: number;
    macro: Macro | null;
    key: number;
    tooltip: string;
    ariaLabel: string;
    style: string;
}

/**
 * An action bar displayed at the bottom of the game view which contains Macros as interactive buttons.
 * The Hotbar supports 5 pages of macros which can be dragged and dropped to organize as you wish.
 * Left-clicking a Macro button triggers its effect.
 * Right-clicking the button displays a context menu of Macro options.
 * The number keys 1 through 0 activate numbered hotbar slots.
 */
class Hotbar extends ApplicationV2 implements HandlebarsApplication {
    static readonly DEFAULT_OPTIONS: any;
    static readonly PARTS: any;

    protected _evaluated: boolean;
    protected _root: any;

    protected get page(): number;
    protected get slots(): HotbarSlotData[];
    protected get locked(): boolean;

    /** @internal */
    protected _prepareContext(_options?: any): Promise<any>;

    /** @internal */
    protected _onFirstRender(_context: any, _options: any): Promise<void>;

    /** @internal */
    protected _onRender(_context: any, _options: any): Promise<void>;

    /** @internal */
    protected _onResize(): void;

    /** @protected */
    protected _getContextMenuOptions(): ContextMenuEntry[];

    /** Change to a specific numbered page from 1 to 5 */
    changePage(page: number): Promise<void>;

    /** Cycle the page of the hotbar by one step */
    cyclePage(direction: number): Promise<void>;

    /** Static helper to toggle a document sheet using its UUID */
    static toggleDocumentSheet(uuid: string): Promise<void>;

    /** @internal */
    protected static #onExecute(event: PointerEvent): Promise<void>;

    /** @internal */
    protected static #onToggleLock(): Promise<void>;

    /** @internal */
    protected static #onToggleMute(): Promise<void>;

    /** @internal */
    protected static #onToggleMenu(): Promise<void>;

    /** @internal */
    protected static #onClear(): Promise<void>;

    /** @internal */
    protected static #onPage(event: PointerEvent): Promise<void>;

    /** @internal */
    protected #onDragStart(event: DragEvent): void;

    /** @internal */
    protected #onDragOver(event: DragEvent): void;

    /** @internal */
    protected #onDragDrop(event: DragEvent): Promise<void>;

    /** @protected */
    protected _createRollTableRollMacro(table: any): Promise<Macro>;

    /** @protected */
    protected _createDocumentSheetToggle(doc: any): Promise<Macro>;

    /**
     * @deprecated since v13
     */
    get macros(): HotbarSlotData[];

    /**
     * @deprecated since v13
     */
    collapse(): void;

    /**
     * @deprecated since v13
     */
    expand(): void;
}

/**
 * Options for rendering parts of a HandlebarsApplication.
 */
interface HandlebarsRenderOptions {
    parts: string[];
}

/**
 * A part of the Handlebars template application, including template path and metadata.
 */
class HandlebarsTemplatePart {
    template: string;
    id?: string;
    root?: boolean;
    classes?: string[];
    templates?: string[];
    scrollable?: string[];
    forms?: Record<string, ApplicationFormConfiguration>;
}

/**
 * An Application augmented with Handlebars templating and partial rendering.
 * Extends the base ApplicationV2 with part-based rendering logic.
 */
class HandlebarsApplication extends ApplicationV2<
    ApplicationConfiguration,
    HandlebarsRenderOptions
> {
    constructor(...args: any[]);

    /**
     * The template part definitions for this application.
     * Each key corresponds to a named part of the UI, such as a sidebar or panel.
     */
    static PARTS: Record<string, HandlebarsTemplatePart>;

    /**
     * A record of the currently rendered parts and their root DOM elements.
     */
    get parts(): Record<string, HTMLElement>;

    /**
     * Prepare a context specific to a single rendered part.
     * @param partId - The part being rendered.
     * @param context - Shared context from _prepareContext.
     * @param options - The rendering options.
     * @returns A Promise resolving to the part-specific context.
     */
    protected _preparePartContext(
        partId: string,
        context: ApplicationRenderContext,
        options: HandlebarsRenderOptions,
    ): Promise<ApplicationRenderContext>;

    /**
     * Hook for customizing template parts during configuration.
     * @param options - The rendering options.
     * @returns The set of configured template parts.
     */
    protected _configureRenderParts(
        options: HandlebarsRenderOptions,
    ): Record<string, HandlebarsTemplatePart>;

    /**
     * Synchronize a rendered part's DOM state with its previous version.
     */
    protected _preSyncPartState(
        partId: string,
        newElement: HTMLElement,
        priorElement: HTMLElement,
        state: any,
    ): void;

    protected _syncPartState(
        partId: string,
        newElement: HTMLElement,
        priorElement: HTMLElement,
        state: any,
    ): void;

    /**
     * Attach listeners to a rendered template part.
     */
    protected _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: PlainObject,
    ): void;

    /**
     * Tear down the application, clearing parts.
     */
    protected _tearDown(options: PlainObject): void;
}

/**
 * Represents a failure encountered during data model validation.
 */
class DataModelValidationFailure {
    constructor(options?: {
        invalidValue?: any;
        fallback?: any;
        dropped?: boolean;
        message?: string;
        unresolved?: boolean;
    });

    /** The value that failed validation for this field. */
    invalidValue: any;

    /** The value it was replaced by, if any. */
    fallback: any;

    /** Whether the value was dropped from some parent collection. */
    dropped: boolean;

    /** The validation error message. */
    message: string;

    /**
     * A collection of sub-field validation failures.
     */
    fields: Record<string, DataModelValidationFailure>;

    /**
     * A list of element-level validation failures.
     */
    elements: Array<{
        id: string | number;
        name?: string;
        failure: DataModelValidationFailure;
    }>;

    /**
     * Whether this failure or any nested failure was unresolved.
     */
    unresolved: boolean;

    /**
     * Represent the failure as an Error instance.
     */
    asError(): DataModelValidationError;

    /**
     * Whether this failure contains no sub-failures.
     */
    isEmpty(): boolean;

    /**
     * Return the base-level failure properties, omitting nested failures.
     */
    toObject(): {
        invalidValue: any;
        fallback: any;
        dropped: boolean;
        message: string;
    };

    /**
     * Return a string representation of this validation failure.
     */
    toString(): string;
}

/**
 * A specialized Error class to represent data model validation failures.
 */
class DataModelValidationError extends Error {
    constructor(failure: DataModelValidationFailure | string, ...params: any[]);

    /**
     * Retrieve a specific failure or sub-failure from this error.
     * @param path The dotted path to the desired failure.
     */
    getFailure(path?: string): DataModelValidationFailure | undefined;

    /**
     * Retrieve a flattened map of all validation failures.
     */
    getAllFailures(): Record<string, DataModelValidationFailure> | undefined;

    /**
     * Log all validation failures as a table to the console.
     */
    logAsTable(): void;

    /**
     * Render a tree view of the failure hierarchy as an HTML string.
     */
    asHTML(): string;
}

class LightAnimationData {
    type: string | null;
    speed: number;
    intensity: number;
    reverse: boolean;
}

class DarknessRange {
    min: number;
    max: number;
}

class LightData extends DataModel {
    negative: boolean;
    priority: number;
    alpha: number;
    angle: number;
    bright: number;
    color: string;
    coloration: number;
    contrast: number;
    dim: number;
    attenuation: number;
    luminosity: number;
    saturation: number;
    shadows: number;
    animation: LightAnimationData;
    darkness: DarknessRange;
}

class ShapeData extends DataModel {
    type: string;
    width?: number;
    height?: number;
    radius?: number;
    points?: number[];
}

class BaseShapeData extends DataModel {
    static TYPES: Readonly<{
        rectangle: typeof RectangleShapeData;
        circle: typeof CircleShapeData;
        ellipse: typeof EllipseShapeData;
        polygon: typeof PolygonShapeData;
    }>;

    type: string;
    hole?: boolean;
}

class RectangleShapeData extends BaseShapeData {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
}

class CircleShapeData extends BaseShapeData {
    x: number;
    y: number;
    radius: number;
}

class EllipseShapeData extends BaseShapeData {
    x: number;
    y: number;
    radiusX: number;
    radiusY: number;
    rotation: number;
}

class PolygonShapeData extends BaseShapeData {
    points: number[];
}

type TextureDataFitMode = "fill" | "contain" | "cover" | "none" | string;

class TextureDataProps {
    src: string | null;
    anchorX?: number;
    anchorY?: number;
    scaleX?: number;
    scaleY?: number;
    offsetX?: number;
    offsetY?: number;
    fit?: TextureDataFitMode;
    rotation?: number;
    tint?: string;
    alphaThreshold?: number;
}

class TextureData extends SchemaField {
    constructor(
        options?: any,
        srcOptions?: {
            categories?: string[];
            initial?: Partial<TextureDataProps>;
            wildcard?: boolean;
            label?: string;
        },
    );
}

class PrototypeToken extends DataModel {
    randomImg: boolean;
    appendNumber: boolean;
    prependAdjective: boolean;
    get actor(): BaseActor;
    update(data: object, options: object): Promise<any>;
    getFlag(...args: any[]): any;
    setFlag(...args: any[]): any;
    unsetFlag(...args: any[]): Promise<any>;
    testUserPermission(user: any, permission: any, options?: any): boolean;
    get isOwner(): boolean;
}

class PrototypeTokenOverrides extends DataModel {
    static get overrides(): PrototypeTokenOverrides;
    static set overrides(value: PrototypeTokenOverrides | null);
    static applyOverrides(source: object, actorType?: string): void;
    static applyAll(): void;
}

class TombstoneData extends DataModel {
    _id: string;
    _tombstone: true;
}

const TOKEN_SHAPES: StrictObject<string>;

/**
 * The rendered position of an Application within the window.
 */
class ApplicationPosition {
    top?: number;
    left?: number;
    width?: number | "auto";
    height?: number | "auto";
    scale?: number;
    zIndex?: number;
}

/**
 * The context data provided to an Application's render lifecycle methods.
 */
class ApplicationRenderContext {
    tabs?: Record<string, ApplicationTab>;
}

/**
 * Information about a single tab in a tab group.
 */
class ApplicationTab {
    group: string;
    id: string;
    active: boolean;
    cssClass: string;
    label?: string;
}

class GridConfig {
    size: number;
    distance: number;
    units: string;
    style: number;
    thickness: number;
    color: number;
    alpha: number;
}

abstract class BaseGrid {
    constructor(config: GridConfig);

    readonly type: number;
    readonly size: number;
    readonly distance: number;
    readonly units: string;

    isHexagonal: boolean;

    calculateDimensions(
        width: number,
        height: number,
        padding: number,
    ): {
        width: number;
        height: number;
        x: number;
        y: number;
        rows: number;
        columns: number;
    };
}

class SceneDimensions {
    /** The total width of the canvas in pixels */
    width: number;

    /** The total height of the canvas in pixels */
    height: number;

    /** The size of each grid space in pixels */
    size: number;

    /** A rectangle representing the area of the grid */
    rect: PIXI.Rectangle;

    /** The X offset for the scene background */
    sceneX: number;

    /** The Y offset for the scene background */
    sceneY: number;

    /** The width of the scene background in pixels */
    sceneWidth: number;

    /** The height of the scene background in pixels */
    sceneHeight: number;

    /** A rectangle representing the area of the scene background */
    sceneRect: PIXI.Rectangle;

    /** The units of distance per grid size */
    distance: number;

    /** The number of pixels per distance unit */
    distancePixels: number;

    /** The aspect ratio of the scene */
    ratio: number;

    /** The maximum diagonal distance across the scene */
    maxR: number;

    /** The number of grid rows */
    rows: number;

    /** The number of grid columns */
    columns: number;
}

export const GameAPI: {
    settings: PlainObject;
    actors: Collection<string, Actor>;
    items: Collection<string, Item>;
    scenes: Collection<string, Scene>;
    canvas: PlainObject;
    users: Collection<string, User>;
    time: PlainObject;
    combat: Combat | null;
    i18n: PlainObject;
};

/**
 * A helper type to represent a class with both static and instance members.
 */
type ClassType<Ctor, Instance> = {
    new (...args: ConstructorParameters<Ctor>): Instance;
} & Ctor;

/**
 * Aliases for accessing Foundry VTT globals in a structured and mockable way.
 */
export interface FoundryAPI {
    abstract: {
        DataModel: ClassType<typeof DataModel, DataModel>;
        Document: ClassType<typeof Document, Document>;
        TypeDataModel: ClassType<typeof TypeDataModel, TypeDataModel>;
    };
    applications: {
        api: {
            ApplicationV2: ClassType<typeof ApplicationV2, ApplicationV2>;
            DocumentSheetV2: ClassType<typeof DocumentSheetV2, DocumentSheetV2>;
            DialogV2: ClassType<typeof DialogV2, DialogV2>;
        };
        sheets: {
            ActorSheetV2: ClassType<typeof ActorSheetV2, ActorSheetV2>;
            ItemSheetV2: ClassType<typeof ItemSheetV2, ItemSheetV2>;
        };
        ux: {
            FormDataExtended: ClassType<
                typeof FormDataExtended,
                FormDataExtended
            >;
        };
        ui: {
            ContextMenu: ClassType<typeof ContextMenu, ContextMenu>;
            Hotbar: ClassType<typeof Hotbar, Hotbar>;
        };
        handlebars: {
            /**
             * A map of pending Handlebars template load Promises.
             */
            promises: Record<string, Promise<Handlebars.TemplateDelegate>>;

            /**
             * Get and cache a Handlebars template from the server.
             * @param path - The URL path to the template.
             * @param id - An optional ID to register the template partial under.
             */
            getTemplate: (
                path: string,
                id?: string,
            ) => Promise<Handlebars.TemplateDelegate>;

            /**
             * Load and cache multiple templates.
             * @param paths - An array of paths or a record of ID to path.
             */
            loadTemplates: (
                paths: string[] | Record<string, string>,
            ) => Promise<Handlebars.TemplateDelegate[]>;

            /**
             * Render a Handlebars template with given data.
             * @param path - Path to the template.
             * @param data - Data context for rendering.
             */
            renderTemplate: (path: string, data: object) => Promise<string>;

            /**
             * Initialize all Handlebars helpers and extensions.
             */
            initialize: () => void;

            /** Template Helpers */

            checked: (value: unknown) => string;
            disabled: (value: unknown) => string;
            concat: (...values: any[]) => Handlebars.SafeString;
            editor: (
                content: string,
                options: Handlebars.HelperOptions,
            ) => Handlebars.SafeString;
            ifThen: (
                criteria: boolean,
                ifTrue: string,
                ifFalse: string,
            ) => string;
            localize: (
                value: string | Handlebars.SafeString,
                options: Handlebars.HelperOptions,
            ) => string;
            numberFormat: (
                value: number | string,
                options: Handlebars.HelperOptions,
            ) => Handlebars.SafeString;
            numberInput: (
                value: number,
                options: Handlebars.HelperOptions,
            ) => Handlebars.SafeString;
            object: (
                options: Handlebars.HelperOptions,
            ) => Record<string, unknown>;
            radioBoxes: (
                name: string,
                choices: Record<string, string>,
                options: Handlebars.HelperOptions,
            ) => Handlebars.SafeString;
            selectOptions: (
                choices: object | Array<object>,
                options: Handlebars.HelperOptions,
            ) => Handlebars.SafeString;
            formInput: (
                field: any,
                options: Handlebars.HelperOptions,
            ) => Handlebars.SafeString;
            formGroup: (
                field: any,
                options: Handlebars.HelperOptions,
            ) => Handlebars.SafeString;

            /** Handlebars Boolean Helpers */
            eq: (v1: unknown, v2: unknown) => boolean;
            ne: (v1: unknown, v2: unknown) => boolean;
            lt: (v1: unknown, v2: unknown) => boolean;
            gt: (v1: unknown, v2: unknown) => boolean;
            lte: (v1: unknown, v2: unknown) => boolean;
            gte: (v1: unknown, v2: unknown) => boolean;
            not: (pred: unknown) => boolean;
            and: (...args: unknown[]) => boolean;
            or: (...args: unknown[]) => boolean;
        };
    };
    canvas: {
        placeables: {
            Token: ClassType<typeof Token, Token>;
        };
    };
    data: {
        fields: PlainObject;
    };
    documents: {
        ActiveEffect: ClassType<typeof ActiveEffect, ActiveEffect>;
        Actor: ClassType<typeof Actor, Actor>;
        BaseActiveEffect: ClassType<typeof BaseActiveEffect, BaseActiveEffect>;
        BaseActor: ClassType<typeof BaseActor, BaseActor>;
        BaseChatMessage: ClassType<typeof BaseChatMessage, BaseChatMessage>;
        BaseCombat: ClassType<typeof BaseCombat, BaseCombat>;
        BaseCombatant: ClassType<typeof BaseCombatant, BaseCombatant>;
        BaseItem: ClassType<typeof BaseItem, BaseItem>;
        BaseScene: ClassType<typeof BaseScene, BaseScene>;
        BaseToken: ClassType<typeof BaseToken, BaseToken>;
        ChatMessage: ClassType<typeof ChatMessage, ChatMessage>;
        Combat: ClassType<typeof Combat, Combat>;
        Combatant: ClassType<typeof Combatant, Combatant>;
        Item: ClassType<typeof Item, Item>;
        Scene: ClassType<typeof Scene, Scene>;
        TokenDocument: ClassType<typeof TokenDocument, TokenDocument>;
        User: ClassType<typeof User, User>;
    };
    dice: {
        RollParser: ClassType<typeof RollParser, RollParser>;
        Roll: ClassType<typeof Roll, Roll>;
        MersenneTwister: ClassType<typeof MersenneTwister, MersenneTwister>;
        terms: {
            Coin: ClassType<typeof Coin, Coin>;
            DiceTerm: ClassType<typeof DiceTerm, DiceTerm>;
            Die: ClassType<typeof Die, Die>;
            FateDie: ClassType<typeof FateDie, FateDie>;
            FunctionTerm: ClassType<typeof FunctionTerm, FunctionTerm>;
            NumericTerm: ClassType<typeof NumericTerm, NumericTerm>;
            OperatorTerm: ClassType<typeof OperatorTerm, OperatorTerm>;
            ParentheticalTerm: ClassType<
                typeof ParentheticalTerm,
                ParentheticalTerm
            >;
            PoolTerm: ClassType<typeof PoolTerm, PoolTerm>;
            RollTerm: ClassType<typeof RollTerm, RollTerm>;
            StringTerm: ClassType<typeof StringTerm, StringTerm>;
        };
    };
    utils: {
        Collection: ClassType<typeof Collection, Collection>;
        HttpError: ClassType<typeof HttpError, HttpError>;
        /**
         * A wrapper around `fetch` that attaches an AbortController signal for clean timeouts.
         * @param url - The URL to make the request to
         * @param data - The fetch init options
         * @param options - Additional timeout options
         * @returns A Promise resolving to the Response
         * @throws {HttpError}
         */
        fetchWithTimeout: (
            url: string,
            data?: RequestInit,
            options?: {
                timeoutMs?: number | null;
                onTimeout?: () => void;
            },
        ) => Promise<Response>;

        /**
         * A wrapper that fetches JSON with a timeout.
         * @param url - The URL to make the request to
         * @param data - The fetch init options
         * @param options - Additional timeout options
         * @returns A Promise resolving to the parsed JSON
         * @throws {HttpError}
         */
        fetchJsonWithTimeout: (
            url: string,
            data?: RequestInit,
            options?: {
                timeoutMs?: number | null;
                onTimeout?: () => void;
            },
        ) => Promise<any>;

        /**
         * Benchmark the performance of a function by calling it repeatedly.
         * @param func - The function to benchmark.
         * @param iterations - The number of iterations.
         * @param args - Additional arguments to pass to the function.
         */
        benchmark: (
            func: (...args: any[]) => any,
            iterations: number,
            ...args: any[]
        ) => Promise<void>;

        /**
         * A debugging function to simulate thread locking for a certain time.
         * @param ms - Time in milliseconds to lock.
         * @param debug - Log debug output periodically?
         */
        threadLock: (ms: number, debug?: boolean) => Promise<void>;

        /**
         * Create a debounced function that delays invoking the callback.
         * @param callback - The function to debounce.
         * @param delay - Delay in milliseconds.
         * @returns A debounced version of the function.
         */
        debounce: <T extends (...args: any[]) => any>(
            callback: T,
            delay: number,
        ) => (...args: Parameters<T>) => void;

        /**
         * Create a throttled function that ensures the callback is only invoked periodically.
         * @param callback - The function to throttle.
         * @param delay - Minimum delay between invocations.
         * @returns A throttled version of the function.
         */
        throttle: <T extends (...args: any[]) => any>(
            callback: T,
            delay: number,
        ) => (...args: Parameters<T>) => void;

        /**
         * A debounced function that reloads the page.
         */
        debouncedReload: () => void;

        /**
         * Recursively deep freezes a plain object.
         * @param obj - The object to freeze.
         * @param options - Optional strict mode.
         */
        deepFreeze: <T extends object>(
            obj: T,
            options?: { strict?: boolean },
        ) => Readonly<T>;

        /**
         * Recursively deep seals a plain object.
         * @param obj - The object to seal.
         * @param options - Optional strict mode.
         */
        deepSeal: <T extends object>(
            obj: T,
            options?: { strict?: boolean },
        ) => T;

        /**
         * Deep clone a plain object.
         * @param original - The object to clone.
         * @param options - Optional strict mode.
         */
        deepClone: <T>(original: T, options?: { strict?: boolean }) => T;

        /**
         * Compute the deep difference between two objects.
         * @param original - Original object.
         * @param other - Object to compare against.
         * @param options - Diffing options.
         */
        diffObject: (
            original: object,
            other: object,
            options?: { inner?: boolean; deletionKeys?: boolean },
        ) => object;

        /**
         * Apply special keys like "-=" and "==" to an object.
         * @param obj - The object to process.
         */
        applySpecialKeys: (obj: any) => any;

        /**
         * Check if two objects are deeply equal.
         * @param a - First object.
         * @param b - Second object.
         */
        objectsEqual: (a: object, b: object) => boolean;

        /**
         * Duplicate data via JSON methods.
         * @param original - The object to duplicate.
         */
        duplicate: <T>(original: T) => T;

        /**
         * Test if a key is a special deletion or replacement key.
         * @param key - The key to test.
         */
        isDeletionKey: (key: string) => boolean;

        /**
         * Check if a class is a subclass of another.
         * @param cls - The child class.
         * @param parent - The parent class.
         */
        isSubclass: (cls: Function, parent: Function) => boolean;

        /**
         * Get the defining class of a property.
         * @param obj - Object or constructor.
         * @param property - Property name.
         */
        getDefiningClass: (
            obj: object | Function,
            property: string,
        ) => Function | undefined;

        /**
         * Encode a URL string safely.
         * @param path - The URL or path string.
         */
        encodeURL: (path: string) => string;

        /**
         * Expand a flattened object into nested form.
         * @param obj - The flattened object.
         */
        expandObject: (obj: object) => object;

        /**
         * Filter an object based on a template structure.
         * @param source - Source object.
         * @param template - Template object.
         * @param options - Filtering options.
         */
        filterObject: (
            source: object,
            template: object,
            options?: {
                deletionKeys?: boolean;
                templateValues?: boolean;
            },
        ) => object;

        /**
         * Flatten a nested object into a single level with dot-notation keys.
         * @param obj - The object to flatten.
         */
        flattenObject: (obj: object, _d?: number) => object;

        /**
         * Get the parent classes of a class.
         * @param cls - Class constructor.
         */
        getParentClasses: (cls: Function) => Function[];

        /**
         * Compute a route path from a relative path.
         * @param path - The input path.
         * @param options - Optional prefix.
         */
        getRoute: (
            path: string,
            options?: { prefix?: string | null },
        ) => string;

        /**
         * Get the type of a variable.
         * @param variable - Any value.
         */
        getType: (variable: any) => string;

        /**
         * Check if an object has a property (supports dot notation).
         * @param object - The object to check.
         * @param key - Dot-notation key.
         */
        hasProperty: (object: object, key: string) => boolean;

        /**
         * Get a property from an object (supports dot notation).
         * @param object - The object to search.
         * @param key - Dot-notation key.
         */
        getProperty: (object: object, key: string) => any;

        /**
         * Set a property on an object (supports dot notation).
         * @param object - The object to modify.
         * @param key - Dot-notation key.
         * @param value - Value to assign.
         */
        setProperty: (object: object, key: string, value: any) => boolean;

        /**
         * Delete a property from an object (supports dot notation).
         * @param object - The object to modify.
         * @param key - Dot-notation key.
         */
        deleteProperty: (object: object, key: string) => boolean;

        /**
         * Invert an object's keys and values.
         * @param obj - The object to invert.
         */
        invertObject: (obj: Record<string, string>) => Record<string, string>;

        /**
         * Check if version v1 is newer than v0.
         * @param v1 - New version.
         * @param v0 - Base version.
         */
        isNewerVersion: (v1: number | string, v0: number | string) => boolean;

        /**
         * Check if a value is empty-like.
         * @param value - The value to check.
         */
        isEmpty: (value: any) => boolean;

        /**
         * Merge two objects deeply.
         * @param original - Original object.
         * @param other - Other object.
         * @param options - Merge options.
         */
        mergeObject: (
            original: object,
            other?: object,
            options?: {
                insertKeys?: boolean;
                insertValues?: boolean;
                overwrite?: boolean;
                recursive?: boolean;
                inplace?: boolean;
                enforceTypes?: boolean;
                performDeletions?: boolean;
            },
        ) => object;

        /**
         * Parse an S3 URL into bucket and key prefix.
         * @param key - Full URL or key.
         */
        parseS3URL: (key: string) => {
            bucket: string | null;
            keyPrefix: string;
        };

        /**
         * Generate a random alphanumeric ID.
         * @param length - Length of the ID.
         */
        randomID: (length?: number) => string;

        /**
         * Format a file size into human-readable form.
         * @param size - File size in bytes.
         * @param options - Formatting options.
         */
        formatFileSize: (
            size: number,
            options?: { decimalPlaces?: number; base?: 2 | 10 },
        ) => string;

        /**
         * Log a compatibility warning or error based on the client's compatibility settings.
         * @param message - The warning or error message.
         * @param options - Additional logging options.
         * @throws {Error} - If the configured mode is FAILURE.
         */
        logCompatibilityWarning: (
            message: string,
            options?: {
                mode?: number;
                since?: number | string;
                until?: number | string;
                details?: string;
                stack?: boolean;
                once?: boolean;
            },
        ) => void;

        /**
         * Determine the relative orientation of three points in 2D space.
         */
        orient2dFast: (a: Point, b: Point, c: Point) => number;

        /**
         * Quickly test whether two line segments intersect.
         */
        lineSegmentIntersects: (
            a: Point,
            b: Point,
            c: Point,
            d: Point,
        ) => boolean;

        /**
         * Compute the intersection between two infinite lines.
         */
        lineLineIntersection: (
            a: Point,
            b: Point,
            c: Point,
            d: Point,
            options?: { t1?: boolean },
        ) => LineIntersection | null;

        /**
         * Compute the intersection between two finite line segments.
         */
        lineSegmentIntersection: (
            a: Point,
            b: Point,
            c: Point,
            d: Point,
            epsilon?: number,
        ) => LineIntersection | null;

        /**
         * Determine the intersection between a line segment and a circle.
         */
        lineCircleIntersection: (
            a: Point,
            b: Point,
            center: Point,
            radius: number,
            epsilon?: number,
        ) => LineCircleIntersection;

        /**
         * Identify the closest point on a segment to a reference point.
         */
        closestPointToSegment: (c: Point, a: Point, b: Point) => Point;

        /**
         * Find the points of intersection between a line segment and a circle.
         */
        quadraticIntersection: (
            p0: Point,
            p1: Point,
            center: Point,
            radius: number,
            epsilon?: number,
        ) => Point[];

        /**
         * Calculate the centroid of a polygon.
         */
        polygonCentroid: (points: Point[] | number[]) => Point;

        /**
         * Test if a circle intersects a path (open or closed).
         */
        pathCircleIntersects: (
            points: Point[] | number[],
            close: boolean,
            center: Point,
            radius: number,
        ) => boolean;

        /**
         * Test whether two circles intersect.
         */
        circleCircleIntersects: (
            x0: number,
            y0: number,
            r0: number,
            x1: number,
            y1: number,
            r1: number,
        ) => boolean;

        /**
         * Retrieve a Document or Compendium Index entry by UUID asynchronously.
         * @param uuid - The UUID to resolve.
         */
        fromUuid: (uuid: string) => Promise<ClientDocument | any | null>;

        /**
         * Retrieve a Document synchronously by UUID. Throws if not available.
         * @param uuid - The UUID to resolve.
         */
        fromUuidSync: (uuid: string) => ClientDocument | any | null;
    };
}

/**
 * The Tokens Container.
 * @category Canvas
 */
export class TokenLayer {
    /**
     * The set of tokens that trigger occlusion (a union of {@link CONST.TOKEN_OCCLUSION_MODES}).
     */
    get occlusionMode(): number;
    set occlusionMode(value: any);
    get hookName(): string;
    get hud(): any;
    get(objectId: string): Token | null;
    /**
     * An Array of tokens which belong to actors which are owned
     */
    get ownedTokens(): Token[];
    /**
     * A Set of Token objects which currently display a combat turn marker.
     */
    turnMarkers: Set<Token>;
    getSnappedPoint(point: any): any;
    _prepareKeyboardMovementUpdates(
        objects: any,
        dx: any,
        dy: any,
        dz: any,
    ): (
        | {
              _id: any;
          }[]
        | {
              movement: {};
          }
    )[];
    _draw(options: any): Promise<void>;
    _tearDown(options: any): Promise<any>;
    _activate(): void;
    _deactivate(): void;
    /**
     * Target all Token instances which fall within a coordinate rectangle.
     * @param {Rectangle} rectangle                    The selection rectangle.
     * @param {object} [options]                      Additional options to configure targeting behaviour.
     * @param {boolean} [options.releaseOthers=true]  Whether or not to release other targeted tokens
     */
    targetObjects(
        {
            x,
            y,
            width,
            height,
        }: {
            x: any;
            y: any;
            width: any;
            height: any;
        },
        {
            releaseOthers,
        }?: {
            releaseOthers?: boolean | undefined;
        },
    ): void;
    /**
     * Assign multiple token targets
     * @param {string[]|Set<string>} targetIds    The array or set of Token IDs.
     * @param {object} [options]                  Additional options to configure targeting behaviour.
     * @param {"replace"|"acquire"|"release"} [options.mode="replace"]   The mode that determines the targeting behavior.
     *   - `"replace"` (default): Replace the current set of targeted Tokens with provided set of Tokens.
     *   - `"acquire"`: Acquire the given Tokens as targets without releasing already targeted Tokens.
     *   - `"release"`: Release the given Tokens as targets.
     */
    setTargets(
        targetIds: any,
        {
            mode,
        }?: {
            mode?: string | undefined;
        },
    ): void;
    /**
     * Cycle the controlled token by rotating through the list of Owned Tokens that are available within the Scene
     * Tokens are currently sorted in order of their TokenID
     *
     * @param forwards  Which direction to cycle. A truthy value cycles forward, while a false value
     *                            cycles backwards.
     * @param reset     Restart the cycle order back at the beginning?
     * @returns  The Token object which was cycled to, or null
     */
    cycleTokens(forwards: boolean, reset: boolean): Token | null;
    /**
     * Immediately conclude the animation of any/all tokens
     */
    concludeAnimation(): void;
    /**
     * Recalculate the planned movement paths of all Tokens for the current User.
     */
    recalculatePlannedMovementPaths(): void;
    /**
     * Handle broadcast planned movement update.
     * @param user    The User the planned movement data belongs to
     * @param plannedMovements    The planned movement data
     */
    _updatePlannedMovements(
        user: User,
        plannedMovements: {
            [tokenId: string]: TokenPlannedMovement | null;
        } | null,
    ): void;
    /**
     * Provide an array of Tokens which are eligible subjects for tile occlusion.
     * By default, only tokens which are currently controlled or owned by a player are included as subjects.
     */
    _getOccludableTokens(): Token[];
    _getMovableObjects(ids: any, includeLocked: any): any;
    _getCopyableObjects(options: any): any;
    storeHistory(type: any, data: any, options: any): void;
    _onCycleViewKey(event: any): boolean;
    _confirmDeleteKey(documents: any): Promise<any>;
    static prepareSceneControls(): {
        name: string;
        order: number;
        title: string;
        icon: string;
        onChange: (event: any, active: any) => void;
        onToolChange: () => any;
        tools: {
            select: {
                name: string;
                order: number;
                title: string;
                icon: string;
                toolclip: {
                    src: string;
                    heading: string;
                    items: any;
                };
            };
            target: {
                name: string;
                order: number;
                title: string;
                icon: string;
                toolclip: {
                    src: string;
                    heading: string;
                    items: any;
                };
            };
            ruler: {
                name: string;
                order: number;
                title: string;
                icon: string;
            };
            unconstrainedMovement: {
                name: string;
                order: number;
                title: string;
                icon: string;
                toggle: boolean;
                active: boolean;
                visible: any;
            };
        };
        activeTool: string;
        active: boolean;
        angle: number;
        controlled: Token[];
        placeables: Token[];
    };

    _highlightObjects(active: any): void;
    /**
     * Handle dropping of Actor data onto the Scene canvas
     */
    _onDropActorData(
        event: DragEvent,
        data: {
            type: "Actor";
            uuid: string;
            x: number;
            y: number;
            elevation?: number;
        },
    ): Promise<any>;
    _onClickLeft(event: any): any;
    _onClickLeft2(event: any): any;
    _onClickRight(event: any): any;
    _onClickRight2(event: any): any;
    _onDragLeftCancel(event: any): void;
    _onMouseWheel(event: any): any;
}

/**
 * A Token is an implementation of PlaceableObject which represents an {@link foundry.documents.Actor} within a viewed
 * Scene on the game canvas.
 * @category Canvas
 * @see {@link foundry.documents.TokenDocument}
 * @see {@link foundry.canvas.layers.TokenLayer}
 */
export default class Token extends PlaceableObject {
    static embeddedName: string;
    static RENDER_FLAGS: {
        redraw: {
            propagate: string[];
        };
        redrawEffects: {};
        refresh: {
            propagate: string[];
            alias: boolean;
        };
        refreshState: {
            propagate: string[];
        };
        refreshVisibility: {};
        refreshTransform: {
            propagate: string[];
            alias: boolean;
        };
        refreshPosition: {};
        refreshRotation: {};
        refreshSize: {
            propagate: string[];
        };
        refreshElevation: {
            propagate: string[];
        };
        refreshMesh: {
            propagate: string[];
        };
        refreshShader: {};
        refreshShape: {
            propagate: string[];
        };
        refreshBorder: {};
        refreshBars: {};
        refreshEffects: {};
        refreshNameplate: {};
        refreshTarget: {};
        refreshTooltip: {};
        refreshRingVisuals: {};
        refreshRuler: {};
        refreshTurnMarker: {};
    };
    shape: any;
    detectionFilter: null;
    border: any;
    effects: any;
    bars: any;
    tooltip: any;
    targetArrows: any;
    targetPips: any;
    nameplate: any;
    ruler: any;
    _plannedMovement: {};
    targeted: Set<never>;
    mesh: any;
    voidMesh: any;
    detectionFilterMesh: any;
    texture: any;
    vision: any;
    light: any;
    turnMarker: any | null;
    get animationContexts(): Map<string, any>;
    get animationName(): string;
    get movementAnimationName(): string;
    get movementAnimationPromise(): Promise<void> | null;
    get showRuler(): boolean;
    _preventKeyboardMovement: boolean;
    get ring(): any | null;
    get hasDynamicRing(): boolean;
    get actor(): Actor | null;
    get observer(): boolean;
    get name(): string;
    get bounds(): any;
    get w(): number;
    get h(): number;
    get center(): Point;
    getMovementAdjustedPoint(point: Point, { offsetX, offsetY }?: {}): any;
    /**
     * The HTML source element for the primary Tile texture
     */
    get sourceElement(): HTMLImageElement | HTMLVideoElement;
    get sourceId(): string;
    get isVideo(): boolean;
    get inCombat(): boolean;
    get combatant(): Combatant | null;
    get isTargeted(): boolean;
    get isDragged(): boolean;
    get isOwner(): boolean;
    get detectionModes(): any;
    get isVisible(): boolean;
    get hasSight(): boolean;
    _isLightSource(): boolean;
    get emitsDarkness(): booolean;
    get emitsLight(): boolean;
    get hasLimitedSourceAngle(): boolean;
    get dimRadius(): number;
    get brightRadius(): number;
    get radius(): number;
    get lightPerceptionRange(): number;
    get sightRange(): number;
    get optimalSightRange(): number;
    initializeSources(
        options: { deleted: boolean } = { deleted = false },
    ): void;
    initializeLightSource(options: { deleted?: boolean } = {}): void;
    _getLightSourceData(): any;
    initializeVisionSource(options: { deleted?: boolean } = {}): void;
    _getVisionBlindedStates(): {
        blind: any;
        burrow: any;
    };
    _getVisionSourceData(): {
        x: number;
        y: number;
        elevation: number;
        rotation: number;
        radius: number;
        lightRadius: number;
        externalRadius: number;
        angle: number;
        contrast: number;
        saturation: number;
        brightness: number;
        attenuation: number;
        visionMode: number;
        color: number;
        preview: any;
        disabled: boolean;
    };
    _isVisionSource(): boolean;
    _renderDetectionFilter(renderer: any): void;
    clear(): void;
    _destroy(options: any): void;
    _draw(options: any): Promise<void>;
    _initializeRuler(): any;
    _applyRenderFlags(flags: any): void;
    _refreshRingVisuals(): void;
    _refreshVisibility(): void;
    _refreshState(): void;
    _refreshMeshSizeAndScale(): void;
    _refreshSize(): void;
    _refreshMesh(): void;
    _refreshShape(): void;
    _refreshRotation(): void;
    _refreshPosition(): void;
    _refreshElevation(): void;
    _refreshTooltip(): void;
    _refreshNameplate(): void;
    _refreshShader(): void;
    _refreshBorder(): void;
    _getBorderColor(): any;
    getDispositionColor(): any;
    _refreshTarget(): void;
    _drawTargetArrows({
        margin: m,
        alpha,
        size,
        color,
        border: { width, color: lineColor },
    }?: {
        margin?: number | undefined;
        alpha?: number | undefined;
        border?:
            | {
                  width?: number | undefined;
                  color?: number | undefined;
              }
            | undefined;
    }): void;
    _drawTargetPips(): void;
    drawBars(): void;
    _drawBar(number: any, bar: any, data: any): boolean;
    _getTooltipText(): string;
    _getTextStyle(): any;
    drawEffects(): Promise<any>;
    _drawEffects(): Promise<void>;
    _drawEffect(src: any, tint: any): Promise<any>;
    _drawOverlay(src: any, tint: any): Promise<any>;
    _refreshEffects(): void;
    _refreshTurnMarker(): void;
    _refreshRuler(): void;
    _canViewMode(mode: any): any;
    getRingColors(): {};
    getRingEffects(): never[];
    _getAnimationData(): {
        x: any;
        y: any;
        elevation: any;
        width: any;
        height: any;
        rotation: any;
        alpha: any;
        texture: {
            src: any;
            anchorX: any;
            anchorY: any;
            scaleX: any;
            scaleY: any;
            tint: any;
        };
        ring: {
            subject: {
                texture: any;
                scale: any;
            };
        };
    };
    animate(to: any, options?: {}): Promise<void>;
    _getAnimationDuration(from: any, to: any, options: any): number;
    _getAnimationMovementSpeed(options: any): number;
    _modifyAnimationMovementSpeed(speed: any, options: any): number;
    static _configureAnimationMovementSpeed(
        operation: any,
        origin: any,
        waypoints: any,
    ): void;
    _getAnimationRotationSpeed(options: any): number;
    _requiresRotationAnimation(): boolean;
    _onAnimationUpdate(changed: any, context: any): void;
    stopAnimation({ reset }?: { reset?: boolean | undefined }): void;
    _getAnimationTransition(options: any): any;
    _prepareAnimation(
        from: any,
        changes: any,
        context: any,
        options: any,
    ): any[];
    static _getDropActorPosition(
        token: any,
        point: any,
        {
            snap,
        }?: {
            snap?: boolean | undefined;
        },
    ): {
        x: number;
        y: number;
        elevation: number;
        width: any;
        height: any;
        shape: any;
    };

    /**
     * Check for collision when attempting a move to a new position.
     *
     * The result of this function must not be affected by the animation of this Token.
     * @param {Point|ElevatedPoint} destination         The central destination point of the attempted movement.
     *                                                  The elevation defaults to the elevation of the origin.
     * @param {object} [options={}]                     Additional options forwarded to PointSourcePolygon.testCollision
     * @param {Point|ElevatedPoint} [options.origin]    The origin to be used instead of the current origin. The elevation
     *                                                  defaults to the current elevation.
     * @param {PointSourcePolygonType} [options.type="move"]    The collision type
     * @param {"any"|"all"|"closest"} [options.mode="any"]      The collision mode to test: "any", "all", or "closest"
     * @returns {boolean|PolygonVertex|PolygonVertex[]|null}    The collision result depends on the mode of the test:
     *                                                * any: returns a boolean for whether any collision occurred
     *                                                * all: returns a sorted array of PolygonVertex instances
     *                                                * closest: returns a PolygonVertex instance or null
     */
    checkCollision(
        destination: Point,
        {
            origin,
            type,
            mode,
        }?: {
            origin?: Point | undefined;
            type?: string | undefined;
            mode?: string | undefined;
        },
    ): any;
    getShape(): any;
    getCenterPoint(position: any): Point;
    getSnappedPosition(position: any): Point;
    _pasteObject(
        offset: any,
        {
            hidden,
            snap,
        }?: {
            hidden?: boolean | undefined;
            snap?: boolean | undefined;
        },
    ): any;
    measureMovementPath(waypoints: any, options: any): any;
    _getMovementCostFunction(
        options: any,
    ): (from: any, to: any, distance: any, segment: any) => any;
    constrainMovementPath(
        waypoints: any,
        {
            preview,
            ignoreWalls,
            ignoreCost,
            history,
        }?: {
            preview?: boolean | undefined;
            ignoreWalls?: boolean | undefined;
            ignoreCost?: boolean | undefined;
            history?: boolean | undefined;
        },
    ): (boolean | never[])[];
    findMovementPath(
        waypoints: any,
        options: any,
    ): {
        result: boolean | never[];
        promise: Promise<boolean | never[]>;
        cancel: () => void;
    };
    createTerrainMovementPath(
        waypoints: any,
        {
            preview,
        }?: {
            preview?: boolean | undefined;
        },
    ): any[];
    setTarget(
        targeted?: boolean,
        {
            releaseOthers,
        }?: {
            releaseOthers?: boolean | undefined;
        },
    ): void;
    _updateTarget(targeted: any, user: any): void;
    get externalRadius(): number;
    getLightRadius(units: any): number;
    _getShiftedPosition(dx: any, dy: any, dz: any): any;
    _getKeyboardMovementAction(): any;
    _getHUDMovementPosition(elevation: any): {
        elevation: any;
    };
    _getHUDMovementAction(): any;
    _getConfigMovementPosition(changes: any): any;
    _updateRotation({
        angle,
        delta,
        snap,
    }?: {
        delta?: number | undefined;
        snap?: number | undefined;
    }): any;
    _onCreate(data: any, options: any, userId: any): void;
    _onUpdate(changed: any, options: any, userId: any): void;
    _onDelete(options: any, userId: any): any;
    _onApplyStatusEffect(statusId: any, active: any): void;
    _configureFilterEffect(statusId: any, active: any): void;
    _updateSpecialStatusFilterEffects(): void;
    _removeAllFilterEffects(): void;
    _onControl({
        releaseOthers,
        pan,
        ...options
    }?: {
        releaseOthers?: boolean | undefined;
        pan?: boolean | undefined;
    }): void;
    recalculatePlannedMovementPath(): void;
    target: any;
}

export interface CanvasAPI {
    scene: Scene | null;
    tokens: TokenLayer;
}

export declare const foundry: FoundryAPI;
export declare const game: GameAPI;
export declare const canvas: CanvasAPI;
