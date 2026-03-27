import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MAP_CENTER = [46.8182, 8.2275];
const INITIAL_ZOOM = 9;
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

function getMarkerSizeByZoom(zoom) {
  if (zoom <= 7) return 5;
  if (zoom <= 10) return 7;
  if (zoom <= 13) return 9;
  return 11;
}

function ZoomEvents({ onZoomChange }) {
  useMapEvents({
    zoomend(event) {
      onZoomChange(event.target.getZoom());
    },
  });

  return null;
}

const MapView = forwardRef(function MapView(_, ref) {
  const [obstacles, setObstacles] = useState([]);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const markerSize = getMarkerSizeByZoom(zoom);
  const obstacleSquareIcon = useMemo(
    () =>
      L.divIcon({
        className: "obstacle-square-icon",
        html: "",
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      }),
    [markerSize],
  );

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
      <ZoomEvents onZoomChange={setZoom} />

      <style>
        {`
          .obstacle-square-icon {
            background: #2f45d3;
            border: 1px solid #ffffff;
            border-radius: 3px;
            box-sizing: border-box;
          }
        `}
      </style>

      {obstacles.map((obstacle) => (
        <Marker
          key={obstacle.id}
          position={[obstacle.latitude, obstacle.longitude]}
          icon={obstacleSquareIcon}
        />
      ))}
    </MapContainer>
  );
});

export default MapView;
