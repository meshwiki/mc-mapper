"use server";
import { RxLog } from "@/lib/types";
import crate from "node-crate";

// using node-crate
function connect() {
    const host = process.env.DB_HOST;
    const port = 4200; //parseInt(process.env.DB_PORT || "", 10);
    const user = process.env.DB_USER;
    const pass = process.env.DB_PASS || "";
    const url = `https://${user}:${encodeURIComponent(pass)}@${host}:${port}`;
    crate.connect(url);
    return crate;
}

// using pg
// async function connect() {
//     const client = new Client({
//         host: process.env.DB_HOST,
//         port: parseInt(process.env.DB_PORT || "", 10),
//         user: process.env.DB_USER,
//         password: process.env.DB_PASS,
//         ssl: true,
//     });
//     await client.connect();
//     return client;
// }

export async function getData() {
    const crateClient = connect();

    const res = await crateClient.execute("SELECT * FROM doc.rxlog");
    return res;
}

export async function pushData(data: RxLog) {
    const crateClient = connect();
    // console.log("Inserting data into CrateDB:", data);
    await crateClient.insert("doc.rxlog", data);
}
