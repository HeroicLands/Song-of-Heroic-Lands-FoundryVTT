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

import {
    TOUR_DRIVE_KIND,
    TOUR_STEP_KIND,
    isNextEnabled,
    runDrive,
    seedRngForTour,
    stepKind,
    type RngLease,
    type SohlTourStepConfig,
    type StartCombatDrive,
    type TourDrive,
    type TourGateContext,
} from "@src/entity/tour";

/**
 * A SoHL tour step: the pure {@link SohlTourStepConfig} plus the one
 * Foundry-coupled hook the pure layer can't carry — a `readState` reader that
 * inspects the live document/DOM to build the {@link TourGateContext} for a
 * **state gate**. Keeping this reader out of the pure config is what lets the
 * gate *decision* stay Foundry-free and unit-tested.
 */
export interface SohlTourStep extends SohlTourStepConfig {
    /**
     * For a state gate: reads the current document/DOM state the gate's
     * predicate inspects. Receives the running tour so it can reach the open
     * sheet, the navigated document, etc. Its return value becomes
     * `ctx.state`.
     */
    readState?: (tour: SohlTour) => unknown;

    /**
     * Dynamic navigation target: resolves the document whose sheet to open,
     * overriding the step's `nav.uuid` when a fixed UUID isn't known ahead of
     * time (e.g. "the actor the user is currently building"). The tab still comes
     * from {@link SohlTourStepConfig.nav}.
     */
    resolveDocument?: (tour: SohlTour) => unknown | Promise<unknown>;
}

/**
 * Configuration for a {@link SohlTour}. Mirrors Foundry's `TourConfig` with
 * SoHL step extensions and an optional {@link canStart} predicate.
 */
export interface SohlTourConfig {
    /** The package namespace (`"sohl"`). */
    namespace: string;
    /** Machine id, unique within the namespace. */
    id: string;
    /** Localized human-readable title. */
    title: string;
    /** Localized description. */
    description?: string;
    /** The ordered steps. */
    steps: SohlTourStep[];
    /** Whether to list the tour in Tour Management. */
    display?: boolean;
    /** Whether the whole tour is GM-only. */
    restricted?: boolean;
    /** Whether the tour resumes mid-way or always restarts. */
    canBeResumed?: boolean;
    /** Extra localization entries merged into the i18n fallback. */
    localization?: Record<string, string>;
    /** Namespaced tours suggested when this one completes. */
    suggestedNextTours?: string[];
    /**
     * Optional eligibility predicate surfaced through {@link SohlTour.canStart}
     * — e.g. only startable when a suitable actor exists. Defaults to always.
     */
    canStart?: () => boolean;
    /**
     * When set, the tour runs in **seeded-RNG mode**: {@link sohl.random} is
     * seeded with this value at tour start so its scripted rolls are reproducible
     * across runs, and is **guaranteed-restored on every exit path** (completion,
     * abort, Escape, navigation, or a mid-step error). Only a driven/railroaded
     * tour (the Automated Combat tour) should use this — never a coach-and-wait
     * tour, and never a play path. See the seeded-RNG lifecycle in the
     * [authoring guide](https://kb.heroiclands.org/dev/how-to/guided-tours/).
     */
    seedRng?: string | number | number[];
}

/** The Foundry NUE `Tour` base class (resolved at runtime from the global). */
const TourBase = (foundry as any).nue.Tour as {
    new (config: unknown, options?: unknown): any;
};

/** Document-mutation hooks a state gate watches to re-evaluate. */
const STATE_HOOKS = [
    "createActor",
    "updateActor",
    "deleteActor",
    "updateItem",
    "createItem",
    "deleteItem",
    "updateActiveEffect",
    "createActiveEffect",
    "deleteActiveEffect",
] as const;

/**
 * SoHL's guided-tour base class — the enabler for the **SoHL Guided Tours**
 * epic. Extends Foundry's NUE `Tour` to add three things a stock declarative
 * tour cannot do:
 *
 * 1. **Scene-setting navigation** — a step may {@link SohlTourStep.nav | open an
 *    Actor/Item sheet and switch to a named tab}, awaiting the render, so a
 *    selector that lives on a not-yet-open tab resolves after navigation. Only
 *    navigation is ever automated; the user's meaningful choices are never made
 *    for them (PRIME DIRECTIVE — assist, don't play the game).
 * 2. **Gated steps** — a **value gate** keeps **Next** disabled until a target
 *    control holds a required value; a **state gate** keeps it disabled until a
 *    predicate over document/DOM state passes. The *decision* is the Foundry-free
 *    {@link sohl.entity.tour} model; this class only reads the live sheet to
 *    feed it and toggles the button.
 * 3. **Re-render survival** — when the watched sheet re-renders between or during
 *    a step, the highlight/tooltip is re-anchored to the fresh target element.
 *
 * A free step (no gate) behaves exactly like a stock Foundry step.
 *
 * For a **driven** (railroaded) tour — the Automated Combat tour — it adds two
 * more capabilities, used only where the tour is meant to *perform* the workflow
 * rather than coach it:
 *
 * 4. **Drive steps** — a step's {@link SohlTourStep.drive | drive} actions
 *    (import an adventure, activate a scene, start/advance a combat, set a target)
 *    are performed and awaited before the step is shown, so the next step's
 *    targets exist. The ordering/await logic is the Foundry-free
 *    {@link sohl.entity.tour.runDrive}; this class only supplies the executor.
 * 5. **Seeded RNG** — with {@link SohlTourConfig.seedRng} set, {@link sohl.random}
 *    is seeded at tour start for reproducible scripted rolls and
 *    **guaranteed-restored on every exit path** (completion, abort, Escape,
 *    navigation, mid-step error) via a fire-once {@link sohl.entity.tour.RngLease}
 *    — the tour's one hard teardown obligation.
 *
 * @see https://kb.heroiclands.org/dev/how-to/guided-tours/ for the authoring guide.
 */
export class SohlTour extends TourBase {
    /** The document whose sheet the current/most-recent step navigated to. */
    #sheetDoc: any;

    /** The open sheet's root element, used to scope selectors and watchers. */
    #sheetElement: HTMLElement | undefined;

    /** The element the watcher listeners are bound to (sheet root or document). */
    #watchTarget: HTMLElement | Document | undefined;

    /** The current step's **Next** button, while a gate is applied. */
    #nextButton: HTMLElement | undefined;

    /** Whether the current step's gate is satisfied (Next allowed to fire). */
    #nextEnabled = true;

    /** The DOM observer watching the sheet for state changes and re-renders. */
    #observer: MutationObserver | undefined;

    /** `input`/`change` listener bound while a value gate is active. */
    #onInputChange: (() => void) | undefined;

    /** Registered `[hookName, id]` pairs for state-gate document watchers. */
    #hookIds: Array<[string, number]> = [];

    /** Guards against re-entrant re-anchoring while a re-render is handled. */
    #reanchoring = false;

    /** Coalesces bursts of watcher events into a single gate re-evaluation. */
    #refreshPending = false;

    /**
     * The live seeded-RNG lease while a driven tour runs (undefined otherwise).
     * Its {@link RngLease.restore | restore} is fire-once, so every exit path can
     * call {@link #restoreRng} redundantly and safely.
     */
    #rngLease: RngLease | undefined;

    /** `pagehide` restore hook — the navigation-away safety net, if seeded. */
    #unloadHandler: (() => void) | undefined;

    /** The element currently spotlighted (fade ring) for a `spotlight` step. */
    #spotlightEl: HTMLElement | undefined;

    /**
     * The injected stylesheet that lifts open dialogs above the tour fade so a
     * dialog the user must type in is never shadowed. Present while the tour runs.
     */
    #dialogStyleEl: HTMLStyleElement | undefined;

    /* -------------------------------------------- */
    /*  Accessors                                   */
    /* -------------------------------------------- */

    /** The current step, typed with the SoHL extensions. */
    get currentSohlStep(): SohlTourStep | null {
        return this.currentStep as SohlTourStep | null;
    }

    /**
     * Whether the tour may be started. Delegates to the optional
     * {@link SohlTourConfig.canStart} predicate; defaults to always startable.
     */
    get canStart(): boolean {
        const fn = (this.config as SohlTourConfig).canStart;
        return fn ? Boolean(fn()) : true;
    }

    /**
     * The element the current step spotlights (the fade ring is drawn around it),
     * or `undefined` when the step has no {@link SohlTourStep.spotlight}. Exposed
     * for tests and callers that need to confirm what the step is pointing at.
     */
    get spotlightTarget(): HTMLElement | undefined {
        return this.#spotlightEl;
    }

    /* -------------------------------------------- */
    /*  Lifecycle overrides                         */
    /* -------------------------------------------- */

    /**
     * Perform scene-setting navigation and (re)arm the current step's gate
     * watchers before the step is shown.
     */
    async _preStep(): Promise<void> {
        await super._preStep();
        const step = this.currentSohlStep;
        if (!step) return;

        // Seed the RNG once, at the first shown step, if this is a driven tour.
        // Establishing the lease here (rather than in start()) covers every entry
        // — start(), resume, or a direct progress() — and only for in-progress
        // steps (progress() returns before _preStep on terminal transitions).
        this.#seedRngIfNeeded();

        // Perform this step's drive actions before navigation, so nav can target
        // a document a drive created (e.g. an actor from an imported adventure).
        // Each is awaited so the following step's selectors resolve.
        if (step.drive?.length) {
            await runDrive(step.drive, this.#executeDrive, this);
        }

        // Drop a stale sheet reference if that sheet has since closed.
        if (this.#sheetDoc && !this.#sheetDoc.sheet?.rendered) {
            this.#sheetDoc = undefined;
            this.#sheetElement = undefined;
        }

        // Navigate: open the target sheet and switch to the named tab, awaiting
        // each render so the step's selector resolves against live DOM.
        if (step.resolveDocument || step.nav?.uuid) {
            const doc: any =
                step.resolveDocument ?
                    await step.resolveDocument(this)
                :   await this.#resolveDocument(step.nav!.uuid!);
            if (doc?.sheet) {
                await doc.sheet.render({ force: true });
                await this.#nextFrame();
                if (step.nav?.tab) {
                    const group =
                        step.nav.group ?? this.#primaryGroup(doc.sheet);
                    doc.sheet.changeTab(step.nav.tab, group);
                    await this.#nextFrame();
                }
                this.#sheetDoc = doc;
                this.#sheetElement =
                    (doc.sheet.element as HTMLElement) ?? undefined;
            }
        } else if (this.#sheetDoc?.sheet?.rendered) {
            // Carry the previously-opened sheet forward for later steps on it.
            this.#sheetElement =
                (this.#sheetDoc.sheet.element as HTMLElement) ?? undefined;
        }

        // Open a sidebar directory (e.g. the Actors tab) so a control that lives
        // in it — like the Create Actor button, hidden until its directory is
        // shown — is rendered and visible before the step highlights it. The
        // sidebar must be BOTH switched to the tab AND expanded: a user click
        // auto-expands (`_onClickTab`), but the programmatic `changeTab` does not
        // (and no-ops if the tab is already active), so a collapsed sidebar would
        // otherwise stay collapsed and the control never becomes visible. Scene-
        // setting only; the user still clicks the control.
        if (step.nav?.sidebarTab) {
            const sidebar = (globalThis as any).ui?.sidebar;
            sidebar?.changeTab?.(
                step.nav.sidebarTab,
                step.nav.group ?? "primary",
            );
            if (sidebar && !sidebar.expanded) sidebar.expand?.();
            await this.#nextFrame();
        }

        // Give a post-navigation render a moment to attach the target element.
        if (step.selector) await this.#waitForElement(step.selector);
        // A spotlight target must be VISIBLE and SETTLED before we ring it — the
        // create button exists in the DOM even while hidden, and expanding the
        // sidebar animates it into place, so waiting for a stable rect avoids
        // ringing a zero-size or mid-animation position.
        else if (step.spotlight) await this.#waitForStableRect(step.spotlight);

        // Re-arm watchers for this step.
        this.#teardownWatchers();
        if (stepKind(step) !== TOUR_STEP_KIND.FREE) this.#setupWatchers();
    }

    /**
     * Render the step, then gate its **Next** button. Written to be idempotent
     * so it can double as the re-anchor path after a sheet re-render.
     */
    async _renderStep(): Promise<void> {
        const step = this.currentSohlStep;

        // Tear down any prior tour chrome first so a re-anchor re-render never
        // stacks a second fade/overlay/tooltip.
        this.#teardownStepDom();

        if (step?.selector) {
            this.targetElement = this._getTargetElement(step.selector);
            if (!this.targetElement) {
                // Target not present yet (mid-render). A later mutation re-anchors.
                console.warn(
                    `SohlTour [${this.id}] | target "${step.selector}" not found; will re-anchor on render`,
                );
                return;
            }
        }

        await super._renderStep();
        // Keep any open dialog above the fade so a dialog the user must type in is
        // never shadowed (armed for the whole tour; removed on exit).
        this.#ensureDialogUndimStyle();
        // For a spotlight step, move the fade ring off the centered card and onto
        // the target element, so the card stays stable/centered while the target
        // is clearly indicated.
        this.#applySpotlight(step);
        // Coach-and-wait: the tour must never block the app it is coaching. Let
        // pointer events pass through the fade/overlay on EVERY step — free or
        // gated — so the user can create the actor, switch tabs, type, or drag to
        // make progress. Applied here (not only for gated steps) so a free step
        // that asks the user to act (e.g. "create the actor") is interactive.
        // After #applySpotlight so the relocated fade also passes clicks through.
        this.#allowAppInteraction();
        this.#applyGate(step);
    }

    /**
     * Ring the step's {@link SohlTourStep.spotlight} target with the fade "hole"
     * while leaving the step **card centered and stable**. Foundry couples a
     * `selector` to tooltip-anchoring the card (which the sidebar's own
     * hover-tooltips hijack, and which is lost when the sidebar re-renders); a
     * spotlight step instead has no `selector`, so `super._renderStep()` renders
     * the card as a centered `.tour-center-step` and puts the fade on that card.
     * Here we discard that fade and re-create it around the actual target, and
     * nudge the card off dead-centre so a centered dialog it may open is not
     * hidden behind it. A no-op for non-spotlight steps.
     * @param step - The current step (or `null`).
     */
    #applySpotlight(step: SohlTourStep | null): void {
        this.#spotlightEl = undefined;
        if (!step?.spotlight || step.selector) return;
        const el = this._getTargetElement(step.spotlight) as HTMLElement | null;
        if (!el) {
            console.warn(
                `SohlTour [${this.id}] | spotlight "${step.spotlight}" not found`,
            );
            return;
        }
        this.#spotlightEl = el;
        // Replace the fade Foundry put on the centered card with one on the target.
        if (this.fadeElement) {
            this.fadeElement.remove();
            this.fadeElement = undefined;
        }
        this.fadeElement = (TourBase as any).highlightElement(el, {
            padding: (TourBase as any).HIGHLIGHT_PADDING,
            preventInteraction: false,
        });
        // Lift the centered card to the top so it never sits over a centered
        // dialog (e.g. the Create Actor dialog) the spotlighted control opens.
        if (this.targetElement instanceof HTMLElement) {
            this.targetElement.style.top = "6%";
            this.targetElement.style.bottom = "auto";
        }
    }

    /**
     * Let pointer events pass through the tour's fade and overlay so the user
     * can interact with the app the step is coaching. Foundry adds the
     * `.tour-overlay` expressly to *block input*; a coach-and-wait SoHL tour must
     * never block it — the user has to reach the sidebar, sheet, or dialog to
     * make progress (PRIME DIRECTIVE — assist, don't play the game). The fade's
     * box-shadow still dims the backdrop visually. Re-applied on every render
     * (including a re-anchor), since Foundry recreates both elements each time.
     */
    #allowAppInteraction(): void {
        if (this.fadeElement) {
            (this.fadeElement as HTMLElement).style.pointerEvents = "none";
        }
        if (this.overlayElement) {
            (this.overlayElement as HTMLElement).style.pointerEvents = "none";
        }
    }

    /** Tear down this step's watchers and Next-button interceptor. */
    async _postStep(): Promise<void> {
        this.#teardownWatchers();
        this.#detachNextButton();
        await super._postStep();
    }

    /**
     * Exit the tour at the current step — the chokepoint for **abort**, the
     * **Escape** keybinding, and a **mid-step render error** (Foundry's
     * `progress()` calls `exit()` before rethrowing). Restore the seeded RNG
     * first, then defer to the base teardown.
     */
    exit(): void {
        this.#restoreRng();
        this.#removeDialogUndimStyle();
        super.exit();
    }

    /**
     * Progress to a step. Delegates to the base stepper, then — on reaching a
     * **terminal** status (normal **completion** or a **reset** to unstarted) —
     * restores the seeded RNG. Combined with {@link exit} (abort/Escape/error)
     * and the `pagehide` safety net, this guarantees restore on every exit path.
     * @param stepIndex - The step index to progress to.
     */
    async progress(stepIndex: number): Promise<void> {
        // On a render error the base wraps _renderStep in try/catch and calls
        // this.exit() (which restores) before rethrowing — so a throw here has
        // already torn down the lease; let it propagate.
        await super.progress(stepIndex);
        const status = this.status;
        const TERMINAL = (TourBase as any).STATUS ?? {};
        if (status === TERMINAL.COMPLETED || status === TERMINAL.UNSTARTED) {
            this.#restoreRng();
            this.#removeDialogUndimStyle();
        }
    }

    /**
     * Resolve a selector, preferring the open sheet's element so highlights are
     * scoped correctly even when several sheets are open.
     * @param selector - The CSS selector to resolve.
     * @returns The matched element, or `null` if none.
     */
    _getTargetElement(selector: string): Element | null {
        if (this.#sheetElement) {
            const scoped = this.#sheetElement.querySelector(selector);
            if (scoped) return scoped;
        }
        return document.querySelector(selector);
    }

    /* -------------------------------------------- */
    /*  Gating                                      */
    /* -------------------------------------------- */

    /**
     * Locate the Next button, wire the interceptor, and set initial state.
     * @param step - The current step (or `null` if none).
     */
    #applyGate(step: SohlTourStep | null): void {
        this.#detachNextButton();
        if (!step || stepKind(step) === TOUR_STEP_KIND.FREE) {
            this.#nextEnabled = true;
            return;
        }

        // Pointer events already pass through the fade/overlay (see
        // #allowAppInteraction in _renderStep), so the user can interact with the
        // sheet to satisfy this gate.
        const root =
            step.selector ?
                ((game as any).tooltip?.tooltip as HTMLElement | undefined)
            :   (this.targetElement as HTMLElement | undefined);
        this.#nextButton =
            (root?.querySelector(
                '.step-button[data-action="next"]',
            ) as HTMLElement) ?? undefined;
        if (this.#nextButton) {
            this.#nextButton.addEventListener("click", this.#onNextCapture, {
                capture: true,
            });
        }
        this.#refreshGate();
    }

    /**
     * Capture-phase click guard: while the gate is unsatisfied, swallow the
     * click before Foundry's own `next()` handler on the same button can fire.
     * @param event - The click event on the Next button.
     */
    #onNextCapture = (event: Event): void => {
        if (!this.#nextEnabled) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    };

    /** Re-read the gate context and enable/disable Next accordingly. */
    #refreshGate(): void {
        const step = this.currentSohlStep;
        if (!step || stepKind(step) === TOUR_STEP_KIND.FREE) {
            this.#nextEnabled = true;
            return;
        }
        const ctx = this.#readGateContext(step);
        this.#nextEnabled = isNextEnabled(step, ctx);
        if (this.#nextButton) {
            const disabled = !this.#nextEnabled;
            this.#nextButton.classList.toggle("disabled", disabled);
            this.#nextButton.classList.toggle(
                "sohl-tour-gate-disabled",
                disabled,
            );
            this.#nextButton.setAttribute("aria-disabled", String(disabled));
        }
    }

    /**
     * Build the {@link TourGateContext} for a gated step from the live sheet.
     * @param step - The gated step.
     * @returns The value/state context for the gate predicate.
     */
    #readGateContext(step: SohlTourStep): TourGateContext {
        const kind = stepKind(step);
        if (kind === TOUR_STEP_KIND.VALUE_GATE) {
            const selector = step.control ?? step.selector;
            if (!selector) return {};
            const el =
                this.#sheetElement?.querySelector(selector) ??
                document.querySelector(selector);
            return { value: this.#readControlValue(el) };
        }
        if (kind === TOUR_STEP_KIND.STATE_GATE) {
            try {
                return { state: step.readState?.(this) };
            } catch (err) {
                console.warn(`SohlTour [${this.id}] | readState threw`, err);
                return { state: undefined };
            }
        }
        return {};
    }

    /**
     * Read the current value of a form control (input/select/checkbox/…).
     * @param el - The control element (or `null`).
     * @returns The control's value, checked state, or text content.
     */
    #readControlValue(el: Element | null): unknown {
        if (!el) return undefined;
        const input = el as HTMLInputElement;
        if (input.type === "checkbox" || input.type === "radio") {
            return input.checked;
        }
        if ("value" in input && input.value !== undefined) return input.value;
        return el.textContent?.trim();
    }

    /** Remove the Next-button interceptor. */
    #detachNextButton(): void {
        if (this.#nextButton) {
            this.#nextButton.removeEventListener("click", this.#onNextCapture, {
                capture: true,
            });
            this.#nextButton = undefined;
        }
    }

    /* -------------------------------------------- */
    /*  Driven tour: seeded RNG                     */
    /* -------------------------------------------- */

    /**
     * Seed {@link sohl.random} once, at tour start, if this is a seeded tour and
     * no lease is yet held. Also arms the `pagehide` safety net so navigating
     * away (a page unload that never reaches {@link exit}/{@link progress})
     * still restores. Idempotent: a re-entry with a live lease is a no-op.
     */
    #seedRngIfNeeded(): void {
        const seed = (this.config as SohlTourConfig).seedRng;
        if (seed == null || this.#rngLease) return;
        this.#rngLease = seedRngForTour((sohl as any).random, seed);
        this.#unloadHandler = () => this.#restoreRng();
        (globalThis as any).addEventListener?.("pagehide", this.#unloadHandler);
    }

    /**
     * Restore the seeded RNG to its pre-tour state and drop the safety net. Safe
     * to call from every exit path: the {@link RngLease} restore is fire-once, so
     * redundant calls no-op. A no-op entirely when the tour was never seeded.
     */
    #restoreRng(): void {
        this.#rngLease?.restore();
        this.#rngLease = undefined;
        if (this.#unloadHandler) {
            (globalThis as any).removeEventListener?.(
                "pagehide",
                this.#unloadHandler,
            );
            this.#unloadHandler = undefined;
        }
    }

    /* -------------------------------------------- */
    /*  Driven tour: drive primitives               */
    /* -------------------------------------------- */

    /**
     * The Foundry-coupled executor handed to {@link runDrive}: turn one
     * {@link TourDrive} descriptor into its side-effecting Foundry calls and
     * resolve when complete. Bound as a field so `this` is the tour when
     * {@link runDrive} calls it.
     * @param drive - The drive descriptor to execute.
     */
    #executeDrive = async (drive: TourDrive): Promise<void> => {
        switch (drive.kind) {
            case TOUR_DRIVE_KIND.IMPORT_ADVENTURE: {
                const adv: any = await this.#resolveDocument(drive.uuid);
                // dialog:false — a driven tour imports without prompting.
                await adv?.import?.({ dialog: false });
                break;
            }
            case TOUR_DRIVE_KIND.ACTIVATE_SCENE: {
                const scene: any = await this.#resolveDocument(drive.uuid);
                if (!scene) break;
                if ((game as any).user?.isGM && !scene.active) {
                    await scene.activate?.();
                }
                await scene.view?.();
                break;
            }
            case TOUR_DRIVE_KIND.START_COMBAT:
                await this.#startCombat(drive);
                break;
            case TOUR_DRIVE_KIND.ROLL_INITIATIVE:
                await this.#activeCombat()?.rollAll?.();
                break;
            case TOUR_DRIVE_KIND.ADVANCE_TURN:
                await this.#activeCombat()?.nextTurn?.();
                break;
            case TOUR_DRIVE_KIND.SET_TARGET: {
                const token = await this.#resolveTokenObject(drive.tokenUuid);
                token?.setTarget?.(true, { releaseOthers: true });
                break;
            }
            case TOUR_DRIVE_KIND.CLEAR_TARGET: {
                const targets = (game as any).user?.targets;
                for (const t of [...(targets ?? [])]) {
                    t?.setTarget?.(false, { releaseOthers: false });
                }
                break;
            }
        }
    };

    /**
     * Start a combat over the drive's tokens (or all tokens on the viewed scene),
     * begin it, and optionally roll initiative — each step awaited so a following
     * `roll-initiative`/`advance-turn` drive or gate sees the started combat.
     * @param drive - The start-combat descriptor.
     */
    async #startCombat(drive: StartCombatDrive): Promise<void> {
        const scene: any =
            (globalThis as any).canvas?.scene ?? (game as any).scenes?.active;
        if (!scene) return;

        let tokens: any[];
        if (drive.tokenUuids?.length) {
            tokens = [];
            for (const uuid of drive.tokenUuids) {
                const t = await this.#resolveDocument(uuid);
                if (t) tokens.push(t);
            }
        } else {
            tokens = [...(scene.tokens ?? [])];
        }

        const CombatCls = (globalThis as any).Combat;
        const combat: any = await CombatCls.create({
            scene: scene.id,
            active: true,
        });
        await combat.createEmbeddedDocuments(
            "Combatant",
            tokens.map((t) => ({
                tokenId: t.id,
                sceneId: scene.id,
                actorId: t.actorId ?? t.actor?.id,
                hidden: false,
            })),
        );
        await combat.startCombat();
        if (drive.rollInitiative) await combat.rollAll();
    }

    /**
     * The active combat, or `undefined`. Reads the combat document directly (not
     * the viewport-dependent `game.combat`) so it resolves in a headless run.
     * @returns The active {@link SohlCombat}-like document, or `undefined`.
     */
    #activeCombat(): any {
        return (game as any).combats?.active ?? (game as any).combats?.viewed;
    }

    /**
     * Resolve a token UUID to the placeable `Token` that carries `setTarget`,
     * falling back to the TokenDocument if the placeable isn't drawn.
     * @param uuid - The TokenDocument UUID.
     * @returns The placeable Token (or its document), or `undefined`.
     */
    async #resolveTokenObject(uuid: string): Promise<any> {
        const doc: any = await this.#resolveDocument(uuid);
        return doc?.object ?? doc;
    }

    /* -------------------------------------------- */
    /*  Watchers                                    */
    /* -------------------------------------------- */

    /** Arm value (input/change), state (document hooks), and DOM watchers. */
    #setupWatchers(): void {
        const target: HTMLElement | Document = this.#sheetElement ?? document;
        this.#watchTarget = target;
        this.#onInputChange = () => this.#scheduleRefresh();
        target.addEventListener("input", this.#onInputChange, true);
        target.addEventListener("change", this.#onInputChange, true);

        for (const hook of STATE_HOOKS) {
            const id = (Hooks as any).on(hook, () => this.#scheduleRefresh());
            this.#hookIds.push([hook, id]);
        }

        if (this.#sheetElement) {
            this.#observer = new MutationObserver(() =>
                this.#onSheetMutation(),
            );
            this.#observer.observe(this.#sheetElement, {
                childList: true,
                subtree: true,
                attributes: true,
            });
        }
    }

    /** Disconnect all watchers armed by {@link #setupWatchers}. */
    #teardownWatchers(): void {
        if (this.#watchTarget && this.#onInputChange) {
            this.#watchTarget.removeEventListener(
                "input",
                this.#onInputChange,
                true,
            );
            this.#watchTarget.removeEventListener(
                "change",
                this.#onInputChange,
                true,
            );
        }
        this.#onInputChange = undefined;
        this.#watchTarget = undefined;
        for (const [hook, id] of this.#hookIds) (Hooks as any).off(hook, id);
        this.#hookIds = [];
        this.#observer?.disconnect();
        this.#observer = undefined;
    }

    /** rAF-debounced gate re-evaluation. */
    #scheduleRefresh(): void {
        if (this.#refreshPending) return;
        this.#refreshPending = true;
        requestAnimationFrame(() => {
            this.#refreshPending = false;
            this.#refreshGate();
        });
    }

    /**
     * On any sheet mutation: re-evaluate the gate and, if the highlighted
     * target element was replaced by a re-render, re-anchor the tour to the
     * fresh element. Re-anchoring only touches body-level tour chrome, not the
     * observed sheet root, so it cannot feed back into this observer.
     */
    #onSheetMutation(): void {
        this.#scheduleRefresh();
        const step = this.currentSohlStep;
        if (!step?.selector || this.#reanchoring) return;
        const resolved = this._getTargetElement(step.selector);
        const stale =
            !this.targetElement || !document.contains(this.targetElement);
        if (resolved && (resolved !== this.targetElement || stale)) {
            this.#reanchoring = true;
            requestAnimationFrame(async () => {
                try {
                    await this._renderStep();
                } finally {
                    this.#reanchoring = false;
                }
            });
        }
    }

    /* -------------------------------------------- */
    /*  Navigation helpers                          */
    /* -------------------------------------------- */

    /**
     * Resolve a document by UUID (world or compendium).
     * @param uuid - The document UUID.
     * @returns The resolved document, or `undefined`.
     */
    async #resolveDocument(uuid: string): Promise<any> {
        const sync = (foundry.utils as any).fromUuidSync?.(uuid);
        if (sync) return sync;
        return (globalThis as any).fromUuid?.(uuid);
    }

    /**
     * The sheet's primary tab group id (first declared group), or `"primary"`.
     * @param sheet - The document sheet.
     * @returns The primary tab group id.
     */
    #primaryGroup(sheet: any): string {
        const tabs = sheet?.constructor?.TABS ?? {};
        return Object.keys(tabs)[0] ?? "primary";
    }

    /** Resolve after the next animation frame. */
    #nextFrame(): Promise<void> {
        return new Promise((resolve) => requestAnimationFrame(() => resolve()));
    }

    /**
     * Poll up to ~30 frames for the selector to resolve to a live element.
     * @param selector - The selector to wait for.
     * @param tries - Maximum number of animation frames to poll.
     */
    async #waitForElement(selector: string, tries = 30): Promise<void> {
        for (let i = 0; i < tries; i++) {
            if (this._getTargetElement(selector)) return;
            await this.#nextFrame();
        }
    }

    /**
     * Poll up to ~45 frames until the selector resolves to a **visible element
     * whose on-screen rect has settled** — non-zero size and unchanged for two
     * consecutive frames. Merely-visible is not enough: expanding the sidebar
     * animates the directory in from the right, so a control read mid-animation
     * has a transient position and the fade ring would land where it *was*, not
     * where it comes to rest. Waiting for a stable rect fixes that.
     * @param selector - The selector to wait for.
     * @param tries - Maximum number of animation frames to poll.
     */
    async #waitForStableRect(selector: string, tries = 45): Promise<void> {
        let prev: DOMRect | undefined;
        let stable = 0;
        for (let i = 0; i < tries; i++) {
            const el = this._getTargetElement(selector) as HTMLElement | null;
            if (el && el.offsetParent !== null) {
                const r = el.getBoundingClientRect();
                if (r.width > 0 && r.height > 0) {
                    if (
                        prev &&
                        Math.abs(r.left - prev.left) < 0.5 &&
                        Math.abs(r.top - prev.top) < 0.5 &&
                        Math.abs(r.width - prev.width) < 0.5
                    ) {
                        if (++stable >= 2) return;
                    } else {
                        stable = 0;
                    }
                    prev = r;
                }
            }
            await this.#nextFrame();
        }
    }

    /* -------------------------------------------- */
    /*  Dialog un-dimming                           */
    /* -------------------------------------------- */

    /**
     * Inject (idempotently) a stylesheet that lifts every open dialog above the
     * tour fade, so a dialog the user must read or type in is never shadowed. An
     * `!important` rule is used deliberately: Foundry re-stamps a dialog's inline
     * `z-index` via `bringToFront()` on focus, and only `!important` outranks that
     * inline value. `--z-index-tooltip - 1` sits above the fade/overlay but below
     * the tour's own step card (`--z-index-tooltip`), which the spotlight steps
     * lift to the top of the screen so the two never collide.
     */
    #ensureDialogUndimStyle(): void {
        if (this.#dialogStyleEl?.isConnected) return;
        const style = document.createElement("style");
        style.setAttribute("data-sohl-tour", this.id);
        style.textContent =
            "dialog.application { z-index: calc(var(--z-index-tooltip) - 1) !important; }";
        document.head.appendChild(style);
        this.#dialogStyleEl = style;
    }

    /** Remove the dialog-undim stylesheet (safe if never injected). */
    #removeDialogUndimStyle(): void {
        this.#dialogStyleEl?.remove();
        this.#dialogStyleEl = undefined;
    }

    /* -------------------------------------------- */
    /*  DOM teardown                                */
    /* -------------------------------------------- */

    /**
     * Remove this step's tour chrome (tooltip / center element / fade / overlay)
     * without ending the step — the idempotent basis for re-anchoring.
     */
    #teardownStepDom(): void {
        const step = this.currentSohlStep;
        this.#spotlightEl = undefined;
        if (step && !step.selector) this.targetElement?.remove();
        else (game as any).tooltip?.deactivate();
        if (this.fadeElement) {
            this.fadeElement.remove();
            this.fadeElement = undefined;
        }
        if (this.overlayElement) {
            this.overlayElement.remove?.();
            this.overlayElement = undefined;
        }
    }
}
