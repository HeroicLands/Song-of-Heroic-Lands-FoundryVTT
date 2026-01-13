import type { SohlActionContext } from "@common/SohlActionContext";
import { VehicleData, VehicleLogic } from "@common/actor/Vehicle";
import { SohlActorSheetBase } from "@common/actor/SohlActor";

export class LgndVehicleLogic extends VehicleLogic<VehicleData> {
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

export class LgndVehicleSheet extends SohlActorSheetBase {
    static DEFAULT_OPTIONS: PlainObject = {
        id: "vehicle-sheet",
        tag: "form",
        position: { width: 900, height: 640 },
        classes: ["sohl", "sheet", "legendary", "actor", "vehicle"],
        window: {
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".tab-body",
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
            template:
                "systems/sohl/templates/legendary/actor/assembly/header.hbs",
        },
        tabs: {
            template:
                "systems/sohl/templates/legendary/actor/assembly/tabs.hbs",
        },
        facade: {
            template:
                "systems/sohl/templates/legendary/actor/shared/facade.hbs",
        },
        profile: {
            template:
                "systems/sohl/templates/legendary/actor/assembly/profile.hbs",
        },
        nested: {
            template:
                "systems/sohl/templates/legendary/actor/assembly/nested.hbs",
        },
    } as const;

    static TABS = {
        sheet: {
            navSelector: ".tabs[data-group='sheet']",
            contentSelector: ".content[data-group='sheet']",
            initial: "facade",
            tabs: [
                { id: "facade", label: "SOHL.Actor.SHEET.tab.facade.label" },
                {
                    id: "profile",
                    label: "SOHL.Actor.SHEET.profile",
                },
                { id: "nested", label: "SOHL.Actor.SHEET.tab.nested.label" },
            ],
        },
    };
}
