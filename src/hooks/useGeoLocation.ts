import React from "react";

interface UseGeoLOcationOptions {
    enableHighAccuracy?: boolean;
    enabled?: boolean;
}

export function useGeoLocation(options: UseGeoLOcationOptions = {}) {
    const [location, setLocation] = React.useState<GeolocationPosition | null>(
        null,
    );

    React.useEffect(() => {
        if (navigator.geolocation && options.enabled !== false) {
            const id = navigator.geolocation.watchPosition(
                (position) => {
                    setLocation(position);
                },
                null,
                { enableHighAccuracy: options.enableHighAccuracy ?? true },
            );
            return () => navigator.geolocation.clearWatch(id);
        }
    }, [options.enabled, options.enableHighAccuracy]);

    return location;
}
