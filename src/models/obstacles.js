// Domain model representing a single obstacle parsed from KML or AIXM
export default class Obstacle {
  constructor({
    id,
    longitude = null,
    latitude = null,
    altitude = null,
    geometryType = "point",
    coordinates = null,
    parentId = null,
    partIndex = null,
    heightKnown = false,
    source = "aixm",
    merged = false,
  }) {
    this.id = id;
    this.geometryType = geometryType;
    this.parentId = parentId;
    this.partIndex = partIndex;
    this.heightKnown = heightKnown;
    this.source = source;
    this.merged = merged;
    this.altitude = altitude;

    if (coordinates?.length) {
      this.coordinates = coordinates;
    } else if (
      Number.isFinite(longitude) &&
      Number.isFinite(latitude)
    ) {
      this.coordinates = [[longitude, latitude]];
    } else {
      this.coordinates = [];
    }

    if (geometryType === "point" && this.coordinates.length) {
      this.longitude = this.coordinates[0][0];
      this.latitude = this.coordinates[0][1];
    } else {
      this.longitude = longitude;
      this.latitude = latitude;
    }
  }
}
