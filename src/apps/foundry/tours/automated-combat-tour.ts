/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { TourGate, TOUR_DRIVE_KIND } from "@src/entity/tour";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import { getActiveCombat } from "@src/core/FoundryHelpers";
import { SohlTour, type SohlTourConfig, type SohlTourStep } from "../SohlTour";

export const AUTOMATED_COMBAT_TOUR = Object.freeze({ namespace: "sohl", id: "automated-combat" });
const SCENE_NAME = "Automated Combat Tutorial Path";
const ATTACK_COMMAND = 'await game.combat?.combatant?.logic.executeAction("automatedCombatStart");';

/**
 * The imported tutorial scene; identities are supplied by Adventure import.
 * @param tour - The running tutorial.
 * @returns The imported scene, if available.
 */
function scene(tour: AutomatedCombatTour): any {
    const scenes = (game as any).scenes;
    return (
        scenes?.get?.(tour.tutorialSceneId) ??
        scenes?.find((entry: any) => entry.id === tour.tutorialSceneId)
    );
}

/**
 * Resolve a tutorial token by actor identity, rather than its display name.
 * @param tour - The running tutorial.
 * @param shortcode - The tutorial actor shortcode.
 * @returns Its token in the imported scene.
 */
function token(tour: AutomatedCombatTour, shortcode: string): any {
    return scene(tour)?.tokens?.find((entry: any) => entry.actor?.system?.shortcode === shortcode);
}

/**
 * Match the stock attack macro in exactly hotbar slot 1.
 * @returns Whether the correct macro is assigned.
 */
function macroReady(): boolean {
    const id = (game as any).user?.hotbar?.[1];
    const macro = id && (game as any).macros?.get(id);
    return (
        macro?.type === "script" &&
        String(macro.command).replace(/\s+/g, "") === ATTACK_COMMAND.replace(/\s+/g, "")
    );
}

/**
 * Read only messages created during this exchange.
 * @param tour - The running tutorial.
 * @returns New messages since the exchange began.
 */
function exchangeCards(tour: AutomatedCombatTour): any[] {
    return ((game as any).messages?.contents ?? []).filter((message: any) => {
        if (tour.exchangeMessages.has(message.id)) return false;
        const actorId = String(message.content ?? "").match(/data-actor-id=["']([^"']+)["']/)?.[1];
        if (!tour.exchangeActorId || actorId !== tour.exchangeActorId) return false;
        const html = new DOMParser().parseFromString(message.content ?? "", "text/html");
        const defense = html.querySelector('[data-action="automatedBlockResume"]');
        if (defense) return defense.getAttribute("data-handler-uuid") === tour.exchangeDefenderUuid;
        const card = html.querySelector("[data-attacker-token-uuid][data-defender-token-uuid]");
        return (
            card?.getAttribute("data-attacker-token-uuid") === tour.exchangeAttackerTokenUuid &&
            card?.getAttribute("data-defender-token-uuid") === tour.exchangeDefenderTokenUuid
        );
    });
}

/**
 * The exchange has posted its resolved result card.
 * @param tour - The running tutorial.
 * @param hit - Whether this exchange should produce an injury offer.
 * @returns Whether a matching result is posted.
 */
function resolved(tour: AutomatedCombatTour, hit: boolean): boolean {
    return exchangeCards(tour).some((message: any) => {
        const html = new DOMParser().parseFromString(message.content ?? "", "text/html");
        const card = html.querySelector(".chat-card .result-desc");
        const successes = html.querySelectorAll(".grid .success-text").length;
        const criticalFailures = html.querySelectorAll(".grid .critical-failure-block").length;
        return (
            !!card &&
            !!html.querySelector('[data-action="resolveInjury"]') === hit &&
            (hit ? successes === 1 && criticalFailures === 1 : successes === 2)
        );
    });
}

/**
 * Await a dialog appearing, without waiting for the player's answer.
 * @param task - The attack action waiting for player input.
 * @param signal - Cancels obsolete observers when the tour exits or moves.
 * @returns Resolves when the attack dialog is available.
 */
function waitForAttackDialog(task: Promise<unknown>, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver(check);
        let timer: ReturnType<typeof setTimeout> | undefined;
        const abort = () => finish();
        /**
         * Finish watching for the dialog.
         * @param error - Opening failure, if any.
         */
        function finish(error?: Error): void {
            observer.disconnect();
            if (timer !== undefined) clearTimeout(timer);
            signal.removeEventListener("abort", abort);
            if (error) reject(error);
            else resolve();
        }
        /** Resolve when the actual dialog appears. */
        function check(): void {
            if (document.querySelector('select[name="modeIdx"]')) finish();
        }
        signal.addEventListener("abort", abort, { once: true });
        if (signal.aborted) {
            finish();
            return;
        }
        observer.observe(document.body, { subtree: true, childList: true });
        timer = setTimeout(
            () => finish(new Error("The tutorial attack dialog did not open.")),
            10000,
        );
        void task.catch((error) =>
            finish(error instanceof Error ? error : new Error(String(error))),
        );
        check();
    });
}

/** Dynamic tutorial identities are resolved here; the base class owns RNG teardown. */
export class AutomatedCombatTour extends SohlTour {
    exchangeMessages = new Set<string>();
    injuryIds = new Set<string>();
    tutorialSceneId?: string;
    tutorialCombatId?: string;
    private tutorialAdventureUuid?: string;
    private importedDocuments: Record<string, any[]> = {};
    exchangeActorId?: string;
    exchangeDefenderUuid?: string;
    exchangeAttackerTokenUuid?: string;
    exchangeDefenderTokenUuid?: string;
    private preparationGeneration = 0;
    private attackDialogAbort?: AbortController;

    /** Invalidate preparations before restoring the base class's RNG lease. */
    override exit(): void {
        this.attackDialogAbort?.abort();
        this.preparationGeneration++;
        super.exit();
    }

    /** Prepare existing drive primitives and open the scripted attack dialog. */
    override async _preStep(): Promise<void> {
        const step = this.currentSohlStep;
        if (!step) return;
        this.attackDialogAbort?.abort();
        const generation = ++this.preparationGeneration;
        const isCurrent = () =>
            generation === this.preparationGeneration &&
            (foundry as any).nue.Tour.activeTour === this &&
            this.currentSohlStep === step;
        if (!isCurrent()) return;
        if (step.id === "import") {
            const pack = (game as any).packs?.get("sohl.tutorial-adventures");
            const index = await pack?.getIndex();
            if (!isCurrent()) return;
            const entry = index?.find(
                (document: any) => document.name === "Automated Combat Tutorial",
            );
            if (!entry) throw new Error("The Automated Combat Tutorial Adventure is unavailable.");
            const adventure = await pack.getDocument(entry._id);
            if (!isCurrent()) return;
            const prepared = await adventure.prepareImport({ importFields: ["all"] });
            if (!isCurrent()) return;
            this.tutorialAdventureUuid = pack.getUuid(entry._id);
            for (const [name, documents] of Object.entries(prepared.toUpdate ?? {}) as [
                string,
                any[],
            ][]) {
                for (const source of documents) {
                    const existing = (game as any).collections?.get(name)?.get(source._id);
                    const marker =
                        existing?.getFlag?.("sohl", "automatedCombatTutorial") ??
                        existing?.flags?.sohl?.automatedCombatTutorial;
                    if (marker !== this.tutorialAdventureUuid)
                        throw new Error(
                            "The tutorial will not overwrite existing world documents it does not own.",
                        );
                }
            }
            this.importedDocuments = {};
            for (const name of new Set([
                ...Object.keys(prepared.toCreate ?? {}),
                ...Object.keys(prepared.toUpdate ?? {}),
            ])) {
                this.importedDocuments[name] = [
                    ...(prepared.toCreate?.[name] ?? []),
                    ...(prepared.toUpdate?.[name] ?? []),
                ];
            }
            const tutorialScene = this.importedDocuments.Scene?.find(
                (document: any) => document.name === SCENE_NAME,
            );
            if (!tutorialScene) throw new Error("The tutorial Adventure has no path scene.");
            this.tutorialSceneId = tutorialScene._id;
            for (const combat of (game as any).combats ?? []) {
                if (combat.scene?.id !== this.tutorialSceneId) continue;
                const marker =
                    combat.getFlag?.("sohl", "automatedCombatTutorial") ??
                    combat.flags?.sohl?.automatedCombatTutorial;
                if (marker !== this.tutorialAdventureUuid)
                    throw new Error("A foreign encounter occupies the tutorial scene.");
                await combat.delete();
                if (!isCurrent()) return;
            }
            step.drive = [
                { kind: TOUR_DRIVE_KIND.IMPORT_ADVENTURE, uuid: pack.getUuid(entry._id) },
            ];
        }
        if (step.id === "macro") {
            if (!scene(this) || !token(this, "tutorialhuman") || !token(this, "tutorialgrukaruk"))
                throw new Error("The tutorial Adventure did not supply its scene and two actors.");
            step.drive = [{ kind: TOUR_DRIVE_KIND.ACTIVATE_SCENE, uuid: scene(this).uuid }];
            const macroPack = (game as any).packs?.get("sohl.macros");
            await macroPack?.render(true);
            if (!isCurrent()) return;
        }
        if (step.id === "start") {
            step.drive = [
                {
                    kind: TOUR_DRIVE_KIND.START_COMBAT,
                    sceneUuid: scene(this).uuid ?? `Scene.${this.tutorialSceneId}`,
                    tokenUuids: [
                        token(this, "tutorialhuman").uuid,
                        token(this, "tutorialgrukaruk").uuid,
                    ],
                    rollInitiative: true,
                    combatFlags: {
                        sohl: {
                            automatedCombatTutorial: this.tutorialAdventureUuid,
                            automatedCombatTutorialRun: crypto.randomUUID(),
                        },
                    },
                },
            ];
        }
        if (step.id === "human-target")
            step.drive = [
                {
                    kind: TOUR_DRIVE_KIND.SET_TARGET,
                    tokenUuid: token(this, "tutorialgrukaruk").uuid,
                },
            ];
        if (
            ["orc-turn", "human-attack", "orc-attack"].includes(step.id) &&
            getActiveCombat()?.id !== this.tutorialCombatId
        ) {
            throw new Error("Select the tutorial encounter before continuing the walkthrough.");
        }
        if (step.id === "orc-turn")
            step.drive = [
                {
                    kind: TOUR_DRIVE_KIND.ADVANCE_TURN,
                    combatUuid: `Combat.${this.tutorialCombatId}`,
                },
                { kind: TOUR_DRIVE_KIND.CLEAR_TARGET },
                { kind: TOUR_DRIVE_KIND.SET_TARGET, tokenUuid: token(this, "tutorialhuman").uuid },
            ];
        let importRejected: Error | undefined;
        let importHook: number | undefined;
        if (step.id === "import") {
            const uuid = this.tutorialAdventureUuid;
            const ids = new Map(
                Object.entries(this.importedDocuments).map(([name, documents]) => [
                    name,
                    new Set(documents.map((source) => source._id)),
                ]),
            );
            importHook = (Hooks as any).on(
                "preImportAdventure",
                (
                    adventure: any,
                    _options: any,
                    create: Record<string, any[]>,
                    update: Record<string, any[]>,
                ) => {
                    if (adventure.uuid !== uuid) return true;
                    for (const [groups, updating] of [
                        [create, false],
                        [update, true],
                    ] as const) {
                        for (const [name, documents] of Object.entries(groups)) {
                            for (const source of documents) {
                                const existing = (game as any).collections
                                    ?.get(name)
                                    ?.get(source._id);
                                const marker =
                                    existing?.getFlag?.("sohl", "automatedCombatTutorial") ??
                                    existing?.flags?.sohl?.automatedCombatTutorial;
                                if (
                                    !ids.get(name)?.has(source._id) ||
                                    (updating ? marker !== uuid : !!existing)
                                ) {
                                    importRejected = new Error(
                                        "The tutorial will not overwrite foreign world documents.",
                                    );
                                    return false;
                                }
                            }
                        }
                    }
                    for (const groups of [create, update])
                        for (const documents of Object.values(groups))
                            for (const source of documents) {
                                source.flags = {
                                    ...source.flags,
                                    sohl: { ...source.flags?.sohl, automatedCombatTutorial: uuid },
                                };
                            }
                    return true;
                },
            );
        }
        let capturedCombat: any;
        const combatHooks: [string, number][] = [];
        if (step.id === "start") {
            const sceneId = this.tutorialSceneId;
            const userId = (game as any).user?.id;
            const run = (step.drive?.[0] as any)?.combatFlags?.sohl?.automatedCombatTutorialRun;
            combatHooks.push([
                "createCombat",
                (Hooks as any).on(
                    "createCombat",
                    (document: any, _options: any, creator: string) => {
                        const marker =
                            document.getFlag?.("sohl", "automatedCombatTutorialRun") ??
                            document.flags?.sohl?.automatedCombatTutorialRun;
                        if (creator === userId && document.scene?.id === sceneId && marker === run)
                            capturedCombat = document;
                    },
                ),
            ]);
        }
        try {
            await super._preStep();
            if (importRejected && isCurrent()) throw importRejected;
        } finally {
            if (importHook !== undefined) (Hooks as any).off("preImportAdventure", importHook);
            for (const [name, id] of combatHooks) (Hooks as any).off(name, id);
        }
        if (!isCurrent()) return;
        if (step.id === "start") {
            const combat = capturedCombat;
            if (!combat) throw new Error("The tutorial encounter could not be captured.");
            this.tutorialCombatId = combat.id;
            for (const combatant of (combat as any)?.combatants ?? []) {
                const mode = combatant.actor?.logic
                    ?.getUsableStrikeModes()
                    ?.find(
                        (candidate: any) =>
                            candidate.shortcode === "crush" &&
                            String(candidate.parent?.data?.shortcode ?? "").replace(
                                /[0-9]+$/,
                                "",
                            ) === "clb",
                    );
                if (!mode) throw new Error("A tutorial combatant has no usable Club Crush mode.");
                await combatant.logic.recordAttackMode(mode);
                if (!isCurrent()) return;
                await combatant.logic.recordBlockMode(mode);
                if (!isCurrent()) return;
            }
            await (ui as any).combat?.render(true);
            if (!isCurrent()) return;
        }
        if (step.id === "human-attack" || step.id === "orc-attack") {
            this.exchangeMessages = new Set(
                ((game as any).messages?.contents ?? []).map((message: any) => message.id),
            );
            const attacker = token(
                this,
                step.id === "human-attack" ? "tutorialhuman" : "tutorialgrukaruk",
            );
            const defender = token(
                this,
                step.id === "human-attack" ? "tutorialgrukaruk" : "tutorialhuman",
            );
            this.exchangeActorId = attacker.actor.id;
            this.exchangeAttackerTokenUuid = attacker.uuid;
            this.exchangeDefenderTokenUuid = defender.uuid;
            const combat = (game as any).combats?.get(this.tutorialCombatId);
            this.exchangeDefenderUuid = combat?.combatants?.find(
                (combatant: any) => combatant.tokenId === defender.id,
            )?.uuid;
            // Re-seed each scripted exchange inside the base class's lease, so
            // setup and navigation cannot shift its demonstrated outcomes.
            (sohl as any).random.seed(step.id === "human-attack" ? 112 : 189);
            const attack = Promise.resolve(
                combat.combatant.logic.executeAction(
                    "automatedCombatStart",
                    new SohlActionContext({
                        speaker: combat.combatant.logic.speaker,
                        target: defender.logic,
                    }),
                ),
            );
            void attack.catch((error) => {
                if (!isCurrent()) return;
                (sohl as any).log.uiError(String(error));
                void this.exit();
            });
            this.attackDialogAbort = new AbortController();
            try {
                await waitForAttackDialog(attack, this.attackDialogAbort.signal);
            } catch (error) {
                if (!isCurrent()) return;
                this.exit();
                throw error;
            }
            if (!isCurrent()) return;
        }
        if (step.id === "injury") {
            this.injuryIds = new Set(
                [...token(this, "tutorialhuman").actor.items].map((item: any) => item.id),
            );
        }
    }
}

/**
 * Construct the GM-driven, two-exchange automated combat walkthrough.
 * @returns A ready-to-register tutorial.
 */
export function buildAutomatedCombatTour(): AutomatedCombatTour {
    const localization: Record<string, string> = {};
    const step = (
        id: string,
        title: string,
        content: string,
        extra: Partial<SohlTourStep> = {},
    ): SohlTourStep => {
        const prefix = `SOHL.Tour.AutomatedCombat.${id}`;
        localization[`${prefix}.title`] = title;
        localization[`${prefix}.content`] = content;
        return { id, title: `${prefix}.title`, content: `${prefix}.content`, ...extra };
    };
    const gated = (readState: (tour: SohlTour) => unknown): Partial<SohlTourStep> => ({
        gate: TourGate.state((ctx) => ctx.state === true),
        readState,
    });
    const config: SohlTourConfig = {
        ...AUTOMATED_COMBAT_TOUR,
        title: "SOHL.Tour.AutomatedCombat.title",
        description: "SOHL.Tour.AutomatedCombat.description",
        restricted: true,
        canBeResumed: false,
        canStart: () => !!(game as any).user?.isGM,
        seedRng: "sohl-automated-combat-tutorial",
        localization,
        steps: [
            step(
                "intro",
                "Playing both sides",
                "For this walkthrough you are the GM, playing both the human and the grukar-uk. In real play each side only acts for its own combatant; this tour runs on one screen, so you drive both. The tutorial imports a dedicated scene and uses reproducible rolls.",
            ),
            step(
                "import",
                "Import the tutorial",
                "The tutorial Adventure adds two combat-ready actors, their adjacent tokens on the path, and a framing journal. No combat has started yet.",
            ),
            step(
                "macro",
                "Set up your attack macro",
                "Drag Automated Attack from the Macro compendium into Macro Bar slot 1. Its command starts an automated attack for the active combatant. This is a convenient shortcut for each character.",
                { selector: '#hotbar [data-slot="1"]', ...gated(() => macroReady()) },
            ),
            step(
                "start",
                "Start combat",
                "Both tokens are now combatants and the encounter is started. Initiative fills automatically; the human goes first. In ordinary play select both tokens, add them to combat, and use Start Combat.",
                gated(
                    () =>
                        (game as any).combat?.combatant?.actor?.system?.shortcode ===
                        "tutorialhuman",
                ),
            ),
            step(
                "human-target",
                "Target the orc",
                "The orc is targeted. In ordinary play select the opposing token and press T. Automated Attack requires exactly one target; the system explains when you have none or more than one.",
            ),
            step(
                "human-attack",
                "Attack on your turn",
                "The attack dialog is open for the human. Accept the default attack and press OK. You must own the active combatant to attack: the GM can play both here, while players act for their own side.",
                {
                    selector: 'select[name="modeIdx"]',
                    nav: { sidebarTab: "chat" },
                    ...gated((tour) =>
                        exchangeCards(tour as AutomatedCombatTour).some((message) =>
                            String(message.content).includes('data-action="automatedBlockResume"'),
                        ),
                    ),
                },
            ),
            step(
                "human-block",
                "Choose Block",
                "The defender has four choices: Block, Dodge, Counterstrike, and Ignore. Click Block to roll the defense using the default blocking mode.",
                {
                    selector: '[data-action="automatedBlockResume"]',
                    ...gated((tour) => resolved(tour as AutomatedCombatTour, false)),
                },
            ),
            step(
                "blocked",
                "The block holds",
                "Both sides succeeded. Block holds and no impact is applied. The result card summarizes the exchange.",
            ),
            step(
                "orc-turn",
                "Advance and swap targets",
                "The tracker advances to the grukar-uk. The orc is untargeted and the human is targeted. The next attack now belongs to the orc.",
            ),
            step(
                "orc-attack",
                "The orc attacks",
                "Accept the default attack and press OK. The same Automated Attack macro follows whichever combatant's turn is active.",
                {
                    selector: 'select[name="modeIdx"]',
                    nav: { sidebarTab: "chat" },
                    ...gated((tour) =>
                        exchangeCards(tour as AutomatedCombatTour).some((message) =>
                            String(message.content).includes('data-action="automatedBlockResume"'),
                        ),
                    ),
                },
            ),
            step(
                "orc-block",
                "The human tries to block",
                "Click Block to use the default blocking mode. The orc rolls marginal success and the human rolls critical failure; this attack gets through.",
                {
                    selector: '[data-action="automatedBlockResume"]',
                    ...gated((tour) => resolved(tour as AutomatedCombatTour, true)),
                },
            ),
            step(
                "hit",
                "Impact is automatic",
                "The hit's impact is calculated automatically and appears on the result card. The defender's Calculate Injury button continues the workflow. In real play each side sees the controls addressed to its own combatant; the GM sees both.",
            ),
            step(
                "injury",
                "Calculate Injury",
                "Click Calculate Injury for the human. The dialog applies the hit location and armour before determining severity. Ensure create injury on character sheet is checked, then accept the defaults and press OK. This records an S2 injury regardless of the world's normal recording setting.",
                {
                    selector: '[data-action="resolveInjury"]',
                    ...gated((tour) => {
                        const tutorial = tour as AutomatedCombatTour;
                        return token(
                            tour as AutomatedCombatTour,
                            "tutorialhuman",
                        )?.actor?.items?.some(
                            (item: any) =>
                                !tutorial.injuryIds.has(item.id) &&
                                item.type === "trauma" &&
                                item.system?.subType === "injury" &&
                                item.system?.levelBase === 2,
                        );
                    }),
                },
            ),
            step(
                "created",
                "Inspect the wound",
                "The S2 injury now belongs to the human's actor. Open the human's sheet to inspect it; the tour does not depend on a world setting to record the wound.",
                gated((tour) =>
                    token(tour as AutomatedCombatTour, "tutorialhuman")?.actor?.items?.some(
                        (item: any) =>
                            item.type === "trauma" &&
                            item.system?.subType === "injury" &&
                            item.system?.levelBase === 2,
                    ),
                ),
            ),
            step(
                "done",
                "The whole loop",
                "Combat continues: target, attack, choose a defense, and calculate injury when a hit lands. You have seen a defended attack and an attack that wounds. Finish restores the random stream for ordinary play; leaving the tour restores it too.",
            ),
        ],
    };
    localization[config.title] = "Automated Combat";
    localization[config.description!] =
        "A GM-driven walkthrough of a defended attack and a hit that records an S2 injury.";
    return new AutomatedCombatTour(config);
}
