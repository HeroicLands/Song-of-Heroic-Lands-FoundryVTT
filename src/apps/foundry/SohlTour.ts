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
    TOUR_STEP_KIND,
    isNextEnabled,
    stepKind,
    type SohlTourStepConfig,
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
}

/** The Foundry NUE `Tour` base class (resolved at runtime from the global). */
const TourBase = (foundry as any).nue.Tour as {
    new (config: unknown, options?: unknown): any;
};

/** Document-mutation hooks a state gate watches to re-evaluate. */
const STATE_HOOKS = [
    "updateActor",
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

        // Give a post-navigation render a moment to attach the target element.
        if (step.selector) await this.#waitForElement(step.selector);

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
        this.#applyGate(step);
    }

    /** Tear down this step's watchers and Next-button interceptor. */
    async _postStep(): Promise<void> {
        this.#teardownWatchers();
        this.#detachNextButton();
        await super._postStep();
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

        // A gated step is satisfied by the user interacting with the sheet, so
        // let pointer events pass through the tour's fade and overlay — they
        // otherwise block input and would make the gate impossible to satisfy.
        // The fade's box-shadow still dims the rest of the screen visually.
        if (this.fadeElement) {
            (this.fadeElement as HTMLElement).style.pointerEvents = "none";
        }
        if (this.overlayElement) {
            (this.overlayElement as HTMLElement).style.pointerEvents = "none";
        }

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

    /* -------------------------------------------- */
    /*  DOM teardown                                */
    /* -------------------------------------------- */

    /**
     * Remove this step's tour chrome (tooltip / center element / fade / overlay)
     * without ending the step — the idempotent basis for re-anchoring.
     */
    #teardownStepDom(): void {
        const step = this.currentSohlStep;
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
