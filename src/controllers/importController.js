export default class ImportController {
  constructor({ importService, obstacleStore, getMapView, getSidePanel }) {
    this.importService = importService;
    this.obstacleStore = obstacleStore;
    this.getMapView = getMapView;
    this.getSidePanel = getSidePanel;
  }

  mapView() {
    const view = this.getMapView?.();
    return view ?? null;
  }

  sidePanel() {
    const panel = this.getSidePanel?.();
    return panel ?? null;
  }

  // Handles the KMZ import process and updates store, map and UI
  async importKmzFile(file) {
    try {
      this.resetObstacles();

      this.sidePanel()?.setErrorMessage("");

      const obstacles = await this.importService.loadObstaclesFromKMZ(file);

      this.obstacleStore.setObstacles(obstacles);
      const mapView = this.mapView();
      mapView?.renderObstaclesMarkers(obstacles);
      mapView?.fitMapToObstacles?.(obstacles);
    } catch (error) {
      this.sidePanel()?.setErrorMessage(error?.message || "Invalid KMZ");
      throw error;
    }
  }

  async importAixmFile(file) {
    try {
      this.resetObstacles();

      this.sidePanel()?.setErrorMessage("");

      const obstacles = await this.importService.loadObstaclesFromAIXM(file);

      this.obstacleStore.setObstacles(obstacles);
      const mapView = this.mapView();
      mapView?.renderObstaclesMarkers(obstacles);
      mapView?.fitMapToObstacles?.(obstacles);
    } catch (error) {
      this.sidePanel()?.setErrorMessage(error?.message || "Invalid AIXM");
      throw error;
    }
  }

  // Clears all obstacles from store, map and UI
  resetObstacles() {
    this.obstacleStore.clear();
    this.mapView()?.clearObstacleMarkers();
    this.sidePanel()?.setErrorMessage("");
  }
}
