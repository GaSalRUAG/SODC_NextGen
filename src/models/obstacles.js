/**
 * Domain Model: Obstacle
 * Repräsentiert ein einzelnes Obstacle (Point) aus der KML.
 */
export default class Obstacle {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {number} params.longitude
   * @param {number} params.latitude
   * @param {number|null} params.altitude
   */
  constructor({ id, longitude, latitude, altitude = null }) {
    this.id = id;
    this.longitude = longitude;
    this.latitude = latitude;
    this.altitude = altitude;
  }
}
