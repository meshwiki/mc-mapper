import React from "react";
import { histogram } from "@/lib/stats";
import { LogRxDetails } from "@/lib/types";

export interface Stats {
    total: number;
    withScope: number;
    avgRssi: number;
    avgSnr: number;
}

export function useRxStats(last: LogRxDetails | null) {
    const [data, setData] = React.useState<LogRxDetails[]>([]);
    const [byHops, setByHops] = React.useState<
        Record<number, { total: number }>
    >({});
    const [byRepeater, setByRepeater] = React.useState<Record<string, Stats>>(
        {}
    );
    const [byType, setByType] = React.useState<
        Record<string, { total: number }>
    >({});

    React.useEffect(() => {
        if (last) {
            setData((prevData) => [last, ...prevData]);

            setByHops(
                histogram(last.hopCount, {
                    total: (prev = 0) => prev + 1,
                })
            );

            setByRepeater(
                histogram<string, Stats>(last.lastRepeater.toString() || "-", {
                    total: (prev = 0) => prev + 1,
                    withScope: (prev = 0) =>
                        prev + (last.transportCodes.length ? 1 : 0),
                    avgRssi: (prev = 0, stats) =>
                        (prev * (stats.total ?? 0) + last.rssi) /
                        ((stats.total ?? 0) + 1),
                    avgSnr: (prev = 0, stats) =>
                        (prev * (stats.total ?? 0) + last.snr) /
                        ((stats.total ?? 0) + 1),
                })
            );

            setByType(
                histogram(last.payloadType, {
                    total: (prev = 0) => prev + 1,
                })
            );
        }
    }, [last]);

    return {
        data,
        byHops,
        byRepeater,
        byType,
    };
}
