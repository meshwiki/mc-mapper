import { Suspense } from "react";
import { Advert as AdvertClass } from "@liamcottle/meshcore.js";

import { connect } from "@/lib/crate";
import { fromHex, toHex } from "@/lib/parsers/RxData";
import { Advert, RxLog } from "@/lib/types";
import { RepeaterTable } from "./table";
import { cacheLife } from "next/cache";

function parseRepeater(log: RxLog) {
    let payload = fromHex(log.payload);
    // console.log("payload", payload);
    try {
        let advert = (AdvertClass as any).fromBytes(payload);
        return advert;
    } catch (e) {
        console.error("Failed to parse advert from payload", e);
        return null;
    }
}

async function getData() {
    // noStore();
    "use cache";
    cacheLife("minutes");
    const crateClient = connect();

    const res = await crateClient.execute(
        `SELECT *  FROM doc.rxlog where "payloadType" = 'PAYLOAD_TYPE_ADVERT' order by stamp`
    );

    const byKey = new Map<string, Advert>();
    res.json.forEach((log: any) => {
        let advert = parseRepeater(log);
        if (advert) {
            byKey.set(toHex(advert.publicKey), {
                ...advert,
                timestamp: new Date(log.stamp).getTime(),
            });
        }
    });

    // console.log(res.json);

    return Array.from(byKey.values());
}

export default async function () {
    let repeaters = await getData();
    // console.log("repeaters", repeaters);
    return (
        <div className="datapage">
            <h1>Repeaters</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <RepeaterTable repeaters={repeaters} />
            </Suspense>
        </div>
    );
}
