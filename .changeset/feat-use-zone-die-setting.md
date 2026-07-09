---
"sohl": minor
---

**"Use Zone Die" world setting (HMK compatibility)**

Add a world-level boolean setting **Use Zone Die**. It toggles how a melee strike
mode's spread is presented on the Combat tab — the same `spread.effective` value
shown either as a Spread radius (column **Spr**, value `{n}`) or a Zone Die
(column **ZD**, value `d{n}`). Spread is SoHL's radius-in-feet replacement for
HameMaster's Zone Die and is numerically identical (a Spread of 6 is a `d6` Zone
Die), so the switch is presentation-only and effects stay compatible. Off by
default.
