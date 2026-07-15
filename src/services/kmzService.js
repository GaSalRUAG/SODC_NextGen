import JSZip from "jszip";
import Obstacle from "../models/obstacles";

export default class KMZService {
  async readKmzFile(file) {
    return file.arrayBuffer();
  }

  async extractKmlContent(kmzBuffer) {
    let zip;

    try {
      zip = await JSZip.loadAsync(kmzBuffer);
    } catch {
      throw new Error("The selected file is not a valid KMZ file.");
    }

    const kmlEntry = Object.keys(zip.files).find((name) =>
      name.toLowerCase().endsWith(".kml"),
    );

    if (!kmlEntry) {
      throw new Error("The KMZ file does not contain a KML file.");
    }

    return zip.files[kmlEntry].async("text");
  }

  parseObstaclesFromKml(kmlContent) {
    const xml = new DOMParser().parseFromString(kmlContent, "text/xml");

    if (xml.querySelector("parsererror")) {
      throw new Error("The KML content could not be parsed.");
    }

    const placemarks = Array.from(xml.getElementsByTagName("Placemark"));
    const obstacles = [];

    placemarks.forEach((placemark, index) => {
      const point = placemark.getElementsByTagName("Point")[0];
      if (!point) return;

      const coordinatesNode = point.getElementsByTagName("coordinates")[0];
      if (!coordinatesNode) return;

      const raw = (coordinatesNode.textContent || "").trim();
      if (!raw) return;

      const parts = raw.split(",").map((value) => value.trim());
      if (parts.length < 2) return;

      const longitude = Number(parts[0]);
      const latitude = Number(parts[1]);
      const altitude = parts.length >= 3 ? Number(parts[2]) : null;

      if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;

      const parsedAltitude = Number.isFinite(altitude) ? altitude : null;

      obstacles.push(
        new Obstacle({
          id: `obstacle-${index}`,
          longitude,
          latitude,
          altitude: parsedAltitude,
          height: null,
          geometryType: "point",
          altitudeKnown: parsedAltitude != null,
          heightKnown: false,
          source: "kmz",
        }),
      );
    });

    return obstacles;
  }
}
