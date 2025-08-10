import { SohlLogic } from "@common/SohlLogic";
import type { SohlAction } from "@common/event/SohlAction";
import { SohlActiveEffect } from "@common/effect/SohlActiveEffect";

const kSohlActiveEffectData = Symbol("SohlActiveEffectData");
const kData = Symbol("SohlActiveEffectData.Data");

export class SohlActiveEffectData
    extends SohlLogic
    implements SohlActiveEffectData.Logic
{
    declare readonly parent: SohlActiveEffectData.Data;
    readonly [kSohlActiveEffectData] = true;

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace SohlActiveEffectData {
    /**
     * The FontAwesome icon class for the Affliction item.
     */
    export const IconCssClass = "fa-duotone fa-people-group";

    /**
     * The image path for the Affliction item.
     */
    export const Image = "systems/sohl/assets/icons/people-group.svg";

    export interface Data extends SohlActiveEffect.Data {
        readonly [kData]: true;
        readonly logic: Logic;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export interface Logic extends SohlActiveEffect.Logic {
        readonly parent: Data;
        readonly [kSohlActiveEffectData]: true;
    }

    export class DataModel
        extends SohlActiveEffect.DataModel
        implements SohlLogic.Data
    {
        static override readonly LOCALIZATION_PREFIXES = ["ACTIVEEFFECT"];
        declare _logic: Logic;
        readonly [kData] = true;

        get logic(): Logic {
            this._logic ??= new SohlActiveEffectData(this);
            return this._logic;
        }
    }
}
