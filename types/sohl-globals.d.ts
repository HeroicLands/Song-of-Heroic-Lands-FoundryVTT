import type { SohlSystem, SohlBase, SohlBaseConstructor } from "@common";
import type {
    SohlMap,
    SohlClassRegistry,
    SohlLogger,
    SohlLocalize,
    MersenneTwister,
} from "@utils";

// ✅ Custom utility types
declare global {
    // Common types
    type PlainObject = Record<string, any>;
    type UnknownObject = Record<string, unknown>;
    type EmptyObject = Record<string, never>;
    type AnyObject = object;
    type StrictObject<T> = Record<string, T>;
    type AnyFunction = (...args: any[]) => any;
    type AsyncFunction<Args extends any[] = any[], Return = any> = (
        ...args: Args
    ) => Promise<Return>;
    type MaybePromise<T> = T | Promise<T>;

    /** May be missing or intentionally cleared */
    type Maybe<T> = T | null | undefined;

    /** Nullable but expected */
    type Nullable<T> = T | null;

    /** Optional field */
    type Optional<T> = T | undefined;
    type OptArray<T> = T[] | undefined;

    /** A constructed object (non-plain) */
    type ConstructedObject = object & {
        constructor: {
            name: Exclude<string, "Object">;
        };
    };

    type Func<Return = any, Args extends any[] = any[]> = (
        ...args: Args
    ) => Return;
    type Constructor<T = unknown> = new (...args: any[]) => T;
    type AbstractConstructor<T = unknown> = abstract new (...args: any[]) => T;
    type AnyConstructor<T = unknown> = Constructor<T> | AbstractConstructor<T>;
    type ConstructorOrFunction = Constructor | AnyFunction;
    type Mixin<M, T extends Constructor = AnyConstructor> = (
        Base: T,
    ) => new (...args: ConstructorParameters<T>) => InstanceType<T> & M;

    // ✅ JSON-safe types
    type JsonValue =
        | string
        | number
        | boolean
        | null
        | { [key: string]: JsonValue }
        | JsonValue[];

    // ✅ Base Logic Compatibility
    type LogicCompatibleDataModel = {
        parent: {
            update: (data: any) => unknown;
        };
    };

    type BaseLogicOptions<TDataModel> = {
        parent?: TDataModel;
    };

    // ✅ Global system accessor
    var sohl: SohlSystem;
}

export {};
