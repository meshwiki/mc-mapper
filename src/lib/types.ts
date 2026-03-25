import type { Connection } from "@liamcottle/meshcore.js";

export interface WebBleConnection extends Connection {
    init: () => Promise<void>;
}

export enum ResponseCodes {
    Ok = 0, // todo
    Err = 1, // todo
    ContactsStart = 2,
    Contact = 3,
    EndOfContacts = 4,
    SelfInfo = 5,
    Sent = 6,
    ContactMsgRecv = 7,
    ChannelMsgRecv = 8,
    CurrTime = 9,
    NoMoreMessages = 10,
    ExportContact = 11,
    BatteryVoltage = 12,
    DeviceInfo = 13,
    PrivateKey = 14,
    Disabled = 15,
    ChannelInfo = 18,
    SignStart = 19,
    Signature = 20,

    // push codes
    Advert = 0x80, // when companion is set to auto add contacts
    PathUpdated = 0x81,
    SendConfirmed = 0x82,
    MsgWaiting = 0x83,
    RawData = 0x84,
    LoginSuccess = 0x85,
    LoginFail = 0x86, // not usable yet
    StatusResponse = 0x87,
    LogRxData = 0x88,
    TraceData = 0x89,
    NewAdvert = 0x8a, // when companion is set to manually add contacts
    TelemetryResponse = 0x8b,
    BinaryResponse = 0x8c,
}

export enum RouteType {
    ROUTE_TYPE_TRANSPORT_FLOOD = 0x00,
    ROUTE_TYPE_FLOOD = 0x01,
    ROUTE_TYPE_DIRECT = 0x02,
    ROUTE_TYPE_TRANSPORT_DIRECT = 0x03,
}

export enum PayloadType {
    PAYLOAD_TYPE_REQ = 0x00,
    PAYLOAD_TYPE_RESPONSE = 0x01,
    PAYLOAD_TYPE_TXT_MSG = 0x02,
    PAYLOAD_TYPE_ACK = 0x03,
    PAYLOAD_TYPE_ADVERT = 0x04,
    PAYLOAD_TYPE_GRP_TXT = 0x05,
    PAYLOAD_TYPE_GRP_DATA = 0x06,
    PAYLOAD_TYPE_ANON_REQ = 0x07,
    PAYLOAD_TYPE_PATH = 0x08,
    PAYLOAD_TYPE_TRACE = 0x09,
    PAYLOAD_TYPE_MULTIPART = 0x0a,
    PAYLOAD_TYPE_CONTROL = 0x0b,
    // reserved=0x0C
    // reserved=0x0D
    // reserved=0x0E
    PAYLOAD_TYPE_RAW_CUSTOM = 0x0f,
}

export enum PayloadVersion {
    v1 = 0x00, // 1-byte src/dest hashes, 2-byte MAC
    v2 = 0x01, // Future version (e.g., 2-byte hashes, 4-byte MAC)
    v3 = 0x02, // Future version
    v4 = 0x03, // Future version
}

export interface LogRxData {
    lastSnr: number;
    lastRssi: number;
    raw: Uint8Array;
}

export interface LogRxDetails {
    rssi: number;

    snr: number;
    noiseFloor: number;
    routeType: string;
    payloadType: string;
    payloadVersion: string;
    transportCodes: Uint8Array[];
    hopCount: number;
    hashMode: number;
    path: string;
    lastRepeater: string;
    payload: string;
    hex: string;
}

export interface RxLog extends LogRxDetails {
    location?: {
        latitude?: number;
        longitude?: number;
        altitude?: number | null;
        accuracy?: number;
        altitudeAccuracy?: number | null;
        heading?: number | null;
        speed?: number | null;
    };
    stamp: string;
}
