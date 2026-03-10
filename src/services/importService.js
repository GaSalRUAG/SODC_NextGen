import KMZService from "./kmzService";

export default class ImportService {
  constructor() {
    this.kmzService = new KMZService();
  }

  // Coordinates the full import process: KMZ → KML → Obstacles
  async loadObstaclesFromKMZ(file) {
    const kmzBuffer = await this.kmzService.readKmzFile(file);
    const kmlContent = await this.kmzService.extractKmlContent(kmzBuffer);
    return this.kmzService.parseObstaclesFromKml(kmlContent);
  }
}
