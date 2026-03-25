"use client";

import { Connect } from "@/components/Connect";
import RSSIMap from "@/components/Map";
import useInner from "@rkmodules/use-inner";

interface MainViewProps {
    data: any[];
}
export function MainView({ data }: MainViewProps) {
    let [inner, setInner] = useInner(data);

    function handleDirectData(rxData: any) {
        setInner((prev) => [
            ...prev,
            {
                rssi: rxData.rssi,
                snr: rxData.snr,
                stamp: rxData.stamp,
                lastRepeater: rxData.lastRepeater,
                lat: rxData.location?.latitude,
                lng: rxData.location?.longitude,
            },
        ]);
    }
    return (
        <div className="col flex">
            <Connect onData={handleDirectData} />
            <RSSIMap data={inner} />
        </div>
    );
}
