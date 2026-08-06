---
"sohl": minor
---

**Opposed tests: ties, tie-breaks, and cards that actually post**

Opposed tests were unusable end to end, and the outcome they reported was wrong
when they did run. This repairs the whole contest, from the pre-roll dialog to the
result card.

- **A tie is reported as a tie.** The result card printed **Both Fail!** whenever
  neither side was flagged the winner — which includes a tie, so a contest both
  sides won (two Critical Successes, say) was announced as a mutual failure while
  the Results grid above said otherwise. The card now distinguishes three
  outcomes: a winner (with Victory Stars), **Tie — No Winner!** (no stars), and
  **Both Fail!** only when neither side succeeded.
- **Ties can be broken, at the initiator's request.** The pre-roll dialog of an
  opposed test now offers a **Break Ties** checkbox, off by default. Left off, a
  tie stands. Ticked, a tied _success_ is settled and the card names the deciding
  rule: the higher d100 takes it, failing that the higher Mastery Level, failing
  that a d10 roll-off — a one-star victory either way. A mutual failure is never
  broken; there is no victor to award. The answer is the initiator's alone and
  carries through to the result.
- **Victory Stars say whose they are.** The margin was always drawn as filled
  stars, whichever side won. It is now filled (★) for the side that started the
  contest and hollow (☆) for the side that answered — on the opposed card and on
  the attack-result card alike — so the line reports the winner as well as the
  margin.
- **Victory Stars have no ceiling.** The margin is now measured on raw success
  levels, so a modifier that shifts a level past the ordinary four widens the
  margin with it: a Marginal Success against a Critical Failure worsened by −1 is
  three stars, not the two the clamped scale allowed.
- **Fixed: no opposed test could start.** `opposedTestStart` handed `successTest`
  a `{ sourceTestResult }` wrapper as its `priorTestResult`, which was adopted as
  the test result and immediately dereferenced — every contest threw a TypeError
  before posting anything.
- **Fixed: opposed cards never posted.** The card data carried the contestants'
  SoHL rolls under `rolls`, which became part of the ChatMessage payload; a
  `SimpleRoll` is not a Foundry `Roll`, so the document failed validation and the
  create — fire-and-forget — silently produced no message. Neither the request
  card nor the result card ever reached the chat log.

**Terminology.** The opposed/combat victory margin is now **Victory Stars**
throughout (cards, rules, and user guide), leaving **Success Stars** to mean only
the quality stars of a Success Value test. The two were previously the same label
for different things.

Closes #1081
Closes #1160
Closes #1162
Closes #1163
