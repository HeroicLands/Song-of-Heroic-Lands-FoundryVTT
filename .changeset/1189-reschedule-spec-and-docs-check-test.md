---
"sohl": patch
---

**Bring the reschedule spec and the event-queue docs onto the Check/Test model**

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

No system behavior changes.

Closes #1189
