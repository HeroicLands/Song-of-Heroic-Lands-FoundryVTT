---
"sohl": minor
---

**Chat Sequence Foundry runtime + treatment flow**

Wire the Chat Sequence engine to Foundry so an interaction actually runs over the
chat log — proven end to end on the treatment flow.

- **Generic sequence card** (`templates/chat/sequence-card.hbs`) — one button per
  choice, each carrying the sequence coordinates, the acting role's handler uuid
  (the ownership gate), and the serialized instance ledger.
- **Runner** (`document/chat/sequence-runner`) — `startSequence` posts the initial
  card; `runSequenceStep` (dispatched when a button carries `data-sequence-id`)
  runs the chosen choice's action on the acting role's logic (`skipDialog`, scope
  projected from the ledger), folds the result in, and posts the next card — or
  finishes on a terminal choice. Foundry-free at the boundary (shims +
  `SohlSpeaker`).
- **Single chokepoint** — `dispatchChatCardAction` recognizes sequence buttons and
  routes them to the runner, so sequence steps flow through the same dispatch path
  as every other chat-card action.
- **Treatment executors** — `requestTreatment` (patient consents), `performTreatment`
  (the physician rolls their own Physician skill and *proposes* a Healing Rate),
  `acceptTreatment` (the patient records it). Nothing mutates until the patient's
  Accept — the consent model made structural.

Closes #576
