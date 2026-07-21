---
"sohl": minor
---

**Chat Sequence Foundry runtime + treatment flow**

Wire the Chat Sequence engine to Foundry so an interaction runs over the chat log,
proven end to end on the treatment flow — with a consent model that holds all
state in the posted cards.

- **Generic sequence card** (`templates/chat/sequence-card.hbs`) — one button per
  choice, carrying the sequence coordinates, the acting role's handler (a document
  uuid, or the `@self` sentinel for an open step), and the serialized ledger.
- **Runner** (`document/chat/sequence-runner`) — `startSequence` posts the initial
  card via the initiator's speaker; `runSequenceStep` runs the chosen choice's
  action on the acting logic (`skipDialog` + ledger-projected scope), folds the
  result in, and posts the next card via the actor who just acted — or, if the
  action returns `undefined` (self-gated/aborted), leaves the card live. Card
  _announcer_ (speaker) and _responder_ (button handler) are distinct.
- **Open, capability-gated steps** — a button whose handler is `@self` resolves at
  click to the clicking user's own `game.user.character` (a new
  `resolveAuthorizedChatCardHandler` mode + `fvttGetUserCharacter` shim); the
  action self-gates. `gateSequenceButtons` shows `@self` buttons to everyone and
  hides owner-targeted buttons from non-owners.
- **Single chokepoint** — `dispatchChatCardAction` routes sequence buttons to the
  runner.
- **Treatment flow** — `TraumaLogic.requestTreatment` (a context-menu action on the
  wound) starts the sequence and posts an _open_ Perform card that any player with
  the Physician skill may answer; `BeingLogic.performTreatmentTest` rolls the
  responder's own Physician skill and _proposes_ a Healing Rate;
  `TraumaLogic.treatInjury` records it when the patient clicks Accept. Nothing
  mutates until then, and — because state lives in the cards — the interaction can
  be ignored or overridden at any point.

Closes #576
