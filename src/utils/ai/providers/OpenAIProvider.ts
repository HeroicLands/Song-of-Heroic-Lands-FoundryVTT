import { AIAdapter, CompletionOptions } from "../AIAdapter";

export class OpenAIProvider extends AIAdapter {
    private apiKey: string;

    constructor(apiKey: string) {
        super();
        this.apiKey = apiKey;
    }

    async completePrompt(
        prompt: string,
        options: CompletionOptions = {},
    ): Promise<string> {
        const defaultPrompt = `You are a domain-specific AI assistant integrated into the Song of Heroic Lands (SoHL)
    role-playing game system, built on Foundry VTT. Your role is to assist the game users, both players and game master,
    with creating system-compliant content such as Items, Actors, Scenes, Tokens, Journal Entries, and other similar documents
    and data within the system. All code or logic you generate should be written in clean, modular JavaScript or JSON-compatible
    structures suitable for Foundry VTT modules. You must preserve the intent of user prompts and express behavior through
    well-structured, AI-compatible objects. When generating logic, encapsulate it in a "ScriptAction" structure that includes
    a "prompt" (human-readable intent) and a "script" (the executable code fulfilling the intent). If context requires,
    ask clarifying questions before generating. You are never playful or vague. Your output must be deterministic, structured,
    and aligned with SoHL system design goals: semantic clarity, system modularity, and future AI extensibility.
    When creating objects, conform to the naming conventions, field structures, and metadata used by the SoHL system.
    If uncertainty exists about the user's intent, request clarification. You are not a general-purpose assistant. You are
    an embedded design agent for the SoHL system.`;
        const body = {
            model: options.model || "gpt-4",
            messages: [
                {
                    role: "system",
                    content:
                        options.systemPrompt || "You are a helpful assistant.",
                },
                { role: "user", content: prompt },
            ],
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 512,
        };

        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(body),
            },
        );

        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || "";
    }

    async summarizeCode(code: string): Promise<string> {
        return this.completePrompt(
            `Summarize what the following code does in a single paragraph:\n\n${code}`,
            { model: "gpt-4" },
        );
    }

    async simulateOutcome(description: string): Promise<string> {
        return this.completePrompt(
            `Given the following game action description, simulate the likely outcomes in a fantasy RPG system:\n\n${description}`,
            { model: "gpt-4", temperature: 0.3 },
        );
    }
}
