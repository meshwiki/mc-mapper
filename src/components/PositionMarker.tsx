import React from "react";
import * as turf from "@turf/turf";
import { MapInstance, useMap } from "react-map-gl/maplibre";

function updateLocationLayer(
    map: MapInstance,
    lng: number,
    lat: number,
    accuracyMeters: number
) {
    const pointSourceId = "current-location-point";
    const accuracySourceId = "current-location-accuracy";
    const accuracyFillLayerId = "current-location-accuracy-fill";
    const accuracyOutlineLayerId = "current-location-accuracy-outline";
    const pointLayerId = "current-location-dot";

    const pointData: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "Point",
                    coordinates: [lng, lat],
                },
            },
        ],
    };

    const accuracyCircle = turf.circle([lng, lat], accuracyMeters / 1000, {
        steps: 64,
        units: "kilometers",
    }) as GeoJSON.Feature<GeoJSON.Polygon>;

    const accuracyData: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
        type: "FeatureCollection",
        features: [accuracyCircle],
    };

    // Point source
    const existingPointSource = map.getSource(pointSourceId) as
        | maplibregl.GeoJSONSource
        | undefined;

    if (existingPointSource) {
        existingPointSource.setData(pointData);
    } else {
        map.addSource(pointSourceId, {
            type: "geojson",
            data: pointData,
        });

        map.addLayer({
            id: pointLayerId,
            type: "circle",
            source: pointSourceId,
            paint: {
                "circle-radius": 5, // 10px diameter
                "circle-color": "#007bff",
                "circle-opacity": 1,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#ffffff",
            },
        });
    }

    // Accuracy source
    const existingAccuracySource = map.getSource(accuracySourceId) as
        | maplibregl.GeoJSONSource
        | undefined;

    if (existingAccuracySource) {
        existingAccuracySource.setData(accuracyData);
    } else {
        map.addSource(accuracySourceId, {
            type: "geojson",
            data: accuracyData,
        });

        map.addLayer({
            id: accuracyFillLayerId,
            type: "fill",
            source: accuracySourceId,
            paint: {
                "fill-color": "#007bff",
                "fill-opacity": 0.18,
            },
        });

        map.addLayer({
            id: accuracyOutlineLayerId,
            type: "line",
            source: accuracySourceId,
            paint: {
                "line-color": "#007bff",
                "line-opacity": 0.45,
                "line-width": 1.5,
            },
        });
    }
}

interface PositionMarkerProps {
    location: GeolocationPosition;
}
export function PositionMarker({ location }: PositionMarkerProps) {
    const { current } = useMap();

    React.useEffect(() => {
        let map = current?.getMap();
        if (!map || !location) return;
        if (!map.isStyleLoaded()) return;

        updateLocationLayer(
            map,
            location.coords.longitude,
            location.coords.latitude,
            location.coords.accuracy ?? 0
        );
    }, [location, current?.getMap()]);

    return null;
}
