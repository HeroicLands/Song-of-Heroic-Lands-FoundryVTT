/// <reference types="@league-of-foundry-developers/foundry-vtt-types" />
import type { Game } from "@league-of-foundry-developers/foundry-vtt-types";

/**
 * Utility type to ensure access to safe Foundry globals
 */
declare global {
    interface SafeGame extends Game {
        i18n: NonNullable<Game["i18n"]>;
        settings: NonNullable<Game["settings"]>;
        user: NonNullable<Game["user"]>;
        socket: NonNullable<Game["socket"]>;
        // Extend as needed for your system
    }

    /**
     * Cast game to a SafeGame if you know Foundry has been fully initialized
     */
    const game: Game; // optionally cast to SafeGame in your runtime code
}

export {};
