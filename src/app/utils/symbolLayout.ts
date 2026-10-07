/**
 * Collision-based layout for chart symbols (planets, antiscia, lots...).
 *
 * Idea (same mental model as 2D colliders in Unity):
 *  - every symbol is an axis-aligned box (iconSize + padding) in SCREEN space;
 *  - a new symbol tries candidate slots, from the cheapest to the most expensive,
 *    and takes the first one whose box does not intersect any box already placed;
 *  - a slot = (lane, angular shift). Lane 0 is the ring itself, lane N is N steps
 *    away from the zodiac (inward for the inner chart, outward for the outer one).
 *
 * Because the test is done against the REAL position (x, y) of the symbols that
 * were already placed, there is no 0/360 wrap-around problem, no dependency on
 * magic degree thresholds and no dependency on the icon's radius.
 */

export type LayoutLayer = "inner" | "outer";

export interface LayoutElementInput {
  longitude: number; // degrees, 0..360
  layer: LayoutLayer;
  /** Optional: only relevant for transits. Angular cusps push symbols away. */
  avoidLongitudes?: number[];
}

export interface LayoutResult {
  longitude: number; // displayed longitude (mod 360)
  offset: number; // radial distance from the layer's base radius (same meaning as today)
  lane: number;
}

export interface SymbolLayoutOptions {
  iconSize: number; // px
  padding?: number; // extra px between boxes
  /** Distance (px) from the base radius to the first slot (today's symbolOffset). */
  baseOffset: number;
  /** Radial granularity (px). Smaller = gentler advance; collisions are still checked in 2D. */
  depthStep?: number;
  /** Max extra radial distance (px) a symbol may advance beyond baseOffset. */
  maxDepthPx?: number;
  /** Max angular nudge (degrees) allowed on a lane before going to the next lane. */
  maxShiftDeg?: number;
  shiftStepDeg?: number;
  /** Cost of 1px of radial advance, expressed in degrees of nudge. Higher = prefers nudging over advancing. */
  depthCostDegPerPx?: number;
  /** Radius (px) of lane 0 and direction (+1 outward, -1 inward) for each layer. */
  geometry: Record<LayoutLayer, { baseRadius: number; direction: 1 | -1 }>;
  /** Min distance (deg) between a symbol and an "avoid" longitude (angular cusps). */
  avoidMarginDeg?: number;
}

interface Placed {
  x: number;
  y: number;
}

const mod360 = (v: number) => ((v % 360) + 360) % 360;

export class SymbolLayout {
  private readonly o: Required<Omit<SymbolLayoutOptions, "geometry">> & {
    geometry: SymbolLayoutOptions["geometry"];
  };
  private placed: Record<LayoutLayer, Placed[]> = { inner: [], outer: [] };
  failures = 0;

  constructor(options: SymbolLayoutOptions) {
    this.o = {
      padding: 1.5,
      depthStep: 6,
      maxDepthPx: 48,
      maxShiftDeg: 5,
      shiftStepDeg: 0.625,
      depthCostDegPerPx: 0.2,
      avoidMarginDeg: 3,
      ...options,
    };
  }

  reset() {
    this.placed = { inner: [], outer: [] };
    this.failures = 0;
  }

  /** Same screen convention used by the chart: angle = 180 - longitude - 90 (deg). */
  private toXY(longitude: number, radius: number): Placed {
    const rad = ((180 - mod360(longitude) - 90) * Math.PI) / 180;
    return { x: radius * Math.cos(rad), y: radius * Math.sin(rad) };
  }

  private collides(layer: LayoutLayer, p: Placed): boolean {
    const size = this.o.iconSize + this.o.padding;
    return this.placed[layer].some(
      (q) => Math.abs(q.x - p.x) < size && Math.abs(q.y - p.y) < size
    );
  }

  private nearAvoid(longitude: number, avoid?: number[]): boolean {
    if (!avoid?.length) return false;
    return avoid.some((a) => {
      const d = Math.abs(((longitude - a + 540) % 360) - 180);
      return d < this.o.avoidMarginDeg;
    });
  }

  place(el: LayoutElementInput): LayoutResult {
    const { geometry, depthStep, maxDepthPx, maxShiftDeg, shiftStepDeg, depthCostDegPerPx } = this.o;
    const g = geometry[el.layer];

    // Pass 1 is the normal range. Passes 2 and 3 only run in very dense clusters:
    // first allow a wider nudge, then allow a deeper advance.
    const passes = [
      { range: maxShiftDeg, depth: maxDepthPx },
      { range: maxShiftDeg * 2, depth: maxDepthPx },
      { range: maxShiftDeg * 2, depth: maxDepthPx * 2 },
      { range: maxShiftDeg * 4, depth: maxDepthPx * 2 },
    ];
    const maxLanes = Math.floor(passes[passes.length - 1].depth / depthStep) + 1;
    let chosen: { lane: number; shift: number; xy: Placed; longitude: number } | undefined;

    for (const { range, depth } of passes) {
      const lanesInPass = Math.floor(depth / depthStep) + 1;
      const shifts: number[] = [0];
      for (let s = shiftStepDeg; s <= range + 1e-9; s += shiftStepDeg) shifts.push(s, -s);

      const candidates: { lane: number; shift: number; cost: number }[] = [];
      for (let lane = 0; lane < lanesInPass; lane++) {
        for (const shift of shifts) {
          candidates.push({ lane, shift, cost: lane * depthStep * depthCostDegPerPx + Math.abs(shift) });
        }
      }
      // stable: ties prefer lower lane, then positive shift
      candidates.sort((a, b) => a.cost - b.cost || a.lane - b.lane || b.shift - a.shift);

      for (const c of candidates) {
        const longitude = mod360(el.longitude + c.shift);
        if (this.nearAvoid(longitude, el.avoidLongitudes)) continue;
        const xy = this.toXY(longitude, this.symbolRadius(g, c.lane));
        if (!this.collides(el.layer, xy)) {
          chosen = { lane: c.lane, shift: c.shift, xy, longitude };
          break;
        }
      }
      if (chosen) break;
    }

    // Last resort (practically unreachable): original longitude on the last lane.
    if (!chosen) {
      const lane = maxLanes - 1;
      const longitude = mod360(el.longitude);
      chosen = { lane, shift: 0, xy: this.toXY(longitude, this.symbolRadius(g, lane)), longitude };
      this.failures++;
    }

    this.placed[el.layer].push(chosen.xy);
    return {
      longitude: chosen.longitude,
      offset: this.offsetOf(chosen.lane),
      lane: chosen.lane,
    };
  }

  private offsetOf(lane: number) {
    return this.o.baseOffset + this.o.depthStep * lane;
  }

  /** inner: baseRadius - offset ; outer: baseRadius + offset (identical to the call sites today). */
  private symbolRadius(g: { baseRadius: number; direction: 1 | -1 }, lane: number) {
    return g.baseRadius + g.direction * this.offsetOf(lane);
  }
}
