import type { SohlActionContext } from "@common/SohlActionContext";
import { BeingData, BeingLogic } from "@common/actor/Being";
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

export class LgndBeingSheet extends SohlActorSheetBase {
    static DEFAULT_OPTIONS: PlainObject = {
        id: "being-sheet",
        tag: "form",
        position: { width: 900, height: 640 },
        classes: ["sohl", "sheet", "legendary", "actor", "being"],
        window: {
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "facade",
                },
            ],
        },
        dragDrop: [
            {
                dragSelector: ".item-list .item",
                dropSelector: null,
            },
        ],
        // actions: {
        //     effectToggle: SMix._onEffectToggle,
        // },
    };

    static PARTS = {
        header: {
            template: "systems/sohl/templates/legendary/actor/being/header.hbs",
        },
        tabs: {
            template: "systems/sohl/templates/legendary/actor/being/tabs.hbs",
        },
        facade: {
            template:
                "systems/sohl/templates/legendary/actor/shared/facade.hbs",
        },
        profile: {
            template:
                "systems/sohl/templates/legendary/actor/being/profile.hbs",
        },
        skills: {
            template: "systems/sohl/templates/legendary/actor/being/skills.hbs",
        },
        combat: {
            template: "systems/sohl/templates/legendary/actor/being/combat.hbs",
        },
        trauma: {
            template: "systems/sohl/templates/legendary/actor/being/trauma.hbs",
        },
        mysteries: {
            template:
                "systems/sohl/templates/legendary/actor/being/mysteries.hbs",
        },
        gear: {
            template: "systems/sohl/templates/legendary/actor/shared/gear.hbs",
        },
        actions: {
            template:
                "systems/sohl/templates/legendary/actor/shared/actions.hbs",
        },
        effects: {
            template:
                "systems/sohl/templates/legendary/actor/shared/effects.hbs",
        },
    } as const;

    static TABS = {
        sheet: {
            navSelector: ".tabs[data-group='sheet']",
            contentSelector: ".content[data-group='sheet']",
            initial: "profile",
            tabs: [
                { id: "facade", label: "SOHL.Actor.SHEET.tab.facade.label" },
                {
                    id: "profile",
                    label: "SOHL.Actor.SHEET.profile",
                },
                { id: "skills", label: "SOHL.Actor.SHEET.tab.skills.label" },
                { id: "combat", label: "SOHL.Actor.SHEET.tab.combat.label" },
                { id: "trauma", label: "SOHL.Actor.SHEET.tab.trauma.label" },
                {
                    id: "mysteries",
                    label: "SOHL.Actor.SHEET.tab.mysteries.label",
                },
                { id: "gear", label: "SOHL.Actor.SHEET.tab.gear.label" },
                { id: "actions", label: "SOHL.Actor.SHEET.tab.actions.label" },
                { id: "effects", label: "SOHL.Actor.SHEET.tab.effects.label" },
            ],
        },
    };

    // override _configureRenderOptions(
    //     options: Partial<foundry.applications.api.HandlebarsApplicationMixin.RenderOptions>,
    // ): void {
    //     super._configureRenderOptions(options);

    //     // Don't show the other tabs if only limited view
    //     if ((this.document as any).limited) return;

    //     options.parts = [
    //         ...(options.parts ?? []),
    //         "profile",
    //         "skills",
    //         "combat",
    //         "trauma",
    //         "mysteries",
    //         "gear",
    //         "actions",
    //         "effects",
    //     ];
    // }
}
