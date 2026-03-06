import React, { forwardRef, useImperativeHandle, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MAP_CENTER = [46.8182, 8.2275];
const INITIAL_ZOOM = 9;
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const MapView = forwardRef(function MapView(_, ref) {
  const [obstacles, setObstacles] = useState([]);

  useImperativeHandle(ref, () => ({
    renderObstaclesMarkers(obstaclesList) {
      setObstacles(obstaclesList);
    },
    clearObstacleMarkers() {
      setObstacles([]);
    },
  }));

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={INITIAL_ZOOM}
      minZoom={5}
      maxZoom={18}
      zoomControl={false}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer url={TILE_URL} />

      {obstacles.map((o) => (
        <Marker key={o.id} position={[o.latitude, o.longitude]} />
      ))}
    </MapContainer>
  );
});

export default MapView;
