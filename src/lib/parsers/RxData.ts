import { BufferReader } from "../BufferReader";
import {
    LogRxData,
    LogRxDetails,
    RouteType,
    PayloadType,
    PayloadVersion,
} from "../types";

export function toHex(buffer: Uint8Array) {
    return Array.from(buffer)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(" ");
}

export function fromHex(hex: string) {
    return new Uint8Array(hex.split(" ").map((byte) => parseInt(byte, 16)));
}

export function parseRxData(data: LogRxData): LogRxDetails {
    const nf = data.lastRssi - 4 * data.lastSnr;

    const reader = new BufferReader(data.raw);

    const header = reader.readByte();
    // get header bits
    // route type
    const rt = header & 0b00000011;
    // payload type
    const pt = (header & 0b00111100) >> 2;
    // payload version
    const pv = (header & 0b11000000) >> 6;

    // transport codes (optional)
    const transportCodes = [];
    if (
        rt === RouteType.ROUTE_TYPE_TRANSPORT_DIRECT ||
        rt === RouteType.ROUTE_TYPE_TRANSPORT_FLOOD
    ) {
        const tc1 = reader.readBytes(2);
        transportCodes.push(tc1);
        const tc2 = reader.readBytes(2);
        transportCodes.push(tc2);
    }

    // path length
    const pathLen = reader.readByte();
    const hopCount = pathLen & 0b00111111;
    const hashMode = (pathLen & 0b11000000) >> 6;

    // path
    const path = reader.readBytes(hopCount * (hashMode + 1));
    // last repeater
    const lastRepeater = path.slice(-1 * (hashMode + 1));

    // payload
    const payload = reader.readRemainingBytes();

    return {
        rssi: data.lastRssi,
        snr: data.lastSnr,
        noiseFloor: nf,
        routeType: RouteType[rt],
        payloadType: PayloadType[pt],
        payloadVersion: PayloadVersion[pv],
        transportCodes,
        hopCount,
        hashMode,
        path: toHex(path),
        lastRepeater: toHex(lastRepeater),
        payload: toHex(payload),
        hex: toHex(data.raw),
    };
}
