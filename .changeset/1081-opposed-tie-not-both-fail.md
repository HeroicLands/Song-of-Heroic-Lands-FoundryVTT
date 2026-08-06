---
"sohl": patch
---

**Opposed result card reports a tie as a tie, not "Both Fail!"**

The Opposed Action Result card printed **Both Fail!** whenever neither side was
flagged as the winner — which includes a **tie**, so a contest both sides won
(two Critical Successes, say) was reported to the table as a mutual failure,
contradicting the Results grid directly above it.

`OpposedTestResult` already distinguished the two states, but only `sourceWins` /
`targetWins` reached the template, so the card could not tell them apart. Its
`isTied` and `bothFail` flags are now passed through, and the card renders three
distinct outcomes: a winner (with Success Stars), **Tie — No Winner!** (no stars),
and **Both Fail!** only when neither side succeeded. Missile (direct / volley)
outcomes are unchanged.

Adds the `SOHL.OpposedTestResult.toChat.tie` localization key; the user guide's
Opposed Action Result section no longer tells readers to work around the
mislabeling.

Closes #1081
