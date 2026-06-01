import maplibregl from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-csp-worker.js?url";

maplibregl.setWorkerUrl(maplibreWorkerUrl);

export default maplibregl;
