/// <reference types="@league-of-foundry-developers/foundry-vtt-types" />
// import type {
//     fromUuid,
//     fromUuidSync,
// } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/core/utils.d.mts"; // adjust if needed
import { BaseSystem } from "@logic/common/core/BaseSystem";
import {
    SohlBase,
    SohlBaseConstructor,
} from "@module/logic/common/core/SohlBase";
import { SohlMap } from "@module/utils/SohlMap";

declare const game: Game; // Foundry VTT Game object

// ✅ Custom utility types
declare global {
    export type PlainObject = Record<string, any>;
    export type UnknownObject = Record<string, unknown>;
    export type EmptyObject = Record<string, never>;
    export type StrictObject<T> = Record<string, T>;
    export type Constructor<T = {}> = new (...args: any[]) => T;
    export type AnyFunction = (...args: any[]) => any;
    export type MaybePromise<T> = T | Promise<T>;

    /** May be missing or intentionally cleared */
    export type Maybe<T> = T | null | undefined;

    /** Nullable but expected */
    export type Nullable<T> = T | null;

    /** Optional field */
    export type Optional<T> = T | undefined;

    export type OptArray<T> = T[] | undefined;

    /** A constructed object (non-plain) */
    export type ConstructedObject = object & {
        constructor: {
            name: Exclude<string, "Object">;
        };
    };

    export type ModifierAtom = {
        name: string;
        abbrev: string;
    };

    // ✅ JSON-safe types
    type JSONValue =
        | string
        | number
        | boolean
        | null
        | JSONArray
        | JSONValueMap;

    interface JSONArray extends Array<JSONValue> {}
    interface JSONObject {
        [key: string]: JSONValue;
    }

    // ✅ Base Logic Compatibility
    type LogicCompatibleDataModel = {
        parent: {
            update: (data: any) => unknown;
        };
    };

    type BaseLogicOptions<TDataModel> = {
        parent?: TDataModel;
    };

    // GlobalThis modifications
    // interface GlobalThis {
    //     origFromUuid: typeof fromUuid;
    //     origFromUuidSync: typeof fromUuidSync;
    // }

    var SohlVariant = StrictObject<BaseSystem>;

    // Foundry VTT modifications
    interface Game {
        settings: GameSettings & {
            get(module: "sohl", key: string): unknown;
        };
    }

    // ✅ Global system accessor
    var sohl: {
        foundry: typeof foundry;
        game: SohlSystem; // Add utility classes if needed
        utils: import("@module/utils/helpers");
        i18n: import("@module/utils/SohlLocalize").SohlLocalize;
        ready: boolean; // Indicates if the system is fully initialized
        variants: StrictObject<BaseSystem>;
        simpleCalendar: any;
        log: SohlLogger;
        classRegistry: SohlBaseRegistry;
    };

    var origFromUuid: (
        uuid: string,
        options?: {
            relative?: ClientDocument;
            invalid?: boolean;
        },
    ) => Promise<foundry.abstract.Document.Any | null>;

    var origFromUuidSync: (
        uuid: string,
        options?: {
            relative?: ClientDocument;
            invalid?: boolean;
            strict?: boolean;
        },
    ) => foundry.abstract.Document.Any | Record<string, unknown> | null;
}

export {};
