---
"sohl": minor
---

Add siege engines and their ammunition
([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).

The system points at siege weapons as the answer to armour no hand weapon can
beat — a dragon's hide turns the best poleaxe in the pack on every roll — and
there were none. Ninety weapons across bows, crossbows, melee, shields, slings
and thrown, and not one engine.

Four engines, each a missile weapon whose projectile supplies the die, exactly
as a crossbow and its bolt do:

| Engine    | Crew | Impact  | Base Range | Max (BR×4) | Span |
| --------- | ---: | ------- | ---------: | ---------: | ---: |
| Springald |    2 | `+14` P |     120 ft |     480 ft |   60 |
| Ballista  |    4 | `+22` P |     200 ft |     800 ft |   90 |
| Onager    |    6 | `+30` B |     175 ft |     700 ft |  120 |
| Trebuchet |   12 | `+45` B |     250 ft |    1000 ft |  240 |

With two projectiles to feed them: the **Ballista Bolt** (`d6+6` piercing, AR 6,
bleeds) for the two bolt-throwers, and the **Siege Stone** (`d6+10` blunt) for
the two stone-throwers. Bolt-throwers are aimed and use Archery; stone-throwers
lob and use Sling, a trebuchet being a sling in every sense that matters.

**Direct or Volley falls out of the range rules rather than a per-weapon flag.**
An attack is the shortest multiple of Base Range that reaches the target, so a
shot inside BR flies flat and everything past it arcs: Volley 2, Volley 3 at
−20, Volley 4 at −40, each against a fifteen-foot area rather than opposed by
the target's Dodge. Each engine's Base Range is set at a quarter of its real
maximum, which leaves a ballista shooting flat inside 200 feet and arcing past
it, and a trebuchet — whose useful range begins well beyond its 250 — lobbing
every shot it ever takes. That is what makes an engine nearly useless against a
moving creature and merely difficult against a wall: a wall does not leave the
area between ranging shots.

Against an Old Dragon the impact ladder is the one the fiction wants — a
poleaxe does nothing, a ballista bolt scratches, a trebuchet stone wounds
seriously:

| Shot                       | Effective impact | Wound |
| -------------------------- | ---------------- | ----- |
| Poleaxe (best hand weapon) | 0                | none  |
| Springald bolt             | 0–3              | none  |
| Ballista bolt              | 6–11             | M1    |
| Onager stone               | 13–18            | M1    |
| Trebuchet stone            | 28–33            | S2    |

It also shows the ceiling in [#1242](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1242):
even a trebuchet cannot do better than a serious wound to a dragon, on any roll,
because a Grievous one needs an effective 82 and a kill 109. The engines are
statted for what they are rather than inflated to compensate.
