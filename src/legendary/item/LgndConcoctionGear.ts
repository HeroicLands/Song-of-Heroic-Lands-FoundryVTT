import {
    ConcoctionGearData,
    ConcoctionGearLogic,
    ConcoctionGearSheet,
} from "@common/item/ConcoctionGear";
import { SohlActionContext } from "@common/SohlActionContext";

export class LgndConcoctionGearLogic extends ConcoctionGearLogic<ConcoctionGearData> {
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

export class LgndConcoctionGearSheet extends ConcoctionGearSheet {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            container: { classes: ["tab-body"], id: "tabs" },
            template:
                "systems/sohl/templates/item/legendary/skill-properties.hbs",
            scrollable: [""],
        },
    };
}
