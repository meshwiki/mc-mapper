"use client";
import { toHex } from "@/lib/parsers/RxData";
import { Advert } from "@/lib/types";
import TimeAgo from "react-timeago";

interface RepeaterTableProps {
    repeaters: Advert[];
}
export function RepeaterTable({ repeaters }: RepeaterTableProps) {
    return (
        <div className="table">
            <table>
                <thead>
                    <tr>
                        <th>Public Key</th>
                        <th>Name</th>
                        {/* <th>Lat</th> */}
                        {/* <th>Lon</th> */}
                        <th>Device type</th>
                        <th>Last seen</th>
                    </tr>
                </thead>
                <tbody>
                    {repeaters.map((rp) => {
                        return (
                            <tr key={toHex(rp.publicKey)}>
                                <td>
                                    <code>
                                        {toHex(rp.publicKey).slice(0, 8)}
                                    </code>
                                </td>
                                <td>{rp.parsed.name}</td>
                                {/* <td>{rp.parsed.lat}</td> */}
                                {/* <td>{rp.parsed.lon}</td> */}
                                <td>{rp.parsed.type}</td>
                                <td>
                                    <TimeAgo date={rp.timestamp} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
