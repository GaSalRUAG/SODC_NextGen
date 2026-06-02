import Obstacle from "../models/obstacles";

const XSI_NS = "http://www.w3.org/2001/XMLSchema-instance";

/**
 * Heuristic lat/lon from a coordinate pair (AIXM/GML uses varying axis orders).
 */
function pairToLatLon(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (Math.abs(a) > 1e6 || Math.abs(b) > 1e6) return null;

  const isLat = (value) => Math.abs(value) <= 90;
  const isLon = (value) => Math.abs(value) <= 180;
  const swissLon = (value) => value >= 5.5 && value <= 11.5;
  const swissLat = (value) => value >= 45 && value <= 48.5;

  if (swissLon(a) && swissLat(b)) {
    return { longitude: a, latitude: b };
  }
  if (swissLat(a) && swissLon(b)) {
    return { longitude: b, latitude: a };
  }

  if (Math.abs(a) > 90 && isLat(b)) {
    return { longitude: a, latitude: b };
  }
  if (Math.abs(b) > 90 && isLat(a)) {
    return { longitude: b, latitude: a };
  }

  if (isLon(a) && isLat(b)) {
    return { longitude: a, latitude: b };
  }
  if (isLat(a) && isLon(b)) {
    return { longitude: b, latitude: a };
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

function collectByLocalName(root, localName) {
  const results = [];
  const stack = [root];
  while (stack.length) {
    const element = stack.pop();
    if (element.localName === localName) {
      results.push(element);
    }
    for (let index = 0; index < element.children.length; index += 1) {
      stack.push(element.children[index]);
    }
  }
  return results;
}

function findDescendant(root, localName) {
  const stack = [root];
  while (stack.length) {
    const element = stack.pop();
    if (element.localName === localName) {
      return element;
    }
    for (let index = 0; index < element.children.length; index += 1) {
      stack.push(element.children[index]);
    }
  }
  return null;
}

function findChildByLocalName(parent, localName) {
  for (let index = 0; index < parent.children.length; index += 1) {
    const child = parent.children[index];
    if (child.localName === localName) {
      return child;
    }
  }
  return null;
}

function isNil(element) {
  if (!element) return true;
  const nil =
    element.getAttribute("nil") ||
    element.getAttributeNS(XSI_NS, "nil");
  return nil === "true";
}

function parseNilableLength(element) {
  if (!element || isNil(element)) return null;
  const value = Number((element.textContent || "").trim());
  return Number.isFinite(value) ? value : null;
}

function isCrs84(element) {
  const srsName = (element?.getAttribute("srsName") || "").toUpperCase();
  return (
    srsName.includes("CRS84") ||
    srsName.includes("EPSG:4326") ||
    srsName.includes("EPSG::4326") ||
    srsName.includes("EPSG:4979") ||
    srsName.includes("WGS84") ||
    srsName.includes("URN:OGC:DEF:CRS:OGC:1.3:CRS84")
  );
}

function getCoordinateStep(element, numbers) {
  const ownDimension = Number(element?.getAttribute("srsDimension"));
  const parentDimension = Number(element?.parentElement?.getAttribute("srsDimension"));
  const dimension = Number.isFinite(ownDimension)
    ? ownDimension
    : Number.isFinite(parentDimension)
      ? parentDimension
      : null;

  if (dimension === 2 || dimension === 3) return dimension;
  if (numbers.length % 3 === 0) return 3;
  return 2;
}

function parsePosListToCoordinates(posListElement, crs84Preferred) {
  const numbers = collectNumbersFromPosList(posListElement?.textContent || "");
  if (numbers.length < 2) return [];

  const curveContainer =
    posListElement?.parentElement?.parentElement?.parentElement;
  const crs84 =
    crs84Preferred ||
    isCrs84(curveContainer) ||
    isCrs84(posListElement?.parentElement?.parentElement);

  const coordinates = [];
  const step = getCoordinateStep(posListElement, numbers);
  for (let index = 0; index + 1 < numbers.length; index += step) {
    const first = numbers[index];
    const second = numbers[index + 1];
    const pair = pairToLatLon(first, second);
    if (pair) {
      coordinates.push([pair.longitude, pair.latitude]);
      continue;
    }

    if (crs84 && Number.isFinite(first) && Number.isFinite(second)) {
      coordinates.push([first, second]);
    }
  }

  return coordinates;
}

function parsePosToCoordinate(posElement, crs84Preferred) {
  const numbers = collectNumbersFromPosList(posElement?.textContent || "");
  if (numbers.length < 2) return null;

  const pointContainer = posElement?.parentElement?.parentElement;
  const crs84 = crs84Preferred || isCrs84(pointContainer);

  const pair = pairToLatLon(numbers[0], numbers[1]);
  if (pair) {
    const coordinate = [pair.longitude, pair.latitude];
    return numbers.length >= 3 && Number.isFinite(numbers[2])
      ? { coordinate, altitude: numbers[2] }
      : { coordinate };
  }

  if (crs84 && Number.isFinite(numbers[0]) && Number.isFinite(numbers[1])) {
    const coordinate = [numbers[0], numbers[1]];
    return numbers.length >= 3 && Number.isFinite(numbers[2])
      ? { coordinate, altitude: numbers[2] }
      : { coordinate };
  }

  return null;
}

function findPartIndex(partElement) {
  const notes = collectByLocalName(partElement, "Note");
  for (let index = 0; index < notes.length; index += 1) {
    const note = notes[index];
    const purpose = findChildByLocalName(note, "purpose");
    const purposeText = (purpose?.textContent || "").trim();
    if (!purposeText.includes("SG_PARTIDX")) continue;

    const linguisticNote = findDescendant(note, "LinguisticNote") || note;
    const noteValue = findChildByLocalName(linguisticNote, "note");
    const partIndex = Number((noteValue?.textContent || "").trim());
    if (Number.isFinite(partIndex)) {
      return partIndex;
    }
  }
  return null;
}

function extractPartHeight(partElement, geometryElement) {
  let altitude = parseNilableLength(findChildByLocalName(partElement, "verticalExtent"));
  if (altitude == null && geometryElement) {
    altitude = parseNilableLength(findChildByLocalName(geometryElement, "elevation"));
  }

  return {
    altitude,
    heightKnown: altitude != null,
  };
}

function parseLinearExtent(partElement) {
  const extentElement = findChildByLocalName(
    partElement,
    "horizontalProjection_linearExtent",
  );
  if (!extentElement) return null;

  const curveElement =
    findDescendant(extentElement, "ElevatedCurve") || extentElement;
  const posListElement = findDescendant(extentElement, "posList");
  if (!posListElement) return null;

  const coordinates = parsePosListToCoordinates(
    posListElement,
    isCrs84(curveElement),
  );
  if (coordinates.length < 2) return null;

  const height = extractPartHeight(partElement, curveElement);
  return { coordinates, ...height, curveElement };
}

function parsePointProjection(partElement) {
  for (let index = 0; index < partElement.children.length; index += 1) {
    const child = partElement.children[index];
    if (child.localName !== "horizontalProjection") continue;

    const posElement = findDescendant(child, "pos");
    if (!posElement) continue;

    const pointContainer = findDescendant(child, "ElevatedPoint") || child;
    const parsed = parsePosToCoordinate(posElement, isCrs84(pointContainer));
    if (!parsed?.coordinate) continue;

    const height = extractPartHeight(partElement, pointContainer);
    let altitude = height.altitude;
    let heightKnown = height.heightKnown;

    if (parsed.altitude != null) {
      altitude = parsed.altitude;
      heightKnown = true;
    }

    return {
      coordinates: [parsed.coordinate],
      altitude,
      heightKnown,
    };
  }

  return null;
}

function getRepresentativePoint(coordinates) {
  if (!Array.isArray(coordinates) || !coordinates.length) return null;

  let longitudeSum = 0;
  let latitudeSum = 0;
  let count = 0;

  for (let index = 0; index < coordinates.length; index += 1) {
    const vertex = coordinates[index];
    if (!Array.isArray(vertex) || vertex.length < 2) continue;
    const longitude = Number(vertex[0]);
    const latitude = Number(vertex[1]);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) continue;
    longitudeSum += longitude;
    latitudeSum += latitude;
    count += 1;
  }

  if (!count) return null;

  return {
    longitude: longitudeSum / count,
    latitude: latitudeSum / count,
  };
}

function getStructureId(structureElement) {
  return (
    structureElement.getAttributeNS(
      "http://www.opengis.net/gml/3.2",
      "id",
    ) ||
    structureElement.getAttribute("gml:id") ||
    structureElement.getAttribute("id") ||
    null
  );
}

function parseVerticalStructureParts(xml) {
  const obstacles = [];
  const structures = collectByLocalName(xml.documentElement, "VerticalStructure");
  let idCounter = 0;

  for (let structureIndex = 0; structureIndex < structures.length; structureIndex += 1) {
    const structure = structures[structureIndex];
    const parentId = getStructureId(structure) || `structure-${structureIndex}`;
    const parts = collectByLocalName(structure, "VerticalStructurePart");

    for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
      const part = parts[partIndex];
      const sgPartIndex = findPartIndex(part);
      const linear = parseLinearExtent(part);
      const point = linear ? null : parsePointProjection(part);
      const geometry = linear || point;

      if (!geometry?.coordinates?.length) continue;

      idCounter += 1;
      const representativePoint = getRepresentativePoint(geometry.coordinates);
      if (!representativePoint) continue;

      obstacles.push(
        new Obstacle({
          id: `aixm-${idCounter}`,
          geometryType: "point",
          longitude: representativePoint.longitude,
          latitude: representativePoint.latitude,
          altitude: geometry.altitude,
          heightKnown: geometry.heightKnown,
          parentId,
          partIndex: sgPartIndex,
          source: "aixm",
        }),
      );
    }
  }

  return obstacles;
}

function* iterPosElements(doc) {
  const root = doc.documentElement;
  if (!root) return;

  const stack = [root];
  while (stack.length) {
    const element = stack.pop();
    for (let index = 0; index < element.children.length; index += 1) {
      stack.push(element.children[index]);
    }
    const localName = element.localName;
    if (localName === "pos" || localName === "posList") {
      yield element;
    }
  }
}

function parseGenericPositions(xml) {
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
        id: `aixm-fallback-${idCounter}`,
        longitude,
        latitude,
        geometryType: "point",
        heightKnown: false,
        source: "aixm",
      }),
    );
  };

  for (const element of iterPosElements(xml)) {
    const numbers = collectNumbersFromPosList(element.textContent || "");
    if (numbers.length < 2) continue;

    if (element.localName === "pos") {
      const pair = pairToLatLon(numbers[0], numbers[1]);
      if (pair) pushUnique(pair.latitude, pair.longitude);
      continue;
    }

    const step = getCoordinateStep(element, numbers);
    for (let index = 0; index + 1 < numbers.length; index += step) {
      const pair = pairToLatLon(numbers[index], numbers[index + 1]);
      if (pair) pushUnique(pair.latitude, pair.longitude);
    }
  }

  return obstacles;
}

export default class AIXMService {
  parseObstaclesFromAixmXml(xmlText) {
    const xml = new DOMParser().parseFromString(xmlText, "text/xml");

    if (xml.querySelector("parsererror")) {
      throw new Error("The AIXM/XML content could not be parsed.");
    }

    const structuredObstacles = parseVerticalStructureParts(xml);
    const obstacles = structuredObstacles.length
      ? structuredObstacles
      : parseGenericPositions(xml);

    if (!obstacles.length) {
      throw new Error(
        "No usable WGS84 coordinates were found in the AIXM file (expected VerticalStructure parts or gml:pos / gml:posList).",
      );
    }

    return obstacles;
  }
}
