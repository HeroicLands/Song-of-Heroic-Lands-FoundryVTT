---
"sohl": patch
---

**Complete the Check/Test model: stamp the run record on the test, and fix the stale spec and docs**

The timed-effect reschedule end-to-end spec still asserted the pre-Check/Test
behavior — that running a `*Check` performs the effect and then offers the next
occurrence. Since the Check/Test split, a `*Check` _offers and does nothing else_
and the `*Test` is what acts and offers, so both of its tests failed against a
correct system.

The spec now exercises the real cycle: it asserts the check changes **nothing**
(no roll, no healing, no schedule), then drives the test both ways — headlessly
through `scope.schedule`, and by pressing the real **Schedule** button — proving
that the test's offer is what arms the next check. The rolls are forced so the
outcome cannot wander into the critical-failure infection path and post a
competing offer.

The **Event Queue** reference carried the same retired shape in its worked
example, which is what a developer would have copied: it now shows the check and
the test as the pair they are, including the due-time anchor the check hands the
test, and states that Check/Test is the shape every recurring effect uses. The
consent-dialog example in the **Testing** guide now drives the test rather than
the check, since the check no longer opens an offer dialog.

**The run record follows the act, not the offer**

`system.lastRun[shortcode]` records "the world time that action last _performed_",
but every recurring `*Check` carried `recordsLastRun` and no `*Test` did. Since a
check only posts a card offering the test, the record was stamped when the offer
went out — claiming the effect had happened even if nobody ever answered the card —
and the test that actually rolled and changed the wound went unrecorded.

The flag now sits on the acting half of all eight pairs: `healingtest`,
`bloodLossAdvanceTest`, `courseTest`, `psycheRecoveryTest`,
`auralShockRecoveryTest`, and `pallRecoveryTest` on Trauma, and `healingTest` /
`courseTest` on Affliction. So "when did this last happen here?" now answers with
the last performance.

_Existing worlds:_ nothing migrates and nothing breaks — the record is a sparse,
informational map that no system behavior reads. A world carries whatever
`lastRun.<check>` entries it already accumulated; new entries are written under the
test's shortcode (e.g. `lastRun.healingtest` rather than `lastRun.healingCheck`).
A macro or Active Effect that reads a check's key should read the test's instead.

Closes #1189
Closes #1192
