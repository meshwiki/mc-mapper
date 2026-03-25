import React from "react";
import {
    LogRxData,
    LogRxDetails,
    ResponseCodes,
    WebBleConnection,
} from "./types";
import { parseRxData } from "./parsers/RxData";

async function createConnection() {
    // IMPORTANT: do NOT import "@liamcottle/meshcore.js" (root). It drags in node transports.
    // Import the BLE-only module instead.
    const mod = await import(
        "@liamcottle/meshcore.js/src/connection/web_ble_connection.js"
    );

    const WebBleConnection = (
        mod as unknown as { default: { open: () => WebBleConnection } }
    ).default;

    const connection = await WebBleConnection.open();
    return connection;
}

export function useMc() {
    const [last, setLast] = React.useState<LogRxDetails | null>(null);
    const [connected, setConnected] = React.useState(false);
    const [conn, setConn] = React.useState<WebBleConnection | null>(null);

    const connect = React.useCallback(async () => {
        try {
            const connection = await createConnection();
            connection.on("connected", () => {
                setConnected(true);
            });

            // connection.on("rx", (message: Uint8Array) => {
            //     console.log("Received message:", message);
            //     const responseCode = message[0];
            //     const responseText = ResponseCodes[responseCode] || "Unknown";

            //     appendLog(
            //         `Received message: ${responseText} ${toHex(message)}`
            //     );
            // });

            connection.on(ResponseCodes.LogRxData, async (data: LogRxData) => {
                console.log("LogRxData", data);

                const parsed = parseRxData(data);
                setLast(parsed);
            });

            // connection.on(ResponseCodes.RawData, (message: unknown) => {
            //     console.log("RawData", message);
            //     appendLog("RawData");
            // });
            connection.on("disconnected", () => {
                setConnected(false);
            });

            setConn(connection);

            // console.log(connection, "initing connection");
            // await connection.init();
        } catch (err) {
            console.error("Error creating BLE connection", err);
            setConnected(false);
        }
    }, []);

    const disconnect = React.useCallback(() => {
        if (conn) {
            conn.close();
            setConn(null);
            setConnected(false);
        }
    }, [conn]);

    return {
        last,
        connected,
        connect,
        disconnect,
    };
}
