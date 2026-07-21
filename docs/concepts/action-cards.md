# Action Cards & the Consent Model

How one player offers an action to another over the chat log — without ever
acting for them. This is the mechanism that makes the
[Prime Directive](./architecture.md) — _assist, never play the game_ — structural
rather than a matter of discipline. **Every automated interaction in SoHL is built
on the pattern this page describes**, so read it before you add any cross-client
flow (combat, treatment, timed retests, opposed tests).

See also: [Macros and Actions](./macros-and-actions.md),
[Security Model & Guardrails](./security-model.md),
[Combat Model](./combat-model.md).

## The one rule everything else follows

> **Automation happens only at a human's behest, never independently.** The system
> may _remind_ a player that something has come due; it may not _perform_ the
> action until that player specifically authorizes it. One player can never impose
> an action on another player's character.

An **action** (a {@link sohl.entity.action.SohlAction}) is the single unit of
"do something" in SoHL — it is what a context-menu entry, an Actions-tab button, a
macro, and a chat-card button all ultimately invoke. An **action card** is how an
action gets _offered_ to whoever should decide: a chat card whose button, when the
right player clicks it, runs that action on _their_ character. Nothing runs until
the click; the click is the consent.

## Self-sufficient actions

The keystone contract — **every action must be able to run on its own, from any
trigger.** Because a card button and a context-menu entry invoke the _same_
executor, that executor cannot assume it was handed its parameters. It resolves
them itself:

1. **Enough parameters already?** (a card pre-filled `context.scope`) — run.
2. **Interactive and missing parameters?** — open a dialog, gather them, then run.
3. **`skipDialog` and still missing parameters?** — use sensible defaults, or, as
   a last resort, abort with a notice (return `undefined`; never guess at a
   character's action).

```ts
// The SAME action, two triggers — it decides how to get its parameters.
async treatInjury(context: SohlActionContext) {
    let hr = context.scope?.healingRate;              // 1. card pre-filled it
    if (hr == null && !context.skipDialog) {          // 2. run by hand → ask
        const form = await dialog({ /* Healing Rate */ });
        if (!form) return undefined;                  //    cancelled → abort
        hr = Number(form.healingRate);
    }
    if (hr == null) return undefined;                 // 3. skipDialog + nothing → abort
    await this.item.update({ "system.healingRateBase": hr, /* … */ });
}
```

This is why an action card is **never special or privileged**. It is not a new
code path — it is the ordinary action, with its parameters supplied and its dialog
skipped. Anything a card can do, a player can do by hand, and vice versa.

## Building a card: `buildActionCard` / `postActionCard`

The card **body** and its **buttons** are independent concerns. You author the
body — any template or inline content, the same way any other chat card is
written — and never write the buttons yourself.
{@link sohl.document.chat.buildActionCard} renders your body and **appends the
standard button block**, returning the finished HTML;
{@link sohl.document.chat.postActionCard} is the one-line convenience that posts it
through a {@link sohl.core.logic.SohlSpeaker} (whose `toChat` accepts raw HTML).

```ts
await postActionCard(this.speaker, {
    template: "systems/sohl/templates/chat/treatment-request-card.hbs",
    data: { patientName, woundName, aspect, severity },
    buttons: {
        action: "performTreatmentTest", // the executor to run on click
        handlerUuid: SELF_HANDLER, // who may click it (here: open)
        scope: { injuryUuid }, // the action's pre-filled parameters
        label: "Perform Treatment Test",
        iconFAClass: "fa-solid fa-staff-snake",
    },
});
```

`buttons` may be:

- **one** button object,
- **an array** — e.g. an automated attack card's four defenses (Block /
  Counterstrike / Dodge / Ignore), each a different `action`, all targeting the
  defender, or
- **omitted** — an _informational_ card (a result with no next action to offer;
  e.g. a GM-directed treatment test with no target wound).

Each button becomes a `<button class="action-card-button">` carrying
`data-action`, `data-handler-uuid`, a pre-serialized `data-scope`, and
`data-skip-dialog="true"`. Data reaches the DOM only through Handlebars escaping —
**never** build a button's HTML by interpolating data into template source (see
[Security Model](./security-model.md)).

## The dispatch chokepoint

Every card-button and edit-link click funnels through one function,
{@link sohl.document.chat.dispatchChatCardAction}. It reads `data-action`, builds a
{@link sohl.entity.action.SohlActionContext} (reviving `data-scope`, and setting
`skipDialog` when the button carries `data-skip-dialog`), and dispatches to the
handler logic — by action name, executor id, or title, then a method fallback.
Because the card sets `skipDialog`, the pre-filled parameters flow straight through
and the action does not re-prompt.

The click is **authorized before anything runs**: the current client may act only
if it owns the handler document (a GM owns all). This is
{@link sohl.document.chat.resolveAuthorizedChatCardHandler} — the real boundary
(issue #167). It runs before any dialog, scope revival, or logic; the render-time
hiding below is UX only and is bypassable.

## Open vs. targeted buttons — `@self`

A button's `handlerUuid` decides _who_ may answer it:

- **Targeted** — a document uuid. Only that document's owner may click it; it is
  **hidden from everyone else** at render time, so nobody clicks a button that does
  nothing for them.
- **Open** — the {@link sohl.document.chat.SELF_HANDLER} sentinel (`"@self"`).
  **Anyone** may answer; at click time it resolves to the clicking user's own
  `game.user.character`, and the action **self-gates** (e.g. aborts with a notice
  if that character lacks the Physician skill). Shown to everyone.

Use targeted when you know exactly whose decision it is (the defender responding to
an attack); use open when anyone qualified may step in (any physician answering a
call for treatment). The render-time rule is
{@link sohl.document.chat.gateActionCardButtons}; it is cosmetic — the click-time
authorization above is the actual gate.

## State lives in the chat log

There is **no server-side interaction store, no card is ever consumed or locked,
and completion is never enforced.** The posted cards _are_ the state. This is a
deliberate consequence of the consent model, and it buys three things:

- **Stop anytime.** Any card can simply be ignored. Up until the terminal action
  is clicked, nothing has mutated a character.
- **Branch and override.** A player can click Block, dislike the result, ignore it,
  and click Dodge instead — because every card is still live. A GM can step in and
  resolve anything by hand.
- **No stuck flows.** There is no state machine to get wedged; there is only a log
  of offers, any of which may still be answered.

An action that self-gates and aborts (returns `undefined`) simply leaves its card
live for someone else — nothing advances, nothing is spent.

## Worked example: the treatment flow

Three self-sufficient actions, connected by two cards. No orchestrator sits above
them — each action posts the next card itself, and each is independently runnable
from a sheet or context menu.

| Step       | Action (where)                                        | By hand                                                                                  | From the card                                                                        |
| ---------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1. Request | `TraumaLogic.requestTreatment` (wound context menu)   | patient invokes it                                                                       | — (it is the entry point)                                                            |
| 2. Perform | `BeingLogic.performTreatmentTest` (Being Actions tab) | physician runs it; dialog takes a pasted injury UUID _or_ a GM-described severity/aspect | open `@self` button → runs on the clicker's own character, `skipDialog` + wound uuid |
| 3. Treat   | `TraumaLogic.treatInjury` (wound context menu)        | anyone runs it; dialog takes the Healing Rate                                            | owner-gated Accept button → `skipDialog` + the physician's proposed rate             |

1. The patient runs **Request Treatment** on the wound; it posts an _open_ Perform
   card.
2. Any physician clicks **Perform Treatment Test**; it runs on _their_ character,
   rolls _their_ Physician skill, and posts a **Treatment Result** card. If it had
   a target wound, that card bears an owner-gated **Accept** button carrying the
   proposed Healing Rate; a GM-directed test with no target posts an informational
   result with no button.
3. The patient clicks **Accept**; `treatInjury` records the rate on _their_ wound.

The physician never touches the patient's wound — the patient's own click does.
And because it is all just self-sufficient actions and live cards, the GM can
short-circuit any of it: run `treatInjury` by hand with a number and skip the
cards entirely.

## Authoring a new flow

1. **Write each step as a self-sufficient action** on the document that owns the
   work — scope-or-dialog for its parameters, abort if it can't proceed. Register
   it in that logic's `defineIntrinsicActions` so a human can also run it directly.
2. **Post a card from the step that hands off**, with `postActionCard` — a body
   template plus a button whose `action` is the next step, `handlerUuid` is who
   should answer (a uuid, or `SELF_HANDLER` for open), and `scope` is that action's
   parameters.
3. **That's it.** The dispatch chokepoint, `skipDialog`, ownership authorization,
   and targeted-vs-open gating are already wired — you do not touch them.

## Reference

- {@link sohl.document.chat.buildActionCard} / {@link sohl.document.chat.postActionCard} — assemble and post a card.
- {@link sohl.document.chat.ActionCardSpec} / {@link sohl.document.chat.ActionCardButton} — the card and button shapes.
- {@link sohl.document.chat.dispatchChatCardAction} — the single dispatch chokepoint.
- {@link sohl.document.chat.resolveAuthorizedChatCardHandler} / {@link sohl.document.chat.SELF_HANDLER} — click-time authorization and the open-button sentinel.
- {@link sohl.document.chat.gateActionCardButtons} — render-time targeted-vs-open gating.
- {@link sohl.entity.action.SohlAction} / {@link sohl.entity.action.SohlActionContext} — the action and its context (`scope`, `skipDialog`).
