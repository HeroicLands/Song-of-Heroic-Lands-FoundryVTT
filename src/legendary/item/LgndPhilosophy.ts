import {
    PhilosophyData,
    PhilosophyLogic,
    PhilosophySheet,
} from "@common/item/Philosophy";
import { SohlActionContext } from "@common/SohlActionContext";

export class LgndPhilosophyLogic extends PhilosophyLogic<PhilosophyData> {
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

export class LgndPhilosophySheet extends PhilosophySheet {
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
