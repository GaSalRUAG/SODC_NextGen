import JSZip from "jszip";
import Obstacle from "../models/obstacles";

/**
 * KMZService
 * - liest KMZ
 * - extrahiert KML Content
 * - parsed Obstacles aus KML (Point Placemarks)
 */
export default class KMZService {
  /**
   * @param {File} file
   * @returns {Promise<ArrayBuffer>}
   */
  async readKmzFile(file) {
    return file.arrayBuffer();
  }

  /**
   * @param {ArrayBuffer} kmzBuffer
   * @returns {Promise<string>}
   */
  async extractKmlContent(kmzBuffer) {
    const zip = await JSZip.loadAsync(kmzBuffer);

    const kmlEntry = Object.keys(zip.files).find((name) =>
      name.toLowerCase().endsWith(".kml"),
    );

    if (!kmlEntry) {
      throw new Error("Invalid KMZ: keine .kml Datei gefunden.");
    }

    return zip.files[kmlEntry].async("text");
  }

  /**
   * @param {string} kmlContent
   * @returns {Obstacle[]}
   */
  parseObstaclesFromKml(kmlContent) {
    const xml = new DOMParser().parseFromString(kmlContent, "text/xml");

    if (xml.querySelector("parsererror")) {
      throw new Error("Invalid KMZ: KML konnte nicht gelesen werden.");
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

      const parts = raw.split(",").map((v) => v.trim());
      if (parts.length < 2) return;

      const longitude = Number(parts[0]);
      const latitude = Number(parts[1]);
      const altitude = parts.length >= 3 ? Number(parts[2]) : null;

      if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;

      obstacles.push(
        new Obstacle({
          id: `obstacle-${index}`,
          longitude,
          latitude,
          altitude: Number.isFinite(altitude) ? altitude : null,
        }),
      );
    });

    return obstacles;
  }
}
