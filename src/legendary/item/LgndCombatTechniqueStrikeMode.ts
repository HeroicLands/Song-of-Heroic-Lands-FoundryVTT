import {
    CombatTechniqueStrikeModeData,
    CombatTechniqueStrikeModeLogic,
    CombatTechniqueStrikeModeSheet,
} from "@common/item/CombatTechniqueStrikeMode";
import { SohlActionContext } from "@common/SohlActionContext";

export class LgndCombatTechniqueStrikeModeLogic extends CombatTechniqueStrikeModeLogic<CombatTechniqueStrikeModeData> {
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

export class LgndCombatTechniqueStrikeModeSheet extends CombatTechniqueStrikeModeSheet {
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
