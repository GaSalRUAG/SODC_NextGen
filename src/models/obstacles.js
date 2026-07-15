// Domain model representing a single obstacle parsed from KML or AIXM
export default class Obstacle {
  constructor({
    id,
    longitude = null,
    latitude = null,
    altitude = null,
    height = null,
    geometryType = "point",
    coordinates = null,
    parentId = null,
    partIndex = null,
    heightKnown = false,
    altitudeKnown = false,
    obstacleType = null,
    lightingStatus = null,
    source = "aixm",
    merged = false,
  }) {
    this.id = id;
    this.geometryType = geometryType;
    this.parentId = parentId;
    this.partIndex = partIndex;
    this.source = source;
    this.merged = merged;
    this.altitude = altitude;
    this.height = height;
    this.obstacleType = obstacleType;
    this.lightingStatus = lightingStatus;

    this.altitudeKnown =
      altitudeKnown === true ||
      (altitudeKnown !== false && altitude != null && Number.isFinite(Number(altitude)));
    this.heightKnown =
      heightKnown === true ||
      (heightKnown !== false && height != null && Number.isFinite(Number(height)));

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
    } else if (geometryType === "line" && this.coordinates.length) {
      this.longitude = this.coordinates[0][0];
      this.latitude = this.coordinates[0][1];
    } else {
      this.longitude = longitude;
      this.latitude = latitude;
    }
  }
}
