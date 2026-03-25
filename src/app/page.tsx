import { Connect } from "@/components/Connect";
import RSSIMap from "@/components/Map";
import { getData } from "./actions";

export default async function Home() {
    let data = await getData();
    return (
        <div className="col flex">
            <Connect />
            <RSSIMap data={data} />
        </div>
    );
}
