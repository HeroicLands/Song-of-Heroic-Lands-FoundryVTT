import type { SohlActionContext } from "@common/SohlActionContext";
import { BeingData, BeingLogic, BeingSheet } from "@common/actor/Being";
import { SohlActorSheetBase } from "@common/actor/SohlActor";

export class LgndBeingLogic extends BeingLogic<BeingData> {
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export class LgndBeingSheet extends BeingSheet {
    static PARTS = {
        header: {
            id: "header",
            template: "systems/sohl/templates/legendary/actor/being/header.hbs",
        },
        tabs: {
            id: "tabs",
            template: "systems/sohl/templates/legendary/actor/being/tabs.hbs",
        },
        facade: {
            id: "facade",
            template:
                "systems/sohl/templates/legendary/actor/shared/facade.hbs",
        },
        profile: {
            id: "profile",
            template:
                "systems/sohl/templates/legendary/actor/being/profile.hbs",
        },
        skills: {
            id: "skills",
            template: "systems/sohl/templates/legendary/actor/being/skills.hbs",
        },
        combat: {
            id: "combat",
            template: "systems/sohl/templates/legendary/actor/being/combat.hbs",
        },
        trauma: {
            id: "trauma",
            template: "systems/sohl/templates/legendary/actor/being/trauma.hbs",
        },
        mysteries: {
            id: "mysteries",
            template:
                "systems/sohl/templates/legendary/actor/being/mysteries.hbs",
        },
        gear: {
            id: "gear",
            template: "systems/sohl/templates/legendary/actor/shared/gear.hbs",
        },
        actions: {
            id: "actions",
            template:
                "systems/sohl/templates/legendary/actor/shared/actions.hbs",
        },
        effects: {
            id: "effects",
            template:
                "systems/sohl/templates/legendary/actor/shared/effects.hbs",
        },
    } as const;

    static TABS = {
        primary: {
            initial: "facade",
            tabs: [
                {
                    id: "facade",
                    label: "SOHL.Actor.SHEET.tab.facade.label",
                    tooltip: "SOHL.Actor.SHEET.tab.facade.tooltip",
                    icon: "fas fa-masks-theater",
                },
                {
                    id: "profile",
                    label: "SOHL.Actor.SHEET.tab.profile.label",
                    tooltip: "SOHL.Actor.SHEET.tab.profile.tooltip",
                    icon: "fas fa-user",
                },
                {
                    id: "skills",
                    label: "SOHL.Actor.SHEET.tab.skills.label",
                    tooltip: "SOHL.Actor.SHEET.tab.skills.tooltip",
                    icon: "fas fa-book",
                },
                {
                    id: "combat",
                    label: "SOHL.Actor.SHEET.tab.combat.label",
                    tooltip: "SOHL.Actor.SHEET.tab.combat.tooltip",
                    icon: "fas fa-sword",
                },
                {
                    id: "trauma",
                    label: "SOHL.Actor.SHEET.tab.trauma.label",
                    tooltip: "SOHL.Actor.SHEET.tab.trauma.tooltip",
                    icon: "fas fa-heartbeat",
                },
                {
                    id: "mysteries",
                    label: "SOHL.Actor.SHEET.tab.mysteries.label",
                    tooltip: "SOHL.Actor.SHEET.tab.mysteries.tooltip",
                    icon: "fas fa-sparkles",
                },
                {
                    id: "gear",
                    label: "SOHL.Actor.SHEET.tab.gear.label",
                    tooltip: "SOHL.Actor.SHEET.tab.gear.tooltip",
                    icon: "fas fa-briefcase",
                },
                {
                    id: "actions",
                    label: "SOHL.Actor.SHEET.tab.actions.label",
                    tooltip: "SOHL.Actor.SHEET.tab.actions.tooltip",
                    icon: "fas fa-cogs",
                },
                {
                    id: "effects",
                    label: "SOHL.Actor.SHEET.tab.effects.label",
                    tooltip: "SOHL.Actor.SHEET.tab.effects.tooltip",
                    icon: "fas fa-bolt",
                },
            ],
        },
    };

    override _configureRenderOptions(
        options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
    ): void {
        super._configureRenderOptions(options);

        options.parts = ["header", "tabs", "facade"];

        // Don't show the other tabs if only limited view
        if ((this.document as any).limited) return;

        options.parts.push(
            "profile",
            "skills",
            "combat",
            "trauma",
            "mysteries",
            "gear",
            "actions",
            "effects",
        );
    }

    override async _preparePartContext(
        partId: string,
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        context = await super._preparePartContext(partId, context, options);

        switch (partId) {
            case "profile":
                return this._prepareProfileContext(context, options);
            case "skills":
                return await this._prepareSkillsContext(context, options);
            case "combat":
                return await this._prepareCombatContext(context, options);
            case "trauma":
                return await this._prepareTraumaContext(context, options);
            case "mysteries":
                return await this._prepareMysteriesContext(context, options);
            case "gear":
                return await this._prepareGearContext(context, options);
            case "actions":
                return await this._prepareActionsContext(context, options);
            case "effects":
                return await this._prepareEffectsContext(context, options);
            default:
                return context;
        }
    }

    async _prepareProfileContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }

    async _prepareSkillsContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }

    async _prepareCombatContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }

    async _prepareTraumaContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }

    async _prepareMysteriesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }

    async _prepareGearContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }

    async _prepareActionsContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }

    async _prepareEventsContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }

    async _prepareEffectsContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }

    protected _filters: foundry.applications.ux.SearchFilter[] = [
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-traits"]',
            contentSelector: ".traits",
            callback: this._displayFilteredResults.bind(this),
        }),
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-skills"]',
            contentSelector: ".skills",
            callback: this._displayFilteredResults.bind(this),
        }),
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-bodylocations"]',
            contentSelector: ".bodylocations-list",
            callback: this._displayFilteredResults.bind(this),
        }),
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-afflictions"]',
            contentSelector: ".afflictions-list",
            callback: this._displayFilteredResults.bind(this),
        }),
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-mysteries"]',
            contentSelector: ".mysteries-list",
            callback: this._displayFilteredResults.bind(this),
        }),
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-mysticalabilities"]',
            contentSelector: ".mysticalabilities-list",
            callback: this._displayFilteredResults.bind(this),
        }),
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-gear"]',
            contentSelector: ".gear-list",
            callback: this._displayFilteredResults.bind(this),
        }),
        new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="search-effects"]',
            contentSelector: ".effects-list",
            callback: this._displayFilteredResults.bind(this),
        }),
    ];

    async _onRender(context: PlainObject, options: PlainObject): Promise<void> {
        // @ts-expect-error TypeScript has lost track of the super class due to erasure
        super._onRender(context, options);

        // Rebind all search filters
        this._filters.forEach((filter) => filter.bind((this as any).element));
    }
}
