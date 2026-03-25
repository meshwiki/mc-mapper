import React from "react";

export function useGeoLocation() {
    const [location, setLocation] = React.useState<GeolocationPosition | null>(
        null
    );

    React.useEffect(() => {
        if (navigator.geolocation) {
            const id = navigator.geolocation.watchPosition(
                (position) => {
                    setLocation(position);
                },
                null,
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(id);
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }, []);

    return location;
}
