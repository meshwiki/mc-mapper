import { Connect } from "@/components/Connect";
// import { getData } from "./actions";

export default async function Home() {
    // let data = await getData();
    // console.log("Data from CrateDB:", data);
    return (
        <div className="col flex">
            <Connect />
        </div>
    );
}
