/**
 * Collision-based layout for chart symbols (planets, antiscia, lots...).
 *
 * Idea (same mental model as 2D colliders in Unity):
 *  - every symbol is a screen-aligned box; optional degree labels use a radial box;
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
  /** Larger visual footprint for labels attached to a symbol. */
  collisionSize?: number;
  /** A radial label rendered inward from the symbol. */
  label?: { offset: number; length: number; width: number };
  /** Rotation applied to the whole chart in degrees. */
  rotationDeg?: number;
  /** Restricts collision nudges to one zodiacal direction. */
  shiftDirection?: 1 | -1;
  /** Keeps displayed longitudes in sorted order when laid out as a sequence. */
  minimumLongitude?: number;
  /** Prevents symbols with degree labels from moving to a different radial lane. */
  sameLaneOnly?: boolean;
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

interface Point {
  x: number;
  y: number;
}

interface Placed extends Point {
  angle: number;
  halfWidth: number;
  halfHeight: number;
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
  private toXY(longitude: number, radius: number, rotationRad: number): Point {
    const rad = ((180 - mod360(longitude) - 90) * Math.PI) / 180 - rotationRad;
    return { x: radius * Math.cos(rad), y: radius * Math.sin(rad) };
  }

  private shapesOverlap(a: Placed, b: Placed): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const axes = [a.angle, a.angle + Math.PI / 2, b.angle, b.angle + Math.PI / 2];

    return axes.every((axis) => {
      const aRadius = a.halfWidth * Math.abs(Math.cos(a.angle - axis)) +
        a.halfHeight * Math.abs(Math.sin(a.angle - axis));
      const bRadius = b.halfWidth * Math.abs(Math.cos(b.angle - axis)) +
        b.halfHeight * Math.abs(Math.sin(b.angle - axis));
      const centerDistance = Math.abs(dx * Math.cos(axis) + dy * Math.sin(axis));
      return centerDistance < aRadius + bRadius;
    });
  }

  private collides(layer: LayoutLayer, shapes: Placed[]): boolean {
    return shapes.some((shape) =>
      this.placed[layer].some((placedShape) => this.shapesOverlap(shape, placedShape))
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
    const maxLanes = el.sameLaneOnly ? 1 : Math.floor(passes[passes.length - 1].depth / depthStep) + 1;
    let chosen: { lane: number; shift: number; xy: Point; longitude: number; shapes: Placed[] } | undefined;

    for (const { range, depth } of passes) {
      const lanesInPass = el.sameLaneOnly ? 1 : Math.floor(depth / depthStep) + 1;
      const shifts: number[] = [0];
      for (let s = shiftStepDeg; s <= range + 1e-9; s += shiftStepDeg) {
        if (el.shiftDirection === 1) shifts.push(s);
        else if (el.shiftDirection === -1) shifts.push(-s);
        else shifts.push(s, -s);
      }

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
        if (el.minimumLongitude !== undefined && longitude + 1e-9 < el.minimumLongitude) continue;
        if (this.nearAvoid(longitude, el.avoidLongitudes)) continue;
        const symbolRadius = this.symbolRadius(g, c.lane);
        const rotationRad = ((el.rotationDeg ?? 0) * Math.PI) / 180;
        const xy = this.toXY(longitude, symbolRadius, rotationRad);
        const angle = ((180 - mod360(longitude) - 90) * Math.PI) / 180 - rotationRad;
        const iconExtent = (el.collisionSize ?? this.o.iconSize) + this.o.padding;
        const shapes: Placed[] = [{
          ...xy,
          angle: 0,
          halfWidth: iconExtent / 2,
          halfHeight: iconExtent / 2,
        }];
        if (el.label) {
          const labelPosition = this.toXY(longitude, symbolRadius - el.label.offset, rotationRad);
          shapes.push({
            ...labelPosition,
            angle,
            halfWidth: (el.label.length + this.o.padding) / 2,
            halfHeight: (el.label.width + this.o.padding) / 2,
          });
        }
        if (!this.collides(el.layer, shapes)) {
          chosen = { lane: c.lane, shift: c.shift, xy, longitude, shapes };
          break;
        }
      }
      if (chosen) break;
    }

    // Last resort (practically unreachable): original longitude on the last lane.
    if (!chosen) {
      const lane = maxLanes - 1;
      const longitude = mod360(el.longitude);
      const symbolRadius = this.symbolRadius(g, lane);
      const rotationRad = ((el.rotationDeg ?? 0) * Math.PI) / 180;
      const xy = this.toXY(longitude, symbolRadius, rotationRad);
      const angle = ((180 - mod360(longitude) - 90) * Math.PI) / 180 - rotationRad;
      const iconExtent = (el.collisionSize ?? this.o.iconSize) + this.o.padding;
      const shapes: Placed[] = [{
        ...xy,
        angle: 0,
        halfWidth: iconExtent / 2,
        halfHeight: iconExtent / 2,
      }];
      if (el.label) {
        const labelPosition = this.toXY(longitude, symbolRadius - el.label.offset, rotationRad);
        shapes.push({
          ...labelPosition,
          angle,
          halfWidth: (el.label.length + this.o.padding) / 2,
          halfHeight: (el.label.width + this.o.padding) / 2,
        });
      }
      chosen = { lane, shift: 0, xy, longitude, shapes };
      this.failures++;
    }

    this.placed[el.layer].push(...chosen.shapes);
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
