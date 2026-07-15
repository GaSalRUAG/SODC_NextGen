import AIXMService from "./aixmService";
import KMZService from "./kmzService";

export default class ImportService {
  constructor() {
    this.kmzService = new KMZService();
    this.aixmService = new AIXMService();
  }

  // Coordinates the full import process: KMZ → KML → Obstacles
  async loadObstaclesFromKMZ(file) {
    const kmzBuffer = await this.kmzService.readKmzFile(file);
    const kmlContent = await this.kmzService.extractKmlContent(kmzBuffer);
    const obstacles = this.kmzService.parseObstaclesFromKml(kmlContent);
    return {
      obstacles,
      warnings: [],
      importedCount: obstacles.length,
      skippedCount: 0,
    };
  }

  async loadObstaclesFromAIXM(file) {
    const xmlText = await file.text();
    return this.aixmService.parseObstaclesFromAixmXml(xmlText);
  }
}
