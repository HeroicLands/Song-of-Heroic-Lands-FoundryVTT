---
shortcode: syssetngug
name: {full: "System Settings"}
type: doc
subType: userguide
tags: [guide-setting-up-a-world]
data: {packFolder: userguide}
---

# System Settings Overview {#SettingsOverview}

Song of Heroic Lands provides several configurable settings accessible from **Settings > Configure Settings > System Settings** in Foundry VTT.

Settings are divided into two categories:

- **World settings** are configured by the GM and apply to all players.
- **Player settings** are configured independently by each user.

This guide documents all available settings. For a quick start, see [[doc-quickstartug|Quickstart]].

# World Settings {#WorldSettings}

World settings are configured by the GM and apply to all players in the world.

## Healing Interval

**Default:** 432000 seconds (5 days)

The number of in-world seconds between automatic healing checks. When world time advances past this interval, characters with injuries or afflictions will have their healing tests triggered automatically.

Set to **0** to disable automatic healing entirely. When disabled, the GM must trigger healing checks manually.

Common values:

- 86400 = 1 day
- 432000 = 5 days (default)
- 864000 = 10 days

## Fate Rules

**Default:** PC only

Fate allows characters to spend fate points to re-roll failed tests, providing a safety net against critical failures. This setting controls who can use fate.

- **Disabled** — No one can use fate. Removes the fate system entirely. Use this for a grittier, more dangerous campaign.
- **PC only** — Only player characters can use fate. NPCs and creatures cannot. This is the recommended setting for most campaigns.
- **Everyone** — All characters (including NPCs and creatures) can use fate. This makes combat more unpredictable since enemies can also re-roll.

## Track Projectiles

**Default:** Disabled

When enabled, firing a missile weapon reduces the quantity of the appropriate projectile gear (arrows, bolts, etc.) by one. When the quantity reaches zero, the character cannot make further missile attacks with that weapon until they acquire more ammunition.

When disabled, ammunition is treated as unlimited. Enable this for campaigns where resource management and logistics matter.

## Gear Damage

**Default:** Disabled

When enabled, a successful block in melee combat may damage the blocking weapon or shield. Gear that takes enough damage may eventually break and become unusable.

This is an optional rule that adds realism and tactical depth. Disable it for simpler combat or if you don't want to track equipment wear.

## Tactical Distance Unit

**Default:** Meters

The unit used for measuring distance in combat (weapon reach, movement per round, spell ranges). All distances are stored internally in meters and converted for display.

- **Meters** — Standard metric (1m)
- **Feet** — Imperial (0.3048m)
- **Yards** — Imperial (0.9144m)
- **Cubits** — Historical unit (0.4572m), suitable for ancient or biblical settings

Change this to match the conventions your group is most comfortable with. The choice is purely cosmetic — it does not affect game mechanics.

## Trek Distance Unit

**Default:** Kilometers

The unit used for measuring overland travel distance (trekking, marching, sailing). Used in movement profile calculations and travel time estimates.

- **Kilometers** — Standard metric (1000m)
- **Miles** — Imperial (1609m)
- **Nautical Miles** — Maritime (1852m), useful for seafaring campaigns
- **Leagues** — Historical (4828m), suitable for fantasy settings
- **Li** — Chinese historical unit (500m)
- **Parsangs** — Persian historical unit (5500m)

As with tactical distance, this is a display preference and does not affect the underlying mechanics.

## Asset Packs {#AssetPacks}

**Default:** every package uses the art it ships with

An asset pack is a set of icons and images for one content package — the system or a module that ships its own art. Each package ships its **Default** pack. Other packs are published separately, each as a pack file at a web address; a package's own site lists the packs made for it.

Open **Configure Asset Packs** to see one row per package:

- **Pack** — the pack the package uses: **Default**, or a pack you have added.
- **Add new…** — enter the address of a pack file. The file is read and stored in the world, and the pack becomes the package's selected pack. A file meant for another package, or one named `default.json`, is refused. Adding a pack downloads no art; adding the same address again replaces the stored copy, which is how a pack that has been updated is refreshed.
- **Remove** — listed under a package's row for each added pack that is not selected. After a confirmation the pack leaves the list; the files it downloaded stay in their folder, and documents already pointing at them are unchanged. Default and the selected pack have no Remove button.
- **Fix** — makes the world match every package's selected pack.

Pressing **Fix** does the following for each package:

1. **Default** needs nothing downloaded: every icon and image goes back to the files the package ships with.
2. **Any other pack** asks for a folder in the world's storage — user data, an S3 bucket or the Forge Assets Library — offering the folder last used for that pack. A warning follows, because files in that folder's `icons/` and `images/` with the same names are overwritten. Cancelling either question leaves that package as it was.
3. Fix downloads every file the pack lists that the folder lacks or holds at a different size, then points every actor, item, journal page, scene, macro and roll table in the world at the files. A report shows what was downloaded, what was already present, what failed, and how many documents changed.

Things to know:

- Nothing changes until you press **Fix**. Pressing it again changes nothing unless the pack or its folder has changed; a file that failed to download is tried again.
- Use a different folder for each pack you keep, so switching between them downloads nothing.
- A pack may cover only part of a package. Anything it does not cover keeps the package's own picture.
- A picture you set by hand is never replaced. Neither is a token's randomly chosen image.
- Documents you import from a compendium arrive pointing at the selected pack's files already downloaded; nothing is downloaded on import.
- Compendiums are never changed: they show the package's own art.
- Downloading needs permission to upload files.

### Using asset packs on the Forge

On the Forge the art lives in your Assets Library, so nothing is added to the packages themselves:

1. Open **Configure Asset Packs**, press **Add new…** beside the package, and enter the pack file's address.
2. Press **Fix**. The Forge's file picker opens on your Assets Library; choose or create a folder for the pack.
3. Confirm the overwrite warning. Fix uploads each file into that folder through your own Forge login — no API key is involved — and points the world at the uploaded files.

Pictures stored in the Assets Library do not count against the allowance for private modules, so a pack's art stays within the Forge's free allowance.

### Overwriting in place

A GM who runs Foundry on their own machine can replace a package's art directly. Unzip a pack's `icons.zip` and `images.zip` over the package's `icons/` and `images/` folders. Every picture then changes everywhere the package's art is used, compendiums included, and Fix is not needed.

- It cannot work on the Forge, where a listed package is one shared read-only copy.
- Every update of the package restores its own art and undoes the overwrite.

# Player Settings {#PlayerSettings}

Player settings are configured independently by each user and only affect that user's client. They are found under **Settings > Configure Settings > System Settings**.

## Record Trauma

**Default:** Record automatically

Controls whether injuries, afflictions, and other trauma are automatically created on characters when they take damage or are affected by conditions.

- **Record automatically** — Injuries and afflictions are created on the character as soon as they occur. This is the standard mode and keeps the game flowing without extra prompts.
- **Prompt each time** — You are asked to confirm each time an injury or affliction would be created. Useful if you want to narrate trauma before it appears on the sheet, or if you sometimes override the mechanical result.
- **Don't record automatically** — Trauma is never created automatically. Injuries and afflictions must be added manually. Use this for a fully narrative approach to damage.

## Combat Sounds

**Default:** Enabled

When enabled, combat actions (attacks, blocks, impacts) play flavor sound effects. Disable this if you prefer a quieter experience or are using your own ambient audio.

## Log Level

**Default:** Info

Controls the verbosity of SoHL's system log messages in the browser console. This is primarily a debugging tool.

- **Error** — Only errors. Use this during normal play.
- **Warn** — Errors and warnings. Useful if something seems wrong.
- **Info** — General informational messages (default).
- **Debug** — Verbose output including lifecycle details. Use this when diagnosing bugs or developing modules.

# See also

- [[doc-thftsystug|The Fate System]] — what the **Fate** setting turns on.
- [[doc-afflinjug|Afflictions and Injuries]] — what the **Healing Interval** setting paces.
- [[doc-cmbtbscsug|Combat Basics]] — the combat behaviour the projectile, gear damage, and distance settings affect.
- [[doc-usingpacksug|Using Compendiums]] — the content a new world starts from.
- [[doc-userguide|User Guide]] — back to the index.
