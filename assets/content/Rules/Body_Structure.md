---
aliases:
    - Body Structure
    - Body Parts
    - Body Locations
    - Hit Location
    - Anatomy
    - Strike Accuracy
id: IvAKtSOREdEBkSGj
type: doc
package: sohl
category: user-guide
name:
    full: Body Structure
    aliases: []
slug: sohl-body-structure
folder: RqKUTBUBN2Y3MHYB
---

Every creature in the game is defined by a body structure — a hierarchical anatomy that determines where blows land, how armor protects, and how injuries impair function. The structure has two tiers: body parts and body locations.

## Body Parts

A body part is the primary anatomical division. A standard humanoid has six parts: Head, Right Arm, Left Arm, Torso, Right Leg, and Left Leg. Other creature types have different layouts — a quadruped might have Head, Right Foreleg, Left Foreleg, Torso, Right Hindleg, and Left Hindleg; a dragon might add Neck, Wings, and Tail; a serpent might have just Head, Fore Body, Mid Body, and Hind Body.

Each body part has several properties:

**Area.** The body part's targetable surface area, measured in square feet. For a humanoid, the Head is about 1 sq ft, each arm about 2 sq ft, the Torso about 3 sq ft, and each leg about 2 sq ft, for a total body area of roughly 12 sq ft. Larger creatures have proportionally greater area. A bear might total 18 sq ft; a dragon might total 60 or more.

**Adjacency.** Each body part is connected to one or more other parts, forming a graph that represents which parts of the body are near each other. In the humanoid layout, the Torso is the central hub: the Head, both Arms, and both Legs all connect to it. A blow aimed at one part that scatters (see Determining Hit Location) can only reach parts that are adjacent on this graph. The adjacency graph varies by creature type — a serpent's parts form a linear chain, while a dragon's branch out from the torso to neck, limbs, wings, and tail.

**Affected Skills and Attributes.** Each body part identifies which skills and attributes are impaired when it sustains injury. Arm parts affect Melee, Archery, Climbing, Legerdemain, and similar skills, as well as Dexterity and Strength. Leg parts affect Acrobatics, Climbing, Riding, and Agility. The Head and Torso affect broad ranges of physical skills and attributes. These lists may differ for non-humanoid creatures.

**Affects Mobility.** Some body parts, when injured, reduce a character's movement speed. The Head, Torso, and both Leg parts affect mobility; the Arm parts generally do not.

**Can Hold Items.** Whether this part can grip or carry objects. Both arm parts can hold items; the head, torso, and legs cannot. When an injury disables a part that holds an item, the character drops whatever it held.

## Body Locations

Each body part contains several body locations — specific anatomical areas where a blow might land. The Right Arm part, for example, contains five locations: Right Shoulder, Right Upper Arm, Right Elbow, Right Forearm, and Right Hand. The Head part contains locations for the Skull, each Eye, Nose, Cheeks, Ears, Mouth, Jaw, and Neck.

Injuries are always recorded against a specific body location. Armor protection is likewise tracked per location — a mail hauberk covers the thorax and abdomen but not the pelvis, while a helm protects the skull but not the neck. Each body location has several properties that govern how damage is resolved there:

**Probability Weight.** A relative value determining how likely this location is to be struck within its parent body part. Larger or more exposed areas (the skull, the thorax, the thigh) have higher weights than smaller ones (an eye, the elbow, the hand).

**Shock Value.** The inherent shock inflicted when this location is struck, independent of injury severity. The skull and neck carry high shock values (5); the forearm and calf carry low ones (1). Shock contributes to whether the target must make a Shock test to remain conscious and functional.

**Bleeding Severity Threshold.** The minimum injury level at which a wound to this location begins to bleed. Locations with major blood vessels (the neck, threshold 3; the abdomen, threshold 3) bleed from less severe wounds than locations with minimal vasculature (the hand or foot, threshold 0, meaning they rarely bleed dangerously).

**Amputate Modifier.** A penalty applied to any attempt to surgically amputate at this location. Joints and extremities (hand at −30, elbow at −20) are easier to amputate than mid-limb locations (upper arm at −20), while some locations (the skull, the torso) cannot be amputated at all (modifier 0, with amputation disallowed by rule).

**Fumble and Stumble.** Certain locations, when struck, can cause the target to lose control of held items or lose footing. All arm locations are marked as fumble locations — a blow to the shoulder, elbow, or hand may cause the character to drop a weapon or tool. All leg locations are marked as stumble locations — a blow to the thigh, knee, or foot may cause the character to fall or stagger.

## Strike Accuracy

Every weapon has a strike accuracy value that represents the area of the body (in square feet) that the weapon can threaten in a single strike. A precise, close-range weapon like a dagger has a low strike accuracy (4), meaning its blow is confined to a small region. A broad-swinging weapon like a broadsword has a higher strike accuracy (6), and a long polearm or flail higher still. The value corresponds directly to the zone die size used in compatible systems (a d4 zone die = strike accuracy 4, a d6 = 6, and so on).

Strike accuracy governs how far a blow can scatter from the aimed body part when the hit is imprecise (see Determining Hit Location below). A weapon with strike accuracy 4 can scatter across at most 4 square feet of body area; a weapon with accuracy 6 can scatter across 6. Against a small creature whose total body area is less than the weapon's strike accuracy, the weapon can reach every part of the creature in a single swing.

## Determining Hit Location

When an attack succeeds, the attacker's d100 roll — the same roll that determined success — also determines where the blow lands. The attacker always declares a target body location before the attack. The precision of the hit depends on the margin of success:

**Critical Success.** The blow strikes the exact body location the attacker aimed for. Skill and precision are at their peak; the weapon's strike accuracy is irrelevant.

**Solid Hit** (success roll ≤ ML − 20). The attacker hit well within their ability — nowhere near missing. The blow lands on the correct body part (the one containing the targeted location), but not necessarily the exact location aimed for. The specific location is determined randomly, weighted by each location's probability weight within that body part. Weapon strike accuracy does not apply; the attacker's skill has compensated for the weapon's natural imprecision.

**Barely Hit** (success roll > ML − 20 but still a success). The attacker connected, but only just. The blow scatters away from the targeted location. Starting from the body part containing the target, the system distributes the weapon's strike accuracy across that part and its adjacent parts, weighted by their areas. The body part struck is determined from this distribution, and then a specific location within that part is selected by probability weight. A more precise weapon (lower strike accuracy) keeps the scatter close to the intended target; a less precise weapon allows it to wander further.

This mechanism scales naturally with skill. A novice with ML 50 has a 20-point solid-hit band (rolls 1–30) and a 20-point barely-hit band (31–50) — roughly equal chances of each. A veteran with ML 80 has a 60-point solid-hit band (1–60) and only a 20-point barely-hit band (61–80). The veteran hits the intended body part three-quarters of the time even without a critical success. A master with ML 95 almost never scatters at all. Higher skill means not just hitting more often, but hitting where you intend.

## Compound Injuries

When a new injury is inflicted on a body location that already bears one or more existing injuries, the wound may compound. Total the injury levels of all injuries at that location; if the new injury's level meets or exceeds that total, increase the severity of the worst existing injury by one level. This represents the cumulative fragility of already-damaged tissue and makes concentrated attacks on a single location increasingly dangerous.

## Humanoid Body Structure

The standard humanoid body structure is reproduced here for reference. Non-humanoid creatures use different layouts appropriate to their anatomy (see [[anatomical-types]]).

**Head** (1 sq ft) — adjacent to Torso — Skull, Left Eye, Right Eye, Nose, Left Cheek, Right Cheek, Left Ear, Right Ear, Mouth, Jaw, Neck

**Right Arm** (2 sq ft) — adjacent to Torso — Right Shoulder, Right Upper Arm, Right Elbow, Right Forearm, Right Hand

**Left Arm** (2 sq ft) — adjacent to Torso — Left Shoulder, Left Upper Arm, Left Elbow, Left Forearm, Left Hand

**Torso** (3 sq ft) — adjacent to Head, Right Arm, Left Arm, Right Leg, Left Leg — Thorax, Abdomen, Pelvis

**Right Leg** (2 sq ft) — adjacent to Torso — Right Thigh, Right Knee, Right Calf, Right Foot

**Left Leg** (2 sq ft) — adjacent to Torso — Left Thigh, Left Knee, Left Calf, Left Foot

## Anatomy as Actor Data

A creature's body structure — its complete graph of parts, locations, and their properties — is stored directly on the actor as a single structured field, not as a collection of separate items. This reflects the fact that anatomy is intrinsic to what a creature _is_, not something it possesses. Every actor has exactly one anatomy, and it is always present.

The adjacency graph is represented as a set of unordered pairs of part names, where each pair defines a bidirectional edge. For the humanoid layout, the edge set is: {Head, Torso}, {Right Arm, Torso}, {Left Arm, Torso}, {Right Leg, Torso}, {Left Leg, Torso}. Because each edge is defined once at the graph level rather than duplicated on each part, consistency is guaranteed by construction — there is no possibility of one part claiming adjacency that the other does not reciprocate.

Body locations are nested within their parent part's definition. Each part contains a list of its locations together with all location-level properties (probability weight, shock value, bleeding threshold, amputate modifier, fumble/stumble flags). The probability weights for locations within a part can be validated to sum correctly when the anatomy is defined.

Other game elements — injuries, armor, afflictions — are separate items that _reference_ body locations by key. An injury records which location it affects; armor records which locations it covers. These items change frequently during play. The anatomy they reference changes almost never; the only common runtime mutation is marking a part as permanently disabled, and even that is rare.

Creating a new creature type is straightforward: duplicate an existing actor with a similar body plan, then adjust the anatomy field — change part areas, modify location weights, add or remove parts, update the edge set. No templates or special item types are needed.

## Armor and Protection

Armor provides protection at the body location level. Each location tracks its protection separately for each damage aspect: Blunt, Edged, Piercing, and Fire. A character wearing a mail shirt gains edged and piercing protection at the thorax and abdomen locations but no protection at the skull, arms, or legs. Layering armor (a gambeson under mail, for example) adds protection values together at each covered location.

Some locations carry intrinsic protection — natural toughness from bone or dense tissue. The skull has modest intrinsic blunt protection even without a helm. These base values are defined per creature type and are always present.

## Part-Level Effects

Although injuries are tracked at the location level, their effects propagate upward. When the total injury burden in a body part crosses certain thresholds, the part as a whole becomes impaired. An impaired part applies penalties to all skills and attributes it governs. A character with severe injuries across multiple arm locations suffers penalties to Melee, Archery, and Dexterity, among others. Injuries spread across multiple parts compound the effect — a character wounded in both the Right Leg and Torso faces penalties from both parts simultaneously.

Parts that affect mobility impose movement penalties when impaired. A character with an impaired Leg part moves more slowly and may be unable to run. An impaired Torso similarly restricts mobility, reflecting the difficulty of vigorous movement with a wounded trunk.
