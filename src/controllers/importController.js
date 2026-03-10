export default class ImportController {
  constructor({ importService, obstacleStore, mapView, sidePanel }) {
    this.importService = importService;
    this.obstacleStore = obstacleStore;
    this.mapView = mapView;
    this.sidePanel = sidePanel;
  }

  // Handles the KMZ import process and updates store, map and UI
  async importKmzFile(file) {
    try {
      this.resetObstacles();

      this.sidePanel.setErrorMessage("");
      this.sidePanel.setInfoMessage("Import läuft...");

      const obstacles = await this.importService.loadObstaclesFromKMZ(file);

      this.obstacleStore.setObstacles(obstacles);
      this.mapView.renderObstaclesMarkers(obstacles);

      this.sidePanel.setInfoMessage(`${obstacles.length} obstacles displayed`);
    } catch (error) {
      this.sidePanel.setInfoMessage("");
      this.sidePanel.setErrorMessage(error?.message || "Invalid KMZ");
      throw error;
    }
  }

  // Clears all obstacles from store, map and UI
  resetObstacles() {
    this.obstacleStore.clear();
    this.mapView.clearObstacleMarkers();
    this.sidePanel.setErrorMessage("");
    this.sidePanel.setInfoMessage("");
  }
}
