/**
 * ImportController
 * Steuert Import + Reset und verbindet Store, SidePanel und MapView.
 */
export default class ImportController {
  /**
   * @param {object} params
   * @param {import("../services/importService").default} params.importService
   * @param {import("../stores/obstacleStore").default} params.obstacleStore
   * @param {{ renderObstaclesMarkers: Function, clearObstacleMarkers: Function }} params.mapView
   * @param {{ setInfoMessage: Function, setErrorMessage: Function }} params.sidePanel
   */
  constructor({ importService, obstacleStore, mapView, sidePanel }) {
    this.importService = importService;
    this.obstacleStore = obstacleStore;
    this.mapView = mapView;
    this.sidePanel = sidePanel;
  }

  /**
   * Importiert eine KMZ Datei und zeigt Obstacles an.
   * Vor Import werden alte Daten gelöscht (diagramm-/flow-konform).
   * @param {File} file
   */
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

  /**
   * Löscht alle Obstacles (Store + Map + Messages).
   */
  resetObstacles() {
    this.obstacleStore.clear();
    this.mapView.clearObstacleMarkers();
    this.sidePanel.setErrorMessage("");
    this.sidePanel.setInfoMessage("");
  }
}
