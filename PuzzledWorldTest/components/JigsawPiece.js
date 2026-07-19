import React, { useMemo } from 'react';

import Svg, {
  ClipPath,
  Defs,
  Image as SvgImage,
  Path,
  Rect,
} from 'react-native-svg';


const PAD = 29;
const CELL = 100;
const END = PAD + CELL;

export const PIECE_BOX_SCALE = (CELL + 2 * PAD) / CELL;
export const PIECE_PADDING_RATIO = PAD / CELL;


// Classic jigsaw tab shape: six key points per edge (a slight inward
// "shoulder" dip right before the tab, then the round bulb, mirrored back)
// run through a clamped cubic B-spline. A B-spline stays inside the control
// points' neighborhood instead of passing through them like a Catmull-Rom/
// bezier interpolation would, which is what keeps the curve from crossing
// itself at the sharp reversal near the neck.
//
// All four edges are generated from this SAME local curve, rotated into
// place per edge, instead of four hand-derived copies. That matters because
// a piece's tab and its neighbor's matching socket are literally the same
// local curve (tab uses type=1, socket uses type=-1) traced in opposite
// directions - deriving them independently makes it easy for the two to
// silently stop matching, so pieces wouldn't actually interlock even though
// each one looks fine in isolation.
const RAW_POINTS = [
  [0, 0],
  [60, -7],
  [22, 29],
  [78, 29],
  [40, -7],
  [100, 0],
];


// A proper bit-mixing hash (squirrel-noise style), not the previous
// `(row * a + col * b + c) % 2`. That formula collapsed to a plain
// (row + col) parity check regardless of the constants chosen, since
// every constant involved was odd - it produced a perfect checkerboard
// where a piece's top/bottom/left/right all pointed the same way and
// every piece looked identical to its diagonal neighbors. Salting with
// a different `axis` value per call decorrelates horizontal from
// vertical edges, so a piece can freely have one side in and the
// opposite side out instead of a rigid alternating grid.
function edgeHash(row, col, axis) {
  let h = (row * 374761393) ^ (col * 668265263) ^ (axis * 2246822519);

  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = (h ^ (h >>> 16)) >>> 0;

  return h;
}


function horizontalEdge(row, col) {
  return edgeHash(row, col, 1) % 2 === 0
    ? 1
    : -1;
}


function verticalEdge(row, col) {
  return edgeHash(row, col, 2) % 2 === 0
    ? 1
    : -1;
}


function getEdges(piece, size) {
  const row = Math.floor(piece / size);
  const col = piece % size;

  return {
    top:
      row === 0
        ? 0
        : -verticalEdge(row - 1, col),

    right:
      col === size - 1
        ? 0
        : horizontalEdge(row, col),

    bottom:
      row === size - 1
        ? 0
        : verticalEdge(row, col),

    left:
      col === 0
        ? 0
        : -horizontalEdge(row, col - 1),
  };
}


// Local frame: baseline runs from (0, 0) to (CELL, 0). Outward (away from
// the piece body) is -y. type=1 (tab) bulges outward; type=-1 (blank)
// bulges inward, tracing the exact same curve a neighboring tab would.
function localPoints(type) {
  const d = type === 0 ? 0 : -type;

  return RAW_POINTS.map(([x, y]) => [x, d * y]);
}


// Clamped uniform cubic B-spline -> bezier segments. Clamping (tripling the
// endpoints) makes the curve actually touch the first/last point instead of
// just approaching them, so edges connect exactly to the piece's corners.
function bsplineToBezier(points) {
  const q = [points[0], points[0], ...points, points[points.length - 1], points[points.length - 1]];
  const segments = [];

  for (let i = 0; i < q.length - 3; i++) {
    const [p0, p1, p2, p3] = [q[i], q[i + 1], q[i + 2], q[i + 3]];

    segments.push([
      [(p0[0] + 4 * p1[0] + p2[0]) / 6, (p0[1] + 4 * p1[1] + p2[1]) / 6],
      [(2 * p1[0] + p2[0]) / 3, (2 * p1[1] + p2[1]) / 3],
      [(p1[0] + 2 * p2[0]) / 3, (p1[1] + 2 * p2[1]) / 3],
      [(p1[0] + 4 * p2[0] + p3[0]) / 6, (p1[1] + 4 * p2[1] + p3[1]) / 6],
    ]);
  }

  return segments;
}


// Each edge is the local frame above, rotated (never reflected, so the
// sweep flag stays valid) and translated to that edge's starting corner.
const EDGES = {
  top: {
    origin: [PAD, PAD],
    rotate: ([x, y]) => [x, y],
  },
  right: {
    origin: [END, PAD],
    rotate: ([x, y]) => [-y, x],
  },
  bottom: {
    origin: [END, END],
    rotate: ([x, y]) => [-x, -y],
  },
  left: {
    origin: [PAD, END],
    rotate: ([x, y]) => [y, -x],
  },
};


function toWorld(edge, point) {
  const [rx, ry] = edge.rotate(point);
  return [edge.origin[0] + rx, edge.origin[1] + ry];
}


function edgePath(edgeName, type) {
  const edge = EDGES[edgeName];

  if (type === 0) {
    const far = toWorld(edge, [CELL, 0]);
    return `L ${far[0]} ${far[1]}`;
  }

  const segments = bsplineToBezier(localPoints(type));

  return segments
    .map(([, c1, c2, end]) => {
      const c1w = toWorld(edge, c1);
      const c2w = toWorld(edge, c2);
      const endW = toWorld(edge, end);

      return `C ${c1w[0]} ${c1w[1]} ${c2w[0]} ${c2w[1]} ${endW[0]} ${endW[1]}`;
    })
    .join(' ');
}


function makePath(edges) {
  return `
    M ${PAD} ${PAD}

    ${edgePath('top', edges.top)}

    ${edgePath('right', edges.right)}

    ${edgePath('bottom', edges.bottom)}

    ${edgePath('left', edges.left)}

    Z
  `;
}


export default function JigsawPiece({
  piece,
  image,
  size,
  displaySize,
  letterboxColor = '#0b0f1e',
}) {
  const row = Math.floor(piece / size);
  const col = piece % size;

  const edges = useMemo(
    () => getEdges(piece, size),
    [piece, size]
  );

  const path = useMemo(
    () => makePath(edges),
    [edges]
  );

  const visualSize =
    displaySize * PIECE_BOX_SCALE;

  const imageSize =
    size * CELL;

  const imageX =
    PAD - col * CELL;

  const imageY =
    PAD - row * CELL;

  const clipId =
    `jigsaw-piece-${piece}-${size}`;

  return (
    <Svg
      width={visualSize}
      height={visualSize}
      viewBox={`0 0 ${CELL + 2 * PAD} ${CELL + 2 * PAD}`}
    >
      <Defs>
        <ClipPath id={clipId}>
          <Path d={path} />
        </ClipPath>
      </Defs>

      <Rect
        x={0}
        y={0}
        width={CELL + 2 * PAD}
        height={CELL + 2 * PAD}
        fill={letterboxColor}
        clipPath={`url(#${clipId})`}
      />

      <SvgImage
        href={image}
        x={imageX}
        y={imageY}
        width={imageSize}
        height={imageSize}
        preserveAspectRatio="xMidYMid meet"
        clipPath={`url(#${clipId})`}
      />
    </Svg>
  );
}
