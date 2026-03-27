"use server";
import "server-only";
import { cacheLife } from "next/cache";

import { RssiDatum, RxLog, SelfInfo } from "@/lib/types";
import { connect } from "@/lib/crate";

export async function getData(): Promise<RssiDatum[]> {
    // noStore();
    "use cache";
    cacheLife("minutes");
    const crateClient = connect();

    const res = await crateClient.execute(
        `SELECT id, rssi, snr, stamp, "lastRepeater", location['latitude'] as lat, location['longitude'] as lng  FROM doc.rxlog`
    );
    console.log("Fetched data from CrateDB:", res.json.length, "records");
    return res.json as RssiDatum[];
}

export async function pushData(data: RxLog, info: SelfInfo | null) {
    const crateClient = connect();
    // console.log("Inserting data into CrateDB:", data);
    await crateClient.insert("doc.rxlog", {
        ...data,
        info,
    });
}
