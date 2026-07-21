---
"sohl": minor
---

**Action-card framework + self-sufficient treatment flow**

Add the connective tissue for the consent model: **action cards** — chat cards
whose buttons each invoke a _self-sufficient action_, the same action a human
could run from a sheet or context menu, just pre-filled. The card is never
special or privileged; it carries the action's parameters and a `skipDialog`
marker, so a click runs exactly what a player could have done by hand. Nothing is
consumed or locked — state lives in the posted cards, so a card can be ignored,
answered later, or overridden.

- **`buildActionCard(spec)`** — a pure assembler: it renders a caller-authored
  card **body** (its own template or inline content — buttons are not part of it)
  and appends the standard button block, returning the finished HTML.
  **`postActionCard(speaker, spec)`** posts it via `speaker.toChat`. A card's
  `buttons` may be one, many (e.g. an attack card's four defenses), or none (an
  informational result).
- **Open, capability-gated buttons** — a button whose handler is the `@self`
  sentinel resolves at click to the clicking user's own `game.user.character`;
  the action self-gates. `gateActionCardButtons` shows `@self` buttons to everyone
  and hides owner-targeted buttons from non-owners.
- **Single chokepoint** — `dispatchChatCardAction` reads `data-skip-dialog` and
  runs the action with `skipDialog`, so the card path and the by-hand path call
  the same self-sufficient executor.
- **Treatment flow** — three independently runnable actions: **Request Treatment**
  (a wound's context-menu action) posts an open Perform card; **Perform Treatment
  Test** (a Being action — run from the card, or by hand with a dialog that takes
  a pasted injury UUID or a GM-described severity/aspect) rolls the physician's own
  Physician skill and posts a result, with an owner-gated **Accept** button when it
  has a target wound; **Treat Injury** (a wound's context-menu action — run from
  the Accept button, or by hand via a Healing-Rate dialog) records the rate. The
  physician never touches the patient's wound; the patient's own click does.

Closes #576
