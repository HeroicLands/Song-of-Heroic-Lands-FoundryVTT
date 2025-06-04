import { DataModelClassRegistryElement, SohlBaseDataModel } from "@common";
import { RegisterClass } from "@utils/decorators";
import { SohlBaseData } from "@common";
import { SohlItem } from "@common/item";
import { SohlActor } from "@common/actor";
import { SohlActiveEffectPerformer } from "./SohlActiveEffectPerformer";

const { SchemaField } = foundry.data.fields;

export const ACTIVEEFFECT_TYPE = "effect";

export interface SohlActiveEffectData
    extends SohlBaseData<SohlActor | SohlItem, SohlActiveEffectPerformer> {}
@RegisterClass(
    new DataModelClassRegistryElement({
        kind: ACTIVEEFFECT_TYPE,
        logicClass: SohlActiveEffectPerformer,
        iconCssClass: "fa-duotone fa-people-group",
        img: "systems/sohl/assets/icons/people-group.svg",
        sheet: "systems/sohl/templates/effect/effect-sheet.hbs",
        schemaVersion: "0.6.0",
        sheetPath: "systems/sohl/templates/effect/effect-sheet.hbs",
    }),
)
export class SohlActiveEffectDataModel extends SohlBaseDataModel<
    SohlActor | SohlItem,
    SohlActiveEffectPerformer
> {
    static override readonly LOCALIZATION_PREFIXES = ["ACTIVEEFFECT"];
    declare parent: SohlActor | SohlItem | null;
}
