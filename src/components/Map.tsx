"use client";
import React from "react";
import Map, { MapRef, NavigationControl } from "react-map-gl/maplibre";
import maplibregl, { MapLibreEvent, SkySpecification } from "maplibre-gl";
import { MdLocationSearching, MdMyLocation } from "react-icons/md";

import { useGeoLocation } from "@/hooks/useGeoLocation";
import { PositionMarker } from "./Layers/PositionMarker";

import "maplibre-gl/dist/maplibre-gl.css";
import styles from "./Map.module.css";
import { RssiDatum } from "@/lib/types";
import { RssiData } from "./Layers/RssiData";

const skyStyle: SkySpecification = {
    // "sky-color": "#199EF3",
    "sky-color": "#88C6FC",
    "sky-horizon-blend": 0.5,
    "horizon-color": "#ffffff",
    "horizon-fog-blend": 0.5,
    "fog-color": "#0000ff",
    "fog-ground-blend": 0.5,
    "atmosphere-blend": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        1,
        10,
        1,
        12,
        0,
    ],
};

type MapProps = {
    data: RssiDatum[];
    connected: boolean;
};
export default function RSSIMap({ data, connected }: MapProps) {
    const mapRef = React.useRef<MapRef | null>(null);
    const location = useGeoLocation({ enableHighAccuracy: connected });
    const [snapped, setSnapped] = React.useState(true);

    const handleMapLoad = React.useCallback((e: MapLibreEvent) => {
        const map = e.target;

        // break snap when user interacts with the map
        map.on("drag", () => {
            setSnapped(false);
        });
    }, []);

    React.useEffect(() => {
        // fly to current location when it changes, but only if we're snapped to it
        if (location && mapRef.current && snapped) {
            mapRef.current.flyTo({
                center: [location.coords.longitude, location.coords.latitude],
                duration: 1000,
            });
        }
    }, [location, snapped]);

    return (
        <div className={styles.MapContainer}>
            <Map
                ref={mapRef}
                mapLib={maplibregl}
                initialViewState={{
                    longitude: location?.coords.longitude ?? 5.12,
                    latitude: location?.coords.latitude ?? 52.09,
                    zoom: 13,
                    pitch: 75,
                    bearing: 0,
                }}
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                }}
                maxPitch={85}
                sky={skyStyle}
                mapStyle="https://api.maptiler.com/maps/dataviz-v4/style.json?key=LKEbKWkHg8HwYhK8Gsco"
                onLoad={handleMapLoad}
            >
                <NavigationControl position="top-right" />
                {location && <PositionMarker location={location} />}
                <RssiData data={data} />
                <button
                    className={styles.SnapButton}
                    onClick={() => setSnapped((s) => !s)}
                >
                    {snapped ? <MdMyLocation /> : <MdLocationSearching />}
                </button>
            </Map>
        </div>
    );
}
