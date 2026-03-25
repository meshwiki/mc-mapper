import { getData } from "./actions";
import { MainView } from "@/components/MainView";

export default async function Home() {
    let data = await getData();

    return <MainView data={data} />;
}
