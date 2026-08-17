---
aliases:
  - Attack Resolution
  - Resolving an Attack
  - The Exchange
  - Combat Exchange
  - Tactical Advantage
  - Tactical Advantages
  - doc-atkreslv
id: OuEx3Wa9RNMHtrgc
type: doc
package: sohl
category: rules
name:
  full: Attack Resolution
  aliases: []
folder: rotB8uN12YUN0Oba
shortcode: atkreslv
---

# Resolving an Attack {#resolving-an-attack}

Every attack in the game — a sword cut, a loosed arrow, a bare fist — resolves the same way. The attacker strikes, the defender answers, and the two results are compared. Only after that comparison does anyone ask how hard the blow landed or where.

An attack is resolved in six steps:

1. The attacker chooses a [[doc-strkmds|strike mode]] and, if they wish, a body part to [[#aiming-and-hit-location|aim]] at.
2. The attacker makes the [[#the-attack-test|attack test]].
3. The defender chooses a [[#the-defence|defence]] and tests it.
4. The two results are compared — the [[#resolving-the-exchange|exchange]] — settling who, if anyone, lands a blow.
5. A landed blow rolls its [[#impact-and-aspect|impact]], and the [[#aiming-and-hit-location|hit location]] is determined.
6. The blow becomes an injury, and the injury has consequences — [[#from-blow-to-trauma|shock, and then nerve]].

Steps 2 and 3 together are an [[doc-oppsdtst#opposed-test|Opposed Test]]: attacker against defender, both rolling at once, read against each other. The whole of combat's resolution is that one contest, and everything else on this page either feeds it or follows from it.

## The Attack Test {#the-attack-test}

The attacker declares a target within the strike mode's [[doc-mlattcks#reach-and-engagement|reach]] or [[doc-msslattc#range|range]], names the strike mode they are using, and makes a [[doc-sccsstst#success-test|Success Test]] against the [[doc-mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skill that strike mode names — **Melee** for a close attack, **Archery**, **Throwing** or **Sling** for a missile.

Three kinds of adjustment reach that Mastery Level:

- **The strike mode's own attack modifier.** A weapon is better or worse in one mode than another; a pommel strike is not a cut.
- **Standing penalties from the attacker's condition** — fatigue, impairment of the body parts the skill depends on, encumbrance, being [[doc-prone|prone]].
- **Situational modifiers** the GM assigns for footing, light, surprise, and everything else the table can see and the rules cannot enumerate.

The [[doc-sccsstst#success-level|success level]] of that roll is the attacker's side of the contest. It is not yet a hit.

## The Defence {#the-defence}

A defender who is aware of the attack and able to respond chooses **one** of four defences, and tests it in the same instant:

| Defence           | What it is                                            | Tested with                                                  |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| **Block**         | Interposing a weapon, a shield, or a limb             | **Melee**, using the blocking strike mode's block capability |
| **Counterstrike** | Answering the attack with an attack of your own       | **Melee**, as an attack in its own right                     |
| **Dodge**         | Not being there — a step off the line, a drop, a lean | **Dodge**                                                    |
| **Ignore**        | Taking it: no defence at all                          | nothing is rolled                                            |

Which of them are available depends on the attack and on the defender. A strike mode may be barred from blocking, or from counterstriking; a defender with nothing in hand blocks with a limb and takes the consequences; a defender pinned, stunned or otherwise unable to act can only Ignore. Missile attacks admit a narrower set still — see [[doc-msslattc#defending-against-missiles|Missile Attacks]].

**Ignore is a defence, not the absence of one.** An ignored attack is resolved against nothing: it lands if it simply succeeds, and no contest is made.

## Resolving the Exchange {#resolving-the-exchange}

Attack and defence are compared by [[doc-sccsstst#success-level|success level]], and the gap between them is counted in [[doc-oppsdtst#victory-stars|Victory Stars]]. That gap is what the rest of the exchange reads.

Two conditions govern whether a blow lands, and both must hold:

- **The attack test must have succeeded.** A failed attack is a miss. However badly the defender blundered, a swing that never found its line does not arrive.
- **The attack must have beaten the defence** by the margin that defence demands, which differs from one defence to another:

| Defence           | The attacker lands a blow when…         | The defender lands a blow when…   |
| ----------------- | --------------------------------------- | --------------------------------- |
| **Block**         | the attack out-levels the block         | never                             |
| **Counterstrike** | the counterstrike does not out-level it | the counterstrike itself succeeds |
| **Dodge**         | the attack out-levels the dodge         | never                             |
| **Ignore**        | always — there is no contest to win     | never                             |

The asymmetries are deliberate, and each says something about what the defence is doing:

**A block need only tie.** Meeting the blow with steel is a contest of contact, and equal skill means the blow was met. A tied block does have a cost: the blocking weapon or shield takes the full force of the strike and must check for [[#mishaps|breakage]].

**A dodge must win outright.** Total evasion at arm's length is a much harder thing than deflection, and the tiebreak is where that difficulty is expressed — a tied dodge is settled by the ordinary [[doc-oppsdtst#tiebreaks|tiebreak rules]], and a dodger who loses the tiebreak is struck.

**A counterstrike is not a defence at all** — it is a second attack, made in the same instant, that happens to occupy the defender's response. Neither combatant is warding, so **both may land in the same exchange**: the counterstriker's blow arrives on its own success, quite independently of whose was the better roll. Trading blows with someone stronger is a fast way to die, and this is why.

When neither side lands, the exchange still happened: stars were counted, positions were taken, and [[#tactical-advantages|Tactical Advantages]] may have been earned by the winner.

## Tactical Advantages {#tactical-advantages}

A decisive exchange leaves the winner better placed, and that is measured in **Tactical Advantages** (TAs).

> **A combatant who wins an exchange by two or more Victory Stars earns one Tactical Advantage fewer than the stars they won by.**

So a two-star victory earns one TA, a three-star victory two, and so on, to whichever side won — attacker or defender. An exchange won by a single star earns none.

Tactical Advantages come in four kinds, and a rule that grants or spends them says which:

| Kind          | What it governs                                       |
| ------------- | ----------------------------------------------------- |
| **Impact**    | How hard the blow lands — added force behind a strike |
| **Precision** | Where it lands — tighter placement on the target      |
| **Action**    | What the winner may do next                           |
| **Setup**     | The position the exchange leaves both combatants in   |

The manoeuvres that call for a [[doc-unrmdcmb#the-strength-trial|Strength Trial]] are the clearest consumers: each takes a bonus to the Trial per **Impact** Tactical Advantage the winner earned, so a fighter who is comprehensively winning the exchange presses, trips or grabs almost at will.

## Mishaps {#mishaps}

A [[doc-sccsstst#success-level|Critical Failure]] on an attack or a defence is not merely a bad result — it is an accident, and which accident depends on the units digit of the roll that produced it:

| Roll          | On a melee attack or defence                  | On a missile attack                                             |
| ------------- | --------------------------------------------- | --------------------------------------------------------------- |
| Ends in **0** | **Fumble** — the weapon is dropped, or nearly | **Fumble**                                                      |
| Ends in **5** | **Stumble** — the footing goes, or nearly     | **Misfire** — the shot is spoiled and the weapon may be damaged |

A fumble or a stumble is a **keep-control test**, made by the combatant it befell: a Fumble Test to keep hold of the weapon, a Stumble Test to keep your feet. Both are described under [[doc-character#mishaps-fumble-and-stumble|Mishaps]] — they are the same tests a wound to the hand or the leg provokes, and they fail the same way, with a dropped weapon or a fall to [[doc-prone|prone]].

**Weapon breakage** is checked separately, and follows from a tied block rather than from a critical failure: the blocking weapon or shield absorbed a blow it did not out-fight, and may not survive doing so.

## Aiming and Hit Location {#aiming-and-hit-location}

An attacker may **aim** at a particular body part. Aiming does not make the blow land — the contest above decides that — it decides where a landing blow arrives.

The part aimed at supplies a **target zone number**, and the strike mode supplies its **spread**, rolled as the **zone die**. Together they place the blow:

> **Hit Zone Number = (Target Zone Number − 1) + zone die roll**

A tight spread lands where it was aimed. A loose one scatters, and always _downward_ — which is why reaching a head means aiming high, and why a loose strike aimed low can drift clean off the body and miss after all. An unaimed blow simply draws its zone at random, weighted by how much of the creature each zone represents.

Spread is a property of the strike mode, not of the fighter: a thrusting point places far better than a swung flail. The full treatment of zones, parts, locations, and how a hit zone number becomes a wounded limb is in [[doc-character#determining-hit-location|Determining Hit Location]].

## Impact and Aspect {#impact-and-aspect}

Impact is rolled only when a blow lands. Two things describe it:

**Impact** is the force of the blow, expressed as dice plus a modifier — the strike mode's own impact, adjusted by the wielder's [[doc-strkmds#the-strength-impact-modifier|Strength Impact Modifier]], by a missile's [[doc-msslattc#range|range band]], and by any **Impact** Tactical Advantages spent on it. A missile weapon that launches separate ammunition combines the strike mode's impact with the projectile's.

**Aspect** is the kind of harm it does — **blunt**, **edged**, **piercing** or **fire** — and it decides which protection answers it. Armour is tracked separately for each aspect: mail that turns a cut is far less use against a spike, and a padded jack that soaks a club does little against flame. A strike mode has exactly one aspect, which is why a weapon that can cut and thrust carries two strike modes rather than one.

The struck location's protection — its natural toughness plus whatever is worn there, for that aspect — is subtracted from the impact. What remains is the **effective impact**, and it is the only number the wound is read from.

## From Blow to Trauma {#from-blow-to-trauma}

Effective impact becomes an **Injury Level** against the victim's own thresholds, so the same blow reads differently on a cat, a person and a bull. A light edged or piercing blow against rigid armour glances off instead, inflicting no wound but still jarring the victim.

From there the blow leaves combat's hands and becomes [[doc-traumaintro|Trauma]]:

1. **The wound.** Its [[doc-injrylvl|Injury Level]] fixes its severity, and with it the [[doc-imprmnt|impairment]] of the part struck, whether it [[doc-bleeding|bleeds]], and how long it will take to mend.
2. **Shock.** Severity and location together give a [[doc-character#shock|Shock Index]], and a wound of any consequence puts the victim to a [[doc-shock|Shock]] test that may leave them stunned, incapacitated, unconscious or dead on the spot.
3. **Nerve.** A combatant still standing afterwards may still lose the will to go on — see [[#morale|Morale]] below.

A blow that lands is therefore not the end of anything. It is the beginning of three separate reckonings, and only the first of them is about the wound.

## Morale {#morale}

Most fighters stop fighting well before their bodies force them to. **Morale** is the measure of that, and it is tested at the moments a fight turns.

A **Morale Test** is a test of the **Initiative** skill, and its result places the combatant on a scale from Catatonic through Routed and Withdrawing to Steady and Brave. The full scale, its effects, the **Rally Test** by which a leader steadies faltering allies, and the **Reaction Test** by which a broken combatant recovers are all set out in [[doc-morale|Morale]].

In combat, a Morale Test is called for when a combatant:

- **takes a Serious or Grievous wound** — tested after the wound's Shock test has resolved and any resulting shock state has been shaken off, so a fighter is never asked for nerve while unconscious;
- **sees half or more of their side put out of action**, judged afresh against the survivors each time, so a group being ground down tests repeatedly;
- **watches a leader fall**;
- **is suddenly badly outnumbered**;
- **is disarmed** while their enemies remain armed; or
- meets any other situation the GM judges to demand it.

Only the **most severe** morale state in play affects a victim; several failures do not stack into something worse than the worst of them.

Morale is not cowardice, and a failed Morale Test is not a failure of the character. It is the ordinary way fights end: one side stops being willing to be in it, and the other is left holding the ground.

## See also {#see-also}

- [[doc-strkmds|Strike Modes]] — what an attack is made _with_
- [[doc-mlattcks|Melee Attacks]] — the close-quarters exchange
- [[doc-msslattc|Missile Attacks]] — the missile sequence
- [[doc-unrmdcmb|Unarmed Combat]] — fighting with no weapon at all
- [[doc-oppsdtst|Opposed Tests]] — the contest this page is a special case of
- [[doc-character#body-structure|Body Structure]] — hit location, protection, and impairment
