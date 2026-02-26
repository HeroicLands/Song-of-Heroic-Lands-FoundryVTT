export * from "./sohl-globals";

// Declaration merging to add missing FoundryVTT V13 methods
// that exist at runtime but are not in foundry-vtt-types
declare global {
    interface Actor {
        /**
         * A method called after embedded documents (items, effects) are prepared.
         * This is part of the FoundryVTT V13 data preparation lifecycle.
         * @remarks
         * This method exists in FoundryVTT V13 but is missing from the type definitions.
         * It's called between prepareBaseData() and prepareDerivedData().
         */
        prepareEmbeddedData(): void;
    }
}
