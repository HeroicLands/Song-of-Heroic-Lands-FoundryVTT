import { SohlBase, SohlDataModel, SohlLogic } from "@common";
import { SohlActor } from "@common/actor";
import { SohlAction } from "@common/event";
import { SohlItem } from "@common/item";
import { ClientDocumentExtendedMixin, SohlContextMenu } from "@utils";
import { RegisterClass } from "@utils/decorators";

const { SchemaField } = foundry.data.fields;
const kSohlActiveEffect = Symbol("SohlActiveEffect");
const kDataModel = Symbol("SohlActiveEffect.DataModel");

export class SohlActiveEffect extends ClientDocumentExtendedMixin(
    ActiveEffect,
    {} as InstanceType<typeof foundry.documents.BaseActiveEffect>,
) {
    declare name: string;
    readonly [kSohlActiveEffect] = true;
    declare static create: (
        data: PlainObject,
        options?: PlainObject,
    ) => Promise<SohlActiveEffect | undefined>;
    declare update: (
        data: PlainObject,
        options?: PlainObject,
    ) => Promise<this | undefined>;
    declare delete: (options?: PlainObject) => Promise<this | undefined>;

    static isA(obj: unknown): obj is SohlActor {
        return (
            typeof obj === "object" && obj !== null && kSohlActiveEffect in obj
        );
    }
    static _getContextOptions(doc: SohlActiveEffect): SohlContextMenu.Entry[] {
        return doc._getContextOptions();
    }

    _getContextOptions(): SohlContextMenu.Entry[] {
        return this.system.logic._getContextOptions();
    }
}

export namespace SohlActiveEffect {
    /**
     * The type moniker for the Affliction item.
     */
    export const Kind = "activeeffectdata";

    /**
     * The FontAwesome icon class for the Affliction item.
     */
    export const IconCssClass = "fa-duotone fa-people-group";

    /**
     * The image path for the Affliction item.
     */
    export const Image = "systems/sohl/assets/icons/people-group.svg";

    export interface Data extends SohlLogic.Data {}

    export interface Logic extends SohlLogic.Logic {}

    @RegisterClass(
        new SohlLogic.Element({
            kind: "SohlActiveEffectLogic",
        }),
    )
    export class Worker extends SohlLogic implements Logic {
        /** @inheritdoc */
        override initialize(context: SohlAction.Context): void {}

        /** @inheritdoc */
        override evaluate(context: SohlAction.Context): void {}

        /** @inheritdoc */
        override finalize(context: SohlAction.Context): void {}
    }

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            logicClass: Worker,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
        }),
    )
    export class DataModel
        extends SohlDataModel<SohlActor | SohlItem>
        implements SohlLogic.Data
    {
        static override readonly LOCALIZATION_PREFIXES = ["ACTIVEEFFECT"];
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
        }
    }
}
