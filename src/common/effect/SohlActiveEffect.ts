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

import type { SohlActor } from "@common/actor/SohlActor";
import { SohlItem } from "@common/item/SohlItem";
import { ClientDocumentExtendedMixin, FilePath } from "@utils/helpers";
import type { SohlContextMenu } from "@utils/SohlContextMenu";
import { InternalClientDocument } from "@common/FoundryProxy";

const kSohlActiveEffect = Symbol("SohlActiveEffect");

export class SohlActiveEffect
    extends ClientDocumentExtendedMixin(
        Actor,
        {} as InstanceType<typeof foundry.documents.BaseActor>,
    )
    implements InternalClientDocument
{
    readonly [kSohlActiveEffect] = true;
    declare readonly name: string;
    declare readonly flags: PlainObject;
    declare apps: Record<string, foundry.applications.api.ApplicationV2.Any>;
    declare readonly collection: Collection<this, Collection.Methods<this>>;
    declare readonly items: Collection<SohlItem, Collection.Methods<SohlItem>>;
    declare readonly effects: Collection<
        SohlActiveEffect,
        Collection.Methods<SohlActiveEffect>
    >;
    declare readonly compendium: CompendiumCollection<any> | undefined;
    declare readonly isOwner: boolean;
    declare readonly hasPlayerOwner: boolean;
    declare readonly limited: boolean;
    declare readonly link: string;
    declare readonly permission: any;
    declare readonly sheet: foundry.applications.api.ApplicationV2.Any | null;
    declare readonly visible: boolean;
    declare prototypeToken: { texture: { src: string } };
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

    declare type: string;
    declare img: FilePath;
    declare static create: (
        data: PlainObject,
        options?: PlainObject,
    ) => Promise<SohlActor | undefined>;
    declare update: (
        data: PlainObject,
        options?: PlainObject,
    ) => Promise<this | undefined>;
    declare delete: (options?: PlainObject) => Promise<this | undefined>;

    static isA(obj: unknown): obj is SohlActor {
        return (
            typeof obj === "object" && obj !== null && kSohlActiveEffect in obj
        );
    }

    get item(): SohlItem | null {
        return this.parent instanceof SohlItem ? this.parent : null;
    }

    get actor(): SohlActor {
        return this.item?.actor || this.parent;
    }

    static _getContextOptions(doc: SohlActiveEffect): SohlContextMenu.Entry[] {
        return doc._getContextOptions();
    }

    _getContextOptions(): SohlContextMenu.Entry[] {
        return this.system.logic._getContextOptions();
    }
}
