import Obstacle from "../models/obstacles";

/**
 * Heuristic lat/lon from a coordinate pair (AIXM/GML uses varying axis orders).
 */
function pairToLatLon(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (Math.abs(a) > 1e6 || Math.abs(b) > 1e6) return null;

  if (Math.abs(a) <= 90 && Math.abs(b) <= 180) {
    if (b >= 43 && b <= 50 && a >= 4 && a <= 15) return { latitude: b, longitude: a };
    if (a >= 43 && a <= 50 && b >= 4 && b <= 15) return { latitude: a, longitude: b };
    return { latitude: a, longitude: b };
  }

  return null;
}

function collectNumbersFromPosList(text) {
  return text
    .trim()
    .split(/\s+/)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

function* iterPosElements(doc) {
  const root = doc.documentElement;
  if (!root) return;

  const stack = [root];
  while (stack.length) {
    const el = stack.pop();
    for (let index = 0; index < el.children.length; index += 1) {
      stack.push(el.children[index]);
    }
    const localName = el.localName;
    if (localName === "pos" || localName === "posList") {
      yield el;
    }
  }
}

export default class AIXMService {
  parseObstaclesFromAixmXml(xmlText) {
    const xml = new DOMParser().parseFromString(xmlText, "text/xml");

    if (xml.querySelector("parsererror")) {
      throw new Error("The AIXM/XML content could not be parsed.");
    }

    const obstacles = [];
    const seen = new Set();
    let idCounter = 0;

    const pushUnique = (latitude, longitude) => {
      const key = `${latitude.toFixed(6)}:${longitude.toFixed(6)}`;
      if (seen.has(key)) return;
      seen.add(key);
      idCounter += 1;
      obstacles.push(
        new Obstacle({
          id: `aixm-${idCounter}`,
          longitude,
          latitude,
        }),
      );
    };

    for (const el of iterPosElements(xml)) {
      const numbers = collectNumbersFromPosList(el.textContent || "");
      if (numbers.length < 2) continue;

      if (el.localName === "pos") {
        const pair = pairToLatLon(numbers[0], numbers[1]);
        if (pair) pushUnique(pair.latitude, pair.longitude);
        continue;
      }

      for (let index = 0; index + 1 < numbers.length; index += 2) {
        const pair = pairToLatLon(numbers[index], numbers[index + 1]);
        if (pair) pushUnique(pair.latitude, pair.longitude);
      }
    }

    if (!obstacles.length) {
      throw new Error(
        "No usable WGS84 coordinates were found in the AIXM file (expected gml:pos / gml:posList).",
      );
    }

    return obstacles;
  }
}
