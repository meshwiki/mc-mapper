"use client";

import React from "react";
import classNames from "classnames";
import { MdBluetoothConnected, MdQueryStats } from "react-icons/md";

import { useMc } from "@/lib/mc";
import { RxLog } from "@/lib/types";
import { StatsTable } from "./StatsTable";
import { pushData } from "@/app/actions";
import { useRxStats } from "@/hooks/useRxStats";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useWakeLock } from "@/hooks/useWakeLock";

import styles from "./Connect.module.css";

interface ConnectProps {
    onData?: (data: RxLog) => void;
}
export function Connect({ onData }: ConnectProps) {
    const [log, setLog] = React.useState<string[]>([]);
    const { connect, connected, last, info, disconnect, stats, sessionId } =
        useMc();
    const location = useGeoLocation({ enabled: connected });
    useWakeLock({ enabled: connected });
    const [showStats, setShowStats] = React.useState(false);

    const rxstats = useRxStats(last);

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
                sessionId,
                ...last,
                noiseFloor: stats?.data.noiseFloor || last.noiseFloor,
                location: loc,
                stamp: new Date().toISOString(),
            };
            pushData(data, info);
            onData?.(data);

            appendLog(`Received LogRxData: ${JSON.stringify(data, null, 2)}`);
        }
    }, [last]);

    React.useEffect(() => {
        if (info) {
            appendLog(`Received SelfInfo: ${JSON.stringify(info, null, 2)}`);
        }
    }, [info]);

    return (
        <div
            className={classNames(styles.ConnectOverlay, {
                [styles.withStats]: showStats,
            })}
        >
            <div className={styles.Controls}>
                {!connected && (
                    <button onClick={connect}>
                        <MdBluetoothConnected size={20} />
                        Connect
                    </button>
                )}
                {!!connected && (
                    <button onClick={disconnect}>Disconnect</button>
                )}
                <div className="flex"></div>
                <button onClick={() => setShowStats(!showStats)}>
                    <MdQueryStats size={20} />
                </button>
            </div>
            {showStats && (
                <div className={styles.Stats}>
                    <StatsTable
                        title="Messages by Hops"
                        stats={rxstats.byHops}
                        bin="hops"
                        columns={["total"]}
                    />
                    <StatsTable
                        title="Messages by Type"
                        stats={rxstats.byType}
                        bin="hops"
                        columns={["total"]}
                    />
                    <StatsTable
                        title="Messages by Last Repeater"
                        stats={rxstats.byRepeater}
                        bin="rp"
                        columns={["total", "withScope", "avgRssi", "avgSnr"]}
                    />

                    <div>
                        {log.map((entry, index) => (
                            <pre key={index} style={{ whiteSpace: "pre-wrap" }}>
                                {entry}
                            </pre>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
