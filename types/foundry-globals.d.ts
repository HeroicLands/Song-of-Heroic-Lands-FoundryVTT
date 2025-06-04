/// <reference path="../node_modules/@league-of-foundry-developers/foundry-vtt-types/src/types/index.d.mts" />
/// <reference path="../node_modules/@league-of-foundry-developers/foundry-vtt-types/src/foundry/index.d.mts" />

declare global {
    class DragDrop {
        constructor({
            dragSelector,
            dropSelector,
            permissions,
            callbacks,
        }?: DragDrop.Configuration);

        /**
         * The HTML selector which identifies draggable elements
         * @defaultValue `undefined`
         */
        dragSelector: string | null | undefined;

        /**
         * The HTML selector which identifies drop targets
         * @defaultValue `undefined`
         */
        dropSelector: string | null | undefined;

        /**
         * A set of permission checking functions for each action of the Drag and Drop workflow
         * @defaultValue `{}`
         */
        permissions: Partial<
            Record<DragDrop.Action, (selector: this["dragSelector"]) => boolean>
        >;

        /**
         * A set of callback functions for each action of the Drag and Drop workflow
         * @defaultValue `{}`
         */
        callbacks: InexactPartial<
            Record<DragDrop.Action, (event: DragEvent) => void>
        >;

        /**
         * Bind the DragDrop controller to an HTML application
         * @param html - The HTML element to which the handler is bound
         */
        bind(html: HTMLElement): this;

        /**
         * Execute a callback function associated with a certain action in the workflow
         * @param event  - The drag event being handled
         * @param action - The action being attempted
         */
        callback(event: DragEvent, action: DragDrop.Action): void;

        /**
         * Test whether the current user has permission to perform a step of the workflow
         * @param action   - The action being attempted
         * @param selector - The selector being targeted
         * @returns Can the action be performed?
         */
        can(action: DragDrop.Action, selector?: this["dragSelector"]): boolean;

        /**
         * Handle the start of a drag workflow
         * @param event - The drag event being handled
         * @internal
         */
        protected _handleDragStart(event: DragEvent): void;

        /**
         * Handle a dragged element over a droppable target
         * @param event - The drag event being handled
         * @internal
         */
        protected _handleDragOver(event: DragEvent): false;

        /**
         * Handle a dragged element dropped on a droppable target
         * @param event - The drag event being handled
         * @internal
         */
        protected _handleDrop(event: DragEvent): unknown;

        static createDragImage(
            img: HTMLImageElement,
            width: number,
            height: number,
        ): HTMLDivElement;
    }

    namespace DragDrop {
        type Action = "dragstart" | "dragover" | "drop";

        interface _Configuration {
            /**
             * The CSS selector used to target draggable elements.
             */
            dragSelector?: DragDrop["dragSelector"];

            /**
             * The CSS selector used to target viable drop targets.
             */
            dropSelector?: DragDrop["dropSelector"];

            /**
             * An object of permission test functions for each action
             * @defaultValue `{}`
             */
            permissions?: DragDrop["permissions"];

            /**
             * An object of callback functions for each action
             * @defaultValue `{}`
             */
            callbacks?: DragDrop["callbacks"];
        }

        interface Configuration extends InexactPartial<_Configuration> {}
    }

    interface ClientDocument {
        apps: StrictObject<foundry.applications.api.ApplicationV2>;
        _sheet: foundry.applications.api.ApplicationV2 | null;
        _initialize(context: SohlAction.Context): void;
        collection: Collection | null;
        compendium: Collection | null;
        inCompendium: boolean;
        isOwner: boolean;
        hasPlayerOwner: boolean;
        limited: boolean;
        link: string;
        permission: number;
        sheet: foundry.applications.api.ApplicationV2 | null;
        visible: boolean;
        _getSheetClass(): AnyConstructor | null;
        _safePrepareData(): void;
        prepareData(): void;
        prepareEmbeddedDocuments(): void;
        prepareDerivedData(): void;
        render(force?: boolean, context?: PlainObject): void;
        sortRelative({
            updateData,
            ...sortOptions
        }: {
            updateData?: Record<string, any>;
            [key: string]: any;
        }): Promise<Document>;
        getRelativeUUID(relative: ClientDocument): string | null;
        _createDocumentLink(
            eventData: PlainObject,
            options?: { relativeTo?: ClientDocument; label?: string },
        ): string;
        _onClickDocumentLink(event: MouseEvent): any;
        _preCreate(
            data: PlainObject,
            options: PlainObject,
            user: string,
        ): Promise<Optional<boolean>>;
        _onCreate(
            data: PlainObject,
            options: PlainObject,
            userId: string,
        ): Promise<void>;
        _preUpdate(
            changed: PlainObject,
            options: PlainObject,
            userId: string,
        ): Promise<Optional<boolean>>;
        _onUpdate(
            changed: PlainObject,
            options: PlainObject,
            userId: string,
        ): Promise<void>;
        _preDelete(
            options: PlainObject,
            userId: string,
        ): Promise<Optional<boolean>>;
        _onDelete(options: PlainObject, userId: string): Promise<void>;
        _dispatchDescendantDocumentEvents(
            event: string,
            collection: string,
            args: any[],
            _parent?: ClientDocument,
        ): void;
        _preCreateDescendantDocuments(
            parent: Document,
            collection: string,
            data: PlainObject[],
            options: PlainObject,
            userId: string,
        ): void;
        _onCreateDescendantDocuments(
            parent: Document,
            collection: string,
            documents: Document[],
            data: PlainObject[],
            options: PlainObject,
            userId: string,
        ): void;
        _preUpdateDescendantDocuments(
            parent: Document,
            collection: string,
            data: PlainObject[],
            options: PlainObject,
            userId: string,
        ): void;
        _onUpdateDescendantDocuments(
            parent: Document,
            collection: string,
            documents: Document[],
            data: PlainObject[],
            options: PlainObject,
            userId: string,
        ): void;
        _preDeleteDescendantDocuments(
            parent: Document,
            collection: string,
            data: PlainObject[],
            options: PlainObject,
            userId: string,
        ): void;
        _onDeleteDescendantDocuments(
            parent: Document,
            collection: string,
            documents: Document[],
            data: PlainObject[],
            options: PlainObject,
            userId: string,
        ): void;
        _onSheetChange({ sheetOpen }: { sheetOpen?: boolean }): void;
        deleteDialog(
            options: PlainObject,
            operation: PlainObject,
        ): Promise<Document>;
        exportToJSON(options: PlainObject): Promise<void>;
        toDragData(): PlainObject;
        importFromJSON(json: string): Promise<ClientDocument>;
        importFromJSONDialog(): Promise<void>;
        toCompendium(pack: Collection, options?: PlainObject): PlainObject;
        toAnchor(options?: PlainObject): HTMLAnchorElement;
        toEmbed(
            config: PlainObject,
            options?: PlainObject,
        ): Promise<HTMLEmbedElement | HTMLElement | null>;
        onEmbed(element: HTMLEmbedElement): void;
    }

    // class ActiveEffect
    //     extends foundry.documents.BaseActiveEffect
    //     implements ClientDocument {}
    // class Actor extends foundry.documents.BaseActor implements ClientDocument {}
    // class Item extends foundry.documents.BaseItem implements ClientDocument {}

    interface FoundryGlobal {
        CONST: PlainObject;
        Game: Constructor<ReadyGame>;
        game: Game;
        abstract: {
            DataModel: Constructor<foundry.abstract.DataModel>;
            Document: Constructor<foundry.abstract.Document>;
            EmbeddedCollection: Constructor<foundry.abstract.EmbeddedCollection>;
            EmbeddedCollectionDelta: Constructor<foundry.abstract.EmbeddedCollectionDelta>;
            SingletonEmbeddedCollection: Constructor<foundry.abstract.SingletonEmbeddedCollection>;
            TypeDataModel: Constructor<foundry.abstract.TypeDataModel>;
        };
        applications: {
            api: {
                Application: Constructor<foundry.applications.api.Application>;
                ApplicationV2: Constructor<foundry.applications.api.ApplicationV2>;
                CategoryBrowser: Constructor<foundry.applications.api.CategoryBrowser>;
                Dialog: Constructor<foundry.applications.api.Dialog>;
                DialogV2: Constructor<foundry.applications.api.DialogV2>;
                DocumentSheet: Constructor<foundry.applications.api.DocumentSheet>;
                DocumentSheetV2: Constructor<foundry.applications.api.DocumentSheetV2>;
                HandlebarsApplicationMixin: Mixin<
                    foundry.applications.api.HandlebarsApplicationMixin.HandlebarsApplication,
                    Constructor<foundry.applications.api.ApplicationV2>
                >;
            };
            apps: {
                DocumentSheetConfig: Constructor<foundry.client.applications.apps.DocumentSheetConfig>;
                FilePicker: Constructor<foundry.client.applications.apps.FilePicker>;
                PermissionConfig: Constructor<foundry.client.applications.apps.PermissionConfig>;
            };
            dice: {
                RollResolver: Constructor<foundry.client.applications.dice.RollResolver>;
            };
            elements: {
                AbstractFormInputElement: Constructor<foundry.client.applications.elements.AbstractFormInputElement>;
                AbstractMultiSelectElement: Constructor<foundry.client.applications.elements.AbstractMultiSelectElement>;
                HTMLCodeMirrorElement: Constructor<foundry.client.applications.elements.HTMLCodeMirrorElement>;
                HTMLColorPickerElement: Constructor<foundry.client.applications.elements.HTMLColorPickerElement>;
                HTMLDocumentEmbedElement: Constructor<foundry.client.applications.elements.HTMLDocumentEmbedElement>;
                HTMLDocumentTagsElement: Constructor<foundry.client.applications.elements.HTMLDocumentTagsElement>;
                HTMLEnrichedContentElement: Constructor<foundry.client.applications.elements.HTMLEnrichedContentElement>;
                HTMLFilePickerElement: Constructor<foundry.client.applications.elements.HTMLFilePickerElement>;
                HTMLHueSelectorSlider: Constructor<foundry.client.applications.elements.HTMLHueSelectorSlider>;
                HTMLMultiCheckboxElement: Constructor<foundry.client.applications.elements.HTMLMultiCheckboxElement>;
                HTMLMultiSelectElement: Constructor<foundry.client.applications.elements.HTMLMultiSelectElement>;
                HTMLProseMirrorElement: Constructor<foundry.client.applications.elements.HTMLProseMirrorElement>;
                HTMLRangePickerElement: Constructor<foundry.client.applications.elements.HTMLRangePickerElement>;
                HTMLSecretBlockElement: Constructor<foundry.client.applications.elements.HTMLSecretBlockElement>;
                HTMLStringTagsElement: Constructor<foundry.client.applications.elements.HTMLStringTagsElement>;
            };
            fields: {
                createCheckboxInput: Func;
                createEditorInput: Func;
                createFontAwesomeIcon: Func;
                createFormGroup: Func;
                createMultiSelectInput: Func;
                createNumberInput: Func;
                createSelectInput: Func;
                createTextInput: Func;
                createTextareaInput: Func;
                prepareSelectOptionGroups: Func;
                setInputAttributes: Func;
            };
            handlebars: {
                checked: Func;
                colorPicker: Func;
                concat: Func;
                disabled: Func;
                editor: Func;
                filePicker: Func;
                formGroup: Func;
                formInput: Func;
                getTemplate: Func;
                ifThen: Func;
                initialize: Func;
                loadTemplates: Func;
                localize: Func;
                numberFormat: Func;
                numberInput: Func;
                object: Func;
                radioBoxes: Func;
                rangePicker: Func;
                renderTemplate: Func;
                select: Func;
                selectOptions: Func;
            };
            hud: {
                TokenHUD: Constructor<foundry.client.applications.hud.TokenHUD>;
            };
            parseHTML: Func;
            settings: {
                SettingsConfig: Constructor<foundry.client.applications.settings.SettingsConfig>;
                menus: {
                    AVConfig: Constructor<foundry.client.applications.settings.menu.AVConfig>;
                    DefaultSheetsConfig: Constructor<foundry.client.applications.settings.menu.DefaultSheetsConfig>;
                    DiceConfig: Constructor<foundry.client.applications.settings.menu.DiceConfig>;
                    FontConfig: Constructor<foundry.client.applications.settings.menu.FontConfig>;
                    PrototypeOverridesConfig: Constructor<foundry.client.applications.settings.menu.PrototypeOverridesConfig>;
                    UIConfig: Constructor<foundry.client.applications.settings.menu.UIConfig>;
                };
            };
            sheets: {
                ActiveEffectConfig: Constructor<foundry.client.applications.sheets.ActiveEffectConfig>;
                ActorSheetV2: Constructor<foundry.client.applications.sheets.ActorSheetV2>;
                AdventureExporter: Constructor<foundry.client.applications.sheets.AdventureExporter>;
                AdventureImporterV2: Constructor<foundry.client.applications.sheets.AdventureImporterV2>;
                BaseSheet: Constructor<foundry.client.applications.sheets.BaseSheet>;
                CardConfig: Constructor<foundry.client.applications.sheets.CardConfig>;
                CardDeckConfig: Constructor<foundry.client.applications.sheets.CardDeckConfig>;
                CardHandConfig: Constructor<foundry.client.applications.sheets.CardHandConfig>;
                CardPileConfig: Constructor<foundry.client.applications.sheets.CardPileConfig>;
                CardsConfig: Constructor<foundry.client.applications.sheets.CardsConfig>;
                CombatantConfig: Constructor<foundry.client.applications.sheets.CombatantConfig>;
                FolderConfig: Constructor<foundry.client.applications.sheets.FolderConfig>;
                ItemSheetV2: Constructor<foundry.client.applications.sheets.ItemSheetV2>;
                MacroConfig: Constructor<foundry.client.applications.sheets.MacroConfig>;
                MeasuredTemplateConfig: Constructor<MeasuredTemplateConfig>;
                NoteConfig: Constructor<foundry.client.applications.sheets.NoteConfig>;
                PlaylistConfig: Constructor<foundry.client.applications.sheets.PlaylistConfig>;
                PlaylistSoundConfig: Constructor<foundry.client.applications.sheets.PlaylistSoundConfig>;
                PrototypeTokenConfig: Constructor<foundry.client.applications.sheets.PrototypeTokenConfig>;
                RegionBehaviorConfig: Constructor<foundry.client.applications.sheets.RegionBehaviorConfig>;
                RegionConfig: Constructor<foundry.client.applications.sheets.RegionConfig>;
                RollTableSheet: Constructor<foundry.client.applications.sheets.RollTableSheet>;
                SceneConfig: Constructor<foundry.client.applications.sheets.SceneConfig>;
                TableResultConfig: Constructor<foundry.client.applications.sheets.TableResultConfig>;
                TileConfig: Constructor<foundry.client.applications.sheets.TileConfig>;
                TokenConfig: Constructor<foundry.client.applications.sheets.TokenConfig>;
                UserConfig: Constructor<foundry.client.applications.sheets.UserConfig>;
                _registerDefaultSheets: Func;
                journal: {
                    JournalEntryCategoryConfig: Constructor<foundry.client.applications.sheets.journal.JournalEntryCategoryConfig>;
                    JournalEntryPageHandlebarsSheet: Constructor<foundry.client.applications.sheets.journal.JournalEntryPageHandlebarsSheet>;
                    JournalEntryPageImageSheet: Constructor<foundry.client.applications.sheets.journal.JournalEntryPageImageSheet>;
                    JournalEntryPageMarkdownSheet: Constructor<foundry.client.applications.sheets.journal.JournalEntryPageMarkdownSheet>;
                    JournalEntryPagePDFSheet: Constructor<foundry.client.applications.sheets.journal.JournalEntryPagePDFSheet>;
                    JournalEntryPageProseMirrorSheet: Constructor<foundry.client.applications.sheets.journal.JournalEntryPageProseMirrorSheet>;
                    JournalEntryPageSheet: Constructor<foundry.client.applications.sheets.journal.JournalEntryPageSheet>;
                    JournalEntryPageTextSheet: Constructor<foundry.client.applications.sheets.journal.JournalEntryPageTextSheet>;
                    JournalEntryPageVideoSheet: Constructor<foundry.client.applications.sheets.journal.JournalEntryPageVideoSheet>;
                    JournalEntrySheet: Constructor<foundry.client.applications.sheets.journal.JournalEntrySheet>;
                    ShowToPlayersDialog: Constructor<foundry.client.applications.sheets.journal.ShowToPlayersDialog>;
                };
            };
            sidebar: {
                AbstractSidebarTab: Constructor<foundry.client.applications.sidebar.AbstractSidebarTab>;
                DocumentDirectory: Constructor<foundry.client.applications.sidebar.DocumentDirectory>;
                Sidebar: Constructor<foundry.client.applications.sidebar.Sidebar>;
                apps: {
                    ChatPopout: Constructor<foundry.client.applications.sidebar.apps.ChatPopout>;
                    Compendium: Constructor<foundry.client.applications.sidebar.apps.Compendium>;
                    ControlsConfig: Constructor<foundry.client.applications.sidebar.apps.ControlsConfig>;
                    FolderExport: Constructor<foundry.client.applications.sidebar.apps.FolderExport>;
                    FrameViewer: Constructor<foundry.client.applications.sidebar.apps.FrameViewer>;
                    InvitationLinks: Constructor<foundry.client.applications.sidebar.apps.InvitationLinks>;
                    ModuleManagement: Constructor<foundry.client.applications.sidebar.apps.ModuleManagement>;
                    SupportDetails: Constructor<foundry.client.applications.sidebar.apps.SupportDetails>;
                    ToursManagement: Constructor<foundry.client.applications.sidebar.apps.ToursManagement>;
                    WorldConfig: Constructor<foundry.client.applications.sidebar.apps.WorldConfig>;
                };
                tabs: {
                    ActorDirectory: Constructor<foundry.client.applications.sidebar.tabs.ActorDirectory>;
                    CardsDirectory: Constructor<foundry.client.applications.sidebar.tabs.CardsDirectory>;
                    ChatLog: Constructor<foundry.client.applications.sidebar.tabs.ChatLog>;
                    CombatTracker: Constructor<foundry.client.applications.sidebar.tabs.CombatTracker>;
                    CompendiumDirectory: Constructor<foundry.client.applications.sidebar.tabs.CompendiumDirectory>;
                    ItemDirectory: Constructor<foundry.client.applications.sidebar.tabs.ItemDirectory>;
                    JournalDirectory: Constructor<foundry.client.applications.sidebar.tabs.JournalDirectory>;
                    MacroDirectory: Constructor<foundry.client.applications.sidebar.tabs.MacroDirectory>;
                    PlaylistDirectory: Constructor<foundry.client.applications.sidebar.tabs.PlaylistDirectory>;
                    RollTableDirectory: Constructor<foundry.client.applications.sidebar.tabs.RollTableDirectory>;
                    SceneDirectory: Constructor<foundry.client.applications.sidebar.tabs.SceneDirectory>;
                    Settings: Constructor<foundry.client.applications.sidebar.tabs.Settings>;
                };
            };
            ui: {
                GamePause: Constructor<foundry.client.applications.ui.GamePause>;
                Hotbar: Constructor<foundry.client.applications.ui.Hotbar>;
                MainMenu: Constructor<foundry.client.applications.ui.MainMenu>;
                Notifications: Constructor<foundry.client.applications.ui.Notifications>;
                Players: Constructor<foundry.client.applications.ui.Players>;
                RegionLegend: Constructor<foundry.client.applications.ui.RegionLegend>;
                SceneControls: Constructor<foundry.client.applications.ui.SceneControls>;
                SceneNavigation: Constructor<foundry.client.applications.ui.SceneNavigation>;
            };
            ux: {
                ContextMenu: Constructor<foundry.client.applications.ux.ContextMenu>;
                DragDrop: Constructor<foundry.client.applications.ux.DragDrop>;
                Draggable: Constructor<foundry.client.applications.ux.Draggable>;
                FormDataExtended: Constructor<foundry.client.applications.ux.FormDataExtended>;
                HTMLSecret: Constructor<foundry.client.applications.ux.HTMLSecret>;
                ProseMirrorEditor: Constructor<foundry.client.applications.ux.ProseMirrorEditor>;
                SearchFilter: Constructor<foundry.client.applications.ux.SearchFilter>;
                Tabs: Constructor<foundry.client.applications.ux.Tabs>;
                TextEditor: Constructor<foundry.client.applications.ux.TextEditor>;
            };
        };
        canvas: {
            Canvas: Constructor<foundry.client.canvas.Canvas>;
            geometry: {
                CanvasQuadtree: Constructor<foundry.client.canvas.geometry.CanvasQuadtree>;
                ClockwiseSweepPolygon: Constructor<foundry.client.canvas.geometry.ClockwiseSweepPolygon>;
                LimitedAnglePolygon: Constructor<foundry.client.canvas.geometry.LimitedAnglePolygon>;
                ObservableTransform: Constructor<foundry.client.canvas.geometry.ObservableTransform>;
                PointSourcePolygon: Constructor<foundry.client.canvas.geometry.PointSourcePolygon>;
                PolygonMesher: Constructor<foundry.client.canvas.geometry.PolygonMesher>;
                Quadtree: Constructor<foundry.client.canvas.geometry.Quadtree>;
                Ray: Constructor<foundry.client.canvas.geometry.Ray>;
                UnboundTransform: Constructor<foundry.client.canvas.geometry.UnboundTransform>;
                WeilerAthertonClipper: Constructor<foundry.client.canvas.geometry.WeilerAthertonClipper>;
                edges: {
                    CanvasEdges: Constructor<foundry.client.canvas.geometry.edges.CanvasEdges>;
                    CollisionResult: Constructor<foundry.client.canvas.geometry.edges.CollisionResult>;
                    Edge: Constructor<foundry.client.canvas.geometry.edges.Edge>;
                    PolygonVertex: Constructor<foundry.client.canvas.geometry.edges.PolygonVertex>;
                };
            };
            getTexture: Func;
            groups: {
                CanvasGroupMixin: AnyConstructor;
                CanvasVisibility: Constructor<CanvasVisibility>;
                EffectsCanvasGroup: Constructor<EffectsCanvasGroup>;
                EnvironmentCanvasGroup: Constructor<EnvironmentCanvasGroup>;
                HiddenCanvasGroup: Constructor<HiddenCanvasGroup>;
                InterfaceCanvasGroup: Constructor<InterfaceCanvasGroup>;
                OverlayCanvasGroup: Constructor<OverlayCanvasGroup>;
                PrimaryCanvasGroup: Constructor<PrimaryCanvasGroup>;
                RenderedCanvasGroup: Constructor<RenderedCanvasGroup>;
            };
            interaction: {
                AlertPing: Constructor<foundry.client.canvas.interaction.ping.AlertPing>;
                ArrowPing: Constructor<foundry.client.canvas.interaction.ping.ArrowPing>;
                BaseRuler: Constructor<foundry.client.canvas.interaction.ruler.BaseRuler>;
                ChevronPing: Constructor<foundry.client.canvas.interaction.ping.ChevronPing>;
                Ping: Constructor<foundry.client.canvas.interaction.ping.Ping>;
                PulsePing: Constructor<foundry.client.canvas.interaction.ping.PulsePing>;
                Ruler: Constructor<foundry.client.canvas.interaction.ruler.Ruler>;
            };
            layers: {
                CanvasBackgroundAlterationEffects: Constructor<foundry.client.canvas.layers.effects.CanvasBackgroundAlterationEffects>;
                CanvasColorationEffects: Constructor<foundry.client.canvas.layers.effects.CanvasColorationEffects>;
                CanvasDarknessEffects: Constructor<foundry.client.canvas.layers.effects.CanvasDarknessEffects>;
                CanvasDepthMask: Constructor<foundry.client.canvas.layers.masks.CanvasDepthMask>;
                CanvasIlluminationEffects: Constructor<foundry.client.canvas.layers.effects.CanvasIlluminationEffects>;
                CanvasLayer: Constructor<foundry.client.canvas.layers.CanvasLayer>;
                CanvasOcclusionMask: Constructor<foundry.client.canvas.layers.masks.CanvasOcclusionMask>;
                CanvasVisionMask: Constructor<foundry.client.canvas.layers.masks.CanvasVisionMask>;
                ControlsLayer: Constructor<foundry.client.canvas.layers.ControlsLayer>;
                DarknessLevelContainer: Constructor<foundry.client.canvas.layers.DarknessLevelContainer>;
                DrawingsLayer: Constructor<foundry.client.canvas.layers.DrawingsLayer>;
                GridLayer: Constructor<foundry.client.canvas.layers.GridLayer>;
                InteractionLayer: Constructor<foundry.client.canvas.layers.InteractionLayer>;
                LightingLayer: Constructor<foundry.client.canvas.layers.LightingLayer>;
                NotesLayer: Constructor<foundry.client.canvas.layers.NotesLayer>;
                PlaceablesLayer: Constructor<foundry.client.canvas.layers.PlaceablesLayer>;
                RegionLayer: Constructor<foundry.client.canvas.layers.RegionLayer>;
                SoundsLayer: Constructor<foundry.client.canvas.layers.SoundsLayer>;
                TemplateLayer: Constructor<foundry.client.canvas.layers.TemplateLayer>;
                TilesLayer: Constructor<foundry.client.canvas.layers.TilesLayer>;
                TokenLayer: Constructor<foundry.client.canvas.layers.TokenLayer>;
                WallsLayer: Constructor<foundry.client.canvas.layers.WallsLayer>;
                WeatherEffects: Constructor<foundry.client.canvas.layers.effects.WeatherEffects>;
            };
            loadTexture: Func;
            perception: {
                DetectionMode: Constructor<foundry.client.canvas.perception.DetectionMode>;
                DetectionModeAll: Constructor<foundry.client.canvas.perception.DetectionModeAll>;
                DetectionModeDarkvision: Constructor<foundry.client.canvas.perception.DetectionModeDarkvision>;
                DetectionModeInvisibility: Constructor<foundry.client.canvas.perception.DetectionModeInvisibility>;
                DetectionModeLightPerception: Constructor<foundry.client.canvas.perception.DetectionModeLightPerception>;
                DetectionModeTremor: Constructor<foundry.client.canvas.perception.DetectionModeTremor>;
                FogManager: Constructor<foundry.client.canvas.perception.FogManager>;
                PerceptionManager: Constructor<foundry.client.canvas.perception.PerceptionManager>;
                VisionMode: Constructor<foundry.client.canvas.perception.VisionMode>;
            };
            placeables: {
                AmbientLight: Constructor<foundry.client.canvas.placeables.AmbientLight>;
                AmbientSound: Constructor<foundry.client.canvas.placeables.AmbientSound>;
                Drawing: Constructor<foundry.client.canvas.placeables.Drawing>;
                MeasuredTemplate: Constructor<foundry.client.canvas.placeables.MeasuredTemplate>;
                Note: Constructor<foundry.client.canvas.placeables.Note>;
                PlaceableObject: Constructor<foundry.client.canvas.placeables.PlaceableObject>;
                Region: Constructor<foundry.client.canvas.placeables.Region>;
                Tile: Constructor<foundry.client.canvas.placeables.Tile>;
                Token: Constructor<foundry.client.canvas.placeables.Token>;
                Wall: Constructor<foundry.client.canvas.placeables.Wall>;
                regions: {
                    RegionGeometry: Constructor<foundry.client.canvas.placeables.regions.RegionGeometry>;
                    RegionMesh: Constructor<foundry.client.canvas.placeables.regions.RegionMesh>;
                };
                tokens: {
                    BaseTokenRuler: Constructor<foundry.client.canvas.placeables.tokens.BaseTokenRuler>;
                    DynamicRingData: Constructor<foundry.client.canvas.placeables.tokens.DynamicRingData>;
                    TokenRing: Constructor<foundry.client.canvas.placeables.tokens.TokenRing>;
                    TokenRingConfig: Constructor<foundry.client.canvas.placeables.tokens.TokenRingConfig>;
                    TokenRuler: Constructor<foundry.client.canvas.placeables.tokens.TokenRuler>;
                    TokenTurnMarker: Constructor<foundry.client.canvas.placeables.tokens.TokenTurnMarker>;
                    TurnMarkerData: Constructor<foundry.client.canvas.placeables.tokens.TurnMarkerData>;
                    UserTargets: Constructor<foundry.client.canvas.placeables.tokens.UserTargets>;
                };
            };
            primary: {
                CanvasTransformMixin: Func;
                PrimaryCanvasContainer: Constructor<foundry.client.canvas.primary.PrimaryCanvasContainer>;
                PrimaryCanvasObjectMixin: Func;
                PrimaryGraphics: Constructor<foundry.client.canvas.primary.PrimaryGraphics>;
                PrimaryOccludableObjectMixin: Func;
                PrimaryParticleEffect: Constructor<foundry.client.canvas.primary.PrimaryParticleEffect>;
                PrimarySpriteMesh: Constructor<foundry.client.canvas.primary.PrimarySpriteMesh>;
            };
        };
        data: {
            ActorDeltaField: Constructor<foundry.common.data.ActorDeltaField>;
            BaseShapeData: Constructor<foundry.common.data.BaseShapeData>;
            BaseTerrainData: Constructor<foundry.common.data.BaseTerrainData>;
            CalendarData: Constructor<foundry.common.data.CalendarData>;
            CircleShapeData: Constructor<foundry.common.data.CircleShapeData>;
            ClientDatabaseBackend: Constructor<foundry.common.data.ClientDatabaseBackend>;
            CombatConfiguration: Constructor<foundry.common.data.CombatConfiguration>;
            EllipseShapeData: Constructor<foundry.common.data.EllipseShapeData>;
            LightData: Constructor<foundry.common.data.LightData>;
            PolygonShapeData: Constructor<foundry.common.data.PolygonShapeData>;
            PrototypeToken: Constructor<foundry.common.data.PrototypeToken>;
            PrototypeTokenOverrides: Constructor<foundry.common.data.PrototypeTokenOverrides>;
            RectangleShapeData: Constructor<foundry.common.data.RectangleShapeData>;
            SIMPLIFIED_GREGORIAN_CALENDAR_CONFIG: PlainObject;
            ShapeData: Constructor<foundry.common.data.ShapeData>;
            TerrainData: Constructor<foundry.common.data.TerrainData>;
            TextureData: Constructor<foundry.common.data.TextureData>;
            TombstoneData: Constructor<foundry.common.data.TombstoneData>;
            fields: {
                AlphaField: Constructor<foundry.common.data.fields.AlphaField>;
                AngleField: Constructor<foundry.common.data.fields.AngleField>;
                AnyField: Constructor<foundry.common.data.fields.AnyField>;
                ArrayField: Constructor<foundry.common.data.fields.ArrayField>;
                BooleanField: Constructor<foundry.common.data.fields.BooleanField>;
                ColorField: Constructor<foundry.common.data.fields.ColorField>;
                DataField: Constructor<foundry.common.data.fields.DataField>;
                DocumentAuthorField: Constructor<foundry.common.data.fields.DocumentAuthorField>;
                DocumentFlagsField: Constructor<foundry.common.data.fields.DocumentFlagsField>;
                DocumentIdField: Constructor<foundry.common.data.fields.DocumentIdField>;
                DocumentOwnershipField: Constructor<foundry.common.data.fields.DocumentOwnershipField>;
                DocumentStatsField: Constructor<foundry.common.data.fields.DocumentStatsField>;
                DocumentTypeField: Constructor<foundry.common.data.fields.DocumentTypeField>;
                DocumentUUIDField: Constructor<foundry.common.data.fields.DocumentUUIDField>;
                EmbeddedCollectionDeltaField: Constructor<foundry.common.data.fields.EmbeddedCollectionDeltaField>;
                EmbeddedCollectionField: Constructor<foundry.common.data.fields.EmbeddedCollectionField>;
                EmbeddedDataField: Constructor<foundry.common.data.fields.EmbeddedDataField>;
                EmbeddedDocumentField: Constructor<foundry.common.data.fields.EmbeddedDocumentField>;
                FilePathField: Constructor<foundry.common.data.fields.FilePathField>;
                ForeignDocumentField: Constructor<foundry.common.data.fields.ForeignDocumentField>;
                HTMLField: Constructor<foundry.common.data.fields.HTMLField>;
                HueField: Constructor<foundry.common.data.fields.HueField>;
                IntegerSortField: Constructor<foundry.common.data.fields.IntegerSortField>;
                JSONField: Constructor<Jfoundry.common.data.fields.SONField>;
                JavaScriptField: Constructor<foundry.common.data.fields.JavaScriptField>;
                NumberField: Constructor<foundry.common.data.fields.NumberField>;
                ObjectField: Constructor<foundry.common.data.fields.ObjectField>;
                SchemaField: Constructor<foundry.common.data.fields.SchemaField>;
                SetField: Constructor<foundry.common.data.fields.SetField>;
                StringField: Constructor<foundry.common.data.fields.StringField>;
                TypeDataField: Constructor<foundry.common.data.fields.TypeDataField>;
                TypedObjectField: Constructor<foundry.common.data.fields.TypedObjectField>;
                TypedSchemaField: Constructor<foundry.common.data.fields.TypedSchemaField>;
            };
            regionBehaviors: {
                AdjustDarknessLevelRegionBehaviorType: Constructor<foundry.client.data.regionBehaviors.AdjustDarknessLevelRegionBehaviorType>;
                DisplayScrollingTextRegionBehaviorType: Constructor<foundry.client.data.regionBehaviors.DisplayScrollingTextRegionBehaviorType>;
                ExecuteMacroRegionBehaviorType: Constructor<foundry.client.data.regionBehaviors.ExecuteMacroRegionBehaviorType>;
                ExecuteScriptRegionBehaviorType: Constructor<foundry.client.data.regionBehaviors.ExecuteScriptRegionBehaviorType>;
                ModifyMovementCostRegionBehaviorType: Constructor<foundry.client.data.regionBehaviors.ModifyMovementCostRegionBehaviorType>;
                PauseGameRegionBehaviorType: Constructor<foundry.client.data.regionBehaviors.PauseGameRegionBehaviorType>;
                RegionBehaviorType: Constructor<foundry.client.data.regionBehaviors.RegionBehaviorType>;
                SuppressWeatherRegionBehaviorType: Constructor<foundry.client.data.regionBehaviors.SuppressWeatherRegionBehaviorType>;
                TeleportTokenRegionBehaviorType: Constructor<foundry.client.data.regionBehaviors.TeleportTokenRegionBehaviorType>;
                ToggleBehaviorRegionBehaviorType: Constructor<foundry.client.data.regionBehaviors.ToggleBehaviorRegionBehaviorType>;
            };
            regionShapes: {
                RegionCircleShape: Constructor<foundry.client.data.regionShapes.RegionCircleShape>;
                RegionEllipseShape: Constructor<foundry.client.data.regionShapes.RegionEllipseShape>;
                RegionPolygonShape: Constructor<foundry.client.data.regionShapes.RegionPolygonShape>;
                RegionPolygonTree: Constructor<foundry.client.data.regionShapes.RegionPolygonTree>;
                RegionPolygonTreeNode: Constructor<Rfoundry.client.data.regionShapes.egionPolygonTreeNode>;
                RegionRectangleShape: Constructor<foundry.client.data.regionShapes.RegionRectangleShape>;
                RegionShape: Constructor<foundry.client.data.regionShapes.RegionShape>;
            };
            types: PlainObject;
            validation: {
                DataModelValidationError: Constructor<foundry.common.data.DataModelValidationError>;
                DataModelValidationFailure: Constructor<foundry.common.data.DataModelValidationFailure>;
            };
            validators: {
                hasFileExtension: Func;
                isBase64Data: Func;
                isColorString: Func;
                isJSON: Func;
                isValidId: Func;
            };
        };
        dice: {
            MersenneTwister: Constructor<foundry.client.dice.MersenneTwister>;
            Roll: Constructor<foundry.client.dice.Roll>;
            RollGrammar: {
                StartRules: Array<string>;
                SyntaxError: Func;
                parse: Func;
            };
            RollParser: Constructor<foundry.client.dice.RollParser>;
            terms: {
                Coin: Constructor<foundry.client.dice.terms.Coin>;
                DiceTerm: Constructor<foundry.client.dice.terms.DiceTerm>;
                Die: Constructor<foundry.client.dice.terms.Die>;
                FateDie: Constructor<foundry.client.dice.terms.FateDie>;
                FuncTerm: Constructor<foundry.client.dice.terms.FuncTerm>;
                NumericTerm: Constructor<foundry.client.dice.terms.NumericTerm>;
                OperatorTerm: Constructor<foundry.client.dice.terms.OperatorTerm>;
                ParentheticalTerm: Constructor<foundry.client.dice.terms.ParentheticalTerm>;
                PoolTerm: Constructor<foundry.client.dice.terms.PoolTerm>;
                RollTerm: Constructor<foundry.client.dice.terms.RollTerm>;
                StringTerm: Constructor<foundry.client.dice.terms.StringTerm>;
            };
        };
        documents: {
            ActiveEffect: Constructor<ActiveEffect>;
            Actor: Constructor<Actor>;
            ActorDelta: Constructor<foundry.client.documents.ActorDelta>;
            Adventure: Constructor<foundry.client.documents.Adventure>;
            AmbientLightDocument: Constructor<foundry.client.documents.AmbientLightDocument>;
            AmbientSoundDocument: Constructor<foundry.client.documents.AmbientSoundDocument>;
            BaseActiveEffect: Constructor<foundry.common.documents.BaseActiveEffect>;
            BaseActor: Constructor<foundry.common.documents.BaseActor>;
            BaseActorDelta: Constructor<foundry.common.documents.BaseActorDelta>;
            BaseAdventure: Constructor<foundry.common.documents.BaseAdventure>;
            BaseAmbientLight: Constructor<foundry.common.documents.BaseAmbientLight>;
            BaseAmbientSound: Constructor<foundry.common.documents.BaseAmbientSound>;
            BaseCard: Constructor<foundry.common.documents.BaseCard>;
            BaseCards: Constructor<foundry.common.documents.BaseCards>;
            BaseChatMessage: Constructor<foundry.common.documents.BaseChatMessage>;
            BaseCombat: Constructor<foundry.common.documents.BaseCombat>;
            BaseCombatant: Constructor<foundry.common.documents.BaseCombatant>;
            BaseCombatantGroup: Constructor<foundry.common.documents.BaseCombatantGroup>;
            BaseDrawing: Constructor<foundry.common.documents.BaseDrawing>;
            BaseFogExploration: Constructor<foundry.common.documents.BaseFogExploration>;
            BaseFolder: Constructor<foundry.common.documents.BaseFolder>;
            BaseItem: Constructor<foundry.common.documents.BaseItem>;
            BaseJournalEntry: Constructor<foundry.common.documents.BaseJournalEntry>;
            BaseJournalEntryCategory: Constructor<foundry.common.documents.BaseJournalEntryCategory>;
            BaseJournalEntryPage: Constructorfoundry.common.documents<BaseJournalEntryPage>;
            BaseMacro: Constructor<foundry.common.documents.BaseMacro>;
            BaseMeasuredTemplate: Constructor<foundry.common.documents.BaseMeasuredTemplate>;
            BaseNote: Constructor<foundry.common.documents.BaseNote>;
            BasePlaylist: Constructor<foundry.common.documents.BasePlaylist>;
            BasePlaylistSound: Constructor<foundry.common.documents.BasePlaylistSound>;
            BaseRegion: Constructor<foundry.common.documents.BaseRegion>;
            BaseRegionBehavior: Constructor<foundry.common.documents.BaseRegionBehavior>;
            BaseRollTable: Constructor<foundry.common.documents.BaseRollTable>;
            BaseScene: Constructor<foundry.common.documents.BaseScene>;
            BaseSetting: Constructor<foundry.common.documents.BaseSetting>;
            BaseTableResult: Constructor<foundry.common.documents.BaseTableResult>;
            BaseTile: Constructor<foundry.common.documents.BaseTile>;
            BaseToken: Constructor<foundry.common.documents.BaseToken>;
            BaseUser: Constructor<foundry.common.documents.BaseUser>;
            BaseWall: Constructor<foundry.common.documents.BaseWall>;
            Card: Constructor<foundry.client.documents.Card>;
            Cards: Constructor<foundry.client.documents.Cards>;
            ChatMessage: Constructor<foundry.client.documents.ChatMessage>;
            Combat: Constructor<Combat>;
            Combatant: Constructor<foundry.client.documents.Combatant>;
            CombatantGroup: Constructor<foundry.client.documents.CombatantGroup>;
            DrawingDocument: Constructor<foundry.client.documents.DrawingDocument>;
            FogExploration: Constructor<foundry.client.documents.FogExploration>;
            Folder: Constructor<foundry.client.documents.Folder>;
            Item: Constructor<Item>;
            JournalEntry: Constructor<foundry.client.documents.JournalEntry>;
            JournalEntryCategory: Constructor<foundry.client.documents.JournalEntryCategory>;
            JournalEntryPage: Constructor<foundry.client.documents.JournalEntryPage>;
            Macro: Constructor<foundry.client.documents.Macro>;
            MeasuredTemplateDocument: Constructor<foundry.client.documents.MeasuredTemplateDocument>;
            NoteDocument: Constructor<foundry.client.documents.NoteDocument>;
            Playlist: Constructor<foundry.client.documents.Playlist>;
            PlaylistSound: Constructor<foundry.client.documents.PlaylistSound>;
            RegionBehavior: Constructor<foundry.client.documents.RegionBehavior>;
            RegionDocument: Constructor<foundry.client.documents.RegionDocument>;
            RollTable: Constructor<foundry.client.documents.RollTable>;
            Scene: Constructor<foundry.client.documents.Scene>;
            Setting: Constructor<foundry.client.documents.Setting>;
            TableResult: Constructor<foundry.client.documents.TableResult>;
            TileDocument: Constructor<foundry.client.documents.TileDocument>;
            TokenDocument: Constructor<foundry.client.documents.TokenDocument>;
            User: Constructor<foundry.client.documents.User>;
            WallDocument: Constructor<foundry.client.documents.WallDocument>;
            abstract: {
                CanvasDocumentMixin: Func;
                ClientDocumentMixin: Mixin<ClientDocument>;
                DirectoryCollectionMixin: Func;
                DocumentCollection: Constructor<foundry.client.documents.abstract.DocumentCollection>;
                WorldCollection: Constructor<foundry.client.documents.abstract.WorldCollection>;
            };
            collections: {
                Actors: Constructor<foundry.client.documents.collections.Actors>;
                CardStacks: Constructor<foundry.client.documents.collections.CardStacks>;
                ChatMessages: Constructor<foundry.client.documents.collections.ChatMessages>;
                CombatEncounters: Constructor<foundry.client.documents.collections.CombatEncounters>;
                CompendiumCollection: Constructor<foundry.client.documents.collections.CompendiumCollection>;
                CompendiumFolderCollection: Constructor<foundry.client.documents.collections.CompendiumFolderCollection>;
                CompendiumPacks: Constructor<foundry.client.documents.collections.CompendiumPacks>;
                FogExplorations: Constructor<foundry.client.documents.collections.FogExplorations>;
                Folders: Constructor<foundry.client.documents.collections.Folders>;
                Items: Constructor<foundry.client.documents.collections.Items>;
                Journal: Constructor<foundry.client.documents.collections.Journal>;
                Macros: Constructor<foundry.client.documents.collections.Macros>;
                Playlists: Constructor<foundry.client.documents.collections.Playlists>;
                RollTables: Constructor<foundry.client.documents.collections.RollTables>;
                Scenes: Constructor<foundry.client.documents.collections.Scenes>;
                Users: Constructor<foundry.client.documents.collections.Users>;
                WorldSettings: Constructor<foundry.client.documents.collections.WorldSettings>;
            };
            types: PlainObject;
        };
        grid: {
            BaseGrid: Constructor<foundry.common.grid.BaseGrid>;
            GridHex: Constructor<foundry.common.grid.GridHex>;
            GridlessGrid: Constructor<foundry.common.grid.GridlessGrid>;
            HexagonalGrid: Constructor<foundry.common.grid.HexagonalGrid>;
            SquareGrid: Constructor<foundry.common.grid.SquareGrid>;
            types: PlainObject;
        };
        helpers: {
            AsyncWorker: Constructor<foundry.client.helpers.AsyncWorker>;
            ClientIssues: Constructor<foundry.client.helpers.ClientIssues>;
            ClientSettings: Constructor<foundry.client.helpers.ClientSettings>;
            DocumentIndex: Constructor<foundry.client.helpers.DocumentIndex>;
            GameTime: Constructor<foundry.client.helpers.GameTime>;
            Hooks: Constructor<foundry.client.helpers.Hooks>;
            Localization: Constructor<foundry.client.helpers.Localization>;
            SocketInterface: Constructor<foundry.client.helpers.SocketInterface>;
            WorkerManager: Constructor<foundry.client.helpers.WorkerManager>;
            interaction: {
                ClientKeybindings: Constructor<foundry.client.helpers.interaction.ClientKeybindings>;
                ClipboardHelper: Constructor<foundry.client.helpers.interaction.ClipboardHelper>;
                GamepadManager: Constructor<foundry.client.helpers.interaction.GamepadManager>;
                KeyboardManager: Constructor<foundry.client.helpers.interaction.KeyboardManager>;
                MouseManager: Constructor<foundry.client.helpers.interaction.MouseManager>;
                TooltipManager: Constructor<foundry.client.helpers.interaction.TooltipManager>;
            };
            media: {
                CompendiumArt: Constructor<foundry.client.helpers.media.CompendiumArt>;
                ImageHelper: Constructor<foundry.client.helpers.media.ImageHelper>;
                VideoHelper: Constructor<foundry.client.helpers.media.VideoHelper>;
            };
            types: PlainObject;
        };
        nue: {
            NewUserExperienceManager: Constructor<foundry.client.nue.NewUserExperienceManager>;
            Tour: Constructor<foundry.client.nue.Tour>;
            ToursCollection: Constructor<foundry.client.nue.ToursCollection>;
            registerTours: Func;
            tours: {
                CanvasTour: Constructor<foundry.client.nue.tours.CanvasTour>;
                SetupTour: Constructor<foundry.client.nue.tours.SetupTour>;
                SidebarTour: Constructor<foundry.client.nue.tours.SidebarTour>;
            };
        };
        packages: {
            AdditionalTypesField: Constructor<foundry.common.packages.AdditionalTypesField>;
            BaseModule: Constructor<foundry.common.packages.BaseModule>;
            BasePackage: Constructor<foundry.common.packages.BasePackage>;
            BaseSystem: Constructor<foundry.common.packages.BaseSystem>;
            BaseWorld: Constructor<foundry.common.packages.BaseWorld>;
            ClientPackageMixin: Mixin<foundry.common.packages.ClientPackage>;
            Module: Constructor<foundry.common.packages.Module>;
            PACKAGE_TYPES: {
                world: Constructor<foundry.common.packages.World>;
                system: Constructor<foundry.common.packages.System>;
                module: Constructor<foundry.common.packages.Module>;
            };
            PackageCompatibility: Constructor<foundry.common.packages.PackageCompatibility>;
            RelatedPackage: Constructor<foundry.common.packages.RelatedPackage>;
            System: Constructor<foundry.common.packages.System>;
            World: Constructor<foundry.common.packages.World>;
            types: PlainObject;
        };
        types: PlainObject;
        ui: {
            notifications?: foundry.client.applications.ui.Notifications;
            pause?: foundry.client.applications.ui.GamePause;
            hotbar?: foundry.client.applications.ui.Hotbar;
            players?: foundry.client.applications.ui.Players;
            chat?: foundry.client.applications.sidebar.tabs.ChatLog;
            nav?: foundry.client.applications.ui.SceneNavigation;
            menu?: foundry.client.applications.ui.MainMenu;
        };
        utils: {
            AsyncFunction: Func<Promise<any>>;
            BitMask: Constructor<foundry.common.utils.BitMask>;
            Collection: Constructor<foundry.common.utils.Collection>;
            Color: Constructor<foundry.common.utils.Color>;
            EventEmitterMixin: Func;
            HttpError: Constructor<Hfoundry.common.utils.ttpError>;
            IterableWeakMap: Constructor<foundry.common.utils.IterableWeakMap>;
            IterableWeakSet: Constructor<foundry.common.utils.IterableWeakSet>;
            Semaphore: Constructor<foundry.common.utils.Semaphore>;
            SortingHelpers: {
                performIntegerSort: Func;
            };
            StringTree: Constructor<foundry.common.utils.StringTree>;
            WordTree: Constructor<foundry.common.utils.WordTree>;
            applySpecialKeys: Func;
            benchmark: Func;
            buildUuid: Func;
            circleCircleIntersects: Func;
            cleanHTML: Func;
            closestPointToSegment: Func;
            debounce: Func;
            debouncedReload: Func;
            deepClone: Func;
            deepFreeze: Func;
            deepSeal: Func;
            deleteProperty: Func;
            diffObject: Func;
            duplicate: Func;
            encodeURL: Func;
            escapeHTML: Func;
            expandObject: Func;
            fetchJsonWithTimeout: Func;
            fetchWithTimeout: Func;
            filterObject: Func;
            flattenObject: Func;
            formatFileSize: Func;
            fromUuid: Func;
            fromUuidSync: Func;
            getDefiningClass: Func;
            getDocumentClass: Func;
            getParentClasses: Func;
            getPlaceableObjectClass: Func;
            getProperty: Func;
            getRoute: Func;
            getType: Func;
            hasProperty: Func;
            invertObject: Func;
            isDeletionKey: Func;
            isEmpty: Func;
            isNewerVersion: Func;
            isSubclass: Func;
            lineCircleIntersection: Func;
            lineLineIntersection: Func;
            lineSegmentIntersection: Func;
            lineSegmentIntersects: Func;
            logCompatibilityWarning: Func;
            mergeObject: Func;
            objectsEqual: Func;
            orient2dFast: Func;
            parseHTML: Func;
            parseS3URL: Func;
            parseUuid: Func;
            pathCircleIntersects: Func;
            performIntegerSort: Func;
            polygonCentroid: Func;
            quadraticIntersection: Func;
            randomID: Func;
            readTextFromFile: Func;
            saveDataToFile: Func;
            setProperty: Func;
            threadLock: Func;
            throttle: Func;
            timeSince: Func;
            types: PlainObject;
            unescapeHTML: Func;
        };
        CONFIG: PlainObject;
    }

    var fvtt: FoundryGlobal;
}

export {};
