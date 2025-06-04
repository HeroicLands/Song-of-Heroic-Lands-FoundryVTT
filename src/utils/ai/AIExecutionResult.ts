export interface AIExecutionResult {
    /**
     * A human-readable message describing the result of the command.
     * Shown in chat, notifications, or logs.
     */
    message: string;

    /**
     * The actual created or modified object (e.g., Item, ScriptAction, Actor).
     * May be a Document, plain object, or domain-specific structure.
     */
    result?: unknown;

    /**
     * An optional semantic reference ID (e.g., "item:fireball_scroll") used
     * by the AI to refer to this object in later prompts or plans.
     */
    refId?: string;

    /**
     * Optional structured preview or summary (e.g., generated script logic or
     * AI explanation). May be displayed in an expandable log or chat bubble.
     */
    preview?: string;
}
