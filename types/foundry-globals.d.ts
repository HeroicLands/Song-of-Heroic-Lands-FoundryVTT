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
                DocumentSheetConfig: Constructor<fvtt.client.applications.apps.DocumentSheetConfig>;
                FilePicker: Constructor<fvtt.client.applications.apps.FilePicker>;
                PermissionConfig: Constructor<fvtt.client.applications.apps.PermissionConfig>;
            };
            dice: {
                RollResolver: Constructor<fvtt.client.applications.dice.RollResolver>;
            };
            elements: {
                AbstractFormInputElement: Constructor<fvtt.client.applications.elements.AbstractFormInputElement>;
                AbstractMultiSelectElement: Constructor<fvtt.client.applications.elements.AbstractMultiSelectElement>;
                HTMLCodeMirrorElement: Constructor<fvtt.client.applications.elements.HTMLCodeMirrorElement>;
                HTMLColorPickerElement: Constructor<fvtt.client.applications.elements.HTMLColorPickerElement>;
                HTMLDocumentEmbedElement: Constructor<fvtt.client.applications.elements.HTMLDocumentEmbedElement>;
                HTMLDocumentTagsElement: Constructor<fvtt.client.applications.elements.HTMLDocumentTagsElement>;
                HTMLEnrichedContentElement: Constructor<fvtt.client.applications.elements.HTMLEnrichedContentElement>;
                HTMLFilePickerElement: Constructor<fvtt.client.applications.elements.HTMLFilePickerElement>;
                HTMLHueSelectorSlider: Constructor<fvtt.client.applications.elements.HTMLHueSelectorSlider>;
                HTMLMultiCheckboxElement: Constructor<fvtt.client.applications.elements.HTMLMultiCheckboxElement>;
                HTMLMultiSelectElement: Constructor<fvtt.client.applications.elements.HTMLMultiSelectElement>;
                HTMLProseMirrorElement: Constructor<fvtt.client.applications.elements.HTMLProseMirrorElement>;
                HTMLRangePickerElement: Constructor<fvtt.client.applications.elements.HTMLRangePickerElement>;
                HTMLSecretBlockElement: Constructor<fvtt.client.applications.elements.HTMLSecretBlockElement>;
                HTMLStringTagsElement: Constructor<fvtt.client.applications.elements.HTMLStringTagsElement>;
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
                TokenHUD: Constructor<fvtt.client.applications.hud.TokenHUD>;
            };
            parseHTML: Func;
            settings: {
                SettingsConfig: Constructor<fvtt.client.applications.settings.SettingsConfig>;
                menus: {
                    AVConfig: Constructor<fvtt.client.applications.settings.menu.AVConfig>;
                    DefaultSheetsConfig: Constructor<fvtt.client.applications.settings.menu.DefaultSheetsConfig>;
                    DiceConfig: Constructor<fvtt.client.applications.settings.menu.DiceConfig>;
                    FontConfig: Constructor<fvtt.client.applications.settings.menu.FontConfig>;
                    PrototypeOverridesConfig: Constructor<fvtt.client.applications.settings.menu.PrototypeOverridesConfig>;
                    UIConfig: Constructor<fvtt.client.applications.settings.menu.UIConfig>;
                };
            };
            sheets: {
                ActiveEffectConfig: Constructor<fvtt.client.applications.sheets.ActiveEffectConfig>;
                ActorSheetV2: Constructor<fvtt.client.applications.sheets.ActorSheetV2>;
                AdventureExporter: Constructor<fvtt.client.applications.sheets.AdventureExporter>;
                AdventureImporterV2: Constructor<fvtt.client.applications.sheets.AdventureImporterV2>;
                BaseSheet: Constructor<fvtt.client.applications.sheets.BaseSheet>;
                CardConfig: Constructor<fvtt.client.applications.sheets.CardConfig>;
                CardDeckConfig: Constructor<fvtt.client.applications.sheets.CardDeckConfig>;
                CardHandConfig: Constructor<fvtt.client.applications.sheets.CardHandConfig>;
                CardPileConfig: Constructor<fvtt.client.applications.sheets.CardPileConfig>;
                CardsConfig: Constructor<fvtt.client.applications.sheets.CardsConfig>;
                CombatantConfig: Constructor<fvtt.client.applications.sheets.CombatantConfig>;
                FolderConfig: Constructor<fvtt.client.applications.sheets.FolderConfig>;
                ItemSheetV2: Constructor<fvtt.client.applications.sheets.ItemSheetV2>;
                MacroConfig: Constructor<fvtt.client.applications.sheets.MacroConfig>;
                MeasuredTemplateConfig: Constructor<MeasuredTemplateConfig>;
                NoteConfig: Constructor<fvtt.client.applications.sheets.NoteConfig>;
                PlaylistConfig: Constructor<fvtt.client.applications.sheets.PlaylistConfig>;
                PlaylistSoundConfig: Constructor<fvtt.client.applications.sheets.PlaylistSoundConfig>;
                PrototypeTokenConfig: Constructor<fvtt.client.applications.sheets.PrototypeTokenConfig>;
                RegionBehaviorConfig: Constructor<fvtt.client.applications.sheets.RegionBehaviorConfig>;
                RegionConfig: Constructor<fvtt.client.applications.sheets.RegionConfig>;
                RollTableSheet: Constructor<fvtt.client.applications.sheets.RollTableSheet>;
                SceneConfig: Constructor<fvtt.client.applications.sheets.SceneConfig>;
                TableResultConfig: Constructor<fvtt.client.applications.sheets.TableResultConfig>;
                TileConfig: Constructor<fvtt.client.applications.sheets.TileConfig>;
                TokenConfig: Constructor<fvtt.client.applications.sheets.TokenConfig>;
                UserConfig: Constructor<fvtt.client.applications.sheets.UserConfig>;
                _registerDefaultSheets: Func;
                journal: {
                    JournalEntryCategoryConfig: Constructor<fvtt.client.applications.sheets.journal.JournalEntryCategoryConfig>;
                    JournalEntryPageHandlebarsSheet: Constructor<fvtt.client.applications.sheets.journal.JournalEntryPageHandlebarsSheet>;
                    JournalEntryPageImageSheet: Constructor<fvtt.client.applications.sheets.journal.JournalEntryPageImageSheet>;
                    JournalEntryPageMarkdownSheet: Constructor<fvtt.client.applications.sheets.journal.JournalEntryPageMarkdownSheet>;
                    JournalEntryPagePDFSheet: Constructor<fvtt.client.applications.sheets.journal.JournalEntryPagePDFSheet>;
                    JournalEntryPageProseMirrorSheet: Constructor<fvtt.client.applications.sheets.journal.JournalEntryPageProseMirrorSheet>;
                    JournalEntryPageSheet: Constructor<fvtt.client.applications.sheets.journal.JournalEntryPageSheet>;
                    JournalEntryPageTextSheet: Constructor<fvtt.client.applications.sheets.journal.JournalEntryPageTextSheet>;
                    JournalEntryPageVideoSheet: Constructor<fvtt.client.applications.sheets.journal.JournalEntryPageVideoSheet>;
                    JournalEntrySheet: Constructor<fvtt.client.applications.sheets.journal.JournalEntrySheet>;
                    ShowToPlayersDialog: Constructor<fvtt.client.applications.sheets.journal.ShowToPlayersDialog>;
                };
            };
            sidebar: {
                AbstractSidebarTab: Constructor<fvtt.client.applications.sidebar.AbstractSidebarTab>;
                DocumentDirectory: Constructor<fvtt.client.applications.sidebar.DocumentDirectory>;
                Sidebar: Constructor<fvtt.client.applications.sidebar.Sidebar>;
                apps: {
                    ChatPopout: Constructor<fvtt.client.applications.sidebar.apps.ChatPopout>;
                    Compendium: Constructor<fvtt.client.applications.sidebar.apps.Compendium>;
                    ControlsConfig: Constructor<fvtt.client.applications.sidebar.apps.ControlsConfig>;
                    FolderExport: Constructor<fvtt.client.applications.sidebar.apps.FolderExport>;
                    FrameViewer: Constructor<fvtt.client.applications.sidebar.apps.FrameViewer>;
                    InvitationLinks: Constructor<fvtt.client.applications.sidebar.apps.InvitationLinks>;
                    ModuleManagement: Constructor<fvtt.client.applications.sidebar.apps.ModuleManagement>;
                    SupportDetails: Constructor<fvtt.client.applications.sidebar.apps.SupportDetails>;
                    ToursManagement: Constructor<fvtt.client.applications.sidebar.apps.ToursManagement>;
                    WorldConfig: Constructor<fvtt.client.applications.sidebar.apps.WorldConfig>;
                };
                tabs: {
                    ActorDirectory: Constructor<fvtt.client.applications.sidebar.tabs.ActorDirectory>;
                    CardsDirectory: Constructor<fvtt.client.applications.sidebar.tabs.CardsDirectory>;
                    ChatLog: Constructor<fvtt.client.applications.sidebar.tabs.ChatLog>;
                    CombatTracker: Constructor<fvtt.client.applications.sidebar.tabs.CombatTracker>;
                    CompendiumDirectory: Constructor<fvtt.client.applications.sidebar.tabs.CompendiumDirectory>;
                    ItemDirectory: Constructor<fvtt.client.applications.sidebar.tabs.ItemDirectory>;
                    JournalDirectory: Constructor<fvtt.client.applications.sidebar.tabs.JournalDirectory>;
                    MacroDirectory: Constructor<fvtt.client.applications.sidebar.tabs.MacroDirectory>;
                    PlaylistDirectory: Constructor<fvtt.client.applications.sidebar.tabs.PlaylistDirectory>;
                    RollTableDirectory: Constructor<fvtt.client.applications.sidebar.tabs.RollTableDirectory>;
                    SceneDirectory: Constructor<fvtt.client.applications.sidebar.tabs.SceneDirectory>;
                    Settings: Constructor<fvtt.client.applications.sidebar.tabs.Settings>;
                };
            };
            ui: {
                GamePause: Constructor<fvtt.client.applications.ui.GamePause>;
                Hotbar: Constructor<fvtt.client.applications.ui.Hotbar>;
                MainMenu: Constructor<fvtt.client.applications.ui.MainMenu>;
                Notifications: Constructor<fvtt.client.applications.ui.Notifications>;
                Players: Constructor<fvtt.client.applications.ui.Players>;
                RegionLegend: Constructor<fvtt.client.applications.ui.RegionLegend>;
                SceneControls: Constructor<fvtt.client.applications.ui.SceneControls>;
                SceneNavigation: Constructor<fvtt.client.applications.ui.SceneNavigation>;
            };
            ux: {
                ContextMenu: Constructor<fvtt.client.applications.ux.ContextMenu>;
                DragDrop: Constructor<fvtt.client.applications.ux.DragDrop>;
                Draggable: Constructor<fvtt.client.applications.ux.Draggable>;
                FormDataExtended: Constructor<fvtt.client.applications.ux.FormDataExtended>;
                HTMLSecret: Constructor<fvtt.client.applications.ux.HTMLSecret>;
                ProseMirrorEditor: Constructor<fvtt.client.applications.ux.ProseMirrorEditor>;
                SearchFilter: Constructor<fvtt.client.applications.ux.SearchFilter>;
                Tabs: Constructor<fvtt.client.applications.ux.Tabs>;
                TextEditor: Constructor<fvtt.client.applications.ux.TextEditor>;
            };
        };
        canvas: {
            Canvas: Constructor<fvtt.client.canvas.Canvas>;
            geometry: {
                CanvasQuadtree: Constructor<fvtt.client.canvas.geometry.CanvasQuadtree>;
                ClockwiseSweepPolygon: Constructor<fvtt.client.canvas.geometry.ClockwiseSweepPolygon>;
                LimitedAnglePolygon: Constructor<fvtt.client.canvas.geometry.LimitedAnglePolygon>;
                ObservableTransform: Constructor<fvtt.client.canvas.geometry.ObservableTransform>;
                PointSourcePolygon: Constructor<fvtt.client.canvas.geometry.PointSourcePolygon>;
                PolygonMesher: Constructor<fvtt.client.canvas.geometry.PolygonMesher>;
                Quadtree: Constructor<fvtt.client.canvas.geometry.Quadtree>;
                Ray: Constructor<fvtt.client.canvas.geometry.Ray>;
                UnboundTransform: Constructor<fvtt.client.canvas.geometry.UnboundTransform>;
                WeilerAthertonClipper: Constructor<fvtt.client.canvas.geometry.WeilerAthertonClipper>;
                edges: {
                    CanvasEdges: Constructor<fvtt.client.canvas.geometry.edges.CanvasEdges>;
                    CollisionResult: Constructor<fvtt.client.canvas.geometry.edges.CollisionResult>;
                    Edge: Constructor<fvtt.client.canvas.geometry.edges.Edge>;
                    PolygonVertex: Constructor<fvtt.client.canvas.geometry.edges.PolygonVertex>;
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
                AlertPing: Constructor<fvtt.client.canvas.interaction.ping.AlertPing>;
                ArrowPing: Constructor<fvtt.client.canvas.interaction.ping.ArrowPing>;
                BaseRuler: Constructor<fvtt.client.canvas.interaction.ruler.BaseRuler>;
                ChevronPing: Constructor<fvtt.client.canvas.interaction.ping.ChevronPing>;
                Ping: Constructor<fvtt.client.canvas.interaction.ping.Ping>;
                PulsePing: Constructor<fvtt.client.canvas.interaction.ping.PulsePing>;
                Ruler: Constructor<fvtt.client.canvas.interaction.ruler.Ruler>;
            };
            layers: {
                CanvasBackgroundAlterationEffects: Constructor<fvtt.client.canvas.layers.effects.CanvasBackgroundAlterationEffects>;
                CanvasColorationEffects: Constructor<fvtt.client.canvas.layers.effects.CanvasColorationEffects>;
                CanvasDarknessEffects: Constructor<fvtt.client.canvas.layers.effects.CanvasDarknessEffects>;
                CanvasDepthMask: Constructor<fvtt.client.canvas.layers.masks.CanvasDepthMask>;
                CanvasIlluminationEffects: Constructor<fvtt.client.canvas.layers.effects.CanvasIlluminationEffects>;
                CanvasLayer: Constructor<fvtt.client.canvas.layers.CanvasLayer>;
                CanvasOcclusionMask: Constructor<fvtt.client.canvas.layers.masks.CanvasOcclusionMask>;
                CanvasVisionMask: Constructor<fvtt.client.canvas.layers.masks.CanvasVisionMask>;
                ControlsLayer: Constructor<fvtt.client.canvas.layers.ControlsLayer>;
                DarknessLevelContainer: Constructor<fvtt.client.canvas.layers.DarknessLevelContainer>;
                DrawingsLayer: Constructor<fvtt.client.canvas.layers.DrawingsLayer>;
                GridLayer: Constructor<fvtt.client.canvas.layers.GridLayer>;
                InteractionLayer: Constructor<fvtt.client.canvas.layers.InteractionLayer>;
                LightingLayer: Constructor<fvtt.client.canvas.layers.LightingLayer>;
                NotesLayer: Constructor<fvtt.client.canvas.layers.NotesLayer>;
                PlaceablesLayer: Constructor<fvtt.client.canvas.layers.PlaceablesLayer>;
                RegionLayer: Constructor<fvtt.client.canvas.layers.RegionLayer>;
                SoundsLayer: Constructor<fvtt.client.canvas.layers.SoundsLayer>;
                TemplateLayer: Constructor<fvtt.client.canvas.layers.TemplateLayer>;
                TilesLayer: Constructor<fvtt.client.canvas.layers.TilesLayer>;
                TokenLayer: Constructor<fvtt.client.canvas.layers.TokenLayer>;
                WallsLayer: Constructor<fvtt.client.canvas.layers.WallsLayer>;
                WeatherEffects: Constructor<fvtt.client.canvas.layers.effects.WeatherEffects>;
            };
            loadTexture: Func;
            perception: {
                DetectionMode: Constructor<fvtt.client.canvas.perception.DetectionMode>;
                DetectionModeAll: Constructor<fvtt.client.canvas.perception.DetectionModeAll>;
                DetectionModeDarkvision: Constructor<fvtt.client.canvas.perception.DetectionModeDarkvision>;
                DetectionModeInvisibility: Constructor<fvtt.client.canvas.perception.DetectionModeInvisibility>;
                DetectionModeLightPerception: Constructor<fvtt.client.canvas.perception.DetectionModeLightPerception>;
                DetectionModeTremor: Constructor<fvtt.client.canvas.perception.DetectionModeTremor>;
                FogManager: Constructor<fvtt.client.canvas.perception.FogManager>;
                PerceptionManager: Constructor<fvtt.client.canvas.perception.PerceptionManager>;
                VisionMode: Constructor<fvtt.client.canvas.perception.VisionMode>;
            };
            placeables: {
                AmbientLight: Constructor<fvtt.client.canvas.placeables.AmbientLight>;
                AmbientSound: Constructor<fvtt.client.canvas.placeables.AmbientSound>;
                Drawing: Constructor<fvtt.client.canvas.placeables.Drawing>;
                MeasuredTemplate: Constructor<fvtt.client.canvas.placeables.MeasuredTemplate>;
                Note: Constructor<fvtt.client.canvas.placeables.Note>;
                PlaceableObject: Constructor<fvtt.client.canvas.placeables.PlaceableObject>;
                Region: Constructor<fvtt.client.canvas.placeables.Region>;
                Tile: Constructor<fvtt.client.canvas.placeables.Tile>;
                Token: Constructor<fvtt.client.canvas.placeables.Token>;
                Wall: Constructor<fvtt.client.canvas.placeables.Wall>;
                regions: {
                    RegionGeometry: Constructor<fvtt.client.canvas.placeables.regions.RegionGeometry>;
                    RegionMesh: Constructor<fvtt.client.canvas.placeables.regions.RegionMesh>;
                };
                tokens: {
                    BaseTokenRuler: Constructor<fvtt.client.canvas.placeables.tokens.BaseTokenRuler>;
                    DynamicRingData: Constructor<fvtt.client.canvas.placeables.tokens.DynamicRingData>;
                    TokenRing: Constructor<fvtt.client.canvas.placeables.tokens.TokenRing>;
                    TokenRingConfig: Constructor<fvtt.client.canvas.placeables.tokens.TokenRingConfig>;
                    TokenRuler: Constructor<fvtt.client.canvas.placeables.tokens.TokenRuler>;
                    TokenTurnMarker: Constructor<fvtt.client.canvas.placeables.tokens.TokenTurnMarker>;
                    TurnMarkerData: Constructor<fvtt.client.canvas.placeables.tokens.TurnMarkerData>;
                    UserTargets: Constructor<fvtt.client.canvas.placeables.tokens.UserTargets>;
                };
            };
            primary: {
                CanvasTransformMixin: Func;
                PrimaryCanvasContainer: Constructor<fvtt.client.canvas.primary.PrimaryCanvasContainer>;
                PrimaryCanvasObjectMixin: Func;
                PrimaryGraphics: Constructor<fvtt.client.canvas.primary.PrimaryGraphics>;
                PrimaryOccludableObjectMixin: Func;
                PrimaryParticleEffect: Constructor<fvtt.client.canvas.primary.PrimaryParticleEffect>;
                PrimarySpriteMesh: Constructor<fvtt.client.canvas.primary.PrimarySpriteMesh>;
            };
        };
        data: {
            ActorDeltaField: Constructor<fvtt.common.data.ActorDeltaField>;
            BaseShapeData: Constructor<fvtt.common.data.BaseShapeData>;
            BaseTerrainData: Constructor<fvtt.common.data.BaseTerrainData>;
            CalendarData: Constructor<fvtt.common.data.CalendarData>;
            CircleShapeData: Constructor<fvtt.common.data.CircleShapeData>;
            ClientDatabaseBackend: Constructor<fvtt.common.data.ClientDatabaseBackend>;
            CombatConfiguration: Constructor<fvtt.common.data.CombatConfiguration>;
            EllipseShapeData: Constructor<fvtt.common.data.EllipseShapeData>;
            LightData: Constructor<fvtt.common.data.LightData>;
            PolygonShapeData: Constructor<fvtt.common.data.PolygonShapeData>;
            PrototypeToken: Constructor<fvtt.common.data.PrototypeToken>;
            PrototypeTokenOverrides: Constructor<fvtt.common.data.PrototypeTokenOverrides>;
            RectangleShapeData: Constructor<fvtt.common.data.RectangleShapeData>;
            SIMPLIFIED_GREGORIAN_CALENDAR_CONFIG: PlainObject;
            ShapeData: Constructor<fvtt.common.data.ShapeData>;
            TerrainData: Constructor<fvtt.common.data.TerrainData>;
            TextureData: Constructor<fvtt.common.data.TextureData>;
            TombstoneData: Constructor<fvtt.common.data.TombstoneData>;
            fields: {
                AlphaField: Constructor<fvtt.common.data.fields.AlphaField>;
                AngleField: Constructor<fvtt.common.data.fields.AngleField>;
                AnyField: Constructor<fvtt.common.data.fields.AnyField>;
                ArrayField: Constructor<fvtt.common.data.fields.ArrayField>;
                BooleanField: Constructor<fvtt.common.data.fields.BooleanField>;
                ColorField: Constructor<fvtt.common.data.fields.ColorField>;
                DataField: Constructor<fvtt.common.data.fields.DataField>;
                DocumentAuthorField: Constructor<fvtt.common.data.fields.DocumentAuthorField>;
                DocumentFlagsField: Constructor<fvtt.common.data.fields.DocumentFlagsField>;
                DocumentIdField: Constructor<fvtt.common.data.fields.DocumentIdField>;
                DocumentOwnershipField: Constructor<fvtt.common.data.fields.DocumentOwnershipField>;
                DocumentStatsField: Constructor<fvtt.common.data.fields.DocumentStatsField>;
                DocumentTypeField: Constructor<fvtt.common.data.fields.DocumentTypeField>;
                DocumentUUIDField: Constructor<fvtt.common.data.fields.DocumentUUIDField>;
                EmbeddedCollectionDeltaField: Constructor<fvtt.common.data.fields.EmbeddedCollectionDeltaField>;
                EmbeddedCollectionField: Constructor<fvtt.common.data.fields.EmbeddedCollectionField>;
                EmbeddedDataField: Constructor<fvtt.common.data.fields.EmbeddedDataField>;
                EmbeddedDocumentField: Constructor<fvtt.common.data.fields.EmbeddedDocumentField>;
                FilePathField: Constructor<fvtt.common.data.fields.FilePathField>;
                ForeignDocumentField: Constructor<fvtt.common.data.fields.ForeignDocumentField>;
                HTMLField: Constructor<fvtt.common.data.fields.HTMLField>;
                HueField: Constructor<fvtt.common.data.fields.HueField>;
                IntegerSortField: Constructor<fvtt.common.data.fields.IntegerSortField>;
                JSONField: Constructor<Jfvtt.common.data.fields.SONField>;
                JavaScriptField: Constructor<fvtt.common.data.fields.JavaScriptField>;
                NumberField: Constructor<fvtt.common.data.fields.NumberField>;
                ObjectField: Constructor<fvtt.common.data.fields.ObjectField>;
                SchemaField: Constructor<fvtt.common.data.fields.SchemaField>;
                SetField: Constructor<fvtt.common.data.fields.SetField>;
                StringField: Constructor<fvtt.common.data.fields.StringField>;
                TypeDataField: Constructor<fvtt.common.data.fields.TypeDataField>;
                TypedObjectField: Constructor<fvtt.common.data.fields.TypedObjectField>;
                TypedSchemaField: Constructor<fvtt.common.data.fields.TypedSchemaField>;
            };
            regionBehaviors: {
                AdjustDarknessLevelRegionBehaviorType: Constructor<fvtt.client.data.regionBehaviors.AdjustDarknessLevelRegionBehaviorType>;
                DisplayScrollingTextRegionBehaviorType: Constructor<fvtt.client.data.regionBehaviors.DisplayScrollingTextRegionBehaviorType>;
                ExecuteMacroRegionBehaviorType: Constructor<fvtt.client.data.regionBehaviors.ExecuteMacroRegionBehaviorType>;
                ExecuteScriptRegionBehaviorType: Constructor<fvtt.client.data.regionBehaviors.ExecuteScriptRegionBehaviorType>;
                ModifyMovementCostRegionBehaviorType: Constructor<fvtt.client.data.regionBehaviors.ModifyMovementCostRegionBehaviorType>;
                PauseGameRegionBehaviorType: Constructor<fvtt.client.data.regionBehaviors.PauseGameRegionBehaviorType>;
                RegionBehaviorType: Constructor<fvtt.client.data.regionBehaviors.RegionBehaviorType>;
                SuppressWeatherRegionBehaviorType: Constructor<fvtt.client.data.regionBehaviors.SuppressWeatherRegionBehaviorType>;
                TeleportTokenRegionBehaviorType: Constructor<fvtt.client.data.regionBehaviors.TeleportTokenRegionBehaviorType>;
                ToggleBehaviorRegionBehaviorType: Constructor<fvtt.client.data.regionBehaviors.ToggleBehaviorRegionBehaviorType>;
            };
            regionShapes: {
                RegionCircleShape: Constructor<fvtt.client.data.regionShapes.RegionCircleShape>;
                RegionEllipseShape: Constructor<fvtt.client.data.regionShapes.RegionEllipseShape>;
                RegionPolygonShape: Constructor<fvtt.client.data.regionShapes.RegionPolygonShape>;
                RegionPolygonTree: Constructor<fvtt.client.data.regionShapes.RegionPolygonTree>;
                RegionPolygonTreeNode: Constructor<Rfvtt.client.data.regionShapes.egionPolygonTreeNode>;
                RegionRectangleShape: Constructor<fvtt.client.data.regionShapes.RegionRectangleShape>;
                RegionShape: Constructor<fvtt.client.data.regionShapes.RegionShape>;
            };
            types: PlainObject;
            validation: {
                DataModelValidationError: Constructor<fvtt.common.data.DataModelValidationError>;
                DataModelValidationFailure: Constructor<fvtt.common.data.DataModelValidationFailure>;
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
            MersenneTwister: Constructor<fvtt.client.dice.MersenneTwister>;
            Roll: Constructor<fvtt.client.dice.Roll>;
            RollGrammar: {
                StartRules: Array<string>;
                SyntaxError: Func;
                parse: Func;
            };
            RollParser: Constructor<fvtt.client.dice.RollParser>;
            terms: {
                Coin: Constructor<fvtt.client.dice.terms.Coin>;
                DiceTerm: Constructor<fvtt.client.dice.terms.DiceTerm>;
                Die: Constructor<fvtt.client.dice.terms.Die>;
                FateDie: Constructor<fvtt.client.dice.terms.FateDie>;
                FuncTerm: Constructor<fvtt.client.dice.terms.FuncTerm>;
                NumericTerm: Constructor<fvtt.client.dice.terms.NumericTerm>;
                OperatorTerm: Constructor<fvtt.client.dice.terms.OperatorTerm>;
                ParentheticalTerm: Constructor<fvtt.client.dice.terms.ParentheticalTerm>;
                PoolTerm: Constructor<fvtt.client.dice.terms.PoolTerm>;
                RollTerm: Constructor<fvtt.client.dice.terms.RollTerm>;
                StringTerm: Constructor<fvtt.client.dice.terms.StringTerm>;
            };
        };
        documents: {
            ActiveEffect: Constructor<ActiveEffect>;
            Actor: Constructor<Actor>;
            ActorDelta: Constructor<fvtt.client.documents.ActorDelta>;
            Adventure: Constructor<fvtt.client.documents.Adventure>;
            AmbientLightDocument: Constructor<fvtt.client.documents.AmbientLightDocument>;
            AmbientSoundDocument: Constructor<fvtt.client.documents.AmbientSoundDocument>;
            BaseActiveEffect: Constructor<fvtt.common.documents.BaseActiveEffect>;
            BaseActor: Constructor<fvtt.common.documents.BaseActor>;
            BaseActorDelta: Constructor<fvtt.common.documents.BaseActorDelta>;
            BaseAdventure: Constructor<fvtt.common.documents.BaseAdventure>;
            BaseAmbientLight: Constructor<fvtt.common.documents.BaseAmbientLight>;
            BaseAmbientSound: Constructor<fvtt.common.documents.BaseAmbientSound>;
            BaseCard: Constructor<fvtt.common.documents.BaseCard>;
            BaseCards: Constructor<fvtt.common.documents.BaseCards>;
            BaseChatMessage: Constructor<fvtt.common.documents.BaseChatMessage>;
            BaseCombat: Constructor<fvtt.common.documents.BaseCombat>;
            BaseCombatant: Constructor<fvtt.common.documents.BaseCombatant>;
            BaseCombatantGroup: Constructor<fvtt.common.documents.BaseCombatantGroup>;
            BaseDrawing: Constructor<fvtt.common.documents.BaseDrawing>;
            BaseFogExploration: Constructor<fvtt.common.documents.BaseFogExploration>;
            BaseFolder: Constructor<fvtt.common.documents.BaseFolder>;
            BaseItem: Constructor<fvtt.common.documents.BaseItem>;
            BaseJournalEntry: Constructor<fvtt.common.documents.BaseJournalEntry>;
            BaseJournalEntryCategory: Constructor<fvtt.common.documents.BaseJournalEntryCategory>;
            BaseJournalEntryPage: Constructorfvtt.common.documents<BaseJournalEntryPage>;
            BaseMacro: Constructor<fvtt.common.documents.BaseMacro>;
            BaseMeasuredTemplate: Constructor<fvtt.common.documents.BaseMeasuredTemplate>;
            BaseNote: Constructor<fvtt.common.documents.BaseNote>;
            BasePlaylist: Constructor<fvtt.common.documents.BasePlaylist>;
            BasePlaylistSound: Constructor<fvtt.common.documents.BasePlaylistSound>;
            BaseRegion: Constructor<fvtt.common.documents.BaseRegion>;
            BaseRegionBehavior: Constructor<fvtt.common.documents.BaseRegionBehavior>;
            BaseRollTable: Constructor<fvtt.common.documents.BaseRollTable>;
            BaseScene: Constructor<fvtt.common.documents.BaseScene>;
            BaseSetting: Constructor<fvtt.common.documents.BaseSetting>;
            BaseTableResult: Constructor<fvtt.common.documents.BaseTableResult>;
            BaseTile: Constructor<fvtt.common.documents.BaseTile>;
            BaseToken: Constructor<fvtt.common.documents.BaseToken>;
            BaseUser: Constructor<fvtt.common.documents.BaseUser>;
            BaseWall: Constructor<fvtt.common.documents.BaseWall>;
            Card: Constructor<fvtt.client.documents.Card>;
            Cards: Constructor<fvtt.client.documents.Cards>;
            ChatMessage: Constructor<fvtt.client.documents.ChatMessage>;
            Combat: Constructor<Combat>;
            Combatant: Constructor<fvtt.client.documents.Combatant>;
            CombatantGroup: Constructor<fvtt.client.documents.CombatantGroup>;
            DrawingDocument: Constructor<fvtt.client.documents.DrawingDocument>;
            FogExploration: Constructor<fvtt.client.documents.FogExploration>;
            Folder: Constructor<fvtt.client.documents.Folder>;
            Item: Constructor<Item>;
            JournalEntry: Constructor<fvtt.client.documents.JournalEntry>;
            JournalEntryCategory: Constructor<fvtt.client.documents.JournalEntryCategory>;
            JournalEntryPage: Constructor<fvtt.client.documents.JournalEntryPage>;
            Macro: Constructor<fvtt.client.documents.Macro>;
            MeasuredTemplateDocument: Constructor<fvtt.client.documents.MeasuredTemplateDocument>;
            NoteDocument: Constructor<fvtt.client.documents.NoteDocument>;
            Playlist: Constructor<fvtt.client.documents.Playlist>;
            PlaylistSound: Constructor<fvtt.client.documents.PlaylistSound>;
            RegionBehavior: Constructor<fvtt.client.documents.RegionBehavior>;
            RegionDocument: Constructor<fvtt.client.documents.RegionDocument>;
            RollTable: Constructor<fvtt.client.documents.RollTable>;
            Scene: Constructor<fvtt.client.documents.Scene>;
            Setting: Constructor<fvtt.client.documents.Setting>;
            TableResult: Constructor<fvtt.client.documents.TableResult>;
            TileDocument: Constructor<fvtt.client.documents.TileDocument>;
            TokenDocument: Constructor<fvtt.client.documents.TokenDocument>;
            User: Constructor<fvtt.client.documents.User>;
            WallDocument: Constructor<fvtt.client.documents.WallDocument>;
            abstract: {
                CanvasDocumentMixin: Func;
                ClientDocumentMixin: Mixin<ClientDocument>;
                DirectoryCollectionMixin: Func;
                DocumentCollection: Constructor<fvtt.client.documents.abstract.DocumentCollection>;
                WorldCollection: Constructor<fvtt.client.documents.abstract.WorldCollection>;
            };
            collections: {
                Actors: Constructor<fvtt.client.documents.collections.Actors>;
                CardStacks: Constructor<fvtt.client.documents.collections.CardStacks>;
                ChatMessages: Constructor<fvtt.client.documents.collections.ChatMessages>;
                CombatEncounters: Constructor<fvtt.client.documents.collections.CombatEncounters>;
                CompendiumCollection: Constructor<fvtt.client.documents.collections.CompendiumCollection>;
                CompendiumFolderCollection: Constructor<fvtt.client.documents.collections.CompendiumFolderCollection>;
                CompendiumPacks: Constructor<fvtt.client.documents.collections.CompendiumPacks>;
                FogExplorations: Constructor<fvtt.client.documents.collections.FogExplorations>;
                Folders: Constructor<fvtt.client.documents.collections.Folders>;
                Items: Constructor<fvtt.client.documents.collections.Items>;
                Journal: Constructor<fvtt.client.documents.collections.Journal>;
                Macros: Constructor<fvtt.client.documents.collections.Macros>;
                Playlists: Constructor<fvtt.client.documents.collections.Playlists>;
                RollTables: Constructor<fvtt.client.documents.collections.RollTables>;
                Scenes: Constructor<fvtt.client.documents.collections.Scenes>;
                Users: Constructor<fvtt.client.documents.collections.Users>;
                WorldSettings: Constructor<fvtt.client.documents.collections.WorldSettings>;
            };
            types: PlainObject;
        };
        grid: {
            BaseGrid: Constructor<fvtt.common.grid.BaseGrid>;
            GridHex: Constructor<fvtt.common.grid.GridHex>;
            GridlessGrid: Constructor<fvtt.common.grid.GridlessGrid>;
            HexagonalGrid: Constructor<fvtt.common.grid.HexagonalGrid>;
            SquareGrid: Constructor<fvtt.common.grid.SquareGrid>;
            types: PlainObject;
        };
        helpers: {
            AsyncWorker: Constructor<fvtt.client.helpers.AsyncWorker>;
            ClientIssues: Constructor<fvtt.client.helpers.ClientIssues>;
            ClientSettings: Constructor<fvtt.client.helpers.ClientSettings>;
            DocumentIndex: Constructor<fvtt.client.helpers.DocumentIndex>;
            GameTime: Constructor<fvtt.client.helpers.GameTime>;
            Hooks: Constructor<fvtt.client.helpers.Hooks>;
            Localization: Constructor<fvtt.client.helpers.Localization>;
            SocketInterface: Constructor<fvtt.client.helpers.SocketInterface>;
            WorkerManager: Constructor<fvtt.client.helpers.WorkerManager>;
            interaction: {
                ClientKeybindings: Constructor<fvtt.client.helpers.interaction.ClientKeybindings>;
                ClipboardHelper: Constructor<fvtt.client.helpers.interaction.ClipboardHelper>;
                GamepadManager: Constructor<fvtt.client.helpers.interaction.GamepadManager>;
                KeyboardManager: Constructor<fvtt.client.helpers.interaction.KeyboardManager>;
                MouseManager: Constructor<fvtt.client.helpers.interaction.MouseManager>;
                TooltipManager: Constructor<fvtt.client.helpers.interaction.TooltipManager>;
            };
            media: {
                CompendiumArt: Constructor<fvtt.client.helpers.media.CompendiumArt>;
                ImageHelper: Constructor<fvtt.client.helpers.media.ImageHelper>;
                VideoHelper: Constructor<fvtt.client.helpers.media.VideoHelper>;
            };
            types: PlainObject;
        };
        nue: {
            NewUserExperienceManager: Constructor<fvtt.client.nue.NewUserExperienceManager>;
            Tour: Constructor<fvtt.client.nue.Tour>;
            ToursCollection: Constructor<fvtt.client.nue.ToursCollection>;
            registerTours: Func;
            tours: {
                CanvasTour: Constructor<fvtt.client.nue.tours.CanvasTour>;
                SetupTour: Constructor<fvtt.client.nue.tours.SetupTour>;
                SidebarTour: Constructor<fvtt.client.nue.tours.SidebarTour>;
            };
        };
        packages: {
            AdditionalTypesField: Constructor<fvtt.common.packages.AdditionalTypesField>;
            BaseModule: Constructor<fvtt.common.packages.BaseModule>;
            BasePackage: Constructor<fvtt.common.packages.BasePackage>;
            BaseSystem: Constructor<fvtt.common.packages.BaseSystem>;
            BaseWorld: Constructor<fvtt.common.packages.BaseWorld>;
            ClientPackageMixin: Mixin<fvtt.common.packages.ClientPackage>;
            Module: Constructor<fvtt.common.packages.Module>;
            PACKAGE_TYPES: {
                world: Constructor<fvtt.common.packages.World>;
                system: Constructor<fvtt.common.packages.System>;
                module: Constructor<fvtt.common.packages.Module>;
            };
            PackageCompatibility: Constructor<fvtt.common.packages.PackageCompatibility>;
            RelatedPackage: Constructor<fvtt.common.packages.RelatedPackage>;
            System: Constructor<fvtt.common.packages.System>;
            World: Constructor<fvtt.common.packages.World>;
            types: PlainObject;
        };
        types: PlainObject;
        ui: {
            notifications?: fvtt.client.applications.ui.Notifications;
            pause?: fvtt.client.applications.ui.GamePause;
            hotbar?: fvtt.client.applications.ui.Hotbar;
            players?: fvtt.client.applications.ui.Players;
            chat?: fvtt.client.applications.sidebar.tabs.ChatLog;
            nav?: fvtt.client.applications.ui.SceneNavigation;
            menu?: fvtt.client.applications.ui.MainMenu;
        };
        utils: {
            AsyncFunction: Func<Promise<any>>;
            BitMask: Constructor<fvtt.common.utils.BitMask>;
            Collection: Constructor<fvtt.common.utils.Collection>;
            Color: Constructor<fvtt.common.utils.Color>;
            EventEmitterMixin: Func;
            HttpError: Constructor<Hfvtt.common.utils.ttpError>;
            IterableWeakMap: Constructor<fvtt.common.utils.IterableWeakMap>;
            IterableWeakSet: Constructor<fvtt.common.utils.IterableWeakSet>;
            Semaphore: Constructor<fvtt.common.utils.Semaphore>;
            SortingHelpers: {
                performIntegerSort: Func;
            };
            StringTree: Constructor<fvtt.common.utils.StringTree>;
            WordTree: Constructor<fvtt.common.utils.WordTree>;
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

    // @league-of-foundry-developers/foundry-vtt-types defines a global `foundry` namespace,
    // which is ambiguous with the `foundry` global variable.
    // We use `fvtt` as an alias for the `foundry` namespace to avoid this ambiguity.
    export type fvtt = foundry;
    export var game: any; // The global game object, which is an instance of the Game class.
}

export {};
