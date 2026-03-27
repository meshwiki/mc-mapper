import React from "react";

interface UseWakeLockOptions {
    enabled?: boolean;
}
export function useWakeLock(options: UseWakeLockOptions = {}) {
    const [wakeLock, setWakeLock] = React.useState<WakeLockSentinel | null>(
        null,
    );

    React.useEffect(() => {
        async function requestWakeLock() {
            try {
                const sentinel = await navigator.wakeLock.request("screen");
                setWakeLock(sentinel);
                sentinel.addEventListener("release", () => {
                    console.log("Wake Lock was released");
                    setWakeLock(null);
                });
                console.log("Wake Lock is active");
            } catch (err) {
                // console.error(`${err.name}, ${err.message}`);
            }
        }

        if (options.enabled) {
            requestWakeLock();
        }

        return () => {
            if (wakeLock) {
                wakeLock.release();
            }
        };
    }, [options.enabled]);

    return wakeLock;
}
