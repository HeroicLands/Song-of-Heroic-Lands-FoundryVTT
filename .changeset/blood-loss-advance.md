---
"sohl": minor
---

**Blood Loss Advance Test effect (+ dispatch-bug fix)**

A bleeding injury's recurring blood-loss event now applies the **Blood Loss
Advance Test** at each elapsed checkpoint. With no physician accepting the Blood
Stoppage request, it auto-resolves as though the Blood Stoppage Test were a
critical failure — the bleeding continues (the interactive physician Accept card
is #547). Each test rolls against the victim's Strength Mastery Level and accrues
Blood Loss Points (CF +3, MF +2, MS +1, CS 0); each BLP advances the being's shock
state one step (toward Dead) and inflicts 5 Fatigue Levels of weakness fatigue
(anemia).

Also fixes a latent dispatch bug: the trauma scheduled blood-loss under the kind
`trauma::bloodLossAdvanceRoll` while the action executor is `bloodLossAdvanceCheck`,
so the event never dispatched — the kind now matches the shortcode. Part of #548.
Closes #487
