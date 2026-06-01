import Obstacle from "../models/obstacles";

const COORD_TOLERANCE = 1e-6;

function coordsEqual(a, b) {
  return (
    Math.abs(a[0] - b[0]) < COORD_TOLERANCE &&
    Math.abs(a[1] - b[1]) < COORD_TOLERANCE
  );
}

function comparePartIndex(a, b) {
  const left = a.partIndex ?? Number.POSITIVE_INFINITY;
  const right = b.partIndex ?? Number.POSITIVE_INFINITY;
  return left - right;
}

function chainSegments(segments) {
  if (!segments.length) return [];

  const remaining = segments.map((segment) => [...segment.coordinates]);
  const chains = [];

  while (remaining.length) {
    let coords = remaining.shift();
    let extended = true;

    while (extended) {
      extended = false;

      for (let index = remaining.length - 1; index >= 0; index -= 1) {
        const segment = remaining[index];
        const start = segment[0];
        const end = segment[segment.length - 1];

        if (coordsEqual(coords[coords.length - 1], start)) {
          coords = coords.concat(segment.slice(1));
          remaining.splice(index, 1);
          extended = true;
        } else if (coordsEqual(coords[coords.length - 1], end)) {
          coords = coords.concat([...segment].reverse().slice(1));
          remaining.splice(index, 1);
          extended = true;
        } else if (coordsEqual(coords[0], end)) {
          coords = segment.slice(0, -1).concat(coords);
          remaining.splice(index, 1);
          extended = true;
        } else if (coordsEqual(coords[0], start)) {
          coords = [...segment].reverse().slice(1).concat(coords);
          remaining.splice(index, 1);
          extended = true;
        }
      }
    }

    chains.push(coords);
  }

  return chains;
}

function mergeSegmentsForParent(parentId, segments) {
  const sorted = [...segments].sort(comparePartIndex);
  const chains = chainSegments(sorted);

  return chains.map((coordinates, index) => {
    const knownHeights = sorted
      .map((segment) => segment.altitude)
      .filter((altitude) => Number.isFinite(altitude));

    return new Obstacle({
      id: `merged-${parentId}-${index}`,
      geometryType: "line",
      coordinates,
      parentId,
      altitude: knownHeights.length ? Math.max(...knownHeights) : null,
      heightKnown: sorted.some((segment) => segment.heightKnown),
      source: "aixm",
      merged: true,
    });
  });
}

/**
 * Replaces line segments with merged polylines per parent VerticalStructure.
 * Point obstacles are kept unchanged.
 */
export function applyLineMerge(obstacles, mergeEnabled) {
  if (!mergeEnabled) return obstacles;

  const points = obstacles.filter((obstacle) => obstacle.geometryType === "point");
  const lineSegments = obstacles.filter(
    (obstacle) => obstacle.geometryType === "line" && !obstacle.merged,
  );

  const linesByParent = new Map();
  const orphanLines = [];

  for (let index = 0; index < lineSegments.length; index += 1) {
    const segment = lineSegments[index];
    if (!segment.parentId) {
      orphanLines.push(segment);
      continue;
    }

    if (!linesByParent.has(segment.parentId)) {
      linesByParent.set(segment.parentId, []);
    }
    linesByParent.get(segment.parentId).push(segment);
  }

  const mergedLines = [];
  for (const [parentId, segments] of linesByParent) {
    mergedLines.push(...mergeSegmentsForParent(parentId, segments));
  }

  return [...points, ...orphanLines, ...mergedLines];
}
