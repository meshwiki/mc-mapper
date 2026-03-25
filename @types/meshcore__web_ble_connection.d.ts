declare module "@liamcottle/meshcore.js/src/connection/web_ble_connection.js" {
    export interface WebBleConnection {
        open: () => Promise<WebBleConnection>;
        on: (event: string, callback: (...args: any[]) => void) => void;
        close: () => void;
    }

    const connection: {
        open: () => Promise<WebBleConnection>;
    };

    export default connection;
}
