import KMZService from "./kmzService";

/**
 * ImportService
 * Orchestriert den Import-Prozess über KMZService.
 */
export default class ImportService {
  constructor() {
    this.kmzService = new KMZService();
  }

  /**
   * @param {File} file
   * @returns {Promise<import("../models/Obstacle").default[]>}
   */
  async loadObstaclesFromKMZ(file) {
    const kmzBuffer = await this.kmzService.readKmzFile(file);
    const kmlContent = await this.kmzService.extractKmlContent(kmzBuffer);
    return this.kmzService.parseObstaclesFromKml(kmlContent);
  }
}
