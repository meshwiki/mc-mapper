"use client";

import React from "react";
import { useMc } from "@/lib/mc";
import { RxLog } from "@/lib/types";
import { StatsTable } from "./StatsTable";
import { pushData } from "@/app/actions";
import { useRxStats } from "@/hooks/useRxStats";
import { useGeoLocation } from "@/hooks/useGeoLocation";

interface ConnectProps {}
export function Connect({}: ConnectProps) {
    const [log, setLog] = React.useState<string[]>([]);
    const location = useGeoLocation();

    const { connect, connected, last, disconnect } = useMc();
    const stats = useRxStats(last);

    function appendLog(message: string) {
        setLog((prevLog) => [message, ...prevLog].slice(0, 100)); // Keep only the last 100 log entries
    }

    React.useEffect(() => {
        if (connected) {
            appendLog("Connected to meshcore device");
        } else {
            appendLog("Disconnected from meshcore device");
        }
    }, [connected]);

    React.useEffect(() => {
        if (last) {
            const loc = { ...location?.coords.toJSON() };
            console.log("location", loc);
            const data: RxLog = {
                ...last,
                location: loc,
                stamp: new Date().toISOString(),
            };
            pushData(data);

            appendLog(`Received LogRxData: ${JSON.stringify(data, null, 2)}`);
        }
    }, [last]);

    return (
        <div>
            {!connected && (
                <button
                    onClick={connect}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Connect to Meshcore Device
                </button>
            )}
            {!!connected && (
                <button
                    onClick={disconnect}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                >
                    Disconnect
                </button>
            )}
            <StatsTable
                title="Messages by Hops"
                stats={stats.byHops}
                bin="hops"
                columns={["total"]}
            />
            <StatsTable
                title="Messages by Type"
                stats={stats.byType}
                bin="hops"
                columns={["total"]}
            />
            <StatsTable
                title="Messages by Last Repeater"
                stats={stats.byRepeater}
                bin="rp"
                columns={["total", "withScope", "avgRssi", "avgSnr"]}
            />

            <div>
                {log.map((entry, index) => (
                    <pre
                        key={index}
                        className="text-sm text-gray-700"
                        style={{ whiteSpace: "pre-wrap" }}
                    >
                        {entry}
                    </pre>
                ))}
            </div>
        </div>
    );
}
