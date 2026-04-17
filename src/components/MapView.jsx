import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MAP_CENTER = [46.8182, 8.2275];
const INITIAL_ZOOM = 9;
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ICON_CACHE = new Map();
const SWITZERLAND_BOUNDS = {
  south: 45.7,
  north: 47.8,
  west: 5.9,
  east: 10.6,
};
const SWITZERLAND_BOUNDS_MARGIN = 0.25;

function getGridMultiplierByCount(count) {
  if (count >= 7000) return 3.2;
  if (count >= 3500) return 2.6;
  if (count >= 1500) return 2;
  if (count >= 500) return 1.45;
  return 1;
}

function getGridSizeByZoom(zoom) {
  if (zoom >= 14) return 0;
  if (zoom >= 12) return 0.01;
  if (zoom >= 10) return 0.02;
  if (zoom >= 8) return 0.05;
  return 0.09;
}

function getClusterBudgetByZoom(zoom) {
  if (zoom >= 14) return 3500;
  if (zoom >= 12) return 2200;
  if (zoom >= 10) return 1400;
  if (zoom >= 8) return 900;
  return 600;
}

function getClusterVisualStyle(count) {
  if (count >= 80) return { size: 30, color: "#b91c1c" };
  if (count >= 40) return { size: 26, color: "#dc2626" };
  if (count >= 15) return { size: 22, color: "#f97316" };
  return { size: 18, color: "#ef4444" };
}

function getClusterLabel(count) {
  if (count >= 999) return "999+";
  if (count >= 100) return "99+";
  return String(count);
}

function getObstacleIcon(count = 1) {
  const isCluster = count > 1;
  const clusterStyle = isCluster
    ? getClusterVisualStyle(count)
    : { size: 12, color: "#ef4444" };
  const label = isCluster ? getClusterLabel(count) : "";
  const key = `${clusterStyle.size}-${clusterStyle.color}-${label || "single"}`;
  if (ICON_CACHE.has(key)) return ICON_CACHE.get(key);

  const html = isCluster
    ? `<div class="obstacle-marker obstacle-marker--cluster" style="width:${clusterStyle.size}px;height:${clusterStyle.size}px;background:${clusterStyle.color};">${label}</div>`
    : `<div class="obstacle-marker obstacle-marker--single" style="width:${clusterStyle.size}px;height:${clusterStyle.size}px;background:${clusterStyle.color};"><span class="obstacle-marker__dot"></span></div>`;

  const icon = L.divIcon({
    className: "obstacle-marker-icon",
    html,
    iconSize: [clusterStyle.size, clusterStyle.size],
    iconAnchor: [clusterStyle.size / 2, clusterStyle.size / 2],
  });
  ICON_CACHE.set(key, icon);
  return icon;
}

function ZoomTracker({ onZoomChange }) {
  useMapEvents({
    zoomend(event) {
      onZoomChange(event.target.getZoom());
    },
  });
  return null;
}

function FullSwitzerlandTracker({ onFullViewChange }) {
  const map = useMap();

  const checkFullView = () => {
    const bounds = map.getBounds();
    const south = bounds.getSouth();
    const north = bounds.getNorth();
    const west = bounds.getWest();
    const east = bounds.getEast();

    const isFullSwitzerland =
      south <= SWITZERLAND_BOUNDS.south + SWITZERLAND_BOUNDS_MARGIN &&
      north >= SWITZERLAND_BOUNDS.north - SWITZERLAND_BOUNDS_MARGIN &&
      west <= SWITZERLAND_BOUNDS.west + SWITZERLAND_BOUNDS_MARGIN &&
      east >= SWITZERLAND_BOUNDS.east - SWITZERLAND_BOUNDS_MARGIN;

    onFullViewChange(isFullSwitzerland);
  };

  useEffect(() => {
    checkFullView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMapEvents({
    moveend(event) {
      checkFullView();
    },
    zoomend(event) {
      checkFullView();
    },
  });

  return null;
}

const MapView = forwardRef(function MapView(_, ref) {
  const [obstacles, setObstacles] = useState([]);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [isFullSwitzerlandView, setIsFullSwitzerlandView] = useState(false);

  useImperativeHandle(ref, () => ({
    renderObstaclesMarkers(obstaclesList) {
      setObstacles(obstaclesList);
    },
    clearObstacleMarkers() {
      setObstacles([]);
    },
  }));

  const markersToRender = useMemo(() => {
    if (!obstacles.length) return [];
    // Clustering komplett deaktivieren (nur rot pro Obstacle).
    if (!isFullSwitzerlandView) {
      return obstacles.map((item) => ({
        id: item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        count: 1,
      }));
    }

    // Nur wenn die ganze Schweiz sichtbar ist: grob zusammenfassen.
    const gridSize =
      getGridSizeByZoom(zoom) *
      getGridMultiplierByCount(obstacles.length) *
      1.9;
    if (gridSize === 0) {
      return obstacles.map((item) => ({
        id: item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        count: 1,
      }));
    }

    const cells = new Map();
    for (let index = 0; index < obstacles.length; index += 1) {
      const obstacle = obstacles[index];
      const latCell = Math.floor(obstacle.latitude / gridSize);
      const lonCell = Math.floor(obstacle.longitude / gridSize);
      const key = `${latCell}:${lonCell}`;
      const current = cells.get(key);

      if (!current) {
        cells.set(key, {
          id: key,
          latitudeSum: obstacle.latitude,
          longitudeSum: obstacle.longitude,
          count: 1,
        });
      } else {
        current.latitudeSum += obstacle.latitude;
        current.longitudeSum += obstacle.longitude;
        current.count += 1;
      }
    }

    const clustered = [];
    cells.forEach((cell) => {
      clustered.push({
        id: cell.id,
        latitude: cell.latitudeSum / cell.count,
        longitude: cell.longitudeSum / cell.count,
        count: cell.count,
      });
    });

    const coarseBudget = Math.max(
      160,
      Math.floor(getClusterBudgetByZoom(zoom) * 0.22),
    );
    if (clustered.length <= coarseBudget) return clustered;

    const sampledClusters = [];
    const step = Math.ceil(clustered.length / coarseBudget);
    for (let index = 0; index < clustered.length; index += step) {
      sampledClusters.push(clustered[index]);
    }
    return sampledClusters;
  }, [obstacles, zoom, isFullSwitzerlandView]);

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={INITIAL_ZOOM}
      minZoom={5}
      maxZoom={18}
      zoomControl={false}
      style={{ width: "100%", height: "100%" }}
    >
      <ZoomTracker onZoomChange={setZoom} />
      <FullSwitzerlandTracker onFullViewChange={setIsFullSwitzerlandView} />
      <TileLayer url={TILE_URL} />

      {markersToRender.map((obstacle) => (
        <Marker
          key={obstacle.id}
          position={[obstacle.latitude, obstacle.longitude]}
          icon={getObstacleIcon(obstacle.count)}
        />
      ))}
    </MapContainer>
  );
});

export default MapView;
