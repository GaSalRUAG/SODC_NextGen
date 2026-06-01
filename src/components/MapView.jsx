import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_CENTER = [46.8182, 8.2275];
const INITIAL_ZOOM = 9;
const MAP_STYLE_ID = "map-obstacle-map-styles";
const OBSTACLES_SOURCE_ID = "obstacles";
const OBSTACLES_LAYER_ID = "obstacles-circles";
const OBSTACLES_LINES_LAYER_ID = "obstacles-lines";

const OBSTACLE_LINE_WIDTH_BY_ZOOM = [
  "interpolate",
  ["linear"],
  ["zoom"],
  5,
  2,
  9,
  3,
  11,
  3.5,
  14,
  5.5,
  18,
  8,
];

const OBSTACLE_CIRCLE_RADIUS_BY_ZOOM = [
  "interpolate",
  ["exponential", 1.35],
  ["zoom"],
  5,
  3,
  8,
  4.25,
  9,
  4.75,
  11,
  5.75,
  14,
  7.5,
  17,
  9.5,
  18,
  10.5,
];

const OBSTACLE_CIRCLE_STROKE_WIDTH_BY_ZOOM = [
  "interpolate",
  ["linear"],
  ["zoom"],
  5,
  1,
  9,
  1.15,
  11,
  1.35,
  18,
  2,
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
      id: OBSTACLES_LINES_LAYER_ID,
      type: "line",
      source: OBSTACLES_SOURCE_ID,
      filter: ["==", ["geometry-type"], "LineString"],
      paint: {
        "line-color": "#e11d48",
        "line-width": OBSTACLE_LINE_WIDTH_BY_ZOOM,
        "line-opacity": 0.92,
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

function obstaclesToFeatureCollection(obstacles) {
  if (!obstacles?.length) return EMPTY_FEATURE_COLLECTION;

  const features = [];
  for (let index = 0; index < obstacles.length; index += 1) {
    const obstacle = obstacles[index];

    if (obstacle.geometryType === "line") {
      const coordinates = (obstacle.coordinates || []).filter(
        (vertex) =>
          Array.isArray(vertex) &&
          isValidLngLat(Number(vertex[0]), Number(vertex[1])),
      );

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
  const resizeTimerRef = useRef(null);

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
      obstaclesRef.current = obstaclesList;
      const map = mapRef.current;
      whenMapReady(map, () => {
        syncObstaclesToMap(map);
      });
    },
    clearObstacleMarkers() {
      obstaclesRef.current = [];
      const map = mapRef.current;
      whenMapReady(map, () => {
        setObstacleSourceData(map, EMPTY_FEATURE_COLLECTION);
      });
    },
    fitMapToObstacles(obstaclesList) {
      if (!obstaclesList?.length) return;
      const geojson = obstaclesToFeatureCollection(obstaclesList);
      if (!geojson.features.length) return;

      const map = mapRef.current;
      const runFit = () => {
        if (!map?.isStyleLoaded()) return;
        const bounds = new maplibregl.LngLatBounds();
        for (let index = 0; index < geojson.features.length; index += 1) {
          extendBoundsWithCoordinates(
            bounds,
            geojson.features[index].geometry.coordinates,
          );
        }
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 650 });
        }
        refreshMapTiles(map);
      };

      whenMapReady(map, runFit);
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
