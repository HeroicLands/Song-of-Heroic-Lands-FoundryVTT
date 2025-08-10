import { SohlDataModel } from "@common/SohlDataModel";
import { SohlLogic } from "@common/SohlLogic";
import type { SohlActor } from "@common/actor/SohlActor";
import type { SohlItem } from "@common/item/SohlItem";
import { ClientDocumentExtendedMixin } from "@utils/helpers";
import type { SohlContextMenu } from "@utils/SohlContextMenu";

const { SchemaField } = foundry.data.fields;
const kSohlActiveEffect = Symbol("SohlActiveEffect");
const kData = Symbol("SohlActiveEffect.Data");

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
    export interface Data extends SohlLogic.Data {
        readonly [kData]: true;
        readonly logic: Logic;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export interface Logic extends SohlLogic.Logic {
        readonly parent: Data;
    }

    export abstract class DataModel
        extends SohlDataModel<SohlActor | SohlItem>
        implements SohlLogic.Data
    {
        static override readonly LOCALIZATION_PREFIXES = ["ACTIVEEFFECT"];
        readonly [kData] = true;
        get logic(): Logic {
            throw new Error("Logic must be implemented in subclass");
        }
    }
}
