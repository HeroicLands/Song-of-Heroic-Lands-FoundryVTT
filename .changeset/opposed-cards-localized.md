---
"sohl": patch
---

Localize the opposed-test chat cards (#1161).

Every player-visible string on the opposed request and result cards now comes
from a `SOHL.OpposedTestResult.toChat.*` key instead of English baked into the
templates: the winner line, _Both Fail!_, _Missile Attack Fails!_, the
_Results_ / _Source_ / _Target_ grid headers, the _EML_, _Roll_,
_Success Level Mod_ and _Movement_ labels, and the request card's `X vs. Y`
subtitle and "performs a … against …" line.

The card titles are localized too. The result card passed the literal
`"Opposed Action Result"` to `sohl.i18n.format` as if it were a key, and the
request card handed the template a **raw** key that it printed verbatim in the
header; both now resolve through the existing
`SOHL.OpposedTestResult.toChat.resultTitle` / `.title` keys. The source test's
title (shown on both cards) and the no-permission warning likewise moved onto
keys.

Only new keys were added — no existing key was renamed.
