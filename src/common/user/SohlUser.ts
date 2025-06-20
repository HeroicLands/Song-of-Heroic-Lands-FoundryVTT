import { InternalClientDocument } from "@common/FoundryProxy";
import { ClientDocumentExtendedMixin } from "@utils";

export class SohlUser
    extends ClientDocumentExtendedMixin(
        User,
        {} as InstanceType<typeof foundry.documents.BaseUser>,
    )
    implements InternalClientDocument
{
    declare apps: Record<string, foundry.applications.api.ApplicationV2.Any>;
    declare readonly collection: Collection<this, Collection.Methods<this>>;
    declare readonly compendium: CompendiumCollection<any> | undefined;
    declare readonly hasPlayerOwner: boolean;
    declare readonly isOwner: boolean;
    declare readonly limited: boolean;
    declare readonly link: string;
    declare readonly permission: any;
    declare readonly sheet: foundry.applications.api.ApplicationV2.Any | null;
    declare readonly visible: boolean;
    declare prepareData: () => void;
    declare prepareBaseData: () => void;
    declare prepareEmbeddedDocuments: () => void;
    declare prepareDerivedData: () => void;
    declare render: (
        force?: boolean,
        context?:
            | Application.RenderOptions
            | foundry.applications.api.ApplicationV2.RenderOptions,
    ) => void;
    declare sortRelative: (
        options?: ClientDocument.SortOptions<this, "sort"> | undefined,
    ) => Promise<this>;
    declare getRelativeUUID: (relative: ClientDocument) => string;
    declare _dispatchDescendantDocumentEvents: (
        event: ClientDocument.LifeCycleEventName,
        collection: string,
        args: never,
        _parent: never,
    ) => void;
    declare _onSheetChange: (
        options?: ClientDocument.OnSheetChangeOptions,
    ) => Promise<void>;
    declare deleteDialog: (
        options?: PlainObject,
    ) => Promise<false | this | null | undefined>;
    declare exportToJSON: (
        options?: ClientDocument.ToCompendiumOptions,
    ) => void;
    declare toDragData: () => foundry.abstract.Document.DropData<
        foundry.abstract.Document.Internal.Instance.Complete<any>
    >;
    declare importFromJSON: (json: string) => Promise<this>;
    declare importFromJSONDialog: () => Promise<void>;
    declare toCompendium: (
        pack?: CompendiumCollection<CompendiumCollection.Metadata> | null,
        options?: PlainObject,
    ) => ClientDocument.ToCompendiumReturnType<any, any>;
    declare toAnchor: (
        options?: TextEditor.EnrichmentAnchorOptions,
    ) => HTMLAnchorElement;
    declare toEmbed: (
        config: TextEditor.DocumentHTMLEmbedConfig,
        options?: TextEditor.EnrichmentOptions,
    ) => Promise<HTMLElement | null>;
    declare _buildEmbedHTML: (
        config: TextEditor.DocumentHTMLEmbedConfig,
        options?: TextEditor.EnrichmentOptions,
    ) => Promise<HTMLElement | HTMLCollection | null>;
    declare _createInlineEmbed: (
        content: HTMLElement | HTMLCollection,
        config: TextEditor.DocumentHTMLEmbedConfig,
        options?: TextEditor.EnrichmentOptions,
    ) => Promise<HTMLElement | null>;
    declare _createFigureEmbed: (
        content: HTMLElement | HTMLCollection,
        config: TextEditor.DocumentHTMLEmbedConfig,
        options?: TextEditor.EnrichmentOptions,
    ) => Promise<HTMLElement | null>;
    declare _preCreateEmbeddedDocuments: (
        embeddedName: string,
        result: AnyObject[],
        options: foundry.abstract.Document.ModificationOptions,
        userId: string,
    ) => void;
    declare _onCreateEmbeddedDocuments: (
        embeddedName: string,
        documents: never,
        result: AnyObject[],
        options: foundry.abstract.Document.ModificationOptions,
        userId: string,
    ) => void;
    declare _preUpdateEmbeddedDocuments: (
        embeddedName: string,
        result: AnyObject[],
        options: foundry.abstract.Document.ModificationOptions,
        userId: string,
    ) => void;
    declare _onUpdateEmbeddedDocuments: (
        embeddedName: string,
        documents: never,
        result: AnyObject[],
        options: foundry.abstract.Document.ModificationContext<foundry.abstract.Document.Any | null>,
        userId: string,
    ) => void;
    declare _preDeleteEmbeddedDocuments: (
        embeddedName: string,
        result: string[],
        options: foundry.abstract.Document.ModificationContext<foundry.abstract.Document.Any | null>,
        userId: string,
    ) => void;
    declare _onDeleteEmbeddedDocuments: (
        embeddedName: string,
        documents: never,
        result: string[],
        options: foundry.abstract.Document.ModificationContext<foundry.abstract.Document.Any | null>,
        userId: string,
    ) => void;
    declare _preCreateDescendantDocuments: (...args: any[]) => void;
    declare public _onCreateDescendantDocuments: (...args: any[]) => void;
    declare public _preUpdateDescendantDocuments: (...args: any[]) => void;
    declare public _onUpdateDescendantDocuments: (...args: any[]) => void;
    declare public _preDeleteDescendantDocuments: (...args: any[]) => void;
    declare public _onDeleteDescendantDocuments: (...args: any[]) => void;
}
