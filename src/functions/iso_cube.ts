// Pure layout math (no colour, no React) for the share page's ISO-CUBE panel:
// a vertical stack of `count` flat-2:1 isometric blocks, one per palette colour,
// block 0 on top. With unit `u` (half the top rhombus's bounding box — the
// rhombus is 2u wide, u tall) and face-height `c`, in a (2u × u+count·c) box:
//   block i's top rhombus is centred at (u, u/2 + i·c)
//   top   (cx,y0-u/2) (cx+u,y0) (cx,y0+u/2) (cx-u,y0)
//   left  (cx-u,y0) (cx,y0+u/2) (cx,y0+u/2+c) (cx-u,y0+c)
//   right (cx,y0+u/2) (cx+u,y0) (cx+u,y0+c) (cx,y0+u/2+c)
// so the front faces of block i end exactly where block i+1's top rhombus begins
// — the stack reads as one extruded bar of N colour-bands.

export interface IsoBlock {
  /** SVG `<polygon>` `points` strings for the three visible faces. */
  top: string;
  left: string;
  right: string;
}

export interface IsoStack {
  width: number;
  height: number;
  blocks: IsoBlock[];
}

export const isoBlockStack = (
  count: number,
  opts: { unit?: number; cube?: number } = {},
): IsoStack => {
  const u = opts.unit ?? 110;
  const c = opts.cube ?? 64;
  if (count <= 0) return { width: 0, height: 0, blocks: [] };
  const cx = u;
  const pts = (...p: [number, number][]): string =>
    p.map(([x, y]) => `${x},${y}`).join(" ");
  const blocks: IsoBlock[] = [];
  for (let i = 0; i < count; i++) {
    const y0 = u / 2 + i * c;
    blocks.push({
      top: pts([cx, y0 - u / 2], [cx + u, y0], [cx, y0 + u / 2], [cx - u, y0]),
      left: pts(
        [cx - u, y0],
        [cx, y0 + u / 2],
        [cx, y0 + u / 2 + c],
        [cx - u, y0 + c],
      ),
      right: pts(
        [cx, y0 + u / 2],
        [cx + u, y0],
        [cx + u, y0 + c],
        [cx, y0 + u / 2 + c],
      ),
    });
  }
  return { width: 2 * u, height: u + count * c, blocks };
};
