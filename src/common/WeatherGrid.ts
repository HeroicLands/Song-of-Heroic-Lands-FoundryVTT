import {
    WEATHER_SKY,
    WEATHER_TEMP,
    WEATHER_WIND_DIR,
    WEATHER_WIND_FORCE,
    WEATHER_PRECIP,
    WEATHER_REGIME,
    WeatherRegime,
    Season,
    WeatherState,
    BiomeWeatherProfile,
    WeatherContext,
    DEFAULT_BIOME_WEATHER_PROFILE,
} from "@utils/constants";
import { SohlCalendarData } from "@common/SohlCalendar";
type RNG = () => number; // 0..1

/** World axial tilt in radians (~23.44°) */
const EARTHLIKE_OBLIQUITY = (23.44 * Math.PI) / 180;

/**
 * WeatherGrid
 *
 * Simulates a grid-based, turn/tick-driven weather system suitable for
 * strategy/roleplaying maps. The grid stores a WeatherState per cell and
 * maintains a global "base" weather and a weather "regime" that bias
 * stochastic evolution each tick. Each step advances the regime and base
 * weather, drifts local cells toward the biome-adjusted base, applies
 * spatial smoothing to scalar weather bands (temperature, cloudiness,
 * precipitation, wind magnitude) and performs a vector-aware smoothing of
 * wind direction and force.
 *
 * Key concepts
 * - Grid layout: row-major (index = y * width + x).
 * - WeatherState: a per-cell object containing sky, temp, windDir, windForce,
 *   and precip. Wind direction is represented as an index 0..7 (eight-way).
 * - Regime: a higher-level categorical state (e.g., FAIR, STORMY, HEATWAVE)
 *   that biases targets for base weather each tick.
 * - RNG: an injectable RNG that must behave like Math.random() (returning
 *   numbers in [0, 1)). Deterministic testing can provide a seeded RNG.
 *
 * Constructor
 * - new WeatherGrid(width, height, ctx, options?)
 *   - width, height: grid dimensions (positive integers).
 *   - ctx: WeatherContext, at minimum providing latDeg (latitude in degrees)
 *     and season (one of the Season union values). These determine the
 *     climatological baseline temperature band.
 *   - options (optional):
 *     - rng?: RNG — function returning a uniform number in [0,1). Defaults to Math.random.
 *     - initialRegime?: WeatherRegime — initial regime override (defaults to FAIR).
 *     - initialBase?: WeatherState — initial base weather override; if omitted
 *       a base is created from climate (latitude + season).
 *     - biomeGrid?: Uint8Array — optional per-cell biome ids (length must be width*height).
 *     - biomeProfiles?: Record<number, BiomeWeatherProfile> — optional mapping of biome
 *       ids to modifiers that bias base weather for that biome.
 *
 * Public properties (read-only externally)
 * - width, height: grid size.
 * - latDeg: latitude used to derive baseline climate.
 * - season: current season used for climate baseline and base evolution.
 * - regime: current WeatherRegime.
 * - base: current global base WeatherState (before biome adjustments).
 * - grid: array of WeatherState of length width*height (row-major).
 *
 * Public API
 * - step(): void
 *   Advance the entire simulation by a single tick. The step performs:
 *    1) Evolve regime and base weather (stochastic biased random walk).
 *    2) Per-cell drift toward the biome-adjusted base.
 *    3) Spatial smoothing of scalar fields (sky, temp, precip, windForce).
 *    4) Vector-aware smoothing of wind (u/v components -> direction & force).
 *
 * - getWeatherAt(x: number, y: number): WeatherState
 *   Return the WeatherState at grid coordinate (x, y). Coordinates are 0-based;
 *   an index is computed as y * width + x.
 *
 * - setWeatherAt(x: number, y: number, state: WeatherState): void
 *   Replace the WeatherState at (x, y). Useful for manual overrides or seeding.
 *
 * Behavior notes
 * - The RNG drives all stochastic choices. Replacing rng allows reproducible
 *   simulations for tests or deterministic seeds.
 * - Biome adjustments are applied when drifting each local cell toward base.
 *   If a biomeProfiles map is supplied, the base is temporarily offset per-cell
 *   using that profile before drift occurs.
 * - Scalar smoothing uses a 4-neighbor (cardinal) kernel with configurable
 *   self/neighbor weights (defaults are tuned within the implementation).
 * - Wind smoothing converts discrete direction+force into cartesian vectors,
 *   smooths the u/v fields as scalars, then converts back to discrete direction
 *   (index 0..7) and rounded force. This avoids direction wrap artifacts.
 * - All internal numeric fields are clamped to their defined enumerated
 *   ranges (e.g., temp between WEATHER_TEMP.FRIGID and WEATHER_TEMP.FURNACE).
 *
 * Example
 * - Create a 100x50 WeatherGrid, advance N ticks, and sample a cell:
 *   const grid = new WeatherGrid(100, 50, { latDeg: 34, season: "summer" });
 *   grid.step(); // advance one tick
 *   const w = grid.getWeatherAt(10, 5);
 *
 * Thread-safety & performance
 * - The class is not inherently thread-safe. If using in a multi-threaded
 *   environment, coordinate access to the grid array.
 * - The simulation is optimized for clarity; smoothing and per-cell loops are
 *   O(width*height) per step and should be acceptable for moderate map sizes.
 */
export class WeatherGrid {
    readonly width: number;
    readonly height: number;
    readonly latDeg: number;
    season: Season;
    regime: WeatherRegime;
    base: WeatherState;
    grid: WeatherState[];

    private rng: RNG;
    private biomeGrid?: Uint8Array;
    private biomeProfiles: Record<number, BiomeWeatherProfile>;

    constructor(
        width: number,
        height: number,
        ctx: WeatherContext & {
            dayOfYear?: number; // NEW optional
            timeOfDayHours?: number; // NEW optional
        },
        options?: {
            rng?: RNG;
            initialRegime?: WeatherRegime;
            initialBase?: WeatherState;
            biomeGrid?: Uint8Array;
            biomeProfiles?: Record<number, BiomeWeatherProfile>;
        },
    ) {
        this.width = width;
        this.height = height;

        this.latDeg = ctx.latDeg;
        this.season = ctx.season;

        this.rng = options?.rng ?? foundry.dice.MersenneTwister.random;

        this.regime = options?.initialRegime ?? WEATHER_REGIME.FAIR;
        this.base = options?.initialBase ?? this.createBaseFromClimate();

        this.biomeGrid = options?.biomeGrid;
        this.biomeProfiles =
            options?.biomeProfiles ?? DEFAULT_BIOME_WEATHER_PROFILE;

        // Initialize all cells to the base weather
        this.grid = new Array(width * height);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = { ...this.base };
        }
    }

    private index(x: number, y: number): number {
        return y * this.width + x;
    }

    // --- Public API -------------------------------------------------------- //

    /**
     * Advance the entire weather grid by one "tick".
     * You decide what a tick is: e.g., 4 in-game hours.
     */
    step(): void {
        // 1. evolve regime & base
        this.regime = this.stepRegime(this.regime);
        this.base = this.stepWeather(this.base);

        // 2. drift local cells toward base
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = this.stepLocalWeatherCell(
                this.grid[i],
                this.base,
                i,
            );
        }

        // 3. spatial smoothing (scalar fields)
        this.smoothScalarFieldOnGrid("sky", 0, 7);
        this.smoothScalarFieldOnGrid("temp", 0, 6);
        this.smoothScalarFieldOnGrid("precip", 0, 6);
        this.smoothScalarFieldOnGrid("windForce", 0, 12);

        // 4. special wind smoothing (vector-based)
        this.smoothWindField();
    }

    /**
     * Get weather at a grid coordinate (x, y).
     */
    getWeatherAt(x: number, y: number): WeatherState {
        const i = this.index(x, y);
        return this.grid[i];
    }

    /**
     * Set weather at a grid coordinate (for manual overrides).
     */
    setWeatherAt(x: number, y: number, state: WeatherState): void {
        const i = this.index(x, y);
        this.grid[i] = state;
    }

    // --- Private helpers --------------------------------------------------- //

    /**
     * Compute day length and sunrise/sunset times (in local solar hours [0,24))
     * at a given latitude and day-of-year.
     *
     * - Uses an Earth-like axial tilt with a 360-day year.
     * - Day 0 = vernal equinox (declination = 0).
     * - Handles polar day/night by clamping hour angle.
     */
    private computeSunriseSunsetHours(
        latDeg: number,
        dayOfYear: number,
        solarNoonHour = 12,
    ): { sunrise: number; sunset: number; dayLength: number } {
        const phi = (latDeg * Math.PI) / 180; // latitude in radians
        const delta = solarDeclination(dayOfYear); // declination in radians

        const tanPhi = Math.tan(phi);
        const tanDelta = Math.tan(delta);
        let cosH0 = -tanPhi * tanDelta;

        // Handle polar cases
        if (cosH0 >= 1) {
            // |cosH0| >= 1 -> no sunrise (polar night), day length = 0
            return { sunrise: NaN, sunset: NaN, dayLength: 0 };
        } else if (cosH0 <= -1) {
            // |cosH0| >= 1 with opposite sign -> sun never sets (midnight sun)
            return { sunrise: 0, sunset: 24, dayLength: 24 };
        }

        const H0 = Math.acos(cosH0); // hour angle at sunrise/sunset (radians)

        const dayLength = (24 * H0) / Math.PI; // hours of daylight
        const half = dayLength / 2;

        const sunrise = solarNoonHour - half;
        const sunset = solarNoonHour + half;

        // Normalize into [0,24)
        const norm = (h: number) => {
            let t = h % 24;
            if (t < 0) t += 24;
            return t;
        };

        return {
            sunrise: norm(sunrise),
            sunset: norm(sunset),
            dayLength,
        };
    }

    /**
     * Compute an integer temperature-band offset due to the diurnal cycle
     * (night/day variation) for a given biome at the current location, date,
     * and time-of-day.
     *
     * - Positive offsets = warmer than the daily mean (afternoon)
     * - Negative offsets = cooler than the daily mean (night / early morning)
     *
     * Biome knobs:
     * - diurnalTempAmplitude: peak swing (in TEMP bands) between mean and
     *   warmest part of the day.
     * - diurnalNightBias: maximum extra cooling (in TEMP bands) applied
     *   right before sunrise, tapering to zero earlier in the night.
     */
    private computeDiurnalTempOffset(
        latDeg: number,
        biomeProfile?: BiomeWeatherProfile,
    ): number {
        const { day, hour } = (game.time.calendar as SohlCalendarData)
            .worldDate;
        const dayOfYear = day + 1; // Adjust dayOfYear to be 1-based

        const { sunrise, sunset, dayLength } = this.computeSunriseSunsetHours(
            latDeg,
            dayOfYear,
        );

        // 0..1 measure of how much diurnal swing we allow: short days -> weaker swing.
        const daylightFraction = dayLength / 24; // 0..1 (0 or 1 in polar cases)

        const baseAmplitude = biomeProfile?.diurnalTempAmplitude ?? 1; // default ~1 band
        const amplitude = baseAmplitude * (0.5 + 0.5 * daylightFraction); // 0.5..baseAmplitude

        // Determine solar noon and a thermal peak lag (mid-afternoon).
        let solarNoon = 12;
        if (!Number.isNaN(sunrise) && !Number.isNaN(sunset)) {
            solarNoon = (sunrise + sunset) / 2;
        }
        const warmLagHours = 2; // heat lags sun → ~2h after solar noon
        const thermalPeakHour = solarNoon + warmLagHours;

        // Main cosine-based diurnal variation:
        // - max at thermalPeakHour (warmest ~ mid-afternoon)
        // - min ~ 12h earlier (early morning), before we add pre-dawn shaping.
        const phase = ((hour - thermalPeakHour) / 24) * 2 * Math.PI;
        const normalized = Math.cos(phase); // +1 at peak, -1 ~ opposite side

        let offset = amplitude * normalized;

        // --- Pre-dawn extra cooling shaping ---------------------------------- //

        const nightBias = biomeProfile?.diurnalNightBias ?? 0;
        let extraNightCooling = 0;

        // Only consider pre-dawn shaping if we actually have a normal day/night cycle.
        if (nightBias > 0 && dayLength > 0 && dayLength < 24) {
            const isNight = hour < sunrise || hour >= sunset;

            if (isNight) {
                // How many hours until the next sunrise?
                let hoursToSunrise: number;
                if (hour < sunrise) {
                    // Night segment before today's sunrise
                    hoursToSunrise = sunrise - hour;
                } else {
                    // Night segment after today's sunset → next sunrise is "tomorrow"
                    hoursToSunrise = sunrise + 24 - hour;
                }

                // Only strongly boost cooling in the last few hours before sunrise.
                const preDawnWindowHours = 4; // e.g. last 4h of night
                if (hoursToSunrise <= preDawnWindowHours) {
                    const factor = 1 - hoursToSunrise / preDawnWindowHours; // 0..1, peaks at sunrise
                    extraNightCooling = nightBias * factor;
                }
            }
        }

        // Apply extra cooling (this pushes the actual minimum toward just before sunrise).
        offset -= extraNightCooling;

        // Return integer band delta
        return Math.round(offset);
    }

    /**
     * Adjusts a base WeatherState according to the biome profile (if available).
     *
     * This method looks up the biome profile for the provided `biomeId` and, when a profile exists,
     * applies any defined offsets (temperature, precipitation, cloudiness, storminess) to the
     * corresponding fields from `base`. Each adjusted value is clamped to its respective allowed
     * range using `clamp` and the relevant enum bounds (e.g. WEATHER_TEMP.FRIGID..WEATHER_TEMP.FURNACE,
     * WEATHER_PRECIP.NONE..WEATHER_PRECIP.EXTREME, WEATHER_SKY.CLEAR..WEATHER_SKY.OBSCURED,
     * WEATHER_WIND_FORCE.CALM..WEATHER_WIND_FORCE.HURRICANE).
     *
     * If `biomeId` is `null`/`undefined` or no profile is found, the original `base` is returned
     * unchanged. The returned WeatherState is a shallow copy of `base` with any adjusted fields
     * (`sky`, `temp`, `windForce`, `precip`) replaced.
     *
     * @private
     * @param base - The original WeatherState to be adjusted.
     * @param biomeId - The identifier of the biome whose profile provides adjustment offsets, or undefined.
     * @returns A new WeatherState with biome offsets applied when applicable; otherwise the original `base`.
     */
    private adjustBaseForBiome(
        base: WeatherState,
        biomeId: number | undefined,
    ): WeatherState {
        if (biomeId == null) return base;

        const profile = this.biomeProfiles[biomeId];
        if (!profile) return base;

        // copy
        let sky = base.sky;
        let temp = base.temp;
        let windForce = base.windForce;
        let precip = base.precip;

        if (profile.tempOffset !== undefined) {
            temp = clamp(
                temp + profile.tempOffset,
                WEATHER_TEMP.FRIGID,
                WEATHER_TEMP.FURNACE,
            );
        }
        if (profile.precipOffset !== undefined) {
            precip = clamp(
                precip + profile.precipOffset,
                WEATHER_PRECIP.NONE,
                WEATHER_PRECIP.EXTREME,
            );
        }
        if (profile.cloudinessOffset !== undefined) {
            sky = clamp(
                sky + profile.cloudinessOffset,
                WEATHER_SKY.CLEAR,
                WEATHER_SKY.OBSCURED,
            );
        }
        if (profile.storminessOffset !== undefined) {
            windForce = clamp(
                windForce + profile.storminessOffset,
                WEATHER_WIND_FORCE.CALM,
                WEATHER_WIND_FORCE.HURRICANE,
            );
        }

        return { ...base, sky, temp, windForce, precip };
    }

    /**
     * Determine the baseline temperature band for a location given latitude and season.
     *
     * The absolute value of `latDeg` (degrees) is used to select a latitudinal zone:
     *  - equatorial:        |lat| < 15
     *  - tropical/subtropical: 15 <= |lat| < 30
     *  - temperate:         30 <= |lat| < 50
     *  - subpolar:          50 <= |lat| < 66
     *  - polar:             |lat| >= 66
     *
     * Zone boundaries are evaluated with strict less-than checks, so a latitude exactly equal
     * to a boundary (e.g. 15, 30, 50, 66) belongs to the next zone up.
     *
     * For each zone the baseline temperature band is chosen based on `season` ("winter" | "spring" | "summer" | "autumn")
     * and returned as a member of the WEATHER_TEMP enumeration (for example: FRIGID, COLD, COOL, WARM, HOT).
     *
     * @param latDeg - Latitude in degrees. Positive values denote north; negative values denote south. Only the magnitude is considered.
     * @param season - Season identifier: "winter", "spring", "summer", or "autumn".
     * @returns The baseline WEATHER_TEMP value representing the temperature band for the given latitude and season.
     */
    private baselineTempBand(latDeg: number, season: Season): number {
        const lat = Math.abs(latDeg);

        if (lat < 15) {
            // equatorial
            switch (season) {
                case "winter":
                    return WEATHER_TEMP.WARM;
                case "spring":
                    return WEATHER_TEMP.WARM;
                case "summer":
                    return WEATHER_TEMP.HOT;
                case "autumn":
                    return WEATHER_TEMP.WARM;
            }
        } else if (lat < 30) {
            // tropical/subtropical
            switch (season) {
                case "winter":
                    return WEATHER_TEMP.COOL;
                case "spring":
                    return WEATHER_TEMP.WARM;
                case "summer":
                    return WEATHER_TEMP.HOT;
                case "autumn":
                    return WEATHER_TEMP.WARM;
            }
        } else if (lat < 50) {
            // temperate
            switch (season) {
                case "winter":
                    return WEATHER_TEMP.COLD;
                case "spring":
                    return WEATHER_TEMP.COOL;
                case "summer":
                    return WEATHER_TEMP.WARM;
                case "autumn":
                    return WEATHER_TEMP.COOL;
            }
        } else if (lat < 66) {
            // subpolar
            switch (season) {
                case "winter":
                    return WEATHER_TEMP.FRIGID;
                case "spring":
                    return WEATHER_TEMP.COLD;
                case "summer":
                    return WEATHER_TEMP.COOL;
                case "autumn":
                    return WEATHER_TEMP.COLD;
            }
        } else {
            // polar
            switch (season) {
                case "winter":
                    return WEATHER_TEMP.FRIGID;
                case "spring":
                    return WEATHER_TEMP.FRIGID;
                case "summer":
                    return WEATHER_TEMP.COLD;
                case "autumn":
                    return WEATHER_TEMP.FRIGID;
            }
        }
    }

    private createBaseFromClimate(): WeatherState {
        const tempBand = this.baselineTempBand(this.latDeg, this.season);
        // Reasonable neutral defaults
        return {
            sky: WEATHER_SKY.PARTLY_CLOUDY,
            temp: tempBand,
            windDir: WEATHER_WIND_DIR.WEST,
            windForce: WEATHER_WIND_FORCE.LIGHT_BREEZE,
            precip: WEATHER_PRECIP.NONE,
        };
    }

    /**
     * Advance the weather regime by one step according to a simple Markov-style
     * transition model.
     *
     * A single random value in [0, 1) is sampled via this.roll(). Each regime
     * has a high probability of persisting (typically ≥ 90%) and smaller
     * probabilities of transitioning to one of a few neighboring regimes:
     *
     * - From FAIR:
     *   - roll &lt; 0.90 → FAIR (persist)
     *   - 0.90 ≤ roll &lt; 0.93 → UNSETTLED
     *   - 0.93 ≤ roll &lt; 0.96 → HEATWAVE
     *   - 0.96 ≤ roll &lt; 0.99 → COLD_SNAP
     *   - 0.99 ≤ roll &lt; 1.00 → STORMY
     *
     * - From UNSETTLED:
     *   - roll &lt; 0.90 → UNSETTLED (persist)
     *   - 0.90 ≤ roll &lt; 0.95 → FAIR
     *   - 0.95 ≤ roll &lt; 1.00 → STORMY
     *
     * - From STORMY:
     *   - roll &lt; 0.90 → STORMY (persist)
     *   - 0.90 ≤ roll &lt; 0.98 → UNSETTLED
     *   - 0.98 ≤ roll &lt; 1.00 → FAIR
     *
     * - From HEATWAVE or COLD_SNAP:
     *   - roll &lt; 0.98 → remain in the same extreme regime
     *   - 0.98 ≤ roll &lt; 1.00 → FAIR
     *
     * This keeps regimes "sticky" most of the time while allowing occasional
     * shifts between stable, unsettled, and extreme conditions.
     *
     * @param prev - The current WeatherRegime.
     * @returns The next WeatherRegime after applying the probabilistic step.
     */
    private stepRegime(prev: WeatherRegime): WeatherRegime {
        const rand = this.rng(); // 0..1

        switch (prev) {
            case WEATHER_REGIME.FAIR: {
                if (rand < 0.9) return WEATHER_REGIME.FAIR;
                if (rand < 0.93) return WEATHER_REGIME.UNSETTLED;
                if (rand < 0.96) return WEATHER_REGIME.HEATWAVE;
                if (rand < 0.99) return WEATHER_REGIME.COLD_SNAP;
                return WEATHER_REGIME.STORMY;
            }
            case WEATHER_REGIME.UNSETTLED: {
                if (rand < 0.9) return WEATHER_REGIME.UNSETTLED;
                return rand < 0.95 ?
                        WEATHER_REGIME.FAIR
                    :   WEATHER_REGIME.STORMY;
            }
            case WEATHER_REGIME.STORMY: {
                if (rand < 0.9) return WEATHER_REGIME.STORMY;
                if (rand < 0.98) return WEATHER_REGIME.UNSETTLED;
                return WEATHER_REGIME.FAIR;
            }
            case WEATHER_REGIME.HEATWAVE:
            case WEATHER_REGIME.COLD_SNAP: {
                if (rand < 0.98) return prev;
                return WEATHER_REGIME.FAIR;
            }
        }
    }

    // 3) Biased random walk for scalar bands

    /**
     * Perform a single biased random-walk step on a discrete "band" index.
     *
     * The function implements a sticky, target-directed drift with occasional
     * short-term random wobble. It is intended to move `current` at most one
     * discrete step per call, biasing movement toward `target` but allowing
     * volatility-driven jitter. The resulting value is clamped to the inclusive
     * range [min, max].
     *
     * Behavior summary:
     * 1. Determine direction toward `target`: -1 if current > target, +1 if
     *    current < target, 0 if equal.
     * 2. Draw a uniform RNG `rng = this.roll()` (expected in [0,1]).
     *    - If rng > volatility: remain mostly sticky. Only if rng > 0.9 and
     *      direction ≠ 0 will the function step one toward the target.
     *    - If rng ≤ volatility: enter the volatility window and draw a second
     *      uniform RNG `r2 = this.roll()` to perform an unbiased wobble:
     *        • r2 < 0.33  -> step -1
     *        • 0.33 ≤ r2 ≤ 0.66 -> remain
     *        • r2 > 0.66  -> step +1
     * 3. Clamp the result to the inclusive bounds [min, max] and return it.
     *
     * Notes:
     * - `volatility` is treated as a probability in [0, 1]. Higher values make
     *   short-term random wobble more likely; lower values make the walk stickier
     *   and more target-directed (though target steps are gated by the rare
     *   rng > 0.9 condition).
     * - If `target === current` no directed movement occurs; only volatility
     *   wobble can change the band.
     * - It is expected that `this.roll()` produces a uniform number in [0,1).
     * - The function moves at most one discrete band per invocation.
     *
     * @param current - The current band index.
     * @param min - Minimum allowed band index (inclusive).
     * @param max - Maximum allowed band index (inclusive).
     * @param target - Desired band index to drift toward.
     * @param volatility - Probability (0..1) of performing a short random wobble
     *                     instead of the target-directed behavior.
     * @returns The new band index after applying one biased random-walk step,
     *          clamped to [min, max].
     */
    private stepBand(
        current: number,
        min: number,
        max: number,
        target: number,
        volatility: number, // 0..1
    ): number {
        const rng = this.rng();
        let dir = 0;
        if (current < target) dir = 1;
        else if (current > target) dir = -1;

        if (rng > volatility) {
            // Mostly sticky: only occasionally take a directed step toward
            // the target (the rng > 0.9 'burst' makes target movement rarer).
            if (rng > 0.9 && dir !== 0) {
                current += dir;
            }
        } else {
            // Volatility window: small unbiased wobble to allow short-term
            // variation around the baseline.
            const r2 = this.rng();
            if (r2 < 0.33) current -= 1;
            else if (r2 > 0.66) current += 1;
        }

        // Enforce enumerated range and return
        if (current < min) current = min;
        if (current > max) current = max;
        return current;
    }

    /**
     * Advance the weather one step from a previous state according to the current
     * grid context (latitude and season) and the active weather regime.
     *
     * The method computes target bands for temperature, sky, precipitation and
     * wind-force based on:
     *  - a baseline temperature band for the grid's latitude and season
     *    (baselineTempBand(latDeg, season)), with small regime-based offsets:
     *      - WEATHER_REGIME.HEATWAVE: +1 (capped at WEATHER_TEMP.FURNACE)
     *      - WEATHER_REGIME.COLD_SNAP: -1 (floored at WEATHER_TEMP.FRIGID)
     *  - regime → sky mapping (default PARTLY_CLOUDY; e.g. FAIR → MOSTLY_CLEAR,
     *    UNSETTLED → MOSTLY_CLOUDY, STORMY/COLD_SNAP → OVERCAST, HEATWAVE → CLEAR)
     *  - regime → precipitation mapping (default NONE; UNSETTLED → LIGHT,
     *    STORMY → HEAVY, COLD_SNAP → LIGHT, HEATWAVE → NONE)
     *  - regime → wind-force mapping (default LIGHT_BREEZE; UNSETTLED →
     *    MODERATE_BREEZE, STORMY → GALE, HEATWAVE → LIGHT_AIR, COLD_SNAP →
     *    FRESH_BREEZE)
     *
     * Each band (temp, sky, precip, windForce) is then moved gradually toward its
     * target using stepBand with the following ranges and smoothing strengths:
     *  - temp:   range WEATHER_TEMP.FRIGID .. WEATHER_TEMP.FURNACE, p = 0.3
     *  - sky:    range WEATHER_SKY.CLEAR .. WEATHER_SKY.OBSCURED, p = 0.4
     *  - precip: range WEATHER_PRECIP.NONE .. WEATHER_PRECIP.EXTREME, p = 0.4
     *  - windForce: range WEATHER_WIND_FORCE.CALM .. WEATHER_WIND_FORCE.HURRICANE, p = 0.3
     *
     * Wind direction is updated independently as a slow random walk:
     *  - a call to roll() produces r in [0,1)
     *  - if r < 0.2: decrement direction by 1 (mod 8)
     *  - if r > 0.8: increment direction by 1 (mod 8)
     *  - otherwise: keep the previous direction
     *
     * The result is a new WeatherState containing the smoothed/stepped values:
     *  - temp: new temperature band
     *  - sky: new sky band
     *  - precip: new precipitation band
     *  - windForce: new wind-force band
     *  - windDir: new wind direction (0..7)
     *
     * @param prev - The previous WeatherState to advance from.
     * @returns A new WeatherState representing the next step.
     */
    private stepWeather(prev: WeatherState): WeatherState {
        // Build a minimal context (latitude + season). Kept explicit for clarity
        // and to mirror the public API shape used elsewhere.
        const ctx: WeatherContext = {
            latDeg: this.latDeg,
            season: this.season,
        };

        // Determine the climatic baseline temperature band for this grid
        // (depends on latitude and season). This is the 'target' without
        // considering transient regime effects.
        const targetTemp = this.baselineTempBand(ctx.latDeg, ctx.season);

        // Apply short-lived regime offsets to the target temperature:
        // - HEATWAVE nudges the band up by 1 (clamped to FURNACE)
        // - COLD_SNAP nudges it down by 1 (clamped to FRIGID)
        let tempTarget = targetTemp;
        if (this.regime === WEATHER_REGIME.HEATWAVE) {
            tempTarget = Math.min(tempTarget + 1, WEATHER_TEMP.FURNACE);
        } else if (this.regime === WEATHER_REGIME.COLD_SNAP) {
            tempTarget = Math.max(tempTarget - 1, WEATHER_TEMP.FRIGID);
        }

        // Move the previous temperature one step toward the target using
        // stepBand which implements a biased random walk. The numeric
        // bounds are the enum min/max and the volatility (0.3) controls
        // how 'sticky' the band is.
        const temp = this.stepBand(
            prev.temp,
            WEATHER_TEMP.FRIGID,
            WEATHER_TEMP.FURNACE,
            tempTarget,
            0.3,
        );

        // Map the current regime to a target cloudiness (sky) band. Default
        // is PARTLY_CLOUDY; regimes like FAIR -> MOSTLY_CLEAR, STORMY -> OVERCAST.
        let skyTarget: number = WEATHER_SKY.PARTLY_CLOUDY;
        switch (this.regime) {
            case WEATHER_REGIME.FAIR:
                skyTarget = WEATHER_SKY.MOSTLY_CLEAR;
                break;
            case WEATHER_REGIME.UNSETTLED:
                skyTarget = WEATHER_SKY.MOSTLY_CLOUDY;
                break;
            case WEATHER_REGIME.STORMY:
                skyTarget = WEATHER_SKY.OVERCAST;
                break;
            case WEATHER_REGIME.HEATWAVE:
                // unusually clear skies during heatwaves
                skyTarget = WEATHER_SKY.CLEAR;
                break;
            case WEATHER_REGIME.COLD_SNAP:
                skyTarget = WEATHER_SKY.OVERCAST;
                break;
        }

        // Step the sky band toward the selected target. Volatility is a bit
        // higher for sky so cloud cover can change more readily than temp.
        const sky = this.stepBand(
            prev.sky,
            WEATHER_SKY.CLEAR,
            WEATHER_SKY.OBSCURED,
            skyTarget,
            0.4,
        );

        // Regime -> precipitation mapping: most regimes bias to NONE/LIGHT/HEAVY
        // depending on severity. Heatwaves suppress precip while stormy ups it.
        let precipTarget: number = WEATHER_PRECIP.NONE;
        switch (this.regime) {
            case WEATHER_REGIME.FAIR:
                precipTarget = WEATHER_PRECIP.NONE;
                break;
            case WEATHER_REGIME.UNSETTLED:
                precipTarget = WEATHER_PRECIP.LIGHT;
                break;
            case WEATHER_REGIME.STORMY:
                precipTarget = WEATHER_PRECIP.HEAVY;
                break;
            case WEATHER_REGIME.HEATWAVE:
                precipTarget = WEATHER_PRECIP.NONE;
                break;
            case WEATHER_REGIME.COLD_SNAP:
                precipTarget = WEATHER_PRECIP.LIGHT;
                break;
        }

        // Advance the precipitation band toward the regime-biased target.
        const precip: number = this.stepBand(
            prev.precip,
            WEATHER_PRECIP.NONE,
            WEATHER_PRECIP.EXTREME,
            precipTarget,
            0.4,
        );

        // Regime -> typical wind-force mapping. Stormy weather increases the
        // target force while calm/fair conditions favor light breezes.
        let wfTarget: number = WEATHER_WIND_FORCE.LIGHT_BREEZE;
        switch (this.regime) {
            case WEATHER_REGIME.FAIR:
                wfTarget = WEATHER_WIND_FORCE.LIGHT_BREEZE;
                break;
            case WEATHER_REGIME.UNSETTLED:
                wfTarget = WEATHER_WIND_FORCE.MODERATE_BREEZE;
                break;
            case WEATHER_REGIME.STORMY:
                wfTarget = WEATHER_WIND_FORCE.GALE;
                break;
            case WEATHER_REGIME.HEATWAVE:
                // heatwaves often come with light, thermally-driven air
                wfTarget = WEATHER_WIND_FORCE.LIGHT_AIR;
                break;
            case WEATHER_REGIME.COLD_SNAP:
                wfTarget = WEATHER_WIND_FORCE.FRESH_BREEZE;
                break;
        }

        // Step wind force toward the selected regime-biased target.
        const windForce: number = this.stepBand(
            prev.windForce,
            WEATHER_WIND_FORCE.CALM,
            WEATHER_WIND_FORCE.HURRICANE,
            wfTarget,
            0.3,
        );

        // Wind direction is treated as an independent slow random walk.
        // We keep direction discrete (0..7). With probability 0.2 we rotate
        // one step left, with probability 0.2 we rotate one step right, otherwise
        // we hold the current heading. The bitwise '& 7' wraps the value mod 8.
        let windDir = prev.windDir;
        const r = this.rng();
        if (r < 0.2)
            windDir = (windDir + 7) & 7; // -1 mod 8
        else if (r > 0.8) windDir = (windDir + 1) & 7; // +1 mod 8

        // Return a new weather state for the base (before spatial smoothing).
        return { sky, temp, windDir, windForce, precip };
    }

    /**
     * Probabilistically drifts a scalar value one step toward a base, optionally applies a small random
     * perturbation, and clamps the result to the provided bounds.
     *
     * Behavior (driven by this.roll() returning a number in [0, 1)):
     * - 70%: gentle drift — step by ±1 toward `base` (no change if `value === base`).
     * - 10%: rare jump — apply a random ±1 perturbation with equal probability.
     * - 20%: hold steady — no change.
     *
     * After the selected action the result is clamped to the inclusive range [min, max].
     *
     * @param value - The current scalar value to update (treated as integer steps).
     * @param base - The target/base value toward which `value` should drift.
     * @param min - The inclusive minimum allowed value after clamping.
     * @param max - The inclusive maximum allowed value after clamping.
     * @returns The updated value after applying probabilistic drift and clamping.
     */
    private driftComponent(
        value: number,
        base: number,
        min: number,
        max: number,
    ): number {
        const r = this.rng();
        if (r < 0.7) {
            // Gentle drift toward the climate/biome base
            if (value < base) value++;
            else if (value > base) value--;
        } else if (r >= 0.9) {
            // Occasional random jump to keep cells lively
            const r2 = this.rng();
            if (r2 < 0.5) value--;
            else value++;
        }

        // Clamp and return
        if (value < min) value = min;
        if (value > max) value = max;
        return value;
    }

    /**
     * Compute the next local weather state for a single grid cell.
     *
     * This routine applies a biome-specific adjustment to the provided regional
     * base weather, then probabilistically "drifts" each scalar weather
     * component of the current cell toward that biome-adjusted base. Only the
     * scalar components are drifted here: sky, temperature, wind force, and
     * precipitation. Wind direction is intentionally left unchanged because it is
     * smoothed later in vector space to avoid circular wrap issues.
     *
     * The biome used for adjustment is looked up from this.biomeGrid at the
     * provided index; if no biome grid is present the base is used unchanged.
     * The biome-adjusted base is produced by calling this.adjustBaseForBiome(...),
     * and each scalar component is moved toward that target via this.driftComponent(...)
     * using the appropriate enum bounds (e.g. WEATHER_SKY.CLEAR .. WEATHER_SKY.OBSCURED,
     * WEATHER_TEMP.FRIGID .. WEATHER_TEMP.FURNACE, etc.).
     *
     * This method does not mutate its inputs; it returns a new WeatherState
     * containing the updated scalar components and the original windDir.
     *
     * @private
     * @param w - The current local WeatherState for the cell to update.
     * @param base - The regional/base WeatherState to use as a starting point for adjustments.
     * @param index - The linear index of the cell in the grid (used to lookup a biome id).
     * @returns A new WeatherState for the cell with scalar components drifted toward the
     *          biome-adjusted base and the existing wind direction preserved.
     */
    private stepLocalWeatherCell(
        w: WeatherState,
        base: WeatherState,
        index: number,
    ): WeatherState {
        const biomeId = this.biomeGrid ? this.biomeGrid[index] : undefined;
        const profile =
            biomeId != null ? this.biomeProfiles[biomeId] : undefined;
        const biomeBase = this.adjustBaseForBiome(base, biomeId);

        // First: drift toward biome-adjusted base
        let sky = this.driftComponent(
            w.sky,
            biomeBase.sky,
            WEATHER_SKY.CLEAR,
            WEATHER_SKY.OBSCURED,
        );
        let temp = this.driftComponent(
            w.temp,
            biomeBase.temp,
            WEATHER_TEMP.FRIGID,
            WEATHER_TEMP.FURNACE,
        );
        // windDir is handled during vector smoothing to avoid wrap issues
        const windDir = w.windDir;
        let windForce = this.driftComponent(
            w.windForce,
            biomeBase.windForce,
            WEATHER_WIND_FORCE.CALM,
            WEATHER_WIND_FORCE.HURRICANE,
        );
        let precip = this.driftComponent(
            w.precip,
            biomeBase.precip,
            WEATHER_PRECIP.NONE,
            WEATHER_PRECIP.EXTREME,
        );

        // Then: apply diurnal temp offset for this biome
        const diurnalDelta = this.computeDiurnalTempOffset(
            this.latDeg,
            profile,
        );

        temp = clamp(
            temp + diurnalDelta,
            WEATHER_TEMP.FRIGID,
            WEATHER_TEMP.FURNACE,
        );

        return { sky, temp, windDir, windForce, precip };
    }

    /**
     * Smooths a numeric scalar field across the grid using a weighted local average.
     *
     * This method reads the numeric value named by `key` from every cell in `this.grid`,
     * computes a weighted average for each cell using the cell itself and its four
     * orthogonal neighbors (von Neumann neighborhood), clamps the result to the supplied
     * [min, max] range, rounds to the nearest integer, and then writes all new values
     * back into `this.grid` for the same key. Boundary cells simply ignore out-of-bounds
     * neighbors.
     *
     * The smoothing for a cell at (x, y) is computed as:
     *   v = round((selfWeight * value(x,y) + neighborWeight * sum(values of existing N,S,E,W))
     *             / (sum of applicable weights))
     * and then clamped to [min, max].
     *
     * Notes and preconditions:
     * - The property referenced by `key` is expected to hold numeric values for every cell.
     * - The method mutates `this.grid` in place (only for the specified `key`).
     * - If the total applicable weight for a cell is zero (for example selfWeight === 0
     *   and neighborWeight === 0), the behavior is undefined; callers should ensure the
     *   sum of applicable weights is > 0.
     *
     * Complexity: O(width * height) time and O(width * height) additional memory for the
     * temporary output array.
     *
     * @private
     * @param key - The key of the numeric scalar field on each grid cell to smooth.
     * @param min - Minimum allowed value after smoothing; results are clamped to this floor.
     * @param max - Maximum allowed value after smoothing; results are clamped to this ceiling.
     * @param selfWeight - Weight applied to the cell's own value (default: 2).
     * @param neighborWeight - Weight applied to each valid orthogonal neighbor (default: 1).
     */
    private smoothScalarFieldOnGrid(
        key: keyof WeatherState,
        min: number,
        max: number,
        selfWeight = 2,
        neighborWeight = 1,
    ): void {
        // Note: smoothScalarFieldOnGrid implements a simple 4-neighbor smoothing
        // kernel. The `selfWeight` and `neighborWeight` parameters control how much
        // a tile's own value contributes vs its cardinal neighbors. The result is
        // rounded and clamped back into the enumerated band range so we keep
        // discrete bands rather than floating point values.

        const len = this.grid.length;
        const field = new Array<number>(len);
        for (let i = 0; i < len; i++) {
            field[i] = this.grid[i][key] as number;
        }

        const out = new Array<number>(len).fill(0);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const i = this.index(x, y);
                let sum = field[i] * selfWeight;
                let weightSum = selfWeight;

                const neigh = [
                    [x - 1, y],
                    [x + 1, y],
                    [x, y - 1],
                    [x, y + 1],
                ];

                for (const [nx, ny] of neigh) {
                    if (
                        nx < 0 ||
                        ny < 0 ||
                        nx >= this.width ||
                        ny >= this.height
                    )
                        continue;
                    const ni = this.index(nx, ny);
                    sum += field[ni] * neighborWeight;
                    weightSum += neighborWeight;
                }

                let v = Math.round(sum / weightSum);
                if (v < min) v = min;
                if (v > max) v = max;
                out[i] = v;
            }
        }

        for (let i = 0; i < len; i++) {
            (this.grid[i][key] as number) = out[i];
        }
    }

    /**
     * Convert a discrete direction index into an angle in radians.
     *
     * @param dir - Direction index, normally 0..7 where each step represents 45°:
     *              0 → 0 rad, 1 → π/4, 2 → π/2, ..., 7 → 7π/4.
     *              Values outside 0..7 are mapped proportionally around the circle.
     * @returns The corresponding angle in radians, in the range [0, 2π).
     */
    private dirIndexToAngle(dir: number): number {
        // Convert discrete 0..7 direction index into radians (0..2π)
        return (dir / 8) * 2 * Math.PI;
    }

    /**
     * Convert a continuous angle (in radians) to one of eight discrete direction indices (0..7).
     *
     * The input angle is first normalized into the range [0, 2π). It is then scaled to the
     * 8-sector circle and rounded to the nearest integer index:
     *   index = round((angle / (2π)) * 8) % 8
     *
     * Behavior notes:
     * - Accepts any finite or negative angle; negative angles are normalized into [0, 2π).
     * - Ties (exact halfway between two sectors, e.g. angle = (2k+1)·π/8) are resolved by
     *   Math.round, which rounds .5 up to the next index.
     * - Values near 2π wrap to index 0 due to the final modulo operation.
     * - If `angle` is NaN or non-finite, the result will be NaN.
     *
     * Examples:
     * - angle = 0           -> 0
     * - angle = Math.PI/4   -> 1
     * - angle = Math.PI     -> 4
     * - angle = -Math.PI/2  -> 6  (normalized to 3π/2)
     *
     * @param angle - Angle in radians (may be any finite number; negative values allowed)
     * @returns An integer in 0..7 representing the nearest of eight equally spaced directions
     */
    private angleToDirIndex(angle: number): number {
        const twoPi = 2 * Math.PI;
        angle = ((angle % twoPi) + twoPi) % twoPi;
        // Normalize angle to [0, 2π) then map to nearest 0..7 index.
        const idx = Math.round((angle / twoPi) * 8) % 8;
        return idx;
    }

    private forceToMagnitude(force: number): number {
        // Convert a discrete wind-force band into a cartesian magnitude for
        // vector smoothing. Currently this is an identity mapping (band==mag)
        // but it is extracted so it can be replaced with a real mapping
        // (e.g., Beaufort scale → m/s) later without touching smoothing code.
        return force;
    }

    /**
     * Smooths the wind field stored in this.grid by converting polar (direction/force)
     * values into Cartesian components, smoothing those components, and converting
     * the results back to discrete direction indices and integer forces.
     *
     * Algorithm:
     * 1. Convert each cell's direction index and force to a 2D vector:
     *    u = cos(angle) * mag, v = sin(angle) * mag
     *    (using dirIndexToAngle and forceToMagnitude).
     * 2. Smooth the u and v scalar arrays independently via smoothScalarArray with
     *    the provided selfWeight and neighborWeight.
     * 3. For each cell, reconstruct magnitude = sqrt(u^2 + v^2) and angle = atan2(v, u),
     *    then map angle back to a direction index with angleToDirIndex and set force to
     *    the rounded, clamped magnitude between WEATHER_WIND_FORCE.CALM and
     *    WEATHER_WIND_FORCE.HURRICANE.
     *
     * This method mutates this.grid in-place.
     *
     * @param selfWeight - Weight applied to the cell's own value during smoothing. Default: 2.
     * @param neighborWeight - Weight applied to each neighbor's value during smoothing. Default: 1.
     * @returns void
     *
     * @remarks
     * - Time complexity: O(n) (linear passes over the grid).
     * - Numerical notes: magnitude is rounded before clamping; atan2(0,0) yields 0 which will
     *   be handled by angleToDirIndex according to its implementation.
     */
    private smoothWindField(selfWeight = 2, neighborWeight = 1): void {
        const len = this.grid.length;
        const uField = new Array<number>(len).fill(0);
        const vField = new Array<number>(len).fill(0);

        // to vectors
        for (let i = 0; i < len; i++) {
            const w = this.grid[i];
            const angle = this.dirIndexToAngle(w.windDir);
            const mag = this.forceToMagnitude(w.windForce);
            uField[i] = Math.cos(angle) * mag;
            vField[i] = Math.sin(angle) * mag;
        }

        const uSmoothed = this.smoothScalarArray(
            uField,
            selfWeight,
            neighborWeight,
        );
        const vSmoothed = this.smoothScalarArray(
            vField,
            selfWeight,
            neighborWeight,
        );

        // back to dir + force
        for (let i = 0; i < len; i++) {
            const u = uSmoothed[i];
            const v = vSmoothed[i];
            const mag = Math.sqrt(u * u + v * v);
            const angle = Math.atan2(v, u);
            this.grid[i].windDir = this.angleToDirIndex(angle);
            this.grid[i].windForce = Math.max(
                WEATHER_WIND_FORCE.CALM,
                Math.min(WEATHER_WIND_FORCE.HURRICANE, Math.round(mag)),
            );
        }
    }

    /**
     * Smooths a flattened 2D scalar field by replacing each cell with a weighted
     * average of itself and its four orthogonal neighbors (no diagonals).
     *
     * The input array is treated as a row-major flattened grid whose dimensions
     * are defined by this.width and this.height, and the indexing must be
     * compatible with this.index(x, y). The operation is non-destructive: a new
     * array is returned and the original `field` is not modified.
     *
     * Boundary handling:
     * - Neighbor coordinates that lie outside the grid are ignored (they do not
     *   contribute to the sum or weight).
     *
     * Normalization:
     * - For each cell the sum of weighted contributions is divided by the total
     *   accumulated weight for that cell (selfWeight + neighborWeight * validNeighbors).
     * - If the accumulated weight for a cell is zero (e.g., selfWeight === 0 and
     *   neighborWeight === 0 or there are no valid neighbors), the result for that
     *   cell will be NaN; callers should ensure weights produce a non-zero divisor.
     *
     * Complexity:
     * - Time: O(width * height)
     * - Space: O(width * height) additional memory for the returned array
     *
     * @param field - A 1D array of scalar values whose length must match the grid
     *   size implied by this.width and this.height.
     * @param selfWeight - Weight applied to the center cell when computing the
     *   average. May be fractional or negative; ensure resulting weight sums are valid.
     * @param neighborWeight - Weight applied to each orthogonal neighbor (up/down/left/right).
     * @returns A new array of the same length as `field` containing the smoothed scalar values.
     * @private
     */
    private smoothScalarArray(
        field: number[],
        selfWeight: number,
        neighborWeight: number,
    ): number[] {
        const out = new Array<number>(field.length).fill(0);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const i = this.index(x, y);
                let sum = field[i] * selfWeight;
                let weightSum = selfWeight;

                const neigh = [
                    [x - 1, y],
                    [x + 1, y],
                    [x, y - 1],
                    [x, y + 1],
                ];

                for (const [nx, ny] of neigh) {
                    if (
                        nx < 0 ||
                        ny < 0 ||
                        nx >= this.width ||
                        ny >= this.height
                    )
                        continue;
                    const ni = this.index(nx, ny);
                    sum += field[ni] * neighborWeight;
                    weightSum += neighborWeight;
                }

                out[i] = sum / weightSum;
            }
        }

        return out;
    }
}

/**
 * Compute solar declination (radians) for an Earth-like 360-day year
 * where day 0 is the vernal equinox.
 */
function solarDeclination(dayOfYear: number): number {
    const lambda = (2 * Math.PI * (dayOfYear % 360)) / 360; // solar longitude
    return Math.asin(Math.sin(EARTHLIKE_OBLIQUITY) * Math.sin(lambda));
}

function clamp(v: number, min: number, max: number): number {
    if (v < min) return min;
    if (v > max) return max;
    return v;
}

function seasonFromDayOfYear(day: number): Season {
    const d = ((day % 360) + 360) % 360;
    if (d < 90) return "spring";
    if (d < 180) return "summer";
    if (d < 270) return "autumn";
    return "winter";
}
