/**
 * Store für Obstacles (zentrale Datenhaltung).
 */
export default class ObstacleStore {
  constructor() {
    this.obstacles = [];
    this.subscribers = new Set();
  }

  clear() {
    this.obstacles = [];
    this.notify();
  }

  /**
   * @param {import("../models/Obstacle").default[]} obstacles
   */
  setObstacles(obstacles) {
    this.obstacles = obstacles;
    this.notify();
  }

  getObstacles() {
    return this.obstacles;
  }

  hasObstacles() {
    return this.obstacles.length > 0;
  }

  /**
   * @param {() => void} callback
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach((cb) => cb());
  }
}
