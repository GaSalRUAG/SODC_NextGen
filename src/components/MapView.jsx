import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_CENTER = [46.8182, 8.2275];
const INITIAL_ZOOM = 9;
const MAP_STYLE_ID = "map-obstacle-map-styles";
const OBSTACLES_SOURCE_ID = "obstacles";
const OBSTACLES_LAYER_ID = "obstacles-circles";
const OBSTACLES_LINE_LAYER_ID = "obstacles-lines";

const OBSTACLE_CIRCLE_RADIUS_BY_ZOOM = [
  "interpolate",
  ["exponential", 1.35],
  ["zoom"],
  5,
  2,
  8,
  3.25,
  11,
  4.75,
  14,
  6.5,
  17,
  8.5,
  18,
  9.5,
];

const OBSTACLE_CIRCLE_STROKE_WIDTH_BY_ZOOM = [
  "interpolate",
  ["linear"],
  ["zoom"],
  5,
  0.85,
  11,
  1.15,
  18,
  1.85,
];

const OBSTACLE_LINE_WIDTH_BY_ZOOM = [
  "interpolate",
  ["linear"],
  ["zoom"],
  5,
  1.5,
  11,
  2.75,
  18,
  4.5,
];

const EMPTY_FEATURE_COLLECTION = { type: "FeatureCollection", features: [] };

const SWISSTOPO_TILE_URL =
  "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg";

const MAP_STYLE = {
  version: 8,
  sources: {
    swisstopo: {
      type: "raster",
      tiles: [SWISSTOPO_TILE_URL],
      tileSize: 256,
      maxzoom: 17,
      attribution:
        '<a href="https://www.swisstopo.admin.ch" target="_blank" rel="noreferrer">swisstopo</a>',
    },
    [OBSTACLES_SOURCE_ID]: {
      type: "geojson",
      data: EMPTY_FEATURE_COLLECTION,
    },
  },
  layers: [
    {
      id: "map-background",
      type: "background",
      paint: { "background-color": "#e5e7eb" },
    },
    { id: "swisstopo-layer", type: "raster", source: "swisstopo" },
    {
      id: OBSTACLES_LINE_LAYER_ID,
      type: "line",
      source: OBSTACLES_SOURCE_ID,
      filter: ["==", ["geometry-type"], "LineString"],
      paint: {
        "line-color": "#2563eb",
        "line-width": OBSTACLE_LINE_WIDTH_BY_ZOOM,
        "line-opacity": 0.92,
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    },
    {
      id: OBSTACLES_LAYER_ID,
      type: "circle",
      source: OBSTACLES_SOURCE_ID,
      filter: ["==", ["geometry-type"], "Point"],
      paint: {
        "circle-radius": OBSTACLE_CIRCLE_RADIUS_BY_ZOOM,
        "circle-color": "#e11d48",
        "circle-opacity": 0.94,
        "circle-stroke-width": OBSTACLE_CIRCLE_STROKE_WIDTH_BY_ZOOM,
        "circle-stroke-color": "#881337",
      },
    },
  ],
};

const INTERACTIVE_LAYER_IDS = [OBSTACLES_LAYER_ID, OBSTACLES_LINE_LAYER_ID];

function isValidLngLat(longitude, latitude) {
  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    Math.abs(longitude) <= 180 &&
    Math.abs(latitude) <= 90
  );
}

function getPointLngLat(obstacle) {
  let longitude = Number(obstacle.longitude);
  let latitude = Number(obstacle.latitude);

  if (isValidLngLat(longitude, latitude)) {
    return { longitude, latitude };
  }

  const coord = obstacle.coordinates?.[0];
  if (Array.isArray(coord) && coord.length >= 2) {
    longitude = Number(coord[0]);
    latitude = Number(coord[1]);
    if (isValidLngLat(longitude, latitude)) {
      return { longitude, latitude };
    }
  }

  return null;
}

function findObstacleById(obstacles, id) {
  if (!obstacles?.length || id == null) return null;
  return obstacles.find((obstacle) => String(obstacle.id) === String(id)) || null;
}

function formatOptionalNumber(value, unit = "m") {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return `${Number(value)} ${unit}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatObstaclePopupHtml(obstacle) {
  const rows = [
    ["ID", obstacle.id],
    ["Source", obstacle.source],
    ["Geometry", obstacle.geometryType],
    ["Altitude (AMSL)", formatOptionalNumber(obstacle.altitude)],
    ["Height", formatOptionalNumber(obstacle.height)],
    ["Type", obstacle.obstacleType || "—"],
    ["Lighting", obstacle.lightingStatus || "—"],
    ["Parent", obstacle.parentId || "—"],
    ["Part", obstacle.partIndex ?? "—"],
  ]
    .map(
      ([label, value]) =>
        `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  return `<div class="obstacle-popup"><table><tbody>${rows}</tbody></table></div>`;
}

function closeObstaclePopup(popupRef) {
  if (!popupRef?.current) return;
  popupRef.current.remove();
  popupRef.current = null;
}

function openObstaclePopup(map, obstacle, lngLat, popupRef) {
  if (!map || !obstacle || !lngLat) return;

  closeObstaclePopup(popupRef);

  const popup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: false,
    maxWidth: "280px",
    className: "obstacle-detail-popup",
  })
    .setLngLat(lngLat)
    .setHTML(formatObstaclePopupHtml(obstacle))
    .addTo(map);

  popupRef.current = popup;
}

function obstaclesToFeatureCollection(obstacles) {
  if (!obstacles?.length) return EMPTY_FEATURE_COLLECTION;

  const features = [];
  for (let index = 0; index < obstacles.length; index += 1) {
    const obstacle = obstacles[index];
    const geometryType = obstacle.geometryType === "line" ? "line" : "point";

    if (geometryType === "line") {
      const coordinates = (obstacle.coordinates || [])
        .map((pair) => [Number(pair[0]), Number(pair[1])])
        .filter(([longitude, latitude]) => isValidLngLat(longitude, latitude));
      if (coordinates.length < 2) continue;

      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates,
        },
        properties: {
          id: obstacle.id,
          geometryType: "line",
          altitude: obstacle.altitude,
          height: obstacle.height,
          obstacleType: obstacle.obstacleType,
          lightingStatus: obstacle.lightingStatus,
          parentId: obstacle.parentId,
          partIndex: obstacle.partIndex,
          source: obstacle.source,
        },
      });
      continue;
    }

    const point = getPointLngLat(obstacle);
    if (!point) continue;

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [point.longitude, point.latitude],
      },
      properties: {
        id: obstacle.id,
        geometryType: "point",
        altitude: obstacle.altitude,
        height: obstacle.height,
        obstacleType: obstacle.obstacleType,
        lightingStatus: obstacle.lightingStatus,
        parentId: obstacle.parentId,
        partIndex: obstacle.partIndex,
        source: obstacle.source,
      },
    });
  }

  return { type: "FeatureCollection", features };
}

function extendBoundsWithCoordinates(bounds, coordinates) {
  if (!coordinates?.length) return;

  if (typeof coordinates[0] === "number") {
    if (isValidLngLat(coordinates[0], coordinates[1])) {
      bounds.extend(coordinates);
    }
    return;
  }

  for (let index = 0; index < coordinates.length; index += 1) {
    extendBoundsWithCoordinates(bounds, coordinates[index]);
  }
}

function setObstacleSourceData(map, geojson) {
  const source = map.getSource(OBSTACLES_SOURCE_ID);
  if (source && typeof source.setData === "function") {
    source.setData(geojson);
  }
}

function whenMapReady(map, apply) {
  if (!map) return;

  const run = () => {
    if (!map.isStyleLoaded()) {
      map.once("styledata", run);
      return;
    }
    apply();
  };

  if (map.loaded()) {
    run();
    return;
  }

  map.once("load", run);
}

function resizeMapToContainer(map) {
  if (!map) return;
  try {
    map.resize();
  } catch {
    // Map may already be removed during teardown.
  }
}

function refreshMapTiles(map) {
  if (!map?.isStyleLoaded()) return;
  resizeMapToContainer(map);
  map.panBy([0.5, 0], { duration: 0 });
}

const MapView = forwardRef(function MapView(_, ref) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const obstaclesRef = useRef([]);
  const popupRef = useRef(null);
  const resizeTimerRef = useRef(null);
  const dataVersionRef = useRef(0);

  function syncObstaclesToMap(map) {
    const geojson = obstaclesToFeatureCollection(obstaclesRef.current);
    setObstacleSourceData(map, geojson);
    return geojson;
  }

  useEffect(() => {
    if (document.getElementById(MAP_STYLE_ID)) return;

    const styleTag = document.createElement("style");
    styleTag.id = MAP_STYLE_ID;
    styleTag.textContent = `
      .maplibregl-ctrl-bottom-right, .maplibregl-ctrl-bottom-left {
        display: none;
      }
      .obstacle-detail-popup .maplibregl-popup-content {
        padding: 10px 12px;
        border-radius: 6px;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.18);
      }
      .obstacle-detail-popup .maplibregl-popup-close-button {
        font-size: 16px;
        padding: 2px 6px;
        color: #475569;
      }
      .obstacle-popup table {
        border-collapse: collapse;
        width: 100%;
      }
      .obstacle-popup th,
      .obstacle-popup td {
        text-align: left;
        vertical-align: top;
        padding: 2px 0;
      }
      .obstacle-popup th {
        padding-right: 10px;
        font-weight: 600;
        color: #475569;
        white-space: nowrap;
      }
      .obstacle-popup td {
        word-break: break-word;
      }
    `;

    document.head.appendChild(styleTag);
  }, []);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapRef.current) return;

    let map = null;
    let resizeObserver = null;
    let cancelled = false;

    const scheduleResize = () => {
      clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => {
        if (!cancelled) {
          resizeMapToContainer(map);
        }
      }, 150);
    };

    const onObstacleLayerClick = (event) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: INTERACTIVE_LAYER_IDS.filter((layerId) => map.getLayer(layerId)),
      });
      const feature = features[0] || event.features?.[0];
      if (!feature) return;

      event.originalEvent?.stopPropagation?.();

      const obstacle = findObstacleById(
        obstaclesRef.current,
        feature.properties?.id,
      );
      if (!obstacle) return;

      openObstaclePopup(map, obstacle, event.lngLat, popupRef);
    };

    const onMapClick = (event) => {
      if (!map) return;
      const features = map.queryRenderedFeatures(event.point, {
        layers: INTERACTIVE_LAYER_IDS.filter((layerId) => map.getLayer(layerId)),
      });
      if (!features.length) {
        closeObstaclePopup(popupRef);
      }
    };

    const onObstacleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const onObstacleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const onEscapeKey = (event) => {
      if (event.key === "Escape") {
        closeObstaclePopup(popupRef);
      }
    };

    const initMap = () => {
      if (cancelled || !mapContainerRef.current || mapRef.current) return;

      map = new maplibregl.Map({
        container: mapContainerRef.current,
        center: [MAP_CENTER[1], MAP_CENTER[0]],
        zoom: INITIAL_ZOOM,
        minZoom: 5,
        maxZoom: 18,
        attributionControl: false,
        style: MAP_STYLE,
      });

      mapRef.current = map;

      map.on("error", (event) => {
        console.error("MapLibre error:", event.error);
      });

      for (let index = 0; index < INTERACTIVE_LAYER_IDS.length; index += 1) {
        const layerId = INTERACTIVE_LAYER_IDS[index];
        map.on("mouseenter", layerId, onObstacleMouseEnter);
        map.on("mouseleave", layerId, onObstacleMouseLeave);
      }
      // Single click handler avoids dual open when point+line overlap
      map.on("click", onObstacleLayerClick);
      map.on("click", onMapClick);
      document.addEventListener("keydown", onEscapeKey);

      const onMapReady = () => {
        resizeMapToContainer(map);
        syncObstaclesToMap(map);
        refreshMapTiles(map);
        setTimeout(() => {
          if (!cancelled) {
            resizeMapToContainer(map);
            refreshMapTiles(map);
          }
        }, 250);
      };

      map.once("load", onMapReady);

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(scheduleResize);
        resizeObserver.observe(container);
      }

      window.addEventListener("resize", scheduleResize);
      scheduleResize();
    };

    initMap();

    return () => {
      cancelled = true;
      clearTimeout(resizeTimerRef.current);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleResize);
      document.removeEventListener("keydown", onEscapeKey);
      closeObstaclePopup(popupRef);
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    resizeMap() {
      const map = mapRef.current;
      resizeMapToContainer(map);
      refreshMapTiles(map);
    },
    renderObstaclesMarkers(obstaclesList) {
      obstaclesRef.current = obstaclesList || [];
      const version = ++dataVersionRef.current;
      const map = mapRef.current;
      if (map?.isStyleLoaded()) {
        syncObstaclesToMap(map);
        return;
      }
      whenMapReady(map, () => {
        if (version !== dataVersionRef.current) return;
        syncObstaclesToMap(map);
      });
    },
    clearObstacleMarkers() {
      obstaclesRef.current = [];
      const version = ++dataVersionRef.current;
      closeObstaclePopup(popupRef);
      const map = mapRef.current;
      if (map?.isStyleLoaded()) {
        setObstacleSourceData(map, EMPTY_FEATURE_COLLECTION);
        return;
      }
      whenMapReady(map, () => {
        if (version !== dataVersionRef.current) return;
        setObstacleSourceData(map, EMPTY_FEATURE_COLLECTION);
      });
    },
    fitMapToObstacles(obstaclesList) {
      if (!obstaclesList?.length) return;
      const geojson = obstaclesToFeatureCollection(obstaclesList);
      if (!geojson.features.length) return;

      const map =
        mapRef.current ||
        (typeof window !== "undefined" ? window.__sodcMap : null);
      if (!map) return;

      let minLng = Infinity;
      let minLat = Infinity;
      let maxLng = -Infinity;
      let maxLat = -Infinity;

      const pushCoord = (longitude, latitude) => {
        if (!isValidLngLat(longitude, latitude)) return;
        minLng = Math.min(minLng, longitude);
        minLat = Math.min(minLat, latitude);
        maxLng = Math.max(maxLng, longitude);
        maxLat = Math.max(maxLat, latitude);
      };

      const walk = (coordinates) => {
        if (!coordinates?.length) return;
        if (typeof coordinates[0] === "number") {
          pushCoord(coordinates[0], coordinates[1]);
          return;
        }
        for (let index = 0; index < coordinates.length; index += 1) {
          walk(coordinates[index]);
        }
      };

      for (let index = 0; index < geojson.features.length; index += 1) {
        walk(geojson.features[index].geometry.coordinates);
      }

      if (!Number.isFinite(minLng) || !Number.isFinite(minLat)) return;

      try {
        map.resize();
        map.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          {
            padding: 80,
            maxZoom: 14,
            duration: 650,
          },
        );
      } catch (error) {
        console.warn("fitMapToObstacles failed:", error);
      }
    },
  }));

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        position: "relative",
      }}
    />
  );
});

export default MapView;
