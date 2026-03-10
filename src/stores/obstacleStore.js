/**
 * Central store for managing obstacle data.
 * Stores all obstacles and notifies subscribers when data changes.
 */
export default class ObstacleStore {
  constructor() {
    // Array containing all imported obstacles
    this.obstacles = [];

    // Set of subscriber callback functions
    this.subscribers = new Set();
  }

  /**
   * Removes all stored obstacles.
   */
  clear() {
    this.obstacles = [];
    this.notify();
  }

  /**
   * Replaces the current obstacle list with a new one.
   * @param {import("../models/Obstacle").default[]} obstacles Array of obstacle objects
   */
  setObstacles(obstacles) {
    this.obstacles = obstacles;
    this.notify();
  }

  /**
   * Returns all stored obstacles.
   * @returns {Array}
   */
  getObstacles() {
    return this.obstacles;
  }

  /**
   * Checks if any obstacles are stored.
   * @returns {boolean}
   */
  hasObstacles() {
    return this.obstacles.length > 0;
  }

  /**
   * Registers a subscriber that will be notified when the data changes.
   * @param {() => void} callback Function to call on updates
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback);

    // Return function to remove subscriber again
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notifies all subscribers about data changes.
   */
  notify() {
    this.subscribers.forEach((cb) => cb());
  }
}
