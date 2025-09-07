import type { SohlSystem, SohlBase, SohlBaseConstructor } from "@common";
import type {
    SohlMap,
    SohlClassRegistry,
    SohlLogger,
    SohlLocalize,
    SohlMersenneTwister,
} from "@utils/helpers";

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
    type WithStatics<T extends abstract new (...args: any) => any, S> = T & S;

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
    type Constructor<
        TInstance extends object = object,
        P extends any[] = any[],
    > = new (...args: P) => TInstance;
    type AbstractConstructor<
        TInstance extends object = object,
        P extends any[] = any[],
    > = abstract new (...args: P) => TInstance;
    type AnyConstructor<
        TInstance extends object = object,
        P extends any[] = any[],
    > = Constructor<TInstance, P> | AbstractConstructor<TInstance, P>;
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

    type SohlDocument = SohlActor | SohlItem | SohlActiveEffect;

    type BaseLogicOptions<TDataModel> = {
        parent?: TDataModel;
    };

    // ✅ Global system accessor
    var sohl: SohlSystem;
}

export {};
