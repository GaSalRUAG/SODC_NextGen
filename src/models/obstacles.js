// Domain model representing a single obstacle parsed from the KML file
export default class Obstacle {
  constructor({ id, longitude, latitude, altitude = null }) {
    this.id = id;
    this.longitude = longitude;
    this.latitude = latitude;
    this.altitude = altitude;
  }
}
