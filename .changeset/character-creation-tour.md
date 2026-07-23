---
"sohl": minor
---

**Character Creation guided tour** — the flagship onboarding tour, and the first
content story on the `SohlTour` framework (#614).

It _coaches and waits_ the user from an empty sidebar to a combat-ready character:
create a Being from the **Basic Folk** archetype, flesh out the Facade, Profile,
and Skills, arm and armour the character on the Gear and Combat tabs, add an
**Arcane Talent**, and pack a container — teaching most of the Being sheet along
the way. Per the framework, each step is either **free** (advise an example,
advance on Next) or **gated** (Next stays disabled until the user has done the
thing): the _Basic Folk_ archetype; the Broadsword / Roundshield / Leather Tunic /
Backpack / Tinderbox gear archetypes; holding the Broadsword in the right arm and
the Roundshield in the left; equipping the tunic; and dragging the Tinderbox into
the Backpack and back out. Gated archetype steps key off the instance's inherited
`system.shortcode` (per #643), so a gate confirms the _right archetype_ was chosen
without forcing a particular name.

The tour is **offered once per user** on a new world via a non-blocking whisper
chat card with a **Start** button (offer-don't-act consent model), and stays
launchable on demand from **Settings → Tour Management**.
