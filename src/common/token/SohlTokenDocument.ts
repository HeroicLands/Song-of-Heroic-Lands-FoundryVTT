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

import { InternalClientDocument } from "@common/FoundryProxy";
import { ClientDocumentExtendedMixin } from "@utils/helpers";

export class SohlTokenDocument
    extends ClientDocumentExtendedMixin(
        TokenDocument,
        {} as InstanceType<typeof foundry.documents.BaseToken>,
    )
    implements InternalClientDocument
{
    declare apps: Record<string, foundry.applications.api.ApplicationV2.Any>;
    declare readonly collection: Collection<this, Collection.Methods<this>>;
    declare readonly compendium: CompendiumCollection<any> | undefined;
    declare readonly hasPlayerOwner: boolean;
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

    declare name: string;
    declare displayName: string;
    declare actorId: string;
    declare actorLink: boolean;
    declare delta: any;
    declare width: number;
    declare height: number;
    declare texture: string;
    declare shape: number;
    declare x: number;
    declare y: number;
    declare elevation: number;
    declare sort: number;
    declare locked: boolean;
    declare lockRotation: boolean;
    declare rotation: number;
    declare alpha: number;
    declare hidden: boolean;
    declare disposition: number;
    declare displayBars: boolean;
    declare bar1: {
        attribute: string;
    };
    declare bar2: {
        attribute: string;
    };
    declare light: any;
    declare sight: {
        enabled: boolean;
        range: number;
        angle: number;
        visionMode: string;
        color: string;
        attenuation: number;
        brightness: number;
        saturation: number;
        contrast: number;
    };
    declare detectionModes: {
        id: string;
        enabled: boolean;
        range: number;
    }[];
    declare occludable: {
        radius: number;
    };
    declare ring: {
        enabled: boolean;
        colors: {
            ring: string;
            background: string;
        };
        effects: number;
        subject: {
            scale: number;
            texture: string;
        };
    };
    declare turnMarker: {
        mode: number;
        animation: string;
        src: string;
        disposition: boolean;
    };
    declare movementAction: string;
    declare readonly parent: Token | null;
    declare flags: any;

    /**
     * Gets the user-targeted tokens.
     *
     * @remarks
     * Note that this is the **targeted** tokens, not the selected tokens.
     *
     * @param single - Only return a single token if true, otherwise return an array of tokens.
     * @returns The targeted token document(s), or null if failed.
     */
    static getTargetedTokens(
        single: boolean = false,
    ): SohlTokenDocument[] | null {
        const targetTokens: Set<Token> = ((game as any).user as User)
            ?.targets as unknown as Set<Token>;

        if (!targetTokens || targetTokens.size === 0) {
            sohl.log.uiWarn(`No tokens targeted.`);
            return null;
        }

        if (single) {
            if (targetTokens.size > 1) {
                sohl.log.uiWarn(
                    `Multiple tokens targeted, please target only one token.`,
                );
                return null;
            }
            return [targetTokens.values().next().value?.document];
        }

        return Array.from(
            targetTokens.map((t) => t.document),
        ) as SohlTokenDocument[];
    }

    /**
     * Gets the user-selected tokens.
     *
     * @remarks
     * Note that this is the **selected** tokens, not the targeted tokens.
     *
     * @param single - Only return a single token if true, otherwise return an array of tokens.
     * @returns The selected token document(s), or null if failed.
     */
    static getSelectedTokens(
        single: boolean = false,
    ): SohlTokenDocument[] | null {
        const selectedTokens: Token[] = canvas.tokens?.controlled;
        if (selectedTokens.length === 0) {
            sohl.log.uiWarn(`No selected tokens on the canvas.`);
            return null;
        }

        if (single) {
            if (selectedTokens.length > 1) {
                sohl.log.uiWarn(
                    `Multiple tokens selected, please select only one token.`,
                );
                return null;
            }

            return [selectedTokens[0].document];
        }

        return selectedTokens.map((t) => t.document) as SohlTokenDocument[];
    }

    /**
     * Calculates the distance from sourceToken to targetToken in "scene" units (e.g., feet).
     *
     * @param sourceToken - The source token.
     * @param targetToken - The target token.
     * @param gridUnits=false - Whether to return in grid units.
     * @returns {number|null} The distance, or null if not calculable.
     */
    static rangeToTarget(
        sourceToken: SohlTokenDocument,
        targetToken: SohlTokenDocument,
        gridUnits = false,
    ): number | null {
        if (!canvas.scene?.grid) {
            sohl.log.uiWarn(`No scene active`);
            return null;
        }
        if (!gridUnits && !["feet", "ft"].includes(canvas.scene.grid.units)) {
            sohl.log.uiWarn(
                `Scene uses units of ${canvas.scene.grid.units} but only feet are supported, distance calculation not possible`,
            );
            return 0;
        }

        if (
            foundry.utils.getProperty(
                (canvas.scene as any).flags,
                "sohl.isTotm",
            )
        )
            return 0;

        const result = canvas.grid.measurePath([
            (sourceToken as any).object.center,
            (targetToken as any).object.center,
        ]);

        return gridUnits ? result.spaces : result.distance;
    }
}
